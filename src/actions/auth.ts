"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function signInWithGoogleAction(): Promise<void> {
  // Let Auth.js handle the OAuth redirect to Google.
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithXAction(): Promise<void> {
  // X (Twitter) OAuth — provider name is "twitter" in next-auth v5.
  await signIn("twitter", { redirectTo: "/dashboard" });
}

/**
 * Quick admin login — bypasses magic link/OAuth. Gated by ADMIN_QUICK_LOGIN=1.
 *
 * Implementation: creates a Session row directly for the first (admin) user,
 * sets the Auth.js session cookie, and redirects to /dashboard. Auth.js then
 * treats the request as a normal authenticated session on every subsequent
 * request.
 *
 * Disable in production by removing the env var. Without it, the action and
 * the button on /login both refuse to render.
 */
export async function adminQuickLoginAction(): Promise<void> {
  if (process.env.ADMIN_QUICK_LOGIN !== "1") {
    redirect("/login?error=" + encodeURIComponent("Admin quick login is disabled."));
  }
  const { prisma } = await import("@/lib/db");
  const crypto = await import("node:crypto");
  const { cookies } = await import("next/headers");

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("No admin user exists yet."));
  }

  const sessionToken = `${crypto.randomUUID()}${crypto.randomBytes(8).toString("hex")}`;
  const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

  const isProd = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set(isProd ? "__Secure-authjs.session-token" : "authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires,
    path: "/",
  });
  redirect("/dashboard");
}
