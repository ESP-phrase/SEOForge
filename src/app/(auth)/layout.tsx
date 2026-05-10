import { BrandMark } from "@/components/BrandMark";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative bg-bg overflow-hidden">
      <AuthBackdrop />
      <div className="relative z-10 min-h-screen grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-7">
            <BrandMark size={42} />
            <span className="font-extrabold text-2xl tracking-tight">SEOForge</span>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
