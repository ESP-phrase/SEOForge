/**
 * Pure SVG area chart — no dependencies. Renders a smooth-ish line plus a
 * gradient-filled area beneath it.
 */
export function AreaChart({
  data,
  width = 600,
  height = 120,
  stroke = "#5dadec",
  fill = "url(#areaFill)",
  padding = 4,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  padding?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xStep = (width - padding * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = padding + i * xStep;
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    `${linePath} L ${points[points.length - 1][0].toFixed(1)} ${height - padding} ` +
    `L ${points[0][0].toFixed(1)} ${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5dadec" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5dadec" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fill} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
