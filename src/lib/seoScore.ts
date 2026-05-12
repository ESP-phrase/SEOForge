/**
 * Article-level SEO scorecard. Computes a checklist of on-page signals from
 * the data we already have in the DB — no external API needed.
 *
 * Each check is binary (pass/fail) with a short reason. Score is the % of
 * checks that pass, weighted by importance.
 */
export type SeoCheck = {
  id: string;
  label: string;
  pass: boolean;
  weight: number; // 1 = minor, 3 = critical
  hint: string;
};

export type ArticleScorecard = {
  score: number; // 0-100
  letterGrade: "A" | "B" | "C" | "D" | "F";
  checks: SeoCheck[];
  passed: number;
  total: number;
  daysLive: number | null;
};

export function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export type ArticleInput = {
  status: string;
  html: string;
  metaDescription: string;
  wordCount: number;
  serpJson: string | null;
  publishedAt: Date | null;
  categoriesJson: string;
  tagsJson: string;
};

export function scoreArticle(
  a: ArticleInput,
  ctx: { minWordCount: number; siteHasMultipleArticles: boolean },
): ArticleScorecard {
  const checks: SeoCheck[] = [];
  const html = a.html ?? "";

  // Published?
  checks.push({
    id: "published",
    label: "Live on WordPress",
    pass: a.status === "published" && !!a.publishedAt,
    weight: 3,
    hint: "Not visible to Google until you publish to WP.",
  });

  // Word count
  checks.push({
    id: "wordcount",
    label: `Word count ≥ ${ctx.minWordCount}`,
    pass: a.wordCount >= ctx.minWordCount,
    weight: 2,
    hint: `Currently ${a.wordCount}. Add more depth or examples.`,
  });

  // Meta description
  const metaLen = (a.metaDescription ?? "").length;
  checks.push({
    id: "meta",
    label: "Meta description 120–165 chars",
    pass: metaLen >= 120 && metaLen <= 165,
    weight: 2,
    hint: `Currently ${metaLen} chars. Trim or extend to fit the Google snippet box.`,
  });

  // FAQ section present
  const hasFaq = /<h2[^>]*>\s*FAQ/i.test(html) || /<h3[^>]*>.*\?/i.test(html);
  checks.push({
    id: "faq",
    label: "FAQ section (rich result eligibility)",
    pass: hasFaq,
    weight: 2,
    hint: "Adding 4-6 Q/A pairs unlocks FAQ rich snippet in Google.",
  });

  // FAQPage schema
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"/i.test(html);
  checks.push({
    id: "faq-schema",
    label: "FAQPage JSON-LD schema",
    pass: hasFaqSchema,
    weight: 2,
    hint: "Without schema, the FAQ won't show as rich snippet.",
  });

  // Article schema
  const hasArticleSchema = /"@type"\s*:\s*"Article"/i.test(html);
  checks.push({
    id: "article-schema",
    label: "Article JSON-LD schema",
    pass: hasArticleSchema,
    weight: 1,
    hint: "Helps Google understand the page is an article.",
  });

  // Headings structure
  const h2Count = (html.match(/<h2[^>]*>/gi) ?? []).length;
  checks.push({
    id: "headings",
    label: "Headings (≥ 3 H2 sections)",
    pass: h2Count >= 3,
    weight: 2,
    hint: `Currently ${h2Count} H2 sections. Break the article into scannable parts.`,
  });

  // Hero image
  const hasHero = /class="hero-image"|class="hero-banner"/i.test(html);
  checks.push({
    id: "hero",
    label: "Hero image / banner",
    pass: hasHero,
    weight: 1,
    hint: "Boosts CTR. Add UNSPLASH_ACCESS_KEY to .env for auto images.",
  });

  // Internal link present
  const internalLinks = (html.match(/<a [^>]*href="https?:\/\/[^"]+"/gi) ?? []).filter(
    (l) => /resumegenius|blog\./i.test(l),
  ).length;
  checks.push({
    id: "internal-link",
    label: "At least 1 internal link",
    pass: internalLinks >= 1 || !ctx.siteHasMultipleArticles,
    weight: 2,
    hint: ctx.siteHasMultipleArticles
      ? "Link to a related article on the same site."
      : "OK — only article on this site so far.",
  });

  // CTA present
  const hasCta = /class="cta"|cta-box/i.test(html);
  checks.push({
    id: "cta",
    label: "Conversion CTA in body",
    pass: hasCta,
    weight: 1,
    hint: "Drive readers to your product / newsletter.",
  });

  // SERP analysis was used at generation time
  checks.push({
    id: "serp",
    label: "Article informed by SERP gap analysis",
    pass: !!a.serpJson,
    weight: 1,
    hint: "Newer articles use SerpApi to beat the actual ranking results.",
  });

  // Categories + tags
  const hasCategory =
    (JSON.parse(a.categoriesJson || "[]") as string[]).length > 0;
  const hasTags = (JSON.parse(a.tagsJson || "[]") as string[]).length > 0;
  checks.push({
    id: "category",
    label: "Category + tags assigned",
    pass: hasCategory && hasTags,
    weight: 1,
    hint: "Helps WordPress build topic clusters and internal navigation.",
  });

  // Days live
  const daysLive = a.publishedAt
    ? Math.floor((Date.now() - a.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Score
  const passed = checks.filter((c) => c.pass).length;
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const passedWeight = checks
    .filter((c) => c.pass)
    .reduce((s, c) => s + c.weight, 0);
  const score = Math.round((passedWeight / totalWeight) * 100);

  return {
    score,
    letterGrade: gradeFromScore(score),
    checks,
    passed,
    total: checks.length,
    daysLive,
  };
}
