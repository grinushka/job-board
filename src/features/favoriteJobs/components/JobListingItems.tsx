import { db } from "@/drizzle/db";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  UserFavoriteJobsTable,
} from "@/drizzle/schema";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { Suspense } from "react";
import { z } from "zod";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingGlobalTag } from "@/features/jobListings/db/cache/jobListings";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import JobListingItemsClient from "./JobListingItemsClient";
import { getUserFavoriteJobsTag } from "@/lib/dataCache";

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
  const jobListings = await getJobListings(search, jobListingId);
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

async function getJobListings(
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined
) {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  const whereConditions: (SQL | undefined)[] = [];
  if (searchParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${searchParams.title}%`)
    );
  }

  if (searchParams.locationRequirement) {
    whereConditions.push(
      eq(JobListingTable.locationRequirement, searchParams.locationRequirement)
    );
  }

  if (searchParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`));
  }

  if (searchParams.state) {
    whereConditions.push(
      eq(JobListingTable.stateAbbreviation, searchParams.state)
    );
  }

  if (searchParams.experience) {
    whereConditions.push(
      eq(JobListingTable.experienceLevel, searchParams.experience)
    );
  }

  if (searchParams.type) {
    whereConditions.push(eq(JobListingTable.type, searchParams.type));
  }

  if (searchParams.jobIds) {
    whereConditions.push(
      or(...searchParams.jobIds.map(jobId => eq(JobListingTable.id, jobId)))
    );
  }

  const data = await db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
          eq(JobListingTable.status, "published"),
          eq(JobListingTable.id, jobListingId)
        )
        : undefined,
      and(eq(JobListingTable.status, "published"), ...whereConditions)
    ),
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
  
  cacheTag(getUserFavoriteJobsTag("userFavoriteJobs", userId));

  return (await db.query.UserFavoriteJobsTable.findFirst({
    where: and(
      eq(UserFavoriteJobsTable.userId, userId),
    ),
    columns: { 
      favoriteJobIds: true, 
    },
  }))?.favoriteJobIds ?? [];
}