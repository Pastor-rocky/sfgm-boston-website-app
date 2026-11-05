-- Roma Academy family tables (Neon). Safe to run once.
CREATE TABLE IF NOT EXISTS roma_families (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  parent_first_name VARCHAR NOT NULL,
  parent_last_name VARCHAR NOT NULL,
  parent2_name VARCHAR,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  address_line1 VARCHAR,
  city VARCHAR,
  state VARCHAR DEFAULT 'MA',
  zip VARCHAR,
  school_district VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roma_children (
  id SERIAL PRIMARY KEY,
  family_id INTEGER NOT NULL REFERENCES roma_families(id) ON DELETE CASCADE,
  full_name VARCHAR NOT NULL,
  date_of_birth VARCHAR NOT NULL,
  grade VARCHAR,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roma_children_family_id_idx ON roma_children(family_id);
CREATE INDEX IF NOT EXISTS roma_families_email_idx ON roma_families(email);
