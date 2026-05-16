"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-bg/85">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg no-underline shrink-0">
          <BrandMark size={32} className="shadow-glow" />
          <span>SEOForge</span>
        </Link>
        {/* Pill-style nav with subtle hover + active state. Compact spacing
            so all 7 items fit comfortably alongside the brand and CTA. */}
        <nav className="hidden md:flex items-center gap-1 ml-2 text-[0.82rem] font-medium">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-2.5 py-1.5 rounded-md no-underline transition-colors ${
                  active
                    ? "text-text bg-surface-2"
                    : "text-muted hover:text-text hover:bg-surface-2/60"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="text-[0.82rem] font-medium px-2.5 py-1.5 rounded-md text-muted hover:text-text hover:bg-surface-2/60 no-underline transition-colors"
          >
            Sign in
          </Link>
          <LinkButton href="/pricing">Start $5 trial</LinkButton>
        </div>
      </div>
    </header>
  );
}
