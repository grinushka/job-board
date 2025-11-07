import { db } from "@/drizzle/db";
import {
  JobListingTable,
  UserFavoriteJobsTable,
} from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { getUserFavoriteJobsGlobalTag } from "@/features/favoriteJobs/db/cache/favoriteJobs";
import JobListingItemsClient from "@/features/favoriteJobs/components/JobListingItemsClient";

export function FavoriteJobListingItems() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const jobListings = await getJobListings();
  const favoriteJobs = await getUserFavoriteJobs(userId);

  if (favoriteJobs.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );  
  }

  return (
    <JobListingItemsClient
      jobListings={jobListings.filter(jobListing => favoriteJobs.includes(jobListing.id))}
      favoriteJobs={favoriteJobs}
      isFavoriteAllowed={userId !== null}
    />
  );
}

async function getJobListings() {
  "use cache";
  cacheTag(getUserFavoriteJobsGlobalTag());

  const data = await db.query.JobListingTable.findMany({
    where: and(eq(JobListingTable.status, "published")),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
  });

  data.forEach(listing => {
    cacheTag(getOrganizationIdTag(listing.organization.id));
  });

  return data;
} 

export async function getUserFavoriteJobs(userId: string | null): Promise<string[]> {
  "use cache";

  if (userId == null) return [];
  
  cacheTag(getUserFavoriteJobsGlobalTag());

  return (await db.query.UserFavoriteJobsTable.findFirst({
    where: and(
      eq(UserFavoriteJobsTable.userId, userId),
    ),
    columns: { 
      favoriteJobIds: true, 
    },
  }))?.favoriteJobIds ?? [];
}