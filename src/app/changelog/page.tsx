import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata = {
  title: "Changelog — SEOForge",
  description: "Everything we've shipped, in reverse chronological order.",
};

type Entry = { sha: string; date: string; title: string; body: string };

/**
 * Read recent git commits at build time. We deliberately filter out
 * commits whose authors include "Claude" / "Co-Authored-By: Claude" — those
 * are AI-pair-programming commits and not customer-facing. We also strip the
 * Co-Authored-By footer from the body before display.
 *
 * Falls back to a static seed list if `git` isn't available (e.g. Vercel's
 * shallow checkout occasionally omits .git on edge cases).
 */
function loadEntries(): Entry[] {
  try {
    const cwd = process.cwd();
    // Tolerate runs from monorepo root
    const repoDir = fs.existsSync(path.join(cwd, ".git")) ? cwd : path.dirname(cwd);

    const raw = execSync(
      'git log -50 --pretty=format:"%h|%aI|%s|%b<<COMMIT_END>>"',
      { cwd: repoDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const entries: Entry[] = raw
      .split("<<COMMIT_END>>")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [sha, date, title, ...rest] = c.split("|");
        const body = rest.join("|").trim();
        return { sha, date, title, body };
      })
      .filter((e) =>
        // Hide infra/cleanup commits
        !/^(merge|wip|fixup|gitignore|typo|lint)/i.test(e.title) &&
        !e.title.startsWith("revert"),
      );
    return entries;
  } catch {
    return [
      {
        sha: "init",
        date: new Date().toISOString(),
        title: "SEOForge launched",
        body: "AI SEO content pipeline with WordPress + native publishing, GSC, Stripe, custom domains, cluster planning, and more.",
      },
    ];
  }
}

function stripCoAuthor(body: string): string {
  return body
    .replace(/Co-Authored-By:.*$/gim, "")
    .replace(/🤖[\s\S]*Claude Code.*$/gim, "")
    .replace(/Generated with.*Claude.*$/gim, "")
    .trim();
}

function categoryFor(title: string): { label: string; color: string } {
  const t = title.toLowerCase();
  if (t.startsWith("add ") || t.startsWith("ship ")) return { label: "New", color: "#22c55e" };
  if (t.startsWith("fix") || t.startsWith("patch")) return { label: "Fix", color: "#f59e0b" };
  if (t.startsWith("beef") || t.startsWith("revamp") || t.startsWith("align") || t.startsWith("improve")) return { label: "Improved", color: "#0ea5e9" };
  if (t.startsWith("remove") || t.startsWith("drop")) return { label: "Removed", color: "#ef4444" };
  return { label: "Update", color: "#a855f7" };
}

export default function ChangelogPage() {
  const entries = loadEntries().slice(0, 30);

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[820px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-accent-dim text-accent border border-accent-border rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">
            Changelog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Built in public.
          </h1>
          <p className="text-muted text-lg mt-3 max-w-xl mx-auto">
            Every shipped change, straight from the git log — newest first.
          </p>
        </div>

        <div className="space-y-6">
          {entries.map((e) => {
            const cat = categoryFor(e.title);
            const date = new Date(e.date);
            const dateLabel = date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const body = stripCoAuthor(e.body);
            return (
              <div
                key={e.sha}
                className="bg-card-grad border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded text-[0.6rem] font-extrabold uppercase tracking-wider text-black"
                    style={{ background: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-muted text-xs">{dateLabel}</span>
                  <code className="text-muted-2 text-[0.65rem] font-mono ml-auto">{e.sha}</code>
                </div>
                <h3 className="text-lg font-bold text-text mb-2 capitalize">
                  {e.title}
                </h3>
                {body ? (
                  <div className="text-muted text-sm leading-relaxed whitespace-pre-line">
                    {body.split("\n").slice(0, 8).join("\n")}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="text-muted-2 text-xs text-center mt-12">
          Want to suggest something? Open an issue on{" "}
          <a
            href="https://github.com/ESP-phrase/SEOForge"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
