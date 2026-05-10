import { createSiteAction } from "@/actions/sites";
import { SiteForm } from "@/components/SiteForm";
import { PageHeader } from "@/components/PageHeader";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <PageHeader
        title="Add a site"
        subtitle="Connect a WordPress site so SEOForge can publish to it."
      />
      <SiteForm action={createSiteAction} error={error} />
    </>
  );
}
