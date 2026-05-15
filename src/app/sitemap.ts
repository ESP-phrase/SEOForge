import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

/**
 * Auto-generated sitemap.xml at https://seoforge.org/sitemap.xml
 * Includes marketing pages + every published native-blog article.
 *
 * Notes:
 * - WordPress-target articles are NOT included here (they live on the
 *   customer's WP install with its own sitemap).
 * - lastModified pulled from publishedAt; priority weighted by recency.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://seoforge.org";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/features`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/docs`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/changelog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/roadmap`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const posts = await prisma.article.findMany({
      where: { status: "published", site: { targetType: "native" } },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 2000,
    });
    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...blogRoutes];
  } catch {
    // DB unavailable during build — return static routes only.
    return staticRoutes;
  }
}
