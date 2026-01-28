# 🔗 Connect sfgmboston.com to Render - Step-by-Step

## Your Domain: `sfgmboston.com`

## 📋 DNS Records to Add in Namecheap

### Record 1: Root Domain (sfgmboston.com)

**Type:** `ALIAS Record` (or `ANAME Record` if available)

**Host:** `@` (or leave blank - this means root domain)

**Value:** `sfgm-boston-website-app.onrender.com`

**TTL:** `Automatic`

---

### Record 2: WWW Subdomain (www.sfgmboston.com)

**Type:** `CNAME Record`

**Host:** `www`

**Value:** `sfgm-boston-website-app.onrender.com`

**TTL:** `Automatic`

---

## 🎯 Step-by-Step Instructions

### Step 1: Log into Namecheap

1. Go to: https://www.namecheap.com/myaccount/login/
2. Log in with your credentials

### Step 2: Go to Domain Management

1. Click **"Domain List"** (top menu)
2. Find **`sfgmboston.com`**
3. Click **"Manage"** button next to it

### Step 3: Go to Advanced DNS

1. Click **"Advanced DNS"** tab
2. Scroll down to **"Host Records"** section

### Step 4: Add ALIAS Record for Root Domain

1. Click **"Add New Record"** button
2. Select **"ALIAS Record"** from the Type dropdown
   - If you don't see "ALIAS Record", look for **"ANAME Record"**
   - If neither exists, use **"A Record"** with IP: `216.24.57.1`
3. **Host:** Type `@` (or leave blank)
4. **Value:** `sfgm-boston-website-app.onrender.com`
5. **TTL:** Select `Automatic` (or `30 min`)
6. Click **"Save"** (checkmark icon)

### Step 5: Add CNAME Record for WWW

1. Click **"Add New Record"** button again
2. Select **"CNAME Record"** from the Type dropdown
3. **Host:** Type `www`
4. **Value:** `sfgm-boston-website-app.onrender.com`
5. **TTL:** Select `Automatic` (or `30 min`)
6. Click **"Save"** (checkmark icon)

### Step 6: Remove Old Records (If Any)

- If you see any old A records or CNAME records for `@` or `www`, delete them first
- Only keep the new ALIAS and CNAME records you just added

---

## ✅ What Your DNS Should Look Like

After adding, you should have:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| ALIAS | @ | sfgm-boston-website-app.onrender.com | Automatic |
| CNAME | www | sfgm-boston-website-app.onrender.com | Automatic |

---

## ⏱️ After Adding Records

1. **Wait 5-30 minutes** for DNS propagation
2. **Go back to Render** → Click **"Verify"** next to your domain
3. Render will check DNS and provision SSL certificate
4. Your site will be live at: `https://sfgmboston.com`

---

## 🔍 Verify DNS Propagation

Check if DNS has propagated:
- Go to: https://dnschecker.org
- Type: `sfgmboston.com`
- Select: `ALIAS` or `CNAME`
- Check worldwide - should show your Render URL

---

## 🆘 If ALIAS Record Not Available

If Namecheap doesn't show "ALIAS Record" option:

**Use A Record instead:**

1. **Type:** `A Record`
2. **Host:** `@` (or leave blank)
3. **Value:** `216.24.57.1` (IP address from Render)
4. **TTL:** `Automatic`

**Note:** A Record works, but ALIAS is better because it automatically updates if Render's IP changes.

---

## ✅ After DNS Propagates

1. Render will automatically provision SSL certificate
2. Your site will be: `https://sfgmboston.com`
3. Both `sfgmboston.com` and `www.sfgmboston.com` will work

---

**Follow these steps and your domain will be connected!** 🚀







