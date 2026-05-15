import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://seoforge.org";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/pricing", "/features", "/docs", "/changelog", "/roadmap", "/privacy", "/terms"],
        disallow: ["/api/", "/dashboard", "/sites/", "/analysis", "/analytics", "/backlinks", "/billing", "/haro", "/activity", "/articles/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
