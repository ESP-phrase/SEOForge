/**
 * DEBUG endpoint — temporary. Reports what process.env looks like inside the
 * running Next.js process. Remove before going to prod.
 */
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Only enabled in development. In prod it 404s.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const k = process.env.ANTHROPIC_API_KEY ?? "";
  return NextResponse.json({
    cwd: process.cwd(),
    nodeVersion: process.version,
    pid: process.pid,
    anthropicKeyPresent: !!k,
    anthropicKeyLength: k.length,
    anthropicKeyPrefix: k.slice(0, 15),
    anthropicKeySuffix: k.slice(-6),
    envKeysStartingWithA: Object.keys(process.env).filter((x) => x.startsWith("A")),
    hasDb: !!process.env.DATABASE_URL,
    hasAuthSecret: !!process.env.AUTH_SECRET,
  });
}
