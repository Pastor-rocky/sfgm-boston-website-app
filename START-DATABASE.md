# Start Your Database to Fix Login

## The Problem

Your login is failing because **PostgreSQL database is not running**.

Your `.env` file has:
```
DATABASE_URL=postgresql://rocky@localhost:5432/boston_ministry
```

But PostgreSQL is not running on your Mac.

---

## Quick Fix: Start PostgreSQL

### Option 1: Using Homebrew (if installed via Homebrew)

```bash
brew services start postgresql
```

Or if you have a specific version:
```bash
brew services start postgresql@14
# or
brew services start postgresql@15
```

### Option 2: Manual Start

```bash
pg_ctl -D /usr/local/var/postgres start
```

Or if PostgreSQL is in a different location:
```bash
pg_ctl -D /opt/homebrew/var/postgres start
```

### Option 3: Check if it's already running

```bash
ps aux | grep postgres
```

If you see postgres processes, it might already be running but on a different port.

---

## Verify Database is Running

After starting, check:

```bash
psql -U rocky -d boston_ministry -c "SELECT 1;"
```

If this works, your database is connected!

---

## Restart Server After Database Starts

Once PostgreSQL is running:

1. Stop the current server (Ctrl+C in terminal)
2. Restart it:
   ```bash
   cd "/Users/rocky/Desktop/SFGM Boston Website:App  "
   PORT=56000 npm run dev
   ```
3. Try logging in again

---

## If PostgreSQL is Not Installed

If you don't have PostgreSQL installed:

### Install via Homebrew:
```bash
brew install postgresql@14
brew services start postgresql@14
createdb boston_ministry
```

### Or use a Cloud Database:

1. **Neon** (free tier): https://neon.tech
2. **Supabase** (free tier): https://supabase.com
3. Update `.env` with the connection string

---

## What I Fixed

I've improved the login error handling so you'll now see:
- ✅ **Better error message**: "Database is currently unavailable..."
- ✅ **Clear indication** that it's a database issue
- ✅ **More helpful** than "unexpected error"

---

## Next Steps

1. ✅ Start PostgreSQL (see commands above)
2. ✅ Verify it's running: `ps aux | grep postgres`
3. ✅ Restart your server
4. ✅ Try logging in again

The login should work once the database is running! 🚀
