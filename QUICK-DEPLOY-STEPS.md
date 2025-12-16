# ⚡ Quick Deployment Steps (TL;DR)

## Fastest Path to Production

### 1. Database (5 minutes)
```bash
# Sign up: https://neon.tech
# Create project → Copy connection string
# Update .env.production:
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require

# Push schema:
npm run db:push
```

### 2. Hosting (10 minutes)
```bash
# Sign up: https://railway.app
# New Project → Deploy from GitHub
# Select your repo
# Add environment variables:
DATABASE_URL=your-neon-connection-string
NODE_ENV=production
PORT=55555

# Railway auto-deploys!
```

### 3. Domain (5 minutes)
```bash
# In Railway: Settings → Networking → Generate Domain
# In Namecheap: Advanced DNS → Add CNAME:
#   Host: @
#   Value: your-app.up.railway.app
#   TTL: Automatic

# In Railway: Add Custom Domain → yourdomain.com
# Wait 15-30 minutes for DNS
```

### 4. Test (2 minutes)
```bash
# Visit: https://yourdomain.com
# Test: https://yourdomain.com/api/health
# Should see: {"status":"ok",...}
```

**Total Time: ~30 minutes**  
**Cost: $0/month (free tier)**

---

## What You Need

- [ ] GitHub account (free)
- [ ] Neon account (free)
- [ ] Railway account (free)
- [ ] Namecheap domain
- [ ] 30 minutes

---

## That's It! 🎉

Your website will be live at: `https://yourdomain.com`

