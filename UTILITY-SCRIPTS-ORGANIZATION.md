# 🛠️ Utility Scripts Organization & Consolidation Plan

## 📊 Current State Analysis

### **TypeScript Utility Scripts Found: 40+ files**

#### **Category 1: User Management Scripts (7 files)**
- `create-pastor-rocky.ts` - Create PastorRocky user
- `fix-pastor-rocky-password.ts` - Fix PastorRocky password
- `fix-pastor-rocky-username.ts` - Fix PastorRocky username
- `check-users-fix-login.ts` - Check users and fix login
- `check-users-and-fix.ts` - Check users and fix (duplicate?)
- `verify-test-user.ts` - Verify test user creation
- `debug-login-issues.ts` - Debug login issues

**Consolidation Plan:** → `scripts/user-management.ts` (unified user management tool)

#### **Category 2: Database Cleanup Scripts (3 files)**
- `complete-cleanup.ts` - Complete database cleanup
- `clean-database-fixed.ts` - Clean database (fixed version)
- `clean-database-create-pastor-rocky.ts` - Clean database and create PastorRocky

**Consolidation Plan:** → `scripts/database-cleanup.ts` (unified cleanup tool with options)

#### **Category 3: Schema/Gender Fix Scripts (4 files)**
- `check-gender-schema.ts` - Check gender schema
- `check-gender-fix.ts` - Fix gender issues
- `test-registration-no-gender.ts` - Test registration without gender
- `remove-gender-requirement.ts` - Remove gender requirement

**Consolidation Plan:** → `scripts/schema-fixes.ts` (unified schema management)

#### **Category 4: Course Content Scripts (2 files)**
- `insert-dbaj-videos.ts` - Insert Don't Be a Jonah videos
- `update-course1-videos.ts` - Update course 1 videos
- `check-course1-videos.ts` - Check course 1 videos

**Consolidation Plan:** → `scripts/course-content.ts` (unified course content management)

#### **Category 5: Quiz Management Scripts (11 files)**
- `add-youth-ministry-week1-quiz.ts` through `add-youth-ministry-week5-quiz.ts` (5 files)
- `add-youth-ministry-final-exam.ts`
- `test-youth-ministry-quizzes.ts`
- `verify-youth-ministry-quiz-functionality.ts`
- `test-all-course-quizzes.ts`
- `check-all-quiz-attempts.ts`

**Consolidation Plan:** → `scripts/quiz-management.ts` (unified quiz creation/management tool)

#### **Category 6: Progress/Enrollment Debug Scripts (10+ files)**
- `debug-week2-detailed.ts`
- `debug-week2-lock.ts`
- `verify-week2-unlock.ts`
- `test-progress-fixes.ts`
- `test-course1-complete.ts`
- `test-course1-locking.ts`
- `test-complete-progression.ts`
- `reset-course-progress.ts`
- `test-course-progression.ts`
- `fix-student-id-mismatch.ts`
- `check-auth-mismatch.ts`
- `debug-api-endpoints.ts`
- `test-frontend-logic.ts`
- `debug-course1-videos.ts`

**Consolidation Plan:** → `scripts/debug-tools.ts` (unified debugging toolkit)

---

## 🎯 Consolidation Strategy

### **Phase 1: Create Unified Utility Scripts**

#### **1. `scripts/user-management.ts`**
Unified user management tool with subcommands:
```bash
npx tsx scripts/user-management.ts create-pastor-rocky
npx tsx scripts/user-management.ts fix-password --userId=pastor-rocky
npx tsx scripts/user-management.ts fix-username --userId=pastor-rocky
npx tsx scripts/user-management.ts verify --userId=pastor-rocky
npx tsx scripts/user-management.ts list
npx tsx scripts/user-management.ts debug-login --userId=pastor-rocky
```

#### **2. `scripts/database-cleanup.ts`**
Unified database cleanup with options:
```bash
npx tsx scripts/database-cleanup.ts --mode=full --keep-admin --create-pastor-rocky
npx tsx scripts/database-cleanup.ts --mode=users-only
npx tsx scripts/database-cleanup.ts --mode=progress-only
```

#### **3. `scripts/course-content.ts`**
Unified course content management:
```bash
npx tsx scripts/course-content.ts add-videos --courseId=3 --source=dbaj
npx tsx scripts/course-content.ts update-videos --courseId=1
npx tsx scripts/course-content.ts check-videos --courseId=1
```

#### **4. `scripts/quiz-management.ts`**
Unified quiz creation/management:
```bash
npx tsx scripts/quiz-management.ts create --course=YouthMinistry --week=1
npx tsx scripts/quiz-management.ts create --course=YouthMinistry --week=all
npx tsx scripts/quiz-management.ts verify --course=YouthMinistry
npx tsx scripts/quiz-management.ts test --course=YouthMinistry
```

#### **5. `scripts/debug-tools.ts`**
Unified debugging toolkit:
```bash
npx tsx scripts/debug-tools.ts progress --studentId=xxx --courseId=1
npx tsx scripts/debug-tools.ts unlock --week=2 --courseId=1
npx tsx scripts/debug-tools.ts reset-progress --studentId=xxx
npx tsx scripts/debug-tools.ts check-mismatches
npx tsx scripts/debug-tools.ts api-endpoints
```

#### **6. `scripts/schema-fixes.ts`**
Unified schema management:
```bash
npx tsx scripts/schema-fixes.ts check-gender
npx tsx scripts/schema-fixes.ts fix-gender
npx tsx scripts/schema-fixes.ts remove-gender-requirement
```

---

## 📚 Documentation Files Analysis

### **Category 1: Automation System (5 files)**
- `START-HERE-AUTOMATION.md` - Quick start guide ✅ **KEEP**
- `QUICK-START-AUTO-COURSE.md` - 5-minute guide ✅ **KEEP**
- `AUTO-COURSE-CREATOR.md` - Complete guide ✅ **KEEP**
- `AI-INSTRUCTIONS-AUTO-COURSE.md` - AI rules ✅ **KEEP**
- `README-AUTOMATION.md` - Overview ✅ **KEEP**

**Status:** All essential, well-organized, keep as-is

### **Category 2: Template Guides (5 files)**
- `COURSE-CREATION-GUIDE.md` - Master guide ✅ **KEEP**
- `VIDEO-TEMPLATE.md` - Video template ✅ **KEEP**
- `AUDIO-TEMPLATE.md` - Audio template ✅ **KEEP**
- `AUDIO-STYLING-REFERENCE.md` - Styling reference ✅ **KEEP**
- `QUIZ-TEMPLATE.md` - Quiz template ✅ **KEEP**
- `EBOOK-TEMPLATE.md` - E-book template ✅ **KEEP**
- `REQUIRED-READING-TEMPLATE.md` - Reading template ✅ **KEEP**

**Status:** All essential templates, keep as-is

### **Category 3: Project Documentation (4 files)**
- `PROJECT-OVERHAUL-PLAN.md` - Overhaul tracking ✅ **KEEP**
- `QUICKSTART.md` - Contributor guide ✅ **KEEP**
- `DEPLOYMENT.md` - Deployment guide ✅ **KEEP**
- `PRODUCTION_READY_GUIDE.md` - Production guide ✅ **KEEP**

**Status:** All essential, keep as-is

### **Category 4: Session/Summary Files (3 files)**
- `SESSION-41-SUMMARY.md` - Session summary ⚠️ **ARCHIVE** (historical)
- `CLEANUP-AUDIT-COMPLETE.md` - Cleanup summary ⚠️ **ARCHIVE** (historical)
- `DEACON-COURSE-COMPLETE-SUMMARY.md` - Course summary ⚠️ **ARCHIVE** (historical)
- `TEMPLATE-ORGANIZATION-COMPLETE.md` - Organization summary ⚠️ **ARCHIVE** (historical)
- `AUTOMATION-SYSTEM-SUMMARY.md` - Automation summary ⚠️ **ARCHIVE** (historical)
- `WEBSITE-AUDIT-REPORT.md` - Audit report ⚠️ **ARCHIVE** (historical)

**Status:** Historical summaries, move to `docs/archive/` folder

### **Category 5: Reference Files (1 file)**
- `SMS_PROVIDER_COMPARISON.md` - Provider comparison ✅ **KEEP** (useful reference)

---

## 🎯 Recommended Actions

### **Immediate Actions:**

1. **Create `scripts/` folder structure:**
   ```
   scripts/
   ├── user-management.ts
   ├── database-cleanup.ts
   ├── course-content.ts
   ├── quiz-management.ts
   ├── debug-tools.ts
   └── schema-fixes.ts
   ```

2. **Create `docs/archive/` folder:**
   ```
   docs/
   └── archive/
       ├── SESSION-41-SUMMARY.md
       ├── CLEANUP-AUDIT-COMPLETE.md
       ├── DEACON-COURSE-COMPLETE-SUMMARY.md
       ├── TEMPLATE-ORGANIZATION-COMPLETE.md
       ├── AUTOMATION-SYSTEM-SUMMARY.md
       └── WEBSITE-AUDIT-REPORT.md
   ```

3. **Keep all utility scripts in root for now** (but organize them mentally by category)

4. **Create `UTILITY-SCRIPTS-INDEX.md`** - Quick reference guide for all utility scripts

---

## 📝 Next Steps

1. ✅ Review this plan
2. ⏳ Create unified utility scripts (if approved)
3. ⏳ Move historical docs to archive
4. ⏳ Create utility scripts index
5. ⏳ Update documentation to reference new structure

---

## 🔍 File Status Summary

### **Keep in Root (Production/Active):**
- All config files (vite.config.ts, drizzle.config.ts, etc.)
- `auto-create-course.py` (automation system)
- `extract-pdf.cjs` (PDF extraction tool)

### **Keep in Root (Utility Scripts - Active):**
- All utility scripts (for now, until consolidation)

### **Archive (Historical):**
- Session summaries
- Completed audit reports
- Historical summaries

### **Keep in Root (Documentation - Active):**
- All automation guides
- All templates
- All project documentation
- Production guides

---

**Last Updated:** $(date)
**Status:** Analysis Complete - Awaiting Approval for Consolidation

