import Link from "next/link";
import { LinkButton } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-bg/85">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg no-underline">
          <BrandMark size={36} className="shadow-glow" />
          <span>SEOForge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 ml-6 text-sm text-muted">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-text no-underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-text no-underline">
            Sign in
          </Link>
          <LinkButton href="/login">Start Free</LinkButton>
        </div>
      </div>
    </header>
  );
}
