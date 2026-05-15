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
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { articlesUsed: { increment: 1 } },
    select: { email: true, articlesUsed: true, articleCredits: true, plan: true },
  });
  // Fire low-credit warning email once at the 80% threshold (only on the
  // exact tick that crosses it, so we don't spam every subsequent article).
  const prev = updated.articlesUsed - 1;
  const threshold = Math.ceil(updated.articleCredits * 0.8);
  if (prev < threshold && updated.articlesUsed >= threshold && updated.email) {
    const { sendLowCreditEmail } = await import("@/lib/email");
    void sendLowCreditEmail(
      updated.email,
      updated.articlesUsed,
      updated.articleCredits,
      updated.plan,
    );
  }
}
