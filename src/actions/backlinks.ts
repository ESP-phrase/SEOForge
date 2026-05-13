"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyAnchor } from "@/lib/anchorText";

/**
 * Bulk-import inbound backlinks. Accepts CSV/TSV text with columns:
 *   source_url, anchor_text, target_url [, rel]
 * Or one URL per line (anchor = "", target = site root).
 *
 * Each row is upserted by (siteId, sourceUrl, targetUrl). Duplicates within
 * the same import are folded automatically.
 */
function parseHost(u: string): string {
  try {
    return new URL(u).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function importBacklinksAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const text = String(formData.get("text") ?? "").trim();
  if (!siteId || !text) return { ok: false, error: "missing siteId or text" };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, error: "site not found" };

  // Detect delimiter: tab > comma > whitespace
  const sample = text.split("\n").find((l) => l.trim()) ?? "";
  const sep = sample.includes("\t") ? "\t" : sample.includes(",") ? "," : null;

  let inserted = 0;
  let skipped = 0;
  const targetKeyword = (site.niche || site.name).split(/[,;|]/)[0].trim();

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let sourceUrl = "";
    let anchorText = "";
    let targetUrl = site.wpUrl || site.customDomain || "";
    let rel = "";

    if (sep) {
      const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      sourceUrl = cols[0] ?? "";
      anchorText = cols[1] ?? "";
      targetUrl = cols[2] ?? targetUrl;
      rel = cols[3] ?? "";
      // Skip header row
      if (/source/i.test(sourceUrl) && /anchor/i.test(anchorText)) continue;
    } else {
      sourceUrl = line;
    }
    if (!sourceUrl || !sourceUrl.startsWith("http")) {
      skipped += 1;
      continue;
    }
    const sourceDomain = parseHost(sourceUrl);
    if (!sourceDomain) {
      skipped += 1;
      continue;
    }
    const anchorType = classifyAnchor(anchorText, site.name, targetKeyword);
    try {
      await prisma.backlink.upsert({
        where: { siteId_sourceUrl_targetUrl: { siteId, sourceUrl, targetUrl } },
        update: { anchorText, anchorType, rel },
        create: { siteId, sourceUrl, sourceDomain, anchorText, targetUrl, anchorType, rel },
      });
      inserted += 1;
    } catch {
      skipped += 1;
    }
  }

  revalidatePath(`/sites/${siteId}/backlinks`);
  revalidatePath(`/sites/${siteId}/anchors`);
  return { ok: true, inserted, skipped };
}
