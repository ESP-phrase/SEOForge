import { ImageResponse } from "next/og";

// Default Open Graph image for the whole site. 1200x630 — what shows in
// social card previews (Twitter, LinkedIn, Slack, iMessage, etc.).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SEOForge — AI SEO content on autopilot";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(190,248,72,0.18) 0%, rgba(190,248,72,0) 50%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 56,
          }}
        >
          {/* Logo tile */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(190,248,72,0.4)",
            }}
          >
            <div style={{ display: "flex", transform: "rotate(8deg)" }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <path
                  d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27 Z"
                  fill="#0f1b00"
                />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -3,
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          Scale SEO on autopilot.
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9ca3af",
            lineHeight: 1.4,
            maxWidth: 900,
            marginBottom: 56,
          }}
        >
          Generate, optimize, and publish AI articles to WordPress and native blogs.
          Topic clusters, schema, internal linking.
        </div>

        {/* Bottom row — feature chips */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {["$0.30 / article", "Free Hobby plan", "WordPress + Native", "Cancel anytime"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0a0a0a",
                  backgroundColor: "#bef848",
                  borderRadius: 10,
                  padding: "10px 18px",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
