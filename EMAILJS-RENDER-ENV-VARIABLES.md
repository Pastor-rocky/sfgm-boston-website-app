# EmailJS Environment Variables for Render - Complete Setup

## ✅ Your Template IDs

- **Welcome Email**: `template_y1xqsgi`
- **Admin Registration Notification**: `template_kkrkvz2`
- **Essay Submission**: `template_tiz720r`
- **Birthday Email**: `template_wz5c7ls`

---

## 🔧 Environment Variables to Add to Render

Go to your Render dashboard → Your service → **Environment** tab → Add these variables:

### Variable 1: EMAIL_ENABLED

**Name:**
```
EMAIL_ENABLED
```

**Value:**
```
true
```

---

### Variable 2: EMAILJS_SERVICE_ID

**Name:**
```
EMAILJS_SERVICE_ID
```

**Value:**
```
service_bhhbgpr
```

---

### Variable 3: EMAILJS_PUBLIC_KEY

**Name:**
```
EMAILJS_PUBLIC_KEY
```

**Value:**
```
UPTEDM8MNxgzaRzV3
```

---

### Variable 4: EMAILJS_PRIVATE_KEY

**Name:**
```
EMAILJS_PRIVATE_KEY
```

**Value:**
```
_CGb6yqAMOm4208pq3q9E
```

---

### Variable 5: EMAILJS_TEMPLATE_ID

**Name:**
```
EMAILJS_TEMPLATE_ID
```

**Value:**
```
template_tiz720r
```

**Note:** This is the default template ID (used for essay submissions)

---

### Variable 6: EMAILJS_WELCOME_TEMPLATE_ID

**Name:**
```
EMAILJS_WELCOME_TEMPLATE_ID
```

**Value:**
```
template_y1xqsgi
```

---

### Variable 7: EMAILJS_ADMIN_TEMPLATE_ID

**Name:**
```
EMAILJS_ADMIN_TEMPLATE_ID
```

**Value:**
```
template_kkrkvz2
```

---

### Variable 8: EMAILJS_BIRTHDAY_TEMPLATE_ID

**Name:**
```
EMAILJS_BIRTHDAY_TEMPLATE_ID
```

**Value:**
```
template_wz5c7ls
```

---

### Variable 9: ESSAY_REVIEW_EMAIL

**Name:**
```
ESSAY_REVIEW_EMAIL
```

**Value:**
```
pastor_rocky@sfgmboston.com
```

---

## 📝 Quick Copy-Paste List

Here's all 9 variables in one place:

| Name | Value |
|------|-------|
| `EMAIL_ENABLED` | `true` |
| `EMAILJS_SERVICE_ID` | `service_bhhbgpr` |
| `EMAILJS_PUBLIC_KEY` | `UPTEDM8MNxgzaRzV3` |
| `EMAILJS_PRIVATE_KEY` | `_CGb6yqAMOm4208pq3q9E` |
| `EMAILJS_TEMPLATE_ID` | `template_tiz720r` |
| `EMAILJS_WELCOME_TEMPLATE_ID` | `template_y1xqsgi` |
| `EMAILJS_ADMIN_TEMPLATE_ID` | `template_kkrkvz2` |
| `EMAILJS_BIRTHDAY_TEMPLATE_ID` | `template_wz5c7ls` |
| `ESSAY_REVIEW_EMAIL` | `pastor_rocky@sfgmboston.com` |

---

## 🚀 Step-by-Step: Adding to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click on your service** (your website service)
3. **Click "Environment"** tab (in the left sidebar)
4. **Click "Add Environment Variable"** button
5. **For each variable above:**
   - Paste the **Name** in the "Key" field
   - Paste the **Value** in the "Value" field
   - Click **"Save Changes"**
6. **Repeat for all 9 variables**
7. **Render will automatically restart** your service after adding variables

---

## ✅ After Adding All Variables

1. Render will restart your service
2. Emails will start working automatically!
3. Test by:
   - Registering a new test account (should send welcome email + admin notification)
   - Submitting an essay (should send essay email to you)
   - Birthday emails will work when students have birthdays

---

## 🎉 You're All Set!

Once you add these 9 environment variables to Render, your email system will be fully functional!

**Need help?** Let me know once you've added them and I can help test or troubleshoot!

