-- Add chosen_instructor_id to enrollments (student selects instructor per course)
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "chosen_instructor_id" varchar REFERENCES "users"("id");
