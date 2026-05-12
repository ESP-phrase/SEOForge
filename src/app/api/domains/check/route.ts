/**
 * Poll endpoint for the onboarding UI. Asks Vercel for the latest verification
 * state and updates the Site row. Client-side component hits this every ~5s
 * until status flips to "live" or the user navigates away.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDomain, statusFromVercel } from "@/lib/vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
  }
  const siteId = Number(req.nextUrl.searchParams.get("siteId"));
  if (!siteId) return NextResponse.json({ ok: false, error: "missing siteId" }, { status: 400 });

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site?.customDomain) {
    return NextResponse.json({ ok: true, status: "none" });
  }

  try {
    const vd = await getDomain(site.customDomain);
    const status = statusFromVercel(vd);
    if (status !== site.customDomainStatus) {
      await prisma.site.update({
        where: { id: siteId },
        data: { customDomainStatus: status, customDomainError: null },
      });
    }
    return NextResponse.json({
      ok: true,
      status,
      verified: vd.verified,
      verification: vd.verification ?? [],
      domain: site.customDomain,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "check failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
