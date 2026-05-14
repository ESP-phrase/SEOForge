"use client";

import { useState, useTransition } from "react";
import { importKeywordsAction } from "@/actions/importKeywords";

/**
 * Paste a list of keywords (one per line or CSV from Ahrefs/SEMrush/Keyword
 * Planner) — instantly queues them. No Claude / no API credentials needed.
 */
export function ManualKeywordQueue({ siteId }: { siteId: number }) {
  const [text, setText] = useState("");
  const [intent, setIntent] = useState("informational");
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [log, setLog] = useState<string[]>([]);
  const appendLog = (line: string) =>
    setLog((l) => [...l, `${new Date().toLocaleTimeString()}  ${line}`]);

  return (
    <div className="bg-card-grad border border-border rounded-2xl p-5">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className="font-bold text-text text-base">Paste keywords directly</div>
          <div className="text-muted text-xs mt-0.5">
            One per line, or CSV/TSV from Ahrefs / SEMrush / Keyword Planner. First column
            wins — volume/CPC columns are ignored.
          </div>
        </div>
        <span className="text-[0.6rem] font-extrabold uppercase tracking-wider text-accent bg-accent-dim border border-accent-border rounded px-2 py-1">
          No AI needed
        </span>
      </div>
      <form
        action={(fd: FormData) => {
          setError(null);
          setResult(null);
          const lines = String(fd.get("text") ?? "").split("\n").filter((l) => l.trim()).length;
          setLog([]);
          appendLog(`▶ Importing ${lines} lines (intent=${fd.get("intent")})`);
          const t0 = Date.now();
          startTransition(async () => {
            const r = await importKeywordsAction(fd);
            const dur = ((Date.now() - t0) / 1000).toFixed(1);
            if (!r.ok) {
              appendLog(`✗ Import failed: ${r.error ?? "unknown"}`);
              setError(r.error ?? "import failed");
            } else {
              appendLog(`✓ Done in ${dur}s · added ${r.added ?? 0} · skipped ${r.skipped ?? 0}`);
              setResult({ added: r.added ?? 0, skipped: r.skipped ?? 0 });
              setText("");
            }
          });
        }}
        className="mt-3"
      >
        <input type="hidden" name="siteId" value={siteId} />
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          required
          placeholder={`how to write a resume\nbest resume format for tech jobs\nats friendly resume tips\n...`}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text font-mono leading-relaxed focus:outline-none focus:border-accent-border"
        />
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">Intent:</label>
            <select
              name="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="bg-bg border border-border rounded-md px-2 py-1 text-xs text-text"
            >
              <option value="informational">informational</option>
              <option value="commercial">commercial</option>
              <option value="transactional">transactional</option>
              <option value="navigational">navigational</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {result ? (
              <span className="text-accent text-xs font-semibold">
                ✓ Queued {result.added} {result.skipped > 0 ? `· skipped ${result.skipped} dupes` : ""}
              </span>
            ) : error ? (
              <span className="text-red-400 text-xs">{error}</span>
            ) : null}
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {pending ? "Queuing…" : "Add to queue"}
            </button>
          </div>
        </div>
      </form>

      {log.length > 0 ? (
        <div className="mt-4 bg-bg border border-border rounded-lg p-3 font-mono text-xs">
          <div className="text-muted text-[0.6rem] uppercase tracking-wider font-bold mb-1.5">
            Activity log
          </div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {log.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("✓") ? "text-accent"
                  : line.includes("✗") ? "text-red-400"
                  : line.includes("▶") ? "text-text font-semibold"
                  : "text-muted"
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
