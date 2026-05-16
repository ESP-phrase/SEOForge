/**
 * Ad creative: "Team / Staff portrait" format.
 *
 * Many ad platforms (TikTok Smart Creative, Meta dynamic ads) expect a
 * team-shot creative for trust/credibility. We don't have real staff
 * photos, so this generates a stylized "team" composition with avatar
 * silhouettes, roles, and a brand frame. Reads as a professional team
 * intro without needing actual people.
 *
 * Fetch: https://www.seoforge.org/api/og/team
 * 1080 × 1080 — square format, works on every platform.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

const TEAM = [
  { initials: "AN", name: "Aubrey N.", role: "Founder · SEO Operator", color: "#bef848" },
  { initials: "AI", name: "Claude", role: "AI Content Engineer", color: "#a855f7" },
  { initials: "WP", name: "WordPress", role: "Publishing Pipeline", color: "#0ea5e9" },
  { initials: "GS", name: "Search Console", role: "Performance Tracker", color: "#22c55e" },
];

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(190,248,72,0.15) 0%, rgba(190,248,72,0) 50%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 16,
              backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", transform: "rotate(8deg)" }}>
              <svg width="46" height="46" viewBox="0 0 46 46">
                <path d="M23 0 L26 19 L46 23 L26 27 L23 46 L20 27 L0 23 L20 19 Z" fill="#0f1b00" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 900, letterSpacing: -2 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            color: "#bef848",
            marginBottom: 12,
          }}
        >
          THE TEAM BEHIND YOUR CONTENT
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 48,
          }}
        >
          Built by an operator. Powered by AI.
        </div>

        {/* Team grid */}
        <div style={{ display: "flex", gap: 18, flex: 1 }}>
          {TEAM.map((m) => (
            <div
              key={m.initials}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "28px 18px",
                borderRadius: 22,
                backgroundColor: "#111111",
                border: "2px solid #1f1f1f",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 999,
                  backgroundColor: m.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#0a0a0a",
                  marginBottom: 16,
                  boxShadow: `0 0 30px ${m.color}40`,
                }}
              >
                {m.initials}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {m.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 13,
                  color: "#9ca3af",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {m.role}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #222",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#9ca3af" }}>
            Indie operator + AI · zero corporate fluff
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: "#bef848" }}>
            seoforge.org
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
