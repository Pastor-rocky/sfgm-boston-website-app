import type { Request, Response } from "express";

const AUTH_COOKIE = "auth_token";
const LEGACY_AUTH_COOKIE = "authToken";

export function extractAuthToken(req: Request): string | undefined {
  const headerToken = req.headers.authorization?.replace("Bearer ", "");
  const cookieToken = (req as any).cookies?.[AUTH_COOKIE];
  const legacyCookieToken = (req as any).cookies?.[LEGACY_AUTH_COOKIE];

  return headerToken || cookieToken || legacyCookieToken || undefined;
}

export function setAuthCookies(res: Response, token: string, maxAgeDays: number) {
  const secure = process.env.NODE_ENV === "production";
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  res.cookie(LEGACY_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: maxAgeMs,
  });

  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: maxAgeMs,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(AUTH_COOKIE);
  res.clearCookie(LEGACY_AUTH_COOKIE);
}

export function buildAuthResponse(user: any, token: string) {
  const role = (user?.role || "").toLowerCase();
  const redirectUrl = user?.primaryRole === "dean" || role === "dean"
    ? "/instructor-portal"
    : role === "admin"
      ? "/admin"
      : role === "instructor"
        ? "/instructor-portal"
        : "/dashboard";

  return {
    token,
    user: {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      role: user?.role,
      redirectUrl,
      phone: user?.phone ?? null,
      dateOfBirth: user?.dateOfBirth ?? null,
      sfgmChurch: user?.sfgmChurch ?? null,
      favoriteScripture: user?.favoriteScripture ?? null,
      profileImageUrl: user?.profileImageUrl ?? null,
    },
  };
}


