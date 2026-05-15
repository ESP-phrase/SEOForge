import Link from "next/link";
import { createSiteAction } from "@/actions/sites";
import { SiteForm } from "@/components/SiteForm";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="max-w-[1100px] mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,720px)_300px] gap-6 justify-center">
      {/* Form column */}
      <div className="min-w-0">
        <SiteForm action={createSiteAction} error={error} />
      </div>

      {/* Sidebar with tips */}
      <aside className="space-y-4 xl:sticky xl:top-24 self-start">
        {/* What happens next */}
        <div className="bg-card-grad border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4 text-text">What happens next?</h3>
          <ol className="space-y-3.5">
            {[
              {
                title: "Connect your site",
                body: "Securely connect your WordPress site or choose our hosted blog.",
              },
              {
                title: "We verify access",
                body: "We'll verify your credentials and permissions.",
              },
              {
                title: "You're ready to go",
                body: "Start creating and publishing SEO-optimized content in minutes.",
              },
            ].map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-black grid place-items-center text-xs font-extrabold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-text text-sm font-bold leading-tight">{s.title}</div>
                  <div className="text-muted text-xs mt-0.5 leading-snug">{s.body}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-card-grad border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4 text-text">Tips</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 border border-border grid place-items-center text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div>
                <div className="text-text font-semibold leading-tight">
                  Use an application password
                </div>
                <div className="text-muted text-xs mt-0.5 leading-snug">
                  Create one in your WordPress profile for better security.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 border border-border grid place-items-center text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </span>
              <div>
                <div className="text-text font-semibold leading-tight">
                  Choose a short memorable slug
                </div>
                <div className="text-muted text-xs mt-0.5 leading-snug">
                  This becomes part of your blog URL.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 border border-border grid place-items-center text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              </span>
              <div>
                <div className="text-text font-semibold leading-tight">
                  Expert voice matters
                </div>
                <div className="text-muted text-xs mt-0.5 leading-snug">
                  The more specific, the better Claude can write in your voice.
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Need help */}
        <div className="bg-card-grad border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1 text-text">Need help?</h3>
          <p className="text-muted text-xs leading-snug mb-3">
            Check our documentation or reach out to support if you run into any issues.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs font-semibold text-text hover:bg-surface no-underline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View docs
          </Link>
        </div>
      </aside>
    </div>
  );
}
