# Google Sign-In Setup (Free)

Google OAuth is **free** for normal sign-in volumes.

## 1. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create or select a project (e.g. **SFGM Boston**)
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (or Internal if you use Google Workspace)
   - App name: **SFGM Boston Bible School**
   - Support email: your ministry email
   - Authorized domains: `sfgmboston.com`
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `SFGM Boston Web`

## 2. Authorized redirect URIs

Add **both**:

| Environment | Redirect URI |
|-------------|----------------|
| Local | `http://localhost:56000/api/auth/google/callback` |
| Production | `https://sfgmboston.com/api/auth/google/callback` |

## 3. Environment variables

**Local `.env`:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:56000/api/auth/google/callback
```

**Render (production):**
```env
GOOGLE_CLIENT_ID=same-as-above
GOOGLE_CLIENT_SECRET=same-as-above
GOOGLE_CALLBACK_URL=https://sfgmboston.com/api/auth/google/callback
APP_URL=https://sfgmboston.com
```

## 4. Test

1. Restart dev server
2. Visit `/login` or `/register`
3. **Continue with Google** should appear when credentials are set
4. After sign-in, you land on the student dashboard

## Notes

- New Google users get a student account automatically (email verified).
- If the email already exists, Google signs into that account.
- OAuth users have no password — they sign in with Google going forward.
