# Cloudflare R2 Setup Guide - Quick Start

## Why R2?
- ✅ **FREE** for your usage (0.84GB storage, ~5GB/month traffic)
- ✅ Fast CDN included
- ✅ No egress fees (huge savings!)
- ✅ Reliable (99.9%+ uptime)
- ✅ Solves all file serving issues

## Step 1: Create Cloudflare Account (5 min)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free)
3. Verify email

## Step 2: Create R2 Bucket (2 min)

1. In Cloudflare dashboard, click **"R2"** in sidebar
2. Click **"Create bucket"**
3. Name: `sfgm-boston-media`
4. Location: Choose closest to your users (US East recommended)
5. Click **"Create bucket"**

## Step 3: Get API Credentials (3 min)

1. In R2 dashboard, click **"Manage R2 API Tokens"**
2. Click **"Create API token"**
3. Permissions: **"Object Read & Write"**
4. Bucket: Select `sfgm-boston-media`
5. Click **"Create API Token"**
6. **SAVE THESE VALUES** (you'll need them):
   - Access Key ID
   - Secret Access Key
   - Account ID (shown at top of R2 page)

## Step 4: Upload Files (10 min)

### Option A: Via Cloudflare Dashboard
1. Click on your bucket
2. Click **"Upload"**
3. Drag and drop all files from `client/public/uploads/textbook-audio/`
4. Wait for upload to complete

### Option B: Via CLI (faster for many files)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Upload files
cd client/public/uploads/textbook-audio
wrangler r2 object put sfgm-boston-media/acts-in-action-cp1.mp3 --file=acts-in-action-cp1.mp3
# Repeat for each file, or use a script
```

## Step 5: Configure Public Access (2 min)

1. In bucket settings, enable **"Public Access"**
2. This allows direct CDN URLs

## Step 6: Get CDN URL

Your files will be available at:
```
https://pub-[ACCOUNT_ID].r2.dev/[filename]
```

Or set up a custom domain (optional):
```
https://media.sfgmboston.com/[filename]
```

## Step 7: Update Code (I'll do this)

I'll update your code to use R2 URLs instead of local paths.

## Step 8: Test

After code update, test the audio player - it should work immediately!

---

## Environment Variables Needed

Add these to your `.env` file:
```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=sfgm-boston-media
R2_PUBLIC_URL=https://pub-[ACCOUNT_ID].r2.dev
```

---

## Time Estimate: 30 minutes total
- Account setup: 5 min
- Bucket creation: 2 min
- API tokens: 3 min
- Upload files: 10 min
- Code update: 10 min (I'll do this)

---

## Cost: $0/month
- Storage: 0.84GB = FREE (within 10GB free tier)
- Bandwidth: 5GB/month = FREE (within 10GB free tier)
- CDN: FREE

