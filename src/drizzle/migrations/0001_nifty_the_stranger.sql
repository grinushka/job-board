CREATE TABLE "user_favorite_jobs" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"favorite_job_ids" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_favorite_jobs" ADD CONSTRAINT "user_favorite_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;