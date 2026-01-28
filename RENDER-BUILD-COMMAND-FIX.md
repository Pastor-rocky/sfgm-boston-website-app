# 🔧 Render Build Command Fix

## Problem
Render isn't installing devDependencies (vite is in devDependencies), so build fails.

## Solution
Updated build script to explicitly install devDependencies.

## Update Render Build Command

### In Render Dashboard:

1. Go to your service: `sfgm-boston-website-app`
2. Click **"Settings"** tab
3. Find **"Build Command"**
4. Change it to:
   ```
   npm install --include=dev && npm run build
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## What This Does

- `npm install --include=dev` - Installs ALL dependencies including devDependencies (vite, esbuild, etc.)
- `npm run build` - Runs the build script which now includes the install step

---

## Alternative: Keep Current Build Command

If you keep `npm install && npm run build`, the updated package.json will handle it, but the explicit `--include=dev` is safer.

---

**Update Render's build command to:** `npm install --include=dev && npm run build`







