"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Routes where we DON'T show the widget — the in-app dashboard pages.
// Authed users in the app shouldn't see a marketing-style chat bubble.
const HIDE_ON_PREFIXES = [
  "/dashboard",
  "/sites",
  "/billing",
  "/queue",
  "/referrals",
  "/settings",
  "/cron",
  "/login",
  "/signup",
  "/test-pixels",
];

/**
 * Floating chat widget. Bottom-right button → expands to a chat panel that
 * streams Claude responses via /api/chat. Persists conversation in
 * sessionStorage so it survives page navigations within the same tab.
 *
 * Hidden on app routes (under /app/*, /dashboard, /billing, /sites, etc.)
 * via the parent layout — visitor-facing only.
 */
type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi — I'm SEOForge's AI. Ask me anything about pricing, features, or whether this is right for your site.",
};

const STORAGE_KEY = "sf_chat_v1";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hidden = HIDE_ON_PREFIXES.some((p) => pathname?.startsWith(p));

  // Restore conversation from sessionStorage.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist conversation as it updates.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore — quota or private mode */
    }
  }, [messages]);

  // Auto-scroll to bottom on new message.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, streaming]);

  // Focus input when panel opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(0, -1).filter((m) => m.role !== "assistant" || m.content.length > 0),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: errText || "Something went wrong." };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              assistantText += `\n\n(Error: ${parsed.error})`;
            } else if (parsed.text) {
              assistantText += parsed.text;
            }
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: assistantText };
              return copy;
            });
          } catch {
            /* malformed chunk — skip */
          }
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "connection failed";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `Something went wrong: ${errMsg}` };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function clear() {
    setMessages([GREETING]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (hidden) return null;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-accent text-black shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6L18 18M6 18L18 6" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a7.9 7.9 0 0 1-4.1-1.1l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1 1 12 20z" />
            <circle cx="8" cy="12" r="1.3" />
            <circle cx="12" cy="12" r="1.3" />
            <circle cx="16" cy="12" r="1.3" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open ? (
        <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))] bg-card-grad border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-extrabold text-sm shrink-0">
              SF
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-text leading-tight">SEOForge AI</div>
              <div className="text-[0.65rem] text-muted leading-tight">Powered by Claude · usually replies in seconds</div>
            </div>
            <button
              type="button"
              onClick={clear}
              className="text-[0.65rem] text-muted hover:text-text px-2 py-1 rounded hover:bg-surface-2 transition-colors"
              title="Start a new chat"
            >
              New chat
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-accent text-black rounded-br-md"
                      : "bg-surface-2 text-text rounded-bl-md border border-border"
                  }`}
                >
                  {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-3 bg-bg/40">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything…"
                className="flex-1 resize-none bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted-2 focus:outline-none focus:border-accent transition-colors max-h-32"
                disabled={streaming}
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || streaming}
                className="bg-accent text-black rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors shrink-0"
              >
                {streaming ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" className="origin-center" style={{ animation: "spin 0.8s linear infinite" }} />
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </div>
            <div className="text-[0.6rem] text-muted-2 mt-2 px-1">
              AI may make mistakes. For billing, drop your email and a human will reply.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
