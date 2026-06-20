import type { Express, Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID, randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { storage } from "../storage";
import { db } from "../db";
import { authTokens, passwordResetTokens, users } from "../../shared/schema";
import { extractAuthToken, setAuthCookies, clearAuthCookies, buildAuthResponse } from "../utils/auth";
import { sendErrorResponse } from "../utils/errorHandler";
import { withRetry, isRetryableError, shouldNotRetry } from "../utils/retry";
import { sendWelcomeEmail, sendAdminRegistrationNotification, sendPasswordResetEmail } from "../services/emailService";
import { rateLimit } from "../middleware/rateLimit";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email, username, or phone is required").optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  keepLoggedIn: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(1, "Phone number is required"),
  sfgmChurch: z.string().min(1, "SFGM church is required"),
});

function resolveIdentifier(payload: z.infer<typeof loginSchema>) {
  if (payload.identifier) return payload.identifier.trim();
  if (payload.email) return payload.email.trim();
  if (payload.username) return payload.username.trim();
  if (payload.phone) return payload.phone.trim();
  return "";
}

async function findUserForLogin(identifier: string) {
  if (!identifier) return undefined;

  if (identifier.includes("@")) {
    const byEmail = await storage.getUserByEmail(identifier.toLowerCase());
    if (byEmail) return byEmail;
  }

  if (/^[\d\s\-\(\)\+]+$/.test(identifier)) {
    const numeric = identifier.replace(/\s+/g, "");
    const byPhone = await storage.getUserByPhone(numeric);
    if (byPhone) return byPhone;
  }

  const byUsername = await storage.getUserByUsername(identifier);
  if (byUsername) return byUsername;

  return undefined;
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

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const passwordResetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many password reset attempts. Please try again later.",
  keyGenerator: (req) => `pw-reset:${req.ip || "anonymous"}`,
});

function getAppBaseUrl(req: Request): string {
  const configured = process.env.APP_URL || process.env.PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.get("host");
  if (host) return `${proto}://${host}`;
  return "https://sfgmboston.com";
}

export function registerAuthRoutes(app: Express) {
  const router = Router();

  router.post("/login", async (req: Request, res: Response) => {
    try {
      const payload = loginSchema.parse(req.body);
      const identifier = resolveIdentifier(payload);

      let user;
      try {
        user = await findUserForLogin(identifier);
      } catch (dbError: any) {
        // Database connection errors
        if (dbError?.code === 'ECONNREFUSED' || dbError?.message?.includes('connection') || dbError?.message?.includes('ECONNREFUSED')) {
          console.error("Database connection error during login:", dbError);
          return res.status(503).json({ 
            message: "Database is currently unavailable. Please check your database connection and try again.",
            code: "DATABASE_UNAVAILABLE"
          });
        }

        // Database schema/migration mismatch (e.g. missing columns/tables)
        // These often contain: 'relation ... does not exist' or 'column ... does not exist'
        if (typeof dbError?.message === 'string' && (
          dbError.message.includes('relation') && dbError.message.includes('does not exist') ||
          dbError.message.includes('column') && dbError.message.includes('does not exist')
        )) {
          console.error('Database schema mismatch during login:', dbError.message);
          return res.status(503).json({
            message: 'Database schema is out of date. Please run migrations for the production Neon database.',
            code: 'DB_SCHEMA_MISMATCH',
          });
        }
        throw dbError; // Re-throw if it's not a connection error
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.password) {
        return res.status(400).json({ message: "This account doesn't have a password. Please use the password reset feature or contact support." });
      }

      const passwordMatch = await bcrypt.compare(payload.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = `sfgm_${user.id}_${Date.now()}`;
      const maxAgeDays = payload.keepLoggedIn ? 30 : 7;

      // Use retry logic for token operations
      try {
        await withRetry(
          async () => {
            await storage.setUserToken(user.id, token, maxAgeDays);
            await storage.updateUserActivity(user.id, token);
          },
          {
            maxRetries: 2,
            shouldRetry: (error) => isRetryableError(error) && !shouldNotRetry(error),
          }
        );
      } catch (tokenError: any) {
        // If database is unavailable, still allow login but warn user
        if (tokenError?.code === 'ECONNREFUSED' || tokenError?.message?.includes('connection')) {
          console.error("Database unavailable for token storage:", tokenError);
          // Continue with login but token won't persist - user will need to login again
          console.warn("⚠️  Login succeeded but token storage failed - database unavailable");
        } else {
          throw tokenError;
        }
      }

      setAuthCookies(res, token, maxAgeDays);

      return res.json(buildAuthResponse(user, token));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "User Login");
    }
  });

  router.post("/register", async (req: Request, res: Response) => {
    try {
      const payload = registerSchema.parse(req.body);

      const existing = await storage.getUserByEmail(payload.email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(payload.username.trim().toLowerCase());
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Check if phone is already registered
      const phoneNumber = payload.phone.trim().replace(/\s+/g, "");
      const existingPhone = await storage.getUserByPhone(phoneNumber);
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already registered" });
      }

      const username = await ensureUniqueUsername(payload.username.trim().toLowerCase());

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const id = `user_${randomUUID()}`;
      const registrationDate = new Date();

      // Create user with email automatically verified (no confirmation needed)
      const newUser = await storage.createUser({
        id,
        email: payload.email.toLowerCase(),
        username,
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: payload.dateOfBirth,
        phone: phoneNumber,
        sfgmChurch: payload.sfgmChurch.trim(),
        gender: "Male", // Default value for database requirement
        profileCompleted: false,
        role: "student",
        emailVerified: true, // Automatically verified - no confirmation needed
        registrationMethod: "email",
      } as any);

      const token = `sfgm_${newUser.id}_${Date.now()}`;

      // Use retry logic for token operations
      await withRetry(
        async () => {
          await storage.setUserToken(newUser.id, token, 7);
          await storage.updateUserActivity(newUser.id, token);
        },
        {
          maxRetries: 2,
          shouldRetry: (error) => isRetryableError(error) && !shouldNotRetry(error),
        }
      );

      setAuthCookies(res, token, 7);

      // Fire-and-forget email notifications (do not block registration on email delivery)
      void sendWelcomeEmail({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
        username,
        registrationDate,
      }).catch((err) => console.error("[email] Welcome email failed:", err));

      void sendAdminRegistrationNotification({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
        username,
        registrationDate,
        emailConsent: true,
      }).catch((err) => console.error("[email] Admin registration notification failed:", err));

      return res.status(201).json(buildAuthResponse(newUser, token));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "User Registration");
    }
  });

  router.post("/logout", async (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req);
      if (token) {
        await storage.deleteAuthToken(token);
      }

      clearAuthCookies(res);
      return res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Unable to logout right now" });
    }
  });

  const handleCurrentUser = async (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req);
      if (!token) {
        return res.status(401).json({ message: "No auth token provided" });
      }

      const user = await storage.getUserByToken(token);
      if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({ message: "Invalid auth token" });
      }

      await storage.updateUserActivity(user.id, token);
      return res.json(buildAuthResponse(user, token).user);
    } catch (error) {
      console.error("Fetch current user error:", error);
      return res.status(500).json({ message: "Unable to fetch current user" });
    }
  };

  router.get("/me", handleCurrentUser);
  router.get("/user", handleCurrentUser);

  router.post("/forgot-password", passwordResetRateLimit, async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();
      const genericMessage =
        "If an account exists with that email, you will receive password reset instructions shortly.";

      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user?.email || !user.password) {
        return res.json({ message: genericMessage });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

      await db
        .delete(passwordResetTokens)
        .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const resetUrl = `${getAppBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;

      const emailResult = await sendPasswordResetEmail({
        firstName: user.firstName || user.username || "Student",
        email: user.email,
        resetUrl,
      });

      if (!emailResult.delivered) {
        console.warn("[email] Password reset not delivered:", emailResult.reason, resetUrl);
        if (emailResult.reason?.includes("non-browser")) {
          console.warn(
            "[email] Enable server-side API access at https://dashboard.emailjs.com/admin/account/security",
          );
        }
      }

      return res.json({
        message: genericMessage,
        ...(process.env.NODE_ENV === "development" && !emailResult.delivered
          ? {
              devNote: emailResult.reason?.includes("non-browser")
                ? "EmailJS is blocking server-side sends. In EmailJS → Account → Security, enable API access from non-browser environments, then try again."
                : "Email is not configured locally. Use the reset link below or check the server console.",
              devResetUrl: resetUrl,
            }
          : {}),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid email" });
      }
      sendErrorResponse(res, error, "Forgot Password");
    }
  });

  router.get("/reset-password/validate", async (req: Request, res: Response) => {
    try {
      const token = String(req.query.token || "").trim();
      if (!token) {
        return res.status(400).json({ valid: false, message: "Missing reset token" });
      }

      const [record] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!record) {
        return res.status(400).json({ valid: false, message: "This reset link is invalid or has expired." });
      }

      return res.json({ valid: true });
    } catch (error) {
      sendErrorResponse(res, error, "Validate Reset Token");
    }
  });

  router.post("/reset-password", passwordResetRateLimit, async (req: Request, res: Response) => {
    try {
      const payload = resetPasswordSchema.parse(req.body);

      const [record] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, payload.token),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!record) {
        return res.status(400).json({ message: "This reset link is invalid or has expired." });
      }

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const now = new Date();

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ password: hashedPassword, updatedAt: now })
          .where(eq(users.id, record.userId));

        await tx
          .update(passwordResetTokens)
          .set({ usedAt: now })
          .where(eq(passwordResetTokens.id, record.id));

        await tx.delete(authTokens).where(eq(authTokens.userId, record.userId));
      });

      return res.json({
        message: "Your password has been updated. You can sign in with your new password.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "Reset Password");
    }
  });



  app.use("/api/auth", router);
}

