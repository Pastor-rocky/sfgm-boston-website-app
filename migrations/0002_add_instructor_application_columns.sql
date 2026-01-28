-- Add new columns to instructor_applications for course interest, SFGM church, and church position
ALTER TABLE "instructor_applications" ADD COLUMN IF NOT EXISTS "course_of_interest" text;
--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD COLUMN IF NOT EXISTS "sfgm_church" varchar(255);
--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD COLUMN IF NOT EXISTS "church_position" text;
--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD COLUMN IF NOT EXISTS "availability" text;
--> statement-breakpoint
ALTER TABLE "instructor_applications" ADD COLUMN IF NOT EXISTS "additional_comments" text;
