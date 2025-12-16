import type { Express, Request, Response } from "express";
import { Router } from "express";

import {
  analyzeGreekHebrewWord,
  getHistoricalContext,
  getCrossReferences,
  getMultiDenominationalCommentary,
  generateStudyPlans,
  searchConcordance,
} from "../bibleStudyAI";

export function registerBibleRoutes(app: Express) {
  const router = Router();

  router.post("/bible/greek-hebrew", async (req: Request, res: Response) => {
    try {
      const { word } = req.body || {};
      if (!word || !String(word).trim()) return res.status(400).json({ message: "word is required" });
      const data = await analyzeGreekHebrewWord(String(word).trim());
      res.json(data);
    } catch (error: any) {
      console.error("AI greek-hebrew error:", error);
      res.status(500).json({ message: error.message || "Failed to analyze word" });
    }
  });

  router.post("/bible/historical-context", async (req: Request, res: Response) => {
    try {
      const { passage } = req.body || {};
      if (!passage || !String(passage).trim()) return res.status(400).json({ message: "passage is required" });
      const data = await getHistoricalContext(String(passage).trim());
      res.json(data);
    } catch (error: any) {
      console.error("AI historical-context error:", error);
      res.status(500).json({ message: error.message || "Failed to get historical context" });
    }
  });

  router.post("/bible/cross-references", async (req: Request, res: Response) => {
    try {
      const { verse } = req.body || {};
      if (!verse || !String(verse).trim()) return res.status(400).json({ message: "verse is required" });
      const data = await getCrossReferences(String(verse).trim());
      res.json(data);
    } catch (error: any) {
      console.error("AI cross-references error:", error);
      res.status(500).json({ message: error.message || "Failed to get cross references" });
    }
  });

  router.post("/bible/commentary", async (req: Request, res: Response) => {
    try {
      const { verse } = req.body || {};
      if (!verse || !String(verse).trim()) return res.status(400).json({ message: "verse is required" });
      const data = await getMultiDenominationalCommentary(String(verse).trim());
      res.json(data);
    } catch (error: any) {
      console.error("AI commentary error:", error);
      res.status(500).json({ message: error.message || "Failed to get commentary" });
    }
  });

  router.post("/bible/study-plans", async (_req: Request, res: Response) => {
    try {
      const data = await generateStudyPlans();
      res.json(data);
    } catch (error: any) {
      console.error("AI study-plans error:", error);
      res.status(500).json({ message: error.message || "Failed to generate study plans" });
    }
  });

  router.post("/bible/concordance", async (req: Request, res: Response) => {
    try {
      const { keyword } = req.body || {};
      if (!keyword || !String(keyword).trim()) return res.status(400).json({ message: "keyword is required" });
      const data = await searchConcordance(String(keyword).trim());
      res.json(data);
    } catch (error: any) {
      console.error("AI concordance error:", error);
      res.status(500).json({ message: error.message || "Failed to search concordance" });
    }
  });

  app.use("/api", router);
}


