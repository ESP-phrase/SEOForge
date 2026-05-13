import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { HaroWorkbench } from "@/components/HaroWorkbench";

export const dynamic = "force-dynamic";

export default async function HaroPage() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, niche: true },
  });

  return (
    <>
      <PageHeader
        title="Source request drafter"
        subtitle="Paste a HARO / Connectively / Featured.com query — Claude writes a source-worthy response in your expert voice"
      />
      {sites.length === 0 ? (
        <Panel>
          <p className="text-muted text-sm">
            Add a site first — Claude needs the site's expert voice and niche to draft good responses.
          </p>
        </Panel>
      ) : (
        <HaroWorkbench sites={sites} />
      )}
      <Panel title="Where to find queries" className="mt-4">
        <ul className="text-sm space-y-2 text-muted">
          <li>
            <a className="text-accent hover:underline" href="https://www.connectively.us" target="_blank" rel="noreferrer">Connectively</a>{" "}
            — successor to HARO, daily emails matching your topics
          </li>
          <li>
            <a className="text-accent hover:underline" href="https://featured.com" target="_blank" rel="noreferrer">Featured.com</a>{" "}
            — paid but high-quality, business/marketing focus
          </li>
          <li>
            <a className="text-accent hover:underline" href="https://www.qwoted.com" target="_blank" rel="noreferrer">Qwoted</a>{" "}
            — strong on tech, finance, and B2B
          </li>
          <li>
            <a className="text-accent hover:underline" href="https://twitter.com/search?q=%23journorequest" target="_blank" rel="noreferrer">#journorequest on X</a>{" "}
            — free, real-time, mostly UK reporters
          </li>
        </ul>
      </Panel>
    </>
  );
}
