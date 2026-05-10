import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LinkButton } from "@/components/Button";
import { SparkIcon } from "@/components/Icons";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

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
            <LinkButton href="/login" size="lg">
              Start Free →
            </LinkButton>
            <LinkButton href="#demo" variant="secondary" size="lg">
              ▶ Watch Demo
            </LinkButton>
          </div>
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {["#bef848", "#fbbf24", "#60a5fa", "#a78bfa"].map((c, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-bg grid place-items-center text-xs font-black text-black"
                  style={{ background: c }}
                >
                  {["A", "M", "J", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-tile-amber text-sm" aria-label="5 stars">
                ★ ★ ★ ★ ★
              </div>
              <div className="text-muted text-xs">4.9/5 from 1,200+ marketers</div>
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

      {/* Trust strip */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-20 text-center">
        <div className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-6">
          Trusted by 4,000+ marketers and agencies worldwide
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 opacity-70">
          {["GrowthLab", "RankSpire", "Contently", "SEOVista", "TechFlow", "AuthorityLab"].map(
            (n) => (
              <div key={n} className="flex items-center gap-2 text-muted">
                <span
                  className="w-5 h-5 rounded-md bg-surface-2 border border-border grid place-items-center text-[0.55rem] font-black text-accent"
                  aria-hidden
                >
                  {n[0]}
                </span>
                <span className="font-semibold">{n}</span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Metrics strip */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "12.4M", l: "Words generated" },
            { v: "284K", l: "Articles published" },
            { v: "4,200+", l: "Sites scaled" },
            { v: "99.98%", l: "Uptime" },
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

      {/* Testimonials */}
      <section id="testimonials" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="text-center mb-12">
          <div className="text-accent text-[0.7rem] uppercase tracking-wider font-bold mb-3">
            Wall of love
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Built for operators who ship.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              q: "We went from 4 sites to 47 in a quarter. The pipeline just runs.",
              n: "Marcus Chen",
              r: "Founder · GrowthLab",
              c: "#fbbf24",
            },
            {
              q: "Cut our content ops cost by 80%. Rankings climbed instead of dropping.",
              n: "Jamie Park",
              r: "Head of SEO · TechFlow",
              c: "#60a5fa",
            },
            {
              q: "Replaced three contractors and a Zapier mess. Worth every cent.",
              n: "Kira Walsh",
              r: "Director · AuthorityLab",
              c: "#a78bfa",
            },
          ].map((t) => (
            <div
              key={t.n}
              className="bg-card-grad border border-border rounded-2xl p-6 hover:border-accent-border transition-colors"
            >
              <div className="text-accent text-2xl leading-none mb-3">&ldquo;</div>
              <p className="text-text leading-relaxed">{t.q}</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                <span
                  className="w-9 h-9 rounded-full grid place-items-center font-black text-black text-sm"
                  style={{ background: t.c }}
                >
                  {t.n[0]}
                </span>
                <div className="leading-tight">
                  <div className="font-bold text-sm">{t.n}</div>
                  <div className="text-muted text-xs">{t.r}</div>
                </div>
              </div>
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
              name: "Starter",
              price: "$0",
              cadence: "forever",
              blurb: "Try the engine on a single site.",
              features: ["1 site", "20 articles / month", "Keyword research", "Basic analytics"],
              cta: "Start Free",
              featured: false,
            },
            {
              name: "Scale",
              price: "$49",
              cadence: "/ month",
              blurb: "For operators running real volume.",
              features: [
                "Unlimited sites",
                "1,000 articles / month",
                "Auto-publishing",
                "Rank tracking",
                "Priority queue",
              ],
              cta: "Start Scale",
              featured: true,
            },
            {
              name: "Agency",
              price: "$199",
              cadence: "/ month",
              blurb: "Multi-client, white-label, audit logs.",
              features: [
                "Everything in Scale",
                "10,000 articles / month",
                "White-label reports",
                "API access",
                "Dedicated support",
              ],
              cta: "Talk to sales",
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
                  href="/login"
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
