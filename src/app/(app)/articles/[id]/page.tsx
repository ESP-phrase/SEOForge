import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Pill } from "@/components/Pill";
import { Card, CardTitle } from "@/components/Card";
import { Button, LinkButton } from "@/components/Button";
import {
  saveArticleHtmlAction,
  saveArticleMetaAction,
  publishDraftAction,
  deleteArticleAction,
} from "@/actions/articles";

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) notFound();
  const site = await prisma.site.findUnique({ where: { id: article.siteId } });
  if (!site) notFound();

  const { saved, published, error } = await searchParams;
  const categories = JSON.parse(article.categoriesJson) as string[];
  const tags = JSON.parse(article.tagsJson) as string[];
  type SerpSnapshot = {
    keyword: string;
    topResults: { position: number; title: string; link: string; domain: string; snippet: string }[];
    peopleAlsoAsk: string[];
    relatedSearches: string[];
    fetchedAt: string | Date;
  };
  const serp: SerpSnapshot | null = article.serpJson
    ? (JSON.parse(article.serpJson) as SerpSnapshot)
    : null;

  const saveHtml = saveArticleHtmlAction.bind(null, articleId);
  const saveMeta = saveArticleMetaAction.bind(null, articleId);
  const publishIt = publishDraftAction.bind(null, articleId);
  const removeIt = deleteArticleAction.bind(null, articleId);

  return (
    <>
      <PageHeader
        title={article.title}
        subtitle={
          <>
            <Link href={`/sites/${site.id}`}>{site.name}</Link>
            &nbsp;·&nbsp; <Pill status={article.status}>{article.status}</Pill>
            &nbsp;·&nbsp; {article.wordCount} words
            &nbsp;·&nbsp; ${article.costUsd.toFixed(4)}
            {article.wpUrl ? (
              <>
                &nbsp;·&nbsp;{" "}
                <a href={article.wpUrl} target="_blank" rel="noreferrer">
                  live ↗
                </a>
              </>
            ) : null}
          </>
        }
      />

      {saved ? (
        <div className="bg-accent-dim text-accent border border-accent-border rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          Saved.
        </div>
      ) : null}
      {published ? (
        <div className="bg-accent-dim text-accent border border-accent-border rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          Published to WordPress.
        </div>
      ) : null}
      {error ? (
        <div className="bg-[rgba(255,84,112,0.12)] text-danger border border-[rgba(255,84,112,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error.replace(/-/g, " ")}
        </div>
      ) : null}

      {serp ? (
        <Card>
          <CardTitle
            title="SERP gap analysis"
            desc={`Top ${serp.topResults.length} competitors for "${serp.keyword}" — used to steer the article`}
          />
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold py-2.5 px-3 text-left border-b border-border">#</th>
                <th className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold py-2.5 px-3 text-left border-b border-border">Domain</th>
                <th className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold py-2.5 px-3 text-left border-b border-border">Title</th>
              </tr>
            </thead>
            <tbody>
              {serp.topResults.slice(0, 8).map((r) => (
                <tr key={r.position} className="border-b border-border last:border-0">
                  <td className="py-2.5 px-3 text-muted text-xs">{r.position}</td>
                  <td className="py-2.5 px-3 text-muted text-xs whitespace-nowrap">{r.domain}</td>
                  <td className="py-2.5 px-3">
                    <a href={r.link} target="_blank" rel="noreferrer" className="text-text hover:text-accent">
                      {r.title}
                    </a>
                    <div className="text-muted text-xs mt-0.5 line-clamp-2">{r.snippet}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {serp.peopleAlsoAsk.length > 0 ? (
            <div className="mt-4">
              <div className="text-[0.7rem] uppercase tracking-wider text-muted font-semibold mb-2">
                People also ask
              </div>
              <ul className="text-sm text-text space-y-1">
                {serp.peopleAlsoAsk.slice(0, 6).map((q) => (
                  <li key={q} className="flex gap-2">
                    <span className="text-accent">·</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardTitle
          title="Meta description"
          desc={`${(article.metaDescription ?? "").length}/160`}
        />
        <form action={saveMeta} className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[24rem]">
            <input
              type="text"
              name="metaDescription"
              maxLength={200}
              defaultValue={article.metaDescription}
            />
          </div>
          <Button type="submit" variant="secondary">
            Save meta
          </Button>
        </form>
        <div className="text-muted text-xs mt-3">
          <strong className="text-text">Category:</strong> {categories.join(", ") || "—"}{" "}
          &nbsp; · &nbsp;
          <strong className="text-text">Tags:</strong> {tags.join(", ") || "—"}
        </div>
      </Card>

      <Card>
        <CardTitle
          title="HTML"
          desc="Edit before publishing — saved locally and pushed to live post if already published."
        />
        <form action={saveHtml}>
          <textarea
            name="html"
            defaultValue={article.html}
            className="!min-h-[24rem] !text-[0.85rem]"
          />
          <div className="flex gap-2 flex-wrap mt-3">
            <Button type="submit">Save changes</Button>
            <LinkButton
              href={`/articles/${article.id}/preview`}
              target="_blank"
              variant="secondary"
            >
              Preview rendered
            </LinkButton>
          </div>
        </form>

        {article.status !== "published" ? (
          <form action={publishIt} className="mt-3">
            {/* Re-submit current html with publish action */}
            <input type="hidden" name="html" value={article.html} />
            <Button type="submit">Publish to WordPress</Button>
          </form>
        ) : null}

        <form action={removeIt} className="mt-3">
          <Button type="submit" variant="danger">
            Delete article
          </Button>
        </form>
      </Card>
    </>
  );
}
