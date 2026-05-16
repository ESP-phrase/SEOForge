import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@anthropic-ai/sdk"],
  async rewrites() {
    return [
      // First-party Clarity proxy. The Clarity script is served from our own
      // origin which bypasses most ad blockers (~30% more sessions captured).
      // Visitors hit https://www.seoforge.org/_clarity/* and we forward the
      // request to Microsoft's CDN transparently.
      {
        source: "/_clarity/:path*",
        destination: "https://www.clarity.ms/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        // Fully open iframe embedding — needed so ad-platform event-builder
        // tools (TikTok, Reddit, Microsoft, Google Tag Assistant, Meta) can
        // load the site inside their codeless setup UIs without 'Forbidden'
        // errors. Trade-off: lower XSS-via-clickjacking protection. Acceptable
        // for a marketing site; revisit if we add high-trust admin actions.
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          // Remove the legacy X-Frame-Options header — Vercel adds SAMEORIGIN
          // by default and that overrides our CSP for older clients.
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // CORS — allow ad bots to fetch metadata
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
