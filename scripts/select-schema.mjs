/**
 * Pre-build hook: when running on Vercel (or anywhere with VERCEL=1 or
 * USE_POSTGRES=1), overwrite the local sqlite-targeted schema.prisma with the
 * postgres-targeted variant so the build uses Postgres.
 *
 * Locally this is a no-op — the original sqlite schema stays in place.
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const useProd =
  process.env.VERCEL === "1" ||
  process.env.USE_POSTGRES === "1" ||
  process.env.NODE_ENV === "production";

if (!useProd) {
  console.log("[select-schema] using sqlite schema (local dev)");
  process.exit(0);
}

const src = resolve("prisma/schema.postgres.prisma");
const dst = resolve("prisma/schema.prisma");

if (!existsSync(src)) {
  console.error(`[select-schema] missing ${src}`);
  process.exit(1);
}

copyFileSync(src, dst);
console.log("[select-schema] swapped schema.prisma → postgres (Vercel build)");
