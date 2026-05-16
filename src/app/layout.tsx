import type { Metadata } from "next";
import "./globals.css";
import { Clarity } from "@/components/Clarity";
import { RedditPixel } from "@/components/RedditPixel";
import { TikTokPixel } from "@/components/TikTokPixel";
import { GoogleAds } from "@/components/GoogleAds";
import { MicrosoftAds } from "@/components/MicrosoftAds";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ChatWidget } from "@/components/ChatWidget";

const SITE = "https://www.seoforge.org";
const SITE_NAME = "SEOForge";
const DEFAULT_TITLE = "SEOForge — AI SEO content on autopilot";
const DEFAULT_DESC =
  "Generate, optimize, and auto-publish SEO articles to WordPress and native blogs. Topic clusters, schema, internal linking, GSC, and analytics — built for indie operators and agencies.";
// Next.js auto-generates this from src/app/opengraph-image.tsx at /opengraph-image
const OG_IMAGE = `${SITE}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — SEOForge",
  },
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "AI SEO",
    "AI content generation",
    "WordPress auto-publish",
    "programmatic SEO",
    "SEO automation",
    "topic clusters",
    "AI article writer",
    "SEO content tool",
    "niche site automation",
  ],
  authors: [{ name: "SEOForge" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: SITE,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
};

// Organization + SoftwareApplication JSON-LD — appears on every page so
// Google sees rich entity data sitewide. Pricing page adds FAQPage on top.
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}#organization`,
      name: SITE_NAME,
      url: SITE,
      logo: `${SITE}/icon.svg`,
      sameAs: [
        "https://github.com/ESP-phrase/SEOForge",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}#website`,
      url: SITE,
      name: SITE_NAME,
      publisher: { "@id": `${SITE}#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          name: "Hobby",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Operator",
          price: "29",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "29",
            priceCurrency: "USD",
            referenceQuantity: { "@type": "QuantitativeValue", value: "1", unitCode: "MON" },
          },
        },
        {
          "@type": "Offer",
          name: "Agency",
          price: "149",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "149",
            priceCurrency: "USD",
            referenceQuantity: { "@type": "QuantitativeValue", value: "1", unitCode: "MON" },
          },
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "12",
      },
      description: DEFAULT_DESC,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-sans min-h-screen">
        <Clarity />
        <RedditPixel />
        <TikTokPixel />
        <GoogleAds />
        <MicrosoftAds />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        {children}
        <ChatWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}
