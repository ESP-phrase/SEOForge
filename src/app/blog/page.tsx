import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Panel } from "@/components/Panel";

export const dynamic = "force-dynamic";

const POSTS = [
  {
    slug: "post-1",
    date: "2026-04-22",
    tag: "Strategy",
    title: "Why we cap new domains at 2 articles per day",
    blurb:
      "The math on Google's spam-detection thresholds, why 'just dump 50 articles' fails, and how to ramp safely.",
  },
  {
    slug: "post-2",
    date: "2026-04-08",
    tag: "Engineering",
    title: "Internal linking that compounds — without an AI",
    blurb:
      "A 60-line algorithm that beats most paid SEO tools at finding the right articles to link.",
  },
  {
    slug: "post-3",
    date: "2026-03-26",
    tag: "Operator",
    title: "Running 18 SEO sites with one keyboard",
    blurb:
      "Tools, schedules, and the per-site rules that keep ten different niches from blurring together.",
  },
  {
    slug: "post-4",
    date: "2026-03-12",
    tag: "Strategy",
    title: "Programmatic vs editorial — when each one wins",
    blurb:
      "A flowchart for picking the right approach to a new niche site. With three real case studies.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-16">
        <div className="mb-12 max-w-2xl">
          <div className="text-accent text-xs font-bold uppercase tracking-wider mb-2">
            Blog
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Notes from <span className="text-accent">the operators</span> running SEOForge.
          </h1>
          <p className="text-muted text-lg mt-3">
            Strategy, engineering, and post-mortems from real sites we run.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {POSTS.map((p) => (
            <Panel key={p.slug}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold bg-accent-dim text-accent border border-accent-border rounded-full px-2.5 py-0.5">
                  {p.tag}
                </span>
                <span className="text-muted-2 text-xs">{p.date}</span>
              </div>
              <h2 className="text-lg font-bold leading-snug">
                <Link href="#" className="text-text hover:text-accent no-underline">
                  {p.title}
                </Link>
              </h2>
              <p className="text-muted text-sm mt-2 leading-relaxed">{p.blurb}</p>
              <Link
                href="#"
                className="inline-block mt-4 text-accent text-sm font-semibold no-underline hover:underline"
              >
                Read the post →
              </Link>
            </Panel>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted text-sm">
            New posts are draft-only right now. Follow updates on{" "}
            <a
              href="https://github.com/ESP-phrase/SEO"
              className="text-accent"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
