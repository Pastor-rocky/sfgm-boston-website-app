# Welcome Video Replacement Guide

## Current Video Location
- **File:** `client/src/assets/welcome-video.mp4`
- **Referenced in:** `client/src/pages/welcome-video.tsx`
- **Code expects:** `/assets/welcome-video.mp4` (public folder)

## Video Path Configuration
The welcome video is referenced as `/assets/welcome-video.mp4` in the code, which means it should be placed in:
- **`public/assets/welcome-video.mp4`** (for production)

## Steps to Replace Video

1. **Delete old video:**
   ```bash
   rm client/src/assets/welcome-video.mp4
   ```

2. **Place new video:**
   - Upload new video to: `public/assets/welcome-video.mp4`
   - OR keep it in `client/src/assets/welcome-video.mp4` (both work)

3. **Video Requirements:**
   - Format: MP4
   - Filename: `welcome-video.mp4`
   - Location: Either `public/assets/` or `client/src/assets/`

4. **Test:**
   - Visit `/welcome-video` page
   - Video should auto-play and redirect to dashboard when finished

## Current Status
✅ Ready to replace video
✅ Public assets folder created: `public/assets/`
✅ Code is ready - just needs new video file

## Notes
- The video auto-plays when the welcome page loads
- After video ends, it redirects to `/dashboard` after 3 seconds
- Video is shown to new users after registration





