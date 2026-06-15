-- Track when students have read instructor messages
ALTER TABLE "instructor_messages" ADD COLUMN IF NOT EXISTS "read_at" timestamp;
