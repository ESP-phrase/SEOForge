/**
 * OAuth callback. Google redirects here with ?code=...&state=...
 *
 * We exchange the code for a refresh token, then auto-pick the GSC property
 * that matches the site's wpUrl host. If no match, we save the connection
 * with the first verified property and let the user fix it later in /settings.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { exchangeCode, listSites, saveSiteConnection } from "@/lib/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(req: NextRequest, qs: string): NextResponse {
  return NextResponse.redirect(new URL(`/analytics?${qs}`, req.url));
}

function matchProperty(properties: string[], wpUrl: string): string | null {
  let host = "";
  try {
    host = new URL(wpUrl).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return properties[0] ?? null;
  }
  // Prefer sc-domain: match, then https://host/ match, then any starts-with host
  return (
    properties.find((p) => p === `sc-domain:${host}`) ??
    properties.find((p) => {
      try {
        return new URL(p).host.toLowerCase().replace(/^www\./, "") === host;
      } catch {
        return false;
      }
    }) ??
    properties[0] ??
    null
  );
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");
  if (err) return back(req, "error=" + encodeURIComponent(err));
  if (!code || !stateRaw) return back(req, "error=missing+code");

  let siteId = 0;
  let nonce = "";
  try {
    const parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
    siteId = Number(parsed.siteId);
    nonce = String(parsed.nonce);
  } catch {
    return back(req, "error=bad+state");
  }
  const cookieNonce = req.cookies.get("gsc_oauth_nonce")?.value;
  if (!nonce || nonce !== cookieNonce) {
    return back(req, "error=state+mismatch");
  }
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return back(req, "error=site+not+found");

  try {
    const { refresh_token } = await exchangeCode(code);
    const props = await listSites(refresh_token);
    if (props.length === 0) {
      return back(req, "error=" + encodeURIComponent("No verified Search Console properties on this Google account."));
    }
    const matched = matchProperty(props, site.wpUrl) ?? props[0];
    await saveSiteConnection(siteId, refresh_token, matched);
    const res = back(req, `connected=${siteId}`);
    res.cookies.delete("gsc_oauth_nonce");
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "callback failed";
    return back(req, "error=" + encodeURIComponent(msg));
  }
}
