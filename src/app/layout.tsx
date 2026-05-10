import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEOForge — Scale SEO on autopilot",
  description: "Multi-site AI content pipeline. Generate, optimize, and publish content across unlimited sites from one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-sans min-h-screen">{children}</body>
    </html>
  );
}
