# 🔧 Login Fixes - January 28, 2026

## ✅ Issues Fixed

### 1. Removed All Google OAuth Code
- ✅ Removed Google OAuth button from login page
- ✅ Removed all Google OAuth routes and strategy
- ✅ Removed Passport initialization
- ✅ Cleaned up all dead code

### 2. Fixed 404 Error on `/api/auth/login`

**Problem**: Production was returning 404 for login endpoint

**Root Cause**: The `serveStatic` function in `server/vite.ts` had a catch-all route `app.use("*", ...)` that was serving `index.html` for ALL routes, including API routes like `/api/auth/login`. This intercepted the API route before it could reach the actual handler.

**Fix**: Modified `serveStatic` to exclude `/api/*` routes from the catch-all:
```typescript
app.use("*", (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "The requested resource was not found.", code: "NOT_FOUND" });
  }
  res.sendFile(path.resolve(distPath, "index.html"));
});
```

**Result**: 
- ✅ API routes now reach their handlers correctly
- ✅ `/api/auth/login` will return proper 401 for invalid credentials (not 404)
- ✅ Static file serving still works for frontend routes

## Files Changed

1. `server/vite.ts` - Fixed catch-all route
2. `server/routes/auth.ts` - Removed Google OAuth code
3. `server/routes.ts` - Removed Passport initialization  
4. `client/src/pages/login.tsx` - Removed Google button

## Testing

After deployment:
- ✅ `/api/auth/login` should return 401 for invalid credentials (not 404)
- ✅ Login page should have no Google button
- ✅ All API routes should work correctly

