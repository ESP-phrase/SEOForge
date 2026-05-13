#!/usr/bin/env node
/**
 * Create the 4 SEOForge prices in your Stripe account and print the env vars
 * to paste into Vercel. Idempotent on price metadata.plan + metadata.cadence,
 * so re-running just reuses existing prices.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx node scripts/stripe-seed.mjs
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("✗ STRIPE_SECRET_KEY not set in env.");
  process.exit(1);
}
const stripe = new Stripe(key);

const PLANS = [
  { product: "SEOForge Operator", plan: "operator", monthly: 2900, annual: 27600 },
  { product: "SEOForge Agency", plan: "agency", monthly: 14900, annual: 142800 },
];

async function findOrCreateProduct(name, plan) {
  const list = await stripe.products.list({ limit: 100, active: true });
  const existing = list.data.find((p) => p.metadata?.plan === plan);
  if (existing) return existing;
  return stripe.products.create({
    name,
    metadata: { plan },
  });
}

async function findOrCreatePrice(productId, plan, cadence, amount) {
  const interval = cadence === "annual" ? "year" : "month";
  const list = await stripe.prices.list({ product: productId, limit: 100, active: true });
  const existing = list.data.find(
    (p) => p.metadata?.plan === plan && p.metadata?.cadence === cadence,
  );
  if (existing) return existing;
  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: amount,
    recurring: { interval },
    metadata: { plan, cadence },
  });
}

async function main() {
  const env = {};
  for (const p of PLANS) {
    process.stdout.write(`• ${p.product} … `);
    const product = await findOrCreateProduct(p.product, p.plan);
    const monthly = await findOrCreatePrice(product.id, p.plan, "monthly", p.monthly);
    const annual = await findOrCreatePrice(product.id, p.plan, "annual", p.annual);
    env[`STRIPE_PRICE_${p.plan.toUpperCase()}_MONTHLY`] = monthly.id;
    env[`STRIPE_PRICE_${p.plan.toUpperCase()}_ANNUAL`] = annual.id;
    console.log("✓");
  }
  console.log("\n──────────── Paste into Vercel → Settings → Environment Variables ────────────\n");
  for (const [k, v] of Object.entries(env)) console.log(`${k}=${v}`);
  console.log("\n──────────── Then also create a webhook ────────────");
  console.log("Dashboard → Developers → Webhooks → + Add endpoint");
  console.log("  URL:    https://seoforge.org/api/stripe/webhook");
  console.log("  Events: checkout.session.completed, customer.subscription.{created,updated,deleted}, invoice.payment_succeeded");
  console.log("  Copy the signing secret to STRIPE_WEBHOOK_SECRET\n");
}

main().catch((e) => {
  console.error("✗", e?.message ?? e);
  process.exit(1);
});
