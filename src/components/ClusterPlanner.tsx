"use client";

import { useState, useTransition } from "react";
import { generateClusterAction, saveClusterAction, type ClusterPlan } from "@/actions/cluster";
import { runSingleAction } from "@/actions/runs";

const INTENT_COLOR: Record<string, string> = {
  informational: "#0ea5e9",
  commercial: "#f59e0b",
  transactional: "#22c55e",
  navigational: "#a855f7",
};

export function ClusterPlanner({
  siteId,
  siteName,
  siteNiche,
}: {
  siteId: number;
  siteName: string;
  siteNiche?: string;
}) {
  const defaultTopic = (siteNiche || siteName || "").trim();
  const [pillarTopic, setPillarTopic] = useState("");
  const [plan, setPlan] = useState<ClusterPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ added: number; skipped: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const [saving, startSaving] = useTransition();
  const [autoStatus, setAutoStatus] = useState<string | null>(null);
  const [autoPending, startAuto] = useTransition();
  const [runResult, setRunResult] = useState<{ ok: boolean; title?: string; wpUrl?: string; error?: string; skipped?: string } | null>(null);
  const [runPending, startRun] = useTransition();

  const runNext = () => {
    setRunResult(null);
    startRun(async () => {
      const r = await runSingleAction(siteId, false);
      setRunResult(r as never);
    });
  };

  const [log, setLog] = useState<string[]>([]);
  const appendLog = (line: string) =>
    setLog((l) => [...l, `${new Date().toLocaleTimeString()}  ${line}`]);

  const generate = (fd: FormData) => {
    setError(null);
    setPlan(null);
    setSaved(null);
    setLog([]);
    const topic = String(fd.get("pillarTopic") ?? "");
    appendLog(`▶ Sending pillar "${topic}" to Claude…`);
    const t0 = Date.now();
    startTransition(async () => {
      const r = await generateClusterAction(fd);
      const dur = ((Date.now() - t0) / 1000).toFixed(1);
      if (!r.ok) {
        appendLog(`✗ Error after ${dur}s: ${r.error ?? "generate failed"}`);
        setError(r.error ?? "generate failed");
      } else {
        appendLog(`✓ Claude returned a plan in ${dur}s · ${r.plan?.articles.length ?? 0} articles`);
        if (r.plan?.pillar_title) appendLog(`   Pillar: "${r.plan.pillar_title}"`);
        setPlan(r.plan ?? null);
      }
    });
  };

  const save = () => {
    if (!plan) return;
    appendLog(`▶ Queuing ${plan.articles.length} keywords…`);
    const fd = new FormData();
    fd.set("siteId", String(siteId));
    fd.set("plan", JSON.stringify(plan));
    startSaving(async () => {
      const r = await saveClusterAction(fd);
      if (!r.ok) {
        appendLog(`✗ Save failed: ${r.error ?? "unknown"}`);
        setError(r.error ?? "save failed");
      } else {
        appendLog(`✓ Queued ${r.added ?? 0} · skipped ${r.skipped ?? 0} dupes`);
        setSaved({ added: r.added ?? 0, skipped: r.skipped ?? 0 });
      }
    });
  };

  // One-click "do it all" — pick a topic from the site niche, generate, queue.
  const autoRun = () => {
    setError(null);
    setSaved(null);
    setPlan(null);
    setLog([]);
    const topic = defaultTopic || siteName;
    appendLog(`▶ Auto-running for pillar "${topic}"`);
    appendLog(`   Step 1/2: Asking Claude to design the cluster…`);
    setAutoStatus("Planning cluster with Claude…");
    const t0 = Date.now();
    startAuto(async () => {
      const fd = new FormData();
      fd.set("siteId", String(siteId));
      fd.set("pillarTopic", topic);
      const r = await generateClusterAction(fd);
      const dur1 = ((Date.now() - t0) / 1000).toFixed(1);
      if (!r.ok || !r.plan) {
        appendLog(`✗ Plan failed after ${dur1}s: ${r.error ?? "generate failed"}`);
        setError(r.error ?? "generate failed");
        setAutoStatus(null);
        return;
      }
      appendLog(`✓ Plan ready in ${dur1}s · ${r.plan.articles.length} articles`);
      appendLog(`   Pillar: "${r.plan.pillar_title}"`);
      setPlan(r.plan);
      appendLog(`   Step 2/2: Queuing keywords…`);
      setAutoStatus("Queuing keywords…");
      const sfd = new FormData();
      sfd.set("siteId", String(siteId));
      sfd.set("plan", JSON.stringify(r.plan));
      const sr = await saveClusterAction(sfd);
      if (!sr.ok) {
        appendLog(`✗ Queue failed: ${sr.error ?? "save failed"}`);
        setError(sr.error ?? "save failed");
        setAutoStatus(null);
        return;
      }
      appendLog(`✓ Queued ${sr.added ?? 0} · skipped ${sr.skipped ?? 0} dupes`);
      appendLog(`▶ Done. Hit "Run now" on the Overview tab to publish the first one.`);
      setSaved({ added: sr.added ?? 0, skipped: sr.skipped ?? 0 });
      setAutoStatus(null);
    });
  };

  return (
    <>
      {/* One-click magic */}
      <div className="bg-card-grad border-2 border-accent rounded-2xl p-5 mb-4 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="text-3xl">✨</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-text">Generate &amp; queue for me</div>
            <div className="text-muted text-xs mt-0.5">
              Uses <span className="text-text">{defaultTopic || siteName}</span> as the
              pillar. One click → 12 articles queued, all internally linked.
            </div>
          </div>
          <button
            onClick={autoRun}
            disabled={autoPending}
            className="px-5 py-2.5 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50 whitespace-nowrap"
          >
            {autoPending ? autoStatus ?? "Working…" : "Do it →"}
          </button>
        </div>
        {saved && autoStatus === null ? (
          <div className="mt-3 text-accent text-sm font-semibold">
            ✓ Queued {saved.added} {saved.skipped > 0 ? `· skipped ${saved.skipped} dupes` : ""}
          </div>
        ) : null}
      </div>

      <div className="text-center text-muted text-xs uppercase tracking-wider font-bold my-3">
        — or pick your own topic —
      </div>

      <div className="bg-card-grad border border-border rounded-2xl p-5 mb-4">
        <form action={generate} className="flex flex-col sm:flex-row gap-3 items-end">
          <input type="hidden" name="siteId" value={siteId} />
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Pillar topic
            </label>
            <input
              name="pillarTopic"
              value={pillarTopic}
              onChange={(e) => setPillarTopic(e.target.value)}
              required
              placeholder="e.g. 'how to write a resume that gets interviews' or 'AI SEO automation for niche sites'"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-border"
            />
            <p className="text-muted text-xs mt-1.5">
              {siteName} · Claude will design a 11–13 article cluster around this topic
            </p>
          </div>
          <button
            type="submit"
            disabled={pending || !pillarTopic.trim()}
            className="px-5 py-2.5 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50 whitespace-nowrap"
          >
            {pending ? "Planning…" : "Plan cluster →"}
          </button>
        </form>
        {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}
      </div>

      {/* Live progress log */}
      {log.length > 0 ? (
        <div className="bg-bg border border-border rounded-2xl p-4 mb-4 font-mono text-xs">
          <div className="text-muted text-[0.65rem] uppercase tracking-wider font-bold mb-2">
            Activity log
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
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

      {plan ? (
        <>
          <div className="bg-card-grad border border-accent-border rounded-2xl p-5 mb-4 shadow-glow">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-accent mb-1">
                  Pillar article
                </div>
                <h2 className="text-xl font-extrabold text-text">{plan.pillar_title}</h2>
                <div className="text-muted text-sm mt-1">
                  Target keyword: <code className="text-text">{plan.pillar_keyword}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {plan.articles
              .map((a, i) => ({ a, i }))
              .filter(({ a }) => a.role === "cluster")
              .map(({ a, i }) => (
                <div
                  key={i}
                  className="bg-card-grad border border-border rounded-xl p-4 hover:border-accent-border transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: INTENT_COLOR[a.intent] }}
                    />
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">
                      {a.intent}
                    </span>
                    <span className="text-muted-2 text-[0.6rem] ml-auto">#{i + 1}</span>
                  </div>
                  <div className="font-bold text-text text-sm mb-1.5 leading-snug">{a.title}</div>
                  <div className="text-muted text-xs mb-2">
                    <code className="text-text">{a.keyword}</code>
                  </div>
                  <div className="text-muted-2 text-[0.65rem] uppercase tracking-wider">
                    Links to: {a.links_to.length === 0 ? "—" : a.links_to.map((idx) => `#${idx + 1}`).join(", ")}
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-card-grad border border-border rounded-2xl p-5 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-text font-semibold text-sm">Add to keyword queue?</div>
              <div className="text-muted text-xs mt-0.5">
                {plan.articles.length} articles will queue up as keywords. SEOForge will
                generate + internally link them as you publish.
              </div>
            </div>
            {saved ? (
              <span className="text-accent font-bold text-sm">
                ✓ Queued {saved.added} {saved.skipped > 0 ? `· skipped ${saved.skipped} dupes` : ""}
              </span>
            ) : (
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {saving ? "Saving…" : "Add all to queue"}
              </button>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
