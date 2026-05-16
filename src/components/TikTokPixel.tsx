"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * TikTok conversion pixel. Fires page() on every page load. Pass `email`
 * (or hashed identifiers) on authed pages so TikTok can match users.
 *
 * Hardcoded ID with env override — pixel ID is public anyway.
 *
 * Standard events to fire later when relevant:
 *   ttq.track('CompletePayment', { value: 29, currency: 'USD' })  — Stripe
 *   ttq.track('CompleteRegistration')                              — signup
 *   ttq.track('ClickButton')
 */
const PIXEL_ID = "D846P43C77U6NFPBOPMG";

type Ttq = {
  identify?: (data: Record<string, string>) => void;
};

export function TikTokPixel({ email }: { email?: string }) {
  const id = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || PIXEL_ID;

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
