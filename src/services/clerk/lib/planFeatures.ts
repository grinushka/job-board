import { auth } from "@clerk/nextjs/server";

type PlanFeature =
  | "post_one_job_listing"
  | "post_three_job_listings"
  | "post_fifteen_job_listings"
  | "unlimited_featured_jobs"
  | "one_featured_job_listing"

export async function hasPlanFeature(feature: PlanFeature) {
  const { has } = await auth();
  return has({ feature });
}
