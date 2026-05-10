/**
 * Stat tile with a colored square icon, big number, label, and optional
 * trend annotation. Mirrors the 6 metric tiles in the dashboard reference.
 */
type Tone = "yellow" | "green" | "amber" | "blue" | "violet" | "cyan" | "lime";

const TONE_BG: Record<Tone, string> = {
  yellow: "bg-tile-yellow/15 text-tile-yellow",
  green: "bg-tile-green/15 text-tile-green",
  amber: "bg-tile-amber/15 text-tile-amber",
  blue: "bg-tile-blue/15 text-tile-blue",
  violet: "bg-tile-violet/15 text-tile-violet",
  cyan: "bg-tile-cyan/15 text-tile-cyan",
  lime: "bg-accent-dim text-accent",
};

export function IconStatTile({
  label,
  value,
  trend,
  trendPositive = true,
  tone = "lime",
  icon,
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  tone?: Tone;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card-grad border border-border rounded-2xl p-5 shadow-soft hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="text-muted text-xs font-medium">{label}</div>
        <div
          className={`w-9 h-9 grid place-items-center rounded-lg ${TONE_BG[tone]}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl md:text-[2rem] font-extrabold tracking-tight leading-none mt-3">
        {value}
      </div>
      {trend ? (
        <div
          className={`text-xs font-semibold mt-2 ${
            trendPositive ? "text-success" : "text-danger"
          }`}
        >
          {trend}
        </div>
      ) : (
        <div className="text-xs text-muted-2 mt-2">—</div>
      )}
    </div>
  );
}
