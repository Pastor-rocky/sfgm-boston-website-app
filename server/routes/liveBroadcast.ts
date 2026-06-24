import type { Express, NextFunction, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { parseYouTubeVideoId } from "../../shared/live-broadcast";
import {
  clearLiveBroadcastOverride,
  getLiveBroadcastState,
  setLiveBroadcastVideo,
} from "../services/liveBroadcast";
import { refreshYouTubeLiveNow } from "../services/youtubeLiveDetect";

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

const setVideoSchema = z.object({
  videoId: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  title: z.string().max(120).nullable().optional(),
});

export function registerLiveBroadcastRoutes(app: Express) {
  app.get("/api/live-broadcast", (_req, res) => {
    res.json(getLiveBroadcastState());
  });

  app.post("/api/live-broadcast/refresh", async (_req, res) => {
    try {
      await refreshYouTubeLiveNow();
      res.json(getLiveBroadcastState());
    } catch (error) {
      console.error("Live broadcast refresh error:", error);
      res.status(500).json({ message: "Failed to refresh live status" });
    }
  });

  app.post("/api/live-broadcast/video", requireAuth, requireInstructor, (req, res) => {
    const parsed = setVideoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const fromUrl = parseYouTubeVideoId(parsed.data.videoUrl);
    const fromId = parseYouTubeVideoId(parsed.data.videoId);
    const videoId = fromUrl || fromId || null;

    const state = setLiveBroadcastVideo(videoId, parsed.data.title ?? undefined);
    res.json(state);
  });

  app.post("/api/live-broadcast/clear", requireAuth, requireInstructor, (_req, res) => {
    res.json(clearLiveBroadcastOverride());
  });
}
