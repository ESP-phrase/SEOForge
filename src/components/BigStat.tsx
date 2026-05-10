/**
 * Hero metric — big number with optional trend indicator + sparkline area
 * chart. Mimics the "Queries 482 ↑33.9%" panel in the reference.
 */
import { AreaChart } from "@/components/charts/AreaChart";

export function BigStat({
  label,
  value,
  trendPercent,
  data,
  className = "",
}: {
  label: string;
  value: string | number;
  trendPercent?: number;
  data?: number[];
  className?: string;
}) {
  const trendUp = (trendPercent ?? 0) >= 0;
  return (
    <div className={`flex items-center gap-6 md:gap-10 ${className}`}>
      <div className="min-w-[120px]">
        <div className="text-muted text-sm font-medium mb-1">{label}</div>
        <div className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
          {value}
        </div>
        {trendPercent != null ? (
          <div
            className={`mt-2 text-sm font-semibold ${
              trendUp ? "text-success" : "text-danger"
            }`}
          >
            {trendUp ? "▲" : "▼"} {Math.abs(trendPercent).toFixed(1)}%
          </div>
        ) : null}
        <div className="mt-3 h-px bg-accent/40 w-16" />
      </div>
      {data && data.length > 1 ? (
        <div className="flex-1 min-w-0 h-[120px]">
          <AreaChart data={data} />
        </div>
      ) : null}
    </div>
  );
}
