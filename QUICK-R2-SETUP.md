# Quick Cloudflare R2 Setup - 15 Minutes

## Step 1: Create Account & Bucket (5 min)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free)
3. Click **"R2"** in sidebar
4. Click **"Create bucket"**
5. Name: `sfgm-boston-media`
6. Click **"Create bucket"**

## Step 2: Get API Credentials (3 min)

1. Click **"Manage R2 API Tokens"**
2. Click **"Create API token"**
3. Name: `sfgm-boston-api`
4. Permissions: **"Object Read & Write"**
5. Bucket: `sfgm-boston-media`
6. Click **"Create API Token"**
7. **COPY AND SAVE:**
   - Access Key ID
   - Secret Access Key
   - Account ID (shown at top of R2 page)

## Step 3: Enable Public Access (1 min)

1. Click on your bucket `sfgm-boston-media`
2. Go to **"Settings"** tab
3. Enable **"Public Access"**
4. Note the public URL: `https://pub-[ACCOUNT_ID].r2.dev`

## Step 4: Upload Files (5 min)

### Quick Upload via Dashboard:
1. Click **"Upload"** button
2. Select all files from: `client/public/uploads/textbook-audio/acts-in-action-*.mp3`
3. Wait for upload

### Or use this script (faster):
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Upload all Acts files
cd client/public/uploads/textbook-audio
for file in acts-in-action-*.mp3; do
  wrangler r2 object put sfgm-boston-media/$file --file=$file
done
```

## Step 5: Add Environment Variable (1 min)

Add to your deployment platform (Render/Railway/etc.):

**Variable Name:** `VITE_R2_PUBLIC_URL`  
**Value:** `https://pub-[YOUR-ACCOUNT-ID].r2.dev`

Replace `[YOUR-ACCOUNT-ID]` with your actual Account ID from Step 2.

## Step 6: Redeploy

The code is already updated! Just:
1. Add the environment variable
2. Redeploy
3. Audio will work immediately!

---

## That's It! 🎉

**Time:** 15 minutes  
**Cost:** $0/month  
**Result:** Audio works perfectly, faster delivery, no more file issues!

