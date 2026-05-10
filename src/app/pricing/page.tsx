import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "Run the engine on a single site. You bring your own Anthropic key.",
    cta: "Get started",
    features: [
      "1 WordPress site",
      "Unlimited keywords",
      "AI keyword research",
      "Quality gates + drafts review",
      "Internal linking",
      "Activity log + cost tracking",
    ],
    accent: false,
  },
  {
    name: "Operator",
    price: "$29",
    cadence: "per month",
    blurb: "Multi-site portfolio. Cron-driven publishing. Hosted email magic-link.",
    cta: "Start 14-day trial",
    features: [
      "Up to 10 sites",
      "Daily Vercel Cron auto-publish",
      "Hosted magic-link email",
      "Priority Anthropic access",
      "All Starter features",
      "Email support",
    ],
    accent: true,
  },
  {
    name: "Agency",
    price: "$149",
    cadence: "per month",
    blurb: "Run dozens of niche sites or client sites with usage-based caps.",
    cta: "Talk to us",
    features: [
      "Unlimited sites",
      "Custom daily caps per site",
      "Search Console integration",
      "Backlink outreach helpers",
      "Slack support",
      "Onboarding call",
    ],
    accent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Start free. <span className="text-accent">Scale when you&apos;re ready.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Self-hosted is free forever. Hosted plans bundle hosting, magic-link email,
            and managed cron so you don&apos;t have to babysit your stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-7 border ${
                t.accent
                  ? "border-accent-border bg-card-grad shadow-glow"
                  : "border-border bg-card-grad"
              }`}
            >
              {t.accent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.65rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most popular
                </div>
              ) : null}
              <div className="text-sm text-muted font-semibold uppercase tracking-wider">
                {t.name}
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-extrabold tracking-tight">{t.price}</span>
                <span className="text-muted text-sm">{t.cadence}</span>
              </div>
              <p className="text-muted text-sm mt-3 mb-5">{t.blurb}</p>
              <ul className="space-y-2 text-sm mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/login" full variant={t.accent ? "primary" : "secondary"}>
                {t.cta}
              </LinkButton>
            </div>
          ))}
        </div>

        <p className="text-muted-2 text-xs text-center mt-10 max-w-xl mx-auto">
          All tiers include the open-source codebase. You always own your data and can
          self-host if you outgrow our hosted plans.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
