/**
 * Fallback env reader. Next.js' built-in .env loader is no-op when a variable
 * is already set in process.env — even if set to an empty string. Some shells
 * (Claude Code, certain CI runners) pre-set ANTHROPIC_API_KEY to "" which wins
 * over the real value in .env. This helper reads .env directly when an
 * expected variable comes back empty.
 *
 * Safe to call repeatedly — caches the parsed file on the module.
 */
import fs from "node:fs";
import path from "node:path";

let cache: Record<string, string> | null = null;
let cacheMtime = 0;

function parseEnv(): Record<string, string> {
  // Bust cache if .env was modified since last read.
  try {
    const p = path.join(process.cwd(), ".env");
    const stat = fs.statSync(p);
    const m = stat.mtimeMs;
    if (cache && m === cacheMtime) return cache;
    cacheMtime = m;
  } catch {
    if (cache) return cache;
  }
  const out: Record<string, string> = {};
  try {
    const p2 = path.join(process.cwd(), ".env");
    if (!fs.existsSync(p2)) return (cache = out);
    const raw = fs.readFileSync(p2, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/i);
      if (m) {
        let val = m[2].trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        out[m[1]] = val;
      }
    }
  } catch {
    /* ignore — return whatever we have */
  }
  return (cache = out);
}

/** Return the env var, falling back to .env file if the process env value is empty. */
export function getEnv(name: string): string {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.length > 0) return fromProcess;
  return parseEnv()[name] ?? "";
}
