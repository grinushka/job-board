import { getGlobalTag, getUserFavoriteJobsTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserFavoriteJobsGlobalTag() {
  return getGlobalTag("userFavoriteJobs");
}

export function getUserFavoriteJobsUserTag(userId: string) {
  return getUserFavoriteJobsTag("userFavoriteJobs", userId);
}

export function revalidateUserFavoriteJobsCache({
  id,
}: {
  id: string
}) {
  revalidateTag(getUserFavoriteJobsGlobalTag());
  revalidateTag(getUserFavoriteJobsUserTag(id));
}
