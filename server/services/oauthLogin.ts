import { randomUUID } from "crypto";
import type { Response } from "express";
import { storage } from "../storage";
import { setAuthCookies } from "../utils/auth";

type OAuthMethod = "google" | "apple";

const INSTRUCTOR_ROLES = new Set(["instructor", "admin", "dean"]);

function canAccessInstructorPortal(role: string | undefined | null): boolean {
  return INSTRUCTOR_ROLES.has((role || "").toLowerCase());
}

function resolvePostLoginRedirect(
  role: string | undefined | null,
  options?: { returnTo?: string | null; instructorFlow?: boolean },
): string {
  const normalized = (role || "").toLowerCase();
  const returnTo = options?.returnTo?.trim() || "";

  if (options?.instructorFlow) {
    if (returnTo.startsWith("/instructor-portal") && canAccessInstructorPortal(normalized)) {
      return returnTo;
    }
    if (normalized === "dean" || normalized === "instructor") return "/instructor-portal";
    if (normalized === "admin") return "/admin-panel";
    return "/dashboard";
  }

  if (returnTo && !returnTo.startsWith("/instructor-portal") && !returnTo.startsWith("/admin")) {
    return returnTo;
  }
  return "/dashboard";
}

export interface OAuthProfile {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    (process.env.APP_URL
      ? `${process.env.APP_URL.replace(/\/$/, "")}/api/auth/google/callback`
      : process.env.NODE_ENV === "production"
        ? "https://sfgmboston.com/api/auth/google/callback"
        : "http://localhost:56000/api/auth/google/callback");

  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, callbackUrl };
}

export function getAppleOAuthConfig() {
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const callbackUrl =
    process.env.APPLE_CALLBACK_URL?.trim() ||
    (process.env.APP_URL
      ? `${process.env.APP_URL.replace(/\/$/, "")}/api/auth/apple/callback`
      : process.env.NODE_ENV === "production"
        ? "https://sfgmboston.com/api/auth/apple/callback"
        : "http://localhost:56000/api/auth/apple/callback");

  if (!clientId || !teamId || !keyId || !privateKey) return null;
  return { clientId, teamId, keyId, privateKey, callbackUrl };
}

export function getOAuthProviderStatus() {
  return {
    google: Boolean(getGoogleOAuthConfig()),
    apple: Boolean(getAppleOAuthConfig()),
  };
}

export function encodeOAuthState(state: { returnTo?: string; instructor?: boolean }) {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export function decodeOAuthState(value?: string): { returnTo?: string; instructor?: boolean } {
  if (!value) return {};
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

async function ensureUniqueUsername(desired: string) {
  let base = desired
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  if (!base) {
    base = `student${Math.floor(Math.random() * 9999)}`;
  }

  let attempt = base;
  let counter = 1;

  while (await storage.getUserByUsername(attempt)) {
    attempt = `${base}${counter}`;
    counter += 1;
  }

  return attempt;
}

export async function findOrCreateOAuthUser(
  profile: OAuthProfile,
  method: OAuthMethod,
) {
  const email = profile.email.toLowerCase().trim();
  if (!email) {
    throw new Error("Email is required from the sign-in provider");
  }

  let user = await storage.getUserByEmail(email);
  if (user) {
    return user;
  }

  const localPart = email.split("@")[0] || "student";
  const username = await ensureUniqueUsername(localPart);
  const id = `user_${randomUUID()}`;

  user = await storage.createUser({
    id,
    email,
    username,
    password: null,
    firstName: profile.firstName || username,
    lastName: profile.lastName || "",
    role: "student",
    emailVerified: true,
    profileCompleted: false,
    registrationMethod: method,
  } as any);

  return user;
}

export async function issueOAuthSession(
  res: Response,
  user: any,
  options?: { returnTo?: string; instructor?: boolean },
) {
  const token = `sfgm_${user.id}_${Date.now()}`;
  await storage.setUserToken(user.id, token, 7);
  await storage.updateUserActivity(user.id, token);
  setAuthCookies(res, token, 7);

  const redirectUrl = resolvePostLoginRedirect(user.role, {
    returnTo: options?.returnTo,
    instructorFlow: options?.instructor,
  });

  return redirectUrl || "/dashboard";
}

export function oauthFailureRedirect(message: string, instructor?: boolean) {
  const base = instructor ? "/instructor-login" : "/login";
  return `${base}?error=${encodeURIComponent(message)}`;
}
