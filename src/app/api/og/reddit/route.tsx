/**
 * Reddit ad creatives — 5 angles in one route. 1200×628.
 *
 *   /api/og/reddit         → v1 cost ($0.30 vs $150)
 *   /api/og/reddit?v=2     → v2 time (10 minutes to first article)
 *   /api/og/reddit?v=3     → v3 volume (150 articles / month)
 *   /api/og/reddit?v=4     → v4 math ($29 replaces $1,800 writer)
 *   /api/og/reddit?v=5     → v5 honest founder pitch
 *
 * Designed to feel more organic than corporate (Reddit users punish polish).
 */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

type Variant = {
  headline: string;
  subhead: string;
  statLabel: string;
  statValue: string;
  statCaption: string;
};

const VARIANTS: Record<string, Variant> = {
  "1": {
    headline: "Built this because writers cost $150/article.",
    subhead:
      "AI generates 1,500-word SEO articles. Schema, internal links, topic clusters — auto-published to WordPress. Free plan.",
    statLabel: "Cost per article",
    statValue: "$0.30",
    statCaption: "vs. $150 from a freelance writer.",
  },
  "2": {
    headline: "10 minutes from signup to first ranked article.",
    subhead:
      "Connect WordPress. Queue keywords. Claude writes + publishes. Free Hobby plan, no card.",
    statLabel: "Setup time",
    statValue: "10 min",
    statCaption: "First article live, indexed, in your feed.",
  },
  "3": {
    headline: "150 SEO articles a month. $29.",
    subhead:
      "Topic clusters, SERP gap analysis, schema markup, internal linking — auto-published to WordPress on a daily cron.",
    statLabel: "Articles / month",
    statValue: "150",
    statCaption: "on the Operator plan ($29/mo).",
  },
  "4": {
    headline: "$29/mo replaces a $1,800/mo content writer.",
    subhead:
      "AI handles keyword research, SERP analysis, 1,500-word drafts, schema, internal linking, and publishing.",
    statLabel: "Monthly savings",
    statValue: "$1,771",
    statCaption: "vs. one full-time writer at $0.10/word.",
  },
  "5": {
    headline: "I run 8 niche sites. Built this to stop writing.",
    subhead:
      "Open source-friendly. No corporate fluff. Built by an SEO operator for SEO operators. Free Hobby plan.",
    statLabel: "Built by",
    statValue: "1 dev",
    statCaption: "shipping in public on github.com/ESP-phrase/SEOForge",
  },
};

export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get("v") ?? "1";
  const variant = VARIANTS[v] ?? VARIANTS["1"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 60,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 90% 50%, rgba(190,248,72,0.15) 0%, rgba(190,248,72,0) 50%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Left — copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            paddingRight: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", transform: "rotate(8deg)" }}>
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <path
                    d="M14 0 L16 12 L28 14 L16 16 L14 28 L12 16 L0 14 L12 12 Z"
                    fill="#0f1b00"
                  />
                </svg>
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
              <span style={{ color: "#ffffff" }}>SEO</span>
              <span style={{ color: "#bef848" }}>Forge</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 50,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1.08,
              marginBottom: 24,
            }}
          >
            {variant.headline}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#9ca3af",
              lineHeight: 1.4,
              marginBottom: 32,
            }}
          >
            {variant.subhead}
          </div>

          <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
            {["No credit card", "Cancel anytime", "14-day refund"].map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 17,
                  color: "#bef848",
                  fontWeight: 700,
                }}
              >
                <span style={{ display: "flex", marginRight: 8, color: "#22c55e" }}>✓</span>
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Right — stat */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 360,
            backgroundColor: "#111111",
            border: "3px solid #bef848",
            borderRadius: 28,
            padding: 36,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 800,
              color: "#9ca3af",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {variant.statLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: variant.statValue.length > 5 ? 96 : 130,
              fontWeight: 900,
              color: "#bef848",
              letterSpacing: -5,
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {variant.statValue}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#9ca3af",
              lineHeight: 1.35,
            }}
          >
            {variant.statCaption}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingTop: 24,
              fontSize: 20,
              fontWeight: 800,
              color: "#bef848",
            }}
          >
            seoforge.org
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 628 },
  );
}
