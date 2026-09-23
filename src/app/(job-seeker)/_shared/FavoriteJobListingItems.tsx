import { getUserFavoriteJobs } from "@/features/favoriteJobs/db/favoriteJobs";
import JobListingItemsClient from "@/features/favoriteJobs/components/JobListingItemsClient";
import { getPublishedJobListingsByIds } from "@/features/jobListings/db/jobListings";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { Suspense } from "react";

export function FavoriteJobListingItems() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const favoriteJobs = await getUserFavoriteJobs(userId);

  if (favoriteJobs.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  const jobListings = await getPublishedJobListingsByIds(favoriteJobs);

  return (
    <JobListingItemsClient
      jobListings={jobListings}
      favoriteJobs={favoriteJobs}
      isFavoriteAllowed={userId !== null}
    />
  );
}
