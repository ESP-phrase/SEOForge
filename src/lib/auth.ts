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
import { prisma } from "@/lib/db";

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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database", maxAge: 60 * 60 * 24 * 14 }, // 14 days
  pages: { signIn: "/login", verifyRequest: "/login/check", error: "/login" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY ?? "",
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      name: "Email",
    }),
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
