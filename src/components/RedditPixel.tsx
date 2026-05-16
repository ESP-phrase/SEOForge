"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Reddit conversion pixel. Fires `PageVisit` on every page load. We also
 * forward the signed-in user's email as an advanced-matching key (hashed on
 * Reddit's side, not ours) so Reddit can attribute conversions back to the
 * right ad clicks.
 *
 * Renders nothing if NEXT_PUBLIC_REDDIT_PIXEL_ID isn't set.
 *
 * Standard events to fire later when relevant:
 *   rdt('track', 'SignUp')   — on successful signup
 *   rdt('track', 'Purchase', { value: 29, currency: 'USD' })  — on Stripe complete
 *   rdt('track', 'Lead')     — on free-plan signup if not counted as SignUp
 */
type Rdt = (...args: unknown[]) => void;

// Hardcoded — pixel ID is public anyway (exposed to every page visitor).
// Override via env if you ever rotate it.
const PIXEL_ID = "a2_j0nbovdr0uc1";

export function RedditPixel({ email }: { email?: string }) {
  const id = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || PIXEL_ID;

  // When email becomes available (after login on app pages), re-init with
  // advanced matching so subsequent events tie to the user.
  useEffect(() => {
    if (!id || !email) return;
    const w = window as unknown as { rdt?: Rdt };
    if (typeof w.rdt === "function") {
      try {
        w.rdt("init", id, { email });
      } catch {
        /* ignore */
      }
    }
  }, [id, email]);

  if (!id) return null;

  return (
    <Script
      id="reddit-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=${id}",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
          rdt('init', '${id}');
          rdt('track', 'PageVisit');
        `,
      }}
    />
  );
}
