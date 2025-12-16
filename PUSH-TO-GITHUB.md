# 🚀 Push Code to New GitHub Repository

## Quick Steps to Push Your Code

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Name:** `Render Deployment Token`
4. **Expiration:** Choose 90 days or No expiration
5. **Select scopes:**
   - ✅ **`repo`** (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you'll only see it once!

### Step 2: Push Your Code

Run this command in your terminal:

```bash
cd ~/Desktop && DIRNAME=$(find . -maxdepth 1 -name "*SFGM*" -type d | head -1) && cd "$DIRNAME" && git push -u origin main
```

When prompted:
- **Username:** `Pastor-rocky`
- **Password:** Paste your personal access token (NOT your GitHub password)

---

## Alternative: Use GitHub CLI (If You Prefer)

If you have GitHub CLI installed:

```bash
gh auth login
```

Then push:
```bash
git push -u origin main
```

---

## After Pushing

Once the push succeeds:
1. ✅ Go to: https://github.com/Pastor-rocky/sfgm-boston-website-app
2. ✅ Verify all your files are there
3. ✅ Go back to Render dashboard
4. ✅ Connect this new repository
5. ✅ Deploy!

