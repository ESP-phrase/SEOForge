/**
 * Live pixel debug dashboard. Auth-gated.
 *
 * Shows in real-time:
 *   - Which pixel scripts are loaded (ttq, rdt, gtag, uetq, clarity)
 *   - A live log of every pixel call as it fires anywhere on the site
 *   - Manual fire buttons for every TikTok + Reddit standard event
 *   - Status links to the upstream Events Managers
 *
 * Use this to debug ad-blocker issues, missing content_id warnings, or to
 * generate test events on demand while validating campaigns.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PixelDashboardClient } from "./PixelDashboardClient";

export const dynamic = "force-dynamic";

export default async function PixelDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/pixel-dashboard");
  return <PixelDashboardClient />;
}
