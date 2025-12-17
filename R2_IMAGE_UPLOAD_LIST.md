# R2 Image Upload List
## Complete list of images to upload to R2 bucket

---

## 📚 COURSE COVER IMAGES (Public Folder)
These are the main course cover images used throughout the site:

1. `acts-in-action-cover.png`
2. `acts-in-action-cover.webp`
3. `becoming-a-fire-starter-cover.jpeg`
4. `fire-starter-cover.jpg`
5. `dont-be-a-jonah-cover.jpg`
6. `grow-cover.png`
7. `studying-for-service-cover.jpg`
8. `studying-for-service-cover-new.jpg`
9. `deacon-course-cover.png`
10. `level-up-leadership-cover.png`
11. `sfgm-youth-ministry-cover.png`
12. `introduction-to-prophecy-cover.jpg`
13. `introduction-to-prophecy-cover.png`
14. `theology-101-cover.png`
15. `theology-101-cover.webp`
16. `man-of-god-course-cover.webp`
17. `power-of-preaching-cover.jpg`

---

## 🎬 SERIES COVER IMAGES (Past Services)
These are used for sermon series pages:

18. `Watchmen Logo.jpeg` (Note: has space in filename)
19. `te.jpeg` (True Encounter series)
20. `pss.jpeg` (Perception series)
21. `the-watchmen-project-cover.png`
22. `watchmen-project-cover.webp`

---

## 🏛️ LOGO & BRANDING IMAGES (Assets Folder)
These are imported from the assets folder and used in navigation/components:

23. `sfgm-logo-new-blue.png` (Most commonly used logo)
24. `sfgm-logo.png`
25. `sfgm-logo-blue.png`
26. `sfgm-logo-1.png`
27. `sfgm-logo-2.png`
28. `sfgm-shield.png`
29. `sfgm-orlando-logo.png`
30. `sfgm-baseball-logo.png`
31. `bishop-signature.png`
32. `certificate-group-small.png`
33. `certificate-group.png`

---

## 🖼️ OTHER IMAGES (Public & Assets)

34. `BBU1.001.jpeg` (Boston Bible University logo)
35. `sfgm logo 4 .webp` (Note: has space in filename)
36. `church-image.jpg` (Used in about section)
37. `bridge-hero.png` (Hero section image)
38. `baseball-field-image.png`

---

## 📋 SUMMARY

**Total Images: 38**

### By Category:
- Course Covers: 17 images
- Series Covers: 5 images
- Logo/Branding: 11 images
- Other: 5 images

### Special Notes:
- `Watchmen Logo.jpeg` - Has a space in the filename (already handled by getImageUrl)
- `sfgm logo 4 .webp` - Has spaces in the filename
- All images should be uploaded to the **root level** of your R2 bucket (same as audio files)

---

## ✅ After Upload
Once uploaded to R2, the `getImageUrl()` function will automatically:
- Use R2 URLs when `VITE_R2_PUBLIC_URL` is set
- Properly encode filenames with spaces/special characters
- Fall back to local files if R2 is not configured

---

## 🔄 Next Steps
1. Upload all 38 images to your R2 bucket
2. Ensure `VITE_R2_PUBLIC_URL` environment variable is set
3. All images will automatically load from R2
4. No code changes needed - the `getImageUrl()` utility handles everything!


