"use client";

import { useState, useTransition } from "react";
import { draftHaroResponseAction } from "@/actions/haro";

type SiteOpt = { id: number; name: string; niche: string };

export function HaroWorkbench({ sites }: { sites: SiteOpt[] }) {
  const [siteId, setSiteId] = useState(sites[0]?.id ?? 0);
  const [queryText, setQueryText] = useState("");
  const [draft, setDraft] = useState<{ subject: string; body: string; rationale: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const submit = (fd: FormData) => {
    setError(null);
    setDraft(null);
    startTransition(async () => {
      const r = await draftHaroResponseAction(fd);
      if (!r.ok) setError(r.error ?? "draft failed");
      else setDraft(r.draft ?? null);
    });
  };

  const copy = async (t: "subject" | "body", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(t);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card-grad border border-border rounded-2xl p-5">
        <form action={submit}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Site (sets the expert voice)
          </label>
          <select
            name="siteId"
            value={siteId}
            onChange={(e) => setSiteId(Number(e.target.value))}
            className="w-full mb-4 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.niche ? `· ${s.niche}` : ""}
              </option>
            ))}
          </select>

          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Paste the reporter's query
          </label>
          <textarea
            name="queryText"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            rows={12}
            required
            placeholder={`Example:\n\nQuery from Forbes contributor:\nLooking for 3-4 founders who scaled SEO content past 1M monthly visits without paid links. Need: what worked, what didn't, one specific tactic. Deadline 3pm ET.`}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text font-mono leading-relaxed focus:outline-none focus:border-accent-border"
          />
          <button
            type="submit"
            disabled={pending || !queryText.trim()}
            className="mt-4 w-full px-4 py-2.5 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {pending ? "Drafting…" : "Draft response with Claude →"}
          </button>
          {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}
        </form>
      </div>

      <div className="bg-card-grad border border-border rounded-2xl p-5">
        {!draft ? (
          <div className="text-muted text-sm py-16 text-center">
            <div className="text-4xl mb-3">✍️</div>
            <div>Your draft will appear here.</div>
            <div className="text-xs mt-2 text-muted-2">
              200 words max · quotable lead · 1-line bio
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Subject</label>
                <button
                  type="button"
                  onClick={() => copy("subject", draft.subject)}
                  className="text-[0.65rem] font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  {copied === "subject" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text font-semibold">
                {draft.subject}
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Body</label>
                <button
                  type="button"
                  onClick={() => copy("body", draft.body)}
                  className="text-[0.65rem] font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  {copied === "body" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text whitespace-pre-wrap leading-relaxed">
                {draft.body}
              </div>
            </div>
            <div className="bg-accent-dim border border-accent-border rounded-lg p-3">
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-accent mb-1">
                Why this works
              </div>
              <div className="text-text text-xs">{draft.rationale}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
