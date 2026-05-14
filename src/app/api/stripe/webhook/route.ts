/**
 * Stripe webhook. We listen for:
 *   - checkout.session.completed   → first-time activation
 *   - customer.subscription.updated → plan changes + period renewals
 *   - customer.subscription.deleted → downgrade to hobby
 *   - invoice.payment_succeeded     → reset article credits on renewal
 *
 * Verify the signature with STRIPE_WEBHOOK_SECRET. Idempotent — replays
 * just rewrite the same User row.
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe, planFromPriceId, PLAN_CREDITS, type PlanId } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function syncFromSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id ?? "";
  const plan: PlanId = planFromPriceId(priceId) ?? "hobby";
  // current_period_end exists at runtime on Subscription but missing from some
  // SDK versions' types. Cast to access without a type error.
  const cpe = (sub as unknown as { current_period_end?: number }).current_period_end;
  const renews = cpe ? new Date(cpe * 1000) : null;
  const active = sub.status === "active" || sub.status === "trialing";

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: active ? plan : "hobby",
      stripeSubId: sub.id,
      stripePriceId: priceId,
      planRenewsAt: renews,
      articleCredits: active ? PLAN_CREDITS[plan] : PLAN_CREDITS.hobby,
      // Don't reset usage here — only invoice.payment_succeeded does that.
    },
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, err: "no webhook secret" }, { status: 500 });

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bad signature";
    return NextResponse.json({ ok: false, err: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription) {
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        await syncFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "hobby",
              stripeSubId: null,
              stripePriceId: null,
              planRenewsAt: null,
              articleCredits: PLAN_CREDITS.hobby,
            },
          });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        // Reset usage counter on each successful renewal.
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? "";
        if (customerId) {
          const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { articlesUsed: 0 },
            });
          }
        }
        break;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "webhook handler failed";
    return NextResponse.json({ ok: false, err: msg }, { status: 500 });
  }
}
