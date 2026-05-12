"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function disconnectGscAction(formData: FormData) {
  const siteId = Number(formData.get("siteId"));
  if (!siteId) return;
  await prisma.site.update({
    where: { id: siteId },
    data: {
      gscRefreshTokenEnc: null,
      gscSiteUrl: null,
      gscConnectedAt: null,
    },
  });
  revalidatePath("/analytics");
  revalidatePath(`/sites/${siteId}/analytics`);
}
