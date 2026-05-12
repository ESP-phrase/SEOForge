import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.article.findFirst({
    where: { slug, status: "published", site: { targetType: "native" } },
    select: { title: true, metaDescription: true },
  });
  if (!post) return { title: "Not found — SEOForge" };
  return {
    title: `${post.title} — SEOForge`,
    description: post.metaDescription,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.article.findFirst({
    where: { slug, status: "published", site: { targetType: "native" } },
    select: {
      title: true,
      html: true,
      metaDescription: true,
      publishedAt: true,
      wordCount: true,
      site: { select: { name: true, authorBioHtml: true } },
    },
  });
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[820px] mx-auto px-6 md:px-10 py-16">
        <Link
          href="/blog"
          className="text-muted hover:text-text text-sm no-underline mb-8 inline-block"
        >
          ← All posts
        </Link>

        <header className="mb-10 border-b border-border pb-8">
          <div className="text-muted text-xs uppercase tracking-wider mb-3">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Draft"}{" "}
            · {post.wordCount} words · ~{Math.max(1, Math.round(post.wordCount / 220))} min read
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          {post.metaDescription ? (
            <p className="text-muted text-lg mt-4 leading-relaxed">{post.metaDescription}</p>
          ) : null}
        </header>

        {/* Article HTML — already includes inline styles from anthropic.ts ARTICLE_STYLES */}
        <article
          className="seoforge-article"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.site.authorBioHtml ? (
          <div
            className="mt-12 pt-8 border-t border-border"
            dangerouslySetInnerHTML={{ __html: post.site.authorBioHtml }}
          />
        ) : null}

        <div className="mt-16 p-8 bg-card-grad border border-accent-border rounded-2xl text-center shadow-glow">
          <h3 className="text-2xl font-extrabold tracking-tight mb-2">
            This post was written by <span className="text-accent">SEOForge.</span>
          </h3>
          <p className="text-muted mb-5">
            Want articles like this published to your WordPress site on autopilot? Spin
            up your first site in under 10 minutes.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 bg-accent text-black rounded-xl text-sm font-bold no-underline"
          >
            Start free →
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
