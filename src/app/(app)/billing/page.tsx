import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { openBillingPortalAction } from "@/actions/billing";
import { PLAN_CREDITS, isStripeConfigured } from "@/lib/stripe";
import { PurchaseConversion } from "@/components/PurchaseConversion";

export const dynamic = "force-dynamic";

const PLAN_LABEL: Record<string, string> = {
  hobby: "Hobby (Free)",
  operator: "Operator",
  agency: "Agency",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const used = user.articlesUsed;
  const cap = user.articleCredits;
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const remaining = Math.max(0, cap - used);
  const renews = user.planRenewsAt ? new Date(user.planRenewsAt).toLocaleDateString() : null;

  return (
    <>
      <PageHeader
        title="Billing & usage"
        subtitle={user.plan === "hobby" ? "You're on the free Hobby plan." : `${PLAN_LABEL[user.plan] ?? user.plan} · renews ${renews ?? "—"}`}
      />

      {sp.status === "success" ? (
        <>
          <Panel className="mb-4 border-accent-border">
            <div className="text-accent font-bold">✓ Subscription active</div>
            <div className="text-muted text-sm mt-1">
              Your plan is live. Credits should appear here within a few seconds — if not, refresh.
            </div>
          </Panel>
          {user.plan !== "hobby" && user.stripeSubId ? (
            <PurchaseConversion
              value={user.plan === "operator" ? 29 : user.plan === "agency" ? 149 : 0}
              currency="USD"
              transactionId={user.stripeSubId}
              plan={user.plan}
            />
          ) : null}
        </>
      ) : null}
      {sp.error ? (
        <Panel className="mb-4">
          <div className="text-red-400 font-bold">Error</div>
          <div className="text-muted text-sm mt-1">{sp.error}</div>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Current plan</div>
          <div className="text-3xl font-extrabold text-accent">{PLAN_LABEL[user.plan] ?? user.plan}</div>
          {renews ? <div className="text-muted text-xs mt-2">Renews {renews}</div> : null}
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Articles used</div>
          <div className="text-3xl font-extrabold text-text">
            {used} <span className="text-muted text-base font-normal">/ {cap}</span>
          </div>
          <div className="text-muted text-xs mt-2">{remaining} remaining this period</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Plan cap</div>
          <div className="text-3xl font-extrabold text-text">
            {PLAN_CREDITS[user.plan as keyof typeof PLAN_CREDITS] ?? cap}
          </div>
          <div className="text-muted text-xs mt-2">articles per month</div>
        </Panel>
      </div>

      <Panel title="Usage this billing period" className="mb-4">
        <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${pct >= 90 ? "bg-red-400" : pct >= 75 ? "bg-yellow-400" : "bg-accent"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>{used} used</span>
          <span>{pct}%</span>
          <span>{cap} cap</span>
        </div>
        {pct >= 80 && user.plan !== "agency" ? (
          <div className="mt-4 p-3 bg-accent-dim border border-accent-border rounded-lg text-sm">
            You&apos;ve used {pct}% of your monthly credits.{" "}
            <Link href="/pricing" className="text-accent font-semibold hover:underline">
              Upgrade →
            </Link>
          </div>
        ) : null}
      </Panel>

      {/* Plan-aware upgrade panel — shows the next plans up from where you are */}
      {(() => {
        type PlanCard = {
          slug: "operator" | "agency";
          name: string;
          price: string;
          articles: string;
          features: string[];
          recommended?: boolean;
        };
        const ALL_PLANS: Record<string, PlanCard> = {
          operator: {
            slug: "operator",
            name: "Operator",
            price: "$29/mo",
            articles: "150 articles/mo",
            features: [
              "Up to 10 sites",
              "Daily cron auto-publish",
              "Backlink outreach + HARO",
              "Self-hosted analytics",
            ],
          },
          agency: {
            slug: "agency",
            name: "Agency",
            price: "$149/mo",
            articles: "1,000 articles/mo",
            features: [
              "Unlimited sites",
              "Google Search Console integration",
              "Team seats (up to 5)",
              "Slack support · 4h SLA",
            ],
          },
        };

        // What plans should we show as upgrade options?
        const upsell: PlanCard[] =
          user.plan === "hobby"
            ? [
                { ...ALL_PLANS.operator, recommended: true },
                ALL_PLANS.agency,
              ]
            : user.plan === "operator"
              ? [{ ...ALL_PLANS.agency, recommended: true }]
              : [];

        if (upsell.length === 0) {
          return (
            <Panel className="mb-4 border-accent-border bg-card-grad shadow-glow">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div>
                  <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-accent mb-1">
                    You&apos;re on the top plan
                  </div>
                  <h3 className="text-lg font-extrabold text-text">
                    Agency · unlimited everything
                  </h3>
                  <p className="text-muted text-sm mt-1">
                    Need higher caps or enterprise terms?{" "}
                    <a
                      href="mailto:aubreynicholsacc@gmail.com"
                      className="text-accent hover:underline"
                    >
                      Get in touch
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Panel>
          );
        }

        return (
          <Panel className="mb-4 border-accent-border bg-card-grad shadow-glow">
            <div className="flex items-start gap-4 flex-wrap mb-5">
              <div className="text-4xl shrink-0">⚡</div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-accent mb-1">
                  Upgrade your plan
                </div>
                <h3 className="text-xl font-extrabold text-text">
                  {user.plan === "hobby"
                    ? "Get 15x more articles + multi-site auto-publish"
                    : "Scale to 1,000 articles/month + unlimited sites"}
                </h3>
                <p className="text-muted text-xs mt-1">
                  Currently using {used}/{cap} on the{" "}
                  <span className="text-text font-semibold">{PLAN_LABEL[user.plan] ?? user.plan}</span>{" "}
                  plan · 14-day money-back guarantee
                </p>
              </div>
            </div>

            <div
              className={`grid gap-3 ${upsell.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
            >
              {upsell.map((p) => (
                <div
                  key={p.slug}
                  className={`relative rounded-xl p-4 border-2 ${
                    p.recommended
                      ? "border-accent bg-accent-dim"
                      : "border-border bg-surface-2"
                  }`}
                >
                  {p.recommended ? (
                    <span className="absolute -top-2.5 left-3 bg-accent text-black text-[0.55rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="font-extrabold text-text">{p.name}</div>
                    <div className="text-accent font-extrabold">{p.price}</div>
                  </div>
                  <div className="text-muted text-xs mb-3">{p.articles}</div>
                  <ul className="text-muted text-xs space-y-1 mb-4">
                    {p.features.map((f) => (
                      <li key={f}>✓ <span className="text-text">{f}</span></li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`block text-center py-2 rounded-lg text-xs font-bold no-underline transition-colors ${
                      p.recommended
                        ? "bg-accent text-black hover:bg-accent/90"
                        : "bg-bg border border-border text-text hover:bg-surface"
                    }`}
                  >
                    Upgrade to {p.name} →
                  </Link>
                </div>
              ))}
            </div>
          </Panel>
        );
      })()}

      <Panel title="Manage subscription">
        {!isStripeConfigured() ? (
          <div className="text-sm">
            <p className="text-muted mb-3">
              Stripe is not configured yet. Set <code className="text-text">STRIPE_SECRET_KEY</code>{" "}
              and <code className="text-text">STRIPE_WEBHOOK_SECRET</code> in env vars.
            </p>
          </div>
        ) : user.stripeCustomerId ? (
          <div className="flex flex-wrap gap-3 items-center">
            <form action={openBillingPortalAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold"
              >
                Open billing portal
              </button>
            </form>
            <Link
              href="/pricing"
              className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted hover:text-text hover:bg-surface-2 no-underline"
            >
              Change plan
            </Link>
            <span className="text-muted text-xs">
              Update card, view invoices, cancel — all in Stripe&apos;s hosted portal.
            </span>
          </div>
        ) : (
          <div>
            <p className="text-muted text-sm mb-4">
              You&apos;re on the free Hobby plan. Upgrade for more articles, multi-site support, and managed cron.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold no-underline"
            >
              View plans →
            </Link>
          </div>
        )}
      </Panel>
    </>
  );
}
