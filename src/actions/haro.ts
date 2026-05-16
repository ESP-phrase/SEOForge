"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLLMClient, resolveModel } from "@/lib/llmClient";

/**
 * HARO / source-request response drafter. The user pastes a journalist's
 * query (text from HARO, Connectively, Featured.com, ProfNet, X DMs, etc.)
 * along with one of their sites for context. Claude returns a short, source-
 * worthy, quotable response in the site expert's voice — formatted for fast
 * copy-paste back to the reporter.
 *
 * No live API integration with HARO (their free tier disappeared in 2024);
 * the paste-based flow keeps it provider-agnostic across Connectively,
 * Qwoted, Featured, etc.
 */
export async function draftHaroResponseAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  draft?: { subject: string; body: string; rationale: string };
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const queryText = String(formData.get("queryText") ?? "").trim();
  if (!siteId || !queryText) return { ok: false, error: "missing siteId or queryText" };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, error: "site not found" };

  const client = createLLMClient();
  const SYSTEM = `You draft responses to journalist source requests (HARO, Connectively, Featured.com, etc).
Your goal: get the user quoted. Reporters reject responses that are generic, over-promotional, or longer than 200 words.

Rules:
- Write in first person from the expert's voice provided.
- Lead with the single most quotable sentence — something a reporter would put in headline quotes.
- 80-200 words total. Concise wins.
- Include 1 specific, vivid example or stat. No fluff.
- End with a one-line bio + the site URL.
- Never beg, never say "happy to chat", never offer "more info if needed" — that signals weak source.

Return your response by calling the haro_draft tool.`;

  const TOOL = {
    name: "haro_draft",
    description: "Return the drafted email subject, body, and a 1-sentence rationale.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "Email subject line. Short, specific, mentions the angle." },
        body: { type: "string", description: "80-200 word response body. Plain text, no HTML." },
        rationale: { type: "string", description: "One sentence: why this angle/quote works for the reporter." },
      },
      required: ["subject", "body", "rationale"],
    },
  };

  const userMsg = `JOURNALIST'S QUERY:
${queryText}

---

EXPERT VOICE (write as this person):
${site.expertVoice || "An experienced operator in this niche."}

SITE:
Name: ${site.name}
Niche: ${site.niche || "(not specified)"}
Audience: ${site.audience || "(not specified)"}
URL: ${site.wpUrl || site.customDomain || "(none)"}

Draft a response now via the haro_draft tool.`;

  try {
    const resp = await client.messages.create({
      model: resolveModel("claude-sonnet-4-6"),
      max_tokens: 1200,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "haro_draft" },
      messages: [{ role: "user", content: userMsg }],
    });
    const tu = resp.content.find((b) => b.type === "tool_use");
    if (!tu || tu.type !== "tool_use") return { ok: false, error: "Claude returned no draft" };
    const input = tu.input as { subject: string; body: string; rationale: string };
    return { ok: true, draft: input };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "claude call failed" };
  }
}
