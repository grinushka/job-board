import { db } from "@/drizzle/db";
import { UserFavoriteJobsTable } from "@/drizzle/schema";
import { revalidateUserFavoriteJobsCache } from "./cache/favoriteJobs";

export async function updateUserFavoriteJobsDb(
  userId: string,
  favoriteJobIds: string[]
) {
  const [updatedUserFavoriteJobs] = await db
    .insert(UserFavoriteJobsTable)
    .values({ userId, favoriteJobIds })
    .onConflictDoUpdate({
      target: UserFavoriteJobsTable.userId,
      set: { favoriteJobIds },
    })
    .returning({
      userId: UserFavoriteJobsTable.userId,
      favoriteJobIds: UserFavoriteJobsTable.favoriteJobIds,
    });

  revalidateUserFavoriteJobsCache({ id: updatedUserFavoriteJobs.userId });

  return updatedUserFavoriteJobs;
}