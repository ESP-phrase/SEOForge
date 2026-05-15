"use client";

import { useState } from "react";

export function CopyRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (compact) {
    return (
      <div className="bg-surface-2 border border-border rounded-lg p-2">
        <div className="text-muted-2 text-[0.6rem] uppercase tracking-wider font-bold mb-1">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={value}
            className="flex-1 min-w-0 bg-transparent text-text text-xs font-mono truncate focus:outline-none"
          />
          <button
            onClick={copy}
            className="text-[0.6rem] uppercase tracking-wider font-bold text-accent shrink-0"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2.5">
      <span className="text-muted-2 text-[0.65rem] uppercase tracking-wider font-bold shrink-0">
        {label}
      </span>
      <input
        readOnly
        value={value}
        className="flex-1 min-w-0 bg-transparent text-text text-sm font-mono focus:outline-none"
      />
      <button
        onClick={copy}
        className="px-3 py-1 bg-accent text-black rounded-md text-xs font-bold hover:bg-accent/90 shrink-0"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
