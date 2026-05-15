"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/Button";
import { IconInput } from "@/components/auth/IconInput";
import {
  GlobeIcon,
  UserIcon,
  LockIcon,
  TagIcon,
  UsersIcon,
  MessageIcon,
  CodeIcon,
  LinkIcon,
  ShieldIcon,
  ChevronDownIcon,
} from "@/components/Icons";

type Site = {
  id: number;
  name: string;
  slug: string;
  targetType?: string;
  wpUrl: string;
  wpUsername: string;
  niche: string;
  audience: string;
  expertVoice: string;
  authorBioHtml: string;
  ctaHtml: string;
  maxPerDay: number;
  minWordCount: number;
  publishStatus: string;
  active: boolean;
  themeAccent?: string;
  themeAccent2?: string;
  themeAccent3?: string;
  themeAccent4?: string;
};

const COLOR_PRESETS = [
  { name: "Sky (default)", colors: ["#0ea5e9", "#f59e0b", "#22c55e", "#a855f7"] },
  { name: "Forest", colors: ["#059669", "#d97706", "#0891b2", "#7c3aed"] },
  { name: "Sunset", colors: ["#dc2626", "#ea580c", "#facc15", "#9333ea"] },
  { name: "Ocean", colors: ["#0284c7", "#06b6d4", "#10b981", "#6366f1"] },
  { name: "Mono dark", colors: ["#1f2937", "#6b7280", "#9ca3af", "#d1d5db"] },
  { name: "Lime", colors: ["#84cc16", "#f59e0b", "#06b6d4", "#a855f7"] },
];

export function SiteForm({
  action,
  site,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  site?: Site;
  error?: string;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [target, setTarget] = useState<"wordpress" | "native">(
    (site?.targetType as "wordpress" | "native") ?? "wordpress",
  );
  const [accent1, setAccent1] = useState(site?.themeAccent ?? "#0ea5e9");
  const [accent2, setAccent2] = useState(site?.themeAccent2 ?? "#f59e0b");
  const [accent3, setAccent3] = useState(site?.themeAccent3 ?? "#22c55e");
  const [accent4, setAccent4] = useState(site?.themeAccent4 ?? "#a855f7");
  const isEdit = !!site;

  const applyPreset = (colors: string[]) => {
    setAccent1(colors[0]);
    setAccent2(colors[1]);
    setAccent3(colors[2]);
    setAccent4(colors[3]);
  };

  return (
    <div className="max-w-4xl">
      {/* Page header with icon */}
      <div className="flex items-center gap-4 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-accent-dim border border-accent-border grid place-items-center text-accent shadow-glow">
          <GlobeIcon size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight m-0">
            {isEdit ? "Edit site" : "Add a site"}
          </h1>
          <div className="text-muted text-sm mt-0.5">
            {isEdit
              ? target === "native"
                ? "Update settings, theme, or the custom domain."
                : "Update settings or rotate the WP application password."
              : "Pick where SEOForge should publish — a WordPress site or a native blog hosted by us."}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      ) : null}

      <form action={action} className="bg-card-grad border border-border rounded-2xl p-6 shadow-panel">
        {/* Target type picker */}
        <input type="hidden" name="targetType" value={target} />
        <FieldLabel>Where should we publish?</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setTarget("wordpress")}
            className={`text-left p-4 rounded-xl border-2 transition-colors ${
              target === "wordpress"
                ? "border-accent bg-accent-dim"
                : "border-border bg-surface-2 hover:border-border-strong"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl">📄</span>
              {target === "wordpress" ? (
                <span className="w-5 h-5 rounded-full bg-accent grid place-items-center" aria-label="Selected">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              ) : null}
            </div>
            <div className="font-bold text-sm text-text mb-0.5">WordPress site</div>
            <div className="text-muted text-xs leading-snug">
              Publish to your own WordPress install via the REST API. Requires URL and
              Application Password.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTarget("native")}
            className={`text-left p-4 rounded-xl border-2 transition-colors ${
              target === "native"
                ? "border-accent bg-accent-dim"
                : "border-border bg-surface-2 hover:border-border-strong"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl">✨</span>
              {target === "native" ? (
                <span className="w-5 h-5 rounded-full bg-accent grid place-items-center" aria-label="Selected">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              ) : null}
            </div>
            <div className="font-bold text-sm text-text mb-0.5">Native blog (hosted)</div>
            <div className="text-muted text-xs leading-snug">
              We host the blog at <code className="text-text">/blog/&lt;slug&gt;</code> or your
              custom domain. No credentials needed.
            </div>
          </button>
        </div>

        {/* Name (required) */}
        <FieldLabel required>Name</FieldLabel>
        <IconInput
          name="name"
          required
          defaultValue={site?.name}
          placeholder="e.g. My Blog, Client Site, Company Website"
          leftIcon={<UserIcon size={18} />}
        />

        {/* Slug (required) */}
        <FieldLabel required hint="Lowercase letters, digits, hyphens only">Slug</FieldLabel>
        <IconInput
          name="slug"
          required
          defaultValue={site?.slug}
          placeholder="e.g. my-blog"
          leftIcon={<LinkIcon size={18} />}
        />

        {target === "wordpress" ? (
          <>
            {/* WP URL + WP Username row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div>
                <FieldLabel required>WordPress URL</FieldLabel>
                <IconInput
                  name="wpUrl"
                  type="url"
                  required
                  defaultValue={site?.wpUrl}
                  placeholder="https://example.com"
                  leftIcon={<GlobeIcon size={18} />}
                />
              </div>
              <div>
                <FieldLabel>WP Username</FieldLabel>
                <IconInput
                  name="wpUsername"
                  required
                  defaultValue={site?.wpUsername}
                  placeholder="e.g. admin"
                  leftIcon={<UserIcon size={18} />}
                />
              </div>
            </div>

            {/* WP App Password (required, password type) */}
            <FieldLabel required hint="WP Admin → Users → Profile → Application Passwords">
              WP Application Password
            </FieldLabel>
            <IconInput
              name="wpAppPassword"
              password
              required={!isEdit}
              placeholder={isEdit ? "Leave blank to keep existing" : "Enter your application password"}
              leftIcon={<LockIcon size={18} />}
            />
          </>
        ) : (
          <div className="bg-accent-dim border border-accent-border rounded-xl p-4 mt-2 mb-4 flex gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <div className="font-bold text-sm text-text mb-0.5">Native hosting — nothing to set up</div>
              <div className="text-muted text-xs leading-snug">
                Your posts go live at <code className="text-text">/blog/&lt;slug&gt;</code>{" "}
                immediately. After saving, you can attach a custom domain like{" "}
                <code className="text-text">blog.yoursite.com</code> from the site page.
              </div>
            </div>
          </div>
        )}

        {/* Niche + Audience row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <FieldLabel hint="(optional)">Niche</FieldLabel>
            <IconInput
              name="niche"
              defaultValue={site?.niche}
              placeholder="e.g. Resume writing and career advice"
              leftIcon={<TagIcon size={18} />}
            />
          </div>
          <div>
            <FieldLabel hint="(optional)">Audience</FieldLabel>
            <IconInput
              name="audience"
              defaultValue={site?.audience}
              placeholder="e.g. Mid-career professionals applying to tech jobs"
              leftIcon={<UsersIcon size={18} />}
            />
          </div>
        </div>

        {/* Expert voice */}
        <FieldLabel hint="2–3 sentences in first person — Claude writes as this persona">
          Expert voice
        </FieldLabel>
        <TextareaWithIcon
          name="expertVoice"
          defaultValue={site?.expertVoice}
          icon={<MessageIcon size={18} />}
          placeholder="I've reviewed 500+ resumes as a hiring manager at three SaaS companies. I built ResumeGenius after seeing the same fixable mistakes over and over."
        />

        {/* Author bio HTML */}
        <FieldLabel hint="(optional) Appended to the end of every article — improves E-E-A-T signals">
          Author bio HTML
        </FieldLabel>
        <TextareaWithIcon
          name="authorBioHtml"
          defaultValue={site?.authorBioHtml}
          icon={<CodeIcon size={18} />}
          mono
          placeholder='<p><strong>Written by Alex</strong> — founder of ResumeGenius. <a href="https://resumegenius.guru">Try it free</a>.</p>'
        />

        {/* Article theme colors */}
        <div className="mt-6 p-4 bg-surface-2 border border-border rounded-xl">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="font-bold text-sm text-text">Article colors</div>
              <div className="text-muted text-xs mt-0.5">
                Customize the colors used in headings, callouts, stats, and tables.
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.colors)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-semibold hover:border-accent-border transition-colors"
              >
                <span className="flex -space-x-1">
                  {preset.colors.map((c) => (
                    <span
                      key={c}
                      className="w-3.5 h-3.5 rounded-full border border-bg"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="text-muted">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Individual color pickers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ColorField label="Primary" hint="Headings, links, steps" value={accent1} onChange={setAccent1} name="themeAccent" />
            <ColorField label="Warm" hint="TL;DR, key stats" value={accent2} onChange={setAccent2} name="themeAccent2" />
            <ColorField label="Success" hint="Takeaways, stat #3" value={accent3} onChange={setAccent3} name="themeAccent3" />
            <ColorField label="Variety" hint="Pull quote, stat #4" value={accent4} onChange={setAccent4} name="themeAccent4" />
          </div>

          {/* Live preview */}
          <div className="mt-4 p-3 bg-bg border border-border rounded-lg">
            <div className="text-muted text-xs mb-2 uppercase tracking-wide font-semibold">Preview</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white" style={{ background: accent1 }}>Heading</span>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white" style={{ background: accent2 }}>TL;DR</span>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white" style={{ background: accent3 }}>★ Takeaway</span>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white" style={{ background: accent4 }}>&ldquo; Quote</span>
            </div>
          </div>
        </div>

        {/* Advanced section */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="mt-5 flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
        >
          <ChevronDownIcon
            size={14}
            className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
          Advanced settings {advancedOpen ? "" : "(cadence, CTA, status)"}
        </button>

        {advancedOpen ? (
          <div className="mt-3 pt-4 border-t border-border space-y-3">
            <div>
              <FieldLabel hint="Injected near the end of every article — drives clicks to your product">
                Call-to-action HTML
              </FieldLabel>
              <TextareaWithIcon
                name="ctaHtml"
                defaultValue={site?.ctaHtml}
                icon={<CodeIcon size={18} />}
                mono
                placeholder='<div class="cta-box"><p><strong>Stuck on your resume?</strong> ResumeGenius rewrites your bullets in minutes. <a href="https://resumegenius.guru">Try it free →</a></p></div>'
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <FieldLabel>Max per day</FieldLabel>
                <input
                  type="number"
                  name="maxPerDay"
                  min={1}
                  max={50}
                  defaultValue={site?.maxPerDay ?? 2}
                />
              </div>
              <div>
                <FieldLabel hint="quality gate">Min word count</FieldLabel>
                <input
                  type="number"
                  name="minWordCount"
                  min={200}
                  max={5000}
                  defaultValue={site?.minWordCount ?? 1000}
                />
              </div>
              <div>
                <FieldLabel hint="Review before or auto-publish">Publish status</FieldLabel>
                <select name="publishStatus" defaultValue={site?.publishStatus ?? "draft"}>
                  <option value="draft">draft (review before going live)</option>
                  <option value="publish">publish (go live immediately)</option>
                </select>
              </div>
            </div>

            {isEdit ? (
              <label className="inline-flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  name="active"
                  value="1"
                  defaultChecked={site!.active}
                  className="!w-auto !p-0 accent-accent"
                />
                Active (can run)
              </label>
            ) : null}
          </div>
        ) : null}

        {/* Security banner — only relevant when WP credentials are involved */}
        {target === "wordpress" ? (
        <div className="mt-6 bg-bg-2/60 border border-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-dim text-accent border border-accent-border grid place-items-center shrink-0">
              <ShieldIcon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-text font-semibold text-sm leading-tight">
                We never store your password
              </div>
              <div className="text-muted text-xs mt-0.5">
                Your credentials are encrypted and used only to publish content.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-muted bg-surface border border-border rounded-md px-2.5 py-1 font-semibold">
            <LockIcon size={12} />
            Secure &amp; Encrypted
          </span>
        </div>
        ) : null}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <LinkButton
            href={isEdit ? `/sites/${site!.id}` : "/dashboard"}
            variant="secondary"
          >
            Cancel
          </LinkButton>
          <Button type="submit">
            <LinkIcon size={14} />
            {isEdit ? "Save site" : target === "native" ? "Create blog" : "Connect Site"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-baseline gap-2 mt-5 mb-2 text-sm font-semibold text-text">
      <span>{children}</span>
      {required ? <span className="text-accent text-base leading-none">•</span> : null}
      {hint ? (
        <span className="text-muted-2 font-normal text-xs">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function TextareaWithIcon({
  name,
  defaultValue,
  icon,
  placeholder,
  mono,
}: {
  name: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="relative">
      {icon ? (
        <span className="absolute left-3.5 top-3.5 text-muted">{icon}</span>
      ) : null}
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`!pl-11 !pr-3 !min-h-[5.5rem] ${mono ? "" : "!font-sans"}`}
        style={mono ? {} : { fontFamily: "inherit" }}
      />
    </div>
  );
}

function ColorField({
  label,
  hint,
  value,
  onChange,
  name,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-text mb-1">{label}</div>
      <div className="text-muted text-[0.65rem] mb-2 leading-snug">{hint}</div>
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={label}
          />
          <span
            className="block w-10 h-10 rounded-lg border-2 border-border shadow-inner cursor-pointer"
            style={{ background: value }}
          />
        </label>
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-1.5 bg-bg border border-border rounded-md text-xs font-mono text-text focus:outline-none focus:border-accent-border"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
