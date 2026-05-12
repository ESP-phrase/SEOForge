import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export default async function AnalysisHubPage() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  if (sites.length === 1) redirect(`/sites/${sites[0].id}/analysis`);

  if (sites.length === 0) {
    return (
      <>
        <PageHeader
          title="SEO Analysis"
          subtitle="On-page health and ranking signals — across every site."
        />
        <Panel>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-accent-dim text-accent rounded-2xl grid place-items-center text-2xl mb-4">
              📈
            </div>
            <h2 className="text-lg font-bold mb-1">No sites yet</h2>
            <p className="text-muted max-w-md text-sm mb-5">
              Add a site, publish a few articles, then come back to see how each one scores on
              the on-page SEO checklist.
            </p>
            <LinkButton href="/sites/new">+ Add your first site</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  const enriched = await Promise.all(
    sites.map(async (s) => {
      const [articleCount, published] = await Promise.all([
        prisma.article.count({ where: { siteId: s.id } }),
        prisma.article.count({ where: { siteId: s.id, status: "published" } }),
      ]);
      return { ...s, articleCount, published };
    }),
  );

  return (
    <>
      <PageHeader title="SEO Analysis" subtitle="Pick a site to see its scorecard." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enriched.map((s) => (
          <Link
            key={s.id}
            href={`/sites/${s.id}/analysis`}
            className="block no-underline text-current"
          >
            <Panel className="hover:border-border-strong transition-colors">
              <h3 className="text-base font-bold mb-1">{s.name}</h3>
              <div className="text-muted text-xs mb-3">{s.wpUrl}</div>
              <div className="flex gap-5 text-sm">
                <span>
                  <b className="text-text">{s.articleCount}</b>{" "}
                  <span className="text-muted text-xs">articles</span>
                </span>
                <span>
                  <b className="text-accent">{s.published}</b>{" "}
                  <span className="text-muted text-xs">live</span>
                </span>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
