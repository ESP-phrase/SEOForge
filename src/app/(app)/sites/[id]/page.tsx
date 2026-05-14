import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { addKeywordsAction } from "@/actions/keywords";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";
import { Pill } from "@/components/Pill";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { RunWidget } from "@/components/RunWidget";
import { TestWordPressButton } from "@/components/TestWordPressButton";
import { CustomDomainPanel } from "@/components/CustomDomainPanel";
import { SiteTabs } from "@/components/SiteTabs";
import { TopScoresModal } from "@/components/TopScoresModal";

export default async function SiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ added?: string; dupes?: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const { added, dupes } = await searchParams;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [queued, publishedTotal, publishedToday, articlesTotal, drafts, costAgg, articles, keywords, runs] =
    await Promise.all([
      prisma.keyword.count({ where: { siteId, status: "queued" } }),
      prisma.article.count({ where: { siteId, status: "published" } }),
      prisma.article.count({
        where: { siteId, status: "published", publishedAt: { gte: todayStart } },
      }),
      prisma.article.count({ where: { siteId } }),
      prisma.article.count({ where: { siteId, status: "draft" } }),
      prisma.article.aggregate({
        where: { siteId, createdAt: { gte: monthStart } },
        _sum: { costUsd: true },
      }),
      prisma.article.findMany({
        where: { siteId },
        orderBy: { id: "desc" },
        take: 15,
      }),
      prisma.keyword.findMany({
        where: { siteId },
        orderBy: { id: "desc" },
        take: 200,
      }),
      prisma.run.findMany({
        where: { siteId },
        orderBy: { id: "desc" },
        take: 15,
        include: { article: { select: { title: true } } },
      }),
    ]);

  const costMonth = costAgg._sum.costUsd ?? 0;
  const addKeywords = addKeywordsAction.bind(null, siteId);

  return (
    <>
      <PageHeader
        title={
          <>
            {site.name} <span className="text-muted text-base font-medium">/{site.slug}</span>
          </>
        }
        subtitle={
          <>
            <a href={site.wpUrl} target="_blank" rel="noreferrer">
              {site.wpUrl}
            </a>{" "}
            &nbsp;·&nbsp;{" "}
            <Link href={`/sites/${site.id}/edit`}>edit settings</Link>
            &nbsp;·&nbsp; cap {site.maxPerDay}/day &nbsp;·&nbsp; publishes as{" "}
            <strong>{site.publishStatus}</strong>
          </>
        }
      />

      <SiteTabs siteId={siteId} />

      <div className="flex gap-2 mb-4 flex-wrap">
        <TopScoresModal siteId={siteId} siteName={site.name} />
      </div>

      {added ? (
        <div className="bg-accent-dim text-accent border border-accent-border rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          Added {added} new keyword(s). {dupes && Number(dupes) > 0 ? `${dupes} were duplicates.` : ""}
        </div>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-5">
        <StatTile value={queued} label="In queue" />
        <StatTile value={`${publishedToday}/${site.maxPerDay}`} label="Today" />
        <StatTile value={publishedTotal} label="Published" />
        <StatTile value={drafts} label="Drafts" />
        <StatTile value={`$${costMonth.toFixed(2)}`} label="Cost · month" />
      </div>

      <Card>
        <CardTitle title="Run now" desc="Generate, link, and publish from the keyword queue" />
        <RunWidget siteId={site.id} />
      </Card>

      {site.targetType === "wordpress" ? (
        <Card>
          <CardTitle title="Connection" desc="Verify the WordPress credentials work" />
          <TestWordPressButton siteId={site.id} />
        </Card>
      ) : null}

      <CustomDomainPanel
        siteId={site.id}
        customDomain={site.customDomain}
        customDomainStatus={site.customDomainStatus}
        customDomainError={site.customDomainError}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardTitle
            title="Add keywords"
            right={
              <Link href={`/sites/${site.id}/research`} className="text-sm">
                ⚡ AI research
              </Link>
            }
          />
          <p className="text-muted text-sm mb-2">
            One per line. Optional intent after a pipe:
            <br />
            <code className="bg-surface-2 px-1.5 rounded text-[0.85em] text-accent">
              how to fix shopify checkout errors | informational
            </code>
          </p>
          <form action={addKeywords}>
            <textarea
              name="keywords"
              placeholder="how to fix shopify checkout errors | informational&#10;best crm for real estate | commercial"
            />
            <div className="mt-3">
              <Button type="submit">Add to queue</Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardTitle
            title="Recent articles"
            right={
              <Link href={`/sites/${siteId}/published`} className="text-sm text-accent">
                View published →
              </Link>
            }
          />
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th align="right">Words</Th>
                <Th align="right">Cost</Th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted text-center py-6 text-sm">
                    No articles yet.
                  </td>
                </tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <Td>
                      <Link href={`/articles/${a.id}`}>{a.title}</Link>
                      {a.wpUrl ? (
                        <>
                          {" · "}
                          <a href={a.wpUrl} target="_blank" rel="noreferrer" className="text-xs">
                            live ↗
                          </a>
                        </>
                      ) : null}
                    </Td>
                    <Td>
                      <Pill status={a.status}>{a.status}</Pill>
                    </Td>
                    <Td align="right" muted>
                      {a.wordCount || "—"}
                    </Td>
                    <Td align="right" muted>
                      ${a.costUsd.toFixed(3)}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <CardTitle title="Keywords" desc={`${keywords.length} shown`} />
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Keyword</Th>
              <Th>Intent</Th>
              <Th>Status</Th>
              <Th align="right">Created</Th>
            </tr>
          </thead>
          <tbody>
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted text-center py-6 text-sm">
                  No keywords yet — add some above.
                </td>
              </tr>
            ) : (
              keywords.map((k) => (
                <tr key={k.id} className="border-b border-border last:border-0">
                  <Td>{k.keyword}</Td>
                  <Td muted>{k.intent || "—"}</Td>
                  <Td>
                    <Pill status={k.status}>{k.status}</Pill>
                  </Td>
                  <Td align="right" muted>
                    {k.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {runs.length > 0 ? (
        <Card>
          <CardTitle
            title="Recent activity"
            right={
              <Link href={`/activity/${site.id}`} className="text-sm">
                view all →
              </Link>
            }
          />
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Action</Th>
                <Th>Status</Th>
                <Th>Detail</Th>
                <Th align="right">Cost</Th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <Td muted>{r.startedAt.toISOString().slice(0, 16).replace("T", " ")}</Td>
                  <Td muted>{r.action}</Td>
                  <Td>
                    <Pill status={r.status}>{r.status}</Pill>
                  </Td>
                  <Td muted>
                    <span className="block max-w-[36rem] overflow-hidden text-ellipsis whitespace-nowrap">
                      {r.message || ""}
                    </span>
                  </Td>
                  <Td align="right" muted>
                    ${r.costUsd.toFixed(3)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className="text-muted font-semibold text-[0.7rem] uppercase tracking-wider py-2.5 px-3 border-b border-border"
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  muted,
}: {
  children: React.ReactNode;
  align?: "right";
  muted?: boolean;
}) {
  return (
    <td
      className={`py-2.5 px-3 ${muted ? "text-muted text-xs" : ""}`}
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </td>
  );
}
