const PILL_STYLES: Record<string, string> = {
  queued: "bg-[rgba(251,191,36,0.14)] text-warning",
  published: "bg-[rgba(74,222,128,0.14)] text-success",
  publish: "bg-[rgba(74,222,128,0.14)] text-success",
  draft: "bg-accent-dim text-accent",
  processing: "bg-accent-dim text-accent",
  failed: "bg-[rgba(248,113,113,0.14)] text-danger",
  publish_failed: "bg-[rgba(248,113,113,0.14)] text-danger",
  needs_review: "bg-[rgba(96,165,250,0.14)] text-info",
  "needs-review": "bg-[rgba(96,165,250,0.14)] text-info",
  dry_run: "bg-surface-2 text-muted",
  active: "bg-[rgba(74,222,128,0.14)] text-success",
  inactive: "bg-[rgba(248,113,113,0.14)] text-danger",
};

export function Pill({ status, children }: { status: string; children?: React.ReactNode }) {
  const cls = PILL_STYLES[status] ?? "bg-surface-2 text-muted";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold ${cls}`}
    >
      {children ?? status}
    </span>
  );
}
