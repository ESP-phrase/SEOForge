import Link from "next/link";
import { prisma } from "@/lib/db";

type Step = {
  badge: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  accent?: boolean;
};

/**
 * Server component that diagnoses where the user is in the funnel and renders
 * a single high-impact next action. Stack-ranked from earliest funnel stage.
 */
export async function NextStepCard() {
  const step = await pickStep();
  return (
    <div
      className={`rounded-2xl p-6 mb-5 ${
        step.accent
          ? "bg-card-grad border-2 border-accent shadow-glow"
          : "bg-card-grad border border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0">{step.badge}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.6rem] font-extrabold uppercase tracking-wider text-accent mb-1">
            Next best action
          </div>
          <h2 className="text-xl font-extrabold text-text mb-1">{step.title}</h2>
          <p className="text-muted text-sm leading-relaxed mb-4">{step.body}</p>
          <Link
            href={step.href}
            className="inline-block px-4 py-2 bg-accent text-black rounded-lg text-sm font-bold no-underline"
          >
            {step.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}

async function pickStep(): Promise<Step> {
  const sitesCount = await prisma.site.count();
  if (sitesCount === 0) {
    return {
      badge: "🌱",
      title: "Add your first site",
      body: "SEOForge needs a target — a WordPress install or our native blog hosting. Takes 30 seconds for native, ~2 min for WordPress.",
      cta: "Add a site",
      href: "/sites/new",
      accent: true,
    };
  }

  // Find a site with no queued keywords
  const siteNoQueue = await prisma.site.findFirst({
    where: { active: true, keywords: { none: { status: "queued" } } },
    select: { id: true, name: true },
  });
  if (siteNoQueue) {
    return {
      badge: "🕸",
      title: `${siteNoQueue.name} has no keywords queued`,
      body: "Use the cluster planner — Claude designs 1 pillar + 10–12 supporting articles, all internally linked. Topic clusters rank 2–3x faster than isolated posts.",
      cta: "Plan a cluster",
      href: `/sites/${siteNoQueue.id}/cluster`,
      accent: true,
    };
  }

  // Drafts awaiting review
  const draftCount = await prisma.article.count({ where: { status: "draft" } });
  if (draftCount > 0) {
    const draft = await prisma.article.findFirst({
      where: { status: "draft" },
      orderBy: { id: "desc" },
      select: { id: true, siteId: true, title: true },
    });
    return {
      badge: "📝",
      title: `Review ${draftCount} draft${draftCount === 1 ? "" : "s"} awaiting your eyes`,
      body: "Drafts skipped or held back by quality gates. A 30-second skim per article catches edge cases the gates miss.",
      cta: draft ? `Review "${draft.title.slice(0, 50)}…"` : "Review drafts",
      href: draft ? `/articles/${draft.id}` : "/dashboard",
    };
  }

  // Stale articles (>180 days)
  const cutoff = new Date(Date.now() - 180 * 24 * 3600 * 1000);
  const staleCount = await prisma.article.count({
    where: { status: "published", publishedAt: { lt: cutoff } },
  });
  if (staleCount >= 3) {
    const stale = await prisma.article.findFirst({
      where: { status: "published", publishedAt: { lt: cutoff } },
      orderBy: { publishedAt: "asc" },
      select: { siteId: true },
    });
    return {
      badge: "⟳",
      title: `${staleCount} articles are >6 months old`,
      body: "Refreshing articles gives Google a recency boost — one of the cheapest ranking wins. One click re-queues for regeneration.",
      cta: "Refresh stale articles",
      href: stale ? `/sites/${stale.siteId}/analysis` : "/analysis",
    };
  }

  // No backlinks imported anywhere
  const backlinkCount = await prisma.backlink.count();
  const publishedCount = await prisma.article.count({ where: { status: "published" } });
  if (publishedCount >= 5 && backlinkCount === 0) {
    const site = await prisma.site.findFirst({ select: { id: true } });
    return {
      badge: "⚓",
      title: "Import your inbound backlinks",
      body: "You have articles live but no backlink data. Paste a CSV from GSC, Ahrefs, or Moz — we'll classify each anchor and warn if your profile looks risky.",
      cta: "Import backlinks",
      href: site ? `/sites/${site.id}/anchors` : "/dashboard",
    };
  }

  // GSC not connected on any site
  const sitesGsc = await prisma.site.findMany({
    where: { active: true },
    select: { id: true, gscRefreshTokenEnc: true },
  });
  const noGsc = sitesGsc.find((s) => !s.gscRefreshTokenEnc);
  if (noGsc && publishedCount >= 3) {
    return {
      badge: "📈",
      title: "Connect Google Search Console",
      body: "Once you have articles live, GSC tells you which keywords are pulling impressions — pure ranking data straight from Google.",
      cta: "Connect GSC",
      href: "/analytics",
    };
  }

  // Plenty of articles, nudge toward HARO for backlinks
  if (publishedCount >= 10) {
    return {
      badge: "✉",
      title: "Build authority with HARO responses",
      body: "10+ articles published means you have stories worth sharing. Paste a Connectively / Featured.com query and Claude drafts a source-worthy response in your expert voice.",
      cta: "Draft a HARO response",
      href: "/haro",
    };
  }

  // Default: just publish more
  const siteAny = await prisma.site.findFirst({
    where: { active: true, keywords: { some: { status: "queued" } } },
    select: { id: true, name: true },
  });
  return {
    badge: "▶",
    title: "Run your queue",
    body: `${siteAny?.name ?? "Your site"} has keywords ready. Run it now to publish your next article — quality gates run automatically.`,
    cta: "Run now",
    href: siteAny ? `/sites/${siteAny.id}` : "/dashboard",
    accent: true,
  };
}
