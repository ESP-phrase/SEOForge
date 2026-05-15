import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-6 text-sm text-muted">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-bold text-text">SEOForge</span>
          <span className="text-muted-2">© 2026</span>
        </div>
        <div className="flex gap-6 flex-wrap">
          <Link href="/pricing" className="hover:text-text no-underline">Pricing</Link>
          <Link href="/blog" className="hover:text-text no-underline">Blog</Link>
          <Link href="/changelog" className="hover:text-text no-underline">Changelog</Link>
          <Link href="/roadmap" className="hover:text-text no-underline">Roadmap</Link>
          <Link href="/affiliate" className="hover:text-text no-underline">Affiliate</Link>
          <Link href="/privacy" className="hover:text-text no-underline">Privacy</Link>
          <Link href="/terms" className="hover:text-text no-underline">Terms</Link>
          <a
            href="https://github.com/ESP-phrase/SEOForge"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text no-underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
