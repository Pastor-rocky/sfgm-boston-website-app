# Quick Start Guide

## Easiest Way to View the Website

### Option 1: Double-Click to Start (Recommended)

1. **Find the file**: Look for `START-APP.command` in your project folder
2. **Double-click it** - The app will start automatically!
3. **Wait 30 seconds** - The browser will open automatically
4. **Done!** - Your website is running at http://localhost:56000

### Option 2: Terminal Command

Just run this one command:

```bash
node scripts/start-app.js
```

### Option 3: Using npm

```bash
npm run dev
```

## What Happens Automatically

✅ Checks if dependencies are installed  
✅ Installs them if needed (first time only)  
✅ Starts the server  
✅ Opens your browser  

## Troubleshooting

**"Port already in use"**
- Another instance is running
- Close it or restart your computer

**"Cannot find module"**
- Run: `npm install`
- Then try again

**"Connection refused"**
- Wait 30 seconds for server to start
- Check that port 56000 is free

## Stopping the Server

Press `Ctrl+C` in the terminal, or close the terminal window.
