# Audio Storage Upgrade Plan

## Current Situation
- **820MB** of audio files (57 MP3s)
- Files stored in `client/public/uploads/textbook-audio/`
- Served via Express static middleware
- **Issue**: Filenames with emoji/spaces causing encoding problems

---

## ✅ PHASE 1: Immediate Fix (Do This First)

### Step 1: Rename Files to URL-Safe Names

**Run the rename script:**
```bash
node scripts/rename-acts-audio-files.js
```

**This will rename:**
- `Act in Action 🎬  Cp1.mp3` → `acts-in-action-cp1.mp3`
- `Act in Action 🎬  Cp2.mp3` → `acts-in-action-cp2.mp3`
- etc.

### Step 2: Update Code References

Update all references in:
- `client/src/pages/acts-audio-player.tsx`
- `client/src/pages/acts-in-action-ebook.tsx`
- `client/src/pages/acts-audio-player-ch*.tsx` (ch2-ch10)

**Change from:**
```typescript
'/uploads/textbook-audio/Act in Action 🎬  Cp1.mp3'
```

**To:**
```typescript
'/uploads/textbook-audio/acts-in-action-cp1.mp3'
```

**Benefits:**
- ✅ No encoding issues
- ✅ Works on all servers/browsers
- ✅ No infrastructure changes needed
- ✅ Immediate fix

---

## 🚀 PHASE 2: Cloud Storage Upgrade (Recommended)

### Why Cloud Storage?

**Current Problems:**
- ❌ Files bundled with app (slower deployments)
- ❌ Limited by server disk space
- ❌ No CDN (slower for users far from server)
- ❌ Backup/restore complexity
- ❌ Scaling issues

**Cloud Storage Benefits:**
- ✅ **Faster**: CDN delivery worldwide
- ✅ **Reliable**: 99.9%+ uptime
- ✅ **Scalable**: Unlimited storage
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Better performance**: Optimized for media streaming
- ✅ **Automatic backups**: Built-in redundancy

### Recommended Options

#### Option 1: Cloudflare R2 (Best for Cost)
- **Cost**: $0.015/GB storage, $0.36/GB egress (first 10GB free/month)
- **Pros**: No egress fees, S3-compatible, fast CDN
- **Cons**: Newer service (but very reliable)
- **Best for**: Budget-conscious, high traffic

#### Option 2: AWS S3 + CloudFront
- **Cost**: ~$0.023/GB storage, $0.085/GB egress (first 1GB free)
- **Pros**: Industry standard, very reliable, mature
- **Cons**: More complex setup, higher costs at scale
- **Best for**: Enterprise needs, existing AWS infrastructure

#### Option 3: DigitalOcean Spaces
- **Cost**: $5/month for 250GB + 1TB egress
- **Pros**: Simple pricing, S3-compatible, good performance
- **Cons**: Less features than AWS
- **Best for**: Simplicity, predictable costs

### Implementation Plan

#### Step 1: Choose Provider
**Recommendation: Cloudflare R2** (best value)

#### Step 2: Setup
1. Create R2 bucket: `sfgm-boston-audio`
2. Upload all MP3 files
3. Get API credentials
4. Configure CORS for your domain

#### Step 3: Update Code

**Install AWS SDK (works with R2):**
```bash
npm install @aws-sdk/client-s3
```

**Create storage service:**
```typescript
// server/services/audio-storage.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getAudioUrl(filename: string): Promise<string> {
  // Option 1: Direct CDN URL (fastest)
  return `https://your-cdn-domain.com/${filename}`;
  
  // Option 2: Signed URL (more secure, expires)
  // const command = new GetObjectCommand({ Bucket: 'sfgm-boston-audio', Key: filename });
  // return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

**Update audio player:**
```typescript
// Instead of: '/uploads/textbook-audio/acts-in-action-cp1.mp3'
const audioSrc = await getAudioUrl('acts-in-action-cp1.mp3');
```

#### Step 4: Migration Script
```bash
# Upload all files to R2
node scripts/upload-audio-to-r2.js
```

---

## 📊 Cost Comparison

### Current (Static Files)
- **Storage**: Included in hosting
- **Bandwidth**: Included in hosting
- **Total**: $0/month (but slower, less reliable)

### Cloudflare R2 (Recommended)
- **Storage**: 820MB × $0.015 = **$0.01/month**
- **Egress**: First 10GB free, then $0.36/GB
- **Estimated**: **$0-5/month** (depending on traffic)
- **CDN**: Included free

### AWS S3 + CloudFront
- **Storage**: 820MB × $0.023 = **$0.02/month**
- **Egress**: ~$0.085/GB
- **Estimated**: **$5-20/month** (depending on traffic)

---

## 🎯 Recommendation

**Immediate (Today):**
1. ✅ Rename files to URL-safe names
2. ✅ Update code references
3. ✅ Deploy and test

**Upgrade (This Month):**
1. ✅ Set up Cloudflare R2 account
2. ✅ Upload audio files to R2
3. ✅ Update code to use R2 URLs
4. ✅ Test thoroughly
5. ✅ Deploy

**Why This Order?**
- Phase 1 fixes the immediate problem (30 minutes)
- Phase 2 provides long-term reliability (2-3 hours setup)
- Both can be done without downtime

---

## 🔧 Quick Start: Phase 1

```bash
# 1. Rename files
node scripts/rename-acts-audio-files.js

# 2. Update code (I'll do this for you)
# 3. Test locally
npm run dev

# 4. Deploy
git add -A
git commit -m "Rename audio files to URL-safe names"
git push origin main
```

---

## Questions?

- **Will this break existing links?** No, we'll update all code references
- **Do I need to re-upload files?** Only if moving to cloud storage (Phase 2)
- **How long will this take?** Phase 1: 30 min, Phase 2: 2-3 hours
- **Can I do Phase 2 later?** Yes! Phase 1 fixes the immediate issue

