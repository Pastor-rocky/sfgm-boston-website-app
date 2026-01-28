# 🚀 Quick Server Start (Temporary Solution)

Since you just need to **preview things before pushing to Git**, here's the simplest way:

## Option 1: Use the Helper Script (Easiest)

```bash
node scripts/start-dev-server.js
```

This will:
1. ✅ Check if dependencies are installed (install if needed)
2. ✅ Start the server on port 56000
3. ✅ Show you the URL to open

Then just open http://localhost:56000 in your browser!

---

## Option 2: Manual Start (If script doesn't work)

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start server
npm run test:local
```

Wait for: `serving on port 56000`

Then open: http://localhost:56000

---

## Option 3: Just Build and Preview Static Files

If you just want to see how it looks (no API functionality):

```bash
# Build the project
npm run build

# Then use simple HTTP server
cd dist/public
python3 -m http.server 8080
```

Open: http://localhost:8080

**Note**: This won't have API functionality, but you can see the UI.

---

## Quick Commands

```bash
# Start server (auto-installs if needed)
node scripts/start-dev-server.js

# Or manually
npm install && npm run test:local

# Check if server is running
curl http://localhost:56000/api/health
```

---

## What to Expect

When server starts successfully, you'll see:
```
✅ Database connection established
Setting up Vite in development mode...
Vite setup complete
serving on port 56000
```

Then you can:
- ✅ Open http://localhost:56000 in browser
- ✅ Test all features (login, courses, quizzes)
- ✅ See live changes (hot reload)

---

## Troubleshooting

**"Cannot find module" errors:**
- Run: `npm install`

**"Port already in use":**
- Kill existing process: `lsof -ti:56000 | xargs kill -9`

**"Database connection failed":**
- Server will still start, but some features won't work
- Check your `.env` file has `DATABASE_URL`

---

This is temporary - after you're done fixing things, just push to Git! 🎉
