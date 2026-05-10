/**
 * Tiny inline SVG icon set tuned for the dashboard's stat tiles + activity feed.
 * Keep it lightweight — no external icon dependency.
 */
type IconProps = { className?: string; size?: number };

function s(size = 18) {
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
}

export const GlobeIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" strokeLinecap="round" />
  </svg>
);

export const CheckCircleIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClockIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SpinIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const TrendUpIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="m4 17 6-6 4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EyeIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const BellIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" strokeLinejoin="round" />
    <path d="M9.5 18a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
  </svg>
);

export const SparkIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg {...s(size)} className={className} fill="currentColor">
    <path d="M12 2.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7L12 2.5Z" />
  </svg>
);

export const ChevronDownIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FilterIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8h8M7 12h10M9 16h8" strokeLinecap="round" />
  </svg>
);

export const CalendarIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

export const ChartLineIcon = ({ className = "", size }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="M4 19V5M4 19h16" strokeLinecap="round" />
    <path d="m4 14 4-3 4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UserIcon = ({ className = "", size = 18 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
  </svg>
);

export const LockIcon = ({ className = "", size = 18 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
  </svg>
);

export const EyeOpenIcon = ({ className = "", size = 18 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeClosedIcon = ({ className = "", size = 18 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={1.8}>
    <path d="M2 12s3.5-7 10-7c2.4 0 4.5.9 6.2 2.1M22 12s-3.5 7-10 7c-2.4 0-4.5-.9-6.2-2.1" strokeLinecap="round" />
    <path d="m3 3 18 18" strokeLinecap="round" />
  </svg>
);

export const ArrowRightIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg {...s(size)} className={className} stroke="currentColor" strokeWidth={2.2}>
    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GoogleLogoIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7C13.42 14.62 18.27 10.75 24 10.75Z"/>
  </svg>
);

export const GithubLogoIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3"/>
  </svg>
);

export const MicrosoftLogoIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 22 22">
    <rect x="1" y="1" width="9.5" height="9.5" fill="#F35325"/>
    <rect x="11.5" y="1" width="9.5" height="9.5" fill="#81BC06"/>
    <rect x="1" y="11.5" width="9.5" height="9.5" fill="#05A6F0"/>
    <rect x="11.5" y="11.5" width="9.5" height="9.5" fill="#FFBA08"/>
  </svg>
);
