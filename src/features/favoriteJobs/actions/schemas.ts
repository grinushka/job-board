import { z } from "zod";

export const toggleFavoriteJobsSchema = z.object({
  jobListingIds: z.array(z.string()),
});

export type ToggleFavoriteJobsInput = z.infer<typeof toggleFavoriteJobsSchema>;
