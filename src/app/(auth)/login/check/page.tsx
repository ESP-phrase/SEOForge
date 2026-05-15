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
        <div className="text-6xl mb-3">📬</div>
        <h1 className="text-2xl font-extrabold inline-flex items-center gap-2 tracking-tight">
          Check your email
          <SparkIcon size={20} className="text-accent" />
        </h1>
        <div className="text-muted text-sm mt-2 max-w-sm mx-auto">
          We sent a sign-in link to{" "}
          {email ? (
            <span className="text-text font-semibold">{email}</span>
          ) : (
            "your inbox"
          )}
          .
        </div>
      </div>

      <div className="bg-card-grad border border-border rounded-2xl p-7 shadow-panel">
        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-black grid place-items-center font-extrabold text-xs">
              1
            </span>
            <div>
              <div className="font-bold text-text mb-0.5">Open the email</div>
              <div className="text-muted text-xs">
                Sender: <code className="text-text">onboarding@resend.dev</code> (check spam too)
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-black grid place-items-center font-extrabold text-xs">
              2
            </span>
            <div>
              <div className="font-bold text-text mb-0.5">Click the sign-in link</div>
              <div className="text-muted text-xs">
                The link works once and expires after 24 hours.
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-black grid place-items-center font-extrabold text-xs">
              3
            </span>
            <div>
              <div className="font-bold text-text mb-0.5">Land on your dashboard</div>
              <div className="text-muted text-xs">
                Stay signed in for 14 days on this browser.
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div className="text-center text-muted text-xs mt-7 max-w-sm mx-auto">
        Didn&apos;t get it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Try a different email
        </Link>
        {" "}or sign in with Google instead.
      </div>
    </>
  );
}
