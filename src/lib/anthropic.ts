/**
 * Article generation + keyword research with Claude.
 *
 * generateArticle returns a full article payload including JSON-LD schema,
 * categories, tags, FAQ, and cost in USD.
 * suggestKeywords returns long-tail keyword candidates with intent tags.
 */
import Anthropic from "@anthropic-ai/sdk";

const ARTICLE_MODEL = "claude-sonnet-4-6";
const ARTICLE_INPUT_PER_M = 3.0;
const ARTICLE_OUTPUT_PER_M = 15.0;

const KEYWORD_MODEL = "claude-haiku-4-5-20251001";
const KEYWORD_INPUT_PER_M = 1.0;
const KEYWORD_OUTPUT_PER_M = 5.0;

const SYSTEM_PROMPT = `You are a senior SEO content writer who actually ranks pages on Google.
You write articles that win because they answer search intent better than the existing top
results, not because they stuff keywords.

Hard rules for every article:
- Match search intent. Informational queries get explainers; commercial queries get
  comparisons with concrete recommendations and decision criteria.
- Open with a direct, specific answer in the first 2 sentences. No throat-clearing
  ("In today's fast-paced world..."). No restating the question.
- Use H2/H3 structure with descriptive subheads a reader can scan.
- Include at least one concrete example, number, comparison, or specific detail per H2.
- Add an FAQ section with 4-6 real questions the searcher likely also has.
- Write in plain, direct sentences. Active voice. Vary sentence length.
- Never invent statistics, prices, quotes, studies, dates, or product features.
- 1200-1800 words target unless the topic genuinely warrants more.
- If an "expert voice" is provided, write from that perspective.

You will OUTPUT a single JSON object, no prose around it, with this exact shape:

{
  "title": "...",                          // <= 65 chars, includes primary keyword
  "slug": "kebab-case-slug",
  "meta_description": "...",               // 140-160 chars
  "html": "<p>...</p><h2>...</h2>...",     // valid HTML body, no <html>/<body>
                                            // include an <h2>FAQ</h2> with each Q as <h3>
  "category": "primary-category",          // single phrase, kebab-case
  "tags": ["tag-one", "tag-two"],          // 3-6 tags, kebab-case
  "faq": [{"q": "...", "a": "..."}]
}

Do not output Markdown, do not wrap the JSON in code fences, do not include any commentary.`;

const KEYWORD_SYSTEM = `You are an SEO keyword researcher. You generate long-tail keyword
candidates that a NEW domain (low authority, no backlinks) can realistically rank for
within 3-6 months.

Hard rules:
- Always 4+ words. Pure short-tail like "polymarket" is rejected.
- Concrete and specific — geographic modifiers ("in canada"), year ("in 2026"), problem
  framings ("how to fix", "why is", "is X legal"), comparison framings ("X vs Y"), and
  buying-stage framings ("best X for Y") all qualify.
- Honest commercial vs informational tagging.
- No invented brands, products, or stats.

Output a single JSON object, no prose, no fences:
{
  "keywords": [
    {"keyword": "...", "intent": "informational"},
    {"keyword": "...", "intent": "commercial"}
  ]
}`;

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY env var is required.");
  return new Anthropic({ apiKey: key });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return t;
}

function cost(input: number, output: number, inPerM: number, outPerM: number): number {
  return (input / 1_000_000) * inPerM + (output / 1_000_000) * outPerM;
}

function articleJsonLd(title: string, meta: string, siteName: string): string {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: meta,
    publisher: { "@type": "Organization", name: siteName },
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function faqJsonLd(faq: { q: string; a: string }[]): string {
  if (!faq?.length) return "";
  const items = faq
    .filter((f) => f.q && f.a)
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));
  if (!items.length) return "";
  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items,
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

export type GeneratedArticle = {
  title: string;
  slug: string;
  meta_description: string;
  html: string;
  category: string;
  tags: string[];
  faq: { q: string; a: string }[];
  word_count: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
};

export type SiteContext = {
  name: string;
  niche?: string | null;
  audience?: string | null;
  expertVoice?: string | null;
  authorBioHtml?: string | null;
};

export async function generateArticle(
  keyword: string,
  intent: string,
  site: SiteContext,
  serpContext?: string | null,
): Promise<GeneratedArticle> {
  const parts: string[] = [`Keyword: ${keyword}`, `Search intent: ${intent}`];
  if (site.niche) parts.push(`Site niche: ${site.niche}`);
  if (site.audience) parts.push(`Target audience: ${site.audience}`);
  if (site.expertVoice) parts.push(`Expert voice / perspective:\n${site.expertVoice}`);
  if (serpContext) parts.push(`\n${serpContext}`);
  parts.push("\nWrite the article. Return only the JSON object.");

  const resp = await getClient().messages.create({
    model: ARTICLE_MODEL,
    max_tokens: 8000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: parts.join("\n") }],
  });

  const block = resp.content[0];
  if (block.type !== "text") throw new Error("Unexpected non-text response from Claude.");
  const data = JSON.parse(stripJsonFence(block.text)) as Partial<GeneratedArticle>;

  if (!data.title) throw new Error("Article missing title.");
  if (!data.html) throw new Error("Article missing html.");

  const slug = data.slug && data.slug.length ? data.slug : slugify(data.title);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const faq = Array.isArray(data.faq) ? data.faq : [];

  const schema =
    articleJsonLd(data.title, data.meta_description ?? "", site.name) +
    faqJsonLd(faq);
  const bio = site.authorBioHtml?.trim();
  let html = data.html;
  if (bio) html += `\n<hr/>\n<div class="author-bio">${bio}</div>`;
  html += `\n${schema}`;

  const plain = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ");
  const wordCount = plain.split(/\s+/).filter(Boolean).length;

  const usage = resp.usage;
  const inTok = usage?.input_tokens ?? 0;
  const outTok = usage?.output_tokens ?? 0;

  return {
    title: data.title,
    slug,
    meta_description: data.meta_description ?? "",
    html,
    category: data.category ?? "",
    tags,
    faq,
    word_count: wordCount,
    input_tokens: inTok,
    output_tokens: outTok,
    cost_usd: cost(inTok, outTok, ARTICLE_INPUT_PER_M, ARTICLE_OUTPUT_PER_M),
  };
}

export type Suggestion = { keyword: string; intent: string };

export async function suggestKeywords(
  seed: string,
  site: SiteContext,
  count = 30,
): Promise<{ keywords: Suggestion[]; cost_usd: number; input_tokens: number; output_tokens: number }> {
  const parts: string[] = [
    `Seed term or topic: ${seed}`,
    `Generate ${count} long-tail keyword candidates.`,
  ];
  if (site.niche) parts.push(`Site niche: ${site.niche}`);
  if (site.audience) parts.push(`Target audience: ${site.audience}`);
  parts.push("Return only the JSON object.");

  const resp = await getClient().messages.create({
    model: KEYWORD_MODEL,
    max_tokens: 2500,
    system: KEYWORD_SYSTEM,
    messages: [{ role: "user", content: parts.join("\n") }],
  });

  const block = resp.content[0];
  if (block.type !== "text") throw new Error("Unexpected non-text response from Claude.");
  const data = JSON.parse(stripJsonFence(block.text)) as { keywords?: Suggestion[] };

  const items = (data.keywords ?? [])
    .map((k) => ({
      keyword: (k.keyword ?? "").trim(),
      intent: (k.intent ?? "informational").toLowerCase(),
    }))
    .filter((k) => k.keyword.length > 0 && k.keyword.split(/\s+/).length >= 3);

  const usage = resp.usage;
  const inTok = usage?.input_tokens ?? 0;
  const outTok = usage?.output_tokens ?? 0;

  return {
    keywords: items,
    input_tokens: inTok,
    output_tokens: outTok,
    cost_usd: cost(inTok, outTok, KEYWORD_INPUT_PER_M, KEYWORD_OUTPUT_PER_M),
  };
}
