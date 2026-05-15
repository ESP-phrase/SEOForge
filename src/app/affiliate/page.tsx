import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-static";

export const metadata = {
  title: "Affiliate Program — SEOForge",
  description: "Earn 30% recurring commissions for 12 months on every SEOForge customer you refer.",
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[900px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
            Partner program
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Earn <span className="text-accent">30% recurring</span>
            <br />
            on every customer you refer.
          </h1>
          <p className="text-muted text-lg mt-4 max-w-xl mx-auto">
            For 12 months. Paid monthly. No cap. No exclusivity.
          </p>
          <div className="mt-7">
            <Link
              href="/referrals"
              className="inline-block px-6 py-3 bg-accent text-black rounded-xl font-bold text-sm no-underline hover:bg-accent/90 transition-colors"
            >
              Get your referral link →
            </Link>
            <p className="text-muted-2 text-xs mt-2">
              Sign in if you haven&apos;t — link appears immediately in the dashboard.
            </p>
          </div>
        </div>

        {/* Math grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            { label: "Per Operator referral", value: "$8.70/mo", body: "30% of $29/mo for 12 months = $104.40 per customer" },
            { label: "Per Agency referral", value: "$44.70/mo", body: "30% of $149/mo for 12 months = $536.40 per customer" },
            { label: "10 active referrals", value: "$1,044+/yr", body: "Realistic for a creator with a small SEO audience" },
          ].map((m) => (
            <div key={m.label} className="bg-card-grad border border-border rounded-2xl p-5 text-center">
              <div className="text-muted text-[0.65rem] uppercase tracking-wider font-bold mb-1">
                {m.label}
              </div>
              <div className="text-3xl font-extrabold text-accent mb-2">{m.value}</div>
              <div className="text-muted text-xs leading-snug">{m.body}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-center">
            How it works
          </h2>
          <div className="space-y-3">
            {[
              { n: "1", title: "Sign up free", body: "Create a SEOForge account — takes 10 seconds with Google or email." },
              { n: "2", title: "Get your unique link", body: "Visit /affiliate in the dashboard. Copy your link (e.g. seoforge.org/?r=ABC123)." },
              { n: "3", title: "Share it", body: "Post on X / YouTube / your blog / your newsletter. Or DM clients who need SEO automation." },
              { n: "4", title: "Earn when they pay", body: "When your referral subscribes to Operator or Agency, you get 30% of their payments for 12 months. Paid monthly via PayPal or bank transfer." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 items-start p-4 bg-card-grad border border-border rounded-xl">
                <span className="shrink-0 w-9 h-9 rounded-full bg-accent text-black grid place-items-center font-extrabold">
                  {s.n}
                </span>
                <div>
                  <div className="font-bold text-text">{s.title}</div>
                  <div className="text-muted text-sm mt-0.5">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-center">
            Best fit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "SEO content creators on X / YouTube / LinkedIn",
              "Niche-site operators with audiences (Doc Sheldon, IndieHackers, etc.)",
              "Marketing agencies recommending tools to clients",
              "Newsletter writers in marketing, content, or AI",
              "WordPress / web dev consultants",
              "SaaS founders selling complementary tools",
            ].map((aud) => (
              <div key={aud} className="flex gap-2 items-start p-3 text-sm bg-surface-2 border border-border rounded-lg">
                <span className="text-accent shrink-0">✓</span>
                <span className="text-text">{aud}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-center">FAQ</h2>
          <div className="space-y-2">
            {[
              { q: "When am I paid?", a: "On the 15th of each month for the previous month's earnings. Minimum payout $50. Anything below rolls over." },
              { q: "How are payouts made?", a: "PayPal by default. Bank transfer (Wise) available for $500+ months." },
              { q: "Does it stack with discount codes?", a: "Yes. If the referred user uses a promo code, you still earn 30% of what they actually pay." },
              { q: "What if they cancel and resubscribe?", a: "The 12-month window starts on their first paid month. Cancellations pause commissions; resubscriptions inside the window resume them." },
              { q: "Do I need to be a paying customer?", a: "No. You can earn affiliate commissions even on the free Hobby plan." },
              { q: "Self-referrals?", a: "Not allowed — we cross-check signup IP and email." },
            ].map((item) => (
              <details key={item.q} className="group bg-card-grad border border-border rounded-xl">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-semibold text-text">
                  <span>{item.q}</span>
                  <span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <div className="bg-card-grad border border-accent-border rounded-2xl p-8 text-center shadow-glow">
          <h3 className="text-2xl font-extrabold mb-2">Get your affiliate link</h3>
          <p className="text-muted text-sm mb-5">
            Sign in — your unique referral URL appears in the dashboard.
          </p>
          <Link
            href="/referrals"
            className="inline-block px-6 py-3 bg-accent text-black rounded-xl font-bold text-sm no-underline"
          >
            Get your referral link →
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
