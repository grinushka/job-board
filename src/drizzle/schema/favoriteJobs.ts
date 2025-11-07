import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { relations, sql } from "drizzle-orm";

export const UserFavoriteJobsTable = pgTable("user_favorite_jobs", {
  userId: varchar("user_id")
    .primaryKey()
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  favoriteJobIds: text("favorite_job_ids")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export const userFavoriteJobsRelations = relations(UserFavoriteJobsTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserFavoriteJobsTable.userId],
    references: [UserTable.id],
  }),
}));