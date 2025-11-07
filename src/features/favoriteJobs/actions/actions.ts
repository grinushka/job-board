"use server";

import z from "zod";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { updateUserFavoriteJobsDb } from "../db/favoriteJobs";
import { toggleFavoriteJobsSchema } from "./schemas";

export async function updateUserFavoriteJobs(
  unsafeData: z.infer<typeof toggleFavoriteJobsSchema>
) {
  const { userId } = await getCurrentUser();

  const { success, data } = toggleFavoriteJobsSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updating your favorite jobs",
    };
  }

  if (userId == null) {
    return {
      error: true,
      message: "You must be signed in to update your favorite jobs",
    };
  }

  await updateUserFavoriteJobsDb(userId, data.jobListingIds);

  return {
    error: false,
    message: "Successfully updated your favorite jobs",
  };
}