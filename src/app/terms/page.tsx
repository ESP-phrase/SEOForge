import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "Terms of Service — SEOForge",
  description: "The terms you agree to by using SEOForge.",
};

const UPDATED = "May 14, 2026";
const CONTACT = "aubreynicholsacc@gmail.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[820px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
            Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted text-sm mt-3">Last updated: {UPDATED}</p>
        </div>

        <div className="space-y-8 text-text/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2 text-text">1. Agreement</h2>
            <p className="text-muted">
              By creating an account or using SEOForge (the &ldquo;Service&rdquo;) at
              seoforge.org and any subdomain, you agree to these Terms. If you
              don&apos;t agree, don&apos;t use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">2. Eligibility</h2>
            <p className="text-muted">
              You must be at least 16 years old. You agree to provide accurate signup
              info and to keep your credentials secure. You are responsible for all
              activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">3. What SEOForge does</h2>
            <p className="text-muted">
              SEOForge generates SEO articles using AI (Anthropic Claude) and publishes
              them to your WordPress site or our native blog hosting. We also offer
              keyword research, topic cluster planning, SEO scorecards, backlink
              outreach helpers, and Google Search Console integration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">4. Your content</h2>
            <p className="text-muted">
              You own the articles, keywords, and other content generated through your
              account. We don&apos;t claim ownership. We may use anonymized,
              aggregated data (e.g. &ldquo;our users published X articles last month&rdquo;)
              for marketing.
            </p>
            <p className="text-muted mt-2">
              You are responsible for the legal use of generated content — including
              copyright, defamation, and disclosure requirements that apply to AI-generated
              material in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">5. Acceptable use</h2>
            <p className="text-muted mb-2">You agree NOT to use SEOForge to:</p>
            <ul className="list-disc ml-5 space-y-1 text-muted">
              <li>Generate illegal, defamatory, or harassing content.</li>
              <li>Spam, scrape, or violate any other platform&apos;s terms (e.g. Google&apos;s Webmaster Guidelines, WordPress.com policies).</li>
              <li>Generate content that infringes copyright or trademarks you don&apos;t own.</li>
              <li>Reverse engineer or attempt to extract our prompts or model weights.</li>
              <li>Resell SEOForge&apos;s output as your own AI service.</li>
              <li>Bypass usage limits, share accounts, or use multiple free accounts to dodge billing.</li>
            </ul>
            <p className="text-muted mt-2">
              Violations may result in account suspension without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">6. Billing</h2>
            <ul className="list-disc ml-5 space-y-1 text-muted">
              <li>Paid plans are billed monthly or annually in advance via Stripe.</li>
              <li>Article credits reset on each renewal. Unused credits do not roll over.</li>
              <li>Overage articles billed at the per-article rate listed on the pricing page.</li>
              <li>You can cancel anytime in the billing portal. Access continues through the end of the paid period.</li>
              <li><strong className="text-text">Refunds:</strong> we offer a 7-day money-back guarantee on first-time subscriptions. After 7 days, no refunds.</li>
              <li>Free Hobby plan has no card on file and can be downgraded to at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">7. AI-generated content disclaimer</h2>
            <p className="text-muted">
              SEOForge uses third-party AI models (Anthropic Claude). Generated content
              may contain inaccuracies, fabricated citations, or biased statements. You
              are responsible for reviewing all output before publishing. We do not
              guarantee SEO rankings, traffic, or revenue outcomes — search engine
              algorithms are outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">8. Service availability</h2>
            <p className="text-muted">
              We aim for high uptime but make no guarantee. Scheduled maintenance,
              third-party outages (Anthropic, Stripe, Vercel, Neon, Google), or force
              majeure may interrupt service. No SLA on Hobby or Operator plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">9. Limitation of liability</h2>
            <p className="text-muted">
              To the maximum extent permitted by law, SEOForge is not liable for:
              lost revenue, lost rankings, lost data, indirect, incidental, or
              consequential damages. Our total liability is capped at the amount you
              paid us in the 3 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">10. Termination</h2>
            <p className="text-muted">
              You can delete your account anytime by emailing us. We may suspend or
              terminate accounts that violate these Terms, with notice when feasible.
              Generated content remains yours after termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">11. Changes</h2>
            <p className="text-muted">
              We may update these Terms. Material changes will be announced 14 days in
              advance via email. Continued use after that date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">12. Governing law</h2>
            <p className="text-muted">
              These Terms are governed by the laws of the United States. Any dispute
              will be resolved in the courts of the operator&apos;s state of residence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">13. Contact</h2>
            <p className="text-muted">
              Questions:{" "}
              <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">
                {CONTACT}
              </a>
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
