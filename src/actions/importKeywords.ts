"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Bulk keyword import from a paid-tool CSV/paste (Ahrefs, SEMrush, Keyword
 * Planner, Moz). Forgiving parser:
 *   - one keyword per line (simplest)
 *   - CSV/TSV: assumes first column is the keyword, ignores all other cols
 *   - skips header rows containing 'keyword' / 'volume' / 'cpc'
 *   - dedupes within the paste + against existing keywords
 */
export async function importKeywordsAction(formData: FormData): Promise<{
  ok: boolean;
  added?: number;
  skipped?: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const text = String(formData.get("text") ?? "").trim();
  const intent = String(formData.get("intent") ?? "informational");
  if (!siteId || !text) return { ok: false, error: "missing siteId or text" };

  const tag = `[import:site=${siteId}]`;
  const t0 = Date.now();
  const linesTotal = text.split("\n").filter((l) => l.trim()).length;
  console.log(`${tag} ▶ import started · ${linesTotal} lines · intent=${intent}`);

  // Detect delimiter
  const firstLine = text.split("\n").find((l) => l.trim()) ?? "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.includes(",") ? "," : null;

  const seen = new Set<string>();
  let added = 0;
  let skipped = 0;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let kw = sep ? line.split(sep)[0] : line;
    kw = kw.trim().replace(/^"|"$/g, "").toLowerCase();
    if (!kw) { skipped += 1; continue; }
    // Skip header rows
    if (/^(keyword|kw|query|search.term|term)$/i.test(kw)) { skipped += 1; continue; }
    if (seen.has(kw)) { skipped += 1; continue; }
    seen.add(kw);
    try {
      await prisma.keyword.create({
        data: { siteId, keyword: kw, intent, status: "queued" },
      });
      added += 1;
      console.log(`${tag}   ✓ queued: ${kw}`);
    } catch {
      skipped += 1;
      console.log(`${tag}   ⊘ dup:    ${kw}`);
    }
  }
  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`${tag} ✓ done · added=${added} skipped=${skipped} · ${dur}s`);
  revalidatePath(`/sites/${siteId}/cluster`);
  revalidatePath(`/sites/${siteId}`);
  return { ok: true, added, skipped };
}
