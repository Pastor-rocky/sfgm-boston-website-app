# 🚀 Complete Step-by-Step Render Deployment Guide

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ GitHub repository: `sfgm-boston-website-app` (already done!)
- ✅ Neon database connection string (already have!)
- ✅ Render account (sign up at https://render.com if needed)

---

## STEP 1: Sign Up / Log In to Render

1. Go to: **https://dashboard.render.com/**
2. Click **"Sign Up"** or **"Log In"**
3. Sign up with **GitHub** (recommended - easiest)

---

## STEP 2: Create New Web Service

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"** from the dropdown

---

## STEP 3: Connect Your GitHub Repository

1. **Connect Repository:**
   - If first time: Click **"Connect account"** or **"Configure account"**
   - Select **GitHub** as your Git provider
   - Authorize Render to access your repositories
   - You may need to select which repositories Render can access

2. **Select Repository:**
   - Find and select: **`sfgm-boston-website-app`**
   - Click **"Connect"**

---

## STEP 4: Configure Your Service

Fill in these settings **exactly**:

### Basic Settings:

- **Name:** `sfgm-boston-website` (or your preferred name)
- **Region:** `Virginia (US East)` or closest to your users
- **Branch:** `main`
- **Root Directory:** (leave blank - empty)
- **Language:** **Click dropdown and select "Node"** (NOT Python!)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Instance Type:

- Select: **"Free"** (to start, you can upgrade later)

---

## STEP 5: Add Environment Variables

**IMPORTANT:** Add these BEFORE clicking "Deploy web service"

Click **"Add Environment Variable"** and add these **one by one**:

### Variable 1: Database URL

- **Name:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_lAvmtxr7R6ED@ep-ancient-shadow-a42j3ko0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
- Click **"Save"**

### Variable 2: Node Environment

- **Name:** `NODE_ENV`
- **Value:** `production`
- Click **"Save"**

### Variable 3: Port

- **Name:** `PORT`
- **Value:** `55555`
- Click **"Save"**

**Verify:** You should see all 3 variables listed before proceeding.

---

## STEP 6: Deploy Your Service

1. **Review all settings:**
   - ✅ Language is "Node" (not Python)
   - ✅ Build Command: `npm run build`
   - ✅ Start Command: `npm start`
   - ✅ All 3 environment variables added

2. **Click:** **"Create Web Service"** (or "Deploy web service")

---

## STEP 7: Monitor Build Process

You'll see the build logs in real-time:

**What to expect:**
```
✓ Cloning repository
✓ Installing dependencies
✓ Running build command: npm run build
✓ Starting service: npm start
```

**Build Time:** Usually 3-5 minutes

**Watch for:**
- ✅ "Build successful"
- ✅ "Your service is live at: https://your-app.onrender.com"

---

## STEP 8: Get Your Render URL

Once deployed, Render gives you a URL like:
- `https://sfgm-boston-website.onrender.com`

**Save this URL** - you'll use it for DNS configuration later.

---

## STEP 9: Test Your Deployment

1. Visit your Render URL: `https://your-app.onrender.com`
2. Test health endpoint: `https://your-app.onrender.com/api/health`
3. Should see: `{"status":"ok","timestamp":"...","uptime":...}`

---

## ✅ Success Checklist

- [ ] Service created on Render
- [ ] Build successful (green status)
- [ ] Service running (green status)
- [ ] Render URL works
- [ ] Health endpoint works: `/api/health`
- [ ] Homepage loads
- [ ] Database connected (no errors in logs)

---

## 🆘 Troubleshooting

### Build Fails:

**Check:**
1. Build logs in Render dashboard
2. Language is "Node" (not Python)
3. Build command: `npm run build`
4. Start command: `npm start`

### Service Won't Start:

**Check:**
1. Runtime logs in Render
2. Environment variables are set correctly
3. `DATABASE_URL` is correct
4. No errors in logs

### Database Connection Errors:

**Check:**
1. `DATABASE_URL` is correct in Render
2. Neon database is running
3. Connection string includes `?sslmode=require`

---

## 🎯 Next Steps After Deployment

1. ✅ Test your website
2. ✅ Connect your Namecheap domain (I'll help with this)
3. ✅ Set up SSL (automatic with Render)

---

**Ready?** Follow these steps and let me know when you get to Step 9 (testing)!




