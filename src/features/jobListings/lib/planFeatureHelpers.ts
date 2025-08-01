import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { getJobListingOrganizationTag } from "../db/cache/jobListings";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { and, count, eq } from "drizzle-orm";
import { hasPlanFeature } from "@/services/clerk/lib/planFeatures";

export async function hasReachedMaxPublishedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_one_job_listing").then(has => has && count < 1),
    hasPlanFeature("post_three_job_listings").then(has => has && count < 3),
    hasPlanFeature("post_fifteen_job_listings").then(has => has && count < 15),
  ]);

  return !canPost.some(Boolean);
}

export async function hasReachedMaxFeaturedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return true;

  const count = await getFeaturedJobListingsCount(orgId);

  const canFeature = await Promise.all([
    hasPlanFeature("one_featured_job_listing").then(has => has && count < 1),
    hasPlanFeature("unlimited_featured_jobs"),
  ]);

  return !canFeature.some(Boolean);
}

async function getPublishedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.status, "published")
      )
    );
  return res?.count ?? 0;
}

async function getFeaturedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.isFeatured, true)
      )
    );
  return res?.count ?? 0;
}
