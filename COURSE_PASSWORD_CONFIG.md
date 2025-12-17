# Course Password Configuration

## Locked Courses
The following courses require a password to enroll or access:

- **Course 6: Deacon Course** - Password: `123`
- **Course 8: Youth Ministry Course** - Password: `123`

## Password
**Current Password: `123`**

⚠️ **Note:** This password may be changed later. Update the `COURSE_PASSWORDS` object in `client/src/components/course-password-prompt.tsx` if changed.

## Implementation
Password protection is implemented in:
- `client/src/components/course-password-prompt.tsx` - Password prompt component
- `client/src/pages/textbook-catalog.tsx` - E-book access protection
- `client/src/pages/course-detail.tsx` - Enrollment protection
- `client/src/pages/bible-university.tsx` - Enrollment protection

## How It Works
1. When a student tries to enroll or access the e-book for a locked course, a password prompt appears
2. The prompt asks: "Please ask a staff member for the access code"
3. Student enters the password
4. If correct, they can proceed with enrollment/access
5. If incorrect, an error message is shown

