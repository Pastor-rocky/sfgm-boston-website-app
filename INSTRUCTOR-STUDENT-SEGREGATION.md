# Instructor-Student Segregation System

## Overview
This system ensures that instructors only see and manage students enrolled in courses assigned to them. This allows multiple instructors from different SFGM churches to teach the same course to their own students.

## How It Works

### 1. **Course Assignment**
- Each course can be assigned to one instructor via `courses.instructorId`
- Assign instructors in **Admin Panel → Courses tab → "Assign Instructor"** button
- When a course is assigned to an instructor, only students enrolled in that course will appear in that instructor's dashboard

### 2. **Student Filtering**
- **Regular Instructors**: Only see students enrolled in courses assigned to them
- **Deans/Admins**: See all students (no filtering)
- Filtering happens automatically in the API (`/api/instructor/students`)

### 3. **Essay Submissions**
- Essays are filtered by instructor's assigned courses
- Only essays from quizzes in the instructor's courses appear in their dashboard

### 4. **SFGM Church Field**
- Added `sfgm_church` field to `users` table
- Can be set when creating users in Admin Panel
- Currently used for reference; future enhancement could filter by church if needed

## Setup Instructions

### Step 1: Run Migration
Run this SQL in your database (Neon SQL editor or psql):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS sfgm_church varchar(255);
CREATE INDEX IF NOT EXISTS idx_users_sfgm_church ON users (sfgm_church);
```

Or use the migration file: `migrations/0003_add_sfgm_church_to_users.sql`

### Step 2: Assign Instructors to Courses
1. Go to **Admin Panel → Courses tab**
2. Click **"Assign Instructor"** for each course
3. Select the instructor from the dropdown
4. Click **"Assign Instructor"**

### Step 3: Set SFGM Church (Optional)
When creating users in Admin Panel, you can optionally set their SFGM church (e.g., "SFGM Boston", "SFGM Orlando", "SFGM Idaho").

## Example Scenario

**Scenario**: Acts in Action course with multiple instructors

1. **Course**: "Acts in Action" (Course ID: 1)
   - Assign to **Pastor Mark** (SFGM Orlando)
   - Students from SFGM Orlando enrolled in this course → appear in Pastor Mark's dashboard

2. **Same Course, Different Instructor**:
   - Create a duplicate course OR use course assignment
   - Assign to **Pastor Daniel** (SFGM Idaho)  
   - Students from SFGM Idaho enrolled → appear in Pastor Daniel's dashboard

**Note**: Currently, one course = one instructor. If you need the same course taught by multiple instructors to different student groups, you have two options:

**Option A**: Create separate course entries (e.g., "Acts in Action - Orlando", "Acts in Action - Idaho")

**Option B**: Use a single course but assign different instructors and manually manage enrollments (students enroll in the course, but each instructor only sees students from their church/location)

## Statistics

All statistics in the Instructor Dashboard are **real and calculated from filtered data**:
- **Total Students**: Count of students in instructor's assigned courses
- **Pending Essays**: Essays from instructor's courses only
- **Active Courses**: Unique courses assigned to instructor
- **Average GPA**: Calculated from quiz scores of instructor's students only

## API Endpoints

- `GET /api/instructor/students` - Returns only students from instructor's assigned courses
- `GET /api/instructor/essay-submissions` - Returns only essays from instructor's courses
- `PATCH /api/admin/courses/:id/instructor` - Assign instructor to course

## For Deans/Admins

Deans and Admins see **all students** regardless of course assignments. This allows oversight of all instructors and students.
