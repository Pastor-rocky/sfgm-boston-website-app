import type { Express, Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { extractAuthToken, setAuthCookies, clearAuthCookies, buildAuthResponse } from "../utils/auth";

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

  router.post("/login", async (req: Request, res: Response) => {
    try {
      const payload = loginSchema.parse(req.body);
      const identifier = resolveIdentifier(payload);

      const user = await findUserForLogin(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.password) {
        return res.status(400).json({ message: "Please use Google login for this account" });
      }

      const passwordMatch = await bcrypt.compare(payload.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = `sfgm_${user.id}_${Date.now()}`;
      const maxAgeDays = payload.keepLoggedIn ? 30 : 7;

      await storage.setUserToken(user.id, token, maxAgeDays);
      await storage.updateUserActivity(user.id, token);

      setAuthCookies(res, token, maxAgeDays);

      return res.json(buildAuthResponse(user, token));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // In development, show more details; in production, show generic message
      return res.status(500).json({ 
        message: process.env.NODE_ENV === 'development' 
          ? `Unable to login: ${errorMessage}` 
          : "Unable to login right now. Please try again later."
      });
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
        gender: "Male", // Default value for database requirement
        profileCompleted: false,
        role: "student",
        emailVerified: true, // Automatically verified - no confirmation needed
        registrationMethod: "email",
      } as any);

      const token = `sfgm_${newUser.id}_${Date.now()}`;

      await storage.setUserToken(newUser.id, token, 7);
      await storage.updateUserActivity(newUser.id, token);

      setAuthCookies(res, token, 7);

      return res.status(201).json(buildAuthResponse(newUser, token));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Unable to register right now" });
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

  app.use("/api/auth", router);
}

