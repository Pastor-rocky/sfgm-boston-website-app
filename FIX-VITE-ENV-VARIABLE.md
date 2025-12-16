# Fix: VITE_R2_PUBLIC_URL Must Be Set at BUILD TIME

## The Problem

**Vite environment variables are replaced at BUILD TIME, not runtime!**

This means:
- ❌ Setting `VITE_R2_PUBLIC_URL` only at runtime won't work
- ✅ You must set it **during the build process**

If it's not set during build, the code will always use local files even if you set the variable later.

## How to Fix

### Option 1: Set Environment Variable in Deployment Platform (Recommended)

In your deployment platform (Render/Railway/etc.), add `VITE_R2_PUBLIC_URL` as an **environment variable** that's available during the **build phase**:

**Variable Name:** `VITE_R2_PUBLIC_URL`  
**Value:** `https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`

Most platforms automatically make environment variables available during build, but check your platform's settings.

### Option 2: Use .env.production File (Local Build)

If you're building locally and then deploying:

1. Create `.env.production` file in the project root:
   ```
   VITE_R2_PUBLIC_URL=https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder

### Option 3: Hardcode for Testing (Temporary)

If you need a quick test, we can temporarily hardcode the R2 URL in the code, but this is NOT recommended for production.

## Verify It's Working

After setting the variable and rebuilding:

1. Check browser console (F12)
2. Look for: `[Audio Storage] Using R2: https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev`
3. Or: `[Audio Storage] Generated R2 URL: ...`

If you see "Using local files" instead, the variable wasn't set during build.

## Which Deployment Platform Are You Using?

Different platforms handle build-time environment variables differently:

- **Render**: Environment variables are available during build automatically
- **Railway**: Environment variables are available during build automatically  
- **Vercel**: Use `.env.production` or set in dashboard
- **Netlify**: Set in site settings → Environment variables
- **Fly.io**: Set with `fly secrets set`
- **Self-hosted**: Export before build: `export VITE_R2_PUBLIC_URL=... && npm run build`

## Next Steps

1. Add `VITE_R2_PUBLIC_URL` to your deployment platform's environment variables
2. Trigger a new build
3. Check the browser console to verify it's using R2

If you tell me which platform you're using, I can give you platform-specific instructions!

