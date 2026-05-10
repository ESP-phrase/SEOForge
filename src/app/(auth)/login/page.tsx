import { sendMagicLinkAction } from "@/actions/auth";
import { Button } from "@/components/Button";
import { IconInput } from "@/components/auth/IconInput";
import { UserIcon, ArrowRightIcon, SparkIcon } from "@/components/Icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-3xl font-extrabold inline-flex items-center gap-2 tracking-tight">
          Welcome back
          <SparkIcon size={22} className="text-accent" />
        </h1>
        <div className="text-muted text-sm mt-2">
          Enter your email — we&apos;ll send a one-time sign-in link.
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(190,248,72,0.45) 0%, rgba(190,248,72,0.05) 30%, transparent 60%, rgba(190,248,72,0.05) 80%, rgba(190,248,72,0.4) 100%)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: 1,
          }}
        />
        <div className="relative bg-card-grad rounded-2xl p-7 shadow-panel">
          {error ? (
            <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
              {error}
            </div>
          ) : null}
          <form action={sendMagicLinkAction} className="flex flex-col gap-1">
            <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
              Email
            </label>
            <IconInput
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={email}
              leftIcon={<UserIcon size={18} />}
            />
            <Button type="submit" full className="mt-6">
              Send magic link <ArrowRightIcon size={16} />
            </Button>
          </form>
          <div className="text-muted-2 text-xs mt-4 text-center">
            No password. The link works once and expires shortly.
          </div>
        </div>
      </div>

      <div className="text-center text-muted text-xs mt-7 max-w-sm mx-auto">
        Self-hosted: only emails in <code className="text-text bg-surface-2 px-1 rounded">ALLOWED_EMAILS</code> can sign in. If unset, the first email becomes admin and locks the door behind it.
      </div>
    </>
  );
}
