"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";
import { startCheckoutAction } from "@/actions/billing";

type Tier = {
  name: string;
  tagline: string;
  trialFee: number;     // one-time charged today (in USD)
  priceMo: number;      // billed/mo after 14-day trial
  priceYr: number;      // billed/mo equivalent on annual cadence
  accent: boolean;
  cta: string;
  articles: string;
  sites: string;
  features: string[];
  excludes?: string[];
};

const TIERS: Tier[] = [
  {
    name: "Hobby",
    tagline: "For a single niche site or weekend project.",
    trialFee: 1,
    priceMo: 14.99,
    priceYr: 12,        // ~20% off, billed $144/yr
    accent: false,
    cta: "Start $1 trial",
    articles: "10 articles / mo",
    sites: "1 site",
    features: [
      "AI keyword research",
      "Claude-powered article generation",
      "Quality gates + drafts review",
      "WordPress auto-publish",
      "Activity log + cost tracking",
      "Hosted Claude — no API key needed",
    ],
  },
  {
    name: "Operator",
    tagline: "Run a portfolio of niche sites on autopilot.",
    trialFee: 1,
    priceMo: 29,
    priceYr: 23,
    accent: true,
    cta: "Start $1 trial",
    articles: "150 articles / mo",
    sites: "Up to 10 sites",
    features: [
      "Everything in Hobby",
      "Daily cron auto-publish",
      "SEO analysis scorecard",
      "Backlink outreach workbench",
      "Internal-link graph",
      "Self-hosted page-view analytics",
      "Hosted magic-link email",
      "Email support · 24h",
    ],
  },
  {
    name: "Agency",
    tagline: "Manage client sites with usage-based caps.",
    trialFee: 1,
    priceMo: 149,
    priceYr: 119,
    accent: false,
    cta: "Start $1 trial",
    articles: "1,000 articles / mo",
    sites: "Unlimited sites",
    features: [
      "Everything in Operator",
      "Google Search Console integration",
      "Per-site daily caps & schedules",
      "White-label client reports",
      "Team seats (up to 5)",
      "Priority Claude capacity",
      "Slack support · 4h",
      "Onboarding call + SEO audit",
    ],
  },
];

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "WordPress auto-publish", values: [true, true, true] },
  { label: "AI keyword research (Claude)", values: [true, true, true] },
  { label: "SERP gap analysis", values: [true, true, true] },
  { label: "Internal linking", values: [true, true, true] },
  { label: "Page-view analytics", values: [false, true, true] },
  { label: "Google Search Console", values: [false, false, true] },
  { label: "Backlink outreach AI drafts", values: [false, true, true] },
  { label: "Daily cron auto-publish", values: [false, true, true] },
  { label: "Team seats", values: ["—", "1", "5"] },
  { label: "Support SLA", values: ["Community", "Email · 24h", "Slack · 4h"] },
];

const FAQ = [
  {
    q: "Do I bring my own AI keys, or is it included?",
    a: "Hobby uses your own Anthropic API key (transparent costs, ~$0.30–$0.80 per article). Operator and Agency include managed Claude capacity with priority access — no API key needed.",
  },
  {
    q: "What counts as an 'article'?",
    a: "One generated, fact-checked, internally-linked article of 1,000+ words, published to WordPress. Drafts that fail quality gates and aren't published don't count.",
  },
  {
    q: "Can I exceed my monthly cap?",
    a: "Yes — overage is $0.20/article on Operator and $0.10/article on Agency. We notify at 80% so nothing catches you by surprise.",
  },
  {
    q: "Is the content actually good, or is it generic AI slop?",
    a: "Every article is built from real SERP analysis, runs through quality gates (word count, headings, FAQ, schema, internal links), and uses Claude Sonnet 4.6 — not a cheap model. Generic AI tools produce 600-word fluff; SEOForge produces 1,500-word articles with TL;DR boxes, callouts, comparison tables, and pull-quotes.",
  },
  {
    q: "Can I self-host?",
    a: "Yes — the entire codebase is open. Self-hosting is free forever; you just pay your own Vercel + Neon + Anthropic bills. Hosted plans save you the setup and add managed cron + email.",
  },
  {
    q: "Will Google penalize AI content?",
    a: "Google penalizes low-quality content, not AI per se. SEOForge generates content that meets E-E-A-T signals (author bios, schema, citations, originality from SERP gaps). We recommend 1–3 articles/day on new domains to stay safe.",
  },
  {
    q: "Cancel anytime?",
    a: "Yes. No contracts. Cancel from the dashboard, keep access through the end of the billing period, then your articles stay on your WordPress site forever — they're yours.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 md:py-8">
        {/* Header — compact, sits above the fold */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Pay for results, <span className="text-accent">not seats.</span>
          </h1>
          <p className="text-muted text-sm mt-1.5">
            Pick your plan · 14-day paid trial · cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              !annual ? "bg-surface-2 text-text" : "text-muted hover:text-text"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              annual ? "bg-surface-2 text-text" : "text-muted hover:text-text"
            }`}
          >
            Annual
            <span className="bg-accent text-black text-[0.6rem] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Save 20%
            </span>
          </button>
        </div>

        {/* Tier cards — compact so all 3 fit in viewport */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto mb-6">
          {TIERS.map((t) => {
            const price = annual ? t.priceYr : t.priceMo;
            return (
              <div
                key={t.name}
                className={`relative rounded-xl p-4 border ${
                  t.accent
                    ? "border-accent-border bg-card-grad shadow-glow"
                    : "border-border bg-card-grad"
                }`}
              >
                {t.accent ? (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.6rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Most popular
                  </div>
                ) : null}
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">
                  {t.name}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight text-accent">
                    ${t.trialFee}
                  </span>
                  <span className="text-muted text-xs">today</span>
                </div>
                <div className="text-muted-2 text-[0.7rem] mt-0.5">
                  then <span className="text-text font-semibold">${price}/mo</span>
                  {annual ? <> · ${Math.round(price * 12)}/yr</> : <> after 14-day trial</>}
                </div>
                <p className="text-muted text-xs mt-2 mb-3 line-clamp-1">{t.tagline}</p>

                <div className="bg-surface-2 border border-border rounded-lg p-2 mb-3">
                  <div className="text-accent text-sm font-extrabold">{t.articles}</div>
                  <div className="text-muted text-[0.7rem]">{t.sites}</div>
                </div>

                <ul className="space-y-1 text-xs mb-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <form
                    action={startCheckoutAction}
                    onSubmit={() => {
                      // Browser-pixel mid-funnel events. Value reports the
                      // immediate cash collected (trial fee) so attribution
                      // matches what Stripe actually charges today. The
                      // larger CompletePayment fires 14 days later when
                      // the trial converts to the monthly rate.
                      const value = t.trialFee;
                      try {
                        const w = window as unknown as { ttq?: { track?: (e: string, p: Record<string, unknown>) => void } };
                        // Fire both AddToCart and InitiateCheckout — pick
                        // either as TikTok campaign optimization goal.
                        // AddToCart gives more events for early-stage algo
                        // training when purchase volume is still low.
                        // Fire 3 distinct TikTok events so each is available
                        // as a campaign optimization goal. AddToCart and
                        // InitiateCheckout fire at the same moment (Subscribe
                        // click). AddPaymentInfo is a slightly tighter mid-
                        // funnel signal — server side fires it too with the
                        // same event_id pattern for dedup.
                        const props = {
                          value,
                          currency: "USD",
                          content_name: `${t.name} plan`,
                          content_id: t.name.toLowerCase(),
                          content_type: "product",
                        };
                        w.ttq?.track?.("AddToCart", props);
                        w.ttq?.track?.("InitiateCheckout", props);
                        w.ttq?.track?.("AddPaymentInfo", props);
                      } catch { /* ignore */ }
                      try {
                        const w = window as unknown as { rdt?: (e: string, a: string, p: Record<string, unknown>) => void };
                        w.rdt?.("track", "AddToCart", {
                          value,
                          currency: "USD",
                          itemCount: 1,
                        });
                      } catch { /* ignore */ }
                    }}
                  >
                    <input type="hidden" name="plan" value={t.name.toLowerCase()} />
                    <input type="hidden" name="cadence" value={annual ? "annual" : "monthly"} />
                    <button
                      type="submit"
                      className={`w-full px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                        t.accent
                          ? "bg-accent text-black hover:bg-accent/90"
                          : "bg-surface-2 text-text border border-border hover:bg-surface"
                      }`}
                    >
                      {t.cta}
                    </button>
                  </form>
                <div className="mt-1.5 text-center text-muted-2 text-[0.65rem]">
                  Cancel anytime during trial
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison matrix */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2 tracking-tight">
            Compare features
          </h2>
          <p className="text-muted text-center mb-8">
            Everything you get on each plan, side by side.
          </p>
          <div className="bg-card-grad border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-5 text-muted text-xs uppercase tracking-wider font-semibold">
                    Feature
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.name}
                      className={`text-center py-4 px-3 text-sm font-bold ${
                        t.accent ? "text-accent" : "text-text"
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-surface-2/30" : ""}>
                    <td className="py-3 px-5 text-text">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-3 px-3 text-center">
                        {v === true ? (
                          <span className="text-accent font-bold">✓</span>
                        ) : v === false ? (
                          <span className="text-muted-2">—</span>
                        ) : (
                          <span className="text-text text-xs font-semibold">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social proof / trust strip */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                stat: "1,000+",
                label: "articles published",
                blurb: "across hobby blogs and agency portfolios",
              },
              {
                stat: "<$0.50",
                label: "cost per article",
                blurb: "with our default Claude Sonnet 4.6 setup",
              },
              {
                stat: "14 days",
                label: "to first ranked page",
                blurb: "median for new sites with steady publishing",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card-grad border border-border rounded-2xl p-6 text-center"
              >
                <div className="text-4xl font-extrabold text-accent">{s.stat}</div>
                <div className="text-text font-bold mt-1">{s.label}</div>
                <div className="text-muted text-xs mt-2">{s.blurb}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ schema for Google rich result */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted text-center mb-8">
            Still on the fence? These usually help.
          </p>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group bg-card-grad border border-border rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-semibold text-text">
                  <span>{item.q}</span>
                  <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-muted text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Stop writing. Start ranking.
          </h2>
          <p className="text-muted text-lg mb-6">
            Spin up your first site, queue a handful of keywords, and have your first
            article live on WordPress in under 10 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/login" variant="primary">
              Start free →
            </LinkButton>
            <Link
              href="/features"
              className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-text no-underline"
            >
              See how it works
            </Link>
          </div>
          <p className="text-muted-2 text-xs mt-6">
            No credit card on Hobby. 14-day free trial on paid plans. Cancel anytime.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
