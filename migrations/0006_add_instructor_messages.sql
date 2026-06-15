-- Instructor portal messaging
CREATE TABLE IF NOT EXISTS "instructor_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "instructor_id" varchar NOT NULL REFERENCES "users"("id"),
  "student_id" varchar NOT NULL REFERENCES "users"("id"),
  "channel" varchar(20) NOT NULL,
  "subject" varchar(255),
  "body" text NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL,
  "email_delivered" boolean DEFAULT false
);
