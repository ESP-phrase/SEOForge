"use client";

import { useEffect } from "react";

/**
 * Fires Google Ads + Microsoft Ads + TikTok + Reddit purchase conversions
 * client-side when the user lands on /billing?status=success.
 *
 * Server-side webhooks fire the SAME conversions via CAPI — both events
 * carry the same dedupe key (subscription ID) so each ad platform counts
 * only one conversion per actual purchase.
 *
 * Env vars consumed (all optional):
 *   NEXT_PUBLIC_GOOGLE_ADS_LABEL     — "AW-1234567890/abcDEF123"
 *   NEXT_PUBLIC_MICROSOFT_UET_GOAL   — "Subscribe" (or your custom goal name)
 */
export function PurchaseConversion({
  value,
  currency = "USD",
  transactionId,
  plan,
}: {
  value: number;
  currency?: string;
  transactionId: string;
  plan: string;
}) {
  useEffect(() => {
    if (!transactionId || !value) return;

    // Google Ads — gtag('event','conversion',...)
    const gtagLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL;
    if (gtagLabel) {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag === "function") {
        try {
          w.gtag("event", "conversion", {
            send_to: gtagLabel,
            value,
            currency,
            transaction_id: transactionId,
          });
        } catch {
          /* ignore */
        }
      }
    }

    // Microsoft Ads — uetq.push('event',...)
    const uetGoal = process.env.NEXT_PUBLIC_MICROSOFT_UET_GOAL || "Subscribe";
    type Uetq = (string | Record<string, unknown>)[];
    const w = window as unknown as { uetq?: Uetq };
    w.uetq = w.uetq || [];
    try {
      w.uetq.push("event", uetGoal, {
        event_category: "subscription",
        event_label: plan,
        revenue_value: value,
        currency,
      });
    } catch {
      /* ignore */
    }

    // TikTok — ttq.track('CompletePayment',...)
    type Ttq = { track?: (event: string, props: Record<string, unknown>) => void };
    const wt = window as unknown as { ttq?: Ttq };
    if (wt.ttq && typeof wt.ttq.track === "function") {
      try {
        wt.ttq.track("CompletePayment", {
          value,
          currency,
          content_id: transactionId,
          content_name: `${plan} plan`,
        });
      } catch {
        /* ignore */
      }
    }

    // Reddit — rdt('track','Purchase',...)
    type Rdt = (event: string, action: string, props: Record<string, unknown>) => void;
    const wr = window as unknown as { rdt?: Rdt };
    if (typeof wr.rdt === "function") {
      try {
        wr.rdt("track", "Purchase", {
          value,
          currency,
          conversion_id: transactionId,
        });
      } catch {
        /* ignore */
      }
    }
  }, [value, currency, transactionId, plan]);

  return null;
}
