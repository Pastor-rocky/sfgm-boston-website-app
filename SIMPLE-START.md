# 🚀 Simple Way to Start the Website

## Easiest Method: One Command

Just run this in your terminal:

```bash
npm run start:app
```

Or if you prefer:

```bash
node scripts/start-app.js
```

## What It Does

1. ✅ **Checks dependencies** - Installs if missing
2. ✅ **Starts server** - On port 56000
3. ✅ **Opens browser** - Automatically after 5 seconds
4. ✅ **Handles errors** - Shows helpful messages

## Desktop Shortcut (Optional)

To create a desktop shortcut you can double-click:

1. Open Terminal
2. Run:
   ```bash
   cd "/Users/rocky/Desktop/SFGM Boston Website:App "
   ln -s "$(pwd)/scripts/start-app.js" ~/Desktop/Start-SFGM-Website.command
   chmod +x ~/Desktop/Start-SFGM-Website.command
   ```

Then you can double-click "Start-SFGM-Website.command" on your Desktop!

## Troubleshooting

**Server won't start?**
- Make sure you're in the project directory
- Check that Node.js is installed: `node --version`
- Try: `npm install` first

**Port 56000 in use?**
- Close other terminal windows
- Or change the port in the script

**Browser doesn't open?**
- Manually go to: http://localhost:56000
