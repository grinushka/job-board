import { db } from "@/drizzle/db";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  getOrganizationUserSettingsIdTag,
  revalidateOrganizationUserSettingsCache,
} from "./cache/organizationUserSettings";

export async function getOrganizationUserSettings({
  organizationId,
  userId,
}: {
  userId: string
  organizationId: string
}) {
  "use cache";
  cacheTag(getOrganizationUserSettingsIdTag({ userId, organizationId }));

  return db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, organizationId)
    ),
    columns: {
      newApplicationEmailNotifications: true,
      minimumRating: true,
    },
  });
}

export async function insertOrganizationUserSettings(
  settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateOrganizationUserSettingsCache(settings);
}

export async function updateOrganizationUserSettings(
  {
    userId,
    organizationId,
  }: {
    userId: string
    organizationId: string
  },
  settings: Partial<
    Omit<
      typeof OrganizationUserSettingsTable.$inferInsert,
      "userId" | "organizationId"
    >
  >
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values({ ...settings, userId, organizationId })
    .onConflictDoUpdate({
      target: [
        OrganizationUserSettingsTable.userId,
        OrganizationUserSettingsTable.organizationId,
      ],
      set: settings,
    });

  revalidateOrganizationUserSettingsCache({ userId, organizationId });
}

export async function deleteOrganizationUserSettings({
  userId,
  organizationId,
}: {
  userId: string
  organizationId: string
}) {
  await db
    .delete(OrganizationUserSettingsTable)
    .where(
      and(
        eq(OrganizationUserSettingsTable.userId, userId),
        eq(OrganizationUserSettingsTable.organizationId, organizationId)
      )
    );

  revalidateOrganizationUserSettingsCache({ userId, organizationId });
}
