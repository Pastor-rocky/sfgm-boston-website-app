# 🚀 Complete Render.com Deployment Guide
**SFGM Boston Bible School Website**

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your code pushed to GitHub
- ✅ Neon database set up (or ready to set up)
- ✅ Your Namecheap domain ready
- ✅ Environment variables prepared

---

## 🎯 STEP-BY-STEP: Deploy to Render

### **STEP 1: Sign Up / Log In to Render**

1. Go to https://dashboard.render.com/
2. Click **"Sign Up"** or **"Log In"**
3. Sign up with **GitHub** (recommended - easiest)

---

### **STEP 2: Create New Web Service**

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"** from the dropdown

---

### **STEP 3: Connect Your Repository**

1. **Connect Repository:**
   - If first time: Click **"Connect account"** to authorize Render
   - Select **GitHub** as your Git provider
   - Authorize Render to access your repositories

2. **Select Repository:**
   - Find and select: `SFGM Boston Website:App` (or your repo name)
   - Click **"Connect"**

---

### **STEP 4: Configure Your Service**

Fill in the service configuration:

#### **Basic Settings:**

- **Name:** `sfgm-boston-website` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)` or `Ohio (US East)`)
- **Branch:** `main` (or `master` if that's your default branch)
- **Root Directory:** Leave blank (or `/` if needed)
- **Runtime:** `Node`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

#### **Advanced Settings (Click to expand):**

- **Environment:** `Node`
- **Node Version:** `20` (or latest)
- **Auto-Deploy:** `Yes` (deploys automatically on git push)

---

### **STEP 5: Add Environment Variables**

Click **"Add Environment Variable"** and add these:

#### **Required Variables:**

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require
NODE_ENV=production
PORT=55555
```

#### **Optional Variables (if you use them):**

```
OPENAI_API_KEY=your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
SENTRY_DSN=your-sentry-dsn
EMAIL_ENABLED=true
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key
EMAILJS_PRIVATE_KEY=your-private-key
ESSAY_REVIEW_EMAIL=pastor_rocky@sfgmboston.com
```

**Important:** 
- Replace `DATABASE_URL` with your actual Neon connection string
- Never commit `.env` files to GitHub
- Add each variable one at a time

---

### **STEP 6: Choose Plan**

- **Free Plan:** Perfect for getting started
  - 750 hours/month (enough for 24/7)
  - 512 MB RAM
  - Spins down after 15 min inactivity (wakes on request)
  
- **Starter Plan ($7/month):** For production
  - Always on
  - 512 MB RAM
  - Better performance

**Recommendation:** Start with **Free** plan, upgrade later if needed.

---

### **STEP 7: Create Service**

1. Review all settings
2. Click **"Create Web Service"**
3. Render will start building your application

---

### **STEP 8: Monitor Build Process**

You'll see the build logs in real-time:

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

### **STEP 9: Get Your Render URL**

Once deployed, Render gives you a URL like:
- `https://sfgm-boston-website.onrender.com`

**Save this URL** - you'll use it for DNS configuration.

---

### **STEP 10: Test Your Deployment**

1. Visit your Render URL: `https://your-app.onrender.com`
2. Test health endpoint: `https://your-app.onrender.com/api/health`
3. Should see: `{"status":"ok","timestamp":"...","uptime":...}`

---

## 🔗 Connect Your Namecheap Domain

### **STEP 1: Add Custom Domain in Render**

1. In Render dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"** section
4. Click **"Add Custom Domain"**
5. Enter your domain: `yourdomain.com`
6. Click **"Save"**

Render will show you DNS instructions.

### **STEP 2: Configure DNS in Namecheap**

1. Log into Namecheap
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab

### **STEP 3: Add DNS Records**

**Option A: CNAME (Recommended)**

Add this record:
- **Type:** `CNAME Record`
- **Host:** `@` (or leave blank for root domain)
- **Value:** `your-app.onrender.com` (your Render URL without https://)
- **TTL:** `Automatic`

**For www subdomain:**
- **Type:** `CNAME Record`
- **Host:** `www`
- **Value:** `your-app.onrender.com`
- **TTL:** `Automatic`

**Option B: A Record (If CNAME doesn't work)**

Render will provide an IP address in the DNS instructions:
- **Type:** `A Record`
- **Host:** `@`
- **Value:** `[IP from Render]`
- **TTL:** `Automatic`

### **STEP 4: Wait for DNS Propagation**

- Usually takes 5-30 minutes
- Can take up to 48 hours (rare)
- Check with: https://dnschecker.org

### **STEP 5: SSL Certificate**

- Render automatically provisions SSL certificates
- Once DNS propagates, SSL activates automatically
- Your site will be: `https://yourdomain.com`

---

## 🗄️ Set Up Neon Database (If Not Done Yet)

### **Quick Setup:**

1. **Sign up:** https://neon.tech
2. **Create Project:**
   - Name: `sfgm-boston-prod`
   - Region: Closest to your users
3. **Get Connection String:**
   - Click "Connection Details"
   - Copy the connection string
4. **Push Schema:**
   ```bash
   # Update .env locally
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
   
   # Push schema
   npm run db:push
   ```
5. **Add to Render:**
   - Copy connection string to Render environment variables
   - Variable name: `DATABASE_URL`

---

## ✅ Post-Deployment Checklist

### **Immediate Checks:**

- [ ] Service is running (green status in Render)
- [ ] Render URL works: `https://your-app.onrender.com`
- [ ] Health endpoint works: `/api/health`
- [ ] Homepage loads correctly
- [ ] Database connection works

### **Functionality Tests:**

- [ ] User registration works
- [ ] User login works
- [ ] Course listing displays
- [ ] Course enrollment works
- [ ] Quiz submission works
- [ ] Data saves to database

### **Domain Tests:**

- [ ] Custom domain works: `https://yourdomain.com`
- [ ] SSL certificate active (green lock in browser)
- [ ] www subdomain works (if configured)
- [ ] No mixed content warnings

---

## 🔧 Render Dashboard Features

### **Logs:**
- View real-time logs
- Filter by build/runtime
- Download logs

### **Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times

### **Settings:**
- Environment variables
- Custom domains
- Auto-deploy settings
- Manual deploy

### **Manual Deploy:**
- Click "Manual Deploy" → "Deploy latest commit"
- Useful for testing

---

## 🆘 Troubleshooting

### **Build Fails:**

**Check:**
1. Build logs in Render dashboard
2. `package.json` has correct build script
3. Node version is correct (should be 20.x)
4. All dependencies are in `package.json`

**Common Issues:**
- Missing `build` script → Add to `package.json`
- Wrong Node version → Set in Render settings
- Missing dependencies → Check `package.json`

### **Service Won't Start:**

**Check:**
1. Runtime logs in Render
2. Environment variables are set
3. `DATABASE_URL` is correct
4. Port is set correctly (Render uses PORT env var)

**Common Issues:**
- Missing `DATABASE_URL` → Add to environment variables
- Port conflict → Render sets PORT automatically
- Database connection fails → Check Neon connection string

### **Domain Not Working:**

**Check:**
1. DNS records are correct in Namecheap
2. DNS has propagated (use dnschecker.org)
3. Custom domain added in Render
4. Wait 30 minutes for propagation

**Common Issues:**
- Wrong CNAME value → Should be your Render URL
- DNS not propagated → Wait longer
- SSL not provisioned → Wait for DNS first

### **Database Connection Errors:**

**Check:**
1. `DATABASE_URL` is correct in Render
2. Neon database is running
3. Connection string includes `?sslmode=require`
4. Database schema is pushed (`npm run db:push`)

---

## 💰 Render Pricing

### **Free Plan:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ✅ 100 GB bandwidth
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after spin-down takes ~30 seconds

### **Starter Plan ($7/month):**
- ✅ Always on
- ✅ 512 MB RAM
- ✅ 100 GB bandwidth
- ✅ Better performance

### **Professional Plans:**
- Start at $25/month
- More RAM and resources
- Better for high traffic

**Recommendation:** Start with Free, upgrade if you need always-on.

---

## 🔄 Updating Your Site

### **Automatic Deployments:**

Render automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Clones latest code
# 3. Runs npm install
# 4. Runs npm run build
# 5. Restarts service
```

### **Manual Deploy:**

1. In Render dashboard
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

---

## 📊 Monitoring & Maintenance

### **Set Up Monitoring:**

1. **Uptime Monitoring:**
   - Use UptimeRobot (free): https://uptimerobot.com
   - Monitor: `https://yourdomain.com/api/health`
   - Check every 5 minutes

2. **Error Tracking:**
   - Set up Sentry (free tier)
   - Add `SENTRY_DSN` to Render environment variables

### **View Logs:**

- Real-time logs in Render dashboard
- Filter by build/runtime
- Download for analysis

### **View Metrics:**

- CPU usage
- Memory usage
- Request count
- Response times

---

## 🎯 Quick Reference

### **Render Dashboard:**
https://dashboard.render.com/

### **Your Service URL:**
`https://your-app.onrender.com`

### **Health Check:**
`https://your-app.onrender.com/api/health`

### **Neon Dashboard:**
https://console.neon.tech/

### **Namecheap DNS:**
https://www.namecheap.com/myaccount/login/

---

## ✅ Success Checklist

- [ ] Render service created
- [ ] Build successful
- [ ] Service running (green status)
- [ ] Render URL works
- [ ] Database connected
- [ ] Environment variables set
- [ ] Custom domain added
- [ ] DNS configured in Namecheap
- [ ] SSL certificate active
- [ ] All functionality tested

---

**Last Updated:** Today  
**Status:** Ready for Deployment

