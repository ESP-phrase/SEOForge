import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LinkButton } from "@/components/Button";
import { SparkIcon } from "@/components/Icons";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI SEO content on autopilot — generate, optimize, publish",
  description:
    "SEOForge generates SEO-optimized articles with Claude, runs SERP gap analysis, builds topic clusters, and auto-publishes to WordPress or native blogs. Free Hobby plan. From $0.30 per article.",
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  // If they're already signed in, send them straight to the dashboard.
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wider font-bold">
            <SparkIcon size={12} className="text-accent" />
            AI-powered SEO automation
          </div>
          <h1 className="text-5xl md:text-[4rem] font-extrabold tracking-tight leading-[1.05] mt-5">
            Scale SEO
            <br />
            <span className="text-accent">On Autopilot.</span>
          </h1>
          <p className="text-muted text-lg mt-5 max-w-md">
            Generate, optimize, and publish AI content across unlimited sites from one
            powerful dashboard.
          </p>
          <div className="flex gap-3 mt-7 flex-wrap">
            <LinkButton href="/pricing" size="lg">
              Start $5 trial →
            </LinkButton>
            <LinkButton href="#features" variant="secondary" size="lg">
              See how it works
            </LinkButton>
          </div>
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {[
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/55.jpg",
                "https://randomuser.me/api/portraits/women/68.jpg",
              ].map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full border-2 border-bg object-cover"
                />
              ))}
            </div>
            <div>
              <div className="text-text text-sm font-semibold">Indie & agency operators</div>
              <div className="text-muted text-xs">Built by SEO operators, for SEO operators</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 relative">
          <DashboardMockup />
        </div>
      </section>

      {/* Feature band */}
      <section id="features" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-12">
        <div className="bg-card-grad border border-border rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            tone="lime"
            icon={<BoltIcon />}
            title="AI Content Generation"
            body="Create high-quality, SEO-optimized content in seconds."
          />
          <Feature
            tone="blue"
            icon={<GlobeFillIcon />}
            title="Multi-site Management"
            body="Manage and scale content across unlimited websites."
          />
          <Feature
            tone="amber"
            icon={<ChartIcon />}
            title="Performance Tracking"
            body="Track rankings, traffic, and impressions in real time."
          />
          <Feature
            tone="violet"
            icon={<RobotIcon />}
            title="Full Automation"
            body="Queue keywords, schedule publishing, and grow on autopilot."
          />
        </div>
      </section>

      {/* Built on strip */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-20 text-center">
        <div className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-6">
          Powered by the best of the modern stack
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 opacity-80">
          {[
            { n: "Claude Sonnet 4.6", t: "Anthropic" },
            { n: "WordPress", t: "REST API" },
            { n: "Google Search Console", t: "Live data" },
            { n: "Next.js + Vercel", t: "Edge-fast" },
            { n: "Postgres · Neon", t: "Serverless DB" },
          ].map((b) => (
            <div key={b.n} className="flex items-center gap-2 text-muted">
              <span
                className="w-5 h-5 rounded-md bg-surface-2 border border-border grid place-items-center text-[0.55rem] font-black text-accent"
                aria-hidden
              >
                {b.n[0]}
              </span>
              <div className="text-left">
                <div className="text-text text-xs font-semibold">{b.n}</div>
                <div className="text-muted text-[0.6rem] uppercase tracking-wider">{b.t}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics strip */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "<$0.50", l: "Cost per article" },
            { v: "1,500+", l: "Avg word count" },
            { v: "10 min", l: "First article live" },
            { v: "14 days", l: "Median time to rank" },
          ].map((m) => (
            <div key={m.l} className="bg-bg-2 p-8 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-accent tracking-tight">
                {m.v}
              </div>
              <div className="text-muted text-xs mt-2 uppercase tracking-wider font-semibold">
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Big dashboard showcase */}
      <section className="relative pb-28 overflow-hidden">
        {/* Lime grid backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(190,248,72,1) 1px, transparent 1px), linear-gradient(90deg, rgba(190,248,72,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 75%)",
          }}
        />
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wider font-bold mb-5">
            <SparkIcon size={12} className="text-accent" />
            One dashboard. Every site.
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Run 100 SEO sites
            <br />
            from <span className="text-accent">one screen.</span>
          </h2>
          <p className="text-muted text-lg mt-5 max-w-xl mx-auto">
            Queue keywords by the thousand, track rankings in real-time, and let the
            pipeline publish while you sleep.
          </p>

          <div className="relative mt-14 max-w-[1200px] mx-auto">
            {/* Gradient border glow */}
            <div
              aria-hidden
              className="absolute -inset-px rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(190,248,72,0.45), rgba(190,248,72,0) 40%, rgba(190,248,72,0) 60%, rgba(190,248,72,0.35))",
                filter: "blur(0.5px)",
              }}
            />
            <div
              aria-hidden
              className="absolute -inset-20 -z-10"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 50%, rgba(190,248,72,0.18), transparent 70%)",
              }}
            />
            <div className="relative rounded-3xl overflow-hidden">
              <DashboardMockup variant="showcase" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="text-center mb-12">
          <div className="text-accent text-[0.7rem] uppercase tracking-wider font-bold mb-3">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Three steps. Zero babysitting.
          </h2>
          <p className="text-muted text-lg mt-3 max-w-xl mx-auto">
            From empty WordPress site to ranked article — without writing a single word yourself.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              title: "Connect your site",
              body: "Plug in your WordPress URL and an Application Password. We encrypt it with AES-256 and never store it in plaintext. Takes 60 seconds.",
            },
            {
              step: "02",
              title: "Queue keywords",
              body: "Type a topic or let Claude research keywords for you. Each one gets full SERP gap analysis so we know exactly how to rank it.",
            },
            {
              step: "03",
              title: "Publish on autopilot",
              body: "A daily cron generates the article, runs quality gates (1,500+ words, internal links, FAQ schema), and pushes it live to WordPress.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-card-grad border border-border rounded-2xl p-6 hover:border-accent-border transition-colors"
            >
              <div className="text-accent text-5xl font-extrabold leading-none mb-4">{s.step}</div>
              <h3 className="text-text text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="text-center mb-12">
          <div className="text-accent text-[0.7rem] uppercase tracking-wider font-bold mb-3">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Start free. Scale when you&rsquo;re ready.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
          {[
            {
              name: "Hobby",
              price: "$0",
              cadence: "forever",
              blurb: "Run a single niche site or weekend project.",
              features: [
                "1 site",
                "10 articles / month",
                "AI keyword research",
                "WordPress auto-publish",
              ],
              cta: "Start Free",
              featured: false,
            },
            {
              name: "Operator",
              price: "$29",
              cadence: "/ month",
              blurb: "Run a portfolio of niche sites on autopilot.",
              features: [
                "Up to 10 sites",
                "150 articles / month",
                "Daily cron auto-publish",
                "Self-hosted analytics",
                "Backlink outreach",
              ],
              cta: "Start 14-day trial",
              featured: true,
            },
            {
              name: "Agency",
              price: "$149",
              cadence: "/ month",
              blurb: "Manage client sites with usage-based caps.",
              features: [
                "Unlimited sites",
                "1,000 articles / month",
                "Search Console integration",
                "Team seats (up to 5)",
                "Slack support · 4h",
              ],
              cta: "Start 14-day trial",
              featured: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-7 ${
                p.featured
                  ? "bg-card-grad border-2 border-accent shadow-glow"
                  : "bg-card-grad border border-border"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.6rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-muted text-sm mt-1">{p.blurb}</div>
              <div className="flex items-end gap-1.5 mt-5">
                <div className="text-4xl font-extrabold tracking-tight">{p.price}</div>
                <div className="text-muted text-sm pb-1.5">{p.cadence}</div>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full bg-accent-dim grid place-items-center shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="text-text/90">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <LinkButton
                  href={p.price === "$0" ? "/login" : "/pricing"}
                  variant={p.featured ? "primary" : "secondary"}
                  full
                >
                  {p.cta}
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-accent-border bg-card-grad p-10 md:p-16 text-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(190,248,72,0.15), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Publish SEO content
              <br />
              <span className="text-accent">while you sleep.</span>
            </h2>
            <p className="text-muted text-lg mt-5 max-w-md mx-auto">
              Free to start. No credit card. Spin up your first site in under 60
              seconds.
            </p>
            <div className="flex gap-3 mt-8 justify-center flex-wrap">
              <LinkButton href="/login" size="lg">
                Start Free →
              </LinkButton>
              <LinkButton href="#pricing" variant="secondary" size="lg">
                See pricing
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

function Feature({
  tone,
  icon,
  title,
  body,
}: {
  tone: "lime" | "blue" | "amber" | "violet";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const toneCls = {
    lime: "bg-accent-dim text-accent",
    blue: "bg-tile-blue/15 text-tile-blue",
    amber: "bg-tile-amber/15 text-tile-amber",
    violet: "bg-tile-violet/15 text-tile-violet",
  }[tone];
  return (
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${toneCls}`}>
        {icon}
      </div>
      <div>
        <div className="font-bold text-base mb-1">{title}</div>
        <div className="text-muted text-sm leading-snug">{body}</div>
      </div>
    </div>
  );
}

function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  );
}
function GlobeFillIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" strokeLinecap="round" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 19h16" strokeLinecap="round" />
      <path d="m4 14 4-3 4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RobotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="7" width="16" height="13" rx="3" />
      <circle cx="9" cy="13" r="1.2" fill="currentColor" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      <path d="M12 4v3M9 17h6" strokeLinecap="round" />
    </svg>
  );
}
