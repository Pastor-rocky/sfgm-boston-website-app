# 📸 Complete R2 Image Upload List
## All 38 images with exact filenames and locations

---

## 📁 FROM PUBLIC FOLDER (27 images)

### Course Covers:
1. `acts-in-action-cover.png` → `public/acts-in-action-cover.png`
2. `acts-in-action-cover.webp` → `public/acts-in-action-cover.webp`
3. `becoming-a-fire-starter-cover.jpeg` → `public/becoming-a-fire-starter-cover.jpeg`
4. `fire-starter-cover.jpg` → `public/fire-starter-cover.jpg`
5. `dont-be-a-jonah-cover.jpg` → `public/dont-be-a-jonah-cover.jpg`
6. `grow-cover.png` → `public/grow-cover.png`
7. `studying-for-service-cover.jpg` → `public/studying-for-service-cover.jpg`
8. `studying-for-service-cover-new.jpg` → `public/studying-for-service-cover-new.jpg`
9. `deacon-course-cover.png` → `public/deacon-course-cover.png`
10. `level-up-leadership-cover.png` → `public/level-up-leadership-cover.png`
11. `sfgm-youth-ministry-cover.png` → `public/sfgm-youth-ministry-cover.png`
12. `introduction-to-prophecy-cover.jpg` → `public/introduction-to-prophecy-cover.jpg`
13. `introduction-to-prophecy-cover.png` → `public/introduction-to-prophecy-cover.png`
14. `theology-101-cover.png` → `public/theology-101-cover.png`
15. `theology-101-cover.webp` → `public/theology-101-cover.webp`
16. `man-of-god-course-cover.webp` → `public/man-of-god-course-cover.webp`
17. `power-of-preaching-cover.jpg` → `public/power-of-preaching-cover.jpg`
18. `sfgm-man-of-god-cover.png` → `public/sfgm-man-of-god-cover.png`

### Series Covers (Past Services):
19. `Watchmen Logo.jpeg` → `public/Watchmen Logo.jpeg` ⚠️ (has space)
20. `te.jpeg` → `public/te.jpeg` (True Encounter series)
21. `pss.jpeg` → `public/pss.jpeg` (Perception series)
22. `the-watchmen-project-cover.png` → `public/the-watchmen-project-cover.png`
23. `watchmen-project-cover.webp` → `public/watchmen-project-cover.webp`

### Other Public Images:
24. `BBU1.001.jpeg` → `public/BBU1.001.jpeg` (Boston Bible University logo)
25. `sfgm logo 4 .webp` → `public/sfgm logo 4 .webp` ⚠️ (has spaces)
26. `WS.jpeg` → `public/WS.jpeg`
27. `Whisk_a9d6813ad3e9c37877e4536c55cfd0d3dr.jpeg` → `public/Whisk_a9d6813ad3e9c37877e4536c55cfd0d3dr.jpeg`

---

## 📁 FROM ASSETS FOLDER (11 images)

### Logos & Branding:
28. `sfgm-logo-new-blue.png` → `client/src/assets/sfgm-logo-new-blue.png` ⭐ (Most commonly used)
29. `sfgm-logo.png` → `client/src/assets/sfgm-logo.png`
30. `sfgm-logo-blue.png` → `client/src/assets/sfgm-logo-blue.png`
31. `sfgm-logo-1.png` → `client/src/assets/sfgm-logo-1.png`
32. `sfgm-logo-2.png` → `client/src/assets/sfgm-logo-2.png`
33. `sfgm-shield.png` → `client/src/assets/sfgm-shield.png`
34. `sfgm-orlando-logo.png` → `client/src/assets/sfgm-orlando-logo.png`
35. `sfgm-baseball-logo.png` → `client/src/assets/sfgm-baseball-logo.png`
36. `bishop-signature.png` → `client/src/assets/bishop-signature.png`
37. `certificate-group-small.png` → `client/src/assets/certificate-group-small.png`
38. `certificate-group.png` → `client/src/assets/certificate-group.png`

### Other Assets:
39. `church-image.jpg` → `client/src/assets/church-image.jpg`
40. `bridge-hero.png` → `client/src/assets/bridge-hero.png`
41. `baseball-field-image.png` → `client/src/assets/baseball-field-image.png`

---

## 📋 QUICK REFERENCE CHECKLIST

### ⚠️ Files with Spaces (Upload exactly as shown):
- [ ] `Watchmen Logo.jpeg` (space between "Watchmen" and "Logo")
- [ ] `sfgm logo 4 .webp` (spaces in filename)

### ⭐ Most Important (Used Frequently):
- [ ] `sfgm-logo-new-blue.png` (Main logo - used everywhere)
- [ ] `sfgm-shield.png` (Used in certificates and headers)
- [ ] All course cover images (1-18)

---

## 📤 UPLOAD INSTRUCTIONS

1. **Location**: Upload all images to the **ROOT LEVEL** of your R2 bucket
   - Same location as your MP3 audio files
   - No subfolders needed

2. **Filenames**: Upload with **EXACT filenames** as listed above
   - Keep spaces in filenames (e.g., `Watchmen Logo.jpeg`)
   - Keep capitalization exactly as shown
   - Keep file extensions (.png, .jpg, .jpeg, .webp)

3. **Total Count**: 41 images total
   - 27 from public folder
   - 14 from assets folder

---

## ✅ AFTER UPLOAD

Once all images are uploaded to R2:
1. The `getImageUrl()` function will automatically detect R2
2. All images will load from R2 when `VITE_R2_PUBLIC_URL` is set
3. No code changes needed - everything is already set up!

---

## 🔍 HOW TO FIND THESE FILES

### In Finder (Mac):
1. Navigate to: `/Users/rocky/Desktop/SFGM Boston Website:App  /public/`
2. Look for all .jpg, .jpeg, .png, .webp files (except in uploads folder)

### In Finder (Mac) - Assets:
1. Navigate to: `/Users/rocky/Desktop/SFGM Boston Website:App  /client/src/assets/`
2. Look for all image files

### Quick Terminal Command:
```bash
# See all public images
ls -la "/Users/rocky/Desktop/SFGM Boston Website:App  /public/"*.{jpg,jpeg,png,webp}

# See all asset images  
ls -la "/Users/rocky/Desktop/SFGM Boston Website:App  /client/src/assets/"*.{jpg,jpeg,png,webp}
```

---

## 📝 NOTES

- All images should be uploaded to R2 root level (same as audio files)
- The `getImageUrl()` utility handles URL encoding automatically
- Spaces in filenames are handled correctly
- After upload, images will work immediately (no code changes needed)





