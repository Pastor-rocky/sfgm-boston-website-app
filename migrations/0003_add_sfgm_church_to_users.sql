-- Add SFGM church field to users table for instructor-student segregation
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sfgm_church" varchar(255);
--> statement-breakpoint
-- Add index for faster filtering by church
CREATE INDEX IF NOT EXISTS "idx_users_sfgm_church" ON "users" ("sfgm_church");
