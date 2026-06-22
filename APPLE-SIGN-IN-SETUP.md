# Sign in with Apple Setup

Apple Sign In is **free to use**, but requires an **Apple Developer Program** membership (**$99/year**) to configure for the web.

## 1. Apple Developer account

1. Enroll at [developer.apple.com](https://developer.apple.com/programs/)
2. Wait for approval

## 2. Register identifiers

1. **Certificates, Identifiers & Profiles → Identifiers**
2. Create an **App ID** (if you don't have one) with **Sign In with Apple** enabled
3. Create a **Services ID** (this is your web `APPLE_CLIENT_ID`)
   - Example: `com.sfgmboston.web`
   - Enable **Sign In with Apple**
   - Configure **Web Domain**: `sfgmboston.com`
   - **Return URLs**:
     - `https://sfgmboston.com/api/auth/apple/callback`
     - `http://localhost:56000/api/auth/apple/callback` (for local testing)

## 3. Create a Sign In with Apple key

1. **Keys → +** → enable **Sign In with Apple**
2. Download the `.p8` private key (only once)
3. Note the **Key ID** and your **Team ID** (top-right of developer portal)

## 4. Environment variables

```env
APPLE_CLIENT_ID=com.sfgmboston.web
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=https://sfgmboston.com/api/auth/apple/callback
```

For Render, paste the private key with `\n` for line breaks, or use a single line with escaped newlines.

**Local:**
```env
APPLE_CALLBACK_URL=http://localhost:56000/api/auth/apple/callback
```

## 5. Test

1. Restart server / redeploy
2. **Continue with Apple** appears on `/login` and `/register` when all Apple vars are set

## Notes

- Apple may hide the user's real email (private relay) — still works for login.
- Apple only sends the user's **name on the first authorization**.
- Start with **Google** (free, no annual fee) if Apple Developer enrollment is not ready yet.
