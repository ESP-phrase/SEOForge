/**
 * Server CAPI fire endpoint for the pixel dashboard. Auth-gated. Fires one
 * of every TikTok + Reddit standard event via the server-side Conversions
 * APIs and returns a per-event pass/fail table.
 *
 * Different from /test-pixels: this is on-demand (called from dashboard
 * button), not auto-fired on page load — so you can re-run it any time
 * during a debug session.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fireAllServerEvents } from "@/actions/testPixels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const results = await fireAllServerEvents();
  return NextResponse.json({ results });
}
