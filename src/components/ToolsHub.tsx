import Link from "next/link";
import { prisma } from "@/lib/db";

/**
 * Server component: 1-click access from the dashboard to every per-site
 * tool. Each card auto-targets the most-recently-created active site so
 * the user doesn't have to click into a site first.
 *
 * If they have >1 site, a tiny "switch site" link reveals a dropdown of
 * other sites under each tool — minor friction, no menu hunting.
 */
const TOOLS = [
  {
    slug: "cluster",
    icon: "🕸",
    title: "Plan a cluster",
    body: "1 pillar + 12 linked articles. Topic clusters rank 2-3x faster.",
    accent: true,
  },
  {
    slug: "research",
    icon: "⚡",
    title: "Keyword research",
    body: "Claude finds long-tail keywords in your niche.",
  },
  {
    slug: "analytics",
    icon: "📈",
    title: "Live analytics",
    body: "Page views + GSC clicks, impressions, and ranking position.",
  },
  {
    slug: "anchors",
    icon: "⚓",
    title: "Anchor diversity",
    body: "Import backlinks, see if your anchor profile is risky.",
  },
  {
    slug: "backlinks",
    icon: "✉",
    title: "Backlink outreach",
    body: "Claude finds resource pages and drafts pitch emails.",
  },
  {
    slug: "analysis",
    icon: "📊",
    title: "SEO scorecard",
    body: "12-check on-page audit per article. Flags stale posts.",
  },
];

export async function ToolsHub() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 10,
  });
  if (sites.length === 0) return null;
  const primary = sites[0];

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
          Quick tools
        </h2>
        <span className="text-muted-2 text-xs">
          targeting <span className="text-text font-semibold">{primary.name}</span>
          {sites.length > 1 ? ` · ${sites.length - 1} other site${sites.length > 2 ? "s" : ""}` : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/sites/${primary.id}/${t.slug}`}
            className={`group block p-4 rounded-xl border no-underline transition-colors ${
              t.accent
                ? "bg-card-grad border-accent hover:bg-accent-dim"
                : "bg-card-grad border-border hover:border-border-strong"
            }`}
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-bold text-text text-sm mb-1 leading-snug">{t.title}</div>
            <div className="text-muted text-xs leading-snug">{t.body}</div>
            {sites.length > 1 ? (
              <details className="mt-2" onClick={(e) => e.stopPropagation()}>
                <summary className="text-muted-2 text-[0.65rem] uppercase tracking-wider font-bold cursor-pointer hover:text-accent list-none">
                  Switch site
                </summary>
                <div className="mt-1.5 space-y-0.5">
                  {sites.slice(1).map((s) => (
                    <Link
                      key={s.id}
                      href={`/sites/${s.id}/${t.slug}`}
                      className="block text-text text-xs hover:text-accent no-underline"
                    >
                      → {s.name}
                    </Link>
                  ))}
                </div>
              </details>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
