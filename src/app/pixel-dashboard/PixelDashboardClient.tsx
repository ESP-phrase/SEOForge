"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live pixel debug dashboard.
 *
 * Intercepts window.ttq.track and window.rdt at mount time and logs every
 * call to a live console. Lets you fire each standard event manually with
 * a single click and see immediately whether it left the browser — no
 * waiting for TikTok/Reddit Events Manager to ingest.
 */
type LogEntry = {
  ts: number;
  platform: "TikTok" | "Reddit" | "System";
  event: string;
  ok: boolean;
  detail: string;
};

const TIKTOK_EVENTS = [
  "ViewContent", "ClickButton", "Search", "AddToWishlist", "AddToCart",
  "AddPaymentInfo", "InitiateCheckout", "PlaceAnOrder", "CompletePayment",
  "CompleteRegistration", "Subscribe", "Contact", "Download", "SubmitForm",
  "CustomizeProduct", "FindLocation", "ScheduleAppointment", "StartTrial",
  "ApplicationApproval",
];

const REDDIT_EVENTS = [
  "PageVisit", "ViewContent", "Search", "AddToCart", "AddToWishlist",
  "Lead", "SignUp", "Purchase",
];

export function PixelDashboardClient() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState({ ttq: false, rdt: false, clarity: false, gtag: false, uetq: false });
  const installed = useRef(false);

  function append(entry: Omit<LogEntry, "ts">) {
    setLog((prev) => [{ ...entry, ts: Date.now() }, ...prev].slice(0, 200));
  }

  // Patch the pixel globals so every call gets logged here AND still passes
  // through to the real pixel. Only patch once per mount.
  useEffect(() => {
    if (installed.current) return;
    installed.current = true;

    type AnyFn = (...args: unknown[]) => unknown;
    interface W {
      ttq?: { track?: AnyFn; identify?: AnyFn; page?: AnyFn; _patched?: boolean };
      rdt?: AnyFn & { _patched?: boolean };
      clarity?: unknown;
      gtag?: AnyFn;
      uetq?: unknown[];
    }
    const w = window as unknown as W;

    function tryPatch() {
      // TikTok
      if (w.ttq?.track && !w.ttq._patched) {
        const orig = w.ttq.track.bind(w.ttq);
        w.ttq.track = function (...args: unknown[]) {
          const [event, props] = args as [string, Record<string, unknown> | undefined];
          const hasContentId = props && typeof props.content_id === "string" && props.content_id.length > 0;
          append({
            platform: "TikTok",
            event,
            ok: !!hasContentId,
            detail: hasContentId ? JSON.stringify(props) : `⚠ missing content_id — ${JSON.stringify(props ?? {})}`,
          });
          return orig(...args);
        };
        w.ttq._patched = true;
      }
      // Reddit
      if (typeof w.rdt === "function" && !w.rdt._patched) {
        const orig = w.rdt.bind(window);
        const patched = function (...args: unknown[]) {
          const [verb, event, props] = args as [string, string, Record<string, unknown> | undefined];
          if (verb === "track") {
            append({
              platform: "Reddit",
              event,
              ok: true,
              detail: JSON.stringify(props ?? {}),
            });
          }
          return orig(...args);
        } as AnyFn & { _patched?: boolean };
        patched._patched = true;
        w.rdt = patched;
      }

      setStatus({
        ttq: typeof w.ttq?.track === "function",
        rdt: typeof w.rdt === "function",
        clarity: typeof w.clarity === "function" || typeof w.clarity === "object",
        gtag: typeof w.gtag === "function",
        uetq: Array.isArray(w.uetq),
      });
    }

    // Pixels load via next/script afterInteractive — may not be ready at mount.
    // Poll for ~5s checking every 250ms until they appear.
    let tries = 0;
    const id = setInterval(() => {
      tryPatch();
      tries++;
      if (tries > 20) clearInterval(id);
    }, 250);
    tryPatch();

    append({ platform: "System", event: "dashboard-ready", ok: true, detail: "Patched pixel globals. Fire events below." });
    return () => clearInterval(id);
  }, []);

  function fireTik(event: string) {
    type Ttq = { track?: (e: string, p: Record<string, unknown>) => void };
    const w = window as unknown as { ttq?: Ttq };
    if (typeof w.ttq?.track !== "function") {
      append({ platform: "TikTok", event, ok: false, detail: "ttq not loaded — ad blocker?" });
      return;
    }
    const txnId = `dash_${Date.now()}`;
    w.ttq.track(event, {
      value: event === "CompletePayment" || event === "InitiateCheckout" || event === "AddToCart" ? 29 : 0,
      currency: "USD",
      content_id: `dash_${event.toLowerCase()}_${txnId}`,
      content_type: "product",
      content_name: `Dashboard test · ${event}`,
    });
  }

  function fireReddit(event: string) {
    type Rdt = (verb: string, action: string, props: Record<string, unknown>) => void;
    const w = window as unknown as { rdt?: Rdt };
    if (typeof w.rdt !== "function") {
      append({ platform: "Reddit", event, ok: false, detail: "rdt not loaded — ad blocker?" });
      return;
    }
    const txnId = `dash_${Date.now()}`;
    w.rdt("track", event, {
      value: event === "Purchase" || event === "AddToCart" ? 29 : 0,
      currency: "USD",
      itemCount: 1,
      conversion_id: `dash_${event.toLowerCase()}_${txnId}`,
    });
  }

  async function fireServerCapi() {
    append({ platform: "System", event: "capi-fire", ok: true, detail: "Calling server CAPI…" });
    try {
      const res = await fetch("/api/pixel-dashboard/fire-capi", { method: "POST" });
      const data = await res.json();
      for (const r of data.results ?? []) {
        append({
          platform: r.platform,
          event: r.event,
          ok: r.ok,
          detail: r.note ?? (r.ok ? "sent server-side" : "failed"),
        });
      }
    } catch (e) {
      append({ platform: "System", event: "capi-error", ok: false, detail: String(e) });
    }
  }

  function clearLog() {
    setLog([]);
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 font-mono text-sm">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-2xl font-bold">Pixel debug dashboard</h1>
          <a href="/test-pixels" className="text-accent text-xs underline">Bulk fire all (/test-pixels) →</a>
        </div>
        <p className="text-muted text-xs mb-5">Every pixel call site-wide is logged below in real-time. Fire test events manually and watch them appear instantly.</p>

        {/* Pixel load status */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {Object.entries(status).map(([k, v]) => (
            <div key={k} className={`p-3 rounded border ${v ? "border-accent-border bg-accent-dim" : "border-border bg-surface-2"}`}>
              <div className="text-[0.65rem] text-muted uppercase tracking-wider">{k}</div>
              <div className={`text-sm font-bold ${v ? "text-accent" : "text-muted-2"}`}>{v ? "✓ loaded" : "— not loaded"}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Manual fire controls */}
          <div className="space-y-5">
            <section>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-base font-bold text-accent">TikTok · browser pixel</h2>
                <a href="https://ads.tiktok.com/i18n/events_manager_v2/" target="_blank" rel="noopener" className="text-[0.65rem] text-muted hover:text-text underline">Events Manager ↗</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {TIKTOK_EVENTS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => fireTik(e)}
                    className="text-left px-2.5 py-1.5 rounded bg-surface-2 hover:bg-accent-dim border border-border hover:border-accent-border text-[0.72rem] transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-base font-bold text-accent">Reddit · browser pixel</h2>
                <a href="https://ads.reddit.com/events-manager" target="_blank" rel="noopener" className="text-[0.65rem] text-muted hover:text-text underline">Events Manager ↗</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {REDDIT_EVENTS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => fireReddit(e)}
                    className="text-left px-2.5 py-1.5 rounded bg-surface-2 hover:bg-accent-dim border border-border hover:border-accent-border text-[0.72rem] transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-accent mb-2">Server CAPI</h2>
              <button
                type="button"
                onClick={fireServerCapi}
                className="w-full px-4 py-2 rounded bg-accent text-black font-bold text-xs hover:bg-accent/90 transition-colors"
              >
                Fire all 24 server-side CAPI events
              </button>
              <div className="text-[0.65rem] text-muted-2 mt-1">19 TikTok + 5 Reddit. Skips browser; goes straight to upstream APIs.</div>
            </section>
          </div>

          {/* Live log */}
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-base font-bold text-accent">Live event log</h2>
              <button onClick={clearLog} className="text-[0.65rem] text-muted hover:text-text underline">Clear</button>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg p-2 max-h-[600px] overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-muted-2 text-xs p-3 text-center">No events yet. Fire a button on the left or navigate to /pricing in another tab.</div>
              ) : (
                <table className="w-full text-[0.7rem]">
                  <tbody>
                    {log.map((e, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-1.5 px-2 text-muted-2 whitespace-nowrap">{new Date(e.ts).toLocaleTimeString()}</td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold ${
                            e.platform === "TikTok" ? "bg-pink-500/20 text-pink-300"
                            : e.platform === "Reddit" ? "bg-orange-500/20 text-orange-300"
                            : "bg-blue-500/20 text-blue-300"
                          }`}>{e.platform}</span>
                        </td>
                        <td className="py-1.5 px-2 font-semibold whitespace-nowrap">{e.event}</td>
                        <td className="py-1.5 px-2">{e.ok ? <span className="text-accent">✓</span> : <span className="text-red-400">✗</span>}</td>
                        <td className="py-1.5 px-2 text-muted truncate max-w-[300px]" title={e.detail}>{e.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
