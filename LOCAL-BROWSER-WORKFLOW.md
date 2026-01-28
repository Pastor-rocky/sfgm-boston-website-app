# Local Browser Testing Workflow 🖥️

## The Problem
We keep having issues with the local browser automation because:
- Server might not be running
- Server might still be starting up
- Dependencies might not be installed
- Path issues with directory names containing colons

## The Solution: Two-Step Process

### Step 1: Start Server (Manual - Required)
**You must start the server first before opening browser:**

```bash
cd "/Users/rocky/Desktop/SFGM Boston Website:App"
npm run test:local
```

**Wait for this message:**
```
✅ Database connection established
serving on port 56000
```

**Only then proceed to Step 2.**

---

### Step 2: Open Browser (Automated)

#### Option A: Use Helper Script (Recommended)
```bash
# Open homepage
./scripts/open-local-browser.sh

# Open specific page
./scripts/open-local-browser.sh /instructor-dashboard
./scripts/open-local-browser.sh /course/1
```

#### Option B: Manual Browser
Once server is running, manually open:
- **Homepage**: http://localhost:56000
- **Instructor Dashboard**: http://localhost:56000/instructor-dashboard
- **Any other page**: http://localhost:56000/path

#### Option C: Ask AI to Open
**After server is running**, you can ask:
- "Open the homepage in browser"
- "Open instructor dashboard"
- "Show me the course page"

The AI will check if server is ready first, then open the browser.

---

## Quick Reference

### Start Server
```bash
npm run test:local
```

### Check if Server is Running
```bash
curl http://localhost:56000/api/health
# Should return: {"status":"ok",...}
```

### Kill Server if Stuck
```bash
lsof -ti:56000 | xargs kill -9
```

### Common Issues

**Server won't start:**
1. Check if port is in use: `lsof -ti:56000`
2. Check if dependencies installed: `test -d node_modules`
3. Check if `.env` file exists with `DATABASE_URL`
4. Check database is running: `brew services list | grep postgres`

**Browser can't connect:**
1. Verify server is running: `curl http://localhost:56000/api/health`
2. Wait 10-15 seconds after starting server
3. Check server logs for errors

---

## Recommended Workflow

1. **Start server manually** (in a terminal):
   ```bash
   npm run test:local
   ```

2. **Wait for server ready message**:
   ```
   ✅ Database connection established
   serving on port 56000
   ```

3. **Then ask AI or use script**:
   ```bash
   ./scripts/open-local-browser.sh /instructor-dashboard
   ```

4. **Or manually open browser**:
   - Open http://localhost:56000 in your browser

---

## Why This Approach?

✅ **Reliable**: Server must be running first
✅ **Clear**: You know exactly what's happening
✅ **Flexible**: Works with AI automation or manual
✅ **Simple**: No complex automation that can fail

---

## For AI Agents

When user asks to "open browser" or "show page":
1. **First check**: Is server running? (`lsof -ti:56000`)
2. **If not**: Tell user to start server first with `npm run test:local`
3. **If yes**: Check if server responds (`curl http://localhost:56000/api/health`)
4. **If ready**: Open browser to requested URL
5. **If not ready**: Wait up to 30 seconds, then try again

**Never try to start server automatically** - it's unreliable due to:
- Path issues with colons in directory names
- Missing dependencies
- Database connection issues
- Environment variable requirements
