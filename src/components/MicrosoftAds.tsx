"use client";

import Script from "next/script";

/**
 * Microsoft Ads Universal Event Tracking (UET) tag.
 *
 * Set NEXT_PUBLIC_MICROSOFT_UET_ID = your UET tag ID (numeric, e.g. "12345678").
 *
 * Fire conversions from any client component:
 *
 *   window.uetq = window.uetq || [];
 *   window.uetq.push('event', 'subscribe', {
 *     event_category: 'subscription',
 *     event_label: 'operator',
 *     revenue_value: 29,
 *     currency: 'USD',
 *   });
 *
 * Renders nothing if NEXT_PUBLIC_MICROSOFT_UET_ID isn't set.
 */
export function MicrosoftAds() {
  const id = process.env.NEXT_PUBLIC_MICROSOFT_UET_ID;
  if (!id) return null;
  return (
    <Script
      id="microsoft-uet"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${id}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
        `,
      }}
    />
  );
}
