/**
 * SEOForge brand mark — lime rounded square with a stylised spark/star at the
 * center evoking the forge / AI-magic theme. Stays legible at favicon sizes.
 * Same shape rendered as /icon.svg so the favicon and in-page logo match.
 */
export function BrandMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="sf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#caff5e" />
          <stop offset="100%" stopColor="#a3dc34" />
        </linearGradient>
        <linearGradient id="sf-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background tile */}
      <rect width="64" height="64" rx="15" fill="url(#sf-bg)" />
      {/* Top-left highlight for depth */}
      <rect width="64" height="64" rx="15" fill="url(#sf-glow)" />

      {/* Primary 4-point spark (rotated 8deg for slight diagonal energy) */}
      <g transform="translate(32 32) rotate(8)">
        <path
          d="M0 -22 L4.5 -4.5 L22 0 L4.5 4.5 L0 22 L-4.5 4.5 L-22 0 L-4.5 -4.5 Z"
          fill="#0f1b00"
        />
      </g>

      {/* Secondary mini-spark, top-right */}
      <g transform="translate(50 14)">
        <path
          d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
          fill="#0f1b00"
          opacity="0.9"
        />
      </g>

      {/* Tiny tertiary spark, bottom-left */}
      <g transform="translate(14 52)">
        <path
          d="M0 -3.5 L0.9 -0.9 L3.5 0 L0.9 0.9 L0 3.5 L-0.9 0.9 L-3.5 0 L-0.9 -0.9 Z"
          fill="#0f1b00"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
