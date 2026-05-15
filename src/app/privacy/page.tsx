import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "Privacy Policy — SEOForge",
  description: "How SEOForge collects, uses, and protects your data.",
};

const UPDATED = "May 14, 2026";
const CONTACT = "aubreynicholsacc@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[820px] mx-auto px-6 md:px-10 py-16 prose-policy">
        <div className="text-center mb-12">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
            Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted text-sm mt-3">Last updated: {UPDATED}</p>
        </div>

        <div className="space-y-8 text-text/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2 text-text">1. What this covers</h2>
            <p className="text-muted">
              This policy explains what data SEOForge (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects
              when you use seoforge.org and any subdomain, and what we do with it. By using
              the service you agree to this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">2. Data we collect</h2>
            <p className="text-muted mb-2">When you sign up and use SEOForge, we collect:</p>
            <ul className="list-disc ml-5 space-y-1 text-muted">
              <li><strong className="text-text">Account data:</strong> email address, name, and a profile photo URL if you sign in with Google or X.</li>
              <li><strong className="text-text">WordPress credentials:</strong> if you connect a WordPress site, we store the URL, username, and an encrypted application password (AES-256-GCM). We never see the plaintext after submission.</li>
              <li><strong className="text-text">Generated content:</strong> articles, keywords, and metadata produced by the AI pipeline. You own this content.</li>
              <li><strong className="text-text">Billing info:</strong> if you subscribe, Stripe processes your card. We store only the Stripe customer ID and subscription state — not card numbers.</li>
              <li><strong className="text-text">Usage data:</strong> requests, costs, error logs needed to run the service.</li>
              <li><strong className="text-text">Behavioral analytics:</strong> Microsoft Clarity records anonymized session replays and heatmaps. No keystroke or password capture.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">3. Third-party services we share data with</h2>
            <p className="text-muted mb-2">
              SEOForge sends some of your data to vendors that help the product run.
              Each has their own privacy policy.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-muted">
              <li><strong className="text-text">Anthropic</strong> — your keyword and site context is sent to Claude to generate articles.</li>
              <li><strong className="text-text">Google Search Console</strong> — if you connect, we read impressions/clicks/queries for your site.</li>
              <li><strong className="text-text">Stripe</strong> — payment processing.</li>
              <li><strong className="text-text">Neon (Postgres)</strong> — primary database hosting.</li>
              <li><strong className="text-text">Vercel</strong> — application hosting and deployment.</li>
              <li><strong className="text-text">Microsoft Clarity</strong> — anonymized session analytics.</li>
              <li><strong className="text-text">Google / X (Twitter)</strong> — OAuth sign-in.</li>
              <li><strong className="text-text">SerpApi, Unsplash</strong> — public SERP data and hero images (no personal data shared).</li>
              <li><strong className="text-text">Resend</strong> — transactional email (welcome, billing, notifications).</li>
            </ul>
            <p className="text-muted mt-2">
              We never sell your data to advertisers or list brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">4. Cookies</h2>
            <p className="text-muted">
              We use a session cookie to keep you logged in, a CSRF cookie for security,
              and analytics cookies for Microsoft Clarity. No third-party advertising
              cookies are placed by us. You can disable cookies in your browser, but
              sign-in won&apos;t work without the session cookie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">5. Your rights (GDPR / CCPA)</h2>
            <ul className="list-disc ml-5 space-y-1 text-muted">
              <li><strong className="text-text">Access:</strong> request a copy of your data by emailing us.</li>
              <li><strong className="text-text">Deletion:</strong> request account + data deletion by emailing us. We will delete within 30 days.</li>
              <li><strong className="text-text">Portability:</strong> generated articles can be exported via WordPress or your blog feed.</li>
              <li><strong className="text-text">Opt-out of analytics:</strong> use a browser ad-blocker or contact us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">6. Security</h2>
            <p className="text-muted">
              WordPress passwords are encrypted at rest with AES-256-GCM. Database
              connections use TLS. Sessions expire after 14 days. We run on Vercel + Neon
              infrastructure with industry-standard security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">7. Children</h2>
            <p className="text-muted">
              SEOForge is not intended for users under 16. We do not knowingly collect
              data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">8. Changes</h2>
            <p className="text-muted">
              We may update this policy. Material changes will be announced via email or
              an in-app banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-text">9. Contact</h2>
            <p className="text-muted">
              Questions or data requests:{" "}
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
