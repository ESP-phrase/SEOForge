import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { SiteTabs } from "@/components/SiteTabs";
import { Panel } from "@/components/Panel";
import { getRefreshToken, queryAnalytics, ymd, type GscRow } from "@/lib/gsc";

export const dynamic = "force-dynamic";

function startOfDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

export default async function SiteAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const since7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const startBucket = startOfDayUTC(since30).getTime();

  const [v7, v30, total, daily, topArticles, topRef, uniques] = await Promise.all([
    prisma.pageView.count({ where: { siteId, isBot: false, createdAt: { gte: since7 } } }),
    prisma.pageView.count({ where: { siteId, isBot: false, createdAt: { gte: since30 } } }),
    prisma.pageView.count({ where: { siteId, isBot: false } }),
    prisma.pageView.findMany({
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["articleId"],
      where: { siteId, isBot: false, articleId: { not: null }, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 20,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    prisma.pageView.findMany({
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      select: { ipHash: true },
      distinct: ["ipHash"],
    }),
  ]);

  const buckets: number[] = Array.from({ length: 30 }, () => 0);
  for (const v of daily) {
    const idx = Math.floor((startOfDayUTC(v.createdAt).getTime() - startBucket) / (24 * 3600 * 1000));
    if (idx >= 0 && idx < 30) buckets[idx]++;
  }

  // ── Google Search Console (if connected) ──
  const refreshToken = getRefreshToken(site);
  const gscSiteUrl = site.gscSiteUrl ?? "";
  let gscTotals: { clicks: number; impressions: number; ctr: number; position: number } | null = null;
  let gscTopQueries: GscRow[] = [];
  let gscTopPages: GscRow[] = [];
  let gscError: string | null = null;
  if (refreshToken && gscSiteUrl) {
    const startDate = ymd(new Date(Date.now() - 30 * 24 * 3600 * 1000));
    const endDate = ymd(new Date());
    try {
      const [totals, queries, pages] = await Promise.all([
        queryAnalytics({ refreshToken, siteUrl: gscSiteUrl, startDate, endDate, dimensions: [] }),
        queryAnalytics({
          refreshToken,
          siteUrl: gscSiteUrl,
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 20,
        }),
        queryAnalytics({
          refreshToken,
          siteUrl: gscSiteUrl,
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 20,
        }),
      ]);
      if (totals[0]) {
        gscTotals = {
          clicks: totals[0].clicks,
          impressions: totals[0].impressions,
          ctr: totals[0].ctr,
          position: totals[0].position,
        };
      }
      gscTopQueries = queries;
      gscTopPages = pages;
    } catch (e) {
      gscError = e instanceof Error ? e.message : "GSC query failed";
    }
  }

  const aIds = topArticles.map((r) => r.articleId!).filter(Boolean);
  const articles = aIds.length
    ? await prisma.article.findMany({
        where: { id: { in: aIds } },
        select: { id: true, title: true, wpUrl: true, publishedAt: true },
      })
    : [];
  const artById = new Map(articles.map((a) => [a.id, a]));

  return (
    <>
      <SiteTabs siteId={siteId} siteName={site.name} />
      <PageHeader
        title={`${site.name} · Analytics`}
        subtitle={site.wpUrl}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/sites/${siteId}/analysis`}
              className="px-3 py-2 text-xs font-semibold border border-border rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline"
            >
              SEO Scorecard
            </Link>
            <Link
              href="/analytics"
              className="px-3 py-2 text-xs font-semibold border border-border rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline"
            >
              All sites
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 7d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(v7)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 30d</div>
          <div className="text-3xl font-extrabold text-accent">{fmt(v30)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Unique · 30d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(uniques.length)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">All-time</div>
          <div className="text-3xl font-extrabold text-text">{fmt(total)}</div>
        </Panel>
      </div>

      <Panel title="Daily views — last 30 days" className="mb-4">
        {total === 0 ? (
          <p className="text-muted text-sm">
            No traffic yet. Make sure the tracking snippet is installed on{" "}
            <a href={site.wpUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              {site.wpUrl}
            </a>
            . See <Link href="/analytics" className="text-accent hover:underline">/analytics</Link> for the snippet.
          </p>
        ) : (
          <svg viewBox="0 0 600 120" className="w-full h-32 block" preserveAspectRatio="none">
            {(() => {
              const max = Math.max(1, ...buckets);
              const step = 600 / 30;
              return buckets.map((v, i) => {
                const h = (v / max) * 100;
                return (
                  <rect
                    key={i}
                    x={i * step + 2}
                    y={120 - h - 4}
                    width={step - 4}
                    height={Math.max(2, h)}
                    fill="rgb(190, 242, 100)"
                    opacity={v === 0 ? 0.15 : 0.85}
                    rx="2"
                  />
                );
              });
            })()}
          </svg>
        )}
      </Panel>

      {/* Google Search Console — 30d */}
      {refreshToken ? (
        <>
          <Panel
            title="Google Search Console — last 30 days"
            subtitle={
              gscError
                ? `Error: ${gscError}`
                : gscSiteUrl
                  ? `Property: ${gscSiteUrl}`
                  : "Not connected"
            }
            className="mb-4"
          >
            {gscTotals ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-muted text-xs uppercase tracking-wide mb-1">Clicks</div>
                  <div className="text-3xl font-extrabold text-accent">{fmt(gscTotals.clicks)}</div>
                </div>
                <div>
                  <div className="text-muted text-xs uppercase tracking-wide mb-1">Impressions</div>
                  <div className="text-3xl font-extrabold text-text">{fmt(gscTotals.impressions)}</div>
                </div>
                <div>
                  <div className="text-muted text-xs uppercase tracking-wide mb-1">CTR</div>
                  <div className="text-3xl font-extrabold text-text">
                    {(gscTotals.ctr * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs uppercase tracking-wide mb-1">Avg position</div>
                  <div className="text-3xl font-extrabold text-text">
                    {gscTotals.position.toFixed(1)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">No GSC data in the last 30 days.</p>
            )}
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Panel title="Top queries · 30 days">
              {gscTopQueries.length === 0 ? (
                <p className="text-muted text-sm">No query data.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted uppercase border-b border-border">
                      <th className="py-2">Query</th>
                      <th className="py-2 text-right">Clicks</th>
                      <th className="py-2 text-right">Impr.</th>
                      <th className="py-2 text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gscTopQueries.map((r, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-1.5 text-text">{r.keys[0]}</td>
                        <td className="py-1.5 text-right font-bold text-accent">{r.clicks}</td>
                        <td className="py-1.5 text-right text-muted">{fmt(r.impressions)}</td>
                        <td className="py-1.5 text-right text-muted">{r.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
            <Panel title="Top landing pages · 30 days">
              {gscTopPages.length === 0 ? (
                <p className="text-muted text-sm">No page data.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted uppercase border-b border-border">
                      <th className="py-2">Page</th>
                      <th className="py-2 text-right">Clicks</th>
                      <th className="py-2 text-right">Impr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gscTopPages.map((r, i) => {
                      let label = r.keys[0];
                      try {
                        label = new URL(r.keys[0]).pathname;
                      } catch {}
                      return (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-1.5 text-text truncate max-w-[200px]">
                            <a
                              href={r.keys[0]}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-accent no-underline"
                            >
                              {label}
                            </a>
                          </td>
                          <td className="py-1.5 text-right font-bold text-accent">{r.clicks}</td>
                          <td className="py-1.5 text-right text-muted">{fmt(r.impressions)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
        </>
      ) : (
        <Panel
          title="Connect Google Search Console"
          subtitle="See real search data: impressions, clicks, ranking positions, and the queries driving traffic."
          className="mb-4"
        >
          <a
            href={`/api/gsc/connect?siteId=${siteId}`}
            className="inline-block px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold no-underline"
          >
            Connect Google
          </a>
        </Panel>
      )}

      <Panel title="Top articles · 30 days" className="mb-4">
        {topArticles.length === 0 ? (
          <p className="text-muted text-sm">No article-level data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase border-b border-border">
                <th className="py-2">Article</th>
                <th className="py-2 text-right w-24">Views</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((r) => {
                const a = artById.get(r.articleId!);
                if (!a) return null;
                return (
                  <tr key={r.articleId} className="border-b border-border/40">
                    <td className="py-2">
                      <Link
                        href={`/articles/${a.id}`}
                        className="text-text hover:text-accent no-underline font-medium"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-bold text-accent">{fmt(r._count._all)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Top referrers · 30 days">
        {topRef.length === 0 ? (
          <p className="text-muted text-sm">No referrer data yet.</p>
        ) : (
          <ul className="text-sm space-y-1.5">
            {topRef.map((r, i) => {
              let label = r.referrer || "(direct)";
              try {
                if (r.referrer) label = new URL(r.referrer).host.replace(/^www\./, "");
              } catch {}
              return (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-text">{label}</span>
                  <b className="text-accent">{fmt(r._count._all)}</b>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
