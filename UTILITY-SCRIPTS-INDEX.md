# 🛠️ Utility Scripts Quick Reference Index

## 📋 Quick Navigation

### **User Management**
- `create-pastor-rocky.ts` - Create PastorRocky user account
- `fix-pastor-rocky-password.ts` - Fix/reset PastorRocky password
- `fix-pastor-rocky-username.ts` - Fix/reset PastorRocky username
- `check-users-fix-login.ts` - Check all users and fix login issues
- `verify-test-user.ts` - Verify test user creation
- `debug-login-issues.ts` - Debug login/authentication issues

### **Database Cleanup**
- `complete-cleanup.ts` - Complete database cleanup (nuclear option)
- `clean-database-fixed.ts` - Clean database (fixed version)
- `clean-database-create-pastor-rocky.ts` - Clean database and create PastorRocky

### **Schema Fixes**
- `check-gender-schema.ts` - Check gender field in schema
- `check-gender-fix.ts` - Fix gender-related issues
- `test-registration-no-gender.ts` - Test registration without gender
- `remove-gender-requirement.ts` - Remove gender requirement from registration

### **Course Content**
- `insert-dbaj-videos.ts` - Insert Don't Be a Jonah course videos
- `update-course1-videos.ts` - Update course 1 videos
- `check-course1-videos.ts` - Check course 1 video status
- `debug-course1-videos.ts` - Debug course 1 video issues

### **Quiz Management**
- `add-youth-ministry-week1-quiz.ts` - Add Youth Ministry Week 1 quiz
- `add-youth-ministry-week2-quiz.ts` - Add Youth Ministry Week 2 quiz
- `add-youth-ministry-week3-quiz.ts` - Add Youth Ministry Week 3 quiz
- `add-youth-ministry-week4-quiz.ts` - Add Youth Ministry Week 4 quiz
- `add-youth-ministry-week5-quiz.ts` - Add Youth Ministry Week 5 quiz
- `add-youth-ministry-final-exam.ts` - Add Youth Ministry final exam
- `test-youth-ministry-quizzes.ts` - Test Youth Ministry quizzes
- `verify-youth-ministry-quiz-functionality.ts` - Verify quiz functionality
- `test-all-course-quizzes.ts` - Test all course quizzes
- `check-all-quiz-attempts.ts` - Check all quiz attempts in database

### **Progress & Enrollment Debugging**
- `debug-week2-detailed.ts` - Detailed debug for week 2
- `debug-week2-lock.ts` - Debug week 2 locking issues
- `verify-week2-unlock.ts` - Verify week 2 unlock functionality
- `test-progress-fixes.ts` - Test progress tracking fixes
- `test-course1-complete.ts` - Test course 1 completion
- `test-course1-locking.ts` - Test course 1 locking mechanism
- `test-complete-progression.ts` - Test complete course progression
- `reset-course-progress.ts` - Reset course progress for a student
- `test-course-progression.ts` - Test course progression logic
- `fix-student-id-mismatch.ts` - Fix student ID mismatches
- `check-auth-mismatch.ts` - Check authentication mismatches
- `debug-api-endpoints.ts` - Debug API endpoints
- `test-frontend-logic.ts` - Test frontend logic

---

## 🚀 Usage Examples

### **Create PastorRocky User:**
```bash
npx tsx create-pastor-rocky.ts
```

### **Fix PastorRocky Password:**
```bash
npx tsx fix-pastor-rocky-password.ts
```

### **Clean Database:**
```bash
npx tsx complete-cleanup.ts
```

### **Add Course Videos:**
```bash
npx tsx insert-dbaj-videos.ts
```

### **Add Quiz:**
```bash
npx tsx add-youth-ministry-week1-quiz.ts
```

---

## 📝 Notes

- All scripts require `DATABASE_URL` in `.env` file
- Most scripts use Drizzle ORM for database operations
- Scripts are one-time utilities for setup/debugging
- See `UTILITY-SCRIPTS-ORGANIZATION.md` for consolidation plan

---

**Last Updated:** $(date)

