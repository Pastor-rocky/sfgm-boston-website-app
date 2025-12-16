import type { Express, Request, Response } from "express";
import { Router } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { eq, and } from "drizzle-orm";

import { db } from "../db";
import * as schema from "../../shared/schema";
import { storage } from "../storage";
import { extractAuthToken } from "../utils/auth";
import { requireAuth } from "../middleware/requireAuth";

const sessionPointsStore: Map<string, number> = new Map();

export function registerMediaRoutes(app: Express) {
  const router = Router();

  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

  router.post("/upload/profile-image", requireAuth, upload.single("profileImage"), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `/uploads/profile-images/${req.file.filename}`;
      res.json({
        success: true,
        imageUrl,
        message: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  router.get("/images", async (req: Request, res: Response) => {
    try {
      const { category, isActive } = req.query;
      const conditions = [];
      if (category) {
        conditions.push(eq(schema.images.category, category as string));
      }
      if (isActive !== undefined) {
        conditions.push(eq(schema.images.isActive, isActive === "true"));
      }
      const images =
        conditions.length > 0 ? await db.select().from(schema.images).where(and(...conditions)) : await db.select().from(schema.images);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  router.post("/images", async (req: Request, res: Response) => {
    try {
      const { name, filename, filePath, altText, category, description, fileSize, width, height, mimeType } = req.body;
      const [newImage] = await db
        .insert(schema.images)
        .values({
          name,
          filename,
          filePath,
          altText,
          category,
          description,
          fileSize,
          width,
          height,
          mimeType,
          isActive: true,
        })
        .returning();
      res.json(newImage);
    } catch (error) {
      console.error("Error creating image record:", error);
      res.status(500).json({ message: "Failed to create image record" });
    }
  });

  router.put("/images/:id", async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const { name, altText, category, description, isActive } = req.body;

      const updatedImage = await db
        .update(schema.images)
        .set({
          name,
          altText,
          category,
          description,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(schema.images.id, imageId))
        .returning();

      if (updatedImage.length === 0) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json(updatedImage[0]);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ message: "Failed to update image" });
    }
  });

  router.delete("/images/:id", async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const deletedImage = await db.delete(schema.images).where(eq(schema.images.id, imageId)).returning();
      if (deletedImage.length === 0) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  router.post("/tts/save", async (req: Request, res: Response) => {
    try {
      const { text, voice = "male", speed = 1.0, filename } = req.body || {};
      if (!text) return res.status(400).json({ message: "text is required" });

      const openaiKey = process.env.OPENAI_API_KEY;
      let audioBuffer: Buffer | null = null;

      if (openaiKey) {
        const voiceMap: Record<string, string> = {
          male: "onyx",
          female: "nova",
          "natural-male": "echo",
          "natural-female": "shimmer",
        };
        const selectedVoice = voiceMap[String(voice)] || "alloy";
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1-hd",
            voice: selectedVoice,
            input: String(text),
            speed: Math.max(0.25, Math.min(4.0, Number(speed) || 1.0)),
            response_format: "mp3",
          }),
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuffer);
        }
      }

      if (!audioBuffer && process.env.AZURE_TTS_KEY) {
        const azureKey = process.env.AZURE_TTS_KEY as string;
        const azureRegion = process.env.AZURE_TTS_REGION || "eastus";
        const voiceMap: Record<string, string> = {
          male: "en-US-DavisNeural",
          female: "en-US-AriaNeural",
          "natural-male": "en-US-JasonNeural",
          "natural-female": "en-US-JennyNeural",
        };
        const selectedVoice = voiceMap[String(voice)] || "en-US-DavisNeural";
        const ratePercent = Math.round(((Number(speed) || 1) - 1) * 100);
        const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        const ssml = `
          <speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="${selectedVoice}">
              <prosody rate="${rateString}">
                ${String(text)}
              </prosody>
            </voice>
          </speak>
        `;
        const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
            "User-Agent": "SFGM-TTS-Service",
          },
          body: ssml,
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuffer);
        }
      }

      if (!audioBuffer) {
        return res.status(503).json({ message: "No TTS provider available or request failed" });
      }

      const safeBase = (filename && String(filename).trim()) || `acts-intro-${Date.now()}`;
      const outDir = path.join(process.cwd(), "uploads", "textbook-audio");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `${safeBase}.mp3`);
      fs.writeFileSync(outPath, audioBuffer);

      const publicUrl = `/uploads/textbook-audio/${path.basename(outPath)}`;
      res.json({ success: true, url: publicUrl, filename: path.basename(outPath) });
    } catch (error: any) {
      console.error("Error saving TTS mp3:", error);
      res.status(500).json({ message: "Failed to generate MP3", error: error?.message });
    }
  });

  router.get("/personal-library", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        console.error("CRITICAL: No userId found in request for personal library");
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // CRITICAL: Always fetch from database, never from memory
      const books = await storage.getUserPersonalLibrary(userId);
      
      console.log(`✓ Fetched ${books.length} books from DATABASE for user ${userId}`);
      
      // Map database fields to frontend expected format
      const mappedBooks = books.map((book: any) => {
        // Handle dateAdded - ensure it's a valid date
        let addedAtDate: string;
        if (book.dateAdded) {
          const date = new Date(book.dateAdded);
          addedAtDate = !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
        } else {
          addedAtDate = new Date().toISOString();
        }
        
        return {
          ...book,
          addedAt: addedAtDate,
          // Ensure all expected fields are present
          title: book.bookTitle || book.title,
          author: book.bookAuthor || book.author,
        };
      });
      
      // CRITICAL: Always return from database, never empty array as fallback
      res.json({ books: mappedBooks });
    } catch (error) {
      console.error("CRITICAL: Error fetching personal library from database:", error);
      res.status(500).json({ message: "Failed to fetch personal library" });
    }
  });

  router.post("/personal-library", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { bookData } = req.body || {};
      if (!bookData?.title || !bookData?.author) {
        return res.status(400).json({ message: "title and author are required" });
      }
      
      // Check if book already exists in library
      const existing = await storage.checkBookInPersonalLibrary(
        userId,
        bookData.title,
        bookData.author
      );
      
      if (existing) {
        return res.json({ success: true, message: "Book already in your library" });
      }
      
      // Add book to database - CRITICAL: This must use database, not memory
      const savedBook = await storage.addBookToPersonalLibrary(userId, {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category || "Unknown",
        description: bookData.description || "",
        difficulty: bookData.difficulty || "Intermediate",
        estimatedReadingTime: bookData.estimatedReadingTime || "",
        coverColor: bookData.coverColor || "bg-slate-500",
        readingStatus: bookData.readingStatus || "want_to_read",
        pdfUrl: bookData.pdfUrl || null,
        coverUrl: bookData.coverUrl || null,
      });
      
      // Verify the book was actually saved to the database
      if (!savedBook || !savedBook.id) {
        console.error(`CRITICAL: Book save failed for user ${userId}:`, bookData);
        return res.status(500).json({ message: "Failed to save book to database" });
      }
      
      // Double-check by querying the database
      const verification = await storage.checkBookInPersonalLibrary(
        userId,
        bookData.title,
        bookData.author
      );
      
      if (!verification) {
        console.error(`CRITICAL: Book verification failed after save for user ${userId}:`, {
          title: bookData.title,
          author: bookData.author,
          savedBookId: savedBook.id
        });
        return res.status(500).json({ message: "Book was not properly saved to database" });
      }
      
      console.log(`✓ Book successfully saved to DATABASE for user ${userId}:`, {
        id: savedBook.id,
        title: bookData.title,
        author: bookData.author,
        userId: userId
      });
      
      res.json({ success: true, message: "Book added to your library", book: savedBook });
    } catch (error) {
      console.error("Error adding book to library:", error);
      res.status(500).json({ message: "Failed to add book to library" });
    }
  });

  router.delete("/personal-library/:bookId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { bookId } = req.params;
      const bookIdNum = parseInt(bookId);
      
      if (isNaN(bookIdNum)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      await storage.removeBookFromPersonalLibrary(userId, bookIdNum);
      res.json({ success: true, message: "Book removed from your library" });
    } catch (error) {
      console.error("Error removing book from library:", error);
      res.status(500).json({ message: "Failed to remove book from library" });
    }
  });

  router.get("/points/session", requireAuth, (req: Request, res: Response) => {
    const token = extractAuthToken(req) || "guest";
    res.json({ points: sessionPointsStore.get(token) || 0 });
  });

  router.post("/points/award", requireAuth, (req: Request, res: Response) => {
    try {
      const token = extractAuthToken(req) || "guest";
      const { action } = req.body || {};
      const awardMap: Record<string, number> = {
        ai_greek_hebrew: 5,
        ai_historical: 5,
        ai_crossrefs: 5,
        ai_commentary: 7,
        ai_study_plans: 5,
        ai_concordance: 5,
      };
      const add = awardMap[action] || 1;
      const current = sessionPointsStore.get(token) || 0;
      const next = current + add;
      sessionPointsStore.set(token, next);
      res.json({ success: true, points: next, awarded: add });
    } catch (error) {
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  app.use("/pdfs", express.static(path.join(process.cwd(), "public/pdfs")));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api", router);
}

