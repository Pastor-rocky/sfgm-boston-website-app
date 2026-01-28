# 🔧 Fix Certificate Error - Try A Record Instead

## Problem
Domain is verified but certificate can't be issued. This sometimes happens with ALIAS records.

## Solution: Switch to A Record

Since ALIAS isn't working for certificate provisioning, let's try A Record instead.

---

## Step 1: Delete ALIAS Record

In Namecheap:
1. Go to Advanced DNS
2. Find the **ALIAS Record** for `@`
3. Click **"Remove"** to delete it

---

## Step 2: Add A Record

**Type:**
```
A Record
```

**Host:**
```
@
```

**Value:**
```
216.24.57.1
```

**TTL:**
```
Automatic
```

---

## Step 3: Keep CNAME for WWW

**Keep this record (don't change it):**

**Type:**
```
CNAME Record
```

**Host:**
```
www
```

**Value:**
```
sfgm-boston-website-app.onrender.com
```

**TTL:**
```
Automatic
```

---

## Step 4: Wait & Verify

1. **Wait 30-60 minutes** for DNS to update
2. **Go to Render dashboard**
3. **Click "Verify"** next to `sfgmboston.com` again
4. Certificate should start provisioning

---

## Final DNS Configuration

You should have:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 216.24.57.1 | Automatic |
| CNAME | www | sfgm-boston-website-app.onrender.com | Automatic |

---

## If Still Not Working After 1 Hour

Contact Render Support:
- They can manually provision the certificate
- Sometimes there are backend issues with certificate provisioning
- They can verify DNS is correct and force certificate generation

---

**Try switching to A Record - this often fixes certificate issues!** 🔒







