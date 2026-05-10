/**
 * Static stylised preview of the dashboard rendered inside the landing-page
 * hero. Hardcoded numbers + a tilted browser-frame look. Pure decoration —
 * does not connect to the database.
 */
export function DashboardMockup({ variant = "hero" }: { variant?: "hero" | "showcase" } = {}) {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(190, 248, 72, 0.15), transparent 70%)",
        }}
      />

      {/* Browser frame */}
      <div className="relative bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden shadow-panel">
        <div className="grid grid-cols-[140px_1fr] min-h-[480px]">
          {/* Mini sidebar */}
          <aside className="bg-bg-2 border-r border-border p-3 flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1.5 mb-3">
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
                <rect width="64" height="64" rx="14" fill="#bef848" />
                <path d="M40 16 H22 a8 8 0 0 0 0 16 h12 a8 8 0 0 1 0 16 H16" stroke="#000" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="14" r="4" fill="#000" />
              </svg>
              <span className="font-bold text-xs">SEOForge</span>
            </div>
            <NavItem label="Sites" active />
            <NavItem label="Add site" />
            <NavItem label="Activity" />
            <NavItem label="Reports" />
            <NavItem label="Settings" />
            <NavItem label="Integrations" />
            <div className="mt-auto bg-surface border border-border rounded-lg p-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent grid place-items-center text-[0.6rem] font-black text-black">
                A
              </span>
              <div className="leading-tight">
                <div className="text-[0.6rem] font-bold">Aubrey N.</div>
                <div className="text-[0.55rem] text-muted">Pro Plan</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="p-4">
            {/* Header */}
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <div className="font-extrabold text-base flex items-center gap-1">
                  SEO Dashboard
                  <span className="text-accent">✦</span>
                </div>
                <div className="text-muted text-[0.6rem]">
                  Multi-site AI content pipeline · published, queued, and in-progress at a glance
                </div>
              </div>
              <div className="flex gap-1.5">
                <FakeBtn primary>+ Add site</FakeBtn>
                <FakeBtn>View activity</FakeBtn>
              </div>
            </div>

            {/* Filter row */}
            <div className="flex gap-1.5 mb-3">
              <FakeFilter label="Site" value="All sites" />
              <FakeFilter label="Status" value="All statuses" />
              <FakeFilter label="Range" value="Last 30 days" />

              {/* Pipeline mini card */}
              <div className="ml-auto bg-surface-2 border border-border rounded-md px-2.5 py-1 flex flex-col">
                <div className="text-[0.5rem] uppercase tracking-wider text-muted font-bold">
                  Pipeline
                </div>
                <div className="font-extrabold text-sm">+152</div>
                <div className="flex items-end gap-0.5 h-5 mt-0.5">
                  {[3, 5, 4, 7, 6, 9, 8].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-accent rounded-sm"
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 6 metric tiles */}
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {[
                { l: "Total Sites", v: "24", t: "+3 this month", c: "tile-yellow" },
                { l: "Published", v: "152", t: "+18 this month", c: "tile-green" },
                { l: "Queued", v: "48", t: "+7 this month", c: "tile-amber" },
                { l: "In Progress", v: "23", t: "+5 this month", c: "tile-blue" },
                { l: "Avg. SEO Score", v: "86", t: "+6 pts", c: "tile-violet" },
                { l: "Impressions", v: "128K", t: "+24.6%", c: "tile-cyan" },
              ].map((m) => (
                <div key={m.l} className="bg-surface border border-border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[0.5rem] text-muted font-medium leading-tight">
                      {m.l}
                    </div>
                    <span
                      className={`w-3.5 h-3.5 rounded-sm grid place-items-center bg-${m.c}/15`}
                      aria-hidden
                    />
                  </div>
                  <div className="font-extrabold text-base mt-1.5 leading-none">{m.v}</div>
                  <div className="text-[0.5rem] text-success mt-1">{m.t}</div>
                </div>
              ))}
            </div>

            {/* Pipeline chart + top sites */}
            <div className="grid grid-cols-12 gap-1.5">
              <div className="col-span-7 bg-surface border border-border rounded-md p-2">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[0.7rem]">Content Pipeline Overview</div>
                  <div className="text-[0.55rem] text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                    Last 30 days ▾
                  </div>
                </div>
                <div className="flex gap-2 text-[0.55rem] text-muted mt-1.5">
                  <Legend color="#4ade80" label="Published" />
                  <Legend color="#facc15" label="Queued" />
                  <Legend color="#60a5fa" label="In Progress" />
                  <Legend color="#9ca3af" label="Draft" />
                </div>
                <MiniLineChart />
                <div className="flex justify-between text-[0.5rem] text-muted-2 mt-1">
                  {["Apr 10", "Apr 16", "Apr 22", "Apr 28", "May 4", "May 9"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>

              {variant === "showcase" ? (
                <BuildLogPanel />
              ) : (
                <TopSitesPanel />
              )}
            </div>
          </div>
        </div>

        {/* Bottom-right corner accent dots */}
        <div
          aria-hidden
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-accent shadow-glow"
        />
      </div>
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[0.65rem] font-medium mb-0.5 ${
        active ? "bg-accent text-black font-bold" : "text-muted"
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-sm bg-current/20" />
      {label}
    </div>
  );
}

function FakeBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span
      className={`text-[0.6rem] px-2 py-1 rounded-md font-bold ${
        primary
          ? "bg-accent text-black"
          : "bg-surface-2 border border-border text-text"
      }`}
    >
      {children}
    </span>
  );
}

function FakeFilter({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded px-1.5 py-0.5 flex flex-col leading-tight">
      <span className="text-[0.5rem] text-accent uppercase tracking-wider font-bold">
        {label}
      </span>
      <span className="text-[0.6rem] text-text">{value}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniLineChart() {
  // 4 deterministic series climbing left-to-right
  const series = [
    { color: "#4ade80", base: [10, 18, 24, 30, 38, 50, 64, 72, 88, 96] },
    { color: "#facc15", base: [6, 12, 18, 22, 28, 34, 38, 44, 52, 58] },
    { color: "#60a5fa", base: [4, 8, 11, 14, 18, 22, 26, 30, 36, 42] },
    { color: "#9ca3af", base: [2, 3, 4, 5, 6, 6, 7, 8, 9, 11] },
  ];
  const W = 360;
  const H = 90;
  const xAt = (i: number) => (i / (series[0].base.length - 1)) * (W - 20) + 10;
  const yAt = (v: number) => H - 4 - (v / 100) * (H - 12);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-1.5" preserveAspectRatio="none" style={{ height: 90 }}>
      {[20, 50, 80].map((y) => (
        <line key={y} x1={10} y1={y} x2={W - 10} y2={y} stroke="#1a1a1a" strokeWidth={0.5} />
      ))}
      {series.map((s, si) => {
        const path = s.base
          .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
          .join(" ");
        const lastIdx = s.base.length - 1;
        return (
          <g key={si}>
            <path d={path} fill="none" stroke={s.color} strokeWidth={1.4} strokeLinejoin="round" />
            <circle cx={xAt(lastIdx)} cy={yAt(s.base[lastIdx])} r={2} fill={s.color} />
            <circle cx={xAt(lastIdx)} cy={yAt(s.base[lastIdx])} r={4.5} fill={s.color} fillOpacity="0.2" />
          </g>
        );
      })}
    </svg>
  );
}

function TopSitesPanel() {
  return (
    <div className="col-span-5 bg-surface border border-border rounded-md p-2">
      <div className="flex justify-between items-center">
        <div className="font-bold text-[0.7rem]">Top Performing Sites</div>
        <div className="text-[0.55rem] text-accent">View all</div>
      </div>
      <div className="grid grid-cols-[14px_1fr_auto_auto_auto] gap-x-1.5 mt-2 text-[0.55rem] text-muted-2 uppercase tracking-wider">
        <span />
        <span>Site</span>
        <span>SEO Score</span>
        <span>Impressions</span>
        <span>Trend</span>
      </div>
      {[
        { n: "techflow.io", color: "#fbbf24", score: 92, imp: "32.4K" },
        { n: "growthlab.co", color: "#4ade80", score: 88, imp: "21.7K" },
        { n: "contently.ai", color: "#60a5fa", score: 85, imp: "18.9K" },
        { n: "rankspire.com", color: "#fb923c", score: 82, imp: "14.2K" },
        { n: "seovista.dev", color: "#a78bfa", score: 78, imp: "10.3K" },
      ].map((s, i) => (
        <div
          key={s.n}
          className="grid grid-cols-[14px_1fr_auto_auto_auto] items-center gap-x-1.5 py-1 border-t border-border text-[0.6rem]"
        >
          <span className="w-3.5 h-3.5 rounded-sm" style={{ background: s.color }} aria-hidden />
          <span className="font-semibold truncate">{s.n}</span>
          <span className="bg-surface-2 px-1.5 py-0.5 rounded text-[0.55rem] font-bold border border-border">
            {s.score}
          </span>
          <span className="text-muted text-[0.55rem]">{s.imp}</span>
          <MiniSpark seed={i} />
        </div>
      ))}
    </div>
  );
}

type BuildStatus = "published" | "optimizing" | "drafting" | "queued" | "failed";

const STATUS_STYLE: Record<BuildStatus, { dot: string; pill: string; label: string }> = {
  published:  { dot: "#bef848", pill: "bg-accent-dim text-accent border-accent-border", label: "Published" },
  optimizing: { dot: "#60a5fa", pill: "bg-tile-blue/15 text-tile-blue border-tile-blue/30", label: "Optimizing" },
  drafting:   { dot: "#fbbf24", pill: "bg-tile-amber/15 text-tile-amber border-tile-amber/30", label: "Drafting" },
  queued:     { dot: "#7a7a7a", pill: "bg-surface-2 text-muted border-border", label: "Queued" },
  failed:     { dot: "#f87171", pill: "bg-danger/15 text-danger border-danger/30", label: "Failed" },
};

function BuildLogPanel() {
  const entries: { t: string; site: string; title: string; status: BuildStatus }[] = [
    { t: "12:04:21", site: "techflow.io",   title: "best react component libraries 2026",      status: "published"  },
    { t: "12:03:58", site: "growthlab.co",  title: "how to scale paid acquisition past $1M",   status: "optimizing" },
    { t: "12:03:12", site: "contently.ai",  title: "writing system prompts that actually work", status: "drafting"   },
    { t: "12:02:47", site: "rankspire.com", title: "site speed audits: a 2026 checklist",      status: "published"  },
    { t: "12:02:09", site: "seovista.dev",  title: "internal linking patterns that compound",  status: "optimizing" },
    { t: "12:01:33", site: "techflow.io",   title: "next.js 15 server actions in production",  status: "queued"     },
    { t: "12:00:58", site: "authoritylab",  title: "programmatic seo for b2b saas",            status: "published"  },
    { t: "12:00:14", site: "growthlab.co",  title: "ltv:cac benchmarks across 1,200 startups", status: "queued"     },
  ];

  return (
    <div className="col-span-5 bg-surface border border-border rounded-md p-2 flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-accent" />
          </span>
          <div className="font-bold text-[0.7rem]">Build Log</div>
          <span className="text-[0.5rem] text-muted-2 uppercase tracking-wider font-bold">
            live
          </span>
        </div>
        <div className="text-[0.55rem] text-accent">Tail logs ↗</div>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-1.5 mt-2 text-[0.5rem] text-muted-2 uppercase tracking-wider">
        <span>Time</span>
        <span>Article</span>
        <span>Status</span>
      </div>
      <div className="mt-1 font-mono">
        {entries.map((e) => {
          const s = STATUS_STYLE[e.status];
          return (
            <div
              key={e.t}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-1.5 py-1 border-t border-border text-[0.55rem]"
            >
              <span className="text-muted-2">{e.t}</span>
              <span className="truncate flex items-center gap-1.5 min-w-0">
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: s.dot }}
                  aria-hidden
                />
                <span className="text-muted-2 shrink-0">{e.site}</span>
                <span className="text-muted-2 shrink-0">/</span>
                <span className="text-text/95 truncate">{e.title}</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded border text-[0.5rem] font-bold uppercase tracking-wider ${s.pill}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniSpark({ seed }: { seed: number }) {
  // deterministic-ish wiggly line per row index
  const points = Array.from({ length: 14 }, (_, i) => {
    const v = 0.3 + 0.5 * Math.abs(Math.sin((i + seed * 1.3) * 0.7));
    return v;
  });
  const W = 56;
  const H = 14;
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * W} ${(1 - v) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={path} fill="none" stroke="#4ade80" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
