# SFGM Boston Website

## 🚀 Quick Start

### For Course Creation:
👉 **See `START-HERE-AUTOMATION.md`** - Create courses in 15 minutes!

### For Development:
👉 **See `QUICKSTART.md`** - Setup and development guide

### For Deployment:
👉 **See `DEPLOYMENT.md`** - Production deployment guide

---

## 📚 Documentation

### Course Creation
- `START-HERE-AUTOMATION.md` - Quick start for automation
- `AUTO-COURSE-CREATOR.md` - Complete automation guide
- `COURSE-CREATION-GUIDE.md` - Master guide with templates

### Templates
- `VIDEO-TEMPLATE.md` - Video integration
- `AUDIO-TEMPLATE.md` - Audio player setup
- `AUDIO-STYLING-REFERENCE.md` - Styling guide
- `QUIZ-TEMPLATE.md` - Quiz creation
- `EBOOK-TEMPLATE.md` - E-book creation

### Project Docs
- `QUICKSTART.md` - Developer setup
- `DEPLOYMENT.md` - Deployment guide
- `PRODUCTION_READY_GUIDE.md` - Production checklist
- `PROJECT-OVERHAUL-PLAN.md` - Overhaul progress

### Utility Scripts
- `UTILITY-SCRIPTS-INDEX.md` - Quick reference for all utility scripts
- `UTILITY-SCRIPTS-ORGANIZATION.md` - Organization plan

---

## 🛠️ Utility Scripts

All utility scripts are in the root directory. See `UTILITY-SCRIPTS-INDEX.md` for a complete list.

**Common Tasks:**
- User management: `create-pastor-rocky.ts`, `fix-pastor-rocky-password.ts`
- Database cleanup: `complete-cleanup.ts`
- Course content: `insert-dbaj-videos.ts`
- Quiz management: `add-youth-ministry-week1-quiz.ts` (and similar)

---

## 📁 Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared schema/types
├── public/          # Static assets
├── migrations/      # Database migrations
├── scripts/         # Production scripts
└── docs/            # Documentation
    └── archive/     # Historical summaries
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run database migrations
npm run db:push
```

---

## 📝 Notes

- All utility scripts require `DATABASE_URL` in `.env`
- See individual script files for usage instructions
- Historical documentation moved to `docs/archive/`

