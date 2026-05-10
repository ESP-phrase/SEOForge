/**
 * Pure SVG donut chart with center label and side legend.
 */
export type DonutSlice = {
  label: string;
  value: number;
  color?: string;
};

const DEFAULT_COLORS = ["#5dadec", "#3992d6", "#7ec4ee", "#2563d6", "#a5d4f5", "#1e4f8a"];

export function DonutChart({
  title,
  data,
  size = 180,
  thickness = 24,
}: {
  title?: string;
  data: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2;
  const inner = radius - thickness;
  const cx = radius;
  const cy = radius;

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const startAngle = (cumulative / Math.max(total, 1)) * 2 * Math.PI;
    cumulative += d.value;
    const endAngle = (cumulative / Math.max(total, 1)) * 2 * Math.PI;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    // Convert to SVG coords (12 o'clock = -90deg)
    const x1 = cx + radius * Math.sin(startAngle);
    const y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle);
    const y2 = cy - radius * Math.cos(endAngle);

    const xi1 = cx + inner * Math.sin(startAngle);
    const yi1 = cy - inner * Math.cos(startAngle);
    const xi2 = cx + inner * Math.sin(endAngle);
    const yi2 = cy - inner * Math.cos(endAngle);

    const path = total === 0
      ? ""
      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;

    const pct = total > 0 ? (d.value / total) * 100 : 0;
    return {
      ...d,
      path,
      color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      pct,
    };
  });

  // Largest slice — used to decide which percent to show in the donut center
  const biggest = [...slices].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="flex flex-col items-center">
      {title ? <div className="text-muted text-xs font-medium mb-3">{title}</div> : null}
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={(radius + inner) / 2} stroke="#1f3357" strokeWidth={thickness} fill="none" />
          ) : (
            slices.map((s) => <path key={s.label} d={s.path} fill={s.color} />)
          )}
        </svg>
        {biggest && total > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-extrabold tracking-tight">
                {biggest.pct.toFixed(1)}%
              </div>
              <div className="text-muted text-[0.65rem] uppercase tracking-wider mt-0.5">
                {biggest.label}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4 text-xs">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted">{s.label}</span>
            <span className="text-text font-semibold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
