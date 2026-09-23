import { Card, CardContent } from "@/components/ui/card";
import { JobListingForm } from "@/features/jobListings/components/JobListingForm";
import { getOrganizationJobListing } from "@/features/jobListings/db/jobListings";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default function EditJobListingPage(props: Props) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedPage({ params }: Props) {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) {
    return notFound();
  };

  const jobListing = await getOrganizationJobListing(jobListingId, orgId);

  if (jobListing == null) {
    return notFound();
  };

  return <JobListingForm jobListing={jobListing} />;
}
