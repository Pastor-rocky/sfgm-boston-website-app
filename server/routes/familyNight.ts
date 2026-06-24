import type { Express, NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { getFamilyNightLeaderboard } from "../services/familyNightLeaderboard";
import {
  clampQuestionIndex,
  getFamilyNightLiveState,
  getFinalExamDisplayQuestions,
  parseViewMode,
  resetFamilyNightLiveState,
  updateFamilyNightLiveState,
} from "../services/familyNightLive";
import {
  FAMILY_NIGHT_CYCLE,
  FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO,
  FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL,
  formatFinalExamCountdown,
  getFinalExamCountdownParts,
  isFinalExamScheduleOpen,
} from "../../shared/family-night";

function requireInstructor(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: { role?: string } }).user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const role = (user.role || "").toLowerCase();
  if (!["instructor", "admin", "dean"].includes(role)) {
    return res.status(403).json({ message: "Instructor access required" });
  }
  next();
}

const liveStateSchema = z.object({
  activeQuestionIndex: z.number().int().min(0).nullable().optional(),
  viewMode: z.enum(["split", "question", "leaderboard"]).optional(),
});

async function buildLeaderboardPayload() {
  const leaderboard = await getFamilyNightLeaderboard();
  return {
    ...leaderboard,
    cycle: FAMILY_NIGHT_CYCLE,
  };
}

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
      cycle: FAMILY_NIGHT_CYCLE,
    });
  });

  router.get("/api/family-night/leaderboard/public", async (_req, res) => {
    try {
      const payload = await buildLeaderboardPayload();
      res.json(payload);
    } catch (error) {
      console.error("Family Night public leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch Family Night leaderboard" });
    }
  });

  router.get("/api/family-night/leaderboard", requireAuth, async (_req, res) => {
    try {
      const payload = await buildLeaderboardPayload();
      res.json(payload);
    } catch (error) {
      console.error("Family Night leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch Family Night leaderboard" });
    }
  });

  router.get("/api/family-night/live/questions", async (_req, res) => {
    try {
      const questions = await getFinalExamDisplayQuestions();
      res.json({
        cycle: FAMILY_NIGHT_CYCLE,
        questions,
      });
    } catch (error) {
      console.error("Family Night live questions error:", error);
      res.status(500).json({ message: "Failed to fetch final exam questions" });
    }
  });

  router.get("/api/family-night/live/state", (_req, res) => {
    res.json({
      cycle: FAMILY_NIGHT_CYCLE,
      state: getFamilyNightLiveState(),
    });
  });

  router.post("/api/family-night/live/state", requireAuth, requireInstructor, async (req, res) => {
    try {
      const parsed = liveStateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid live state", errors: parsed.error.flatten() });
      }

      const questions = await getFinalExamDisplayQuestions();
      const patch: Parameters<typeof updateFamilyNightLiveState>[0] = {};

      if (parsed.data.viewMode !== undefined) {
        patch.viewMode = parseViewMode(parsed.data.viewMode);
      }

      if (parsed.data.activeQuestionIndex !== undefined) {
        patch.activeQuestionIndex = clampQuestionIndex(
          parsed.data.activeQuestionIndex,
          questions.length,
        );
      }

      const state = updateFamilyNightLiveState(patch);
      res.json({ cycle: FAMILY_NIGHT_CYCLE, state });
    } catch (error) {
      console.error("Family Night live state update error:", error);
      res.status(500).json({ message: "Failed to update live state" });
    }
  });

  router.post("/api/family-night/live/reset", requireAuth, requireInstructor, (_req, res) => {
    const state = resetFamilyNightLiveState();
    res.json({ cycle: FAMILY_NIGHT_CYCLE, state });
  });

  app.use(router);
}
