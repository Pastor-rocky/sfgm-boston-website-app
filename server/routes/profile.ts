import type { Express, Request, Response } from "express";
import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";

export function registerProfileRoutes(app: Express) {
  const router = Router();

  router.put("/api/profile", requireAuth, async (req: any, res: Response) => {
    try {
      const user = req.user;
      const profileData = req.body;
      const updatedUser = await storage.updateUserProfile(user.id, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.use(router);
}


