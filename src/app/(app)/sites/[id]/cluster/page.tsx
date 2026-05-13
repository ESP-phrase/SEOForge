import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { ClusterPlanner } from "@/components/ClusterPlanner";

export const dynamic = "force-dynamic";

export default async function ClusterPlannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  return (
    <>
      <PageHeader
        title="Topic cluster planner"
        subtitle={`${site.name} · Generate 1 pillar + 10-12 cluster articles linked together`}
      />
      <ClusterPlanner siteId={siteId} siteName={site.name} />
    </>
  );
}
