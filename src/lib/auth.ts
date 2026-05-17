/**
 * Auth.js v5 with magic-link email auth via Resend, plus Google / GitHub /
 * Twitter OAuth providers.
 *
 * - Magic-link login: user enters email → we send a one-time link → click signs in.
 * - Database sessions (Prisma adapter) so multiple devices stay signed in.
 * - Open signups — anyone with a valid email can create an account. This is
 *   a public SaaS, not a self-hosted single-admin gate.
 *
 * Required env vars:
 *   RESEND_API_KEY  — from https://resend.com/api-keys
 *   EMAIL_FROM      — verified sender (or "onboarding@resend.dev" for testing)
 */
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db";

export function isGoogleAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
export function isXAuthConfigured(): boolean {
  return !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET);
}
export function isGitHubAuthConfigured(): boolean {
  return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

/**
 * Wrap PrismaAdapter so a missing session on delete/update doesn't blow up the
 * sign-in flow. Auth.js rotates sessions on sign-in and tries to clear any old
 * one referenced by the cookie — if the user's cookie points to a session that
 * no longer exists in the DB (stale cookie after a DB reset, e.g.), the default
 * adapter throws AdapterError. We swallow the "record not found" case only.
 */
function tolerantAdapter() {
  const base = PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>;
  const isMissing = (e: unknown) =>
    typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2025";

  const origDelete = base.deleteSession?.bind(base);
  if (origDelete) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (base.deleteSession as any) = async (token: string) => {
      try {
        return await origDelete(token);
      } catch (e) {
        if (isMissing(e)) return null;
        throw e;
      }
    };
  }

  const origUpdate = base.updateSession?.bind(base);
  if (origUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (base.updateSession as any) = async (data: Parameters<typeof origUpdate>[0]) => {
      try {
        return await origUpdate(data);
      } catch (e) {
        if (isMissing(e)) return null;
        throw e;
      }
    };
  }

  return base;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  adapter: tolerantAdapter(),
  session: { strategy: "database", maxAge: 60 * 60 * 24 * 14 }, // 14 days
  pages: { signIn: "/login", verifyRequest: "/login/check", error: "/login" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY ?? "",
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      name: "Email",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid email profile" } },
      // Auto-link a Google identity to an existing User with the same email
      // address. Safe here because email verification on the existing User
      // happened out-of-band (magic link) — we know the user owns it.
      allowDangerousEmailAccountLinking: true,
    }),
    ...(isXAuthConfigured()
      ? [
          Twitter({
            clientId: process.env.TWITTER_CLIENT_ID ?? "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(isGitHubAuthConfigured()
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      // Open signups — anyone with a valid email can register and sign in.
      return !!user?.email;
    },
    session: async ({ session, user }) => {
      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;
      }
      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      }
    },
    createUser: async ({ user }) => {
      if (!user?.id) return;
      // Attach referral if the user came in via /?r=CODE (cookie set by middleware).
      try {
        const { cookies } = await import("next/headers");
        const c = await cookies();
        const refCode = c.get("sf_ref")?.value;
        if (refCode) {
          const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
          if (referrer && referrer.id !== user.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: { referredBy: refCode },
            });
            await prisma.referral.create({
              data: { referrerId: referrer.id, referredId: user.id },
            });
            console.log(`[referral] ${user.email} attributed to ${referrer.email}`);
          }
        }
      } catch (e) {
        console.warn("[referral] attribution failed:", e);
      }
      // Welcome email
      if (user.email) {
        const { sendWelcomeEmail } = await import("@/lib/email");
        void sendWelcomeEmail(user.email, user.name);
      }
      // Reddit conversion: SignUp + Lead (free Hobby plan)
      try {
        const { sendRedditEvent } = await import("@/lib/redditCapi");
        await sendRedditEvent({
          eventName: "SignUp",
          email: user.email,
          userId: user.id,
        });
        await sendRedditEvent({
          eventName: "Lead",
          email: user.email,
          userId: user.id,
        });
      } catch {
        /* never block signup on tracking */
      }
      // TikTok conversion: CompleteRegistration
      try {
        const { sendTikTokEvent } = await import("@/lib/tiktokCapi");
        await sendTikTokEvent({
          eventName: "CompleteRegistration",
          email: user.email,
          userId: user.id,
          eventId: `signup_${user.id}`,
        });
      } catch {
        /* never block signup on tracking */
      }
    },
  },
});

export async function hasUsers(): Promise<boolean> {
  return (await prisma.user.count()) > 0;
}
