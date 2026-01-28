import type { Express, Request, Response } from "express";
import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";

export function registerInstructorApplicationRoutes(app: Express) {
  const router = Router();

  router.post("/api/instructor-applications", requireAuth, async (req: any, res: Response) => {
    try {
      const user = req.user;
      if (!user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const {
        teachingExperience,
        subjectsOfInterest,
        ministry_background,
        motivation,
        availability,
        additionalComments,
        courseOfInterest,
        sfgmChurch,
        churchPosition,
        phone,
      } = req.body;

      const firstName = (user.firstName ?? "").trim() || "Applicant";
      const lastName = (user.lastName ?? "").trim() || "";
      const email = (user.email ?? "").trim();
      const phoneValue = (typeof phone === "string" && phone.trim()) || (user.phone ?? "").trim();

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!phoneValue) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      if (!teachingExperience?.trim()) {
        return res.status(400).json({ message: "Teaching experience is required" });
      }
      if (!subjectsOfInterest?.trim()) {
        return res.status(400).json({ message: "Subjects of interest is required" });
      }
      if (!ministry_background?.trim()) {
        return res.status(400).json({ message: "Ministry background is required" });
      }
      if (!motivation?.trim()) {
        return res.status(400).json({ message: "Motivation for teaching is required" });
      }

      const application = await storage.submitInstructorApplication({
        applicantId: user.id,
        firstName,
        lastName: lastName || ".",
        email,
        phone: phoneValue.slice(0, 20),
        qualifications: String(subjectsOfInterest).trim(),
        experience: String(teachingExperience).trim(),
        ministry: String(ministry_background).trim(),
        motivation: String(motivation).trim(),
        courseOfInterest: courseOfInterest?.trim() || null,
        sfgmChurch: sfgmChurch?.trim()?.slice(0, 255) || null,
        churchPosition: churchPosition?.trim() || null,
        availability: availability?.trim() || null,
        additionalComments: additionalComments?.trim() || null,
      });

      res.status(201).json(application);
    } catch (error) {
      console.error("Error submitting instructor application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.use(router);
}
