import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { Clarity } from "@/components/Clarity";
import { RedditPixel } from "@/components/RedditPixel";
import { TikTokPixel } from "@/components/TikTokPixel";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Clarity userId={session.user.id} />
      <RedditPixel email={session.user.email ?? undefined} />
      <TikTokPixel email={session.user.email ?? undefined} />
      <div className="sticky top-0 z-30 px-3 md:px-6 pt-3 pb-2 bg-gradient-to-b from-bg via-bg/95 to-bg/0">
        <div className="max-w-[1600px] mx-auto">
          <TopBar username={session.user.email ?? session.user.name ?? "Account"} />
        </div>
      </div>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
