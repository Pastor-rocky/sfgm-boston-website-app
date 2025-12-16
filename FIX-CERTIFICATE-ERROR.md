# 🔧 Fix Certificate Error - DNS Troubleshooting

## Problem
Render can't issue SSL certificate because DNS records aren't configured correctly or haven't propagated.

## ✅ Step 1: Verify DNS Records in Namecheap

### Check Your Current Records

1. Go to Namecheap → Domain List → Manage → Advanced DNS
2. Look at your Host Records section
3. You should see:

**For Root Domain (sfgmboston.com):**
- Type: `ALIAS Record` or `A Record`
- Host: `@` (or blank)
- Value: `sfgm-boston-website-app.onrender.com` OR `216.24.57.1`

**For WWW (www.sfgmboston.com):**
- Type: `CNAME Record`
- Host: `www`
- Value: `sfgm-boston-website-app.onrender.com`

---

## 🔍 Step 2: Common Issues & Fixes

### Issue 1: Wrong Record Type

**Problem:** Using A Record with wrong IP or CNAME for root domain

**Fix:**
- Root domain (`@`): Use **ALIAS Record** pointing to `sfgm-boston-website-app.onrender.com`
- OR use **A Record** pointing to `216.24.57.1`
- WWW: Use **CNAME Record** pointing to `sfgm-boston-website-app.onrender.com`

### Issue 2: Multiple Records Conflict

**Problem:** Multiple A records or CNAME records for same host

**Fix:**
- Delete ALL old records for `@` and `www`
- Add ONLY the new records (one ALIAS/A for @, one CNAME for www)

### Issue 3: DNS Not Propagated

**Problem:** Records added but DNS hasn't propagated yet

**Fix:**
- Wait 30-60 minutes
- Check DNS propagation: https://dnschecker.org
- Type: `sfgmboston.com`, select `ALIAS` or `CNAME`
- Should show `sfgm-boston-website-app.onrender.com` worldwide

---

## ✅ Step 3: Correct DNS Configuration

### Delete Old Records First

1. In Namecheap Advanced DNS
2. Delete ANY existing records for:
   - `@` (root domain)
   - `www`
3. Make sure they're completely removed

### Add New Records

**Record 1 - Root Domain:**
- Type: `ALIAS Record` (preferred) OR `A Record`
- Host: `@`
- Value: `sfgm-boston-website-app.onrender.com` (for ALIAS) OR `216.24.57.1` (for A Record)
- TTL: `Automatic`

**Record 2 - WWW:**
- Type: `CNAME Record`
- Host: `www`
- Value: `sfgm-boston-website-app.onrender.com`
- TTL: `Automatic`

---

## ⏱️ Step 4: Wait & Verify

1. **Wait 30-60 minutes** after adding/changing records
2. **Check DNS propagation:**
   - Go to: https://dnschecker.org
   - Type: `sfgmboston.com`
   - Select: `ALIAS` or `CNAME`
   - Should show `sfgm-boston-website-app.onrender.com` in all locations

3. **Verify in Render:**
   - Go to Render dashboard
   - Click **"Verify"** next to your domain again
   - Should show "Domain Verified" and start provisioning certificate

---

## 🆘 Step 5: If Still Not Working

### Option A: Use A Record Instead of ALIAS

If ALIAS isn't working:

1. Delete the ALIAS record
2. Add A Record:
   - Type: `A Record`
   - Host: `@`
   - Value: `216.24.57.1`
   - TTL: `Automatic`
3. Wait 30 minutes
4. Click "Verify" in Render

### Option B: Contact Render Support

If DNS is correct but certificate still fails after 1 hour:
- Contact Render support
- They can manually verify and provision certificate

---

## 📋 Checklist

- [ ] Deleted all old DNS records for @ and www
- [ ] Added ALIAS Record for @ pointing to Render URL
- [ ] Added CNAME Record for www pointing to Render URL
- [ ] Waited 30-60 minutes for DNS propagation
- [ ] Checked DNS propagation on dnschecker.org
- [ ] Clicked "Verify" in Render dashboard
- [ ] Certificate provisioning started

---

**Follow these steps and the certificate should provision successfully!** 🔒

