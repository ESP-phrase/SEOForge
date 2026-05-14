/**
 * Stripe billing helpers. One subscription per User. Three plans:
 *   hobby (free, 10 articles/mo)
 *   operator ($29/mo or $23/mo annual, 150 articles/mo)
 *   agency  ($149/mo or $119/mo annual, 1000 articles/mo)
 *
 * Plan/credit state lives on the User row and is rewritten by the webhook
 * on checkout.session.completed and customer.subscription.updated.
 */
import Stripe from "stripe";

// Lazy singleton — Stripe constructor throws when key is empty, which breaks
// Next's "collect page data" build step on Vercel where STRIPE_SECRET_KEY is
// optional. Calling `stripe.xxx()` from a request lazily constructs.
let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    if (!_stripe) {
      const key = process.env.STRIPE_SECRET_KEY ?? "";
      if (!key) throw new Error("STRIPE_SECRET_KEY not set");
      _stripe = new Stripe(key, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: "2024-12-18.acacia" as any,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_stripe as any)[prop];
  },
});

export type PlanId = "hobby" | "operator" | "agency";
export type Cadence = "monthly" | "annual";

export const PLAN_CREDITS: Record<PlanId, number> = {
  hobby: 10,
  operator: 150,
  agency: 1000,
};

/**
 * Map (plan, cadence) → Stripe Price ID. Set in env after creating prices in
 * the Stripe dashboard. Hobby has no Stripe price — it's the default state.
 */
export function priceIdFor(plan: PlanId, cadence: Cadence): string | null {
  if (plan === "hobby") return null;
  const map: Record<string, string | undefined> = {
    operator_monthly: process.env.STRIPE_PRICE_OPERATOR_MONTHLY,
    operator_annual: process.env.STRIPE_PRICE_OPERATOR_ANNUAL,
    agency_monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    agency_annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  };
  return map[`${plan}_${cadence}`] ?? null;
}

/** Reverse lookup: which plan does a Stripe price ID correspond to? */
export function planFromPriceId(priceId: string): PlanId | null {
  if (
    priceId === process.env.STRIPE_PRICE_OPERATOR_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_OPERATOR_ANNUAL
  )
    return "operator";
  if (
    priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_AGENCY_ANNUAL
  )
    return "agency";
  return null;
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
