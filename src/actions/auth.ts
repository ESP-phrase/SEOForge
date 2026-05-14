"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email.")}`);
  }
  // signIn must use redirect:true (default) for email providers so Auth.js
  // can complete its internal verify-request flow. NEXT_REDIRECT is a normal
  // Next.js control-flow exception — rethrow it; only catch real errors.
  try {
    await signIn("resend", { email, redirectTo: `/login/check?email=${encodeURIComponent(email)}` });
  } catch (e) {
    // Next.js redirect() throws an internal sentinel; let it propagate.
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest?: string }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : "Could not send link.";
    if (msg.toLowerCase().includes("accessdenied")) {
      redirect(`/login?error=${encodeURIComponent("That email is not allowed to sign in.")}`);
    }
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function signInWithGoogleAction() {
  // Let Auth.js handle the OAuth redirect to Google.
  await signIn("google", { redirectTo: "/dashboard" });
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
export async function adminQuickLoginAction() {
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
