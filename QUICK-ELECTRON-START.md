# Quick Start - Electron Desktop App

## The Easiest Way

**Just double-click:** `Start-SFGM-Desktop-App.command` on your Desktop

That's it! It will automatically:
- Find your project
- Start the server
- Open the desktop app

## Or Use Terminal

If you prefer terminal, run these commands:

```bash
# Navigate to project
cd "$(find ~/Desktop -name package.json -path '*SFGM*' | head -1 | xargs dirname)"

# Start Electron app
npm run electron
```

## Or Create an Alias (One-Time Setup)

Add this to your `~/.zshrc` file:

```bash
alias sfgm-app='cd "$(find ~/Desktop -name package.json -path "*SFGM*" 2>/dev/null | head -1 | xargs dirname)" && npm run electron'
```

Then you can just type `sfgm-app` from anywhere!

## What Happens

1. ✅ Server starts automatically (takes 10-30 seconds first time)
2. ✅ Desktop window opens
3. ✅ Your website loads
4. ✅ Server stops when you close the app

No more connection errors! 🎉
