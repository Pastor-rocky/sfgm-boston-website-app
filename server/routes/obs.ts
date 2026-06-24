import type { Express, NextFunction, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import {
  getObsRelayStatus,
  isObsRelayConfigured,
  queueObsSceneChange,
  queueObsStreamToggle,
  recordObsAgentHeartbeat,
  verifyObsAgentToken,
} from "../services/obsRelay";

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

const heartbeatSchema = z.object({
  token: z.string().min(1),
  scenes: z.array(z.object({ name: z.string().min(1) })),
  currentScene: z.string().nullable(),
  streaming: z.boolean().nullable().optional(),
  label: z.string().nullable().optional(),
});

const sceneSchema = z.object({
  sceneName: z.string().min(1),
});

export function registerObsRoutes(app: Express) {
  app.get("/api/obs/status", requireAuth, requireInstructor, (_req, res) => {
    res.json({
      configured: isObsRelayConfigured(),
      ...getObsRelayStatus(),
    });
  });

  app.post("/api/obs/agent/heartbeat", (req, res) => {
    const parsed = heartbeatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid heartbeat" });
    }
    if (!verifyObsAgentToken(parsed.data.token)) {
      return res.status(401).json({ message: "Invalid agent token" });
    }

    const command = recordObsAgentHeartbeat(parsed.data);
    res.json({ ok: true, command });
  });

  app.post("/api/obs/scene", requireAuth, requireInstructor, (req, res) => {
    const parsed = sceneSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "sceneName is required" });
    }
    if (!isObsRelayConfigured()) {
      return res.status(503).json({ message: "OBS relay is not configured on the server" });
    }
    const ok = queueObsSceneChange(parsed.data.sceneName);
    if (!ok) {
      return res.status(409).json({
        message: "Church OBS agent is offline or scene not found",
        ...getObsRelayStatus(),
      });
    }
    res.json({ ok: true, ...getObsRelayStatus() });
  });

  app.post("/api/obs/stream/toggle", requireAuth, requireInstructor, (_req, res) => {
    if (!isObsRelayConfigured()) {
      return res.status(503).json({ message: "OBS relay is not configured on the server" });
    }
    const ok = queueObsStreamToggle();
    if (!ok) {
      return res.status(409).json({ message: "Church OBS agent is offline" });
    }
    res.json({ ok: true });
  });
}
