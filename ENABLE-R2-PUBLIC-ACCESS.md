# How to Enable Public Access in Cloudflare R2

## The Problem

You're seeing: **"Error 404 - Object not found or is not publicly accessible"**

This means public access is **NOT enabled** on your R2 bucket, even if it looks enabled.

## Step-by-Step: Enable Public Access

### Method 1: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com
   - Log in with your account

2. **Navigate to R2**
   - In the left sidebar, click **"R2"**
   - You should see your bucket: **"sfgmboston"**

3. **Open Your Bucket**
   - Click on the bucket name: **"sfgmboston"**

4. **Find Public Access Settings**
   - Look for a tab or section called:
     - **"Settings"**
     - **"Configuration"**
     - **"Public Access"**
     - **"Public Development URL"**
   
   It might be in different places depending on Cloudflare's UI updates.

5. **Enable Public Access**
   - Find the toggle/switch for **"Public Development URL"** or **"Public Access"**
   - Toggle it to **"On"** or **"Enabled"**
   - **IMPORTANT:** Look for a **"Save"** or **"Confirm"** button and click it
   - Some settings require explicit confirmation

6. **Verify It's Enabled**
   - The status should show as **"Enabled"** or **"On"**
   - You should see the public URL: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
   - The status text should change from "disabled" to "enabled"

### Method 2: Using R2 Settings Page

1. In your bucket view, click **"Settings"** tab
2. Scroll to **"Public Access"** section
3. Toggle **"Public Development URL"** to **ON**
4. Click **"Save"** or **"Update"** button
5. Wait 1-2 minutes for changes to propagate

## Important Notes

### The Toggle Must Be ON
- Don't just see the URL - the toggle must be **ON/Enabled**
- If it says "disabled", public access is OFF

### Save Changes
- After toggling, look for a **Save** button
- Some UI changes require explicit confirmation
- Don't just navigate away - make sure changes are saved

### Propagation Time
- After enabling, wait 1-2 minutes
- Cloudflare needs time to propagate the settings
- Try accessing a file again after waiting

## Verify It's Working

After enabling and waiting 1-2 minutes, test:

### Test 1: Check Root URL
```
https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
```
Expected: 404 is OK (no index page), but should not say "not publicly accessible"

### Test 2: Check a Specific File
```
https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/Act%20in%20Action%20%F0%9F%8E%AC%20%20Cp1.mp3
```

**Expected:** Should download or play the audio file
**NOT Expected:** "404 - Object not found or not publicly accessible"

## Troubleshooting

### Still Getting 404?

1. **Double-check the toggle is ON**
   - It should say "Enabled" not "Disabled"
   - The toggle switch should be in the ON position

2. **Check if files exist**
   - In R2 bucket, go to "Objects" tab
   - Verify files are listed
   - Check the exact filename (including spaces and emoji)

3. **Try a simple test file**
   - Upload a simple test file (like `test.txt`)
   - Try accessing: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/test.txt`
   - If this works, the issue is with the filename encoding

4. **Check bucket region**
   - Make sure the bucket region matches
   - Some regions may have different URL structures

### Can't Find the Toggle?

The UI might have changed. Look for:
- **"Settings"** → **"Public Access"**
- **"Configuration"** → **"Public Development URL"**
- **"Permissions"** → **"Public Access"**
- A gear/settings icon next to the bucket name

## Alternative: Use R2 API to Check Status

If you have API access, you can check public access status via API, but the dashboard is easier.

## Next Steps

Once public access is enabled and working:

1. ✅ Test accessing a file directly in browser
2. ✅ Set `VITE_R2_PUBLIC_URL` in Render
3. ✅ Rebuild your application
4. ✅ Test audio playback on the website

## Need More Help?

If you're still stuck:
1. Take a screenshot of the R2 bucket settings page
2. Tell me what options/buttons you see
3. Describe what happens when you click the toggle

The exact UI might vary, so details help!



