import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata = {
  title: "Roadmap — SEOForge",
  description:
    "What we're working on now, what's next, and what we've shipped. Built in public.",
};

type Status = "live" | "now" | "next" | "later";

type Item = {
  title: string;
  body: string;
  status: Status;
};

const ROADMAP: Item[] = [
  // ─── LIVE ───
  { title: "AI article generation (Claude Sonnet 4.6)", body: "SERP gap analysis, internal linking, FAQ schema, quality gates.", status: "live" },
  { title: "WordPress auto-publish via REST API", body: "Application Passwords encrypted with AES-256-GCM.", status: "live" },
  { title: "Native blog hosting", body: "Publish to /blog/<slug> on your own custom domain — no WordPress required.", status: "live" },
  { title: "Custom domain attach via Vercel API", body: "One-click domain connect with DNS instructions + SSL auto-provisioning.", status: "live" },
  { title: "Topic cluster planner", body: "1 pillar + 12 articles, auto-linked, queued in one click.", status: "live" },
  { title: "Google Search Console integration", body: "Real impressions, clicks, queries, avg position per article.", status: "live" },
  { title: "Backlink outreach workbench", body: "Resource-page search + AI-drafted pitch emails.", status: "live" },
  { title: "HARO / source-request drafter", body: "Paste a reporter query, Claude writes a quotable response.", status: "live" },
  { title: "Anchor-text diversity analyzer", body: "Import backlinks, see if your profile looks risky to Google.", status: "live" },
  { title: "SEO scorecard per article", body: "12-check on-page audit with letter grades.", status: "live" },
  { title: "Per-site theme colors", body: "4-color palette per site, 6 named presets, applied to every article.", status: "live" },
  { title: "Stripe subscriptions", body: "Hobby / Operator / Agency with credit metering + billing portal.", status: "live" },
  { title: "Microsoft Clarity proxied", body: "Session recordings + heatmaps via first-party path.", status: "live" },

  // ─── NOW (building) ───
  { title: "Welcome + low-credit emails (Resend)", body: "Transactional emails for new signups and credit-low warnings.", status: "now" },
  { title: "Affiliate program", body: "30% recurring for 12 months. Self-serve signup, referral link, dashboard.", status: "now" },
  { title: "Manual blog content for seoforge.org", body: "Hand-written cornerstone articles on AI SEO, programmatic SEO, niche-site playbooks.", status: "now" },

  // ─── NEXT (planned, next 30 days) ───
  { title: "Stripe live mode", body: "Move from test mode to real charges once trial flow is fully verified.", status: "next" },
  { title: "Microsoft OAuth login", body: "Adds Office 365 / Outlook coverage for agency users.", status: "next" },
  { title: "Inline article editor", body: "Edit Claude's output in-app before publishing instead of WordPress.", status: "next" },
  { title: "Automatic article refresh suggestions", body: "Score-driven recommendations: 'this 6-month-old article will rank if you regenerate'.", status: "next" },
  { title: "Multi-language content generation", body: "Spanish, German, French, Portuguese to start.", status: "next" },
  { title: "Stripe usage-based billing", body: "Pay-per-article tier for users between Hobby and Operator.", status: "next" },

  // ─── LATER (eventually) ───
  { title: "Image generation per article", body: "Featured images via Flux or similar, sized for WP + native blog.", status: "later" },
  { title: "YouTube → blog post converter", body: "Pull a YouTube transcript, restructure as an SEO article with chapter timestamps.", status: "later" },
  { title: "Slack / Discord bot for run alerts", body: "Notifications when articles publish, when credits run low, when GSC rankings change.", status: "later" },
  { title: "Team seats + RBAC", body: "Agency-tier feature: invite editors with limited permissions per site.", status: "later" },
  { title: "Public API", body: "Programmatic article generation for power users.", status: "later" },
  { title: "White-label / customer subdomain branding", body: "Agency users serve articles from client domains under their own brand.", status: "later" },
];

const SECTIONS: { id: Status; label: string; blurb: string; color: string }[] = [
  { id: "now", label: "Shipping now", blurb: "Currently being built. Live within the next 1-2 weeks.", color: "#22c55e" },
  { id: "next", label: "Up next", blurb: "Queued for the next ~30 days.", color: "#0ea5e9" },
  { id: "later", label: "Later", blurb: "On the roadmap but not scheduled yet.", color: "#a855f7" },
  { id: "live", label: "Already shipped", blurb: "Available in production today.", color: "#bef848" },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[900px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
            Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Built in public.
          </h1>
          <p className="text-muted text-lg mt-3 max-w-xl mx-auto">
            What we&apos;re building, what&apos;s next, what we&apos;ve shipped. Want
            something on this list? Email{" "}
            <a
              href="mailto:aubreynicholsacc@gmail.com"
              className="text-accent hover:underline"
            >
              aubreynicholsacc@gmail.com
            </a>
            .
          </p>
        </div>

        {SECTIONS.map((section) => {
          const items = ROADMAP.filter((r) => r.status === section.id);
          if (items.length === 0) return null;
          return (
            <section key={section.id} className="mb-12">
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: section.color }}
                />
                <h2 className="text-xl font-extrabold text-text">{section.label}</h2>
                <span className="text-muted-2 text-xs">{items.length}</span>
              </div>
              <p className="text-muted text-sm mb-5">{section.blurb}</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.title}
                    className="bg-card-grad border border-border rounded-xl p-4 flex gap-3 items-start"
                  >
                    <span
                      className="shrink-0 w-2 h-2 rounded-full mt-2"
                      style={{ background: section.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-text text-sm">{item.title}</div>
                      <div className="text-muted text-xs mt-0.5 leading-snug">
                        {item.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-12 p-6 bg-card-grad border border-accent-border rounded-2xl text-center shadow-glow">
          <h3 className="text-lg font-extrabold mb-1">Have a feature request?</h3>
          <p className="text-muted text-sm mb-4">
            We prioritize what paying customers ask for. Hit reply on any email or use
            the link below.
          </p>
          <a
            href="mailto:aubreynicholsacc@gmail.com?subject=SEOForge%20feature%20request"
            className="inline-block px-5 py-2.5 bg-accent text-black rounded-xl font-bold text-sm no-underline hover:bg-accent/90 transition-colors"
          >
            Suggest a feature →
          </a>
        </div>

        <p className="text-muted-2 text-xs text-center mt-8">
          See exact code changes on{" "}
          <Link href="/changelog" className="text-accent hover:underline">
            our changelog
          </Link>
          .
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
