/**
 * Multi-series SVG line chart with x-axis date labels and end-point dots
 * with values, mirroring the "Content Pipeline Overview" chart in the
 * reference dashboard.
 */
export type Series = {
  label: string;
  color: string;
  data: number[]; // length = labels.length
};

export function LineChart({
  series,
  labels,
  height = 320,
}: {
  series: Series[];
  labels: string[];
  height?: number;
}) {
  const padX = 28;
  const padTop = 14;
  const padBottom = 28;
  const width = 720; // viewBox width — chart scales responsively via preserveAspectRatio
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const allValues = series.flatMap((s) => s.data);
  const max = Math.max(100, ...allValues);
  const ticks = [0, 25, 50, 75, max <= 100 ? 100 : Math.ceil(max / 25) * 25];

  const xAt = (i: number) =>
    series[0]?.data.length > 1
      ? padX + (i * innerW) / (series[0].data.length - 1)
      : padX;
  const yAt = (v: number) =>
    padTop + innerH - (v / Math.max(...ticks)) * innerH;

  // Show first, ~middle, and last x labels — plus interior at quartiles
  const labelStride = Math.max(1, Math.floor(labels.length / 5));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      {/* y-grid */}
      {ticks.map((t) => {
        const y = yAt(t);
        return (
          <g key={t}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#161616" strokeWidth={1} />
            <text
              x={padX - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#525252"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* x-axis labels */}
      {labels.map((lbl, i) =>
        i % labelStride === 0 || i === labels.length - 1 ? (
          <text
            key={i}
            x={xAt(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#525252"
          >
            {lbl}
          </text>
        ) : null,
      )}

      {/* Series */}
      {series.map((s, si) => {
        if (s.data.length === 0) return null;
        const path = s.data
          .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
          .join(" ");
        const lastIdx = s.data.length - 1;
        const lastX = xAt(lastIdx);
        const lastY = yAt(s.data[lastIdx]);
        return (
          <g key={si}>
            <path
              d={path}
              fill="none"
              stroke={s.color}
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={lastX} cy={lastY} r={4} fill={s.color} />
            <circle cx={lastX} cy={lastY} r={9} fill={s.color} fillOpacity="0.18" />
            <text
              x={lastX + 12}
              y={lastY + 4}
              fontSize="11"
              fontWeight="700"
              fill={s.color}
            >
              {s.data[lastIdx]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ChartLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      {series.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ background: s.color }}
          />
          <span className="text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
