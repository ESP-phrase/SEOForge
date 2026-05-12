/**
 * Vercel Domains API wrapper for customer-domain onboarding.
 * Docs: https://vercel.com/docs/rest-api/reference/endpoints/projects
 *
 * Required env:
 *   VERCEL_TOKEN       — personal access token (Settings → Tokens)
 *   VERCEL_PROJECT_ID  — the project to attach domains to (Settings → Project ID)
 *   VERCEL_TEAM_ID     — only if the project belongs to a team
 *
 * Flow we use:
 *   1. POST /v10/projects/{id}/domains   → attach the domain (Vercel issues SSL)
 *   2. GET  /v9/projects/{id}/domains/{domain}  → poll verified status
 *   3. DELETE on detach
 */

const API = "https://api.vercel.com";

function token(): string {
  return process.env.VERCEL_TOKEN ?? "";
}
function projectId(): string {
  return process.env.VERCEL_PROJECT_ID ?? "";
}
function teamQs(): string {
  return process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
}

export function isVercelConfigured(): boolean {
  return !!(token() && projectId());
}

/** Recommended CNAME target for subdomains. */
export const CNAME_TARGET = "cname.vercel-dns.com.";
/** A records for apex domains (no www, no subdomain). */
export const APEX_A_RECORDS = ["76.76.21.21"];

export type VercelDomain = {
  name: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string; reason?: string }[];
  apexName?: string;
};

/** Attach a domain to the project. Idempotent for already-attached domains. */
export async function attachDomain(domain: string): Promise<VercelDomain> {
  const res = await fetch(
    `${API}/v10/projects/${projectId()}/domains${teamQs()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    },
  );
  if (res.status === 409) {
    // Already attached — fetch and return current state.
    return getDomain(domain);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel attach failed (${res.status}): ${body}`);
  }
  return (await res.json()) as VercelDomain;
}

/** Get current state for a previously-attached domain. */
export async function getDomain(domain: string): Promise<VercelDomain> {
  const res = await fetch(
    `${API}/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQs()}`,
    { headers: { Authorization: `Bearer ${token()}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel getDomain failed (${res.status}): ${body}`);
  }
  return (await res.json()) as VercelDomain;
}

/** Detach a domain from the project. */
export async function removeDomain(domain: string): Promise<void> {
  const res = await fetch(
    `${API}/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQs()}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } },
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Vercel removeDomain failed (${res.status}): ${await res.text()}`);
  }
}

/**
 * Decide what DNS instruction to surface to the user.
 * Subdomain (blog.example.com) → CNAME. Apex (example.com) → A records.
 */
export function dnsInstruction(domain: string): {
  type: "CNAME" | "A";
  name: string;
  values: string[];
} {
  const parts = domain.toLowerCase().split(".");
  const isApex = parts.length === 2 || (parts.length === 3 && parts[0] === "www");
  if (isApex && parts[0] !== "www") {
    return { type: "A", name: "@", values: APEX_A_RECORDS };
  }
  return { type: "CNAME", name: parts[0], values: [CNAME_TARGET] };
}

/** Map the Vercel domain state to our local status string. */
export function statusFromVercel(d: VercelDomain): "pending" | "verifying" | "live" {
  if (d.verified) return "live";
  // If there's a verification challenge waiting, we're pending DNS.
  return (d.verification?.length ?? 0) > 0 ? "pending" : "verifying";
}
