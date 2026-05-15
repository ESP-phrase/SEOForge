import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { CopyRow } from "@/components/CopyRow";

export const dynamic = "force-dynamic";

function genCode(): string {
  // 8-char base36 ID, looks like "K3MA9P7Q"
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default async function AffiliateDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  // Lazily generate a referral code on first visit.
  if (!user.referralCode) {
    // Retry on the very unlikely collision.
    for (let i = 0; i < 5; i++) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: genCode() },
        });
        break;
      } catch {
        /* unique collision — try again */
      }
    }
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user!.id },
    orderBy: { createdAt: "desc" },
    include: { referred: { select: { email: true, plan: true, createdAt: true } } },
  });

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.seoforge.org";
  const link = `${base}/?r=${user!.referralCode}`;

  const totalEarnings = referrals.reduce((s, r) => s + r.totalEarnings, 0);
  const subscribed = referrals.filter((r) => r.status === "subscribed").length;

  return (
    <>
      <PageHeader
        title="Affiliate program"
        subtitle="Earn 30% recurring on every paying customer you refer — for 12 months."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Total earnings</div>
          <div className="text-3xl font-extrabold text-accent">${totalEarnings.toFixed(2)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Signups</div>
          <div className="text-3xl font-extrabold text-text">{referrals.length}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Paying customers</div>
          <div className="text-3xl font-extrabold text-text">{subscribed}</div>
        </Panel>
      </div>

      <Panel title="Your referral link" className="mb-4">
        <p className="text-muted text-sm mb-4">
          Share this link anywhere. When someone signs up through it and pays, you earn{" "}
          <strong className="text-text">30% recurring</strong> for 12 months.
        </p>
        <CopyRow label="Your link" value={link} />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <CopyRow label="Operator pitch" compact value={`Just found this AI SEO tool that auto-publishes to WordPress. Wild quality. Try free → ${link}`} />
          <CopyRow label="X/Twitter" compact value={`Stopped writing blog content. AI handles it now → ${link}`} />
          <CopyRow label="Plain URL" compact value={link} />
        </div>
      </Panel>

      <Panel title={`Your referrals (${referrals.length})`}>
        {referrals.length === 0 ? (
          <div className="text-muted text-sm py-8 text-center">
            No referrals yet. Share your link to start earning.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase border-b border-border">
                <th className="py-2">Email</th>
                <th className="py-2">Joined</th>
                <th className="py-2">Plan</th>
                <th className="py-2 text-right">Earned</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-b border-border/40">
                  <td className="py-2 text-text">{r.referred.email}</td>
                  <td className="py-2 text-muted text-xs">
                    {new Date(r.referred.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <span className="text-[0.65rem] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-surface-2 text-text">
                      {r.referred.plan}
                    </span>
                  </td>
                  <td className="py-2 text-right font-bold text-accent">
                    ${r.totalEarnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel className="mt-4">
        <div className="text-sm text-muted">
          Payouts on the 15th of each month, minimum $50. PayPal by default. Email{" "}
          <a
            href="mailto:aubreynicholsacc@gmail.com"
            className="text-accent hover:underline"
          >
            aubreynicholsacc@gmail.com
          </a>{" "}
          to set up bank transfer or change payout email.
        </div>
      </Panel>
    </>
  );
}
