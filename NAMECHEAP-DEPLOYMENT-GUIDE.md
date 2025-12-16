# 🚀 Complete Namecheap Deployment Guide
**SFGM Boston Bible School Website**

---

## ⚠️ IMPORTANT: Namecheap Hosting Limitations

**Namecheap Shared Hosting does NOT support Node.js applications.** Your website requires:
- Node.js runtime (for Express backend)
- Ability to run `npm` commands
- Process management (PM2 or similar)

### Your Options:

**Option 1: Namecheap VPS** (Recommended if staying with Namecheap)
- Full server control
- Can install Node.js
- More technical setup required
- **Cost:** ~$6-20/month

**Option 2: Railway/Render** (Easiest - Recommended)
- Built for Node.js apps
- Automatic deployments from Git
- Free tier available
- **Cost:** Free-$5/month
- **Best for:** Quick deployment

**Option 3: Namecheap Domain + Separate Hosting**
- Keep domain at Namecheap
- Host app on Railway/Render/Vercel
- **Cost:** Domain + $0-5/month hosting

---

## 🎯 RECOMMENDED APPROACH (Easiest & Best)

### **Use Railway.app for Hosting + Namecheap for Domain**

**Why Railway?**
- ✅ Built for Node.js/Express apps
- ✅ Free tier (500 hours/month)
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL option (or use Neon)
- ✅ SSL included
- ✅ Zero configuration needed

---

## 📋 STEP-BY-STEP DEPLOYMENT GUIDE

### **PHASE 1: Database Setup (Do This First)**

#### **Step 1: Choose Your Database**

**RECOMMENDED: Neon PostgreSQL** (Best Choice)
- ✅ Free tier: 0.5 GB storage
- ✅ Serverless (scales automatically)
- ✅ Perfect for PostgreSQL apps
- ✅ Easy to set up
- ✅ Connection pooling included

**Alternative: Supabase**
- Also free tier
- More features (auth, storage)
- Good if you need extras

#### **Step 2: Set Up Neon Database**

1. **Sign up for Neon:**
   - Go to https://neon.tech
   - Click "Sign Up" (use GitHub/Google)
   - Free tier is perfect to start

2. **Create a New Project:**
   - Click "Create Project"
   - Name it: `sfgm-boston-prod`
   - Choose region closest to your users (US East)
   - Click "Create Project"

3. **Get Connection String:**
   - In your project dashboard, click "Connection Details"
   - Copy the **"Connection string"** (it looks like):
     ```
     postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **SAVE THIS** - you'll need it later!

4. **Set Up Database Schema:**
   ```bash
   # In your local project, update .env with Neon connection string
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   
   # Push schema to Neon database
   npm run db:push
   ```

5. **Verify Connection:**
   ```bash
   # Test the connection
   node -e "
   import('./server/db.js').then(({ db }) => {
     db.execute('SELECT 1').then(() => {
       console.log('✅ Database connected!');
       process.exit(0);
     }).catch(err => {
       console.error('❌ Connection failed:', err);
       process.exit(1);
     });
   });
   "
   ```

---

### **PHASE 2: Prepare Your Code**

#### **Step 1: Create Production Environment File**

```bash
# Copy the template
cp env.production.template .env.production
```

#### **Step 2: Update .env.production**

```env
# REQUIRED - Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# REQUIRED - Server
NODE_ENV=production
PORT=55555

# Optional - Add your API keys if needed
OPENAI_API_KEY=your-key-here
DEEPSEEK_API_KEY=your-key-here
```

#### **Step 3: Test Production Build Locally**

```bash
# Build the application
npm run build

# Test it works
NODE_ENV=production node dist/index.js

# Should see: "serving on port 55555"
# Press Ctrl+C to stop
```

#### **Step 4: Push Code to GitHub**

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

---

### **PHASE 3: Deploy to Railway**

#### **Step 1: Sign Up for Railway**

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (easiest)

#### **Step 2: Create New Project**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub
4. Select your repository: `SFGM Boston Website:App`
5. Click "Deploy Now"

#### **Step 3: Configure Environment Variables**

1. In Railway dashboard, click on your project
2. Click on the service (your app)
3. Go to "Variables" tab
4. Add these variables:

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=55555
```

(Add any other API keys you need)

#### **Step 4: Configure Build Settings**

1. In Railway, go to "Settings" → "Build"
2. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** `/` (default)

#### **Step 5: Generate Domain**

1. In Railway, go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Railway will give you a domain like: `your-app.up.railway.app`
4. **Save this domain** - you'll use it for DNS

#### **Step 6: Wait for Deployment**

- Railway will automatically:
  - Install dependencies
  - Run `npm run build`
  - Start your app
- Watch the logs in Railway dashboard
- Should see: "serving on port 55555"

#### **Step 7: Test Your Deployment**

1. Visit your Railway domain: `https://your-app.up.railway.app`
2. Test the health endpoint: `https://your-app.up.railway.app/api/health`
3. Should see: `{"status":"ok",...}`

---

### **PHASE 4: Connect Namecheap Domain**

#### **Step 1: Get Railway IP Address**

1. In Railway, go to "Settings" → "Networking"
2. Note your Railway domain (e.g., `your-app.up.railway.app`)

#### **Step 2: Configure DNS in Namecheap**

1. Log into Namecheap
2. Go to "Domain List"
3. Click "Manage" next to your domain
4. Go to "Advanced DNS" tab

#### **Step 3: Add DNS Records**

Add these records:

**Option A: CNAME Record (Recommended)**
- **Type:** CNAME Record
- **Host:** `@` (or `www`)
- **Value:** `your-app.up.railway.app`
- **TTL:** Automatic

**Option B: A Record (If CNAME doesn't work)**
- Get Railway's IP (contact Railway support or use dig)
- **Type:** A Record
- **Host:** `@`
- **Value:** `[Railway IP]`
- **TTL:** Automatic

#### **Step 4: Configure Custom Domain in Railway**

1. In Railway, go to "Settings" → "Networking"
2. Under "Custom Domains", click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Railway will give you DNS instructions
5. Add the CNAME record it provides to Namecheap

#### **Step 5: Wait for DNS Propagation**

- DNS changes take 5 minutes to 48 hours
- Usually takes 15-30 minutes
- Check with: https://dnschecker.org

#### **Step 6: SSL Certificate**

- Railway automatically provisions SSL certificates
- Once DNS propagates, SSL will be active
- Your site will be: `https://yourdomain.com`

---

### **PHASE 5: Post-Deployment Verification**

#### **Step 1: Test All Critical Features**

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] Health check works: `https://yourdomain.com/api/health`
- [ ] User registration works
- [ ] User login works
- [ ] Course listing displays
- [ ] Course enrollment works
- [ ] Quiz submission works
- [ ] Database saves data correctly

#### **Step 2: Set Up Monitoring**

1. **Health Check Monitoring:**
   - Use UptimeRobot (free): https://uptimerobot.com
   - Monitor: `https://yourdomain.com/api/health`
   - Set to check every 5 minutes

2. **Error Tracking (Optional):**
   - Set up Sentry (free tier available)
   - Add `SENTRY_DSN` to Railway environment variables

#### **Step 3: Set Up Backups**

**Database Backups (Neon):**
- Neon automatically backs up your database
- Free tier: 7-day point-in-time recovery
- No action needed!

**Application Backups:**
- Your code is in GitHub (backed up)
- Railway keeps deployment history

---

## 🔄 ALTERNATIVE: Namecheap VPS Deployment

If you prefer to use Namecheap VPS instead:

### **Step 1: Purchase Namecheap VPS**

1. Go to Namecheap → VPS Hosting
2. Choose plan (minimum 1GB RAM recommended)
3. Select Ubuntu 22.04 LTS
4. Complete purchase

### **Step 2: Set Up Server**

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Git
apt install -y git
```

### **Step 3: Deploy Application**

```bash
# Create app directory
mkdir -p /var/www/sfgm-boston
cd /var/www/sfgm-boston

# Clone your repository
git clone https://github.com/your-username/your-repo.git .

# Install dependencies
npm ci --production

# Build application
npm run build

# Create .env file
nano .env
# Paste your production environment variables
# Save and exit (Ctrl+X, Y, Enter)
```

### **Step 4: Start Application**

```bash
# Start with PM2
pm2 start dist/index.js --name sfgm-boston

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### **Step 5: Configure Nginx**

```bash
# Create Nginx config
nano /etc/nginx/sites-available/sfgm-boston
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:55555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/sfgm-boston /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### **Step 6: Set Up SSL**

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts (enter email, agree to terms)
# Certbot will automatically configure SSL
```

---

## 📊 Cost Comparison

### **Option 1: Railway + Neon (Recommended)**
- Railway: **Free** (500 hours/month) or $5/month
- Neon Database: **Free** (0.5GB) or $19/month
- Domain (Namecheap): ~$10-15/year
- **Total: $0-5/month** (free tier) or **$24/month** (paid)

### **Option 2: Namecheap VPS**
- VPS: $6-20/month
- Domain: ~$10-15/year
- **Total: $6-20/month**

### **Option 3: Render + Neon**
- Render: Free tier or $7/month
- Neon: Free tier or $19/month
- Domain: ~$10-15/year
- **Total: $0-7/month** (free tier) or **$26/month** (paid)

---

## ✅ Quick Start Checklist

- [ ] Set up Neon database account
- [ ] Create Neon project and get connection string
- [ ] Run `npm run db:push` to create schema
- [ ] Create `.env.production` file
- [ ] Test build locally: `npm run build && npm start`
- [ ] Push code to GitHub
- [ ] Sign up for Railway
- [ ] Deploy from GitHub on Railway
- [ ] Add environment variables in Railway
- [ ] Get Railway domain
- [ ] Configure DNS in Namecheap
- [ ] Add custom domain in Railway
- [ ] Wait for DNS propagation
- [ ] Test website functionality
- [ ] Set up monitoring

---

## 🆘 Troubleshooting

### **Database Connection Issues**

```bash
# Test connection
node -e "
import('./server/db.js').then(({ db }) => {
  db.execute('SELECT 1').then(() => {
    console.log('✅ Connected');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
});
"
```

### **Build Fails on Railway**

- Check Railway logs
- Ensure `package.json` has correct build script
- Verify Node.js version (should be 20.x)

### **App Won't Start**

- Check environment variables are set
- Verify `DATABASE_URL` is correct
- Check Railway logs for errors

### **DNS Not Working**

- Wait 30 minutes for propagation
- Check DNS with: https://dnschecker.org
- Verify CNAME record is correct

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Neon Docs:** https://neon.tech/docs
- **Namecheap Support:** https://www.namecheap.com/support/

---

## 🎯 RECOMMENDED PATH FORWARD

**For easiest deployment:**
1. ✅ Use **Neon** for database (free tier)
2. ✅ Use **Railway** for hosting (free tier)
3. ✅ Keep domain at **Namecheap**
4. ✅ Connect domain to Railway via DNS

**This gives you:**
- Zero server management
- Automatic SSL
- Free tier to start
- Easy scaling later
- Professional setup

**Estimated Time:** 1-2 hours for complete setup

---

**Last Updated:** Today  
**Status:** Ready for Production Deployment

