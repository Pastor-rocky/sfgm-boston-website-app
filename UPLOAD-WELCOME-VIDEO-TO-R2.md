# Upload Welcome Video to R2 Cloud Storage

## ✅ Code Updated!

The welcome video code has been updated to use R2 cloud storage. It will:
- ✅ Use R2 if `VITE_R2_PUBLIC_URL` is set (production)
- ✅ Fallback to local file if R2 not configured (development)

---

## 📤 Upload Video to R2

### Step 1: Go to Cloudflare R2 Dashboard
1. Go to: https://dash.cloudflare.com/
2. Click **"R2"** in the sidebar
3. Click on your bucket (likely `sfgm-boston-media` or similar)

### Step 2: Upload the Video
1. Click **"Upload"** button
2. Upload the file: `public/assets/welcome-video.mp4` (or `public/Video/Intro.mp4`)
3. **Important:** Upload it to the **root level** of the bucket (not in a subfolder)
4. The filename should be exactly: `welcome-video.mp4`

### Step 3: Verify Public Access
1. Make sure your R2 bucket has public access enabled
2. Check that the file is accessible via the public URL
3. The URL should be: `{VITE_R2_PUBLIC_URL}/welcome-video.mp4`

---

## ✅ That's It!

Once the video is uploaded to R2:
- The website will automatically use R2 URL in production
- Faster loading from CDN
- No need to bundle large video in build
- Works immediately after upload

---

## 🧪 Test It

After uploading:
1. The video will load from R2 automatically
2. Check browser console for: `[Video Storage] Using R2: ...`
3. Video should load and play correctly

---

## 📝 Quick Checklist

- [ ] Code updated to use R2 ✅ (done)
- [ ] Upload `welcome-video.mp4` to R2 bucket root
- [ ] Verify public access is enabled
- [ ] Test on website

**Ready to commit and push the code changes!**

