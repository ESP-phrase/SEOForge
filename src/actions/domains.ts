"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  attachDomain,
  removeDomain,
  statusFromVercel,
  isVercelConfigured,
} from "@/lib/vercel";

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, ""); // we'll let user choose www separately if they want
}

export async function attachDomainAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));

  if (!siteId) return { ok: false, error: "missing siteId" };
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain) || !domain.includes(".")) {
    return { ok: false, error: "Invalid domain. Use e.g. blog.yoursite.com" };
  }
  if (!isVercelConfigured()) {
    return {
      ok: false,
      error: "Vercel not configured. Set VERCEL_TOKEN and VERCEL_PROJECT_ID env vars.",
    };
  }

  // Check uniqueness across sites — domain can only attach to one site.
  const existing = await prisma.site.findFirst({ where: { customDomain: domain } });
  if (existing && existing.id !== siteId) {
    return { ok: false, error: "This domain is already attached to another site." };
  }

  try {
    const vd = await attachDomain(domain);
    const status = statusFromVercel(vd);
    await prisma.site.update({
      where: { id: siteId },
      data: {
        customDomain: domain,
        customDomainStatus: status,
        customDomainError: null,
        customDomainAddedAt: new Date(),
      },
    });
    revalidatePath(`/sites/${siteId}`);
    return { ok: true, status, domain };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "attach failed";
    await prisma.site.update({
      where: { id: siteId },
      data: { customDomainStatus: "error", customDomainError: msg },
    });
    return { ok: false, error: msg };
  }
}

export async function removeDomainAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site?.customDomain) return { ok: true };

  try {
    await removeDomain(site.customDomain);
  } catch (e) {
    // Continue even if Vercel doesn't have it — we still want to clear locally.
    console.warn("removeDomain failed (continuing):", e);
  }
  await prisma.site.update({
    where: { id: siteId },
    data: {
      customDomain: null,
      customDomainStatus: "none",
      customDomainError: null,
      customDomainAddedAt: null,
    },
  });
  revalidatePath(`/sites/${siteId}`);
  return { ok: true };
}
