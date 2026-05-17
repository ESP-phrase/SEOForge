"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StickyMobileCTA } from "@/components/marketing/StickyMobileCTA";

const NAV: { href: string; label: string; icon: (className?: string) => React.ReactNode; dot?: boolean }[] = [
  { href: "/features",     label: "Features",     icon: () => <BoltIcon /> },
  { href: "/pricing",      label: "Pricing",      icon: () => <TagIcon /> },
  { href: "/testimonials", label: "Testimonials", icon: () => <ChatIcon /> },
  { href: "/docs",         label: "Docs",         icon: () => <BookIcon /> },
  { href: "/blog",         label: "Blog",         icon: () => <PencilIcon /> },
  { href: "/roadmap",      label: "Roadmap",      icon: () => <MapIcon /> },
  { href: "/changelog",    label: "Changelog",    icon: () => <SparkleIcon />, dot: true },
];

export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <>
      <StickyMobileCTA />
      {/* Sticky outer wrapper keeps the bar pinned; inner bar is a rounded
          black pill so it floats inside the viewport with glow accents on the
          right side. */}
      <div className="sticky top-0 z-40 px-3 md:px-6 pt-3 pb-2 bg-gradient-to-b from-bg via-bg/95 to-bg/0">
        <header className="relative max-w-[1400px] mx-auto bg-black border border-border rounded-2xl shadow-[0_0_60px_-20px_rgba(190,248,72,0.4)]">
          <div className="px-3 md:px-4 py-2 flex items-center gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold no-underline shrink-0 px-1.5">
              <span
                className="w-9 h-9 rounded-xl bg-accent grid place-items-center text-black shadow-[0_0_18px_rgba(190,248,72,0.55)]"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
                </svg>
              </span>
              <span className="text-lg tracking-tight leading-none">
                <span className="text-text">SEO</span>
                <span className="text-accent">Forge</span>
              </span>
            </Link>

            {/* Nav — icon-prefixed pills */}
            <nav className="hidden md:flex items-center gap-0.5 ml-3 text-[0.82rem] font-semibold">
              {NAV.map((n) => {
                const active = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl no-underline transition-all duration-150 ${
                      active
                        ? "text-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgba(190,248,72,0.35),0_0_18px_-4px_rgba(190,248,72,0.45)]"
                        : "text-muted hover:text-text hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 grid place-items-center ${active ? "text-accent" : "text-muted group-hover:text-text"}`} aria-hidden>
                      {n.icon()}
                    </span>
                    <span>{n.label}</span>
                    {n.dot ? (
                      <span
                        aria-hidden
                        className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(190,248,72,0.9)] ml-0.5"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold px-3.5 py-2 rounded-xl text-text bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] no-underline transition-colors"
              >
                <UserIcon />
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold px-3.5 py-2 rounded-xl bg-accent text-black hover:bg-accent/90 no-underline transition-colors shadow-[0_0_20px_-4px_rgba(190,248,72,0.7)]"
              >
                Get started
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}

// ─── Inline icons (1.4 stroke at 16px, lucide-aligned) ────────────────────

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
