# How to Test Locally Before Deployment

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

This will start the server on `http://localhost:56000` (or the port shown in terminal)

### 2. Open in Browser

Open your browser and go to:
- **Main site**: `http://localhost:56000`
- **Textbook Catalog**: `http://localhost:56000/textbook-catalog`
- **E-Books**:
  - `http://localhost:56000/acts-in-action-ebook`
  - `http://localhost:56000/becoming-a-firestarter-complete-ebook`
  - `http://localhost:56000/dont-be-a-jonah-complete-book`
  - `http://localhost:56000/studying-for-service-complete-ebook`
  - `http://localhost:56000/grow-complete-ebook`
  - `http://localhost:56000/deacon-course-complete-ebook`
  - `http://localhost:56000/youth-ministry-complete-ebook`

### 3. Test MP3 Audio Files

1. Navigate to any e-book page
2. Click the play button on the audio player
3. Check browser console (F12) for any errors
4. Verify audio plays correctly

### 4. Test Reading Unlock

1. Go to Course 1: `http://localhost:56000/course/1`
2. Watch Week 1 video
3. Check if readings unlock immediately
4. Try accessing Week 1 readings

## 🔍 Debugging Tips

### Check Browser Console
- Press `F12` to open Developer Tools
- Go to "Console" tab
- Look for any red errors

### Check Network Tab
- Press `F12` → "Network" tab
- Try playing audio
- Check if MP3 files load (status should be 200)
- If you see 404, the file path is wrong

### Test Audio Files Directly
Try accessing audio files directly in browser:
- `http://localhost:56000/uploads/textbook-audio/acts-in-action-cp1.mp3`
- `http://localhost:56000/uploads/firestarter-audio/fire-starter-cp1.mp3`
- `http://localhost:56000/studying-for-service-ch1.mp3`

If these play, the files exist and paths are correct.

## ⚠️ Common Issues

### Audio Not Playing
1. Check browser console for errors
2. Verify file paths are correct
3. Check if files exist in `public/` directory
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Reading Not Unlocking
1. Check browser console for errors
2. Verify video progress is being saved
3. Check Network tab for API calls to `/api/content-progress`

### Port Already in Use
If port 56000 is busy, the server will use a different port. Check the terminal output for the actual port.

## ✅ Pre-Deployment Checklist

- [ ] All e-book pages load correctly
- [ ] All MP3 files play correctly
- [ ] Reading unlock works after watching videos
- [ ] No console errors
- [ ] All images display correctly
- [ ] Navigation works correctly

---

**Note**: Make sure your `.env` file is configured with the correct database URL before testing!



