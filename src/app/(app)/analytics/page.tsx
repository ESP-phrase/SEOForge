import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { LinkButton } from "@/components/Button";
import { getRefreshToken, isGscConfigured, queryAnalytics, ymd } from "@/lib/gsc";
import { disconnectGscAction } from "@/actions/gsc";

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

function Sparkline({ data, w = 280, h = 60 }: { data: number[]; w?: number; h?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const step = w / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 6) - 3).toFixed(1)}`).join(" ");
  const area = `M0,${h} L${pts} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path d={area} fill="rgba(190, 242, 100, 0.15)" />
      <polyline points={pts} fill="none" stroke="rgb(190, 242, 100)" strokeWidth="2" />
    </svg>
  );
}

export default async function AnalyticsHubPage() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      wpUrl: true,
      slug: true,
      gscRefreshTokenEnc: true,
      gscSiteUrl: true,
      gscConnectedAt: true,
    },
  });

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const since7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const [views30, views7, totalViews, viewsByDay, topArticles, topReferrers, topCountries, recentViews] = await Promise.all([
    prisma.pageView.count({ where: { isBot: false, createdAt: { gte: since30 } } }),
    prisma.pageView.count({ where: { isBot: false, createdAt: { gte: since7 } } }),
    prisma.pageView.count({ where: { isBot: false } }),
    prisma.pageView.findMany({
      where: { isBot: false, createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["articleId"],
      where: { isBot: false, articleId: { not: null }, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { isBot: false, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 8,
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      where: { isBot: false, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 6,
    }),
    prisma.pageView.findMany({
      where: { isBot: false },
      orderBy: { createdAt: "desc" },
      take: 1,
      select: { createdAt: true },
    }),
  ]);

  // Bucket into 30 daily counts
  const buckets: number[] = Array.from({ length: 30 }, () => 0);
  const startBucket = startOfDayUTC(since30).getTime();
  for (const v of viewsByDay) {
    const idx = Math.floor((startOfDayUTC(v.createdAt).getTime() - startBucket) / (24 * 3600 * 1000));
    if (idx >= 0 && idx < 30) buckets[idx]++;
  }

  // Unique visitors (by ipHash) for 30d
  const uniqueRows = await prisma.pageView.findMany({
    where: { isBot: false, createdAt: { gte: since30 } },
    select: { ipHash: true },
    distinct: ["ipHash"],
  });
  const uniques30 = uniqueRows.length;

  // Hydrate article titles for topArticles
  const articleIds = topArticles.map((r) => r.articleId!).filter(Boolean);
  const articles = articleIds.length
    ? await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, title: true, slug: true, wpUrl: true, siteId: true },
      })
    : [];
  const artById = new Map(articles.map((a) => [a.id, a]));

  const hasData = totalViews > 0;
  const lastSeen = recentViews[0]?.createdAt;

  if (sites.length === 0) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Are your articles actually driving traffic?" />
        <Panel>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-accent-dim text-accent rounded-2xl grid place-items-center text-2xl mb-4">
              📊
            </div>
            <h2 className="text-lg font-bold mb-1">No sites yet</h2>
            <p className="text-muted max-w-md text-sm mb-5">
              Add a site, publish a few articles, then install the tracking snippet on your
              WordPress theme to start collecting traffic data here.
            </p>
            <LinkButton href="/sites/new">+ Add your first site</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  const beaconUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? "https://seoforge.org").replace(/\/$/, "") + "/api/track";

  const snippet = `<!-- SEOForge analytics -->
<script>
(function(){
  try {
    fetch(${JSON.stringify(beaconUrl)}, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: location.href, referrer: document.referrer })
    });
  } catch(e) {}
})();
</script>`;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle={
          hasData
            ? `Tracking traffic across ${sites.length} ${sites.length === 1 ? "site" : "sites"} · last hit ${lastSeen ? new Date(lastSeen).toLocaleString() : "never"}`
            : "Install the snippet below to start tracking traffic."
        }
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 7d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(views7)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 30d</div>
          <div className="text-3xl font-extrabold text-accent">{fmt(views30)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Unique · 30d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(uniques30)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">All-time</div>
          <div className="text-3xl font-extrabold text-text">{fmt(totalViews)}</div>
        </Panel>
      </div>

      {/* Daily chart */}
      <Panel
        title="Daily views — last 30 days"
        subtitle={hasData ? "Pageviews per day (bots excluded)" : "No data yet"}
        className="mb-4"
      >
        {hasData ? (
          <div className="w-full overflow-hidden">
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
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>{since30.toLocaleDateString()}</span>
              <span>today</span>
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">Install the tracking snippet to see daily traffic.</p>
        )}
      </Panel>

      {/* Per-site rollup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {await Promise.all(
          sites.map(async (s) => {
            const [v30, v7, daily] = await Promise.all([
              prisma.pageView.count({
                where: { siteId: s.id, isBot: false, createdAt: { gte: since30 } },
              }),
              prisma.pageView.count({
                where: { siteId: s.id, isBot: false, createdAt: { gte: since7 } },
              }),
              prisma.pageView.findMany({
                where: { siteId: s.id, isBot: false, createdAt: { gte: since30 } },
                select: { createdAt: true },
              }),
            ]);
            const sb: number[] = Array.from({ length: 30 }, () => 0);
            for (const v of daily) {
              const idx = Math.floor(
                (startOfDayUTC(v.createdAt).getTime() - startBucket) / (24 * 3600 * 1000),
              );
              if (idx >= 0 && idx < 30) sb[idx]++;
            }
            return (
              <Panel key={s.id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold mb-0.5">{s.name}</h3>
                    <div className="text-muted text-xs">{s.wpUrl}</div>
                  </div>
                  <Link
                    href={`/sites/${s.id}/analysis`}
                    className="text-accent text-xs font-semibold no-underline hover:underline whitespace-nowrap"
                  >
                    Scorecard →
                  </Link>
                </div>
                <div className="flex gap-5 text-sm mb-2">
                  <span>
                    <b className="text-accent">{fmt(v7)}</b>{" "}
                    <span className="text-muted text-xs">7d</span>
                  </span>
                  <span>
                    <b className="text-text">{fmt(v30)}</b>{" "}
                    <span className="text-muted text-xs">30d</span>
                  </span>
                </div>
                <Sparkline data={sb} />
              </Panel>
            );
          }),
        )}
      </div>

      {/* Top articles */}
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
                      {a.wpUrl ? (
                        <a
                          href={a.wpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted text-xs no-underline ml-2 hover:underline"
                        >
                          ↗
                        </a>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-bold text-accent">{fmt(r._count._all)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Panel title="Top referrers · 30 days">
          {topReferrers.length === 0 ? (
            <p className="text-muted text-sm">No referrer data yet.</p>
          ) : (
            <ul className="text-sm space-y-1.5">
              {topReferrers.map((r, i) => {
                let label = r.referrer || "(direct)";
                try {
                  if (r.referrer) label = new URL(r.referrer).host.replace(/^www\./, "");
                } catch {}
                return (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-text truncate">{label}</span>
                    <b className="text-accent">{fmt(r._count._all)}</b>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Top countries · 30 days">
          {topCountries.length === 0 ? (
            <p className="text-muted text-sm">No country data yet.</p>
          ) : (
            <ul className="text-sm space-y-1.5">
              {topCountries.map((r, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-text">{r.country || "(unknown)"}</span>
                  <b className="text-accent">{fmt(r._count._all)}</b>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Google Search Console */}
      <Panel
        title="Google Search Console"
        subtitle="Real search data from Google — impressions, clicks, queries, average position."
        className="mb-4"
      >
        {!isGscConfigured() ? (
          <div className="text-sm">
            <p className="text-muted mb-3">
              GSC integration not configured. Set <code className="text-text">GOOGLE_CLIENT_ID</code>{" "}
              and <code className="text-text">GOOGLE_CLIENT_SECRET</code> in your env vars to enable.
            </p>
            <details className="text-muted text-xs">
              <summary className="cursor-pointer text-text">How to get these (5 min, free)</summary>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-accent hover:underline">console.cloud.google.com</a> and create a project.</li>
                <li>APIs &amp; Services → Library → enable <b>Google Search Console API</b>.</li>
                <li>OAuth consent screen → External → fill app name + your email → add scope <code>webmasters.readonly</code> → add yourself as a test user.</li>
                <li>Credentials → Create Credentials → OAuth client ID → Web application. Authorized redirect URI: <code className="text-text">{(process.env.NEXT_PUBLIC_APP_URL ?? "https://seoforge.org").replace(/\/$/, "")}/api/gsc/callback</code></li>
                <li>Copy Client ID + Secret → set as Vercel env vars and redeploy.</li>
              </ol>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map((s) => {
              const connected = !!s.gscRefreshTokenEnc;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-3 bg-surface-2 border border-border rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-text truncate">{s.name}</div>
                    <div className="text-muted text-xs truncate">
                      {connected ? (
                        <>
                          Connected · <span className="text-text">{s.gscSiteUrl}</span>
                        </>
                      ) : (
                        s.wpUrl
                      )}
                    </div>
                  </div>
                  {connected ? (
                    <div className="flex gap-2">
                      <Link
                        href={`/sites/${s.id}/analytics`}
                        className="px-3 py-1.5 text-xs font-semibold bg-accent text-black rounded-lg no-underline"
                      >
                        View data →
                      </Link>
                      <form action={disconnectGscAction}>
                        <input type="hidden" name="siteId" value={s.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted hover:text-text hover:bg-surface"
                        >
                          Disconnect
                        </button>
                      </form>
                    </div>
                  ) : (
                    <a
                      href={`/api/gsc/connect?siteId=${s.id}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-accent text-black rounded-lg no-underline whitespace-nowrap"
                    >
                      Connect Google
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Snippet to install */}
      <Panel
        title="Install the tracking snippet"
        subtitle="Paste this into your WordPress theme footer (Appearance → Theme File Editor → footer.php, before </body>). One-time setup, then traffic shows up here in real time."
      >
        <pre className="bg-surface-2 border border-border rounded-lg p-3 text-xs overflow-x-auto">
          <code>{snippet}</code>
        </pre>
        <p className="text-muted text-xs mt-3">
          Tip: a plugin like <b className="text-text">WPCode</b> or <b className="text-text">Insert Headers and Footers</b>{" "}
          lets you paste this without editing theme files. Bots and your own visits while logged in
          should be filtered out automatically.
        </p>
      </Panel>
    </>
  );
}
