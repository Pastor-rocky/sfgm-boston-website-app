# How to Start Development Server

## 🚀 Quick Start

### Step 1: Make sure you're in the project directory
```bash
cd "/Users/rocky/Desktop/SFGM Boston Website:App"
```

### Step 2: Start the development server
```bash
npm run dev
```

The server will start and show you the port (usually 56000).

### Step 3: Open in browser
Once you see "Server running on port XXXX" in the terminal, open:
- `http://localhost:56000` (or whatever port is shown)

## 🔍 Troubleshooting

### If port is already in use:
The server will automatically use a different port. Check the terminal output for the actual port number.

### If you see database errors:
Make sure your `.env` file has the correct `DATABASE_URL`.

### If npm run dev doesn't work:
1. Make sure you have Node.js installed: `node --version`
2. Install dependencies: `npm install`
3. Try again: `npm run dev`

## 📝 What to Expect

When the server starts, you should see:
```
Server running on port 56000
Database connected
```

Then you can:
1. Open `http://localhost:56000` in your browser
2. Navigate to `/textbook-catalog`
3. Click any e-book to test MP3 files

## ⚠️ Keep Terminal Open

**Important**: Keep the terminal window open while testing. Closing it will stop the server.

## 🛑 To Stop Server

Press `Ctrl+C` in the terminal where the server is running.



