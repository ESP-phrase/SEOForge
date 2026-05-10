import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Panel } from "@/components/Panel";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    h: "Getting started",
    items: [
      ["Quickstart", "Sign in, add your first site, queue keywords, run."],
      ["Add a WordPress site", "Generate an Application Password, paste credentials, test the connection."],
      ["First article", "Paste a keyword, click Run, review the draft, publish."],
    ],
  },
  {
    h: "Working with content",
    items: [
      ["AI keyword research", "Use the ⚡ AI research panel to brainstorm long-tail candidates."],
      ["Quality gates", "min_word_count and FAQ checks hold weak articles back as drafts."],
      ["Internal linking", "Auto-applied on publish. Bias toward longer, more-specific phrases."],
      ["Categories and tags", "Claude assigns one category and 3–6 tags per article. Created in WP on first use."],
    ],
  },
  {
    h: "Operations",
    items: [
      ["Daily caps", "Set max_per_day per site. Defaults to 2."],
      ["Cron + auto-publish", "Configure Vercel Cron to call /api/cron daily."],
      ["Activity log", "Every run, publish, and quality-gate hold is logged with cost."],
    ],
  },
  {
    h: "Self-hosting",
    items: [
      ["Local dev", "SQLite + Resend + your Anthropic key. No external DB needed."],
      ["Vercel + Neon", "Switch the Prisma provider to postgresql, set Vercel env vars, push."],
      ["Backups", "Copy prisma/data/dev.db. For production, use Neon&rsquo;s point-in-time restore."],
    ],
  },
  {
    h: "Reference",
    items: [
      ["Schema", "Sites, keywords, articles, runs, social_posts, users (Auth.js standard)."],
      ["Encryption", "WP Application Passwords are AES-256-GCM encrypted with ENCRYPTION_KEY."],
      ["API endpoints", "/api/cron, /api/research, /api/sites/[id]/keywords."],
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <div className="text-accent text-xs font-bold uppercase tracking-wider mb-2">
            Documentation
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Get from zero to your <span className="text-accent">first published article.</span>
          </h1>
          <p className="text-muted text-lg mt-3 max-w-2xl">
            Below is the short tour. The full reference lives in the README on{" "}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {SECTIONS.map((s) => (
            <Panel key={s.h} title={s.h}>
              <ul className="space-y-3">
                {s.items.map(([title, body]) => (
                  <li key={title}>
                    <div className="text-text font-semibold text-sm">{title}</div>
                    <div
                      className="text-muted text-sm leading-snug"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <div className="mt-12 text-center text-muted text-sm">
          Looking for something specific?{" "}
          <a
            href="https://github.com/ESP-phrase/SEO/issues/new"
            className="text-accent"
            target="_blank"
            rel="noreferrer"
          >
            Open a GitHub issue
          </a>
          .
        </div>
        <div className="mt-2 text-center text-muted-2 text-xs">
          Or skip the docs:{" "}
          <Link href="/login" className="text-accent">
            sign in and try it
          </Link>
          .
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
