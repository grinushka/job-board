import { db } from "@/drizzle/db";
import { JobListingApplicationTable } from "@/drizzle/schema";
import { getUserIdTag } from "@/features/users/db/cache/user";
import { getUserResumeIdTag } from "@/features/users/db/cache/userResumes";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  getJobListingApplicationIdTag,
  getJobListingApplicationJobListingTag,
  revalidateJobListingApplicationCache,
} from "./cache/jobListingsApplications";

export async function getJobListingApplication({
  jobListingId,
  userId,
}: {
  jobListingId: string
  userId: string
}) {
  "use cache";
  cacheTag(getJobListingApplicationIdTag({ jobListingId, userId }));

  return db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    ),
  });
}

export async function getJobListingApplications(jobListingId: string) {
  "use cache";
  cacheTag(getJobListingApplicationJobListingTag(jobListingId));

  const data = await db.query.JobListingApplicationTable.findMany({
    where: eq(JobListingApplicationTable.jobListingId, jobListingId),
    columns: {
      coverLetter: true,
      createdAt: true,
      stage: true,
      rating: true,
      jobListingId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
            },
          },
        },
      },
    },
  });

  data.forEach(({ user }) => {
    cacheTag(getUserIdTag(user.id));
    cacheTag(getUserResumeIdTag(user.id));
  });

  return data;
}

export async function insertJobListingApplication(
  application: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(application);

  revalidateJobListingApplicationCache(application);
}

export async function updateJobListingApplication(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string
    userId: string
  },
  data: Partial<typeof JobListingApplicationTable.$inferInsert>
) {
  await db
    .update(JobListingApplicationTable)
    .set(data)
    .where(
      and(
        eq(JobListingApplicationTable.jobListingId, jobListingId),
        eq(JobListingApplicationTable.userId, userId)
      )
    );

  revalidateJobListingApplicationCache({ jobListingId, userId });
}
