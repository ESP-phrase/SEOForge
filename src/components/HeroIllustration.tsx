/**
 * Decorative graphic shown on the right side of the hero. Pure SVG —
 * stylised "dashboard charts in space" with floating particles, matching
 * the energy of the reference image.
 */
export function HeroIllustration() {
  return (
    <div className="absolute top-0 right-0 w-[640px] h-full pointer-events-none opacity-[0.85]" aria-hidden>
      <svg
        viewBox="0 0 640 320"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bef848" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#bef848" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#bef848" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#bef848" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#bef848" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Halo behind the cards */}
        <circle cx="430" cy="160" r="180" fill="url(#orb)" />

        {/* Background card (tilted) */}
        <g transform="translate(360 100) rotate(-8)">
          <rect width="240" height="150" rx="14" fill="url(#cardGlow)" stroke="#262626" />
          <path
            d="M 18 110 Q 40 90 60 96 T 100 80 T 140 70 T 180 50 T 220 36"
            stroke="#bef848"
            strokeOpacity="0.35"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="220" cy="36" r="3" fill="#bef848" fillOpacity="0.6" />
        </g>

        {/* Foreground card (taller, prominent) */}
        <g transform="translate(310 50) rotate(4)">
          <rect width="200" height="220" rx="16" fill="url(#cardGlow)" stroke="#2a2a2a" />
          <text x="16" y="26" fontSize="10" fill="#7a7a7a" fontWeight="600">
            PIPELINE
          </text>
          <text x="16" y="50" fontSize="22" fill="#f3f3f3" fontWeight="800">
            +152
          </text>

          {/* Bar chart */}
          {[
            { x: 18, h: 30 },
            { x: 42, h: 60 },
            { x: 66, h: 45 },
            { x: 90, h: 80 },
            { x: 114, h: 65 },
            { x: 138, h: 100 },
            { x: 162, h: 90 },
          ].map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={200 - b.h}
              width="14"
              height={b.h}
              rx="3"
              fill="url(#bar)"
            />
          ))}
        </g>

        {/* Floating particles */}
        {[
          [60, 60, 1.5],
          [120, 200, 1.8],
          [180, 90, 1.2],
          [40, 240, 2.2],
          [560, 90, 1.7],
          [600, 240, 1.4],
          [260, 240, 1.5],
          [500, 30, 1.9],
          [540, 270, 1.3],
          [610, 60, 2.4],
          [80, 140, 1.0],
          [620, 150, 1.6],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={Number(r) * 4} fill="#bef848" fillOpacity="0.08" />
            <circle cx={x} cy={y} r={r} fill="#bef848" fillOpacity="0.9" />
          </g>
        ))}
      </svg>
    </div>
  );
}
