import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
} from "@/drizzle/schema";
import { getUserFavoriteJobs } from "@/features/favoriteJobs/db/favoriteJobs";
import JobListingItemsClient from "@/features/favoriteJobs/components/JobListingItemsClient";
import { getPublishedJobListings } from "@/features/jobListings/db/jobListings";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { Suspense } from "react";
import { z } from "zod";

type Props = {
  searchParams: Promise<Record<string, string | string[]>>
  params?: Promise<{ jobListingId: string }>
}

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform(v => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([]),
});

export function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined;
  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  const { userId } = await getCurrentUser();
  const jobListings = await getPublishedJobListings(search, jobListingId);
  const favoriteJobs = await getUserFavoriteJobs(userId);

  if (jobListings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  return (
    <JobListingItemsClient
      jobListings={jobListings}
      favoriteJobs={favoriteJobs}
      isFavoriteAllowed={userId !== null}
      search={search}
    />
  );
}
