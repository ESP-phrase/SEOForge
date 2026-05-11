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
