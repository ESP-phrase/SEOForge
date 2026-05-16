import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/api/cron",
  "/api/stripe",
  "/api/domains",
  "/api/og",
  "/api/chat",
  "/_next",
  "/_clarity",
  "/favicon",
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
  "/features",
  "/pricing",
  "/testimonials",
  "/docs",
  "/blog",
  "/changelog",
  "/roadmap",
  "/affiliate",
  "/privacy",
  "/terms",
  "/sitemap.xml",
  "/robots.txt",
  "/og.png",
];
const PUBLIC_EXACT = new Set(["/"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];

  // ── Affiliate tracking ────────────────────────────────────────────────
  // ?r=ABC123 in the URL → drop a 60-day cookie. Auth.js createUser event
  // reads this cookie and attaches referredBy on the User row.
  const refCode = req.nextUrl.searchParams.get("r");
  if (refCode && /^[A-Z0-9]{6,12}$/.test(refCode)) {
    const res = NextResponse.next();
    res.cookies.set("sf_ref", refCode, {
      maxAge: 60 * 24 * 3600,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    return res;
  }

  // ── Reddit click attribution ─────────────────────────────────────────
  // Reddit appends ?rdt_cid=... to ad clicks. Cookie it so our server-side
  // Conversions API can attribute the eventual signup/purchase.
  const rdtCid = req.nextUrl.searchParams.get("rdt_cid");
  if (rdtCid) {
    const res = NextResponse.next();
    res.cookies.set("sf_rdt_cid", rdtCid, {
      maxAge: 30 * 24 * 3600,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    return res;
  }

  // ── TikTok click attribution ─────────────────────────────────────────
  // TikTok appends ?ttclid=... to ad clicks. Cookied for 30 days.
  const ttclid = req.nextUrl.searchParams.get("ttclid");
  if (ttclid) {
    const res = NextResponse.next();
    res.cookies.set("sf_ttclid", ttclid, {
      maxAge: 30 * 24 * 3600,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    return res;
  }

  // ── Blog subdomain routing ───────────────────────────────────────────────
  // blog.seoforge.org → rewrite to /blog/* so the same Next.js routes serve.
  //   blog.seoforge.org/             → /blog
  //   blog.seoforge.org/my-article   → /blog/my-article
  // Skip rewriting for assets, api, and already-/blog-prefixed paths.
  if (host.startsWith("blog.")) {
    const isAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon") ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml";
    if (!isAsset && !pathname.startsWith("/blog")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? "/blog" : `/blog${pathname}`;
      return NextResponse.rewrite(url);
    }
    // Already a /blog path or asset — let it through without auth check.
    return NextResponse.next();
  }

  if (PUBLIC_EXACT.has(pathname)) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Read the Auth.js session cookie. With database sessions on Auth.js v5 the
  // cookie name is the same; we just check presence here and let server
  // components/actions verify validity downstream.
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
