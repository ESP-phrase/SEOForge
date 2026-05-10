/**
 * Decorative backdrop for /login and /setup — floating lime particles,
 * perspective grid floor, and corner light streaks. Pure SVG/CSS, no
 * dependencies. Sits behind the auth card.
 */
const PARTICLES = [
  { x: 10, y: 12, r: 1.4, glow: 5 },
  { x: 28, y: 8, r: 1.0, glow: 3 },
  { x: 38, y: 32, r: 1.2, glow: 4 },
  { x: 18, y: 56, r: 0.9, glow: 2.5 },
  { x: 22, y: 78, r: 1.6, glow: 6 },
  { x: 6, y: 70, r: 1.0, glow: 3 },
  { x: 70, y: 14, r: 1.0, glow: 3 },
  { x: 78, y: 38, r: 1.2, glow: 4 },
  { x: 88, y: 60, r: 1.4, glow: 5 },
  { x: 92, y: 22, r: 0.9, glow: 2.5 },
  { x: 64, y: 80, r: 1.1, glow: 3.5 },
  { x: 74, y: 64, r: 0.8, glow: 2 },
  { x: 50, y: 18, r: 0.9, glow: 2.5 },
  { x: 54, y: 88, r: 1.2, glow: 4 },
];

export function AuthBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full">
        {PARTICLES.map((p, i) => (
          <g key={i}>
            <circle
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r={p.r * p.glow}
              fill="#bef848"
              opacity="0.18"
            />
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#bef848" />
          </g>
        ))}
      </svg>

      {/* Bottom-left light streak */}
      <svg
        className="absolute -bottom-10 -left-10 w-[55%] h-[40%] opacity-60"
        viewBox="0 0 600 360"
        preserveAspectRatio="xMinYMax slice"
      >
        <defs>
          <linearGradient id="streakL" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#bef848" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#bef848" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -50 360 Q 200 280 350 240 T 650 80"
          stroke="url(#streakL)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M -50 340 Q 220 250 380 210 T 650 50"
          stroke="url(#streakL)"
          strokeWidth="1"
          fill="none"
          strokeOpacity="0.5"
        />
      </svg>

      {/* Bottom-right light streak (mirrored) */}
      <svg
        className="absolute -bottom-10 -right-10 w-[55%] h-[40%] opacity-60 -scale-x-100"
        viewBox="0 0 600 360"
        preserveAspectRatio="xMinYMax slice"
      >
        <defs>
          <linearGradient id="streakR" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#bef848" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#bef848" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M -50 360 Q 200 280 350 240 T 650 80" stroke="url(#streakR)" strokeWidth="2" fill="none" />
        <path d="M -50 340 Q 220 250 380 210 T 650 50" stroke="url(#streakR)" strokeWidth="1" fill="none" strokeOpacity="0.5" />
      </svg>

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(190,248,72,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(190,248,72,0.10) 1px, transparent 1px)",
          backgroundSize: "60px 60px, 60px 60px",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
          transform: "perspective(700px) rotateX(58deg)",
          transformOrigin: "bottom",
        }}
      />

      {/* Soft top vignette so the brand mark sits on a clean field */}
      <div
        className="absolute inset-x-0 top-0 h-[40%]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(190,248,72,0.06), transparent 70%)",
        }}
      />
    </div>
  );
}
