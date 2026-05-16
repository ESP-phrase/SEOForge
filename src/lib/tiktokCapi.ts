/**
 * TikTok Events API (server-side conversion tracking).
 *
 * Docs: https://business-api.tiktok.com/portal/docs?id=1771101303285761
 *
 * Why server-side alongside the browser pixel:
 *   - iOS Safari ITP + ad blockers strip the browser pixel ~30-40% of the time
 *   - Server-side fires 100%, attribution stays accurate
 *   - TikTok deduplicates by event_id when both fire
 *
 * Required env:
 *   TIKTOK_ACCESS_TOKEN  — bearer from TikTok Events Manager → Settings → API
 *   TIKTOK_PIXEL_ID      — pixel ID (falls back to hardcoded)
 */
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

const DEFAULT_PIXEL_ID = "D846P43C77U6NFPBOPMG";
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

// Full TikTok standard-events catalog. Adding all of them so the Events
// Manager status flips from "Waiting for activity" to "Active" for every
// row, making every event available as a campaign optimization goal —
// even if we don't fire it from production code yet.
export type TikTokEventName =
  | "ViewContent"
  | "ClickButton"
  | "Search"
  | "AddToWishlist"
  | "AddToCart"
  | "AddPaymentInfo"
  | "InitiateCheckout"
  | "PlaceAnOrder"
  | "CompletePayment"
  | "CompleteRegistration"
  | "Subscribe"
  | "Contact"
  | "Download"
  | "SubmitForm"
  | "CustomizeProduct"
  | "FindLocation"
  | "ScheduleAppointment"
  | "StartTrial"
  | "ApplicationApproval";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

/**
 * Fire a server-side TikTok conversion event.
 * No-op (with log) if TIKTOK_ACCESS_TOKEN is unset — dev environments
 * keep working without TikTok creds.
 */
export async function sendTikTokEvent(opts: {
  eventName: TikTokEventName;
  email?: string | null;
  userId?: string | null;
  value?: number;
  currency?: string;     // ISO 4217
  contentName?: string;  // e.g. "Operator Plan"
  contentId?: string;    // e.g. stripe subscription id
  /** Unique event ID — used to dedupe with the browser pixel. */
  eventId?: string;
}): Promise<void> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  const pixelId = process.env.TIKTOK_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!token) {
    console.log(`[tiktok-capi] skipped (no TIKTOK_ACCESS_TOKEN) · ${opts.eventName}`);
    return;
  }

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    // TikTok appends ttclid to ad clicks. Cookie set by middleware.
    const ttclid = cookieStore.get("sf_ttclid")?.value;
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "";
    const userAgent = headerStore.get("user-agent") ?? "";

    const user: Record<string, string> = {};
    if (opts.email) user.email = sha256(opts.email);
    if (opts.userId) user.external_id = sha256(opts.userId);
    if (ip) user.ip = ip;
    if (userAgent) user.user_agent = userAgent;
    if (ttclid) user.ttclid = ttclid;

    // TikTok rejects events with empty content_id in their diagnostics, even
    // though it's technically optional. Always populate it — fall back to a
    // stable per-event-type slug so non-product events (signup, page view)
    // still validate cleanly.
    const properties: Record<string, unknown> = {
      content_id: opts.contentId || `seoforge_${opts.eventName.toLowerCase()}`,
      content_type: "product",
    };
    if (opts.value != null) properties.value = opts.value;
    if (opts.currency) properties.currency = opts.currency;
    if (opts.contentName) properties.content_name = opts.contentName;
    else properties.content_name = opts.eventName;

    const event: Record<string, unknown> = {
      event: opts.eventName,
      event_time: Math.floor(Date.now() / 1000), // unix epoch SECONDS (not ms)
      user,
    };
    if (Object.keys(properties).length > 0) event.properties = properties;
    if (opts.eventId) event.event_id = opts.eventId;

    const body = {
      event_source: "web",
      event_source_id: pixelId,
      data: [event],
    };

    const res = await fetch(TIKTOK_API, {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn(
        `[tiktok-capi] ✗ ${opts.eventName} failed: ${res.status} ${txt.slice(0, 200)}`,
      );
    } else {
      console.log(`[tiktok-capi] ✓ ${opts.eventName} sent`);
    }
  } catch (e) {
    console.warn(
      `[tiktok-capi] ✗ ${opts.eventName} threw: ${e instanceof Error ? e.message : e}`,
    );
  }
}
