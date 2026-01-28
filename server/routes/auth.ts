import type { Express, Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { extractAuthToken, setAuthCookies, clearAuthCookies, buildAuthResponse } from "../utils/auth";
import { sendErrorResponse } from "../utils/errorHandler";
import { withRetry, isRetryableError, shouldNotRetry } from "../utils/retry";

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

export function registerAuthRoutes(app: Express) {
  const router = Router();

  // Log all requests to auth routes for debugging
  router.use((req, res, next) => {
    console.log(`[AUTH ROUTER] ${req.method} ${req.path} - Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`[AUTH ROUTER] Body keys:`, req.body ? Object.keys(req.body) : 'no body');
    next();
  });

  // Simple test endpoint to verify auth routes are accessible
  router.get("/test", (req, res) => {
    res.json({ message: "Auth routes are working!", path: req.path, method: req.method });
  });

  // Test POST endpoint to verify POST requests work
  router.post("/test-post", (req, res) => {
    res.json({ message: "POST requests work!", path: req.path, method: req.method, body: req.body });
  });

  // Duplicate login route right here to test if order matters
  router.post("/login", async (req: Request, res: Response) => {
    res.json({ message: "DUPLICATE LOGIN ROUTE - This should work!", path: req.path });
  });

  router.post("/login-test", async (req: Request, res: Response) => {
    try {
      const payload = loginSchema.parse(req.body);
      const identifier = resolveIdentifier(payload);
      console.log('[LOGIN DEBUG] Attempting login with identifier:', identifier ? identifier.substring(0, 10) + '...' : 'empty');
      console.log('[LOGIN DEBUG] Full request body keys:', Object.keys(payload));

      let user;
      try {
        user = await findUserForLogin(identifier);
      } catch (dbError: any) {
        // Check if it's a database connection error
        if (dbError?.code === 'ECONNREFUSED' || dbError?.message?.includes('connection') || dbError?.message?.includes('ECONNREFUSED')) {
          console.error("Database connection error during login:", dbError);
          return res.status(503).json({ 
            message: "Database is currently unavailable. Please check your database connection and try again.",
            code: "DATABASE_UNAVAILABLE"
          });
        }
        throw dbError; // Re-throw if it's not a connection error
      }
      
      if (!user) {
        console.log('[LOGIN DEBUG] User not found for identifier:', identifier ? identifier.substring(0, 10) + '...' : 'empty');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.password) {
        console.log('[LOGIN DEBUG] User has no password - may need Google login or password reset');
        return res.status(400).json({ message: "This account doesn't have a password. Please use the password reset feature or contact support." });
      }

      const passwordMatch = await bcrypt.compare(payload.password, user.password);
      console.log('[LOGIN DEBUG] Password match:', passwordMatch, 'for user:', user.id);
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


  // Diagnostic endpoint to test login flow
  router.post("/login/diagnostic", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      
      if (!identifier || !password) {
        return res.status(400).json({ 
          error: "Missing identifier or password",
          received: { identifier: !!identifier, password: !!password }
        });
      }

      const user = await findUserForLogin(identifier);
      
      return res.json({
        identifier: identifier.substring(0, 10) + '...',
        userFound: !!user,
        userId: user?.id || null,
        hasPassword: !!user?.password,
        passwordLength: user?.password?.length || 0,
        email: user?.email || null,
        username: user?.username || null,
        sfgmChurch: user?.sfgmChurch || null,
        registrationMethod: user?.registrationMethod || null,
        role: user?.role || null,
        // Don't return password match result for security
      });
    } catch (error: any) {
      return res.status(500).json({ 
        error: "Diagnostic failed",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Mount auth router
  console.log('[AUTH ROUTES] Registering auth routes at /api/auth');
  console.log('[AUTH ROUTES] Available routes:', router.stack.map((r: any) => `${r.route?.methods || 'ALL'} ${r.route?.path || r.regexp}`).join(', '));
  // Catch-all route to debug unmatched requests
  router.use((req, res, next) => {
    console.log(`[AUTH ROUTER CATCH-ALL] ${req.method} ${req.path} - Unmatched route in auth router`);
    next(); // Let it fall through to the main 404 handler
  });

  app.use("/api/auth", router);
}

