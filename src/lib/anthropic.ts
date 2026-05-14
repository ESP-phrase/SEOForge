/**
 * Article generation + keyword research with Claude.
 *
 * generateArticle returns a full article payload including JSON-LD schema,
 * categories, tags, FAQ, and cost in USD.
 * suggestKeywords returns long-tail keyword candidates with intent tags.
 */
import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "@/lib/envFallback";

const ARTICLE_MODEL = "claude-sonnet-4-6";
const ARTICLE_INPUT_PER_M = 3.0;
const ARTICLE_OUTPUT_PER_M = 15.0;

const KEYWORD_MODEL = "claude-haiku-4-5-20251001";
const KEYWORD_INPUT_PER_M = 1.0;
const KEYWORD_OUTPUT_PER_M = 5.0;

const SYSTEM_PROMPT = `You are a senior SEO content writer who actually ranks pages on Google.
You write articles that win because they answer search intent better than the existing top
results, not because they stuff keywords. Your articles READ well AND LOOK great visually —
they use rich formatting to break up walls of text.

## Hard content rules

- Match search intent. Informational queries get explainers; commercial queries get
  comparisons with concrete recommendations and decision criteria.
- Open with a direct, specific answer in the first 2 sentences. No throat-clearing
  ("In today's fast-paced world..."). No restating the question.
- Use H2/H3 structure with descriptive subheads a reader can scan.
- Include at least one concrete example, number, comparison, or specific detail per H2.
- Add an FAQ section with 4-6 real questions the searcher likely also has.
- Write in plain, direct sentences. Active voice. Vary sentence length.
- Never invent statistics, prices, quotes, studies, dates, or product features.
- 1400-2200 words target unless the topic genuinely warrants more.
- If an "expert voice" is provided, write from that perspective.

## Visual formatting rules (USE THESE — they're styled by the page CSS)

EVERY article MUST include at least:
- ONE \`<div class="tldr">\` block right after the opening paragraph
- TWO callout blocks (mix of tip / takeaway / warning where appropriate)
- ONE \`<blockquote class="pull-quote">\` highlighting a key insight
- AT LEAST one of: comparison table OR stat row OR step list

Use these exact patterns (the CSS expects these class names):

1. TL;DR block (mandatory, near top):
   <div class="tldr">
     <div class="tldr-title">TL;DR</div>
     <ul>
       <li>3-5 short bullets summarising the key takeaways</li>
     </ul>
   </div>

2. Callouts — pick the right tone:
   <aside class="callout callout-tip"><strong>Tip:</strong> ...</aside>
   <aside class="callout callout-warning"><strong>Watch out:</strong> ...</aside>
   <aside class="callout callout-takeaway"><strong>Key takeaway:</strong> ...</aside>

3. Pull quote (for an opinionated or counter-intuitive line):
   <blockquote class="pull-quote">"..."</blockquote>

4. Comparison table (when something is better than something else):
   <table class="comparison">
     <thead><tr><th>Approach</th><th>When to use</th><th>Drawback</th></tr></thead>
     <tbody>
       <tr><td>...</td><td>...</td><td>...</td></tr>
     </tbody>
   </table>

5. Stat row (for impact / scale):
   <div class="stat-row">
     <div class="stat-box"><div class="stat-number">42%</div><div class="stat-label">latency reduction</div></div>
     <div class="stat-box"><div class="stat-number">12</div><div class="stat-label">engineers unblocked</div></div>
   </div>

6. Numbered step block (for how-to sequences):
   <div class="steps">
     <div class="step"><div class="step-n">1</div><div class="step-body"><strong>Step name.</strong> Description.</div></div>
     <div class="step"><div class="step-n">2</div><div class="step-body"><strong>Step name.</strong> Description.</div></div>
   </div>

7. Use \`<mark>\` LIBERALLY to highlight key phrases inline (8-15 times per article — yellow highlighter effect).

8. Use \`<code>\` for technical terms, tool names, JSON keys, etc.

9. Inline key-stat (use 2-4 times within sentences for important numbers):
   <p>The CAR formula turns vague responsibility statements into <span class="key-stat">2-3x callback rates</span> when applied consistently.</p>

10. Add a SECOND pull-quote near the middle of the article (besides the first one) — they create visual rhythm.

## Output

Call the publish_article tool with the result. Do not output prose, do not wrap in code fences.`;

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
  const key = getEnv("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY env var is required.");
  return new Anthropic({ apiKey: key });
}

/**
 * Inline CSS prepended to every generated article. WordPress preserves <style>
 * in post content, so this works regardless of the active theme. Light-mode
 * palette so it blends with most blog themes; falls back gracefully if the
 * theme strips inline styles.
 */
const ARTICLE_STYLES = `<style>
/* === Theme variables — per-site colors override these via inline <style> === */
.sf-article{
  --sf-accent:#0ea5e9;
  --sf-accent-dark:#0284c7;
  --sf-accent-darker:#0369a1;
  --sf-accent-2:#f59e0b;
  --sf-accent-2-dark:#b45309;
  --sf-accent-2-darkest:#451a03;
  --sf-accent-2-tint:#fffbeb;
  --sf-accent-2-tint-2:#fef3c7;
  --sf-accent-2-border:#fcd34d;
  --sf-accent-3:#22c55e;
  --sf-accent-3-dark:#15803d;
  --sf-accent-3-darkest:#14532d;
  --sf-accent-3-tint:#f0fdf4;
  --sf-accent-4:#a855f7;
  --sf-warning:#ef4444;
  --sf-warning-dark:#b91c1c;
  --sf-warning-darkest:#7f1d1d;
  --sf-warning-tint:#fef2f2;
  --sf-info:#3b82f6;
  --sf-info-dark:#1d4ed8;
  --sf-info-darkest:#1e3a8a;
  --sf-info-tint:#eff6ff;
  --sf-ink:#0f172a;
  --sf-text:#1f2937;
  --sf-muted:#64748b;
  --sf-muted-2:#94a3b8;
  --sf-border:#e2e8f0;
  --sf-surface:#f8fafc;
  --sf-surface-2:#f1f5f9;
}

/* === SEOForge article container === */
.sf-article{font-size:1.1rem;line-height:1.75;color:var(--sf-text);max-width:780px;margin:0 auto;font-family:-apple-system,system-ui,"Segoe UI",Inter,sans-serif}
.sf-article > p:first-of-type::first-letter{font-size:3.4rem;font-weight:800;float:left;line-height:0.95;padding:0.5rem 0.75rem 0 0;color:var(--sf-accent);font-family:Georgia,serif}
.sf-article p{margin:1rem 0}
.sf-article p:first-of-type{font-size:1.2rem;color:#111;line-height:1.6}
.sf-article strong{font-weight:700;color:var(--sf-ink)}
.sf-article a{color:var(--sf-accent-dark);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1.5px;font-weight:500}
.sf-article a:hover{color:var(--sf-accent-darker)}
.sf-article ul,.sf-article ol{margin:1rem 0 1rem 1.6rem;padding:0}
.sf-article li{margin:0.4rem 0;padding-left:0.25rem}
.sf-article ul li::marker{color:var(--sf-accent)}
.sf-article ol li::marker{color:var(--sf-accent);font-weight:700}
.sf-article mark{background:linear-gradient(180deg,transparent 55%,#fde047 55%);color:var(--sf-ink);padding:0 0.2em;font-weight:600}
.sf-article code{background:var(--sf-surface-2);color:#be185d;padding:0.15em 0.45em;border-radius:5px;font-size:0.92em;font-family:ui-monospace,Consolas,monospace;border:1px solid var(--sf-border)}
.sf-article hr{border:0;height:32px;margin:3rem 0;background-image:radial-gradient(circle,var(--sf-accent) 1.5px,transparent 1.5px),radial-gradient(circle,var(--sf-accent-2) 1.5px,transparent 1.5px),radial-gradient(circle,var(--sf-accent-3) 1.5px,transparent 1.5px);background-size:8px 8px,8px 8px,8px 8px;background-position:0 50%,16px 50%,32px 50%;background-repeat:no-repeat;background-position:center}

/* === H2/H3 — color-rotated per section for visual variety === */
.sf-article h2{font-size:1.95rem;font-weight:800;margin:3.25rem 0 1rem;color:var(--sf-ink);letter-spacing:-0.02em;line-height:1.2;position:relative;padding:0 0 0.65rem 0;border-bottom:3px solid var(--sf-accent)}
.sf-article h2::before{content:"";display:inline-block;width:0.7em;height:0.7em;margin-right:0.55em;background:linear-gradient(135deg,var(--sf-accent),var(--sf-accent-dark));border-radius:4px;vertical-align:middle;transform:rotate(45deg);box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent) 35%,transparent)}
.sf-article h2:nth-of-type(4n+2){border-bottom-color:var(--sf-accent-2)}
.sf-article h2:nth-of-type(4n+2)::before{background:linear-gradient(135deg,var(--sf-accent-2),var(--sf-accent-2-dark));box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-2) 35%,transparent)}
.sf-article h2:nth-of-type(4n+3){border-bottom-color:var(--sf-accent-3)}
.sf-article h2:nth-of-type(4n+3)::before{background:linear-gradient(135deg,var(--sf-accent-3),var(--sf-accent-3-dark));box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-3) 35%,transparent)}
.sf-article h2:nth-of-type(4n+4){border-bottom-color:var(--sf-accent-4)}
.sf-article h2:nth-of-type(4n+4)::before{background:linear-gradient(135deg,var(--sf-accent-4),#7e22ce);box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-4) 35%,transparent)}
.sf-article h3{font-size:1.32rem;font-weight:700;margin:2rem 0 0.7rem;color:var(--sf-ink);letter-spacing:-0.01em;padding-left:0.85rem;border-left:3px solid var(--sf-accent)}
.sf-article h2 + h3,.sf-article h2 + p + h3{margin-top:1.25rem}

/* Soft band behind every other section — subtle separation */
.sf-article h2:nth-of-type(2n+1){background:linear-gradient(180deg,transparent 0%,transparent 70%,color-mix(in srgb,var(--sf-accent) 4%,transparent) 100%)}

/* === Hero image (when Unsplash present) === */
.sf-article figure.hero-image{margin:0 0 2.25rem;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)}
.sf-article figure.hero-image img{border-radius:0;display:block;width:100%;height:auto}
.sf-article figure.hero-image figcaption{font-size:0.75rem;color:var(--sf-muted-2);margin:0.5rem 0.25rem 0;text-align:right}

/* === CSS-only hero banner (when no image) === */
.sf-article .hero-banner{margin:0 0 2.25rem;padding:2.5rem 2rem;border-radius:16px;background:linear-gradient(135deg,var(--sf-accent) 0%,var(--sf-accent-4) 100%);color:#fff;text-align:center;position:relative;overflow:hidden}
.sf-article .hero-banner::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(255,255,255,0.25),transparent 60%);pointer-events:none}
.sf-article .hero-banner::after{content:"";position:absolute;bottom:-30px;left:-30px;width:140px;height:140px;background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent-2) 60%,transparent),transparent 70%);pointer-events:none}
.sf-article .hero-banner .eyebrow{position:relative;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;opacity:0.85;margin-bottom:0.4rem}
.sf-article .hero-banner .lead{position:relative;font-size:1.15rem;line-height:1.4;font-weight:500;max-width:38rem;margin:0 auto}

/* === TL;DR (mandatory) === */
.sf-article .tldr{background:linear-gradient(135deg,var(--sf-accent-2-tint) 0%,var(--sf-accent-2-tint-2) 100%);border:1px solid var(--sf-accent-2-border);border-radius:14px;padding:1.5rem 1.75rem;margin:2rem 0;box-shadow:0 1px 3px rgba(0,0,0,0.05);position:relative}
.sf-article .tldr::before{content:"⚡";position:absolute;top:-14px;left:1.5rem;background:var(--sf-accent-2);color:#fff;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:1.1rem;box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent-2) 40%,transparent)}
.sf-article .tldr-title{font-weight:800;text-transform:uppercase;font-size:0.78rem;letter-spacing:0.1em;color:var(--sf-accent-2-dark);margin:0.25rem 0 0.65rem;padding-left:2.5rem}
.sf-article .tldr ul{margin:0;padding-left:1.25rem;list-style:none}
.sf-article .tldr li{margin:0.45rem 0;padding-left:1.5rem;position:relative;color:var(--sf-accent-2-darkest)}
.sf-article .tldr li::before{content:"→";position:absolute;left:0;color:var(--sf-accent-2);font-weight:700}

/* === Callouts === */
.sf-article .callout{position:relative;padding:1.1rem 1.4rem 1.1rem 3.25rem;border-radius:12px;margin:1.75rem 0;font-size:1rem;line-height:1.6;border-left:4px solid;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
.sf-article .callout::before{position:absolute;left:1rem;top:1rem;width:1.4rem;height:1.4rem;border-radius:50%;display:grid;place-items:center;font-size:0.9rem;font-weight:800;color:#fff}
.sf-article .callout strong{display:inline-block;margin-right:0.35rem}
.sf-article .callout-tip{background:var(--sf-info-tint);border-color:var(--sf-info);color:var(--sf-info-darkest)}
.sf-article .callout-tip::before{content:"i";background:var(--sf-info)}
.sf-article .callout-tip strong{color:var(--sf-info-dark)}
.sf-article .callout-warning{background:var(--sf-warning-tint);border-color:var(--sf-warning);color:var(--sf-warning-darkest)}
.sf-article .callout-warning::before{content:"!";background:var(--sf-warning)}
.sf-article .callout-warning strong{color:var(--sf-warning-dark)}
.sf-article .callout-takeaway{background:var(--sf-accent-3-tint);border-color:var(--sf-accent-3);color:var(--sf-accent-3-darkest)}
.sf-article .callout-takeaway::before{content:"★";background:var(--sf-accent-3);font-size:0.75rem}
.sf-article .callout-takeaway strong{color:var(--sf-accent-3-dark)}

/* === Pull quote === */
.sf-article .pull-quote{font-size:1.65rem;font-style:italic;line-height:1.45;border:0;padding:1.75rem 2rem 1.75rem 4rem;margin:2.5rem 0;color:var(--sf-ink);background:linear-gradient(180deg,var(--sf-surface),#fff);border-radius:16px;position:relative;font-family:Georgia,"Times New Roman",serif;font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,0.04);border-left:4px solid var(--sf-accent-4)}
.sf-article .pull-quote::before{content:"\\201C";position:absolute;top:0.5rem;left:1rem;font-size:5rem;color:var(--sf-accent-4);font-family:Georgia,serif;line-height:1;opacity:0.5}

/* === Comparison table === */
.sf-article table.comparison{width:100%;border-collapse:collapse;margin:2rem 0;font-size:0.97rem;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--sf-border),0 4px 12px rgba(0,0,0,0.04)}
.sf-article table.comparison th{background:linear-gradient(135deg,var(--sf-ink),#1e293b);color:#fff;text-align:left;padding:1rem 1.15rem;font-weight:700;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:3px solid var(--sf-accent)}
.sf-article table.comparison td{padding:1rem 1.15rem;border-bottom:1px solid var(--sf-border);vertical-align:top;color:#1e293b}
.sf-article table.comparison tr:last-child td{border-bottom:0}
.sf-article table.comparison tr:nth-child(even) td{background:var(--sf-surface)}
.sf-article table.comparison tr:hover td{background:var(--sf-accent-2-tint-2)}
.sf-article table.comparison td:first-child{font-weight:600;color:var(--sf-ink);border-left:3px solid transparent}
.sf-article table.comparison tr:hover td:first-child{border-left-color:var(--sf-accent)}

/* === Stat row — each box gets a different accent === */
.sf-article .stat-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin:2rem 0}
.sf-article .stat-box{padding:1.5rem 1.25rem;background:linear-gradient(180deg,#fff,var(--sf-surface));border:1px solid var(--sf-border);border-radius:14px;text-align:center;border-top:4px solid var(--sf-accent);box-shadow:0 2px 6px rgba(0,0,0,0.04);position:relative;overflow:hidden}
.sf-article .stat-box::after{content:"";position:absolute;top:-30px;right:-30px;width:80px;height:80px;background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent) 18%,transparent),transparent 70%);pointer-events:none}
.sf-article .stat-box:nth-child(2){border-top-color:var(--sf-accent-2)}
.sf-article .stat-box:nth-child(2)::after{background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent-2) 18%,transparent),transparent 70%)}
.sf-article .stat-box:nth-child(3){border-top-color:var(--sf-accent-3)}
.sf-article .stat-box:nth-child(3)::after{background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent-3) 18%,transparent),transparent 70%)}
.sf-article .stat-box:nth-child(4){border-top-color:var(--sf-accent-4)}
.sf-article .stat-box:nth-child(4)::after{background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent-4) 18%,transparent),transparent 70%)}
.sf-article .stat-number{font-size:2.5rem;font-weight:800;color:var(--sf-ink);line-height:1;letter-spacing:-0.03em;font-family:-apple-system,system-ui,sans-serif;position:relative}
.sf-article .stat-label{font-size:0.78rem;color:var(--sf-muted);margin-top:0.55rem;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;position:relative}

/* === Numbered steps === */
.sf-article .steps{display:flex;flex-direction:column;gap:0.9rem;margin:2rem 0}
.sf-article .step{display:flex;gap:1.25rem;padding:1.25rem 1.5rem;background:linear-gradient(135deg,#fff,#fafafa);border:1px solid var(--sf-border);border-radius:14px;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.04);transition:box-shadow 0.15s}
.sf-article .step:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.sf-article .step-n{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--sf-accent),var(--sf-accent-dark));color:#fff;display:grid;place-items:center;font-weight:800;font-size:1.05rem;box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent) 35%,transparent)}
.sf-article .step:nth-child(4n+2) .step-n{background:linear-gradient(135deg,var(--sf-accent-2),var(--sf-accent-2-dark));box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent-2) 35%,transparent)}
.sf-article .step:nth-child(4n+3) .step-n{background:linear-gradient(135deg,var(--sf-accent-3),var(--sf-accent-3-dark));box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent-3) 35%,transparent)}
.sf-article .step:nth-child(4n+4) .step-n{background:linear-gradient(135deg,var(--sf-accent-4),#7e22ce);box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent-4) 35%,transparent)}
.sf-article .step-body{flex:1;line-height:1.6}
.sf-article .step-body strong{display:block;margin-bottom:0.3rem;font-size:1.05rem;color:var(--sf-ink)}

/* === Inline key-stat (used inline within paragraphs) === */
.sf-article .key-stat{display:inline-block;background:linear-gradient(135deg,var(--sf-accent-2-tint-2),#fde68a);padding:0.15em 0.6em;border-radius:6px;font-weight:700;color:#78350f;border:1px solid var(--sf-accent-2-border)}

/* === CTA box (auto-injected at the bottom) === */
.sf-article aside.cta{padding:0;margin:2.5rem 0}

/* === Author bio === */
.sf-article .author-bio{margin-top:2rem;padding:1.5rem;background:var(--sf-surface);border-radius:14px;border-left:4px solid var(--sf-accent);color:#475569;font-size:0.97rem}
.sf-article .author-bio a{color:var(--sf-accent-dark)}
.sf-article .author-bio strong{color:var(--sf-ink)}

/* === FAQ section gets nice formatting === */
.sf-article h2:has(+ p) + p,.sf-article h3 + p{margin-top:0.4rem}

/* === Responsive === */
@media (max-width:600px){
  .sf-article{font-size:1rem;line-height:1.65}
  .sf-article h2{font-size:1.45rem;padding-left:0.75rem}
  .sf-article p:first-of-type{font-size:1.05rem}
  .sf-article > p:first-of-type::first-letter{font-size:2.6rem;padding:0.4rem 0.5rem 0 0}
  .sf-article .pull-quote{font-size:1.2rem;padding:1.25rem 1.25rem 1.25rem 3rem}
  .sf-article .pull-quote::before{font-size:3.5rem;top:0.25rem;left:0.5rem}
  .sf-article .stat-number{font-size:1.85rem}
  .sf-article .hero-banner{padding:1.75rem 1.25rem}
  .sf-article .hero-banner .lead{font-size:1.05rem}
  .sf-article .tldr{padding:1.25rem 1.25rem}
  .sf-article .tldr-title{padding-left:0;margin-top:0.5rem}
  .sf-article .tldr::before{position:static;display:inline-grid;margin-right:0.4rem;width:24px;height:24px;font-size:0.85rem}
  .sf-article .callout{padding:0.9rem 1rem 0.9rem 2.75rem}
}
</style>`;

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

/**
 * Build rich Article + Author + Breadcrumb JSON-LD. Google uses these for
 * the article rich result and the author byline that appears in search.
 * Extracting authorName from authorBioHtml is heuristic — looks for the
 * first <strong>Name</strong> pattern, falls back to "{siteName} Team".
 */
function extractAuthorName(authorBioHtml: string | null | undefined, siteName: string): string {
  if (!authorBioHtml) return `${siteName} Team`;
  const m = authorBioHtml.match(/<strong[^>]*>(?:Written by\s+)?([^<]+)<\/strong>/i);
  if (m) return m[1].replace(/Written by\s+/i, "").trim();
  return `${siteName} Team`;
}

function extractAuthorUrl(authorBioHtml: string | null | undefined): string | null {
  if (!authorBioHtml) return null;
  const m = authorBioHtml.match(/<a[^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function articleJsonLd(opts: {
  title: string;
  meta: string;
  siteName: string;
  authorBioHtml?: string | null;
  url?: string | null;
  publishedAt?: Date;
}): string {
  const authorName = extractAuthorName(opts.authorBioHtml, opts.siteName);
  const authorUrl = extractAuthorUrl(opts.authorBioHtml);
  const now = (opts.publishedAt ?? new Date()).toISOString();
  const author: Record<string, unknown> = { "@type": "Person", name: authorName };
  if (authorUrl) author.url = authorUrl;
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.meta,
    author,
    publisher: { "@type": "Organization", name: opts.siteName },
    datePublished: now,
    dateModified: now,
  };
  if (opts.url) {
    payload.mainEntityOfPage = { "@type": "WebPage", "@id": opts.url };
    payload.url = opts.url;
  }
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
  ctaHtml?: string | null;
  heroImageHtml?: string | null;
  themeAccent?: string | null;
  themeAccent2?: string | null;
  themeAccent3?: string | null;
  themeAccent4?: string | null;
};

/**
 * Build a per-site CSS variables override block. Returns "" if no theme set,
 * which leaves the defaults baked into ARTICLE_STYLES intact.
 */
function buildThemeOverride(site: SiteContext): string {
  const a1 = site.themeAccent ?? "";
  const a2 = site.themeAccent2 ?? "";
  const a3 = site.themeAccent3 ?? "";
  const a4 = site.themeAccent4 ?? "";
  if (!a1 && !a2 && !a3 && !a4) return "";
  const lines: string[] = [];
  if (a1) lines.push(`--sf-accent:${a1};--sf-accent-dark:${a1};--sf-accent-darker:${a1}`);
  if (a2) lines.push(`--sf-accent-2:${a2};--sf-accent-2-dark:${a2}`);
  if (a3) lines.push(`--sf-accent-3:${a3};--sf-accent-3-dark:${a3}`);
  if (a4) lines.push(`--sf-accent-4:${a4}`);
  return `<style>.sf-article{${lines.join(";")}}</style>`;
}

/**
 * Tool-use schema enforces valid JSON output. Eliminates the "Claude returned
 * malformed JSON because the article HTML had a stray quote at position 2090"
 * class of bug.
 */
const ARTICLE_TOOL = {
  name: "publish_article",
  description: "Publish the generated SEO article.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "<= 65 chars, includes primary keyword" },
      slug: { type: "string", description: "kebab-case slug from the title, no stop words" },
      meta_description: { type: "string", description: "140-160 chars, includes keyword" },
      html: {
        type: "string",
        description:
          "Article body, valid HTML, no <html>/<body>. Include H2/H3 sections, lists where useful, and an <h2>FAQ</h2> with each Q as an <h3>.",
      },
      category: { type: "string", description: "single phrase, kebab-case" },
      tags: { type: "array", items: { type: "string" }, description: "3-6 tags, kebab-case" },
      faq: {
        type: "array",
        items: {
          type: "object",
          properties: {
            q: { type: "string" },
            a: { type: "string" },
          },
          required: ["q", "a"],
        },
        description: "4-6 FAQ entries that match the FAQ section in html",
      },
    },
    required: ["title", "slug", "meta_description", "html", "category", "tags", "faq"],
  },
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
  parts.push("\nWrite the article and call the publish_article tool with the result.");

  const resp = await getClient().messages.create({
    model: ARTICLE_MODEL,
    max_tokens: 8000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    tools: [ARTICLE_TOOL],
    tool_choice: { type: "tool", name: "publish_article" },
    messages: [{ role: "user", content: parts.join("\n") }],
  });

  const toolUse = resp.content.find((b) => b.type === "tool_use");
  let data: Partial<GeneratedArticle>;
  if (toolUse && toolUse.type === "tool_use") {
    data = toolUse.input as Partial<GeneratedArticle>;
  } else {
    // Fallback: try old-style JSON parsing if for any reason no tool call came back.
    const txt = resp.content.find((b) => b.type === "text");
    if (!txt || txt.type !== "text") {
      throw new Error("Claude returned no usable response (no tool_use and no text).");
    }
    try {
      data = JSON.parse(stripJsonFence(txt.text)) as Partial<GeneratedArticle>;
    } catch (e) {
      throw new Error(
        `Claude did not invoke publish_article tool and fallback JSON parse failed: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }
  }
  return finalizeArticle(data, site, resp);
}

function finalizeArticle(
  data: Partial<GeneratedArticle>,
  site: SiteContext,
  resp: { usage?: { input_tokens?: number; output_tokens?: number } | null },
): GeneratedArticle {
  if (!data.title) throw new Error("Article missing title.");
  if (!data.html) throw new Error("Article missing html.");

  const slug = data.slug && data.slug.length ? data.slug : slugify(data.title);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const faq = Array.isArray(data.faq) ? data.faq : [];

  const schema =
    articleJsonLd({
      title: data.title,
      meta: data.meta_description ?? "",
      siteName: site.name,
      authorBioHtml: site.authorBioHtml,
    }) +
    faqJsonLd(faq);
  const bio = site.authorBioHtml?.trim();
  const cta = site.ctaHtml?.trim();
  const hero = site.heroImageHtml?.trim();

  // Wrap everything in .sf-article so the inline <style> rules apply, and
  // prepend the style block so WordPress renders the rich elements correctly
  // regardless of theme.
  let body = "";
  if (hero) {
    body += `${hero}\n`;
  } else {
    // CSS-only hero banner fallback — looks intentional, not "missing image"
    const meta = (data.meta_description ?? "").replace(/"/g, "&quot;");
    body += `<div class="hero-banner"><div class="eyebrow">${(site.niche || "Article").toUpperCase()}</div><div class="lead">${meta}</div></div>\n`;
  }
  body += data.html;
  if (cta) body += `\n<hr/>\n<aside class="cta">${cta}</aside>`;
  if (bio) body += `\n<hr/>\n<div class="author-bio">${bio}</div>`;

  const themeOverride = buildThemeOverride(site);
  const html = `${ARTICLE_STYLES}\n${themeOverride}\n<div class="sf-article">\n${body}\n</div>\n${schema}`;

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
