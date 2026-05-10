import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

const QUOTES = [
  {
    quote:
      "We went from 4 sites to 47 in a quarter. The pipeline just runs.",
    name: "Maya R.",
    role: "Founder, programmatic SaaS",
  },
  {
    quote:
      "The internal linker alone is worth the price. Our crawl coverage doubled.",
    name: "Jordan K.",
    role: "SEO Lead, agency",
  },
  {
    quote:
      "We spent two weeks tuning the prompt. Now articles ship while I sleep and clients can&rsquo;t tell.",
    name: "Sam D.",
    role: "Solo operator",
  },
  {
    quote:
      "I run 18 niche sites with one keyboard. SEOForge is the difference between a hobby and a job.",
    name: "Alex P.",
    role: "Affiliate site owner",
  },
  {
    quote:
      "The quality gate has saved me from publishing dozens of weak drafts. Easily my favourite feature.",
    name: "Priya S.",
    role: "Content director",
  },
  {
    quote:
      "It paid for itself in the first month. I have hours back every week.",
    name: "Diego M.",
    role: "Freelance SEO",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-accent text-xs font-bold uppercase tracking-wider mb-3">
            Wall of love
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Built for operators <span className="text-accent">who ship.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            What people who actually run SEO sites say once they switch.
          </p>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 max-w-6xl mx-auto">
          {QUOTES.map((q, i) => (
            <figure
              key={i}
              className="break-inside-avoid bg-card-grad border border-border rounded-2xl p-6 mb-5"
            >
              <div className="text-accent text-2xl font-bold mb-2">&ldquo;</div>
              <blockquote
                className="text-text leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: q.quote }}
              />
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent grid place-items-center text-black font-black text-sm">
                  {q.name[0]}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-text">{q.name}</div>
                  <div className="text-muted">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="text-muted-2 text-xs text-center mt-10">
          Quotes are illustrative. Switch to your own once you launch.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
