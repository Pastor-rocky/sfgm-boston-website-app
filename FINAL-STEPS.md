# Final Steps to Get Audio Working

## ✅ What's Done

1. ✅ R2 bucket created
2. ✅ Files uploaded to R2
3. ✅ Public access enabled (files are accessible)
4. ✅ Tested - file URL works and plays audio

## ⏳ What's Left

### Step 1: Set Environment Variable in Render

1. Go to https://dashboard.render.com
2. Click on your service (the one hosting sfgmboston.com)
3. In the left sidebar, click **"Environment"**
4. Click **"Add Environment Variable"** button
5. Add:
   - **Key:** `VITE_R2_PUBLIC_URL`
   - **Value:** `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
6. Click **"Save Changes"**

### Step 2: Wait for Build to Complete

- Render will automatically detect the environment variable change
- It will start a new build automatically
- Build takes 5-10 minutes
- You can watch progress in the "Events" or "Logs" tab

### Step 3: Verify It's Working

After the build completes:

1. Go to your website: https://sfgmboston.com/acts-audio-player
2. Open browser console (Press F12, click "Console" tab)
3. Look for this message:
   ```
   [Audio Storage] Using R2: https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
   ```
4. Try playing the audio - it should work! 🎉

## Troubleshooting

If you see "Using local files" in the console:
- The environment variable wasn't set before the build
- You need to trigger a new build after setting it
- Go to "Events" → "Manual Deploy" → "Deploy latest commit"

## Summary

You're almost done! Just need to:
1. ✅ Set the environment variable in Render (2 minutes)
2. ⏳ Wait for rebuild (5-10 minutes)
3. ✅ Test the audio player

That's it!



