# R2 Setup Verification Checklist

## ✅ Step 1: Files Uploaded?

**Check in Cloudflare Dashboard:**
1. Go to your R2 bucket: `sfgmboston`
2. Do you see these 10 files?
   - `acts-in-action-cp1.mp3`
   - `acts-in-action-cp2.mp3`
   - `acts-in-action-cp3.mp3`
   - `acts-in-action-cp4.mp3`
   - `acts-in-action-cp5.mp3`
   - `acts-in-action-cp6.mp3`
   - `acts-in-action-cp7.mp3`
   - `acts-in-action-cp8.mp3`
   - `acts-in-action-cp9.mp3`
   - `acts-in-action-cp10.mp3`

**If files are NOT there:**
- Upload them via drag & drop in the R2 dashboard
- Or use the upload button

---

## ✅ Step 2: Public Access Enabled?

**Check in Cloudflare Dashboard:**
1. Go to your bucket: `sfgmboston`
2. Click **"Settings"** tab
3. Look for **"Public Access"** section
4. Should be **"Enabled"** or **"On"**

**If not enabled:**
- Toggle it to **"Enabled"**
- Save changes

---

## ✅ Step 3: Test File Access

**Try accessing this URL in your browser:**
```
https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev/acts-in-action-cp1.mp3
```

**What should happen:**
- ✅ File downloads or plays (if browser supports MP3)
- ❌ "Not Found" or "Access Denied" = files not uploaded or public access not enabled

---

## ✅ Step 4: Environment Variable

**In your deployment platform (Render/Railway/etc.):**
1. Go to Environment Variables
2. Add new variable:
   - **Name:** `VITE_R2_PUBLIC_URL`
   - **Value:** `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
3. Save and redeploy

---

## Quick Test

After all steps are done, test:
1. Visit your website
2. Go to `/acts-audio-player`
3. Try to play audio
4. Check browser console (F12) - should see R2 URLs, not local paths

---

## Common Issues

**"Not Found" error:**
- Files not uploaded → Upload files
- Public access disabled → Enable in Settings

**"Access Denied" error:**
- Public access not enabled → Enable in bucket Settings

**Still using local files:**
- Environment variable not set → Add `VITE_R2_PUBLIC_URL`
- Not redeployed → Redeploy after adding env var






