import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — From $0 to $149/mo",
  description:
    "Three plans for indie SEO operators and agencies. Free Hobby plan, $29/mo Operator (150 articles), $149/mo Agency (1,000 articles). 14-day money-back guarantee. Cancel anytime.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — SEOForge",
    description:
      "Free Hobby plan, $29/mo Operator, $149/mo Agency. Pay for articles published, not seats.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
