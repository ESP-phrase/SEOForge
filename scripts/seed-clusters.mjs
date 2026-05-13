#!/usr/bin/env node
/**
 * One-off: generate topic clusters for SEOForge Blog and ResumeGenius and
 * persist them as queued keywords. Re-running is safe (duplicates skipped).
 */
import fs from "node:fs";
import path from "node:path";
// Manual .env load — dotenv/config behaves oddly with Windows + node 24.
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TARGETS = [
  {
    siteSlug: "seoforge",
    pillar: "AI-powered SEO automation for niche sites",
  },
  {
    siteSlug: "resumegenius-blog",
    pillar: "complete resume writing guide 2026",
  },
];

const TOOL = {
  name: "cluster_plan",
  description: "Return the full cluster plan.",
  input_schema: {
    type: "object",
    properties: {
      pillar_title: { type: "string" },
      pillar_keyword: { type: "string" },
      articles: {
        type: "array",
        minItems: 11,
        maxItems: 13,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            keyword: { type: "string" },
            intent: { type: "string", enum: ["informational", "commercial", "transactional", "navigational"] },
            role: { type: "string", enum: ["pillar", "cluster"] },
            links_to: { type: "array", items: { type: "integer" } },
          },
          required: ["title", "keyword", "intent", "role", "links_to"],
        },
      },
    },
    required: ["pillar_title", "pillar_keyword", "articles"],
  },
};

const SYSTEM = `You are an SEO content strategist who designs topic clusters that rank.
Return 1 pillar + 10-12 cluster articles, all internally linked. Mix intents
60% informational, 25% commercial, 15% transactional. Long-tail keywords.
Return via the cluster_plan tool.`;

async function planCluster(site, pillar) {
  const userMsg = `Design a topic cluster.

PILLAR TOPIC: ${pillar}

SITE: ${site.name}
NICHE: ${site.niche || "(not specified)"}
AUDIENCE: ${site.audience || "(not specified)"}`;

  const resp = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 3500,
    system: SYSTEM,
    tools: [TOOL],
    tool_choice: { type: "tool", name: "cluster_plan" },
    messages: [{ role: "user", content: userMsg }],
  });
  const tu = resp.content.find((b) => b.type === "tool_use");
  if (!tu) throw new Error("no tool_use in response");
  return tu.input;
}

async function main() {
  for (const t of TARGETS) {
    const site = await prisma.site.findUnique({ where: { slug: t.siteSlug } });
    if (!site) {
      console.log(`✗ site "${t.siteSlug}" not found`);
      continue;
    }
    console.log(`\n▶ ${site.name}: planning cluster for "${t.pillar}"…`);
    const plan = await planCluster(site, t.pillar);
    console.log(`  Pillar: ${plan.pillar_title} (${plan.articles.length} articles)`);

    let added = 0;
    let skipped = 0;
    for (const a of plan.articles) {
      try {
        await prisma.keyword.create({
          data: {
            siteId: site.id,
            keyword: a.keyword,
            intent: a.intent,
            status: "queued",
          },
        });
        added += 1;
      } catch {
        skipped += 1;
      }
    }
    console.log(`  ✓ queued ${added}, skipped ${skipped} dupes`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("✗", e?.message ?? e);
  await prisma.$disconnect();
  process.exit(1);
});
