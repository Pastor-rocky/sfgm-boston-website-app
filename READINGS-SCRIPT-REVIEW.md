# Course Readings Script Review

## Script: `add-all-course-readings.ts`

### Overview
This script will add **107 course readings** to the database across 8 courses, matching the structure defined in `course-content-viewer.tsx`.

---

## What the Script Does

### 1. **Creates Reading Entries**
- Inserts new readings if they don't exist
- Updates existing readings if they already have the same ID
- Uses the exact reading IDs defined in the code (1-21, 101-120, 201-222, etc.)

### 2. **Reading Structure**

#### Course 1: Acts in Action (21 readings)
- **Week 1**: 3 readings (Introduction, Chapter 1, Bible Acts 1-2)
- **Weeks 2-10**: 2 readings each (Chapter + Bible)
- **Reading IDs**: 1-21

#### Course 2: Becoming a Fire Starter (20 readings)
- **Weeks 1-10**: 2 readings each (Chapter + Bible)
- **Reading IDs**: 101-120
- **Bible Readings**: Luke 1-4, 5-8, 9-12, 13-16, 17-20, 21-24, John 1-5, 6-10, 11-15, 16-21

#### Course 3: Don't Be a Jonah (22 readings)
- **Weeks 1-11**: 2 readings each (Chapter + Bible)
- **Reading IDs**: 201-222
- **Bible Readings**: 1 Timothy 1-6, 2 Timothy 1-4, Titus 1-3

#### Course 4: G.R.O.W (4 readings)
- **Weeks 1-4**: 1 reading each (Chapter only)
- **Reading IDs**: 301-304
- **Chapters**: Give, Read, Obey, Win

#### Course 5: Studying for Service (24 readings)
- **Weeks 1-12**: 2 readings each (Chapter + Bible)
- **Reading IDs**: 401-424
- **Bible Readings**: Matthew 1-4 through 25-28, Mark 1-4 through 12-16

#### Course 6: Deacon Course (5 readings)
- **Weeks 1-5**: 1 reading each (Chapter only)
- **Reading IDs**: 501-505
- **Chapters**: The Unignorable Nudge, Laying the Foundation, The Servant in Motion, The Spiritual Battlefield, Commissioned for Impact

#### Course 7: Level Up Leadership (6 readings)
- **Weeks 1-6**: 1 reading each (Chapter only)
- **Reading IDs**: 601-606
- **Chapters**: Position, Permission, Production, People Development, Pinnacle, Integration & Application

#### Course 8: Youth Ministry (5 readings)
- **Weeks 1-5**: 1 reading each (Chapter only)
- **Reading IDs**: 701-705
- **Chapters**: The Calling, Requirements, Responsibilities, Accountability, Making New Disciples

---

## Important Notes

### ✅ What's Included
1. **All reading IDs** match the hardcoded IDs in `course-content-viewer.tsx`
2. **Bible readings** include Bible Gateway links in the content field
3. **Chapter titles** are included where available
4. **Order indexes** are set correctly for each course
5. **Reading types** are set correctly (textbook, bible_chapter)

### ⚠️ What Needs Attention

1. **Textbook Content**
   - Currently uses placeholder text: "Chapter X content - available in [ebook-file].tsx"
   - **Action needed**: Extract actual content from TSX files or PDFs and update
   - Content sources:
     - TSX files: `becoming-a-firestarter-complete-ebook.tsx`, `dont-be-a-jonah-complete-book.tsx`, etc.
     - PDF files: `SFGM Orlando Courses/` and `SFGM Boston Courses/` folders
     - Extracted text files: `public/uploads/textbook-pdfs/` and `client/src/pages/content/`

2. **Course ID Mapping**
   - Script uses courseId 1-8
   - Verify these match your actual database course IDs
   - Check: `import-everything-from-local.ts` shows a mapping (1→21, 2→22, etc.)
   - **Action needed**: Confirm if you need to update course IDs in the script

3. **Bible Reading Links**
   - Links are embedded in content field (not a separate externalUrl field)
   - Format: "Description\n\nRead online: [Bible Gateway URL]"
   - This matches how Course 4 (Acts) readings are structured in `server/storage.ts`

---

## Database Schema Used

```typescript
course_readings {
  id: serial (PRIMARY KEY)
  course_id: integer (NOT NULL)
  title: varchar(255) (NOT NULL)
  description: text
  reading_type: varchar(50) (default: 'textbook')
  content: text
  book_title: varchar(255)
  book_author: varchar(255)
  book_cover_url: varchar(500)
  chapter_number: integer
  order_index: integer (default: 0)
  is_active: boolean (default: true)
  created_at: timestamp
  updated_at: timestamp
}
```

---

## Running the Script

### Command:
```bash
DATABASE_URL="your_database_url" npx tsx add-all-course-readings.ts
```

### What Happens:
1. Script connects to database
2. For each reading:
   - Checks if reading with that ID exists
   - If exists: Updates it
   - If not: Inserts new reading
3. Prints progress every 10 readings
4. Shows final summary:
   - Number inserted
   - Number updated
   - Number of errors

---

## Verification Checklist

Before running, verify:

- [ ] Database connection string is correct
- [ ] Course IDs (1-8) match your database
- [ ] No conflicts with existing reading IDs
- [ ] You're okay with placeholder content for textbook chapters
- [ ] You understand that Bible readings will have links in content field

After running, verify:

- [ ] All 107 readings were created/updated
- [ ] Reading IDs match what's expected in `course-content-viewer.tsx`
- [ ] Bible readings have correct links
- [ ] Order indexes are correct for each course

---

## Next Steps After Running

1. **Extract Textbook Content**
   - Pull content from TSX ebook files
   - Or extract from PDF files using `extract-pdf.cjs`
   - Update the `content` field for each textbook reading

2. **Test Course Pages**
   - Verify readings appear correctly on course pages
   - Check that progress tracking works
   - Ensure Bible links open correctly

3. **Update Content**
   - Replace placeholder text with actual chapter content
   - Add book cover images if available
   - Add book authors where missing

---

## Questions to Consider

1. **Do you want to extract content now or later?**
   - Script can be modified to extract from TSX files
   - Or you can update content manually after insertion

2. **Are the course IDs correct?**
   - Check your database to confirm course IDs 1-8
   - May need to adjust if using different IDs

3. **Do you want to run a dry-run first?**
   - Script can be modified to only print what it would do
   - Without actually inserting into database

---

**Script Location**: `add-all-course-readings.ts`  
**Total Readings**: 107  
**Total Lines**: 544  
**Status**: Ready for review

