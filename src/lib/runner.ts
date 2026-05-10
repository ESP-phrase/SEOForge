/**
 * Per-site orchestration. One call generates one article (or fewer if the
 * queue is empty / cap is reached). Designed to fit inside a single Vercel
 * function invocation (~30-50s typical).
 */
import { prisma } from "@/lib/db";
import { generateArticle } from "@/lib/anthropic";
import { publish, type SiteCreds, type PublishStatus } from "@/lib/wordpress";
import { addInternalLinks } from "@/lib/linker";
import { fetchSerp, serpToPromptContext, type SerpAnalysis } from "@/lib/serp";

export type RunResult = {
  ok: boolean;
  site: string;
  keyword?: string;
  title?: string;
  articleId?: number;
  wpUrl?: string;
  wpStatus?: string;
  wordCount?: number;
  costUsd?: number;
  status?: string;
  qualityWarning?: string;
  skipped?: string;
  error?: string;
  dryRun?: boolean;
};

async function publishedToday(siteId: number): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.article.count({
    where: { siteId, status: "published", publishedAt: { gte: start } },
  });
}

export async function runOneForSite(
  siteId: number,
  options: { dryRun?: boolean } = {},
): Promise<RunResult> {
  const { dryRun = false } = options;

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, site: String(siteId), error: "site not found" };
  if (!site.active) return { ok: false, site: site.slug, skipped: "site inactive" };

  if (!dryRun) {
    const today = await publishedToday(siteId);
    if (today >= site.maxPerDay) {
      return {
        ok: false,
        site: site.slug,
        skipped: `cap reached (${today}/${site.maxPerDay})`,
      };
    }
  }

  const kw = await prisma.keyword.findFirst({
    where: { siteId, status: "queued" },
    orderBy: { id: "asc" },
  });
  if (!kw) return { ok: false, site: site.slug, skipped: "queue empty" };

  const run = await prisma.run.create({
    data: {
      siteId,
      keywordId: kw.id,
      action: "generate+publish",
      status: "running",
      message: kw.keyword,
    },
  });

  await prisma.keyword.update({ where: { id: kw.id }, data: { status: "processing" } });

  // SERP gap analysis — best-effort. If SerpApi fails or no key is set, fall
  // back to a regular (no-context) generation rather than failing the run.
  let serp: SerpAnalysis | null = null;
  try {
    serp = await fetchSerp(kw.keyword);
  } catch (e) {
    console.warn("[runner] SerpApi failed, generating without competitive context:", e);
  }
  const serpContext = serpToPromptContext(serp);

  let article;
  try {
    article = await generateArticle(
      kw.keyword,
      kw.intent,
      {
        name: site.name,
        niche: site.niche,
        audience: site.audience,
        expertVoice: site.expertVoice,
        authorBioHtml: site.authorBioHtml,
      },
      serpContext,
    );
  } catch (e) {
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "failed" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "failed",
        message: `generation: ${e instanceof Error ? e.message : String(e)}`,
        completedAt: new Date(),
      },
    });
    return { ok: false, site: site.slug, keyword: kw.keyword, error: `generation: ${e}` };
  }

  article.html = await addInternalLinks(article.html, siteId);

  const minWc = site.minWordCount || 1000;
  let qualityWarning: string | undefined;
  if (article.word_count < minWc) {
    qualityWarning = `word_count ${article.word_count} < min ${minWc}`;
  }
  if (!article.faq?.length) {
    qualityWarning = (qualityWarning ? `${qualityWarning}; ` : "") + "no FAQ section";
  }

  if (dryRun) {
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "dry_run" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "ok-dry",
        message: `dry-run · ${article.word_count} words`,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    return {
      ok: true,
      site: site.slug,
      keyword: kw.keyword,
      title: article.title,
      wordCount: article.word_count,
      costUsd: article.cost_usd,
      qualityWarning,
      dryRun: true,
    };
  }

  const saved = await prisma.article.create({
    data: {
      siteId,
      keywordId: kw.id,
      title: article.title,
      slug: article.slug,
      metaDescription: article.meta_description,
      html: article.html,
      wordCount: article.word_count,
      categoriesJson: JSON.stringify(article.category ? [article.category] : []),
      tagsJson: JSON.stringify(article.tags),
      inputTokens: article.input_tokens,
      outputTokens: article.output_tokens,
      costUsd: article.cost_usd,
      serpJson: serp ? JSON.stringify(serp) : null,
    },
  });

  if (qualityWarning) {
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "needs_review" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "needs-review",
        message: `quality gate: ${qualityWarning}`,
        articleId: saved.id,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    return {
      ok: true,
      site: site.slug,
      keyword: kw.keyword,
      title: article.title,
      articleId: saved.id,
      wordCount: article.word_count,
      costUsd: article.cost_usd,
      status: "needs_review",
      qualityWarning,
    };
  }

  const creds: SiteCreds = {
    wpUrl: site.wpUrl,
    wpUsername: site.wpUsername,
    wpAppPasswordEnc: site.wpAppPasswordEnc,
  };

  try {
    const wp = await publish(
      {
        title: article.title,
        slug: article.slug,
        html: article.html,
        meta_description: article.meta_description,
        category: article.category,
        tags: article.tags,
      },
      creds,
      site.publishStatus as PublishStatus,
    );
    await prisma.article.update({
      where: { id: saved.id },
      data: {
        wpPostId: wp.id,
        wpUrl: wp.url,
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "published" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "published",
        message: wp.url,
        articleId: saved.id,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    return {
      ok: true,
      site: site.slug,
      keyword: kw.keyword,
      title: article.title,
      articleId: saved.id,
      wpUrl: wp.url,
      wpStatus: wp.status,
      wordCount: article.word_count,
      costUsd: article.cost_usd,
    };
  } catch (e) {
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "publish_failed" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "failed",
        message: `publish: ${e instanceof Error ? e.message : String(e)}`,
        articleId: saved.id,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    return {
      ok: false,
      site: site.slug,
      keyword: kw.keyword,
      title: article.title,
      articleId: saved.id,
      error: `publish: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export async function publishExistingDraft(articleId: number): Promise<RunResult> {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return { ok: false, site: "?", error: "article not found" };
  if (article.status === "published") return { ok: false, site: "?", error: "already published" };
  const site = await prisma.site.findUnique({ where: { id: article.siteId } });
  if (!site) return { ok: false, site: "?", error: "site missing" };

  const cats = JSON.parse(article.categoriesJson) as string[];
  const tags = JSON.parse(article.tagsJson) as string[];

  const run = await prisma.run.create({
    data: {
      siteId: site.id,
      keywordId: article.keywordId,
      action: "manual-publish",
      status: "running",
      message: article.title,
    },
  });

  try {
    const wp = await publish(
      {
        title: article.title,
        slug: article.slug,
        html: article.html,
        meta_description: article.metaDescription,
        category: cats[0] ?? "",
        tags,
      },
      {
        wpUrl: site.wpUrl,
        wpUsername: site.wpUsername,
        wpAppPasswordEnc: site.wpAppPasswordEnc,
      },
      site.publishStatus as PublishStatus,
    );
    await prisma.article.update({
      where: { id: articleId },
      data: {
        wpPostId: wp.id,
        wpUrl: wp.url,
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.keyword.update({
      where: { id: article.keywordId },
      data: { status: "published" },
    });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "published",
        message: wp.url,
        articleId,
        completedAt: new Date(),
      },
    });
    return { ok: true, site: site.slug, articleId, wpUrl: wp.url, wpStatus: wp.status };
  } catch (e) {
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "failed",
        message: `publish: ${e instanceof Error ? e.message : String(e)}`,
        articleId,
        completedAt: new Date(),
      },
    });
    return {
      ok: false,
      site: site.slug,
      articleId,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
