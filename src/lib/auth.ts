/**
 * Auth.js v5 with magic-link email auth via Resend.
 *
 * - Email-only login: user enters email → we send a one-time link → click signs in.
 * - Database sessions (Prisma adapter), so multiple devices can stay signed in.
 * - Self-hosted single-admin gate: only emails in ALLOWED_EMAILS may sign in.
 *   If ALLOWED_EMAILS is empty, the FIRST email to sign in becomes admin and is
 *   the only one allowed thereafter.
 *
 * Required env vars:
 *   RESEND_API_KEY  — from https://resend.com/api-keys
 *   EMAIL_FROM      — verified sender (or "onboarding@resend.dev" for testing)
 * Optional:
 *   ALLOWED_EMAILS  — comma-separated list of allowed signin emails
 */
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export function isGoogleAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
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
    base.deleteSession = async (token: string) => {
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
    base.updateSession = async (data) => {
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

function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function isAllowed(email: string): Promise<boolean> {
  const e = email.toLowerCase().trim();
  const allow = allowedEmails();
  if (allow.length > 0) return allow.includes(e);
  // No explicit allowlist: first email becomes admin and locks the door behind it.
  const userCount = await prisma.user.count();
  if (userCount === 0) return true;
  const existing = await prisma.user.findUnique({ where: { email: e } });
  return !!existing;
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
    ...(isGoogleAuthConfigured()
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            // Only basic profile + email — same OAuth client used for GSC has
            // the webmasters.readonly scope, which Google quietly grants too,
            // but Auth.js' own consent only asks for openid/email/profile here.
            authorization: { params: { scope: "openid email profile" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      const email = user?.email?.toLowerCase().trim();
      if (!email) return false;
      return isAllowed(email);
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
  },
});

export async function hasUsers(): Promise<boolean> {
  return (await prisma.user.count()) > 0;
}
