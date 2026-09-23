import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  getUserResumeIdTag,
  revalidateUserResumeCache,
} from "./cache/userResumes";

export async function getUserResume(userId: string) {
  "use cache";
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}

export async function upsertUserResume(
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, "userId">
) {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: data,
    });

  revalidateUserResumeCache(userId);
}

export async function updateUserResume(
  userId: string,
  data: Partial<Omit<typeof UserResumeTable.$inferInsert, "userId">>
) {
  await db
    .update(UserResumeTable)
    .set(data)
    .where(eq(UserResumeTable.userId, userId));

  revalidateUserResumeCache(userId);
}
