"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

type Tier = {
  name: string;
  tagline: string;
  priceMo: number;
  priceYr: number;
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
    priceMo: 0,
    priceYr: 0,
    accent: false,
    cta: "Start free",
    articles: "10 articles / mo",
    sites: "1 site",
    features: [
      "AI keyword research",
      "Claude-powered article generation",
      "Quality gates + drafts review",
      "WordPress auto-publish",
      "Activity log + cost tracking",
      "Bring your own Anthropic key",
    ],
  },
  {
    name: "Operator",
    tagline: "Run a portfolio of niche sites on autopilot.",
    priceMo: 29,
    priceYr: 23,
    accent: true,
    cta: "Start 14-day trial",
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
    priceMo: 149,
    priceYr: 119,
    accent: false,
    cta: "Talk to us",
    articles: "1,000 articles / mo",
    sites: "Unlimited sites",
    features: [
      "Everything in Operator",
      "Google Search Console integration",
      "Per-site daily caps & schedules",
      "White-label client reports",
      "Team seats (up to 5)",
      "Priority Anthropic capacity",
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
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-5">
            Simple, usage-based pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Pay for results, <span className="text-accent">not seats.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Pick the plan that matches your publishing volume. Cancel anytime. The
            articles you generate stay on your WordPress site forever.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
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

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-20">
          {TIERS.map((t) => {
            const price = annual ? t.priceYr : t.priceMo;
            return (
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
                  <span className="text-5xl font-extrabold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-muted text-sm">/month</span>
                </div>
                {annual && t.priceMo > 0 ? (
                  <div className="text-muted-2 text-xs mt-1">
                    billed ${price * 12}/yr · save ${(t.priceMo - t.priceYr) * 12}
                  </div>
                ) : null}
                <p className="text-muted text-sm mt-3 mb-5">{t.tagline}</p>

                <div className="bg-surface-2 border border-border rounded-lg p-3 mb-5">
                  <div className="text-accent text-lg font-extrabold">{t.articles}</div>
                  <div className="text-muted text-xs mt-0.5">{t.sites}</div>
                </div>

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
