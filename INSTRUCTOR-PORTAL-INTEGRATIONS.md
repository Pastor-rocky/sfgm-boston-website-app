# Instructor Portal Integrations Setup

This guide covers **Twilio SMS**, **Zoom**, and **Google Calendar** for the instructor portal.

---

## Access rules (important)

| Role | What they can see |
|------|-------------------|
| **Instructor** | Only students enrolled in **their assigned courses** |
| **Dean / Admin / pastor_rocky@sfgmboston.com** | **All students** school-wide |

Instructors cannot browse other instructors' students. The API enforces this on messages, grades, and progress.

Assign instructors to courses in **Admin Panel → Courses → Assign Instructor**.

---

## 1. Twilio SMS (text students)

### Twilio dashboard steps
1. Sign in at [twilio.com/console](https://www.twilio.com/console)
2. Copy **Account SID** and **Auth Token**
3. Buy or use a **Twilio phone number** (must support SMS)
4. For production, register your **Messaging Service** / A2P 10DLC brand if sending to US numbers at scale

### Environment variables (local `.env` + Render)

```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

### Test
1. Restart the server after saving env vars
2. Instructor Portal → **Messages** → choose a student with a phone on file → channel **SMS text**
3. Check Twilio Console → **Messaging → Logs** for delivery status

---

## 2. Zoom (live class sessions)

Uses Zoom **Server-to-Server OAuth** (recommended for backend apps).

### Zoom marketplace steps
1. Go to [marketplace.zoom.us](https://marketplace.zoom.us/)
2. **Develop → Build App → Server-to-Server OAuth**
3. Add scopes: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`
4. Activate the app
5. Copy **Account ID**, **Client ID**, **Client Secret**

### Environment variables

```env
ZOOM_ENABLED=true
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

### Use in portal
**Dean Tools → Create Zoom session** — generates join/start links stored in the database.

---

## 3. Google Calendar (school schedule)

### Option A — Embed calendar (easiest)
1. Google Calendar → Settings → select your calendar → **Integrate calendar**
2. Copy the **embed URL** or calendar ID

```env
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_EMBED_URL=https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=America%2FNew_York
```

### Option B — Public iCal feed (event list in portal)
1. Same calendar settings → **Secret address in iCal format**
2. Use the public `.ics` URL (not the private one if you want read-only public events)

```env
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/YOUR_CALENDAR_ID/public/basic.ics
```

Optional:
```env
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```

---

## 4. Database migration

Run once on Neon (or let `npm run build` apply via db-push):

```bash
node --env-file=.env node_modules/.bin/tsx scripts/ensure-instructor-portal-integrations.ts
```

Creates `instructor_sessions` table and `sms_delivered` column on `instructor_messages`.

---

## 5. Render production checklist

Add all enabled integration env vars to Render → **Environment**, then redeploy.

| Variable | Required for |
|----------|----------------|
| `SMS_ENABLED` + Twilio vars | Text messaging |
| `ZOOM_ENABLED` + Zoom vars | Zoom meetings |
| `GOOGLE_CALENDAR_ENABLED` + calendar vars | Calendar embed/events |

---

## New portal features added

- **SMS** on Messages page (Twilio)
- **Progress tab** on student chart (week/content completion)
- **Applications** review queue (dean only) — approve promotes user to instructor
- **Dean Tools** — integration status, Zoom sessions, calendar embed, CSV export
- **Tighter access control** on student grades API

---

## Send your Twilio credentials

When ready, provide (or add to Render yourself):

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

Never commit these to git — only `.env` locally and Render env vars in production.
