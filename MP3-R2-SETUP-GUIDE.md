# MP3 R2 Setup Guide

This document explains how MP3 files are connected to pages using R2 cloud storage.

## Overview

All MP3 files are configured to work with both:
- **R2 Cloud Storage** (when `VITE_R2_PUBLIC_URL` environment variable is set)
- **Local Files** (fallback when R2 is not configured)

## Setup Process

### Step 1: Audio Storage Utility

The `client/src/lib/audio-storage.ts` file handles all audio URL generation:

```typescript
import { getAudioUrl } from "@/lib/audio-storage";

// Usage:
const audioSrc = getAudioUrl('filename.mp3');
```

### Step 2: Update Individual Chapter Pages

For each chapter page (e.g., `becoming-a-firestarter-ch1.tsx`):

1. **Add import:**
   ```typescript
   import { getAudioUrl } from "@/lib/audio-storage";
   ```

2. **Update audio src:**
   ```typescript
   // Before:
   const audioSrc = "/uploads/textbook-audio/fire-starter-cp1.mp3";
   
   // After:
   const audioSrc = getAudioUrl('firestarter/fire-starter-cp1.mp3');
   ```

3. **Update audio element:**
   ```tsx
   <audio
     ref={audioRef}
     src={audioSrc}  // or directly: src={getAudioUrl('firestarter/fire-starter-cp1.mp3')}
     preload="metadata"
   />
   ```

### Step 3: Update Complete Ebook Pages

For complete ebook pages (e.g., `becoming-a-firestarter-complete-ebook.tsx`):

1. **Add import:**
   ```typescript
   import { getAudioUrl } from "@/lib/audio-storage";
   ```

2. **Update chapters array:**
   ```typescript
   const chapters = [
     { id: 1, title: "Chapter 1", audioUrl: getAudioUrl('firestarter/fire-starter-cp1.mp3') },
     { id: 2, title: "Chapter 2", audioUrl: getAudioUrl('firestarter/fire-starter-cp2.mp3') },
     // ... etc
   ];
   ```

## Courses Completed

### ✅ Course 2: Becoming a Fire Starter

**Files Updated:**
- `client/src/pages/becoming-a-firestarter-ch1.tsx` through `ch10.tsx` (10 files)
- `client/src/pages/becoming-a-firestarter-complete-ebook.tsx`

**MP3 Files:**
- Pattern: `firestarter/fire-starter-cp1.mp3` through `cp10.mp3`
- Note: The `firestarter/` prefix is stripped for R2 (files are at root level in R2)
- R2 path: `fire-starter-cp1.mp3` (no subfolder)
- Local path: `/uploads/textbook-audio/fire-starter-cp1.mp3`

**Example:**
```typescript
const audioSrc = getAudioUrl('firestarter/fire-starter-cp1.mp3');
// R2: https://pub-xxx.r2.dev/fire-starter-cp1.mp3
// Local: /uploads/textbook-audio/fire-starter-cp1.mp3
```

### ✅ Course 3: Don't Be A Jonah

**Files Updated:**
- `client/src/pages/dont-be-a-jonah-player-ch1.tsx` through `ch11.tsx` (11 files)
- `client/src/pages/dont-be-a-jonah-complete-book.tsx`

**MP3 Files:**
- Pattern: `dont-be-a-jonah-ch1.mp3` through `ch11.mp3`
- Note: No subfolder prefix needed (files are at root level)
- R2 path: `dont-be-a-jonah-ch1.mp3`
- Local path: `/uploads/textbook-audio/dont-be-a-jonah-ch1.mp3`

**Example:**
```typescript
const audioSrc = getAudioUrl('dont-be-a-jonah-ch1.mp3');
// R2: https://pub-xxx.r2.dev/dont-be-a-jonah-ch1.mp3
// Local: /uploads/textbook-audio/dont-be-a-jonah-ch1.mp3
```

## How getAudioUrl() Works

The `getAudioUrl()` function in `client/src/lib/audio-storage.ts`:

1. **Checks for R2 configuration:**
   - If `VITE_R2_PUBLIC_URL` is set → uses R2
   - Otherwise → uses local files

2. **Handles file paths:**
   - For Fire Starter: Strips `firestarter/` prefix for R2
   - For other courses: Uses filename directly
   - Encodes filenames properly for URLs (handles spaces, special chars)

3. **Returns correct URL:**
   - R2: `https://pub-xxx.r2.dev/filename.mp3`
   - Local: `/uploads/textbook-audio/filename.mp3`

## Pattern for Future Courses

When adding MP3 support for new courses:

1. **Identify the file naming pattern:**
   - Check if files use a subfolder prefix (like `firestarter/`)
   - Note the exact filename pattern

2. **Update individual chapter pages:**
   - Add `import { getAudioUrl } from "@/lib/audio-storage";`
   - Replace hardcoded paths with `getAudioUrl('filename.mp3')`

3. **Update complete ebook page (if exists):**
   - Add import
   - Update chapters array to use `getAudioUrl()`

4. **Test:**
   - Verify with R2 enabled
   - Verify local fallback works

## Key Points

- ✅ Always use `getAudioUrl()` instead of hardcoded paths
- ✅ Files in R2 are at root level (no subfolders, even if code uses prefix)
- ✅ The audio-storage utility handles path conversion automatically
- ✅ Works with both R2 and local files seamlessly
- ✅ No code changes needed when switching between R2 and local

## R2 Bucket Structure

Files should be uploaded directly to the R2 bucket root:
```
R2 Bucket Root:
├── fire-starter-cp1.mp3
├── fire-starter-cp2.mp3
├── ...
├── dont-be-a-jonah-ch1.mp3
├── dont-be-a-jonah-ch2.mp3
└── ...
```

No subfolders in R2 - all files at root level.






