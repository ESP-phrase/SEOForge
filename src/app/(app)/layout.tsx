import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3">
          <TopBar username={session.user.email ?? session.user.name ?? "Account"} />
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
