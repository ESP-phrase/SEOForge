/**
 * One-shot pixel test page.
 *
 * Auth-gated. Visiting this page fires EVERY pixel event we use — both
 * browser-side and server-side CAPI — exactly once. Then check TikTok
 * Test Events and Reddit Events Manager to confirm everything lit up.
 *
 * Not meant for production discovery. URL is intentionally not in the
 * sitemap or any nav.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fireAllServerEvents } from "@/actions/testPixels";
import { TestPixelsClient } from "./TestPixelsClient";

export const dynamic = "force-dynamic";

export default async function TestPixelsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/test-pixels");

  const serverResults = await fireAllServerEvents();

  return (
    <div className="min-h-screen bg-bg text-text p-8 font-mono">
      <h1 className="text-2xl font-bold mb-2">Pixel test harness</h1>
      <p className="text-muted text-sm mb-6">
        Fires one event of each type. Check TikTok &amp; Reddit Events Manager
        within 2 min to confirm receipt.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-accent">Server-side CAPI</h2>
        <table className="w-full text-sm border border-border">
          <thead className="bg-surface-2">
            <tr>
              <th className="text-left px-3 py-2">Platform</th>
              <th className="text-left px-3 py-2">Event</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {serverResults.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2">{r.platform}</td>
                <td className="px-3 py-2">{r.event}</td>
                <td className="px-3 py-2">
                  {r.ok ? (
                    <span className="text-accent">✓ {r.note ?? "sent"}</span>
                  ) : (
                    <span className="text-red-400">✗ {r.note ?? "failed"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3 text-accent">Browser-side pixels</h2>
        <TestPixelsClient />
      </section>

      <div className="mt-8 p-4 border border-border rounded bg-surface-2 text-xs text-muted">
        <p className="mb-2"><strong className="text-text">Check receipts:</strong></p>
        <ul className="space-y-1">
          <li>TikTok: <a className="text-accent underline" href="https://ads.tiktok.com/i18n/events_manager_v2/" target="_blank" rel="noopener">Events Manager</a> → pixel D846P43C77U6NFPBOPMG → Test Events tab</li>
          <li>Reddit: <a className="text-accent underline" href="https://ads.reddit.com/events-manager" target="_blank" rel="noopener">Events Manager</a> → pixel a2_j0nbovdr0uc1 → Activity tab</li>
        </ul>
      </div>
    </div>
  );
}
