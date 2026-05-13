/**
 * Anchor-text classification + diversity analysis.
 *
 * Google's spam team has publicly said an over-optimized anchor profile is
 * one of the strongest signals of bought links. Healthy profile rule of thumb:
 *   branded:      30-50%   (your brand name)
 *   naked URL:    15-25%   (raw URL or click-here)
 *   generic:      15-25%   ("this article", "learn more")
 *   partial:      10-20%   (variations of target keyword)
 *   exact:         0-10%   (exact target keyword — most dangerous)
 */
export type AnchorType = "exact" | "partial" | "branded" | "generic" | "naked-url" | "image";

const GENERIC_PATTERNS = [
  /^click here$/i, /^here$/i, /^read more$/i, /^learn more$/i, /^this article$/i,
  /^this post$/i, /^this guide$/i, /^this$/i, /^link$/i, /^website$/i, /^source$/i,
  /^see this$/i, /^check it out$/i, /^visit$/i,
];

export function classifyAnchor(
  anchor: string,
  brand: string,
  targetKeyword: string,
): AnchorType {
  const a = (anchor ?? "").trim();
  if (!a) return "image";
  // Naked URL
  if (/^https?:\/\//i.test(a)) return "naked-url";
  // Generic patterns
  if (GENERIC_PATTERNS.some((p) => p.test(a))) return "generic";
  // Branded — contains the brand name (case-insensitive substring)
  const b = brand?.trim().toLowerCase();
  if (b && a.toLowerCase().includes(b)) return "branded";
  // Keyword matching
  const t = targetKeyword?.trim().toLowerCase();
  if (t) {
    if (a.toLowerCase() === t) return "exact";
    const tWords = t.split(/\s+/).filter(Boolean);
    const aLower = a.toLowerCase();
    const overlap = tWords.filter((w) => aLower.includes(w)).length;
    if (overlap >= Math.ceil(tWords.length * 0.6)) return "partial";
  }
  return "generic";
}

export type AnchorDistribution = {
  total: number;
  byType: Record<AnchorType, number>;
  pct: Record<AnchorType, number>;
  warnings: string[];
};

const HEALTHY = {
  exact: { min: 0, max: 10 },
  partial: { min: 5, max: 20 },
  branded: { min: 25, max: 55 },
  generic: { min: 10, max: 30 },
  "naked-url": { min: 10, max: 30 },
  image: { min: 0, max: 30 },
} as const;

export function analyzeDistribution(types: AnchorType[]): AnchorDistribution {
  const byType: Record<AnchorType, number> = {
    exact: 0, partial: 0, branded: 0, generic: 0, "naked-url": 0, image: 0,
  };
  for (const t of types) byType[t] += 1;
  const total = types.length || 1;
  const pct: Record<AnchorType, number> = { ...byType };
  for (const k of Object.keys(pct) as AnchorType[]) {
    pct[k] = Math.round((byType[k] / total) * 100);
  }
  const warnings: string[] = [];
  if (pct.exact > HEALTHY.exact.max) {
    warnings.push(`Exact-match anchors at ${pct.exact}% (safe range: 0–10%). High risk of penalty.`);
  }
  if (pct.branded < HEALTHY.branded.min) {
    warnings.push(`Branded anchors only ${pct.branded}% (healthy: 25–55%). Profile looks unnatural.`);
  }
  if (pct.partial > HEALTHY.partial.max) {
    warnings.push(`Partial-match at ${pct.partial}% (safe: 5–20%). Diversify with branded + naked.`);
  }
  return { total: types.length, byType, pct, warnings };
}
