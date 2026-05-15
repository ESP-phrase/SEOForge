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
};

export default nextConfig;
