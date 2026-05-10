"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { GlobeIcon, FilterIcon, CalendarIcon } from "@/components/Icons";

type SiteOption = { id: number; name: string };

export function DashboardFilters({ sites }: { sites: SiteOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSite = params.get("site") ?? "all";
  const currentStatus = params.get("status") ?? "all";
  const currentRange = params.get("range") ?? "30";

  function update(key: "site" | "status" | "range", value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || (key === "range" && value === "30")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      router.replace(`/dashboard${next.toString() ? `?${next.toString()}` : ""}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className="flex flex-wrap gap-3" aria-busy={isPending}>
      <FilterTile
        label="Site"
        icon={<GlobeIcon size={14} className="text-accent" />}
        value={currentSite}
        onChange={(v) => update("site", v)}
        options={[
          { value: "all", label: "All sites" },
          ...sites.map((s) => ({ value: String(s.id), label: s.name })),
        ]}
      />
      <FilterTile
        label="Status"
        icon={<FilterIcon size={14} className="text-accent" />}
        value={currentStatus}
        onChange={(v) => update("status", v)}
        options={[
          { value: "all", label: "All statuses" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Drafts" },
          { value: "needs_review", label: "Needs review" },
        ]}
      />
      <FilterTile
        label="Range"
        icon={<CalendarIcon size={14} className="text-accent" />}
        value={currentRange}
        onChange={(v) => update("range", v)}
        options={[
          { value: "7", label: "Last 7 days" },
          { value: "30", label: "Last 30 days" },
          { value: "90", label: "Last 90 days" },
          { value: "all", label: "All time" },
        ]}
      />
    </div>
  );
}

function FilterTile({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative bg-surface border border-border rounded-xl px-3 py-2 flex flex-col min-w-[180px]">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[0.65rem] uppercase tracking-wider text-muted-2 font-semibold">
          {label}
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 px-0 py-0.5 text-sm text-text focus:ring-0 focus:outline-none focus:shadow-none cursor-pointer"
        style={{ borderRadius: 0, minHeight: 0 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-bg">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
