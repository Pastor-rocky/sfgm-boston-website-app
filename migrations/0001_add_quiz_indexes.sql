-- Migration: Add indexes for quiz_attempts and content_progress tables
-- Purpose: Improve query performance for quiz data retrieval and content progress tracking
-- Created: Phase 4 - Quiz Data Hardening

-- Indexes for quiz_attempts table
-- Index on student_id for fast lookups by student
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_student_id" ON "quiz_attempts" ("student_id");
--> statement-breakpoint

-- Index on quiz_id for fast lookups by quiz
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_quiz_id" ON "quiz_attempts" ("quiz_id");
--> statement-breakpoint

-- Composite index on student_id and quiz_id for common query pattern
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_student_quiz" ON "quiz_attempts" ("student_id", "quiz_id");
--> statement-breakpoint

-- Index on submitted_at for date range queries and exports
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_submitted_at" ON "quiz_attempts" ("submitted_at");
--> statement-breakpoint

-- Indexes for content_progress table
-- Index on student_id for fast lookups by student
CREATE INDEX IF NOT EXISTS "idx_content_progress_student_id" ON "content_progress" ("student_id");
--> statement-breakpoint

-- Index on course_id for fast lookups by course
CREATE INDEX IF NOT EXISTS "idx_content_progress_course_id" ON "content_progress" ("course_id");
--> statement-breakpoint

-- Composite index on student_id and course_id for common query pattern
CREATE INDEX IF NOT EXISTS "idx_content_progress_student_course" ON "content_progress" ("student_id", "course_id");
--> statement-breakpoint

-- Composite index on student_id, course_id, and content_type for content-specific queries
CREATE INDEX IF NOT EXISTS "idx_content_progress_student_course_type" ON "content_progress" ("student_id", "course_id", "content_type");
--> statement-breakpoint

-- Index on completed_at for filtering completed content
CREATE INDEX IF NOT EXISTS "idx_content_progress_completed_at" ON "content_progress" ("completed_at");


