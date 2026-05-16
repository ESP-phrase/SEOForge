"use server";

/**
 * Server-side pixel test runner. Fires one of each CAPI event we use,
 * captures pass/fail, and returns a table for the test-pixels page.
 *
 * Only callable from /test-pixels which is itself auth-gated, so this
 * is effectively dev-only.
 */
import { auth } from "@/lib/auth";
import { sendTikTokEvent, type TikTokEventName } from "@/lib/tiktokCapi";
import { sendRedditEvent, type RedditEventName } from "@/lib/redditCapi";

type Row = { platform: string; event: string; ok: boolean; note?: string };

export async function fireAllServerEvents(): Promise<Row[]> {
  const session = await auth();
  if (!session?.user?.id) return [{ platform: "auth", event: "—", ok: false, note: "not signed in" }];
  const email = session.user.email ?? "test@seoforge.org";
  const userId = session.user.id;
  const txnId = `test_${Date.now()}`;
  const rows: Row[] = [];

  // Capture console output so we can tell skipped (no token) vs sent vs failed.
  const origLog = console.log;
  const origWarn = console.warn;
  const captured: string[] = [];
  console.log = (...a: unknown[]) => { captured.push(a.join(" ")); origLog(...a); };
  console.warn = (...a: unknown[]) => { captured.push(a.join(" ")); origWarn(...a); };

  const ttEvents: { event: TikTokEventName; props?: Record<string, unknown> }[] = [
    { event: "ViewContent",          props: { contentId: "test_pixels_page", contentName: "Test pixels page" } },
    { event: "InitiateCheckout",     props: { contentId: "operator",         contentName: "Operator plan", value: 29, currency: "USD" } },
    { event: "CompleteRegistration", props: { contentId: `signup_${txnId}`,  contentName: "Free signup" } },
    { event: "CompletePayment",      props: { contentId: txnId,              contentName: "Operator plan", value: 29, currency: "USD" } },
  ];

  for (const e of ttEvents) {
    captured.length = 0;
    try {
      await sendTikTokEvent({
        eventName: e.event,
        email,
        userId,
        eventId: `${e.event}_${txnId}`,
        ...e.props,
      });
      const line = captured.join(" | ");
      const skipped = line.includes("skipped");
      const failed = line.includes("✗");
      rows.push({
        platform: "TikTok",
        event: e.event,
        ok: !skipped && !failed,
        note: skipped ? "TIKTOK_ACCESS_TOKEN missing"
            : failed ? line.slice(line.indexOf("✗"), line.indexOf("✗") + 120)
            : "sent",
      });
    } catch (err) {
      rows.push({ platform: "TikTok", event: e.event, ok: false, note: String(err).slice(0, 100) });
    }
  }

  const rdEvents: { event: RedditEventName; props?: Record<string, unknown> }[] = [
    { event: "ViewContent" },
    { event: "AddToCart",  props: { value: 29, currency: "USD", itemCount: 1 } },
    { event: "SignUp" },
    { event: "Lead" },
    { event: "Purchase",   props: { value: 29, currency: "USD", itemCount: 1, conversionId: txnId } },
  ];

  for (const e of rdEvents) {
    captured.length = 0;
    try {
      await sendRedditEvent({
        eventName: e.event,
        email,
        userId,
        ...e.props,
      });
      const line = captured.join(" | ");
      const skipped = line.includes("skipped");
      const failed = line.includes("✗");
      rows.push({
        platform: "Reddit",
        event: e.event,
        ok: !skipped && !failed,
        note: skipped ? "REDDIT_CAPI_TOKEN missing"
            : failed ? line.slice(line.indexOf("✗"), line.indexOf("✗") + 120)
            : "sent",
      });
    } catch (err) {
      rows.push({ platform: "Reddit", event: e.event, ok: false, note: String(err).slice(0, 100) });
    }
  }

  console.log = origLog;
  console.warn = origWarn;
  return rows;
}
