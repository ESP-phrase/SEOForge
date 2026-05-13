import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { StatTile } from "@/components/StatTile";
import { Pill } from "@/components/Pill";
import { scoreArticle, type ArticleScorecard } from "@/lib/seoScore";
import { refreshArticleAction } from "@/actions/refresh";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const [articles, outreachWon, outreachTotal] = await Promise.all([
    prisma.article.findMany({
      where: { siteId },
      orderBy: { id: "desc" },
      take: 50,
    }),
    prisma.outreachProspect.count({ where: { siteId, status: "won" } }),
    prisma.outreachProspect.count({ where: { siteId } }),
  ]);

  const siteHasMultipleArticles = articles.length > 1;

  const scored = articles.map((a) => ({
    article: a,
    card: scoreArticle(
      {
        status: a.status,
        html: a.html,
        metaDescription: a.metaDescription,
        wordCount: a.wordCount,
        serpJson: a.serpJson,
        publishedAt: a.publishedAt,
        categoriesJson: a.categoriesJson,
        tagsJson: a.tagsJson,
      },
      { minWordCount: site.minWordCount, siteHasMultipleArticles },
    ),
  }));

  // Aggregate site-wide score
  const avgScore =
    scored.length === 0
      ? 0
      : Math.round(
          scored.reduce((s, x) => s + x.card.score, 0) / scored.length,
        );
  const publishedCount = scored.filter(
    (x) => x.article.status === "published",
  ).length;
  const indexingEligibleCount = scored.filter(
    (x) => (x.card.daysLive ?? 0) >= 14,
  ).length;
  const totalIssues = scored.reduce(
    (s, x) => s + x.card.checks.filter((c) => !c.pass).length,
    0,
  );

  return (
    <>
      <PageHeader
        title={`SEO Analysis · ${site.name}`}
        subtitle={
          <>
            On-page health across every article, plus what to fix next.{" "}
            &nbsp;·&nbsp; <Link href={`/sites/${siteId}`}>back to site</Link>
          </>
        }
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <StatTile value={`${avgScore}/100`} label="Avg SEO score" />
        <StatTile value={publishedCount} label="Articles live" />
        <StatTile value={indexingEligibleCount} label="Ranking-eligible (14d+)" />
        <StatTile value={`${outreachWon}/${outreachTotal}`} label="Backlinks won" />
        <StatTile value={totalIssues} label="Issues to fix" />
      </div>

      {/* Google Search Console placeholder */}
      <Panel
        title="Google Search Console"
        subtitle="Real impressions / clicks / average position per article"
      >
        <div className="bg-bg-2 border border-border rounded-lg p-5 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <div className="text-text font-semibold">Not connected yet</div>
            <div className="text-muted text-sm mt-1 max-w-2xl">
              Connect Search Console to see real ranking + traffic per article.
              Until then, this page uses what we can compute from the article
              HTML itself (on-page signals only).
            </div>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-surface border border-border-strong rounded-lg text-sm font-semibold text-text hover:bg-surface-2 no-underline"
          >
            Open Search Console ↗
          </a>
        </div>
      </Panel>

      {/* Stale articles (>180 days) — refresh boosts rankings */}
      {(() => {
        const cutoff = new Date(Date.now() - 180 * 24 * 3600 * 1000);
        const stale = articles
          .filter(
            (a) =>
              a.status === "published" &&
              a.publishedAt &&
              new Date(a.publishedAt) < cutoff,
          )
          .slice(0, 10);
        if (stale.length === 0) return null;
        return (
          <Panel
            title={`Stale articles (${stale.length})`}
            subtitle="Published more than 6 months ago — refreshing them gives Google a 'recency' boost"
            className="mb-4"
          >
            <div className="space-y-2">
              {stale.map((a) => {
                const age = Math.floor(
                  (Date.now() - new Date(a.publishedAt!).getTime()) /
                    (24 * 3600 * 1000),
                );
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 p-3 bg-surface-2 border border-border rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-text truncate">{a.title}</div>
                      <div className="text-muted text-xs mt-0.5">
                        Published {age} days ago · {a.wordCount} words
                      </div>
                    </div>
                    <form action={refreshArticleAction}>
                      <input type="hidden" name="articleId" value={a.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-bold bg-accent text-black rounded-lg whitespace-nowrap"
                      >
                        ⟳ Regenerate
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-2 text-xs mt-3">
              Regenerating re-queues the keyword and marks the existing article as
              <code className="text-text"> stale</code>. Run the site to publish the fresh version.
            </p>
          </Panel>
        );
      })()}

      {/* Per-article scorecards */}
      <Panel
        title="Per-article scorecard"
        subtitle={`${scored.length} article${scored.length === 1 ? "" : "s"} analyzed`}
      >
        {scored.length === 0 ? (
          <div className="py-10 text-center text-muted text-sm">
            No articles yet. Generate one from the site detail page.
          </div>
        ) : (
          <div className="space-y-3">
            {scored.map(({ article, card }) => (
              <ScorecardRow
                key={article.id}
                article={{
                  id: article.id,
                  title: article.title,
                  wpUrl: article.wpUrl,
                  status: article.status,
                  wordCount: article.wordCount,
                }}
                card={card}
              />
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function ScorecardRow({
  article,
  card,
}: {
  article: {
    id: number;
    title: string;
    wpUrl: string | null;
    status: string;
    wordCount: number;
  };
  card: ArticleScorecard;
}) {
  const gradeColor = {
    A: "bg-success/15 text-success border-success/30",
    B: "bg-[rgba(190,248,72,0.15)] text-accent border-accent-border",
    C: "bg-warning/15 text-warning border-warning/30",
    D: "bg-[rgba(251,146,60,0.15)] text-[#fb923c] border-[#fb923c]/30",
    F: "bg-danger/15 text-danger border-danger/30",
  }[card.letterGrade];

  return (
    <details className="bg-surface border border-border rounded-xl overflow-hidden">
      <summary className="cursor-pointer p-4 flex items-center gap-4 hover:bg-surface-2 list-none">
        <div
          className={`w-12 h-12 rounded-xl border-2 grid place-items-center font-extrabold text-lg shrink-0 ${gradeColor}`}
        >
          {card.letterGrade}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text truncate">
            <Link
              href={`/articles/${article.id}`}
              className="hover:text-accent text-text"
            >
              {article.title}
            </Link>
          </div>
          <div className="text-muted text-xs mt-0.5 flex items-center gap-3">
            <span>Score: {card.score}/100</span>
            <span>·</span>
            <span>
              {card.passed}/{card.total} checks pass
            </span>
            {card.daysLive != null ? (
              <>
                <span>·</span>
                <span>Live {card.daysLive}d</span>
              </>
            ) : null}
            <span>·</span>
            <Pill status={article.status}>{article.status}</Pill>
            {article.wpUrl ? (
              <>
                <span>·</span>
                <a
                  href={article.wpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  open ↗
                </a>
              </>
            ) : null}
          </div>
        </div>
        <div className="text-muted-2 text-xs hidden md:block">▾ expand</div>
      </summary>
      <div className="p-4 border-t border-border bg-bg-2">
        <table className="w-full text-sm">
          <tbody>
            {card.checks.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="py-2 px-2 w-8">
                  {c.pass ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-danger">✗</span>
                  )}
                </td>
                <td
                  className={`py-2 px-2 font-medium ${c.pass ? "text-text" : "text-muted"}`}
                >
                  {c.label}
                </td>
                <td className="py-2 px-2 text-muted text-xs">{c.hint}</td>
                <td className="py-2 px-2 text-muted-2 text-[0.7rem] text-right">
                  weight {c.weight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
