"use client";

import Script from "next/script";

/**
 * Google Ads conversion tracking (gtag.js).
 *
 * Set NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-1234567890" (your conversion ID).
 * Fire conversions later from any client component:
 *
 *   window.gtag('event', 'conversion', {
 *     send_to: 'AW-1234567890/abcDEF123',     // conversion label
 *     value: 29.00,
 *     currency: 'USD',
 *     transaction_id: 'sub_xxx',              // dedupe key
 *   });
 *
 * Renders nothing if NEXT_PUBLIC_GOOGLE_ADS_ID isn't set.
 */
export function GoogleAds() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${id}');
          `,
        }}
      />
    </>
  );
}
