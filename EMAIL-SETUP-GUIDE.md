# Email Notification System Setup Guide

## Overview

The SFGM Boston website uses **EmailJS** to send email notifications for:
- ✅ **Welcome emails** - Sent to new students after registration
- ✅ **Admin notifications** - Sent to admin when new students register
- ✅ **Essay submissions** - Sent when students submit final exam essays
- ✅ **Birthday emails** - Sent to students on their birthday

---

## Step 1: Create EmailJS Account (5 minutes)

1. **Go to EmailJS**: https://www.emailjs.com/
2. **Sign up** for a free account (or log in if you already have one)
3. **Verify your email** address

**Free Plan Includes:**
- 200 emails/month
- 2 email services
- Unlimited templates

---

## Step 2: Add Email Service (3 minutes)

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest)
   - **Outlook**
   - **Custom SMTP**
4. Follow the setup instructions for your provider
5. **Save the Service ID** (you'll need this)

**For Gmail:**
- You'll need to authorize EmailJS to send emails from your Gmail account
- This is secure and only allows EmailJS to send emails on your behalf

---

## Step 3: Create Email Templates (10 minutes)

You need to create templates for each type of email. EmailJS will use variables like `{{first_name}}`, `{{email}}`, etc.

### Template 1: Welcome Email

1. Go to **"Email Templates"** in EmailJS
2. Click **"Create New Template"**
3. **Template Name**: `Welcome Email`
4. **Subject**: `Welcome to SFGM Boston Bible School, {{first_name}}!`
5. **Content** (HTML or plain text):

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

6. **Save** and copy the **Template ID**

### Template 2: Admin Registration Notification

1. Create another template
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

1. Create another template
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

1. Create another template
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

## Step 4: Get EmailJS API Keys (2 minutes)

1. In EmailJS dashboard, go to **"Account"** → **"General"**
2. Find **"API Keys"** section
3. Copy:
   - **Public Key** (starts with `user_...`)
   - **Private Key** (starts with `...` - keep this secret!)

---

## Step 5: Configure Environment Variables

### For Local Development (.env file)

Add these to your `.env` file:

```env
# Enable email notifications
EMAIL_ENABLED=true

# EmailJS Configuration
EMAILJS_SERVICE_ID=your-service-id-here
EMAILJS_PUBLIC_KEY=your-public-key-here
EMAILJS_PRIVATE_KEY=your-private-key-here

# Email Templates (use same template ID for all, or separate ones)
EMAILJS_TEMPLATE_ID=your-welcome-template-id
EMAILJS_WELCOME_TEMPLATE_ID=your-welcome-template-id
EMAILJS_ADMIN_TEMPLATE_ID=your-admin-template-id
EMAILJS_BIRTHDAY_TEMPLATE_ID=your-birthday-template-id

# Essay Review Email
ESSAY_REVIEW_EMAIL=pastor_rocky@sfgmboston.com
```

### For Production (Render/Deployment Platform)

1. Go to your deployment platform (Render, Railway, etc.)
2. Navigate to your service → **Environment Variables**
3. Add all the variables from above with your actual values

**Important:** 
- Replace all `your-*-id-here` with actual values from EmailJS
- Keep `EMAILJS_PRIVATE_KEY` secret - never commit it to git
- Set `EMAIL_ENABLED=true` to activate email sending

---

## Step 6: Template Variables Reference

The email service uses these variables in templates:

### Welcome Email Variables:
- `{{first_name}}` - Student's first name
- `{{last_name}}` - Student's last name
- `{{full_name}}` - Full name
- `{{username}}` - Username
- `{{email}}` - Email address
- `{{registration_date}}` - Registration date
- `{{registration_time}}` - Registration time

### Admin Notification Variables:
- `{{first_name}}` - Student's first name
- `{{last_name}}` - Student's last name
- `{{full_name}}` - Full name
- `{{email}}` - Email address
- `{{username}}` - Username
- `{{registration_date}}` - Registration date
- `{{registration_time}}` - Registration time
- `{{email_consent}}` - "Yes" or "No"

### Essay Submission Variables:
- `{{to_email}}` - Recipient email (usually admin)
- `{{student_name}}` - Student's full name
- `{{student_email}}` - Student's email
- `{{course_title}}` - Course name
- `{{quiz_id}}` - Quiz ID number
- `{{question_id}}` - Question ID number
- `{{word_count}}` - Essay word count
- `{{essay_text}}` - Full essay text
- `{{submitted_at}}` - Submission timestamp

### Birthday Email Variables:
- `{{first_name}}` - Student's first name
- `{{last_name}}` - Student's last name
- `{{full_name}}` - Full name
- `{{email}}` - Email address
- `{{birthday_date}}` - Date of birth

---

## Step 7: Test the Setup

### Test Welcome Email:
1. Register a new test account on your website
2. Check the email inbox for the welcome email
3. Check admin email for the registration notification

### Test Essay Submission:
1. Complete a course with a final exam essay
2. Submit the essay
3. Check the `ESSAY_REVIEW_EMAIL` inbox for the submission

### Test Birthday Email:
1. Set a test user's birthday to today's date
2. The system will automatically send a birthday email

---

## Troubleshooting

### Emails Not Sending?

1. **Check EMAIL_ENABLED**: Must be set to `true` (not `"true"` or `True`)
2. **Verify API Keys**: Make sure Public Key and Private Key are correct
3. **Check Service ID**: Verify the EmailJS Service ID matches your service
4. **Check Template IDs**: Make sure template IDs match your EmailJS templates
5. **Check EmailJS Dashboard**: Look for error messages in EmailJS logs
6. **Check Server Logs**: Look for email-related errors in your server console

### Common Errors:

**"Missing EmailJS configuration"**
- One or more environment variables are missing
- Check that all EMAILJS_* variables are set

**"Email delivery disabled"**
- `EMAIL_ENABLED` is not set to `true`
- Check your .env file or deployment environment variables

**"Invalid template"**
- Template ID doesn't match EmailJS template
- Check that template ID is correct in environment variables

---

## Email Service Code Location

The email service is located at:
- **File**: `server/services/emailService.ts`
- **Functions**:
  - `sendWelcomeEmail()` - Welcome emails
  - `sendAdminRegistrationNotification()` - Admin notifications
  - `sendEssaySubmissionEmail()` - Essay submissions
  - `sendBirthdayEmail()` - Birthday emails

---

## Quick Setup Checklist

- [ ] Created EmailJS account
- [ ] Added email service (Gmail/Outlook/SMTP)
- [ ] Created Welcome Email template
- [ ] Created Admin Notification template
- [ ] Created Essay Submission template
- [ ] Created Birthday Email template (optional)
- [ ] Copied Service ID
- [ ] Copied Public Key
- [ ] Copied Private Key
- [ ] Copied all Template IDs
- [ ] Added environment variables to .env (local)
- [ ] Added environment variables to deployment platform (production)
- [ ] Set `EMAIL_ENABLED=true`
- [ ] Tested welcome email
- [ ] Tested essay submission email

---

## Support

If you need help:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Check server logs for error messages
3. Verify all environment variables are set correctly
4. Test with a simple template first

---

**Ready to set up?** Follow the steps above and you'll have email notifications working in about 20 minutes!




