import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { analyzeDistribution, type AnchorType } from "@/lib/anchorText";
import { BacklinkImporter } from "@/components/BacklinkImporter";

export const dynamic = "force-dynamic";

const TYPE_COLOR: Record<AnchorType, string> = {
  exact: "#ef4444",
  partial: "#f59e0b",
  branded: "#22c55e",
  generic: "#64748b",
  "naked-url": "#0ea5e9",
  image: "#a855f7",
};

const TYPE_LABEL: Record<AnchorType, string> = {
  exact: "Exact match",
  partial: "Partial match",
  branded: "Branded",
  generic: "Generic",
  "naked-url": "Naked URL",
  image: "Image / no anchor",
};

const HEALTHY_RANGE: Record<AnchorType, string> = {
  exact: "0–10%",
  partial: "5–20%",
  branded: "25–55%",
  generic: "10–30%",
  "naked-url": "10–30%",
  image: "0–30%",
};

export default async function AnchorAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const backlinks = await prisma.backlink.findMany({
    where: { siteId },
    orderBy: { firstSeen: "desc" },
    take: 500,
  });
  const types = backlinks.map((b) => b.anchorType as AnchorType);
  const dist = analyzeDistribution(types);
  const referringDomains = new Set(backlinks.map((b) => b.sourceDomain)).size;
  const dofollow = backlinks.filter((b) => !b.rel || b.rel === "dofollow").length;

  const orderedTypes: AnchorType[] = ["branded", "naked-url", "generic", "partial", "exact", "image"];

  return (
    <>
      <PageHeader
        title="Anchor-text diversity"
        subtitle={`${site.name} · ${dist.total} backlinks from ${referringDomains} domains`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Total links</div>
          <div className="text-3xl font-extrabold text-accent">{dist.total}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Referring domains</div>
          <div className="text-3xl font-extrabold text-text">{referringDomains}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Dofollow</div>
          <div className="text-3xl font-extrabold text-text">{dofollow}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Risk score</div>
          <div className={`text-3xl font-extrabold ${dist.warnings.length === 0 ? "text-accent" : dist.warnings.length === 1 ? "text-yellow-400" : "text-red-400"}`}>
            {dist.warnings.length === 0 ? "Low" : dist.warnings.length === 1 ? "Med" : "High"}
          </div>
        </Panel>
      </div>

      {dist.warnings.length > 0 ? (
        <Panel className="mb-4 border-red-400/40">
          <div className="text-red-400 font-bold mb-2">⚠ Warnings</div>
          <ul className="text-sm text-text space-y-1">
            {dist.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Anchor distribution" className="mb-4">
        {dist.total === 0 ? (
          <p className="text-muted text-sm">
            No backlinks imported yet. Use the importer below to paste rows from Ahrefs, Moz, or GSC.
          </p>
        ) : (
          <>
            <div className="flex w-full h-8 rounded-lg overflow-hidden mb-4 border border-border">
              {orderedTypes.map((t) => {
                if (dist.pct[t] === 0) return null;
                return (
                  <div
                    key={t}
                    className="h-full"
                    style={{ width: `${dist.pct[t]}%`, background: TYPE_COLOR[t] }}
                    title={`${TYPE_LABEL[t]}: ${dist.pct[t]}%`}
                  />
                );
              })}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted text-xs uppercase border-b border-border">
                  <th className="py-2">Type</th>
                  <th className="py-2 text-right">Count</th>
                  <th className="py-2 text-right">% of total</th>
                  <th className="py-2 text-right">Healthy range</th>
                </tr>
              </thead>
              <tbody>
                {orderedTypes.map((t) => (
                  <tr key={t} className="border-b border-border/40">
                    <td className="py-2 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: TYPE_COLOR[t] }} />
                      <span className="text-text font-semibold">{TYPE_LABEL[t]}</span>
                    </td>
                    <td className="py-2 text-right text-text">{dist.byType[t]}</td>
                    <td className="py-2 text-right font-bold text-accent">{dist.pct[t]}%</td>
                    <td className="py-2 text-right text-muted text-xs">{HEALTHY_RANGE[t]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Panel>

      <BacklinkImporter siteId={siteId} />
    </>
  );
}
