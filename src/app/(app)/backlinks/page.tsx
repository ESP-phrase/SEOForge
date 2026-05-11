import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export default async function BacklinksHubPage() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  // Single-site setup → jump straight to the workbench
  if (sites.length === 1) {
    redirect(`/sites/${sites[0].id}/backlinks`);
  }

  if (sites.length === 0) {
    return (
      <>
        <PageHeader
          title="Backlinks"
          subtitle="Find prospects, draft outreach, track replies — across all your sites."
        />
        <Panel>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-accent-dim text-accent rounded-2xl grid place-items-center text-2xl mb-4">
              🔗
            </div>
            <h2 className="text-lg font-bold mb-1">No sites yet</h2>
            <p className="text-muted max-w-md text-sm mb-5">
              Backlink outreach happens per site (each site pitches its own articles).
              Add a site first.
            </p>
            <LinkButton href="/sites/new">+ Add your first site</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  // Multi-site → list with aggregated outreach stats
  const sitesWithStats = await Promise.all(
    sites.map(async (s) => {
      const [total, won, sent] = await Promise.all([
        prisma.outreachProspect.count({ where: { siteId: s.id } }),
        prisma.outreachProspect.count({ where: { siteId: s.id, status: "won" } }),
        prisma.outreachProspect.count({
          where: { siteId: s.id, status: { in: ["sent", "replied"] } },
        }),
      ]);
      return { ...s, total, won, sent };
    }),
  );

  return (
    <>
      <PageHeader
        title="Backlinks"
        subtitle="Pick a site to manage its outreach pipeline."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sitesWithStats.map((s) => (
          <Link
            key={s.id}
            href={`/sites/${s.id}/backlinks`}
            className="block no-underline text-current"
          >
            <Panel className="hover:border-border-strong transition-colors">
              <h3 className="text-base font-bold mb-1">{s.name}</h3>
              <div className="text-muted text-xs mb-4">{s.wpUrl}</div>
              <div className="flex gap-5 text-sm">
                <span>
                  <b className="text-text">{s.total}</b>{" "}
                  <span className="text-muted text-xs">prospects</span>
                </span>
                <span>
                  <b className="text-text">{s.sent}</b>{" "}
                  <span className="text-muted text-xs">sent</span>
                </span>
                <span>
                  <b className="text-accent">{s.won}</b>{" "}
                  <span className="text-muted text-xs">linked ✓</span>
                </span>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
