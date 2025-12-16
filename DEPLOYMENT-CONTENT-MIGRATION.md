# Course Content Migration - Deployment Guide

## 🔍 Issues Found

### 1. **Hardcoded Course Readings Fallback (CRITICAL BUG)**
   - **Location**: `server/storage.ts` lines 1882-2117
   - **Problem**: Hardcoded Acts Bible readings for `courseId === 4`
   - **Issue**: Course 4 is **G.R.O.W**, not Acts in Action! Course 1 is Acts in Action.
   - **Status**: ✅ **FIXED** - Hardcoded fallback disabled (set to `false`)

### 2. **Missing Course Readings in Database**
   - **Total Readings Needed**: 107 readings across 8 courses
   - **Script Available**: `add-all-course-readings.ts` (already prepared)
   - **Status**: ⚠️ **READY TO DEPLOY** - Script exists but needs to be run

### 3. **Course Reading Breakdown**
   - **Course 1** (Acts in Action): 21 readings (intro + 10 weeks × 2)
   - **Course 2** (Becoming a Fire Starter): 20 readings (10 weeks × 2)
   - **Course 3** (Don't Be a Jonah): 22 readings (11 weeks × 2)
   - **Course 4** (G.R.O.W): 4 readings (4 weeks × 1)
   - **Course 5** (Studying for Service): 24 readings (12 weeks × 2)
   - **Course 6** (Deacon Course): 5 readings (5 weeks × 1)
   - **Course 7** (Level Up Leadership): 6 readings (6 weeks × 1)
   - **Course 8** (Youth Ministry): 5 readings (5 weeks × 1)

---

## ✅ Fixes Applied

### 1. **Disabled Hardcoded Fallback**
   - Modified `server/storage.ts` to disable the incorrect Course 4 fallback
   - Added TODO comment to remove fallback after deployment
   - System will now rely entirely on database readings

### 2. **Created Deployment Script**
   - **File**: `deploy-all-course-content.ts`
   - **Purpose**: Comprehensive script to add all readings and verify deployment
   - **Features**:
     - Generates all 107 readings
     - Inserts/updates in database
     - Verifies counts by course
     - Provides detailed summary

### 3. **Refactored Reading Generation**
   - Split `add-all-course-readings.ts` into:
     - `generateAllReadings()`: Returns reading data array
     - `addAllReadings()`: Inserts readings into database
   - Allows reuse of generation logic

---

## 🚀 Deployment Steps

### Step 1: Run the Deployment Script

```bash
# Set your database URL
export DATABASE_URL="your_production_database_url"

# Run the comprehensive deployment script
npx tsx deploy-all-course-content.ts
```

**OR** use the existing script:

```bash
npx tsx add-all-course-readings.ts
```

### Step 2: Verify Deployment

After running the script, verify:

1. **Check Database**:
   ```sql
   SELECT course_id, COUNT(*) 
   FROM course_readings 
   WHERE is_active = true 
   GROUP BY course_id 
   ORDER BY course_id;
   ```

   Expected counts:
   - Course 1: 21 readings
   - Course 2: 20 readings
   - Course 3: 22 readings
   - Course 4: 4 readings (G.R.O.W chapters, NOT Acts)
   - Course 5: 24 readings
   - Course 6: 5 readings
   - Course 7: 6 readings
   - Course 8: 5 readings

2. **Test on Website**:
   - Visit each course page
   - Verify readings appear correctly
   - Check Course 4 shows G.R.O.W chapters (not Acts Bible readings)
   - Verify Course 1 shows Acts readings correctly

### Step 3: Remove Hardcoded Fallback (After Verification)

Once you've verified everything works:

1. Open `server/storage.ts`
2. Find lines 1882-2117 (the disabled fallback)
3. **Delete the entire hardcoded fallback block**
4. The function should go directly from checking database to the textbook mapping fallback

---

## 📋 Pre-Deployment Checklist

- [ ] Database backup created
- [ ] `DATABASE_URL` environment variable set
- [ ] Scripts tested on local/staging database first
- [ ] All 107 readings verified in script
- [ ] Hardcoded fallback disabled in `server/storage.ts`

---

## 📋 Post-Deployment Checklist

- [ ] All 107 readings inserted successfully
- [ ] Course reading counts match expected values
- [ ] Course 4 shows G.R.O.W readings (not Acts)
- [ ] Course 1 shows Acts readings correctly
- [ ] All course pages load readings from database
- [ ] Hardcoded fallback removed from `server/storage.ts`
- [ ] Website tested on production

---

## 🔧 Files Modified

1. **`server/storage.ts`**
   - Disabled incorrect Course 4 hardcoded fallback
   - Added TODO comment for removal

2. **`add-all-course-readings.ts`**
   - Refactored to export `generateAllReadings()` function
   - Kept `addAllReadings()` for direct execution

3. **`deploy-all-course-content.ts`** (NEW)
   - Comprehensive deployment script
   - Includes verification and reporting

---

## ⚠️ Important Notes

1. **Course ID Mapping**:
   - Course 1 = Acts in Action
   - Course 4 = G.R.O.W
   - The hardcoded fallback had this wrong!

2. **Reading IDs**:
   - Course 1: IDs 1-21
   - Course 2: IDs 101-120
   - Course 3: IDs 201-222
   - Course 4: IDs 301-304
   - Course 5: IDs 401-424
   - Course 6: IDs 501-505
   - Course 7: IDs 601-606
   - Course 8: IDs 701-705

3. **Content Placeholders**:
   - Textbook chapter content uses placeholders
   - Actual content needs to be extracted from PDFs/TSX files later
   - Bible readings have proper links and descriptions

---

## 🐛 Known Issues

1. **Textbook Content**: Currently uses placeholder text
   - Needs extraction from source files
   - See `READINGS-SCRIPT-REVIEW.md` for details

2. **Course Progress Config**: Still uses hardcoded quiz IDs
   - This is configuration, not content
   - Can be migrated later if needed

3. **Mini Courses**: Hardcoded in `client/src/pages/mini-courses.tsx`
   - Database table `mini_courses` exists and has API endpoints
   - Hardcoded data might be intentional for display, but should come from database
   - **Status**: ⚠️ Low priority - verify if this is intentional

## ✅ Verified - Already Using Database

1. **Course Videos**: ✅ All fetched from `course_videos` table
   - No hardcoded video data found
   - Videos are properly stored in database

2. **Course Catalog**: ✅ Fetched from `courses` table
   - `/api/courses` endpoint uses database
   - Some display components have hardcoded arrays for UI purposes only

---

## 📞 Support

If you encounter issues:

1. Check database connection string
2. Verify course IDs match your database
3. Check for duplicate reading IDs
4. Review script output for specific errors
5. Verify `course_readings` table exists and has correct schema

---

**Last Updated**: $(date)
**Status**: Ready for deployment
**Priority**: High - Fixes critical bug and ensures all content is in database

