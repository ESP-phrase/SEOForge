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
import { fetchHeroImage, heroImageHtml } from "@/lib/unsplash";
import { canGenerateArticle, incrementArticleUsage } from "@/lib/quota";

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
    // Subscription-level monthly cap (Stripe plan credits).
    const quota = await canGenerateArticle();
    if (!quota.ok) {
      return { ok: false, site: site.slug, skipped: quota.reason ?? "out of credits" };
    }
  }

  const kw = await prisma.keyword.findFirst({
    where: { siteId, status: "queued" },
    orderBy: { id: "asc" },
  });
  if (!kw) return { ok: false, site: site.slug, skipped: "queue empty" };

  const tag = `[${site.slug}/${kw.keyword.slice(0, 40)}]`;
  console.log(`${tag} ▶ run started (dry=${dryRun})`);

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
  console.log(`${tag} ⋯ fetching SERP gap analysis (SerpApi)…`);
  try {
    serp = await fetchSerp(kw.keyword);
    if (serp) {
      console.log(
        `${tag} ✓ SERP fetched · ${serp.topResults.length} results · cached=${serp.cached}`,
      );
    } else {
      console.log(`${tag} ⚠ SERP skipped (no SERPAPI_KEY)`);
    }
  } catch (e) {
    console.warn(`${tag} ⚠ SerpApi failed, generating without competitive context:`, e);
  }
  const serpContext = serpToPromptContext(serp);

  // Hero image — best-effort. Skips silently if UNSPLASH_ACCESS_KEY is unset.
  let heroHtml = "";
  console.log(`${tag} ⋯ fetching hero image (Unsplash)…`);
  try {
    const img = await fetchHeroImage(kw.keyword);
    heroHtml = heroImageHtml(img);
    if (img) {
      console.log(`${tag} ✓ hero image by ${img.photographer}`);
    } else {
      console.log(`${tag} ⚠ hero image skipped (no UNSPLASH_ACCESS_KEY or no match)`);
    }
  } catch (e) {
    console.warn(`${tag} ⚠ Unsplash failed, generating without hero image:`, e);
  }

  console.log(`${tag} ⋯ calling Anthropic (Claude Sonnet) to generate article…`);

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
        ctaHtml: site.ctaHtml,
        heroImageHtml: heroHtml,
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
    console.error(`${tag} ✗ generation failed:`, e);
    return { ok: false, site: site.slug, keyword: kw.keyword, error: `generation: ${e}` };
  }

  console.log(
    `${tag} ✓ article generated · ${article.word_count} words · $${article.cost_usd.toFixed(4)} · title="${article.title}"`,
  );

  console.log(`${tag} ⋯ inserting internal links…`);
  article.html = await addInternalLinks(article.html, siteId);

  const minWc = site.minWordCount || 1000;
  let qualityWarning: string | undefined;
  if (article.word_count < minWc) {
    qualityWarning = `word_count ${article.word_count} < min ${minWc}`;
  }
  if (!article.faq?.length) {
    qualityWarning = (qualityWarning ? `${qualityWarning}; ` : "") + "no FAQ section";
  }
  if (qualityWarning) {
    console.warn(`${tag} ⚠ quality gate: ${qualityWarning}`);
  } else {
    console.log(`${tag} ✓ quality gate passed`);
  }

  // Always save the article to the DB so the user can review it on the
  // /articles/[id] page. Dry-run stops here; non-dry continues to WP publish.
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

  if (dryRun) {
    console.log(`${tag} ✓ dry-run complete — saved as draft, no WP publish (article id ${saved.id})`);
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "dry_run" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "ok-dry",
        message: `dry-run · ${article.word_count} words`,
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
      qualityWarning,
      dryRun: true,
    };
  }

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

  // Native target: skip WordPress entirely. Mark the article published and
  // surface it at /blog/[slug] on this app. Saves the same cost as WP publish.
  if (site.targetType === "native") {
    const nativeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://seoforge.org"}/blog/${article.slug}`;
    const goLive = site.publishStatus === "publish";
    await prisma.article.update({
      where: { id: saved.id },
      data: {
        wpUrl: nativeUrl,
        status: goLive ? "published" : "draft",
        publishedAt: goLive ? new Date() : null,
      },
    });
    await prisma.keyword.update({
      where: { id: kw.id },
      data: { status: goLive ? "published" : "needs_review" },
    });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: goLive ? "published" : "needs-review",
        message: `${nativeUrl}${goLive ? "" : " (native draft)"}`,
        articleId: saved.id,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    if (goLive) await incrementArticleUsage();
    console.log(`${tag} ✓ native publish → ${nativeUrl}`);
    return {
      ok: true,
      site: site.slug,
      keyword: kw.keyword,
      title: article.title,
      articleId: saved.id,
      wpUrl: nativeUrl,
      wpStatus: goLive ? "publish" : "draft",
      wordCount: article.word_count,
      costUsd: article.cost_usd,
      status: goLive ? "published" : "needs-review",
    };
  }

  console.log(`${tag} ⋯ publishing to WordPress as "${site.publishStatus}"…`);

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
        // Only mark as published locally if WP confirms it went live. If WP
        // accepted it but kept it as a draft (site publishStatus=draft), our
        // article is still a draft awaiting human review in wp-admin.
        status: wp.status === "publish" ? "published" : "draft",
        publishedAt: wp.status === "publish" ? new Date() : null,
      },
    });
    const liveSuffix = wp.status === "publish" ? "" : " (WP draft — needs publish in wp-admin)";
    await prisma.keyword.update({
      where: { id: kw.id },
      data: { status: wp.status === "publish" ? "published" : "needs_review" },
    });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: wp.status === "publish" ? "published" : "needs-review",
        message: `${wp.url}${liveSuffix}`,
        articleId: saved.id,
        costUsd: article.cost_usd,
        completedAt: new Date(),
      },
    });
    if (wp.status === "publish") {
      await incrementArticleUsage();
    }
    console.log(`${tag} ✓ pushed to WP → ${wp.url} (wp status: ${wp.status})`);
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
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`${tag} ✗ WordPress publish failed: ${msg}`);
    await prisma.keyword.update({ where: { id: kw.id }, data: { status: "publish_failed" } });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "failed",
        message: `publish: ${msg}`,
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
      error: `publish: ${msg}`,
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
