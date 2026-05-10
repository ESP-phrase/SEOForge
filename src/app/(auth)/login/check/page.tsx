import Link from "next/link";
import { SparkIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-3xl font-extrabold inline-flex items-center gap-2 tracking-tight">
          Check your email
          <SparkIcon size={22} className="text-accent" />
        </h1>
        <div className="text-muted text-sm mt-2">
          We sent a sign-in link {email ? <>to <strong className="text-text">{email}</strong></> : "to your inbox"}.
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(190,248,72,0.45) 0%, rgba(190,248,72,0.05) 30%, transparent 60%, rgba(190,248,72,0.05) 80%, rgba(190,248,72,0.4) 100%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: 1,
          }}
        />
        <div className="relative bg-card-grad rounded-2xl p-7 shadow-panel">
          <ol className="space-y-4 text-sm text-muted">
            <Step n={1} title="Open the email">
              From the address you set as <code className="text-text bg-surface-2 px-1 rounded">EMAIL_FROM</code>.
            </Step>
            <Step n={2} title="Click the sign-in link">
              The link signs you in once and expires shortly.
            </Step>
            <Step n={3} title="Land on the dashboard">
              You stay signed in for 14 days on this browser.
            </Step>
          </ol>
        </div>
      </div>

      <div className="text-center text-muted text-sm mt-7">
        Didn&apos;t get it?{" "}
        <Link href="/login" className="text-accent">
          Try again
        </Link>
      </div>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-lg bg-accent-dim text-accent border border-accent-border grid place-items-center text-xs font-black shrink-0">
        {n}
      </span>
      <div>
        <div className="text-text font-semibold">{title}</div>
        <div>{children}</div>
      </div>
    </li>
  );
}
