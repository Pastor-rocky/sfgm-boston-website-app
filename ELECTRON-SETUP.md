# Electron Desktop App Setup

## Quick Start

1. **Install Electron:**
   ```bash
   npm install
   ```

2. **Run the Electron App:**
   ```bash
   npm run electron
   ```

That's it! The app will:
- ✅ Start the Express server automatically
- ✅ Open a desktop window
- ✅ Load your website
- ✅ Clean up when you close it

## How It Works

The Electron app:
1. Starts the Express server as a background process
2. Waits for the server to be ready
3. Opens a desktop window pointing to `http://localhost:56000`
4. Automatically shuts down the server when you close the app

## Benefits

- ✅ **No manual server management** - Everything runs automatically
- ✅ **Desktop app experience** - Native window, no browser needed
- ✅ **Reliable** - Server starts and stops with the app
- ✅ **Easy to use** - Just double-click or run one command

## Building a Standalone App (Optional)

To create a distributable app:

```bash
npm install electron-builder --save-dev
npm run electron:build
```

This will create a `.app` file (on Mac) that you can distribute.

## Troubleshooting

**App won't start?**
- Make sure `node_modules` is installed: `npm install`
- Check that port 56000 is free
- Look at the terminal for error messages

**Server won't start?**
- Check your `.env` file exists
- Verify database connection settings
- Check terminal output for errors
