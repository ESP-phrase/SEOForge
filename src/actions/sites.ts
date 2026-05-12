"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { testConnection } from "@/lib/wordpress";

function getColor(form: FormData, key: string, fallback: string): string {
  const raw = String(form.get(key) ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "site"
  );
}

function getInt(form: FormData, key: string, fallback: number): number {
  const v = Number(form.get(key));
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

export async function createSiteAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const targetType = String(formData.get("targetType") ?? "wordpress");
  const wpUrl = String(formData.get("wpUrl") ?? "").trim();
  const wpUsername = String(formData.get("wpUsername") ?? "").trim();
  const password = String(formData.get("wpAppPassword") ?? "").trim();

  if (!name) {
    redirect(`/sites/new?error=${encodeURIComponent("Name is required.")}`);
  }
  if (targetType === "wordpress" && (!wpUrl || !wpUsername || !password)) {
    redirect(
      `/sites/new?error=${encodeURIComponent(
        "WordPress sites require URL, username, and application password.",
      )}`,
    );
  }

  try {
    const site = await prisma.site.create({
      data: {
        slug,
        name,
        targetType: targetType === "native" ? "native" : "wordpress",
        wpUrl: targetType === "native" ? "" : wpUrl,
        wpUsername: targetType === "native" ? "" : wpUsername,
        wpAppPasswordEnc: targetType === "native" ? "" : encrypt(password),
        niche: String(formData.get("niche") ?? "").trim(),
        audience: String(formData.get("audience") ?? "").trim(),
        expertVoice: String(formData.get("expertVoice") ?? "").trim(),
        authorBioHtml: String(formData.get("authorBioHtml") ?? "").trim(),
        ctaHtml: String(formData.get("ctaHtml") ?? "").trim(),
        maxPerDay: getInt(formData, "maxPerDay", 2),
        minWordCount: getInt(formData, "minWordCount", 1000),
        publishStatus: String(formData.get("publishStatus") ?? "draft"),
        themeAccent: getColor(formData, "themeAccent", "#0ea5e9"),
        themeAccent2: getColor(formData, "themeAccent2", "#f59e0b"),
        themeAccent3: getColor(formData, "themeAccent3", "#22c55e"),
        themeAccent4: getColor(formData, "themeAccent4", "#a855f7"),
      },
    });
    revalidatePath("/");
    redirect(`/sites/${site.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      redirect(`/sites/new?error=${encodeURIComponent("Slug already in use.")}`);
    }
    throw e;
  }
}

export async function updateSiteAction(siteId: number, formData: FormData) {
  const targetType = String(formData.get("targetType") ?? "wordpress");
  const isNative = targetType === "native";
  const data: Record<string, unknown> = {
    name: String(formData.get("name") ?? "").trim(),
    slug: slugify(String(formData.get("slug") ?? "") || String(formData.get("name") ?? "")),
    targetType: isNative ? "native" : "wordpress",
    wpUrl: isNative ? "" : String(formData.get("wpUrl") ?? "").trim(),
    wpUsername: isNative ? "" : String(formData.get("wpUsername") ?? "").trim(),
    niche: String(formData.get("niche") ?? "").trim(),
    audience: String(formData.get("audience") ?? "").trim(),
    expertVoice: String(formData.get("expertVoice") ?? "").trim(),
    authorBioHtml: String(formData.get("authorBioHtml") ?? "").trim(),
    ctaHtml: String(formData.get("ctaHtml") ?? "").trim(),
    maxPerDay: getInt(formData, "maxPerDay", 2),
    minWordCount: getInt(formData, "minWordCount", 1000),
    publishStatus: String(formData.get("publishStatus") ?? "draft"),
    active: formData.get("active") === "1",
    themeAccent: getColor(formData, "themeAccent", "#0ea5e9"),
    themeAccent2: getColor(formData, "themeAccent2", "#f59e0b"),
    themeAccent3: getColor(formData, "themeAccent3", "#22c55e"),
    themeAccent4: getColor(formData, "themeAccent4", "#a855f7"),
  };
  if (isNative) {
    data.wpAppPasswordEnc = "";
  } else {
    const newPassword = String(formData.get("wpAppPassword") ?? "").trim();
    if (newPassword) data.wpAppPasswordEnc = encrypt(newPassword);
  }

  await prisma.site.update({ where: { id: siteId }, data });
  revalidatePath("/");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}

export async function deleteSiteAction(siteId: number) {
  await prisma.site.delete({ where: { id: siteId } });
  revalidatePath("/");
  redirect("/");
}

export async function testWordPressAction(siteId: number) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, message: "site not found" };
  return testConnection({
    wpUrl: site.wpUrl,
    wpUsername: site.wpUsername,
    wpAppPasswordEnc: site.wpAppPasswordEnc,
  });
}
