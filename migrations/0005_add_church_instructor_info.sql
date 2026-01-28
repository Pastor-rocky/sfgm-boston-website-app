-- Church default instructor contact info (admin-editable)
CREATE TABLE IF NOT EXISTS "church_instructor_info" (
  "church" varchar(255) PRIMARY KEY NOT NULL,
  "instructor_name" varchar(255),
  "email" varchar(255),
  "phone" varchar(50),
  "updated_at" timestamp DEFAULT now()
);
