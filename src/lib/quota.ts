/**
 * Usage metering. Each successful article publish increments articlesUsed on
 * the single User row. We allow generation while articlesUsed < articleCredits.
 *
 * For single-admin self-hosted: there's effectively one User row, so we just
 * read/write that row. If you ever wire multi-tenant, scope everything by
 * userId.
 */
import { prisma } from "@/lib/db";

export async function getPrimaryUser() {
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function canGenerateArticle(): Promise<{ ok: boolean; reason?: string; remaining: number }> {
  const user = await getPrimaryUser();
  if (!user) return { ok: false, reason: "no user", remaining: 0 };
  const remaining = Math.max(0, user.articleCredits - user.articlesUsed);
  if (remaining <= 0) {
    return {
      ok: false,
      reason: `Out of credits on the ${user.plan} plan (${user.articlesUsed}/${user.articleCredits} used). Upgrade or wait for renewal.`,
      remaining: 0,
    };
  }
  return { ok: true, remaining };
}

export async function incrementArticleUsage(): Promise<void> {
  const user = await getPrimaryUser();
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { articlesUsed: { increment: 1 } },
  });
}
