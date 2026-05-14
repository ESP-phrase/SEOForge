"use client";

import { useState, useTransition } from "react";
import { runSingleAction } from "@/actions/runs";
import { Button } from "@/components/Button";
import type { RunResult } from "@/lib/runner";

export function RunWidget({ siteId }: { siteId: number }) {
  const [count, setCount] = useState(1);
  const [dryRun, setDryRun] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);
  const [, startTransition] = useTransition();

  const [currentLabel, setCurrentLabel] = useState<string>("");

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setResults([]);
    const collected: RunResult[] = [];
    for (let i = 0; i < count; i++) {
      setCurrentLabel(`Generating article ${i + 1} of ${count}…`);
      const r = await runSingleAction(siteId, dryRun);
      collected.push(r);
      setResults([...collected]);
      if (!r.ok) break;
    }
    setCurrentLabel("");
    setRunning(false);
    startTransition(() => {
      window.location.hash = `run-${Date.now()}`;
    });
  }

  const pct = count > 0 ? Math.round((results.length / count) * 100) : 0;
  const totalCost = results.reduce((s, r) => s + (r.costUsd ?? 0), 0);
  const okCount = results.filter((r) => r.ok).length;

  return (
    <div>
      <form onSubmit={handleRun} className="flex gap-3 flex-wrap items-end">
        <div className="w-24">
          <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3 mb-1.5">
            Count
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            disabled={running}
          />
        </div>
        <div className="flex gap-4 pb-2">
          <label className="inline-flex items-center gap-1.5 text-sm text-text">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={running}
              className="!w-auto !p-0 accent-accent"
            />
            Dry run
          </label>
        </div>
        <div className="pb-1">
          <Button type="submit" disabled={running}>
            {running
              ? `Running ${results.length}/${count} · ${pct}%`
              : `Run ${count} article${count === 1 ? "" : "s"}`}
          </Button>
        </div>
      </form>

      {(running || results.length > 0) ? (
        <div className="mt-5">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text font-semibold">
                {running ? currentLabel : `Done · ${okCount}/${count} succeeded`}
              </span>
              <span className="text-muted">
                {results.length}/{count}{totalCost > 0 ? ` · $${totalCost.toFixed(3)}` : ""}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            {running ? (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                Claude is writing… typical 25-45s per article
              </div>
            ) : null}
          </div>

          <h4 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">
            Run log
          </h4>
          <div className="border border-border rounded-lg overflow-hidden">
            {results.map((r, i) => (
              <div
                key={i}
                className="px-3 py-2 text-sm border-b border-border last:border-b-0 flex justify-between gap-3"
              >
                <span className="font-mono text-xs text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  {summarize(r)}
                </span>
                <span className={`text-xs font-semibold ${r.ok ? "text-accent" : "text-danger"}`}>
                  {r.ok ? "ok" : "fail"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function summarize(r: RunResult): string {
  if (r.skipped) return `skipped: ${r.skipped}`;
  if (r.error) return `${r.keyword ?? "?"}: ${r.error}`;
  const bits = [r.keyword ?? "?", r.title ?? ""].filter(Boolean);
  if (r.dryRun) bits.push("(dry-run)");
  if (r.wpUrl) bits.push(`→ ${r.wpUrl}`);
  if (r.qualityWarning) bits.push(`⚠ ${r.qualityWarning}`);
  if (r.costUsd != null) bits.push(`$${r.costUsd.toFixed(3)}`);
  return bits.join(" · ");
}
