"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, priceIdFor, appUrl, isStripeConfigured, type PlanId, type Cadence } from "@/lib/stripe";

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const plan = String(formData.get("plan") ?? "") as PlanId;
  const cadence = String(formData.get("cadence") ?? "monthly") as Cadence;

  if (!isStripeConfigured()) {
    redirect("/billing?error=" + encodeURIComponent("Stripe not configured. Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET."));
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(`/pricing?plan=${plan}&cadence=${cadence}`)}`);
  }
  const userId = session.user.id;
  const email = session.user.email;

  const priceId = priceIdFor(plan, cadence);
  if (!priceId) {
    redirect("/pricing?error=" + encodeURIComponent("That plan price is not configured."));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // Reuse existing customer if present, else create one.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const c = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
    customerId = c.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/pricing?status=cancel`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { userId, plan } },
    metadata: { userId, plan },
  });

  if (!checkout.url) redirect("/pricing?error=stripe+session+failed");

  // Mid-funnel ad signal: user picked a plan and is heading to Stripe.
  // Fires server-side so iOS/ad-block can't strip it. The browser pixel
  // fires the same event on click — TikTok dedupes via event_id, Reddit
  // dedupes via conversion_id (Stripe checkout session ID).
  const value = plan === "operator" ? (cadence === "annual" ? 276 : 29)
              : plan === "agency"   ? (cadence === "annual" ? 1428 : 149)
              : 0;
  try {
    const { sendTikTokEvent } = await import("@/lib/tiktokCapi");
    // Fire BOTH AddToCart and InitiateCheckout for TikTok. AddToCart is
    // what we recommend optimizing on early — more events = faster algo
    // training. InitiateCheckout stays for funnel reporting. Different
    // event_ids so TikTok counts them as separate signals.
    await sendTikTokEvent({
      eventName: "AddToCart",
      email: email ?? undefined,
      userId,
      value,
      currency: "USD",
      contentName: `${plan} plan`,
      contentId: checkout.id,
      eventId: `atc_${checkout.id}`,
    });
    await sendTikTokEvent({
      eventName: "InitiateCheckout",
      email: email ?? undefined,
      userId,
      value,
      currency: "USD",
      contentName: `${plan} plan`,
      contentId: checkout.id,
      eventId: checkout.id,
    });
  } catch {
    /* never block checkout on tracking */
  }
  try {
    const { sendRedditEvent } = await import("@/lib/redditCapi");
    await sendRedditEvent({
      eventName: "AddToCart",
      email: email ?? undefined,
      userId,
      value,
      currency: "USD",
      itemCount: 1,
      conversionId: checkout.id,
    });
  } catch {
    /* never block checkout on tracking */
  }

  redirect(checkout.url);
}

export async function openBillingPortalAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) redirect("/pricing");

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/billing`,
  });
  redirect(portal.url);
}
