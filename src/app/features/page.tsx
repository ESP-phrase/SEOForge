import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Panel } from "@/components/Panel";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Features — Topic clusters, GSC, auto-publish, anchor analysis",
  description:
    "Every SEO feature SEOForge ships: AI cluster planner, SERP gap analysis, WordPress auto-publish, Google Search Console, anchor-text diversity, backlink outreach, internal linking, schema markup.",
  alternates: { canonical: "/features" },
};

const FEATURES = [
  {
    title: "Multi-site management",
    body: "One dashboard for unlimited WordPress sites. Each site has its own niche, audience, expert voice, daily cap, and credentials — all stored encrypted at rest.",
  },
  {
    title: "AI keyword research",
    body: "Paste a seed term. Claude proposes 30+ long-tail candidates with intent tags that a new domain can realistically rank for in 3-6 months.",
  },
  {
    title: "Article generator",
    body: "Claude Sonnet 4.6 writes the post with H2/H3 structure, FAQ, JSON-LD schema, category, and tags. Internal linking happens automatically against your past articles.",
  },
  {
    title: "Quality gates",
    body: "Articles below your minimum word count or missing FAQ are held back as drafts for human review. Nothing low-quality reaches WordPress automatically.",
  },
  {
    title: "Daily caps",
    body: "Per-site rate limits keep new domains under Google's spam radar. 1–2 articles/day at launch, scale up after 4–6 weeks of clean indexing.",
  },
  {
    title: "WordPress publisher",
    body: "REST API integration that creates posts, categories, and tags on the fly. Drafts go to your WP admin queue; flip to auto-publish when you're confident.",
  },
  {
    title: "Cost tracking",
    body: "Every article logs token cost in the database. See per-site monthly spend on Anthropic at a glance.",
  },
  {
    title: "Activity log",
    body: "Every generation, publish, and quality-gate hold is recorded with timestamp, status, message, and cost. Filter by site or browse globally.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Everything you need to <span className="text-accent">scale SEO content.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            A single dashboard handles keyword research, article generation, internal linking,
            publishing, and tracking — across as many WordPress sites as you can run.
          </p>
        </div>
        {/* 8 features — 4 cols on lg gives a perfect 4/4 split instead of 3/3/2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Panel key={f.title} title={f.title}>
              <p className="text-muted text-sm leading-relaxed">{f.body}</p>
            </Panel>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
