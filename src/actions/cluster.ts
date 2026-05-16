"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLLMClient, resolveModel } from "@/lib/llmClient";

export type ClusterArticle = {
  title: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  role: "pillar" | "cluster";
  links_to: number[]; // indexes of other articles in this list
};

export type ClusterPlan = {
  pillar_title: string;
  pillar_keyword: string;
  articles: ClusterArticle[];
};

/**
 * Generate a topic cluster: 1 pillar article + 10-12 supporting cluster
 * articles, all linked together. Topic clusters rank 2-3x faster than
 * isolated articles because Google sees the topic coverage signal.
 */
export async function generateClusterAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  plan?: ClusterPlan;
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const pillarTopic = String(formData.get("pillarTopic") ?? "").trim();
  if (!siteId || !pillarTopic) return { ok: false, error: "missing siteId or pillarTopic" };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, error: "site not found" };

  const client = createLLMClient();

  const SYSTEM = `You are an SEO content strategist who designs topic clusters that rank.

A topic cluster is:
  1 "pillar" article — broad, comprehensive, targets the high-volume head term
  10-12 "cluster" articles — narrow, specific long-tail queries that all link UP to the pillar
  Cluster articles cross-link to 2-3 sibling clusters where relevant

Rules:
- Pillar keyword: the broad topic itself.
- Cluster keywords: 3-7 words each, long-tail, low-competition. Mix of intents.
- "how to" / "what is" / "best X for Y" / "X vs Y" / "X cost" / "X mistakes" / case studies
- Every cluster article links_to the pillar (index 0).
- Each cluster article ALSO links_to 1-3 other cluster articles by topical relevance.
- No duplicate or near-duplicate keywords across articles.
- Mix intents: 60% informational, 25% commercial, 15% transactional.

Return your plan by calling the cluster_plan tool.`;

  const TOOL = {
    name: "cluster_plan",
    description: "Return the full cluster plan.",
    input_schema: {
      type: "object" as const,
      properties: {
        pillar_title: { type: "string", description: "Title of the pillar article" },
        pillar_keyword: { type: "string", description: "Target keyword of the pillar" },
        articles: {
          type: "array",
          minItems: 11,
          maxItems: 13,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              keyword: { type: "string" },
              intent: {
                type: "string",
                enum: ["informational", "commercial", "transactional", "navigational"],
              },
              role: { type: "string", enum: ["pillar", "cluster"] },
              links_to: {
                type: "array",
                items: { type: "integer" },
                description: "Indexes of other articles in the list this one should link to",
              },
            },
            required: ["title", "keyword", "intent", "role", "links_to"],
          },
        },
      },
      required: ["pillar_title", "pillar_keyword", "articles"],
    },
  };

  const userMsg = `Design a topic cluster for:

PILLAR TOPIC: ${pillarTopic}

SITE CONTEXT:
Name: ${site.name}
Niche: ${site.niche || "(not specified)"}
Audience: ${site.audience || "(not specified)"}

Return 1 pillar + 10-12 cluster articles. Call the cluster_plan tool.`;

  const tag = `[cluster:${site.slug}]`;
  const t0 = Date.now();
  console.log(`${tag} ▶ planning cluster · pillar="${pillarTopic}"`);

  try {
    const resp = await client.messages.create({
      model: resolveModel("claude-sonnet-4-6"),
      max_tokens: 3500,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "cluster_plan" },
      messages: [{ role: "user", content: userMsg }],
    });
    const tu = resp.content.find((b) => b.type === "tool_use");
    if (!tu || tu.type !== "tool_use") {
      console.warn(`${tag} ⚠ Claude returned no tool_use block`);
      return { ok: false, error: "Claude returned no plan" };
    }
    const plan = tu.input as ClusterPlan;
    const dur = ((Date.now() - t0) / 1000).toFixed(1);
    const cost =
      ((resp.usage?.input_tokens ?? 0) / 1_000_000) * 3 +
      ((resp.usage?.output_tokens ?? 0) / 1_000_000) * 15;
    console.log(
      `${tag} ✓ plan ready · ${plan.articles.length} articles · ${dur}s · ~$${cost.toFixed(3)}`,
    );
    console.log(`${tag}   pillar: "${plan.pillar_title}"`);
    plan.articles.forEach((a, i) => {
      console.log(`${tag}   #${i + 1} [${a.intent}] ${a.title}`);
    });
    return { ok: true, plan };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "claude call failed";
    console.error(`${tag} ✗ ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Persist a cluster plan as queued keywords on the site. Idempotent on the
 * (siteId, keyword) unique constraint — re-running skips dupes.
 */
export async function saveClusterAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  added?: number;
  skipped?: number;
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const planJson = String(formData.get("plan") ?? "");
  if (!siteId || !planJson) return { ok: false, error: "missing siteId or plan" };

  let plan: ClusterPlan;
  try {
    plan = JSON.parse(planJson) as ClusterPlan;
  } catch {
    return { ok: false, error: "invalid plan json" };
  }

  const tag = `[cluster-save:site=${siteId}]`;
  console.log(`${tag} ▶ saving ${plan.articles.length} cluster keywords`);

  let added = 0;
  let skipped = 0;
  for (const a of plan.articles) {
    try {
      await prisma.keyword.create({
        data: {
          siteId,
          keyword: a.keyword,
          intent: a.intent,
          status: "queued",
        },
      });
      added += 1;
      console.log(`${tag}   ✓ queued: ${a.keyword}`);
    } catch {
      skipped += 1; // unique constraint
      console.log(`${tag}   ⊘ dup:    ${a.keyword}`);
    }
  }
  console.log(`${tag} ✓ done · added=${added} skipped=${skipped}`);
  revalidatePath(`/sites/${siteId}`);
  return { ok: true, added, skipped };
}
