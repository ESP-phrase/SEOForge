/**
 * SerpApi integration — fetches the top organic results for a keyword and
 * caches the response in the database to avoid burning through the free
 * tier. The article generator uses this output as a "competitive landscape"
 * input so Claude can write something demonstrably better than what already
 * ranks.
 */
import { prisma } from "@/lib/db";

const ENDPOINT = "https://serpapi.com/search.json";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SerpResult = {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet: string;
};

export type SerpAnalysis = {
  keyword: string;
  topResults: SerpResult[];
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  cached: boolean;
  fetchedAt: Date;
};

function domainOf(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

type RawSerp = {
  organic_results?: Array<{
    position?: number;
    title?: string;
    link?: string;
    snippet?: string;
  }>;
  related_questions?: Array<{ question?: string }>;
  related_searches?: Array<{ query?: string }>;
};

function shape(raw: RawSerp, keyword: string, fetchedAt: Date, cached: boolean): SerpAnalysis {
  const organic = raw.organic_results ?? [];
  const topResults: SerpResult[] = organic.slice(0, 10).map((r, i) => ({
    position: r.position ?? i + 1,
    title: r.title ?? "",
    link: r.link ?? "",
    domain: domainOf(r.link ?? ""),
    snippet: r.snippet ?? "",
  }));
  return {
    keyword,
    topResults,
    peopleAlsoAsk: (raw.related_questions ?? [])
      .map((q) => q.question ?? "")
      .filter(Boolean),
    relatedSearches: (raw.related_searches ?? [])
      .map((s) => s.query ?? "")
      .filter(Boolean),
    cached,
    fetchedAt,
  };
}

export async function fetchSerp(keyword: string): Promise<SerpAnalysis | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return null;

  const normalised = keyword.trim().toLowerCase();
  const cached = await prisma.serpCache.findUnique({
    where: { keyword: normalised },
  });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    try {
      const raw = JSON.parse(cached.json) as RawSerp;
      return shape(raw, normalised, cached.fetchedAt, true);
    } catch {
      // fall through to refetch
    }
  }

  const params = new URLSearchParams({
    engine: "google",
    q: normalised,
    api_key: apiKey,
    num: "10",
    hl: "en",
    gl: "us",
  });
  const resp = await fetch(`${ENDPOINT}?${params}`, { cache: "no-store" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SerpApi failed (${resp.status}): ${text.slice(0, 200)}`);
  }
  const raw = (await resp.json()) as RawSerp;
  const fetchedAt = new Date();
  await prisma.serpCache.upsert({
    where: { keyword: normalised },
    create: { keyword: normalised, json: JSON.stringify(raw), fetchedAt },
    update: { json: JSON.stringify(raw), fetchedAt },
  });

  return shape(raw, normalised, fetchedAt, false);
}

/**
 * Render the SERP analysis as a compact prompt-context block for Claude.
 * Returns null if no SerpApi key was configured (so generation degrades
 * gracefully).
 */
export function serpToPromptContext(analysis: SerpAnalysis | null): string | null {
  if (!analysis) return null;
  const top = analysis.topResults.slice(0, 5);
  if (top.length === 0) return null;

  const lines: string[] = ["## Current top search results for this keyword"];
  for (const r of top) {
    lines.push(
      `- #${r.position} (${r.domain}) "${r.title}" — ${r.snippet.replace(/\s+/g, " ").slice(0, 220)}`,
    );
  }
  if (analysis.peopleAlsoAsk.length > 0) {
    lines.push("\n## People also ask");
    for (const q of analysis.peopleAlsoAsk.slice(0, 6)) {
      lines.push(`- ${q}`);
    }
  }
  if (analysis.relatedSearches.length > 0) {
    lines.push("\n## Related searches");
    lines.push(analysis.relatedSearches.slice(0, 8).join(", "));
  }
  lines.push("");
  lines.push(
    "Write something that BEATS these results. Cover what they cover, plus add: " +
      "concrete examples, specific numbers, edge cases, an opinionated take, and at " +
      "least one angle they all miss. Address every People-also-ask question naturally " +
      "in the FAQ. Do not copy phrases from the snippets.",
  );
  return lines.join("\n");
}
