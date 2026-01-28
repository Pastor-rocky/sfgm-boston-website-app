# Delete PastorRocky2 from Production Database

## Option 1: Using the Script (Recommended)

### Step 1: Get Your Production DATABASE_URL

1. Go to Render Dashboard → Your Service
2. Go to **Environment** tab
3. Find `DATABASE_URL` variable
4. Copy the entire value

### Step 2: Run the Script

Run this command (replace with your actual DATABASE_URL):

```bash
DATABASE_URL="your-production-database-url-here" node --env-file=.env node_modules/.bin/tsx delete-pastorrocky2-production.ts
```

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require" node --env-file=.env node_modules/.bin/tsx delete-pastorrocky2-production.ts
```

---

## Option 2: Direct SQL (If you have database access)

If you have direct access to your Neon/PostgreSQL database, you can run these SQL commands:

```sql
-- First, delete all related data
DELETE FROM content_progress WHERE student_id IN (
  SELECT id FROM users WHERE username ILIKE 'pastorrocky2'
);

DELETE FROM quiz_attempts WHERE student_id IN (
  SELECT id FROM users WHERE username ILIKE 'pastorrocky2'
);

DELETE FROM enrollments WHERE student_id IN (
  SELECT id FROM users WHERE username ILIKE 'pastorrocky2'
);

DELETE FROM auth_tokens WHERE user_id IN (
  SELECT id FROM users WHERE username ILIKE 'pastorrocky2'
);

DELETE FROM essay_submissions WHERE student_id IN (
  SELECT id FROM users WHERE username ILIKE 'pastorrocky2'
);

-- Finally, delete the user
DELETE FROM users WHERE username ILIKE 'pastorrocky2';
```

---

## Option 3: Using Neon Console

1. Go to https://console.neon.tech/
2. Select your project
3. Go to **SQL Editor**
4. Paste and run the SQL commands above
5. Click **Run**

---

## Verification

After deleting, verify the user is gone by checking your database or running:

```sql
SELECT username, id, email FROM users WHERE username ILIKE '%pastor%';
```

This should not show PastorRocky2 anymore.




