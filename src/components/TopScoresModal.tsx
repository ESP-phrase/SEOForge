"use client";

import { useState, useEffect } from "react";

type ScoredArticle = {
  id: number;
  title: string;
  wpUrl: string | null;
  score: number;
  grade: string;
  passed: number;
  total: number;
  issues: string[];
};

/**
 * Modal showing the top-scoring published articles for a site. Pulls scored
 * data from /api/site-scores. Click outside or X to close.
 */
export function TopScoresModal({ siteId, siteName }: { siteId: number; siteName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ScoredArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (items !== null) return;
    setLoading(true);
    fetch(`/api/site-scores?siteId=${siteId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<{ articles: ScoredArticle[] }>;
      })
      .then((j) => setItems(j.articles))
      .catch((e) => setError(e?.message ?? "failed to load"))
      .finally(() => setLoading(false));
  }, [open, items, siteId]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-semibold text-text hover:bg-surface-2 transition-colors"
      >
        🏆 Top scores →
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-bg border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between p-5 border-b border-border">
              <div>
                <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-accent mb-0.5">
                  Top scoring articles
                </div>
                <h2 className="text-xl font-extrabold text-text">{siteName}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text text-2xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="text-muted text-sm text-center py-12">
                  Scoring articles…
                </div>
              ) : error ? (
                <div className="text-red-400 text-sm">{error}</div>
              ) : items && items.length === 0 ? (
                <div className="text-muted text-sm text-center py-12">
                  No published articles yet. Run a few first.
                </div>
              ) : items ? (
                <div className="space-y-3">
                  {items.map((a, i) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-4 p-4 bg-card-grad border border-border rounded-xl"
                    >
                      <div className="shrink-0 text-center">
                        <div
                          className="w-14 h-14 rounded-xl grid place-items-center text-2xl font-extrabold"
                          style={{
                            background:
                              a.grade === "A"
                                ? "rgba(34,197,94,0.2)"
                                : a.grade === "B"
                                  ? "rgba(14,165,233,0.2)"
                                  : a.grade === "C"
                                    ? "rgba(245,158,11,0.2)"
                                    : "rgba(239,68,68,0.2)",
                            color:
                              a.grade === "A"
                                ? "#22c55e"
                                : a.grade === "B"
                                  ? "#0ea5e9"
                                  : a.grade === "C"
                                    ? "#f59e0b"
                                    : "#ef4444",
                          }}
                        >
                          {a.grade}
                        </div>
                        <div className="text-muted text-[0.65rem] mt-1 font-bold uppercase tracking-wider">
                          #{i + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <div className="font-bold text-text text-sm truncate">{a.title}</div>
                          <div className="text-accent font-bold text-sm shrink-0">
                            {a.score}/100
                          </div>
                        </div>
                        <div className="text-muted text-xs mb-2">
                          {a.passed}/{a.total} on-page checks passed
                        </div>
                        {a.issues.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {a.issues.slice(0, 4).map((issue, j) => (
                              <span
                                key={j}
                                className="text-[0.65rem] px-2 py-0.5 bg-surface-2 border border-border rounded text-muted"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-accent text-xs font-semibold">
                            ✓ All checks passed
                          </span>
                        )}
                        {a.wpUrl ? (
                          <a
                            href={a.wpUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-2 text-accent text-xs font-semibold hover:underline"
                          >
                            View live →
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-border bg-surface-2 flex items-center justify-between">
              <span className="text-muted text-xs">
                Scored on 12 weighted on-page SEO checks. Updated live.
              </span>
              <a
                href={`/sites/${siteId}/analysis`}
                className="text-accent text-xs font-bold hover:underline no-underline"
              >
                Full analysis →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
