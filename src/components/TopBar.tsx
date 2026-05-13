"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { BrandMark } from "@/components/BrandMark";

const NAV = [
  { href: "/dashboard", label: "Sites" },
  { href: "/sites/new", label: "Add site" },
  { href: "/analysis", label: "Analysis" },
  { href: "/analytics", label: "Analytics" },
  { href: "/backlinks", label: "Backlinks" },
  { href: "/haro", label: "HARO" },
  { href: "/activity", label: "Activity" },
];

export function TopBar({ username }: { username?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/dashboard")
      return (
        pathname === "/dashboard" ||
        (pathname.startsWith("/sites/") &&
          !pathname.endsWith("/backlinks") &&
          !pathname.endsWith("/analysis") &&
          !pathname.endsWith("/analytics")) ||
        pathname.startsWith("/articles/")
      );
    if (href === "/backlinks")
      return pathname === "/backlinks" || pathname.endsWith("/backlinks");
    if (href === "/analysis")
      return pathname === "/analysis" || pathname.endsWith("/analysis");
    if (href === "/analytics")
      return pathname === "/analytics" || pathname.endsWith("/analytics");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex items-center gap-6 px-2">
      <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-lg no-underline tracking-tight">
        <BrandMark size={34} className="shadow-glow rounded-xl" />
        <span className="hidden sm:inline">SEOForge</span>
      </Link>

      <nav className="flex gap-1 ml-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
              isActive(item.href)
                ? "bg-accent text-black"
                : "text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {username ? (
          <>
            <Link
              href="/billing"
              className="px-3 py-2 text-xs font-medium text-muted hover:text-text no-underline rounded-lg hover:bg-surface-2 transition-colors"
            >
              Billing
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-3 py-2 bg-transparent text-muted border border-border rounded-lg text-xs font-medium hover:bg-surface-2 hover:text-text transition-colors"
              >
                {username} · sign out
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
