import { db } from "@/drizzle/db";
import {
  ExperienceLevel,
  JobListingApplicationTable,
  JobListingTable,
  JobListingType,
  LocationRequirement,
} from "@/drizzle/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { getJobListingApplicationJobListingTag } from "@/features/jobListingsApplications/db/cache/jobListingsApplications";
import { and, count, desc, eq, ilike, inArray, or, SQL } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  getJobListingGlobalTag,
  getJobListingIdTag,
  getJobListingOrganizationTag,
  revalidateJobListingCache,
} from "./cache/jobListings";

export type JobListingSearchFilters = {
  title?: string
  city?: string
  state?: string
  experience?: ExperienceLevel
  locationRequirement?: LocationRequirement
  type?: JobListingType
  jobIds?: string[]
}

export async function getOrganizationJobListing(id: string, orgId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}

export async function getJobListingById(id: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.id, id),
  });
}

export async function getPublishedJobListing(id: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
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
  });

  if (listing != null) {
    cacheTag(getOrganizationIdTag(listing.organization.id));
  }

  return listing;
}

export async function getPublishedJobListings(
  searchParams: JobListingSearchFilters,
  jobListingId?: string
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

export async function getPublishedJobListingsByIds(jobListingIds: string[]) {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  const data = await db.query.JobListingTable.findMany({
    where: and(
      eq(JobListingTable.status, "published"),
      inArray(JobListingTable.id, jobListingIds)
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

export async function getPublicJobListings() {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
  });
}

export async function getMostRecentOrganizationJobListing(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: { id: true },
  });
}

export async function getOrganizationJobListingsForSidebar(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId)
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach(jobListing => {
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  });

  return data;
}

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert
) {
  const [newListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(newListing);

  return newListing;
}

export async function updateJobListing(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(updatedListing);

  return updatedListing;
}

export async function deleteJobListing(id: string) {
  const [deletedJobListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(deletedJobListing);

  return deletedJobListing;
}
