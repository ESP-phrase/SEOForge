/**
 * Google Search Console (Search Analytics) client.
 *
 * Auth: per-site OAuth refresh token, encrypted with ENCRYPTION_KEY.
 * API: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 *
 * No SDK — we use bare fetch against the OAuth + Search Analytics endpoints,
 * to keep deps minimal. Tokens are refreshed lazily on each query.
 */
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

export const GSC_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "openid",
  "email",
].join(" ");

export function clientId(): string {
  return process.env.GOOGLE_CLIENT_ID ?? "";
}
export function clientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET ?? "";
}
export function isGscConfigured(): boolean {
  return !!(clientId() && clientSecret());
}

export function redirectUri(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}/api/gsc/callback`;
}

/** Build the URL that starts Google's OAuth consent flow. */
export function buildConsentUrl(state: string): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", clientId());
  u.searchParams.set("redirect_uri", redirectUri());
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", GSC_SCOPES);
  u.searchParams.set("access_type", "offline");
  u.searchParams.set("prompt", "consent"); // ensure refresh_token is issued
  u.searchParams.set("include_granted_scopes", "true");
  u.searchParams.set("state", state);
  return u.toString();
}

/** Exchange an auth code for tokens. Returns { refresh_token, access_token }. */
export async function exchangeCode(
  code: string,
): Promise<{ refresh_token: string; access_token: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  if (!j.refresh_token) throw new Error("No refresh_token in response — user may need to revoke prior consent.");
  return { refresh_token: j.refresh_token, access_token: j.access_token };
}

/** Get a short-lived access token using the stored refresh token. */
export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.access_token as string;
}

/** List the user's verified Search Console properties. */
export async function listSites(refreshToken: string): Promise<string[]> {
  const access = await getAccessToken(refreshToken);
  const res = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) throw new Error(`listSites failed: ${res.status}`);
  const j = (await res.json()) as { siteEntry?: { siteUrl: string; permissionLevel: string }[] };
  return (j.siteEntry ?? [])
    .filter((s) => s.permissionLevel !== "siteUnverifiedUser")
    .map((s) => s.siteUrl);
}

export type GscRow = {
  keys: string[]; // depends on dimensions
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/** Query Search Analytics. */
export async function queryAnalytics(opts: {
  refreshToken: string;
  siteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  dimensions?: ("query" | "page" | "country" | "device" | "date")[];
  rowLimit?: number;
  filters?: { dimension: string; operator: string; expression: string }[];
}): Promise<GscRow[]> {
  const access = await getAccessToken(opts.refreshToken);
  const body: Record<string, unknown> = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: opts.dimensions ?? [],
    rowLimit: opts.rowLimit ?? 1000,
  };
  if (opts.filters?.length) {
    body.dimensionFilterGroups = [{ filters: opts.filters }];
  }
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(opts.siteUrl)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`searchAnalytics failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { rows?: GscRow[] };
  return j.rows ?? [];
}

/** Decrypt a Site's stored refresh token, or return null if not connected. */
export function getRefreshToken(site: { gscRefreshTokenEnc: string | null }): string | null {
  if (!site.gscRefreshTokenEnc) return null;
  try {
    return decrypt(site.gscRefreshTokenEnc);
  } catch {
    return null;
  }
}

/** Save a refresh token for a site (encrypted). */
export async function saveSiteConnection(siteId: number, refreshToken: string, siteUrl: string) {
  await prisma.site.update({
    where: { id: siteId },
    data: {
      gscRefreshTokenEnc: encrypt(refreshToken),
      gscSiteUrl: siteUrl,
      gscConnectedAt: new Date(),
    },
  });
}

/** Format a Date as YYYY-MM-DD in UTC. */
export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
