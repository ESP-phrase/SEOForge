"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email.")}`);
  }
  try {
    // signIn with the resend (email) provider returns a redirect URL Next.js
    // server actions follow automatically. We pass redirectTo so a successful
    // verification lands on /dashboard.
    await signIn("resend", {
      email,
      redirect: false,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not send link.";
    if (msg.toLowerCase().includes("accessdenied")) {
      redirect(`/login?error=${encodeURIComponent("That email is not allowed to sign in.")}`);
    }
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
  redirect(`/login/check?email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
