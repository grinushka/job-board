import { db } from "@/drizzle/db";
import { UserFavoriteJobsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  getUserFavoriteJobsUserTag,
  revalidateUserFavoriteJobsCache,
} from "./cache/favoriteJobs";

export async function getUserFavoriteJobs(
  userId: string | null
): Promise<string[]> {
  "use cache";

  if (userId == null) return [];

  cacheTag(getUserFavoriteJobsUserTag(userId));

  return (
    (
      await db.query.UserFavoriteJobsTable.findFirst({
        where: eq(UserFavoriteJobsTable.userId, userId),
        columns: {
          favoriteJobIds: true,
        },
      })
    )?.favoriteJobIds ?? []
  );
}

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