"use client";

import { JobListingTable, OrganizationTable } from "@/drizzle/schema";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { cn } from "@/lib/utils";
import { AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges";
import { getNameInitials } from "@/lib/getNameInitials";
import { FavoriteButton } from "./FavoriteButton";
import { updateUserFavoriteJobs } from "@/features/favoriteJobs/actions/actions";
import { toast } from "sonner";

export default function JobListingItemsClient({
  jobListings,
  favoriteJobs,
  isFavoriteAllowed,
  search,
}: {
  jobListings: Array<typeof JobListingTable.$inferSelect & {
    organization: Pick<typeof OrganizationTable.$inferSelect, "id" | "name" | "imageUrl">
  }>
  favoriteJobs: string[]
  isFavoriteAllowed: boolean
  search?: Record<string, string | string[]> | undefined
}) {

  const handleUpdateFavoriteJobs = async (jobListingId: string) => {
    const actionType = favoriteJobs.includes(jobListingId) ? "remove" : "add";
    const newFavorites = favoriteJobs.includes(jobListingId)
      ? favoriteJobs.filter(id => id !== jobListingId)
      : [...favoriteJobs, jobListingId];
      
    const result = await updateUserFavoriteJobs({ jobListingIds: newFavorites });
      
    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (actionType === "add") {
      toast.success("Successfully added to favorites");
    } else {
      toast.success("Successfully removed from favorites");
    }
  };

  if (jobListings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {jobListings.map(({ organization, ...jobListing }) => (
        <Link
          className="block"
          key={jobListing.id}
          href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(
            search ?? {}
          )}`}
        >
          <JobListingListItem
            isFavoriteAllowed={isFavoriteAllowed}
            jobListing={jobListing}
            organization={organization}
            isFavorite={favoriteJobs.includes(jobListing.id)}
            onChangeFavorites={handleUpdateFavoriteJobs}
          />
        </Link>
      ))}
    </div>
  );

}


function JobListingListItem({
  isFavoriteAllowed,
  jobListing,
  organization,
  isFavorite,
  onChangeFavorites,
}: {
  jobListing: Pick<
  typeof JobListingTable.$inferSelect,
    | "title"
    | "stateAbbreviation"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
    | "id"
  >
  isFavoriteAllowed: boolean
  organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
  isFavorite: boolean
  onChangeFavorites: (jobListingId: string) => void
}) {
  const nameInitials = getNameInitials(organization.name, 4);

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20"
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              {jobListing.title}
            </CardTitle>
            <CardDescription className="text-base">
              {organization.name}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <DaysSincePosting postedAt={jobListing.postedAt} />
              </div>
            )}
          </div>
          <div className="text-sm font-medium flex items-center gap-4 text-primary ml-auto @max-md:hidden">
            {jobListing.postedAt != null && (
              <DaysSincePosting postedAt={jobListing.postedAt} />
            )}
            {isFavoriteAllowed && (  
              <FavoriteButton
                jobListingId={jobListing.id}
                isFavorite={isFavorite}
                onChangeFavorites={onChangeFavorites}
              />
            )}
          </div>

        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
}

function DaysSincePosting({ postedAt }: { postedAt: Date }) {
  const daysSincePosted = differenceInDays(new Date(), postedAt);

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>;
  }

  if (daysSincePosted === 1) {
    return "1d ago";
  }

  return `${daysSincePosted}d ago`;
}