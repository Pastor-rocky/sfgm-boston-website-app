# Database Connection Issue

## Current Status

- ✅ PostgreSQL@15 is **running**
- ❌ Server **cannot connect** to database (ECONNREFUSED)
- ⚠️ Login will fail until database connection works

---

## Possible Issues

### Issue 1: PostgreSQL Port Mismatch
PostgreSQL@15 might be running on a **different port** than 5432.

**Check actual port:**
```bash
lsof -i -P | grep postgres
```

### Issue 2: Database Doesn't Exist
The database `boston_ministry` might not exist yet.

**Create it:**
```bash
# Find psql location
find /opt/homebrew /usr/local -name psql 2>/dev/null | head -1

# Then create database (adjust path as needed)
/opt/homebrew/bin/psql -U rocky -c "CREATE DATABASE boston_ministry;"
```

### Issue 3: User Permissions
User `rocky` might not have access.

**Fix:**
```bash
# Grant permissions or create user
/opt/homebrew/bin/psql -U rocky -c "GRANT ALL ON DATABASE boston_ministry TO rocky;"
```

### Issue 4: PostgreSQL@15 Uses Different Port
PostgreSQL@15 might use port 5433 instead of 5432.

**Check and update .env:**
```env
DATABASE_URL=postgresql://rocky@localhost:5433/boston_ministry
```

---

## Quick Fixes to Try

### Fix 1: Check PostgreSQL Port
```bash
# Find what port PostgreSQL is actually using
sudo lsof -i -P | grep postgres | grep LISTEN
```

### Fix 2: Update .env with Correct Port
If PostgreSQL is on port 5433, update `.env`:
```env
DATABASE_URL=postgresql://rocky@localhost:5433/boston_ministry
```

### Fix 3: Create Database if Missing
```bash
# Find psql
which psql || find /opt/homebrew /usr/local -name psql 2>/dev/null

# Create database
createdb -U rocky boston_ministry
```

---

## Alternative: Use Production Database

If you have a production database URL, you can temporarily use it for testing:

Update `.env`:
```env
DATABASE_URL=your_production_database_url_here
```

---

## What to Check

1. ✅ **PostgreSQL is running** - Confirmed ✅
2. ⚠️ **Port number** - May be 5433 instead of 5432
3. ⚠️ **Database exists** - `boston_ministry` may need to be created
4. ⚠️ **User permissions** - `rocky` user may need permissions

---

## Next Steps

1. Check what port PostgreSQL is actually using
2. Update `.env` if port is different
3. Create database if it doesn't exist
4. Restart server
5. Try login again

Let me know what port PostgreSQL is using and I can help fix the connection! 🔧
