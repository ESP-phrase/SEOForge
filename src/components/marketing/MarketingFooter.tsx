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
        <div className="flex gap-6">
          <a href="#" className="hover:text-text no-underline">Privacy</a>
          <a href="#" className="hover:text-text no-underline">Terms</a>
          <a href="#" className="hover:text-text no-underline">Status</a>
          <a href="#" className="hover:text-text no-underline">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
