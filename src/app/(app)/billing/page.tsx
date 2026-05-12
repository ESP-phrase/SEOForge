import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { openBillingPortalAction } from "@/actions/billing";
import { PLAN_CREDITS, isStripeConfigured } from "@/lib/stripe";

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
        <Panel className="mb-4 border-accent-border">
          <div className="text-accent font-bold">✓ Subscription active</div>
          <div className="text-muted text-sm mt-1">
            Your plan is live. Credits should appear here within a few seconds — if not, refresh.
          </div>
        </Panel>
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
