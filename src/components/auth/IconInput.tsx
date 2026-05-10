"use client";

import { useState } from "react";

export function IconInput({
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  autoComplete,
  minLength,
  leftIcon,
  password,
}: {
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  leftIcon?: React.ReactNode;
  password?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const effectiveType = password ? (revealed ? "text" : "password") : type;

  return (
    <div className="relative">
      {leftIcon ? (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          {leftIcon}
        </span>
      ) : null}
      <input
        name={name}
        type={effectiveType}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="!pl-11 !pr-10"
      />
      {password ? (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          {revealed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M2 12s3.5-7 10-7c2.4 0 4.5.9 6.2 2.1M22 12s-3.5 7-10 7c-2.4 0-4.5-.9-6.2-2.1" strokeLinecap="round" />
              <path d="m3 3 18 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
