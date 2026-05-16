"use client";

import { useEffect, useState } from "react";

type Row = { platform: string; event: string; ok: boolean; note?: string };

/**
 * Browser-side pixel firer. Runs once on mount. Waits 1s after mount so
 * the next/script tags for ttq and rdt have time to inject and attach
 * themselves to window — otherwise we'd race the script load.
 */
export function TestPixelsClient() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      const results: Row[] = [];
      const txnId = `test_${Date.now()}`;

      // ── TikTok browser pixel ──────────────────────────────────────────
      type Ttq = { track?: (e: string, p: Record<string, unknown>) => void };
      const wt = window as unknown as { ttq?: Ttq };
      const fireTik = (event: string, props: Record<string, unknown>) => {
        try {
          if (!wt.ttq?.track) {
            results.push({ platform: "TikTok", event, ok: false, note: "ttq not loaded (ad blocker?)" });
            return;
          }
          wt.ttq.track(event, props);
          results.push({ platform: "TikTok", event, ok: true, note: "fired" });
        } catch (e) {
          results.push({ platform: "TikTok", event, ok: false, note: String(e).slice(0, 80) });
        }
      };
      // Fire every TikTok standard event once so each row in Events Manager
      // flips to Active and becomes available as a campaign optimization goal.
      fireTik("ViewContent",          { value: 0,  currency: "USD", content_id: "test_pixels_page", content_name: "Test pixels page",   content_type: "product" });
      fireTik("ClickButton",          { value: 0,  currency: "USD", content_id: "test_button",      content_name: "Test button click",  content_type: "product" });
      fireTik("Search",               { value: 0,  currency: "USD", content_id: "test_search",      content_name: "Test search",        content_type: "product", search_string: "seoforge" });
      fireTik("AddToWishlist",        { value: 29, currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("AddToCart",            { value: 29, currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("AddPaymentInfo",       { value: 29, currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("InitiateCheckout",     { value: 29, currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("PlaceAnOrder",         { value: 29, currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("CompletePayment",      { value: 29, currency: "USD", content_id: txnId,              content_name: "Operator plan",      content_type: "product" });
      fireTik("CompleteRegistration", { value: 0,  currency: "USD", content_id: `signup_${txnId}`,  content_name: "Free signup",        content_type: "product" });
      fireTik("Subscribe",            { value: 0,  currency: "USD", content_id: `sub_${txnId}`,     content_name: "Newsletter",         content_type: "product" });
      fireTik("Contact",              { value: 0,  currency: "USD", content_id: "test_contact",     content_name: "Contact form",       content_type: "product" });
      fireTik("Download",             { value: 0,  currency: "USD", content_id: "test_download",    content_name: "Test download",      content_type: "product" });
      fireTik("SubmitForm",           { value: 0,  currency: "USD", content_id: "test_form",        content_name: "Test form submit",   content_type: "product" });
      fireTik("CustomizeProduct",     { value: 0,  currency: "USD", content_id: "test_customize",   content_name: "Test customize",     content_type: "product" });
      fireTik("FindLocation",         { value: 0,  currency: "USD", content_id: "test_location",    content_name: "Test find location", content_type: "product" });
      fireTik("ScheduleAppointment",  { value: 0,  currency: "USD", content_id: "test_appointment", content_name: "Test appointment",   content_type: "product" });
      fireTik("StartTrial",           { value: 1,  currency: "USD", content_id: "operator",         content_name: "Operator plan",      content_type: "product" });
      fireTik("ApplicationApproval",  { value: 0,  currency: "USD", content_id: "test_application", content_name: "Test application",   content_type: "product" });

      // ── Reddit browser pixel ──────────────────────────────────────────
      type Rdt = (e: string, a: string, p: Record<string, unknown>) => void;
      const wr = window as unknown as { rdt?: Rdt };
      const fireReddit = (action: string, props: Record<string, unknown>) => {
        try {
          if (typeof wr.rdt !== "function") {
            results.push({ platform: "Reddit", event: action, ok: false, note: "rdt not loaded (ad blocker?)" });
            return;
          }
          wr.rdt("track", action, props);
          results.push({ platform: "Reddit", event: action, ok: true, note: "fired" });
        } catch (e) {
          results.push({ platform: "Reddit", event: action, ok: false, note: String(e).slice(0, 80) });
        }
      };
      fireReddit("ViewContent", { currency: "USD" });
      fireReddit("AddToCart",   { value: 29, currency: "USD", itemCount: 1 });
      fireReddit("SignUp",      {});
      fireReddit("Lead",        {});
      fireReddit("Purchase",    { value: 29, currency: "USD", conversion_id: txnId });

      setRows(results);
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  if (rows.length === 0) {
    return <div className="text-muted text-sm">Firing browser-side events… (~1s delay for pixels to load)</div>;
  }

  return (
    <table className="w-full text-sm border border-border">
      <thead className="bg-surface-2">
        <tr>
          <th className="text-left px-3 py-2">Platform</th>
          <th className="text-left px-3 py-2">Event</th>
          <th className="text-left px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border">
            <td className="px-3 py-2">{r.platform}</td>
            <td className="px-3 py-2">{r.event}</td>
            <td className="px-3 py-2">
              {r.ok ? <span className="text-accent">✓ {r.note}</span> : <span className="text-red-400">✗ {r.note}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
