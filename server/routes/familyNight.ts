import type { Express } from "express";
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getFamilyNightLeaderboard } from "../services/familyNightLeaderboard";
import {
  FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO,
  FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL,
  formatFinalExamCountdown,
  getFinalExamCountdownParts,
  isFinalExamScheduleOpen,
} from "../../shared/family-night";

export function registerFamilyNightRoutes(app: Express) {
  const router = Router();

  router.get("/api/family-night/final-exam-status", (_req, res) => {
    const countdown = getFinalExamCountdownParts();
    res.json({
      isOpen: isFinalExamScheduleOpen(),
      opensAt: FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO,
      opensLabel: FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL,
      countdown,
      countdownLabel: formatFinalExamCountdown(countdown),
      serverNow: new Date().toISOString(),
    });
  });

  router.get("/api/family-night/leaderboard", requireAuth, async (_req, res) => {
    try {
      const leaderboard = await getFamilyNightLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Family Night leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch Family Night leaderboard" });
    }
  });

  app.use(router);
}
