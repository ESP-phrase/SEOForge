/**
 * Returns the top-scoring published articles for a site, ranked by score
 * descending. Used by <TopScoresModal>.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreArticle } from "@/lib/seoScore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const siteId = Number(req.nextUrl.searchParams.get("siteId"));
  if (!siteId) return NextResponse.json({ error: "missing siteId" }, { status: 400 });

  const articles = await prisma.article.findMany({
    where: { siteId, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const scored = articles
    .map((a) => {
      const card = scoreArticle(a);
      const failing = card.checks.filter((c) => !c.pass);
      return {
        id: a.id,
        title: a.title,
        wpUrl: a.wpUrl,
        score: card.score,
        grade: card.letterGrade,
        passed: card.passed,
        total: card.total,
        issues: failing.map((c) => c.label),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json({ articles: scored });
}
