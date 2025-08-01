import { auth } from "@clerk/nextjs/server";

type UserPermission = 
| "job_listing_applications:applicant_change_rating"
| "job_listing_applications:applicant_change_stage"
| "job_listings:job_listings_change_status"
| "job_listings:job_listings_create"
| "job_listings:job_listings_delete"
| "job_listings:job_listings_update"

export async function hasOrgUserPermission(permission: UserPermission) {
  const { has } = await auth();
  return has({ permission });
}
