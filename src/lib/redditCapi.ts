/**
 * Reddit Conversions API v3 (server-side event tracking).
 *
 * Docs: https://ads-api.reddit.com/api/v3/pixels/{pixel_id}/conversion_events
 *
 * Why server-side in addition to the browser pixel:
 *   - Ad blockers / iOS Safari strip the browser pixel ~30% of the time
 *   - Server-side hits land 100%
 *   - Reddit deduplicates by conversion_id when both fire — best accuracy
 *
 * Required env:
 *   REDDIT_CAPI_TOKEN     — bearer token from Reddit Ads → Conversions → API
 *   REDDIT_PIXEL_ID       — pixel ID (falls back to hardcoded)
 */
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

const DEFAULT_PIXEL_ID = "a2_j0nbovdr0uc1";

export type RedditEventName =
  | "PageVisit"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "Lead"
  | "SignUp"
  | "Purchase"
  | "CUSTOM";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

export async function sendRedditEvent(opts: {
  eventName: RedditEventName;
  email?: string | null;
  userId?: string | null;
  customEventName?: string;
  value?: number;
  currency?: string;
  itemCount?: number;
  /** Unique conversion ID — required for deduplication with the browser pixel. */
  conversionId?: string;
}): Promise<void> {
  const token = process.env.REDDIT_CAPI_TOKEN;
  const pixelId = process.env.REDDIT_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!token) {
    console.log(`[reddit-capi] skipped (no REDDIT_CAPI_TOKEN) · ${opts.eventName}`);
    return;
  }

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const clickId = cookieStore.get("sf_rdt_cid")?.value;
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      undefined;
    const userAgent = headerStore.get("user-agent") ?? undefined;

    const user: Record<string, unknown> = {};
    if (ip) user.ip_address = ip;
    if (userAgent) user.user_agent = userAgent;
    if (opts.email) user.email = sha256(opts.email);
    if (opts.userId) user.external_id = sha256(opts.userId);

    const metadata: Record<string, unknown> = {};
    if (opts.value != null) metadata.value = opts.value;
    if (opts.currency) metadata.currency = opts.currency;
    if (opts.itemCount != null) metadata.item_count = opts.itemCount;
    if (opts.conversionId) metadata.conversion_id = opts.conversionId;

    const type: Record<string, string> =
      opts.eventName === "CUSTOM"
        ? {
            tracking_type: "CUSTOM",
            custom_event_name: opts.customEventName ?? "custom",
          }
        : { tracking_type: opts.eventName };

    const event: Record<string, unknown> = {
      event_at: Date.now(),                    // unix epoch milliseconds
      action_source: "WEBSITE",                // Reddit v3 requires UPPERCASE
      type,
    };
    if (clickId) event.click_id = clickId;
    if (Object.keys(user).length > 0) event.user = user;
    if (Object.keys(metadata).length > 0) event.metadata = metadata;

    const body = { data: { events: [event] } };

    const res = await fetch(
      `https://ads-api.reddit.com/api/v3/pixels/${pixelId}/conversion_events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const txt = await res.text();
      console.warn(
        `[reddit-capi] ✗ ${opts.eventName} failed: ${res.status} ${txt.slice(0, 200)}`,
      );
    } else {
      console.log(`[reddit-capi] ✓ ${opts.eventName} sent`);
    }
  } catch (e) {
    console.warn(
      `[reddit-capi] ✗ ${opts.eventName} threw: ${e instanceof Error ? e.message : e}`,
    );
  }
}
