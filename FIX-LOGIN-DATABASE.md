# Fix Login Issue - Database Connection Required

## Problem

Login is failing because **the database is not connected**. The error message says "An unexpected error occurred" but the real issue is:

**Database connection refused (ECONNREFUSED on port 5432)**

---

## Solution Options

### Option 1: Start Your Database (Recommended)

If you have PostgreSQL installed locally:

```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# If not running, start it:
# On Mac with Homebrew:
brew services start postgresql

# Or manually:
pg_ctl -D /usr/local/var/postgres start
```

### Option 2: Update DATABASE_URL

Check your `.env` file and make sure `DATABASE_URL` points to a running database:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### Option 3: Use Remote Database

If you're using a cloud database (Neon, Supabase, etc.), make sure:
- ✅ The connection string is correct
- ✅ The database is accessible
- ✅ No firewall blocking the connection

---

## What I Fixed

I've improved the error handling so you'll now see a clearer message:

**Before**: "An unexpected error occurred"
**After**: "Database is currently unavailable. Please check your database connection and try again."

---

## Quick Check

Run this to see your current DATABASE_URL:

```bash
cd "/Users/rocky/Desktop/SFGM Boston Website:App  "
grep DATABASE_URL .env
```

---

## Test After Fixing Database

Once your database is connected:

1. ✅ Restart the server (if needed)
2. ✅ Try logging in again
3. ✅ Should work now!

---

## If You Don't Have a Database Yet

You have a few options:

1. **Install PostgreSQL locally**
   ```bash
   brew install postgresql
   brew services start postgresql
   createdb sfgm_boston
   ```

2. **Use a cloud database** (Neon, Supabase - free tiers available)

3. **Use the production database** (if you have one set up)

---

The login code is fixed to show better error messages. Now you just need to connect your database! 🚀
