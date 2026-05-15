"use client";

import { useEffect } from "react";

/**
 * Microsoft Clarity — heatmaps, session recordings, smart events.
 * Uses the official @microsoft/clarity SDK so we can call identify(), setTag(),
 * and event() from anywhere in the app later.
 *
 * Renders nothing if NEXT_PUBLIC_CLARITY_ID isn't set.
 *
 * Optional userId prop: when a signed-in user is rendered, we call
 * Clarity.identify(userId) so sessions can be tied to a customer in the
 * Clarity dashboard.
 */
export function Clarity({ userId }: { userId?: string }) {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID;
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // Dynamic import keeps the SDK out of the SSR bundle and only ships it
    // to the browser. The SDK auto-attaches to window once init() runs.
    import("@microsoft/clarity").then((m) => {
      if (cancelled) return;
      try {
        m.default.init(id);
        if (userId) m.default.identify(userId);
      } catch {
        /* silent — Clarity init shouldn't break the app */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, userId]);
  return null;
}
