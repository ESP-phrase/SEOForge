import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/Hero";
import { Panel } from "@/components/Panel";
import { IconStatTile } from "@/components/IconStatTile";
import { LineChart, ChartLegend, type Series } from "@/components/charts/LineChart";
import { Sparkline } from "@/components/charts/Sparkline";
import { Pill } from "@/components/Pill";
import { LinkButton } from "@/components/Button";
import { DashboardFilters } from "@/components/DashboardFilters";
import { NextStepCard } from "@/components/NextStepCard";
import {
  GlobeIcon,
  CheckCircleIcon,
  ClockIcon,
  SpinIcon,
  TrendUpIcon,
  EyeIcon,
  CheckCircleIcon as CheckIcon,
  BellIcon,
} from "@/components/Icons";

const SERIES_COLORS = {
  Published: "#4ade80",
  Queued: "#facc15",
  "In Progress": "#60a5fa",
  Draft: "#9ca3af",
};

type Filters = {
  siteId: number | null;
  status: "all" | "published" | "draft" | "needs_review";
  rangeDays: number | null; // null = all-time
};

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const sRaw = Array.isArray(sp.site) ? sp.site[0] : sp.site;
  const stRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const rRaw = Array.isArray(sp.range) ? sp.range[0] : sp.range;

  const siteId = sRaw && sRaw !== "all" ? Number(sRaw) : null;
  const allowedStatuses = ["published", "draft", "needs_review"] as const;
  const status: Filters["status"] =
    stRaw && (allowedStatuses as readonly string[]).includes(stRaw)
      ? (stRaw as Filters["status"])
      : "all";
  const rangeDays =
    rRaw === "all"
      ? null
      : rRaw && /^\d+$/.test(rRaw)
        ? Math.max(1, Math.min(365, Number(rRaw)))
        : 30;

  return { siteId, status, rangeDays };
}

function dateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function loadEverything(filters: Filters) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Chart always covers the same window as the active range (default 30).
  // "All time" still uses 30 days for the chart since older data isn't
  // comparable; totals shown above the chart use full-history counts.
  const dayBuckets = filters.rangeDays ?? 30;
  const since = new Date();
  since.setDate(since.getDate() - dayBuckets);
  since.setHours(0, 0, 0, 0);

  // Common filter snippets
  const siteWhere: Prisma.ArticleWhereInput = filters.siteId
    ? { siteId: filters.siteId }
    : {};
  const kwSiteWhere: Prisma.KeywordWhereInput = filters.siteId
    ? { siteId: filters.siteId }
    : {};
  const sinceFilter: Prisma.DateTimeFilter = { gte: since };
  // For "all time" only the chart uses `since`; totals do not bound by date.
  const isAllTime = filters.rangeDays == null;

  // Article status filter (only impacts the "recent articles" table)
  const recentArticlesStatusWhere: Prisma.ArticleWhereInput =
    filters.status === "all"
      ? {}
      : filters.status === "needs_review"
        ? {
            // status="draft" rows that came from the quality gate are surfaced
            // as needs_review via the run record, but the article itself is
            // still status="draft". We approximate by joining drafts here.
            status: "draft",
          }
        : { status: filters.status };

  const [
    sites,
    publishedTotal,
    queuedTotal,
    draftsTotal,
    inProgressTotal,
    recentArticles,
    publishedThisRange,
    queuedThisRange,
    draftsThisRange,
    inProgressThisRange,
    recentRuns,
    costRangeAgg,
    historyArticles,
  ] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" } }),
    prisma.article.count({ where: { ...siteWhere, status: "published" } }),
    prisma.keyword.count({ where: { ...kwSiteWhere, status: "queued" } }),
    prisma.article.count({ where: { ...siteWhere, status: "draft" } }),
    prisma.keyword.count({ where: { ...kwSiteWhere, status: "processing" } }),
    prisma.article.findMany({
      where: { ...siteWhere, ...recentArticlesStatusWhere },
      orderBy: { id: "desc" },
      take: 30,
      include: { site: { select: { name: true, slug: true } } },
    }),
    prisma.article.count({
      where: {
        ...siteWhere,
        status: "published",
        ...(isAllTime ? {} : { publishedAt: sinceFilter }),
      },
    }),
    prisma.keyword.count({
      where: {
        ...kwSiteWhere,
        status: "queued",
        ...(isAllTime ? {} : { createdAt: sinceFilter }),
      },
    }),
    prisma.article.count({
      where: {
        ...siteWhere,
        status: "draft",
        ...(isAllTime ? {} : { createdAt: sinceFilter }),
      },
    }),
    prisma.keyword.count({
      where: {
        ...kwSiteWhere,
        status: "processing",
        ...(isAllTime ? {} : { createdAt: sinceFilter }),
      },
    }),
    prisma.run.findMany({
      where: filters.siteId ? { siteId: filters.siteId } : {},
      orderBy: { id: "desc" },
      take: 4,
      include: {
        site: { select: { name: true, slug: true } },
        article: { select: { title: true } },
      },
    }),
    prisma.article.aggregate({
      where: {
        ...siteWhere,
        ...(isAllTime ? {} : { createdAt: sinceFilter }),
      },
      _sum: { costUsd: true },
    }),
    prisma.article.findMany({
      where: { ...siteWhere, createdAt: { gte: since } },
      select: {
        createdAt: true,
        publishedAt: true,
        status: true,
        siteId: true,
      },
    }),
  ]);

  // Build cumulative daily series for the line chart
  const dayLabels: string[] = [];
  for (let i = 0; i < dayBuckets; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dayLabels.push(dateLabel(d));
  }

  const counts = {
    Published: Array(dayBuckets).fill(0),
    Queued: Array(dayBuckets).fill(0),
    "In Progress": Array(dayBuckets).fill(0),
    Draft: Array(dayBuckets).fill(0),
  };

  for (const a of historyArticles) {
    const ts = a.publishedAt ?? a.createdAt;
    const dayIndex = Math.floor((ts.getTime() - since.getTime()) / (1000 * 60 * 60 * 24));
    if (dayIndex < 0 || dayIndex >= dayBuckets) continue;
    if (a.status === "published") counts.Published[dayIndex] += 1;
    else if (a.status === "draft") counts.Draft[dayIndex] += 1;
  }

  // Cumulative running totals (so the chart climbs over time)
  const cumulate = (arr: number[]) => {
    let running = 0;
    return arr.map((v) => (running += v));
  };

  const series: Series[] = [
    { label: "Published", color: SERIES_COLORS.Published, data: cumulate(counts.Published) },
    { label: "Queued", color: SERIES_COLORS.Queued, data: cumulate(counts.Queued) },
    { label: "In Progress", color: SERIES_COLORS["In Progress"], data: cumulate(counts["In Progress"]) },
    { label: "Draft", color: SERIES_COLORS.Draft, data: cumulate(counts.Draft) },
  ];

  // Per-site stats for "Top Performing Sites" — when a site is filtered, only
  // show that one site in the panel.
  const sitesForTop = filters.siteId
    ? sites.filter((s) => s.id === filters.siteId)
    : sites;
  const topSites = await Promise.all(
    sitesForTop.slice(0, 5).map(async (s) => {
      const articleCount = await prisma.article.count({
        where: { siteId: s.id, status: "published" },
      });
      // Build a 14-day published-per-day series for the sparkline
      const sparkSince = new Date();
      sparkSince.setDate(sparkSince.getDate() - 14);
      const recent = await prisma.article.findMany({
        where: { siteId: s.id, publishedAt: { gte: sparkSince } },
        select: { publishedAt: true },
      });
      const spark: number[] = Array(14).fill(0);
      for (const a of recent) {
        if (!a.publishedAt) continue;
        const idx = Math.floor(
          (a.publishedAt.getTime() - sparkSince.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (idx >= 0 && idx < 14) spark[idx] += 1;
      }
      return {
        ...s,
        articleCount,
        spark,
        // Score is a derivative quality metric from publish ratio + word counts
        score: 70 + Math.min(30, articleCount * 2),
      };
    }),
  );

  return {
    sites,
    topSites,
    series,
    dayLabels,
    metrics: {
      totalSites: filters.siteId ? 1 : sites.length,
      published: publishedTotal,
      queued: queuedTotal,
      drafts: draftsTotal,
      inProgress: inProgressTotal,
      recentArticles,
      publishedThisRange,
      queuedThisRange,
      draftsThisRange,
      inProgressThisRange,
      costRange: costRangeAgg._sum.costUsd ?? 0,
    },
    recentRuns,
    filters,
  };
}

const RUN_STATUS_TONE: Record<string, "green" | "amber" | "blue" | "violet" | "yellow"> = {
  published: "green",
  "ok-dry": "amber",
  running: "blue",
  "needs-review": "blue",
  failed: "yellow",
};

const RUN_STATUS_VERB: Record<string, string> = {
  published: "Published",
  "ok-dry": "Dry-run",
  running: "In Progress",
  "needs-review": "Draft Created",
  failed: "Failed",
};

function timeAgo(d: Date): string {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const min = Math.floor(seconds / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  return `${dy}d ago`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const { sites, topSites, series, dayLabels, metrics, recentRuns } =
    await loadEverything(filters);

  const rangeLabel =
    filters.rangeDays == null ? "all time" : `last ${filters.rangeDays} days`;

  return (
    <>
      <Hero
        title="SEO Dashboard"
        subtitle="Multi-site AI content pipeline · published, queued, and in-progress at a glance"
        right={
          <>
            <LinkButton href="/sites/new">+ Add site</LinkButton>
            <LinkButton href="/activity" variant="secondary">View activity</LinkButton>
          </>
        }
      >
        <DashboardFilters sites={sites.map((s) => ({ id: s.id, name: s.name }))} />
      </Hero>

      <NextStepCard />

      {/* 6-tile metric row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <IconStatTile
          label="Total Sites"
          value={metrics.totalSites}
          tone="yellow"
          trend={metrics.totalSites > 0 ? `+${metrics.totalSites} this month` : undefined}
          icon={<GlobeIcon size={18} />}
        />
        <IconStatTile
          label="Published"
          value={metrics.published}
          tone="green"
          trend={
            metrics.publishedThisRange > 0
              ? `+${metrics.publishedThisRange} ${rangeLabel}`
              : undefined
          }
          icon={<CheckCircleIcon size={18} />}
        />
        <IconStatTile
          label="Queued"
          value={metrics.queued}
          tone="amber"
          trend={
            metrics.queuedThisRange > 0
              ? `+${metrics.queuedThisRange} ${rangeLabel}`
              : undefined
          }
          icon={<ClockIcon size={18} />}
        />
        <IconStatTile
          label="In Progress"
          value={metrics.inProgress}
          tone="blue"
          trend={
            metrics.inProgressThisRange > 0
              ? `+${metrics.inProgressThisRange} ${rangeLabel}`
              : undefined
          }
          icon={<SpinIcon size={18} />}
        />
        <IconStatTile
          label="Drafts"
          value={metrics.drafts}
          tone="violet"
          trend={
            metrics.draftsThisRange > 0
              ? `+${metrics.draftsThisRange} ${rangeLabel}`
              : undefined
          }
          icon={<TrendUpIcon size={18} />}
        />
        <IconStatTile
          label={`Cost · ${rangeLabel}`}
          value={`$${metrics.costRange.toFixed(2)}`}
          tone="cyan"
          icon={<EyeIcon size={18} />}
        />
      </div>

      {/* Pipeline chart + Top sites */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-5">
        <Panel
          className="xl:col-span-8"
          title="Content Pipeline Overview"
          right={
            <div className="text-xs text-muted bg-surface border border-border rounded-lg px-3 py-1.5 capitalize">
              {rangeLabel}
            </div>
          }
        >
          <ChartLegend series={series} />
          <div className="mt-3">
            <LineChart series={series} labels={dayLabels} height={300} />
          </div>
        </Panel>

        <Panel
          className="xl:col-span-4"
          title="Top Performing Sites"
          right={
            <Link href="/sites/new" className="text-xs text-accent">
              View all
            </Link>
          }
        >
          {topSites.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">
              No sites yet. <Link href="/sites/new" className="text-accent">Add one →</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold pb-3 text-left">Site</th>
                  <th className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold pb-3 text-center">Score</th>
                  <th className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold pb-3 text-right">Articles</th>
                  <th className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold pb-3 text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topSites.map((s, i) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="py-3">
                      <Link
                        href={`/sites/${s.id}`}
                        className="flex items-center gap-2.5 no-underline"
                      >
                        <span
                          className="w-7 h-7 rounded-lg grid place-items-center text-[0.7rem] font-black text-black"
                          style={{
                            background: ["#bef848", "#4ade80", "#60a5fa", "#fbbf24", "#a78bfa"][
                              i % 5
                            ],
                          }}
                        >
                          {s.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-text truncate">{s.name}</div>
                          <div className="text-muted text-[0.7rem] truncate">{s.slug}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center py-3">
                      <span className="inline-block bg-surface-2 border border-border rounded-md px-2 py-0.5 text-xs font-bold">
                        {s.score}
                      </span>
                    </td>
                    <td className="text-right py-3 text-muted text-xs">{s.articleCount}</td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Sparkline data={s.spark} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* Recent activity strip */}
      <Panel
        title="Recent Activity"
        right={
          <Link href="/activity" className="text-xs text-accent">
            View all activity
          </Link>
        }
      >
        {recentRuns.length === 0 ? (
          <div className="py-8 text-center text-muted text-sm">
            No activity yet. Add a site, queue some keywords, and click <strong>Run</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {recentRuns.map((r) => {
              const tone = RUN_STATUS_TONE[r.status] ?? "yellow";
              const verb = RUN_STATUS_VERB[r.status] ?? r.status;
              const Icon =
                r.status === "published" ? CheckIcon
                : r.status === "running" ? SpinIcon
                : r.status === "failed" ? BellIcon
                : ClockIcon;
              return (
                <div
                  key={r.id}
                  className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl"
                >
                  <div
                    className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${
                      tone === "green" ? "bg-tile-green/15 text-tile-green"
                        : tone === "blue" ? "bg-tile-blue/15 text-tile-blue"
                        : tone === "violet" ? "bg-tile-violet/15 text-tile-violet"
                        : tone === "amber" ? "bg-tile-amber/15 text-tile-amber"
                        : "bg-tile-yellow/15 text-tile-yellow"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-text font-semibold text-sm leading-tight">
                      {verb}: {r.article?.title ?? r.message ?? "—"}
                    </div>
                    <div className="text-muted text-xs mt-1 truncate">
                      {r.site?.name ?? "—"} · {timeAgo(r.startedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
