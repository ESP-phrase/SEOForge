"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Queue an existing article for re-generation by resetting its keyword back to
 * "queued" and marking the article as stale. The runner will then pick it up
 * on the next run, generate fresh content, and re-publish.
 *
 * Conservative: doesn't delete the old article, just flips status so the user
 * can compare. The re-publish path could be extended to update wpPostId in
 * place rather than create a new WP post.
 */
export async function refreshArticleAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const articleId = Number(formData.get("articleId"));
  if (!articleId) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, siteId: true, keywordId: true },
  });
  if (!article) return;

  await prisma.keyword.update({
    where: { id: article.keywordId },
    data: { status: "queued", processedAt: null },
  });
  await prisma.article.update({
    where: { id: articleId },
    data: { status: "stale" },
  });

  revalidatePath(`/sites/${article.siteId}`);
  revalidatePath(`/sites/${article.siteId}/analysis`);
}
