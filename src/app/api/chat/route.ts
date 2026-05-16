/**
 * Chat endpoint for the floating widget. Streams responses from Claude via
 * OpenRouter using server-sent events so the UI can render tokens as they
 * arrive instead of waiting for the full reply.
 *
 * Model: Haiku 4.5 — fast (~1s first token), cheap (~$0.005/conversation
 * at typical lengths), and smart enough for product-Q&A.
 *
 * No auth — chat is open to every visitor on the marketing site. We rate-
 * limit by IP via Vercel's edge automatically, plus a soft cap below.
 */
import { NextRequest } from "next/server";
import { createLLMClient, resolveModel } from "@/lib/llmClient";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chatSystemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TURNS = 20;   // anti-abuse — drop conversation after 20 user turns
const MAX_TOKENS = 400; // ~300 words per reply, plenty for support

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { messages?: Message[] };
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m): m is Message =>
      m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
  );

  if (messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }
  if (messages.filter((m) => m.role === "user").length > MAX_TURNS) {
    return new Response("conversation limit reached — refresh to start over", { status: 429 });
  }

  const client = createLLMClient();
  const stream = await client.messages.stream({
    model: resolveModel(MODEL),
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: CHAT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });

  // Bridge Anthropic SDK stream → Web ReadableStream of SSE events
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
