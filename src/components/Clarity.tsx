"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Microsoft Clarity — heatmaps, session recordings, smart events.
 *
 * Self-hosted proxy mode: the script and event endpoint route through
 * `/_clarity/*` on our own origin (see next.config rewrites). This bypasses
 * most ad blockers since the requests look like first-party assets. Result:
 * ~30% more sessions captured.
 *
 * Renders nothing if NEXT_PUBLIC_CLARITY_ID isn't set.
 *
 * Optional userId prop: tags sessions with the signed-in user so they can be
 * filtered to a specific customer in the Clarity dashboard.
 */
export function Clarity({ userId }: { userId?: string }) {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID;

  // Identify the user (after init runs in the Script onLoad).
  useEffect(() => {
    if (!id || !userId) return;
    const w = window as unknown as { clarity?: (...args: unknown[]) => void };
    if (typeof w.clarity === "function") {
      try {
        w.clarity("identify", userId);
      } catch {
        /* ignore */
      }
    }
  }, [id, userId]);

  if (!id) return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="/_clarity/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${id}");
        `,
      }}
    />
  );
}
