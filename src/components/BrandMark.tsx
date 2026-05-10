/**
 * SEOForge brand mark — lime rounded square with a stylised black "S" stroke
 * and a forge-spark dot in the top-right corner. Same shape as /icon.svg so
 * the in-page logo matches the favicon.
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
      <rect width="64" height="64" rx="14" fill="#bef848" />
      <path
        d="M40 16 H22 a8 8 0 0 0 0 16 h12 a8 8 0 0 1 0 16 H16"
        stroke="#000"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="14" r="4" fill="#000" />
    </svg>
  );
}
