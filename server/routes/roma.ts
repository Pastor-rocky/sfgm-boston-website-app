/**
 * Copy to: server/routes/roma.ts
 * Register with: registerRomaRoutes(app);
 */
import type { Express, Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { romaChildren, romaFamilies, users } from "../../shared/schema";
import { extractAuthToken, setAuthCookies, buildAuthResponse } from "../utils/auth";
import { sendErrorResponse } from "../utils/errorHandler";

const CLASSROOM_BASE =
  process.env.ROMA_CLASSROOM_URL || "https://roma-academy-classroom.pages.dev";

const childSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  grade: z.string().optional(),
});

const registerSchema = z.object({
  parentFirstName: z.string().min(1),
  parentLastName: z.string().min(1),
  parent2Name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  schoolDistrict: z.string().optional(),
  children: z.array(childSchema).min(1),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
  keepLoggedIn: z.boolean().optional(),
});

const familyUpdateSchema = registerSchema.omit({ password: true }).extend({
  password: z.string().min(6).optional(),
});

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}

async function findUserForLogin(identifier: string) {
  const id = identifier.trim();
  if (!id) return undefined;
  if (id.includes("@")) {
    const byEmail = await storage.getUserByEmail(id.toLowerCase());
    if (byEmail) return byEmail;
  }
  if (/^[\d\s\-\(\)\+]+$/.test(id)) {
    const byPhone = await storage.getUserByPhone(normalizePhone(id));
    if (byPhone) return byPhone;
  }
  return storage.getUserByUsername(id);
}

async function loadFamilyBundle(userId: string) {
  const [family] = await db.select().from(romaFamilies).where(eq(romaFamilies.userId, userId));
  if (!family) return null;
  const children = await db
    .select()
    .from(romaChildren)
    .where(eq(romaChildren.familyId, family.id))
    .orderBy(asc(romaChildren.sortOrder));
  return { family, children };
}

function publicFamily(bundle: NonNullable<Awaited<ReturnType<typeof loadFamilyBundle>>>) {
  const { family, children } = bundle;
  return {
    parentFirstName: family.parentFirstName,
    parentLastName: family.parentLastName,
    parent2Name: family.parent2Name || "",
    email: family.email,
    phone: family.phone,
    addressLine1: family.addressLine1 || "",
    city: family.city || "",
    state: family.state || "MA",
    zip: family.zip || "",
    schoolDistrict: family.schoolDistrict || "",
    children: children.map((c) => ({
      fullName: c.fullName,
      dateOfBirth: c.dateOfBirth,
      grade: c.grade || "Preschool",
    })),
  };
}

function handoffUrl(family: ReturnType<typeof publicFamily>, token: string) {
  const payload = Buffer.from(
    encodeURIComponent(JSON.stringify({ ...family, token })),
    "utf8"
  ).toString("base64");
  // Land on Forms so district docs autofill from this family right away.
  return `${CLASSROOM_BASE}/?romaFamily=${encodeURIComponent(payload)}#documents`;
}

async function replaceChildren(familyId: number, children: z.infer<typeof childSchema>[]) {
  await db.delete(romaChildren).where(eq(romaChildren.familyId, familyId));
  if (!children.length) return;
  await db.insert(romaChildren).values(
    children.map((c, i) => ({
      familyId,
      fullName: c.fullName.trim(),
      dateOfBirth: c.dateOfBirth.trim(),
      grade: c.grade || "Preschool",
      sortOrder: i,
    }))
  );
}

export function registerRomaRoutes(app: Express) {
  const router = Router();

  router.post("/register", async (req: Request, res: Response) => {
    try {
      const payload = registerSchema.parse(req.body);
      const email = payload.email.toLowerCase();
      const phone = normalizePhone(payload.phone);

      if (await storage.getUserByEmail(email)) {
        return res.status(409).json({ message: "Email already registered" });
      }
      if (await storage.getUserByPhone(phone)) {
        return res.status(409).json({ message: "Phone number already registered" });
      }

      const usernameBase = `roma_${payload.parentLastName}${payload.parentFirstName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 18);
      let username = usernameBase || `roma${Date.now().toString().slice(-6)}`;
      let n = 1;
      while (await storage.getUserByUsername(username)) {
        username = `${usernameBase}${n++}`;
      }

      const id = `roma_${randomUUID()}`;
      const hashed = await bcrypt.hash(payload.password, 10);
      const newUser = await storage.createUser({
        id,
        email,
        username,
        password: hashed,
        firstName: payload.parentFirstName,
        lastName: payload.parentLastName,
        phone,
        gender: "Male",
        profileCompleted: true,
        role: "student",
        emailVerified: true,
        registrationMethod: "email",
        sfgmChurch: "SFGM Boston / Roma Academy",
      } as any);

      const [family] = await db
        .insert(romaFamilies)
        .values({
          userId: newUser.id,
          parentFirstName: payload.parentFirstName.trim(),
          parentLastName: payload.parentLastName.trim(),
          parent2Name: payload.parent2Name?.trim() || null,
          email,
          phone,
          addressLine1: payload.addressLine1?.trim() || null,
          city: payload.city?.trim() || null,
          state: payload.state?.trim() || "MA",
          zip: payload.zip?.trim() || null,
          schoolDistrict: payload.schoolDistrict?.trim() || null,
        })
        .returning();

      await replaceChildren(family.id, payload.children);

      const token = `sfgm_${newUser.id}_${Date.now()}`;
      await storage.setUserToken(newUser.id, token, 30);
      setAuthCookies(res, token, 30);

      const bundle = await loadFamilyBundle(newUser.id);
      const familyPublic = publicFamily(bundle!);
      return res.status(201).json({
        ...buildAuthResponse(newUser, token),
        family: familyPublic,
        classroomUrl: handoffUrl(familyPublic, token),
        user: { ...buildAuthResponse(newUser, token).user, redirectUrl: "/roma-academy" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "Roma Registration");
    }
  });

  router.post("/login", async (req: Request, res: Response) => {
    try {
      const payload = loginSchema.parse(req.body);
      const user = await findUserForLogin(payload.identifier);
      if (!user?.password) return res.status(401).json({ message: "Invalid credentials" });
      const ok = await bcrypt.compare(payload.password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const bundle = await loadFamilyBundle(user.id);
      if (!bundle) {
        return res.status(404).json({
          message: "No Roma Academy family on this account. Register at /roma-academy/register.",
        });
      }

      const days = payload.keepLoggedIn ? 30 : 7;
      const token = `sfgm_${user.id}_${Date.now()}`;
      await storage.setUserToken(user.id, token, days);
      setAuthCookies(res, token, days);

      const familyPublic = publicFamily(bundle);
      return res.json({
        ...buildAuthResponse(user, token),
        family: familyPublic,
        classroomUrl: handoffUrl(familyPublic, token),
        user: { ...buildAuthResponse(user, token).user, redirectUrl: "/roma-academy" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "Roma Login");
    }
  });

  router.get("/family", async (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req);
      if (!token) return res.status(401).json({ message: "Sign in required" });
      const user = await storage.getUserByToken(token);
      if (!user) return res.status(401).json({ message: "Sign in required" });
      const bundle = await loadFamilyBundle(user.id);
      if (!bundle) return res.status(404).json({ message: "No family profile" });
      return res.json({ family: publicFamily(bundle) });
    } catch (error) {
      sendErrorResponse(res, error, "Roma Family");
    }
  });

  router.put("/family", async (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req);
      if (!token) return res.status(401).json({ message: "Sign in required" });
      const user = await storage.getUserByToken(token);
      if (!user) return res.status(401).json({ message: "Sign in required" });

      const payload = familyUpdateSchema.parse(req.body);
      const [family] = await db.select().from(romaFamilies).where(eq(romaFamilies.userId, user.id));
      if (!family) return res.status(404).json({ message: "No family profile" });

      await db
        .update(romaFamilies)
        .set({
          parentFirstName: payload.parentFirstName.trim(),
          parentLastName: payload.parentLastName.trim(),
          parent2Name: payload.parent2Name?.trim() || null,
          email: payload.email.toLowerCase(),
          phone: normalizePhone(payload.phone),
          addressLine1: payload.addressLine1?.trim() || null,
          city: payload.city?.trim() || null,
          state: payload.state?.trim() || "MA",
          zip: payload.zip?.trim() || null,
          schoolDistrict: payload.schoolDistrict?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(romaFamilies.id, family.id));

      await replaceChildren(family.id, payload.children);

      if (payload.password) {
        const hashed = await bcrypt.hash(payload.password, 10);
        await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));
      }

      const bundle = await loadFamilyBundle(user.id);
      return res.json({ family: publicFamily(bundle!) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid payload" });
      }
      sendErrorResponse(res, error, "Roma Family Update");
    }
  });

  router.get("/classroom-handoff", async (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req);
      if (!token) return res.status(401).json({ message: "Sign in required" });
      const user = await storage.getUserByToken(token);
      if (!user) return res.status(401).json({ message: "Sign in required" });
      const bundle = await loadFamilyBundle(user.id);
      if (!bundle) return res.status(404).json({ message: "No family profile" });
      const familyPublic = publicFamily(bundle);
      return res.json({ url: handoffUrl(familyPublic, token), family: familyPublic });
    } catch (error) {
      sendErrorResponse(res, error, "Roma Classroom Handoff");
    }
  });

  app.use("/api/roma", router);
}
