# 🧪 How to Test Your Email System

## ✅ Quick Test Methods (Choose One)

### Method 1: Register a Test Account (Recommended - 2 minutes)

**This tests Welcome Email + Admin Notification:**

1. Go to your website registration page
2. Register a new test account with your email (or a test email)
3. **Check immediately:**
   - ✅ Your test email inbox → Should receive welcome email
   - ✅ pastor_rocky@sfgmboston.com → Should receive admin notification
4. **If emails arrive:** System is working! ✅
5. **If no emails:** Check Render logs (see Method 3 below)

**Pros:** Tests real registration flow, most realistic
**Time:** 2-3 minutes

---

### Method 2: Check Render Logs (1 minute)

**Check if emails are being sent:**

1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Look for these messages:
   - ✅ `[email] Email sent successfully` = Working!
   - ❌ `[email] Failed to deliver` = Problem
   - ❌ `Missing EmailJS configuration` = Variables not set correctly
   - ❌ `Email delivery disabled` = EMAIL_ENABLED not set to true

**To trigger logs:** Register a test account first, then check logs

**Pros:** Shows exactly what's happening
**Time:** 1 minute

---

### Method 3: Check EmailJS Dashboard (1 minute)

**See if emails are actually being sent:**

1. Go to: https://dashboard.emailjs.com/
2. Click **"Email Logs"** or **"Activity"** (varies by version)
3. You should see sent emails listed there
4. Shows: When sent, to whom, status

**Pros:** Confirms EmailJS is receiving and sending
**Time:** 1 minute

---

### Method 4: Check Your Email Inbox

**For Admin Notifications:**

1. Check **pastor_rocky@sfgmboston.com** inbox
2. Look for recent emails from "SFGM Boston"
3. If you see admin notifications → System working! ✅

**For Welcome Emails:**

1. Register a test account using an email you can access
2. Check that email's inbox
3. Should receive welcome email within seconds

---

## 🚀 Fastest Test (Right Now)

**Do this now:**

1. **Open your website** in a browser
2. **Register a test account** using an email you can check
3. **Immediately check:**
   - Your test email inbox
   - pastor_rocky@sfgmboston.com inbox
4. **Also check Render logs** for any errors

**Total time: 3 minutes**

---

## 🔍 What to Look For

### ✅ Success Signs:
- Email arrives in inbox within 10-30 seconds
- Render logs show: `[email] Email sent successfully`
- EmailJS dashboard shows email sent
- Email has correct student information filled in

### ❌ Problem Signs:
- No email after 1-2 minutes
- Render logs show errors
- EmailJS dashboard shows no activity
- Render logs show "Missing EmailJS configuration"

---

## 🛠️ If Emails Don't Arrive

### Check 1: Environment Variables
- Go to Render → Environment tab
- Verify all 9 variables are there
- Check spelling (case-sensitive!)

### Check 2: EMAIL_ENABLED
- Must be exactly: `true` (not "true" or True)
- Check Render environment variables

### Check 3: Render Logs
- Look for specific error messages
- Copy error message and we can fix it

### Check 4: EmailJS Dashboard
- Check if service is connected
- Check if templates exist
- Check API usage/quota

---

## 📝 Quick Test Checklist

- [ ] Register test account
- [ ] Check test email inbox
- [ ] Check pastor_rocky@sfgmboston.com inbox
- [ ] Check Render logs for email messages
- [ ] Check EmailJS dashboard for sent emails

---

## 💡 Pro Tip

**Best way to test:** Register a test account right now, then check all 4 places:
1. Test email inbox
2. Admin email inbox  
3. Render logs
4. EmailJS dashboard

If you see emails in any of these places, **it's working!** ✅

