/**
 * Ad creative: "Comparison" / before-after format.
 *
 * Many ad platforms (TikTok Smart Creative, Meta dynamic) expect a
 * comparison layout. This one contrasts manual content production
 * with the SEOForge workflow.
 *
 * Fetch: https://www.seoforge.org/api/og/comparison
 * 1200 × 1200 — square, works everywhere.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

const BEFORE = {
  label: "Without SEOForge",
  rows: [
    { kpi: "$150", text: "per 1,500-word article" },
    { kpi: "3-5 days", text: "writer turnaround" },
    { kpi: "Hours", text: "researching keywords" },
    { kpi: "Manual", text: "WordPress upload + schema" },
    { kpi: "Maybe", text: "internal links done right" },
  ],
};

const AFTER = {
  label: "With SEOForge",
  rows: [
    { kpi: "$0.30", text: "per 1,500-word article" },
    { kpi: "30 sec", text: "Claude generates + publishes" },
    { kpi: "Auto", text: "SERP gap analysis built in" },
    { kpi: "Auto", text: "WordPress publish + FAQ schema" },
    { kpi: "Auto", text: "internal linking across cluster" },
  ],
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 60,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(190,248,72,0.15) 0%, rgba(190,248,72,0) 60%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 15,
              backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", transform: "rotate(8deg)" }}>
              <svg width="42" height="42" viewBox="0 0 42 42">
                <path d="M21 0 L24 17 L42 21 L24 25 L21 42 L18 25 L0 21 L18 17 Z" fill="#0f1b00" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 900, letterSpacing: -2 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 36,
          }}
        >
          The math is obvious.
        </div>

        {/* Compare side-by-side */}
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          {/* BEFORE */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: 32,
              borderRadius: 24,
              backgroundColor: "#1a0a0a",
              border: "2px solid #4b1a1a",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#ef4444",
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              {BEFORE.label}
            </div>
            {BEFORE.rows.map((r) => (
              <div
                key={r.text}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 18,
                  borderBottom: "1px solid #2a1010",
                  paddingBottom: 12,
                }}
              >
                <span style={{ display: "flex", color: "#ef4444", fontWeight: 900, fontSize: 22, minWidth: 110 }}>
                  ✗ {r.kpi}
                </span>
                <span style={{ display: "flex", color: "#9ca3af", fontSize: 18 }}>{r.text}</span>
              </div>
            ))}
          </div>

          {/* AFTER */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: 32,
              borderRadius: 24,
              backgroundColor: "#0a1a05",
              border: "2px solid #bef848",
              boxShadow: "0 0 40px rgba(190,248,72,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#bef848",
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              {AFTER.label}
            </div>
            {AFTER.rows.map((r) => (
              <div
                key={r.text}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 18,
                  borderBottom: "1px solid #1a2010",
                  paddingBottom: 12,
                }}
              >
                <span style={{ display: "flex", color: "#bef848", fontWeight: 900, fontSize: 22, minWidth: 110 }}>
                  ✓ {r.kpi}
                </span>
                <span style={{ display: "flex", color: "#ffffff", fontSize: 18 }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#9ca3af" }}>
            Free Hobby plan · no credit card
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#bef848" }}>
            seoforge.org
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1200 },
  );
}
