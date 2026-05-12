import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — SEOForge",
  description: "Strategy, engineering notes, and operator playbooks from the SEOForge team.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.article.findMany({
    where: {
      status: "published",
      site: { targetType: "native" },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      metaDescription: true,
      publishedAt: true,
      wordCount: true,
    },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-5">
            The SEOForge Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Operator notes from <span className="text-accent">the trenches.</span>
          </h1>
          <p className="text-muted text-lg mt-4 max-w-xl mx-auto">
            Strategy, engineering, and field reports from running SEO content at scale —
            every post was generated and published by SEOForge itself.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-card-grad border border-border rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold mb-2">No posts yet</h2>
            <p className="text-muted text-sm">
              Add a native-target site in the dashboard, queue a few keywords, and the
              first post will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block bg-card-grad border border-border rounded-2xl p-6 hover:border-accent-border transition-colors no-underline"
              >
                <div className="text-muted text-xs uppercase tracking-wider mb-2">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Draft"}{" "}
                  · {p.wordCount} words
                </div>
                <h2 className="text-xl font-bold text-text mb-2 leading-snug">{p.title}</h2>
                <p className="text-muted text-sm leading-relaxed">{p.metaDescription}</p>
                <div className="text-accent text-sm font-semibold mt-4">Read →</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
