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
        <div className="grid grid-cols-[148px_1fr] min-h-[520px]">
          {/* Sidebar */}
          <aside className="bg-bg-2 border-r border-border p-3 flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1.5 mb-4">
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
                <rect width="64" height="64" rx="14" fill="#bef848" />
                <path d="M40 16 H22 a8 8 0 0 0 0 16 h12 a8 8 0 0 1 0 16 H16" stroke="#000" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="14" r="4" fill="#000" />
              </svg>
              <span className="font-extrabold text-xs">SEOFORGE</span>
            </div>
            <NavItem label="Sites" icon={<NavSitesIcon />} active />
            <NavItem label="Add site" icon={<NavPlusIcon />} />
            <NavItem label="Activity" icon={<NavActivityIcon />} />
            <NavItem label="Reports" icon={<NavReportsIcon />} />
            <NavItem label="Settings" icon={<NavSettingsIcon />} />
            <NavItem label="Integrations" icon={<NavIntegrationsIcon />} />
            <div className="mt-auto bg-surface border border-border rounded-lg p-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent grid place-items-center text-[0.6rem] font-black text-black">
                A
              </span>
              <div className="leading-tight flex-1 min-w-0">
                <div className="text-[0.6rem] font-bold truncate">Aubrey N.</div>
                <div className="text-[0.55rem] text-muted">Pro Plan</div>
              </div>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0" aria-hidden>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </aside>

          {/* Main */}
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-extrabold text-base flex items-center gap-1">
                  SEO Dashboard
                  <span className="text-accent">✦</span>
                </div>
                <div className="text-muted text-[0.6rem]">
                  Multi-site AI content pipeline · published, queued, and in-progress at a glance
                </div>
              </div>
              <div className="flex items-stretch gap-1.5 shrink-0">
                <FakeBtn primary>+ Add site</FakeBtn>
                <FakeBtn icon={<ChartLineIcon />}>View activity</FakeBtn>
                <PipelineScoreCard />
              </div>
            </div>

            {/* Filter row */}
            <div className="flex gap-1.5 mb-3">
              <FakeFilter icon={<GlobeFilterIcon />} label="Site" value="All sites" />
              <FakeFilter icon={<ListFilterIcon />} label="Status" value="All statuses" />
              <FakeFilter icon={<CalFilterIcon />} label="Range" value="Last 30 days" />
            </div>

            {/* 6 metric tiles */}
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {METRIC_TILES.map((m) => (
                <div key={m.l} className="bg-surface border border-border rounded-md p-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-md grid place-items-center shrink-0"
                      style={{ background: `${m.color}1f`, color: m.color }}
                      aria-hidden
                    >
                      {m.icon}
                    </span>
                    <div className="text-[0.5rem] text-muted font-medium leading-tight truncate">
                      {m.l}
                    </div>
                  </div>
                  <div className="font-extrabold text-base mt-1.5 leading-none">{m.v}</div>
                  <div className="text-[0.5rem] text-success mt-1 flex items-center gap-0.5">
                    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {m.t}
                  </div>
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

        {/* Bottom-right corner accent dot */}
        <div
          aria-hidden
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-accent shadow-glow"
        />
      </div>
    </div>
  );
}

const METRIC_TILES = [
  { l: "Total Sites",    v: "24",   t: "3 this month",  color: "#a78bfa", icon: <TileGlobeIcon /> },
  { l: "Published",      v: "152",  t: "18 this month", color: "#4ade80", icon: <TileCheckIcon /> },
  { l: "Queued",         v: "48",   t: "7 this month",  color: "#fbbf24", icon: <TileClockIcon /> },
  { l: "In Progress",    v: "23",   t: "5 this month",  color: "#60a5fa", icon: <TileProgressIcon /> },
  { l: "Avg. SEO Score", v: "86",   t: "6 pts",         color: "#a78bfa", icon: <TileSparkIcon /> },
  { l: "Impressions",    v: "128K", t: "24.6%",         color: "#22d3ee", icon: <TileEyeIcon /> },
];

function PipelineScoreCard() {
  return (
    <div className="bg-surface border border-border rounded-md px-2.5 py-1.5 flex items-center gap-2">
      <div className="leading-tight">
        <div className="text-[0.5rem] uppercase tracking-wider text-muted font-bold">
          Pipeline Score
        </div>
        <div className="font-extrabold text-sm leading-none mt-0.5 text-accent">+152</div>
        <div className="text-[0.5rem] text-muted-2 mt-0.5">vs last 30 days</div>
      </div>
      <div className="flex items-end gap-0.5 h-6">
        {[3, 5, 4, 7, 6, 9, 8, 11].map((h, i) => (
          <span
            key={i}
            className="w-0.5 bg-accent rounded-sm"
            style={{ height: `${h * 2}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function NavItem({ label, icon, active }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.65rem] font-medium mb-0.5 ${
        active ? "bg-accent text-black font-bold shadow-[0_0_12px_rgba(190,248,72,0.35)]" : "text-muted"
      }`}
    >
      <span className="w-3.5 h-3.5 grid place-items-center" aria-hidden>
        {icon}
      </span>
      {label}
    </div>
  );
}

function FakeBtn({ children, primary, icon }: { children: React.ReactNode; primary?: boolean; icon?: React.ReactNode }) {
  return (
    <span
      className={`text-[0.6rem] px-2 py-1 rounded-md font-bold inline-flex items-center gap-1 ${
        primary
          ? "bg-accent text-black shadow-[0_0_10px_rgba(190,248,72,0.35)]"
          : "bg-surface-2 border border-border text-text"
      }`}
    >
      {icon}
      {children}
    </span>
  );
}

function FakeFilter({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-md px-2 py-1 flex items-center gap-1.5">
      <span className="text-muted-2" aria-hidden>{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[0.5rem] text-muted-2 uppercase tracking-wider font-bold">
          {label}
        </span>
        <span className="text-[0.6rem] text-text font-semibold">{value}</span>
      </div>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted-2 ml-1" aria-hidden>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniLineChart() {
  // 4 deterministic series climbing left-to-right
  const series = [
    { color: "#4ade80", base: [10, 18, 24, 30, 38, 50, 64, 72, 88, 96], fill: true },
    { color: "#facc15", base: [6, 12, 18, 22, 28, 34, 38, 44, 52, 58] },
    { color: "#60a5fa", base: [4, 8, 11, 14, 18, 22, 26, 30, 36, 42] },
    { color: "#9ca3af", base: [2, 3, 4, 5, 6, 6, 7, 8, 9, 11] },
  ];
  const W = 360;
  const H = 110;
  const xAt = (i: number) => (i / (series[0].base.length - 1)) * (W - 20) + 10;
  const yAt = (v: number) => H - 6 - (v / 100) * (H - 14);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-1.5" preserveAspectRatio="none" style={{ height: 110 }}>
      <defs>
        <linearGradient id="pubFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 50, 80].map((y) => (
        <line key={y} x1={10} y1={y} x2={W - 10} y2={y} stroke="#1a1a1a" strokeWidth={0.5} strokeDasharray="2 3" />
      ))}
      {series.map((s, si) => {
        const path = s.base
          .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
          .join(" ");
        const lastIdx = s.base.length - 1;
        return (
          <g key={si}>
            {s.fill ? (
              <path
                d={`${path} L ${xAt(lastIdx)} ${H - 6} L ${xAt(0)} ${H - 6} Z`}
                fill="url(#pubFill)"
              />
            ) : null}
            <path d={path} fill="none" stroke={s.color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={xAt(lastIdx)} cy={yAt(s.base[lastIdx])} r={2.2} fill={s.color} />
            <circle cx={xAt(lastIdx)} cy={yAt(s.base[lastIdx])} r={5} fill={s.color} fillOpacity="0.18" />
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
      <div className="grid grid-cols-[14px_1fr_28px_36px_42px] gap-x-1.5 mt-2 text-[0.5rem] text-muted-2 uppercase tracking-wider">
        <span />
        <span>Site</span>
        <span className="text-right">SEO</span>
        <span className="text-right">Impr.</span>
        <span className="text-right">Trend</span>
      </div>
      {[
        { n: "techflow.io",   color: "#fbbf24", score: 92, imp: "32.4K" },
        { n: "growthlab.co",  color: "#4ade80", score: 88, imp: "21.7K" },
        { n: "contently.ai",  color: "#60a5fa", score: 85, imp: "18.9K" },
        { n: "rankspire.com", color: "#fb923c", score: 82, imp: "14.2K" },
        { n: "seovista.dev",  color: "#a78bfa", score: 78, imp: "10.3K" },
      ].map((s, i) => (
        <div
          key={s.n}
          className="grid grid-cols-[14px_1fr_28px_36px_42px] items-center gap-x-1.5 py-1 border-t border-border text-[0.6rem]"
        >
          <span className="w-3.5 h-3.5 rounded-md" style={{ background: s.color }} aria-hidden />
          <span className="font-semibold truncate">{s.n}</span>
          <span className="bg-surface-2 px-1 py-0.5 rounded text-[0.55rem] font-bold border border-border text-center">
            {s.score}
          </span>
          <span className="text-muted text-[0.55rem] text-right">{s.imp}</span>
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
  const points = Array.from({ length: 14 }, (_, i) => {
    const v = 0.3 + 0.5 * Math.abs(Math.sin((i + seed * 1.3) * 0.7));
    return v;
  });
  const W = 42;
  const H = 14;
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * W} ${(1 - v) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="ml-auto">
      <path d={path} fill="none" stroke="#4ade80" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────

function NavSitesIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
    </svg>
  );
}
function NavPlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function NavActivityIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function NavReportsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
}
function NavSettingsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function NavIntegrationsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 2v6M15 2v6" />
      <rect x="6" y="8" width="12" height="8" rx="2" />
      <path d="M12 16v4" />
    </svg>
  );
}

function ChartLineIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}

function GlobeFilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function ListFilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}
function CalFilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TileGlobeIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function TileCheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="5 12 10 17 19 8" />
    </svg>
  );
}
function TileClockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function TileProgressIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.35" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
function TileSparkIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}
function TileEyeIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
