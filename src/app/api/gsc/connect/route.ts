/**
 * Starts the Google OAuth flow. /api/gsc/connect?siteId=NN
 *
 * We sign-protect by requiring an authenticated session, encode the target
 * siteId into `state`, and bounce to Google's consent screen. After consent
 * Google redirects back to /api/gsc/callback.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { buildConsentUrl, isGscConfigured } from "@/lib/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!isGscConfigured()) {
    return NextResponse.redirect(
      new URL("/analytics?error=" + encodeURIComponent("GOOGLE_CLIENT_ID/SECRET not set in env"), req.url),
    );
  }
  const siteId = Number(req.nextUrl.searchParams.get("siteId") ?? "0");
  if (!siteId) {
    return NextResponse.redirect(new URL("/analytics?error=missing+siteId", req.url));
  }
  // state = base64({siteId, nonce}) — read back in callback. Cookie pins the nonce.
  const nonce = crypto.randomBytes(16).toString("hex");
  const state = Buffer.from(JSON.stringify({ siteId, nonce })).toString("base64url");

  const res = NextResponse.redirect(buildConsentUrl(state));
  res.cookies.set("gsc_oauth_nonce", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
