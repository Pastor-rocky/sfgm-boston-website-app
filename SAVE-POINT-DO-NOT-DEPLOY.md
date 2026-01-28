# Save point — do not deploy

**Date:** January 2025  
**Status:** Work in progress. Finish editing tomorrow. **Do not push/deploy.**

---

## What’s done (saved locally)

### Admin panel
- **Instructors by church** tab: Table lists SFGM churches with Instructor, Email, Phone, and “Add instructor” per church.
- **Clickable instructor names:** Clicking a name opens an edit dialog (Name, Email, Phone). Save updates church instructor info.
- **Church position + name** in Add User: Replaced First/Last name with Church position (Pastor, Elder, Deacon, Teacher, Minister) + single Name. Backend accepts `lastName` optional.
- **Removed** the old “Instructors” card (Manage instructor accounts / Add Instructor / table). Only “Instructors by church” remains.
- **Trim guards:** Fixed `Cannot read properties of undefined (reading 'trim')` (e.g. `newUser.name`, `form.name`). Church-instructor fetch returns `{}` on 404 so the UI doesn’t crash.

### Backend
- **`church_instructor_info`** table: `church` (PK), `instructor_name`, `email`, `phone`, `updated_at`.
- **Migration:** `migrations/0005_add_church_instructor_info.sql`.
- **API:**  
  - `GET /api/admin/church-instructors` → map of church → `{ instructorName, email, phone }`  
  - `PUT /api/admin/church-instructors/:church` → upsert name, email, phone.

### Schema
- `shared/schema.ts`: added `churchInstructorInfo` table.

---

## What you need to do tomorrow

1. **Run the migration** (if not done yet):
   ```bash
   cd "/Users/rocky/Desktop/SFGM Boston Website:App  "
   psql "$DATABASE_URL" -f migrations/0005_add_church_instructor_info.sql
   ```
   Or run the SQL in `migrations/0005_add_church_instructor_info.sql` manually in your DB.

2. **Restart dev server** after migration so `/api/admin/church-instructors` works.

3. **Save progress to git (no deploy):**
   ```bash
   cd "/Users/rocky/Desktop/SFGM Boston Website:App  "
   git add -A
   git status   # review
   git commit -m "WIP: admin instructors-by-church, church position+name, trim guards; do not deploy"
   # Do NOT run: git push
   ```

4. **Continue editing** from here tomorrow.

---

## Do not deploy

- Do **not** run `git push` until you’ve finished editing and testing.
- Deploy only after you’re happy with local testing.
