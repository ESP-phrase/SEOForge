"use client";

import { useEffect, useState, useTransition } from "react";
import { attachDomainAction, removeDomainAction } from "@/actions/domains";

type Props = {
  siteId: number;
  customDomain: string | null;
  customDomainStatus: string;
  customDomainError: string | null;
};

function dnsHint(domain: string): { type: "CNAME" | "A"; name: string; values: string[] } {
  const parts = domain.toLowerCase().split(".");
  const isApex = parts.length === 2;
  if (isApex) return { type: "A", name: "@", values: ["76.76.21.21"] };
  return { type: "CNAME", name: parts[0], values: ["cname.vercel-dns.com."] };
}

function Copy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="ml-2 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border border-border rounded text-muted hover:text-accent hover:border-accent-border transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CustomDomainPanel({
  siteId,
  customDomain,
  customDomainStatus,
  customDomainError,
}: Props) {
  const [domainInput, setDomainInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(customDomainError);
  const [status, setStatus] = useState(customDomainStatus);
  const [domain, setDomain] = useState(customDomain);
  const [polling, setPolling] = useState(false);

  // Poll while pending/verifying.
  useEffect(() => {
    if (!domain) return;
    if (status === "live") return;
    if (status !== "pending" && status !== "verifying") return;
    setPolling(true);
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/domains/check?siteId=${siteId}`, { cache: "no-store" });
        const j = await res.json();
        if (stopped) return;
        if (j.ok && j.status) setStatus(j.status);
      } catch {
        /* ignore — try again next tick */
      }
    }, 5000);
    return () => {
      stopped = true;
      setPolling(false);
      clearInterval(interval);
    };
  }, [domain, status, siteId]);

  if (!domain) {
    return (
      <div className="bg-card-grad border border-border rounded-2xl p-6">
        <h3 className="text-base font-bold mb-1">Custom domain</h3>
        <p className="text-muted text-sm mb-4">
          Serve this site&apos;s blog on your own domain (e.g.{" "}
          <code className="text-text">blog.yoursite.com</code>). We&apos;ll attach it to our
          infrastructure and issue an SSL certificate automatically — you just add one DNS record.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              setServerError(null);
              const r = await attachDomainAction(fd);
              if (!r.ok) {
                setServerError(r.error ?? "Failed to attach.");
              } else {
                setDomain(r.domain ?? domainInput);
                setStatus(r.status ?? "pending");
              }
            });
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input type="hidden" name="siteId" value={siteId} />
          <input
            name="domain"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="blog.yoursite.com"
            className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent-border"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {pending ? "Attaching…" : "Connect domain"}
          </button>
        </form>
        {serverError ? (
          <p className="text-red-400 text-sm mt-3">{serverError}</p>
        ) : null}
      </div>
    );
  }

  const hint = dnsHint(domain);

  const statusBadge =
    status === "live" ? (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-accent text-black text-[0.65rem] font-extrabold uppercase tracking-wider rounded">
        ✓ Live
      </span>
    ) : status === "verifying" ? (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400 text-black text-[0.65rem] font-extrabold uppercase tracking-wider rounded">
        ⟳ Issuing SSL
      </span>
    ) : status === "error" ? (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-400 text-black text-[0.65rem] font-extrabold uppercase tracking-wider rounded">
        ! Error
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-2 border border-border text-muted text-[0.65rem] font-extrabold uppercase tracking-wider rounded">
        {polling ? "⟳ " : ""}Waiting for DNS
      </span>
    );

  return (
    <div className="bg-card-grad border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold mb-0.5 flex items-center gap-2">
            {domain} {statusBadge}
          </h3>
          <p className="text-muted text-xs">
            {status === "live"
              ? "Your blog is live on this domain. SSL is active."
              : status === "verifying"
                ? "DNS resolves. We're provisioning the SSL certificate — usually ~1 minute."
                : status === "error"
                  ? customDomainError ?? "Something went wrong."
                  : "We're waiting for your DNS record to propagate. Add the record below at your domain registrar."}
          </p>
        </div>
        <form
          action={async (fd: FormData) => {
            await removeDomainAction(fd);
            setDomain(null);
            setStatus("none");
          }}
        >
          <input type="hidden" name="siteId" value={siteId} />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs border border-border rounded-md text-muted hover:text-red-400 hover:border-red-400/40"
          >
            Disconnect
          </button>
        </form>
      </div>

      {status !== "live" ? (
        <div className="bg-surface-2 border border-border rounded-lg p-4 text-sm">
          <div className="text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            Add this DNS record at your domain registrar
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm font-mono">
            <div className="text-muted">Type</div>
            <div className="text-text flex items-center">
              {hint.type}
              <Copy text={hint.type} />
            </div>
            <div className="text-muted">Name</div>
            <div className="text-text flex items-center">
              {hint.name}
              <Copy text={hint.name} />
            </div>
            <div className="text-muted">Value</div>
            <div className="text-text flex items-center">
              {hint.values[0]}
              <Copy text={hint.values[0]} />
            </div>
          </div>
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-muted hover:text-text">
              Where do I add this record?
            </summary>
            <ul className="mt-2 space-y-1 ml-4 list-disc text-muted">
              <li>
                <a className="text-accent hover:underline" href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">Cloudflare</a> → DNS → Records → Add record
              </li>
              <li>
                <a className="text-accent hover:underline" href="https://dcc.godaddy.com/manage/dns" target="_blank" rel="noreferrer">GoDaddy</a> → My Domains → DNS → Add
              </li>
              <li>
                <a className="text-accent hover:underline" href="https://ap.www.namecheap.com" target="_blank" rel="noreferrer">Namecheap</a> → Domain List → Manage → Advanced DNS
              </li>
              <li>
                Squarespace → Domains → DNS Settings → Custom records
              </li>
            </ul>
          </details>
          {polling ? (
            <div className="mt-3 text-xs text-muted flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              Checking DNS every 5 seconds — usually live within 1–10 minutes
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-accent-dim border border-accent-border rounded-lg p-4 text-sm">
          <div className="text-accent font-bold mb-1">✓ Domain is live</div>
          <p className="text-muted text-xs">
            Visit{" "}
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              https://{domain}
            </a>{" "}
            to see your blog. New posts published to this site will appear there automatically.
          </p>
        </div>
      )}
    </div>
  );
}
