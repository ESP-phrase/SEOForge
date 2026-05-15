import { BrandMark } from "@/components/BrandMark";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative bg-bg overflow-hidden">
      <AuthBackdrop />
      <div className="relative z-10 min-h-screen grid place-items-center px-4 py-10">
        <div className="w-full max-w-[460px]">
          <div className="flex items-center justify-center gap-3 mb-7">
            <BrandMark size={48} className="shadow-glow rounded-2xl" />
            <span className="font-extrabold text-3xl tracking-tight leading-none">
              <span className="text-text">SEO</span>
              <span className="text-accent">Forge</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
