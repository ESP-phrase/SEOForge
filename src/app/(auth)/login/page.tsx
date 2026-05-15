import { signInWithGoogleAction, adminQuickLoginAction } from "@/actions/auth";
import { SparkIcon } from "@/components/Icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-3xl font-extrabold inline-flex items-center gap-2 tracking-tight">
          Welcome back
          <SparkIcon size={22} className="text-accent" />
        </h1>
        <div className="text-muted text-sm mt-2">
          Sign in with Google to continue.
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

          <form action={signInWithGoogleAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path fill="#4285F4" d="M16.51 8.18c0-.57-.05-1.13-.15-1.66H9v3.13h4.21c-.18.99-.74 1.83-1.58 2.39v1.97h2.55c1.49-1.38 2.34-3.41 2.34-5.83z" />
                <path fill="#34A853" d="M9 17c2.13 0 3.92-.71 5.23-1.92l-2.55-1.97c-.71.47-1.61.75-2.68.75-2.06 0-3.81-1.39-4.43-3.26H1.93v2.04C3.23 15.18 5.92 17 9 17z" />
                <path fill="#FBBC05" d="M4.57 10.6c-.16-.47-.25-.97-.25-1.5 0-.52.09-1.03.25-1.5V5.55H1.93C1.34 6.61 1 7.78 1 9.1c0 1.32.34 2.49.93 3.55l2.64-2.05z" />
                <path fill="#EA4335" d="M9 4.34c1.16 0 2.21.4 3.03 1.18l2.27-2.27C12.92 1.99 11.13 1.2 9 1.2 5.92 1.2 3.23 3.02 1.93 5.55l2.64 2.05C5.19 5.73 6.94 4.34 9 4.34z" />
              </svg>
              Continue with Google
            </button>
          </form>

          {process.env.ADMIN_QUICK_LOGIN === "1" ? (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-2 text-[0.65rem] uppercase tracking-wider font-bold">
                  or
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <form action={adminQuickLoginAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-black rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  <SparkIcon size={14} />
                  Admin quick login
                </button>
                <p className="text-muted-2 text-[0.65rem] text-center mt-1.5">
                  Bypasses OAuth — disable by removing <code>ADMIN_QUICK_LOGIN=1</code>
                </p>
              </form>
            </>
          ) : null}

          <div className="text-muted-2 text-xs mt-5 text-center">
            We never see your password. Google handles all auth.
          </div>
        </div>
      </div>

      <div className="text-center text-muted text-xs mt-7 max-w-sm mx-auto">
        Self-hosted: only emails in <code className="text-text bg-surface-2 px-1 rounded">ALLOWED_EMAILS</code> can sign in. If unset, the first email becomes admin and locks the door behind it.
      </div>
    </>
  );
}
