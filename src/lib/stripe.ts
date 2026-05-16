/**
 * Stripe billing helpers. One subscription per User. Three plans, all paid
 * with a $5/$9 14-day paid trial that converts to the monthly price:
 *   hobby    — $5 trial → $14.99/mo, 10 articles/mo
 *   operator — $5 trial → $29/mo,    150 articles/mo
 *   agency   — $9 trial → $149/mo,   1000 articles/mo
 *
 * Plan/credit state lives on the User row and is rewritten by the webhook
 * on checkout.session.completed and customer.subscription.updated. Users
 * on a trial are credited the full plan's articles — we let them USE the
 * tool during trial, that's the whole point.
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
 * Map (plan, cadence) → recurring Stripe Price ID (the one that charges
 * monthly/annual after the trial ends).
 */
export function priceIdFor(plan: PlanId, cadence: Cadence): string | null {
  const map: Record<string, string | undefined> = {
    hobby_monthly:    process.env.STRIPE_PRICE_HOBBY_MONTHLY,
    hobby_annual:     process.env.STRIPE_PRICE_HOBBY_ANNUAL,
    operator_monthly: process.env.STRIPE_PRICE_OPERATOR_MONTHLY,
    operator_annual:  process.env.STRIPE_PRICE_OPERATOR_ANNUAL,
    agency_monthly:   process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    agency_annual:    process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  };
  return map[`${plan}_${cadence}`] ?? null;
}

/**
 * One-time "trial fee" price ID per plan. Charged upfront at checkout
 * before the 14-day trial begins. $5 for Hobby/Operator, $9 for Agency.
 */
export function trialFeePriceIdFor(plan: PlanId): string | null {
  const map: Record<PlanId, string | undefined> = {
    hobby:    process.env.STRIPE_PRICE_HOBBY_TRIAL,
    operator: process.env.STRIPE_PRICE_OPERATOR_TRIAL,
    agency:   process.env.STRIPE_PRICE_AGENCY_TRIAL,
  };
  return map[plan] ?? null;
}

/** Reverse lookup: which plan does a Stripe price ID correspond to? */
export function planFromPriceId(priceId: string): PlanId | null {
  if (
    priceId === process.env.STRIPE_PRICE_HOBBY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_HOBBY_ANNUAL
  )
    return "hobby";
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

/** Per-plan trial fee in dollars — used for ad pixel value attribution. */
export const TRIAL_FEE_USD: Record<PlanId, number> = {
  hobby: 5,
  operator: 5,
  agency: 9,
};

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
