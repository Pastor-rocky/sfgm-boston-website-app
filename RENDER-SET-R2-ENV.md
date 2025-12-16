# How to Set VITE_R2_PUBLIC_URL in Render

## Step-by-Step Instructions

### Step 1: Log into Render Dashboard
1. Go to https://dashboard.render.com
2. Log in with your account

### Step 2: Find Your Service
1. In the Render dashboard, you'll see a list of your services
2. Click on your website/service (the one that hosts sfgmboston.com)

### Step 3: Navigate to Environment Variables
1. In the left sidebar, click **"Environment"**
2. Or look for **"Environment Variables"** in the menu

### Step 4: Add the Environment Variable
1. Click **"Add Environment Variable"** button
2. In the **Key** field, type: `VITE_R2_PUBLIC_URL`
3. In the **Value** field, type: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
4. Click **"Save Changes"**

### Step 5: Trigger a New Build
Render will automatically:
- ✅ Detect the environment variable change
- ✅ Start a new build
- ✅ Use the variable during the build process

You can watch the build in the **"Events"** or **"Logs"** tab.

### Step 6: Verify It Worked

After the build completes (usually 5-10 minutes):

1. Open your website: https://sfgmboston.com/acts-audio-player
2. Open browser console (Press F12, then click "Console" tab)
3. Look for this message:
   ```
   [Audio Storage] Using R2: https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
   [Audio Storage] Generated R2 URL: https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/Act%20in%20Action%20%F0%9F%8E%AC%20%20Cp1.mp3
   ```

If you see these messages, it's working! 🎉

If you see "Using local files" instead, double-check that:
- The variable name is exactly: `VITE_R2_PUBLIC_URL` (case-sensitive)
- The value is exactly: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
- You saved the changes
- A new build completed

## Troubleshooting

**Q: I don't see "Environment" in the sidebar**
- It might be under "Settings" → "Environment"
- Or "Config" → "Environment Variables"

**Q: The build is still using local files**
- Make sure the variable name starts with `VITE_` (required for Vite)
- Check that you saved the changes before the build started
- Look at the build logs to see if there are any errors

**Q: How do I manually trigger a rebuild?**
- Go to "Events" tab
- Click "Manual Deploy" → "Deploy latest commit"

## Quick Checklist

- [ ] Logged into Render dashboard
- [ ] Found your service
- [ ] Clicked "Environment" in sidebar
- [ ] Added variable: `VITE_R2_PUBLIC_URL`
- [ ] Set value: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
- [ ] Saved changes
- [ ] Build completed
- [ ] Checked browser console for R2 messages

## Need Help?

If you get stuck at any step, let me know which step and I'll help you through it!

