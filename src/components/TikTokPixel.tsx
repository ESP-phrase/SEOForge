"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * TikTok conversion pixel. Fires page() + an explicit ViewContent event
 * (with content_id) on every page load. The explicit ViewContent is
 * required because TikTok's enhanced-postback feature otherwise auto-
 * fires ViewContent/AddToCart/Purchase events WITHOUT content_id,
 * triggering "content_id missing" diagnostics. Firing our own with the
 * correct payload satisfies the check.
 *
 * Hardcoded ID with env override — pixel ID is public anyway.
 */
const PIXEL_ID = "D846P43C77U6NFPBOPMG";

type Ttq = {
  identify?: (data: Record<string, string>) => void;
  track?: (event: string, props: Record<string, unknown>) => void;
};

function pathToContentId(path: string): { id: string; name: string } {
  // Map path → stable content_id slug. "/" → "home", "/pricing" → "pricing", etc.
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "_") || "home";
  return { id: `seoforge_${slug}`, name: `SEOForge — ${slug.replace(/_/g, " ")}` };
}

export function TikTokPixel({ email }: { email?: string }) {
  const id = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || PIXEL_ID;
  const pathname = usePathname();

  // Advanced matching — sends hashed email to TikTok so signups/purchases
  // tie back to ad clicks even when cookies are missing.
  useEffect(() => {
    if (!id || !email) return;
    const w = window as unknown as { ttq?: Ttq };
    if (w.ttq && typeof w.ttq.identify === "function") {
      try {
        w.ttq.identify({ email });
      } catch {
        /* ignore */
      }
    }
  }, [id, email]);

  // Fire explicit ViewContent with content_id on every page navigation.
  // Waits 500ms for ttq to attach to window after next/script injects it.
  useEffect(() => {
    if (!id || !pathname) return;
    const t = setTimeout(() => {
      const w = window as unknown as { ttq?: Ttq };
      if (typeof w.ttq?.track !== "function") return;
      const { id: cid, name } = pathToContentId(pathname);
      try {
        w.ttq.track("ViewContent", {
          content_id: cid,
          content_type: "product",
          content_name: name,
          currency: "USD",
          value: 0,
        });
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [id, pathname]);

  if (!id) return null;

  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('${id}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  );
}
