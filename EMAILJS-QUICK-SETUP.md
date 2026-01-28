# EmailJS Quick Setup - Get Your API Keys

## ✅ Step 1: Get Your API Keys (Public Key & Private Key)

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/
2. **Click on "Account"** in the left sidebar (or top menu)
3. **Go to "General"** tab
4. **Find "API Keys"** section

You'll see:
- **Public Key** (also called User ID) - starts with `user_` (e.g., `user_abc123xyz`)
- **Private Key** - a longer string (keep this secret!)

**Copy both of these** - you'll need them for the environment variables.

---

## ✅ Step 2: Create Email Templates

You need to create 4 email templates. Here's how:

### Template 1: Welcome Email

1. Go to **"Email Templates"** in EmailJS dashboard
2. Click **"Create New Template"**
3. **Template Name**: `Welcome Email`
4. **Subject**: `Welcome to SFGM Boston Bible School, {{first_name}}!`
5. **Content** (paste this):

```
Hello {{first_name}} {{last_name}},

Welcome to SFGM Boston Bible School! We're excited to have you join our community.

Your account details:
- Username: {{username}}
- Email: {{email}}
- Registration Date: {{registration_date}} at {{registration_time}}

Get started by visiting your dashboard and enrolling in your first course.

Blessings,
SFGM Boston Bible School Team
```

6. Click **"Save"**
7. **Copy the Template ID** (shown at the top, e.g., `template_abc123`)

### Template 2: Admin Registration Notification

1. Click **"Create New Template"** again
2. **Template Name**: `Admin Registration Notification`
3. **Subject**: `New Student Registration: {{first_name}} {{last_name}}`
4. **Content**:

```
New Student Registration

Student Details:
- Name: {{first_name}} {{last_name}}
- Email: {{email}}
- Username: {{username}}
- Registration Date: {{registration_date}} at {{registration_time}}
- Email Consent: {{email_consent}}

Please review the new registration in the admin dashboard.
```

5. **Save** and copy the **Template ID**

### Template 3: Essay Submission Email

1. Click **"Create New Template"**
2. **Template Name**: `Essay Submission`
3. **Subject**: `Final Exam Essay Submission - {{course_title}}`
4. **Content**:

```
Final Exam Essay Submission

Student: {{student_name}} ({{student_email}})
Course: {{course_title}}
Quiz ID: {{quiz_id}}
Question ID: {{question_id}}
Word Count: {{word_count}}
Submitted: {{submitted_at}}

Essay Text:
{{essay_text}}

---
Please review this essay submission in the admin dashboard.
```

5. **Save** and copy the **Template ID**

### Template 4: Birthday Email (Optional)

1. Click **"Create New Template"**
2. **Template Name**: `Birthday Email`
3. **Subject**: `🎉 Happy Birthday {{first_name}}!`
4. **Content**:

```
Happy Birthday {{first_name}}!

We're blessed to have you as part of our SFGM Boston Bible School family. 
May God continue to bless you on this special day and throughout the year!

Blessings,
SFGM Boston Bible School Team
```

5. **Save** and copy the **Template ID**

---

## ✅ Step 3: Collect All Your Information

Once you have everything, you'll have:

- ✅ **Service ID**: `service_bhhbgpr` (you already have this!)
- ✅ **Public Key**: `user_...` (from Account → General → API Keys)
- ✅ **Private Key**: `...` (from Account → General → API Keys)
- ✅ **Welcome Template ID**: `template_...` (from Template 1)
- ✅ **Admin Template ID**: `template_...` (from Template 2)
- ✅ **Essay Template ID**: `template_...` (from Template 3)
- ✅ **Birthday Template ID**: `template_...` (from Template 4, optional)

---

## ✅ Step 4: Share the Information

Once you have all the values, you can either:

**Option A:** Share them here and I'll help you set them up
**Option B:** Add them directly to your Render environment variables

---

## 📝 Quick Reference - What Goes Where

When you have all the values, here's what to set:

```env
EMAIL_ENABLED=true
EMAILJS_SERVICE_ID=service_bhhbgpr
EMAILJS_PUBLIC_KEY=user_YOUR_PUBLIC_KEY_HERE
EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
EMAILJS_TEMPLATE_ID=YOUR_ESSAY_TEMPLATE_ID
EMAILJS_WELCOME_TEMPLATE_ID=YOUR_WELCOME_TEMPLATE_ID
EMAILJS_ADMIN_TEMPLATE_ID=YOUR_ADMIN_TEMPLATE_ID
EMAILJS_BIRTHDAY_TEMPLATE_ID=YOUR_BIRTHDAY_TEMPLATE_ID
ESSAY_REVIEW_EMAIL=pastor_rocky@sfgmboston.com
```

---

**Ready?** Go get your API keys and template IDs, then share them here or add them to Render!




