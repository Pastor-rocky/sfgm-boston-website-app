# R2 Public Access Setup Guide

## Understanding the Status

When you see **"disabled"** next to "Public Development URL", it means:
- The toggle/switch is currently OFF
- Public access is NOT enabled yet
- You need to **enable** it for files to be accessible

## How to Enable Public Access in Cloudflare R2

### Step 1: Enable Public Access
1. In your R2 bucket settings (sfgmboston bucket)
2. Find **"Public Access"** or **"Public Development URL"** section
3. Toggle/switch it to **"Enabled"** or **"On"**
4. Save the changes

### Step 2: Verify It's Enabled
- The status should change from "disabled" to "enabled"
- The URL should become clickable/accessible

## Common Issues and Solutions

### Issue 1: URL gives 404 error
**Cause:** Public access not enabled, or files not uploaded correctly

**Solution:**
1. Make sure Public Access is enabled (toggle is ON)
2. Verify files are in the bucket
3. Check file names match exactly (including spaces and emoji)

### Issue 2: URL gives "Access Denied" or 403 error
**Cause:** Bucket policy blocking public access

**Solution:**
1. Go to bucket settings
2. Check "Public Access" is enabled
3. There might be a separate "Bucket Policy" section - make sure it allows public read access

### Issue 3: CORS error when loading audio
**Cause:** CORS headers not configured

**Solution:**
1. In R2 bucket settings, find "CORS Policy" or "CORS Configuration"
2. Add CORS policy allowing your domain:
   ```json
   [
     {
       "AllowedOrigins": ["https://sfgmboston.com", "https://www.sfgmboston.com"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## Testing if Public URL Works

### Test 1: Access the root URL
```bash
curl https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
```
Should return either a list of files or an error (both are OK for root)

### Test 2: Access a specific file
```bash
curl -I "https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/Act%20in%20Action%20%F0%9F%8E%AC%20%20Cp1.mp3"
```
Should return HTTP 200 OK with Content-Type: audio/mpeg

### Test 3: In Browser
1. Open browser
2. Go to: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/Act%20in%20Action%20%F0%9F%8E%AC%20%20Cp1.mp3`
3. Should either:
   - Download the file, OR
   - Play the audio (if browser supports it)

## Important Notes

### Public Development URL vs Custom Domain
- **Public Development URL** (what you're using):
  - ✅ Quick to set up
  - ✅ Works immediately
  - ⚠️ Rate-limited (not ideal for high traffic)
  - ⚠️ No Cloudflare caching/Access features

- **Custom Domain** (for production):
  - ✅ Full Cloudflare features
  - ✅ No rate limits
  - ✅ Better performance
  - ⚠️ Requires domain setup

For now, the Public Development URL is fine for testing and moderate traffic.

## Next Steps After Enabling

1. ✅ Enable Public Access toggle
2. ✅ Verify files are accessible (test with curl or browser)
3. ✅ Set `VITE_R2_PUBLIC_URL` in Render (as we discussed earlier)
4. ✅ Rebuild the app
5. ✅ Test audio playback on the website

## If Still Having Issues

1. **Check Cloudflare Dashboard:**
   - Go to R2 → sfgmboston bucket
   - Click "Settings" or "Configuration"
   - Look for "Public Access" or "Public Development URL"
   - Make sure it's enabled

2. **Check File Names:**
   - In R2 bucket, list the files
   - Make sure they match exactly what the code expects
   - Example: `Act in Action 🎬  Cp1.mp3` (with spaces and emoji)

3. **Try accessing a file directly:**
   - Copy the exact filename from R2
   - URL encode it: `Act%20in%20Action%20%F0%9F%8E%AC%20%20Cp1.mp3`
   - Try: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/[encoded-filename]`

If you're still having trouble, tell me:
- What error message you see
- Whether the toggle is now enabled
- What happens when you try to access a file URL directly






