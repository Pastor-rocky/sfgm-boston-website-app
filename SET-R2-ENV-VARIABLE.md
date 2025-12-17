# How to Set VITE_R2_PUBLIC_URL Environment Variable

## What You Need

**You already have everything you need!**

- ✅ Public R2 URL: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
- ✅ Files uploaded to R2 bucket
- ❌ Environment variable not set in deployment platform (this is the issue)

## The API Endpoint vs Public URL

The API endpoint you shared (`https://df0eeee32e3a1f84e60d62cc7db559fd.r2.cloudflarestorage.com/sfgmboston`) is for:
- Programmatic file uploads (SDK/CLI)
- Backend access
- Not needed for public file access

**For public file access, we use:** `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`

## Step-by-Step: Setting the Environment Variable

Since I can't directly access your deployment platform, here's how to do it for common platforms:

### Option A: Render.com

1. Go to https://dashboard.render.com
2. Click on your service (website/app)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Key: `VITE_R2_PUBLIC_URL`
6. Value: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
7. Click "Save Changes"
8. Render will automatically rebuild

### Option B: Railway.app

1. Go to https://railway.app/dashboard
2. Click on your project
3. Click on your service
4. Click "Variables" tab
5. Click "+ New Variable"
6. Key: `VITE_R2_PUBLIC_URL`
7. Value: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
8. Click "Add"
9. Railway will automatically rebuild

### Option C: Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   - Key: `VITE_R2_PUBLIC_URL`
   - Value: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
   - Environments: Production (and Preview if needed)
5. Click "Save"
6. Go to "Deployments" and redeploy

### Option D: Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to "Site configuration" → "Environment variables"
4. Click "Add variable"
5. Key: `VITE_R2_PUBLIC_URL`
6. Value: `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
7. Click "Save"
8. Trigger a new deploy

### Option E: Other Platform / Self-Hosted

Add this to your build command or environment:

```bash
export VITE_R2_PUBLIC_URL=https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
npm run build
```

Or create a `.env.production` file in your project root:

```
VITE_R2_PUBLIC_URL=https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
```

## How to Verify It Worked

After the rebuild completes:

1. Open your website: https://sfgmboston.com/acts-audio-player
2. Open browser console (F12)
3. Look for this message:
   ```
   [Audio Storage] Using R2: https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
   ```
4. If you see "Using local files" instead, the variable wasn't set correctly

## Still Need Help?

If you tell me which platform you're using, I can give you more specific instructions with screenshots or links to exact pages!



