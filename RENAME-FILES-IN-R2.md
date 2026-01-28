# Rename Files in R2

## The Problem

Files in R2 have the OLD names (with emoji and spaces):
- ❌ `Act in Action 🎬 Cp1.mp3`
- ❌ `Act in Action 🎬 Cp2.mp3`
- etc.

But your code expects URL-safe names:
- ✅ `acts-in-action-cp1.mp3`
- ✅ `acts-in-action-cp2.mp3`
- etc.

## Solution: Rename Files in R2

Unfortunately, R2 doesn't have a "rename" feature. You have two options:

### Option 1: Delete and Re-upload (Easiest)

1. **Delete the old files:**
   - In R2 dashboard, click each file
   - Click "Delete" or select all and delete

2. **Upload the renamed files:**
   - Use the files from: `client/public/uploads/textbook-audio/`
   - These are already renamed: `acts-in-action-cp1.mp3`, etc.
   - Drag and drop or upload them

### Option 2: Update Code to Use Old Names (Not Recommended)

Change the code to use the old file names, but this defeats the purpose of renaming.

## Recommended: Option 1

Delete the old files and upload the renamed ones from your local folder.

## Files to Upload (from local):

```
client/public/uploads/textbook-audio/acts-in-action-cp1.mp3
client/public/uploads/textbook-audio/acts-in-action-cp2.mp3
client/public/uploads/textbook-audio/acts-in-action-cp3.mp3
client/public/uploads/textbook-audio/acts-in-action-cp4.mp3
client/public/uploads/textbook-audio/acts-in-action-cp5.mp3
client/public/uploads/textbook-audio/acts-in-action-cp6.mp3
client/public/uploads/textbook-audio/acts-in-action-cp7.mp3
client/public/uploads/textbook-audio/acts-in-action-cp8.mp3
client/public/uploads/textbook-audio/acts-in-action-cp9.mp3
client/public/uploads/textbook-audio/acts-in-action-cp10.mp3
```

These are the files with the correct names that your code expects.






