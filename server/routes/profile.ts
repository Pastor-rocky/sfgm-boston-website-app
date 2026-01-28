import type { Express, Request, Response } from "express";
import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";

export function registerProfileRoutes(app: Express) {
  const router = Router();

  const ALLOWED_PROFILE_FIELDS = [
    "firstName", "lastName", "email", "phone", "dateOfBirth",
    "favoriteScripture", "profileImageUrl", "sfgmChurch", "bio",
  ] as const;

  router.put("/api/profile", requireAuth, async (req: any, res: Response) => {
    try {
      const user = req.user;
      const raw = req.body || {};
      const profileData: Record<string, unknown> = {};
      for (const key of ALLOWED_PROFILE_FIELDS) {
        if (raw[key] !== undefined) {
          profileData[key] = raw[key] === "" ? null : raw[key];
        }
      }
      const updatedUser = await storage.updateUserProfile(user.id, profileData as any);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.use(router);
}


