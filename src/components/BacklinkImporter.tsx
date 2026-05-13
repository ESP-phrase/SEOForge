"use client";

import { useState, useTransition } from "react";
import { importBacklinksAction } from "@/actions/backlinks";

export function BacklinkImporter({ siteId }: { siteId: number }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-card-grad border border-border rounded-2xl p-5">
      <h3 className="text-base font-bold mb-1">Import backlinks</h3>
      <p className="text-muted text-sm mb-4">
        Paste CSV/TSV with columns <code className="text-text">source_url, anchor_text, target_url, rel</code>{" "}
        — or just one URL per line. Works with Ahrefs &quot;Backlinks&quot; export, Moz Link Explorer,
        or GSC Performance &gt; Links.
      </p>
      <form
        action={(fd: FormData) => {
          setError(null);
          setResult(null);
          startTransition(async () => {
            const r = await importBacklinksAction(fd);
            if (!r.ok) setError(r.error ?? "import failed");
            else {
              setResult({ inserted: r.inserted ?? 0, skipped: r.skipped ?? 0 });
              setText("");
            }
          });
        }}
      >
        <input type="hidden" name="siteId" value={siteId} />
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          required
          placeholder={`source_url,anchor_text,target_url,rel\nhttps://blog.example.com/best-tools,SEOForge,https://seoforge.org/,dofollow\nhttps://niche-site.com/list,check this out,https://seoforge.org/blog/cluster-planning,dofollow`}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent-border"
        />
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="text-muted text-xs">
            {result ? (
              <span className="text-accent font-semibold">
                ✓ Imported {result.inserted} · skipped {result.skipped}
              </span>
            ) : error ? (
              <span className="text-red-400">{error}</span>
            ) : (
              "Anchor types will be classified automatically."
            )}
          </div>
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {pending ? "Importing…" : "Import"}
          </button>
        </div>
      </form>
    </div>
  );
}
