/**
 * Transactional emails via Resend. Used for:
 *   - sendWelcomeEmail: fired the first time a user signs up
 *   - sendLowCreditEmail: fired when articlesUsed >= 80% of articleCredits
 *
 * All emails are no-op (silently skipped) if RESEND_API_KEY is missing so
 * dev environments without Resend don't crash. Errors are logged but never
 * thrown — email delivery should never block a user action.
 */
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.seoforge.org";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send(to: string, subject: string, html: string) {
  const r = client();
  if (!r) {
    console.log(`[email] skipped (no RESEND_API_KEY) → ${to} · ${subject}`);
    return;
  }
  try {
    const result = await r.emails.send({ from: FROM, to, subject, html });
    console.log(`[email] ✓ sent → ${to} · ${subject} · id=${result.data?.id}`);
  } catch (e) {
    console.error(
      `[email] ✗ failed → ${to} · ${subject} · ${e instanceof Error ? e.message : e}`,
    );
  }
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,system-ui,'Segoe UI',Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-radius:14px;overflow:hidden">
  <div style="padding:24px 28px;border-bottom:1px solid #222">
    <div style="font-weight:800;font-size:20px;letter-spacing:-0.02em">
      <span style="color:#fff">SEO</span><span style="color:#bef848">Forge</span>
    </div>
  </div>
  <div style="padding:28px;line-height:1.6">
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#fff">${title}</h1>
    ${body}
  </div>
  <div style="padding:18px 28px;border-top:1px solid #222;font-size:12px;color:#666">
    <a href="${APP_URL}" style="color:#bef848;text-decoration:none">seoforge.org</a> ·
    <a href="${APP_URL}/billing" style="color:#666;text-decoration:none">Billing</a> ·
    <a href="${APP_URL}/privacy" style="color:#666;text-decoration:none">Privacy</a>
  </div>
</div>
</body></html>`;
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const display = name?.trim() || to.split("@")[0];
  await send(
    to,
    "Welcome to SEOForge",
    shell(
      `Welcome, ${display} 👋`,
      `
      <p style="margin:0 0 14px;color:#ccc">Your account is live. You're on the free Hobby plan with <strong style="color:#bef848">10 articles/month</strong> to test the pipeline.</p>
      <p style="margin:0 0 20px;color:#ccc">Three quick things to do first:</p>
      <ol style="margin:0 0 24px;padding-left:20px;color:#ccc">
        <li style="margin-bottom:8px"><a href="${APP_URL}/sites/new" style="color:#bef848">Add your first site</a> — WordPress install or our hosted blog (30s).</li>
        <li style="margin-bottom:8px"><a href="${APP_URL}/sites/1/cluster" style="color:#bef848">Plan a cluster</a> — Claude designs a 12-article topic cluster around any pillar.</li>
        <li>Click <strong style="color:#fff">Run now</strong> — your first article publishes in ~30 seconds.</li>
      </ol>
      <p style="margin:0 0 16px"><a href="${APP_URL}/dashboard" style="background:#bef848;color:#000;padding:10px 18px;border-radius:10px;font-weight:800;text-decoration:none;display:inline-block">Open the dashboard →</a></p>
      <p style="margin:24px 0 0;color:#888;font-size:13px">Reply to this email anytime — I read every one.<br>— Aubrey, founder</p>
    `,
    ),
  );
}

export async function sendLowCreditEmail(
  to: string,
  used: number,
  cap: number,
  plan: string,
) {
  const pct = Math.round((used / cap) * 100);
  await send(
    to,
    `${pct}% of your SEOForge credits used`,
    shell(
      `You're at ${used}/${cap} articles`,
      `
      <p style="margin:0 0 14px;color:#ccc">You've used <strong style="color:#fff">${pct}%</strong> of this month's credits on the ${plan} plan. ${cap - used} articles left until renewal.</p>
      <p style="margin:0 0 20px;color:#ccc">If you're publishing daily, upgrading now keeps the pipeline running without interruption.</p>
      <p style="margin:0 0 16px"><a href="${APP_URL}/pricing" style="background:#bef848;color:#000;padding:10px 18px;border-radius:10px;font-weight:800;text-decoration:none;display:inline-block">Upgrade plan →</a> &nbsp; <a href="${APP_URL}/billing" style="color:#bef848;text-decoration:none">View billing</a></p>
      <p style="margin:24px 0 0;color:#888;font-size:13px">Already upgraded? Ignore this email.</p>
    `,
    ),
  );
}
