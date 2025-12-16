# Course File Reference Guide

This document maps course IDs to their source folders and file locations.

## Course Folder Locations

### SFGM Orlando Courses
- **Course 1: Acts in Action** → `SFGM Orlando Courses/(1) Acts in Actions  🎬 Course /`
  - Audio: `Mp3/` folder
  - Textbooks: `Text Book/` folder
  - Quizzes: `Quizs/` folder
  - Images: `Img/` folder

- **Course 2: Becoming a Fire Starter** → `SFGM Orlando Courses/(3) fire starter 🔥Course/`
  - Audio: `Mp3/` folder (chapters 1-10)
  - Textbooks: `Text-Book/` folder
  - Quizzes: `Quiz/` folder
  - Images: `Img/` folder
  - Videos: `(3) fire starter 🔥Videos : Required reading .pdf`

- **Course 3: Don't be a Jonah** → `SFGM Orlando Courses/(2) Dont be a Jonah 🐋 Course/`
  - Audio: `Mp3/` folder (chapters 1-11)
  - Textbooks: `Tetx-Book/` folder
  - Quizzes: `Quiz/` folder
  - Images: `Img/` folder

- **Course 4: G.R.O.W** → `SFGM Orlando Courses/(4) G.R.O.W 🌱Course /`
  - Audio: `MP3s/` folder
  - Textbooks: `Text-Book/` folder
  - Quizzes: `Quiz /` folder
  - Images: `GROW Img /` folder

- **Course 5: Studying for Service** → `SFGM Orlando Courses/(5) Studying for Service 📚Course/`
  - Audio: `Mp3s/` folder (chapters 1-12)
  - Textbooks: `Text-Book/` folder
  - Quizzes: `Quiz/` folder
  - Images: `img/` folder

- **Course 6: Level Up Leadership** → `SFGM Orlando Courses/6) Level up leadership ⬆️ Course /`

### SFGM Boston Courses
- **Youth Ministry Course** → `SFGM Boston Courses/(2) Youth Ministry Course./`
  - Audio: `Mp3s/` folder (sections 1-5)
  
- **Deaconship Course** → `SFGM Boston Courses/DEACONSHIP COURSE /` or `SFGM Boston Courses/(1) DEACONSHIP COURSE /`
  - Audio: `Mp3s/` folder (chapters 1-5)

## Public Uploads Structure

Audio files are organized in `public/uploads/` by course:

- `public/uploads/textbook-audio/` - Acts in Action audio files
- `public/uploads/firestarter-audio/` - Fire Starter audio files (chapters 1-10)
- `public/uploads/jonah-audio/` - Don't be a Jonah audio files
- `public/uploads/grow-audio/` - G.R.O.W audio files
- `public/uploads/studying-audio/` - Studying for Service audio files
- `public/uploads/youth-ministry-audio/` - Youth Ministry audio files
- `public/uploads/deaconship-audio/` - Deaconship audio files

## Course ID Mapping

Based on database and code analysis:
- Course ID 1: Acts in Action
- Course ID 2: Becoming a Fire Starter (Fire Starter)
- Course ID 3: Don't be a Jonah
- Course ID 4: G.R.O.W
- Course ID 5: Studying for Service
- Course ID 6: Level Up Leadership
- Course ID 7: Introduction to Prophecy
- Course ID 8: The Watchmen Project
- Course ID 9: The Power of Preaching
- Course ID 11: (Fallback)
- Course ID 14: The 5 Levels of Leadership
- Course ID 16: SFGM Man of God Course

## Audio File Naming Convention

- **Acts in Action**: `acts-in-action-cp[1-10].mp3`
- **Fire Starter**: `fire-starter-cp[1-10].mp3`
- **Don't be a Jonah**: `dont-be-a-jonah-ch[1-11].mp3`
- **G.R.O.W**: `grow-cp[1-4].mp3`
- **Studying for Service**: `studying-for-service-cp[1-12].mp3`
- **Youth Ministry**: `youth-ministry-ch[1-5].mp3` or `youth-ministry-section-[1-5].mp3`
- **Deaconship**: `deaconship-cp[1-5].mp3`

## Notes

- All course materials (audio, PDFs, quizzes, images) are stored in the source folders
- Audio files are copied to `public/uploads/` for web serving
- File paths in frontend components should reference the `public/uploads/` structure
- When adding new courses, update this document with the folder structure




























