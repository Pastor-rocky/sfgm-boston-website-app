CREATE TABLE IF NOT EXISTS instructor_sessions (
  id SERIAL PRIMARY KEY,
  instructor_id VARCHAR NOT NULL REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_type VARCHAR(20) NOT NULL DEFAULT 'zoom',
  join_url TEXT,
  start_url TEXT,
  meeting_id VARCHAR(64),
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

ALTER TABLE instructor_messages
  ADD COLUMN IF NOT EXISTS sms_delivered BOOLEAN DEFAULT FALSE;
