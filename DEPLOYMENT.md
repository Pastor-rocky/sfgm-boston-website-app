# SFGM Boston Bible School - Deployment Guide

This guide covers the complete deployment process for the SFGM Boston Bible School website.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Build Process](#build-process)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Required Information
- [ ] Database connection string (PostgreSQL)
- [ ] Production domain name
- [ ] SSL certificate (if self-hosting)
- [ ] API keys for optional services (OpenAI, Azure TTS, etc.)

### Code Preparation
- [ ] All tests passing (if applicable)
- [ ] Code reviewed and merged to main branch
- [ ] Environment variables documented
- [ ] Database migrations ready

---

## Environment Setup

### 1. Create Production Environment File

```bash
# Copy the production template
cp env.production.template .env.production

# Edit with your production values
nano .env.production  # or use your preferred editor
```

### 2. Required Environment Variables

**MUST HAVE:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production` - Set to production mode
- `PORT` - Server port (usually 80, 443, or provided by hosting)

**OPTIONAL (but recommended):**
- `OPENAI_API_KEY` - For TTS features
- `SENTRY_DSN` - For error tracking
- Other API keys as needed

### 3. Verify Environment

```bash
# Check that DATABASE_URL is set
node -e "require('dotenv').config({ path: '.env.production' }); console.log(process.env.DATABASE_URL ? 'OK' : 'MISSING')"
```

---

## Database Setup

### 1. Run Database Migrations

```bash
# Push schema changes to database
npm run db:push

# Or if using migrations:
# Apply migration files in order
# psql $DATABASE_URL < migrations/0000_neat_raza.sql
# psql $DATABASE_URL < migrations/0001_add_quiz_indexes.sql
```

### 2. Verify Database Connection

```bash
# Test connection
node -e "
  import('./server/db.js').then(({ db }) => {
    db.execute('SELECT 1').then(() => {
      console.log('✅ Database connection successful');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Database connection failed:', err);
      process.exit(1);
    });
  });
"
```

### 3. Create Database Backup

```bash
# Create initial backup before deployment
npm run backup-quizzes -- --output=./backups/pre-deployment
```

---

## Build Process

### 1. Install Dependencies

```bash
# Install all dependencies
npm ci  # Use ci for production (clean install)
```

### 2. Build Application

```bash
# Build both client and server
npm run build
```

This will:
- Build the React frontend with Vite
- Bundle the Express server with esbuild
- Output to `dist/` directory

### 3. Verify Build

```bash
# Check that dist/ directory exists and has content
ls -la dist/
ls -la dist/public/
```

---

## Deployment Steps

### Option A: Traditional Server Deployment

#### 1. Transfer Files

```bash
# Copy files to server (example using rsync)
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '*.log' \
  ./ user@your-server:/var/www/sfgm-boston/
```

#### 2. Install Production Dependencies

```bash
# On server
cd /var/www/sfgm-boston
npm ci --production  # Only production dependencies
```

#### 3. Set Environment Variables

```bash
# On server - set environment variables
export DATABASE_URL="postgresql://..."
export NODE_ENV="production"
export PORT="55555"
# ... other variables
```

Or use a `.env.production` file (ensure it's not committed to git).

#### 4. Start Application

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name sfgm-boston

# Or using systemd
# Create /etc/systemd/system/sfgm-boston.service
# See systemd service example below
```

#### 5. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:55555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option B: Platform-as-a-Service (PaaS)

#### Vercel / Netlify / Railway

1. Connect your Git repository
2. Set environment variables in platform dashboard
3. Configure build command: `npm run build`
4. Configure start command: `npm start`
5. Deploy

#### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 55555
CMD ["node", "dist/index.js"]
```

```bash
# Build and run
docker build -t sfgm-boston .
docker run -p 55555:55555 --env-file .env.production sfgm-boston
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Basic health check
curl https://your-domain.com/api/health

# Detailed health check
curl https://your-domain.com/api/health/detailed

# Uptime check
curl https://your-domain.com/api/uptime
```

Expected responses:
- `/api/health`: `{"status":"ok","timestamp":"...","uptime":...}`
- `/api/health/detailed`: Full system status including database
- `/api/uptime`: Server uptime information

### 2. Functional Tests

- [ ] Homepage loads
- [ ] User registration works
- [ ] User login works
- [ ] Course listing displays
- [ ] Quiz submission works
- [ ] Quiz data persists correctly

### 3. Database Verification

```bash
# Check quiz attempts are being saved
curl https://your-domain.com/api/quizzes/export?format=json | jq '.totalAttempts'
```

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

#### Health Check Monitoring
- Set up cron job or monitoring service to ping `/api/health` every 5 minutes
- Alert if status is not "ok"

#### Error Tracking
- Configure Sentry (if `SENTRY_DSN` is set)
- Monitor quiz submission failures via `/api/quizzes/monitoring/stats`

### 2. Scheduled Backups

#### Quiz Data Backups

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cd /var/www/sfgm-boston && npm run backup-quizzes -- --output=/backups/quiz-data
```

#### Database Backups

```bash
# PostgreSQL backup (example)
0 3 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql
```

### 3. Log Management

```bash
# If using PM2
pm2 logs sfgm-boston

# Rotate logs
pm2 install pm2-logrotate
```

### 4. Performance Monitoring

- Monitor `/api/health/detailed` for response times
- Check database query performance
- Monitor memory usage
- Set up alerts for high error rates

---

## Troubleshooting

### Application Won't Start

1. Check environment variables are set correctly
2. Verify database connection: `curl http://localhost:55555/api/health/detailed`
3. Check logs: `pm2 logs` or `journalctl -u sfgm-boston`
4. Verify port is not in use: `lsof -i :55555`

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is accessible from server
3. Verify database user has correct permissions
4. Check firewall rules

### Quiz Data Not Saving

1. Check quiz monitoring: `curl http://localhost:55555/api/quizzes/monitoring/stats`
2. Verify database indexes are created: Check migration `0001_add_quiz_indexes.sql`
3. Check application logs for errors
4. Verify transaction logs in database

### High Memory Usage

1. Check `/api/health/detailed` for memory stats
2. Restart application if needed: `pm2 restart sfgm-boston`
3. Consider increasing server resources
4. Check for memory leaks in logs

---

## Rollback Procedure

If deployment fails:

1. **Stop new version:**
   ```bash
   pm2 stop sfgm-boston
   ```

2. **Restore previous version:**
   ```bash
   git checkout previous-stable-tag
   npm ci
   npm run build
   pm2 restart sfgm-boston
   ```

3. **Restore database (if needed):**
   ```bash
   psql $DATABASE_URL < backups/pre-deployment-backup.sql
   ```

---

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Database uses SSL/TLS connection
- [ ] API keys are stored securely
- [ ] HTTPS is enabled (SSL certificate configured)
- [ ] Firewall rules are configured
- [ ] Regular security updates are applied
- [ ] Database backups are encrypted
- [ ] Access logs are monitored

---

## Support

For issues or questions:
- Check application logs
- Review health endpoints
- Check quiz monitoring stats
- Review database connection status

---

**Last Updated:** Phase 5 - Deployment & Operations
**Version:** 1.0


