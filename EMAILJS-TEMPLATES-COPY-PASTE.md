# EmailJS Templates - Copy & Paste Ready

## Your Configuration
- **Service ID**: `service_bhhbgpr`
- **Public Key**: `UPTEDM8MNxgzaRzV3`
- **Private Key**: `_CGb6yqAMOm4208pq3q9E`

---

## Template 1: Welcome Email

### Steps:
1. Go to EmailJS Dashboard → **Email Templates**
2. Click **"Create New Template"**
3. Fill in the fields below, then **Save**
4. Copy the **Template ID** (you'll need it later)

### Template Settings:

**Template Name:**
```
Welcome Email
```

**Subject:**
```
Welcome to SFGM Boston Bible School, {{first_name}}!
```

**Content (HTML):**
```html
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

**Content (Plain Text - if HTML doesn't work):**
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

---

## Template 2: Admin Registration Notification

### Steps:
1. Click **"Create New Template"** again
2. Fill in the fields below, then **Save**
3. Copy the **Template ID**

### Template Settings:

**Template Name:**
```
Admin Registration Notification
```

**Subject:**
```
New Student Registration: {{first_name}} {{last_name}}
```

**Content (HTML):**
```html
New Student Registration

Student Details:
- Name: {{first_name}} {{last_name}}
- Email: {{email}}
- Username: {{username}}
- Registration Date: {{registration_date}} at {{registration_time}}
- Email Consent: {{email_consent}}

Please review the new registration in the admin dashboard.
```

**Content (Plain Text):**
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

---

## Template 3: Essay Submission Email

### Steps:
1. Click **"Create New Template"** again
2. Fill in the fields below, then **Save**
3. Copy the **Template ID**

### Template Settings:

**Template Name:**
```
Essay Submission
```

**Subject:**
```
Final Exam Essay Submission - {{course_title}}
```

**Content (HTML):**
```html
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

**Content (Plain Text):**
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

---

## Template 4: Birthday Email

### Steps:
1. Click **"Create New Template"** again
2. Fill in the fields below, then **Save**
3. Copy the **Template ID**

### Template Settings:

**Template Name:**
```
Birthday Email
```

**Subject:**
```
🎉 Happy Birthday {{first_name}}!
```

**Content (HTML):**
```html
Happy Birthday {{first_name}}!

We're blessed to have you as part of our SFGM Boston Bible School family. 
May God continue to bless you on this special day and throughout the year!

Blessings,
SFGM Boston Bible School Team
```

**Content (Plain Text):**
```
Happy Birthday {{first_name}}!

We're blessed to have you as part of our SFGM Boston Bible School family. 
May God continue to bless you on this special day and throughout the year!

Blessings,
SFGM Boston Bible School Team
```

---

## After Creating All Templates

Once you've created all 4 templates and copied their Template IDs, you'll need to add these environment variables to Render:

### Environment Variables for Render:

```
EMAIL_ENABLED=true
EMAILJS_SERVICE_ID=service_bhhbgpr
EMAILJS_PUBLIC_KEY=UPTEDM8MNxgzaRzV3
EMAILJS_PRIVATE_KEY=_CGb6yqAMOm4208pq3q9E
EMAILJS_TEMPLATE_ID=YOUR_ESSAY_TEMPLATE_ID_HERE
EMAILJS_WELCOME_TEMPLATE_ID=YOUR_WELCOME_TEMPLATE_ID_HERE
EMAILJS_ADMIN_TEMPLATE_ID=YOUR_ADMIN_TEMPLATE_ID_HERE
EMAILJS_BIRTHDAY_TEMPLATE_ID=YOUR_BIRTHDAY_TEMPLATE_ID_HERE
ESSAY_REVIEW_EMAIL=pastor_rocky@sfgmboston.com
```

**Replace:**
- `YOUR_WELCOME_TEMPLATE_ID_HERE` with the Template ID from Template 1
- `YOUR_ADMIN_TEMPLATE_ID_HERE` with the Template ID from Template 2
- `YOUR_ESSAY_TEMPLATE_ID_HERE` with the Template ID from Template 3
- `YOUR_BIRTHDAY_TEMPLATE_ID_HERE` with the Template ID from Template 4

---

## Quick Instructions:

1. **Go to**: https://dashboard.emailjs.com/admin/template
2. **Create each template** using the content above
3. **Copy each Template ID** after saving
4. **Share the Template IDs with me** OR add them to Render environment variables

---

## Notes:

- The `{{variable_name}}` placeholders will be automatically replaced with actual data
- You can use either HTML or Plain Text format (HTML looks nicer)
- Make sure to save each template before moving to the next one
- The Template ID is usually shown at the top of the template page after saving




