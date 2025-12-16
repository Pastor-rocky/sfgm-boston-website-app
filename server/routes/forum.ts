import type { Express, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.enum(["Testimony", "Study Note", "Prayer Request"]),
  courseId: z.number().int().positive().optional(),
});

const createReplySchema = z.object({
  postId: z.number().int().positive(),
  content: z.string().min(1),
});

export function registerForumRoutes(app: Express) {
  const router = Router();

  // Get all forum posts (with optional category filter)
  router.get("/api/forum/posts", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getForumPosts(category, limit, offset);
      res.json(posts);
    } catch (error: any) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts", error: error?.message });
    }
  });

  // Get single forum post by ID
  router.get("/api/forum/posts/:postId", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post", error: error?.message });
    }
  });

  // Create new forum post
  router.post("/api/forum/posts", requireAuth, async (req: any, res: Response) => {
    try {
      const validated = createPostSchema.parse(req.body);
      const post = await storage.createForumPost({
        authorId: req.user.id,
        title: validated.title,
        content: validated.content,
        category: validated.category,
        courseId: validated.courseId || null,
      });
      
      res.status(201).json(post);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post", error: error?.message });
    }
  });

  // Get replies for a post
  router.get("/api/forum/posts/:postId/replies", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const replies = await storage.getForumReplies(postId);
      res.json(replies);
    } catch (error: any) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies", error: error?.message });
    }
  });

  // Create reply to a post
  router.post("/api/forum/replies", requireAuth, async (req: any, res: Response) => {
    try {
      const validated = createReplySchema.parse(req.body);
      const reply = await storage.createForumReply({
        postId: validated.postId,
        authorId: req.user.id,
        content: validated.content,
      });
      
      res.status(201).json(reply);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply", error: error?.message });
    }
  });

  // Toggle like on a post
  router.post("/api/forum/posts/:postId/like", requireAuth, async (req: any, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const result = await storage.toggleForumPostLike(postId, req.user.id);
      res.json(result);
    } catch (error: any) {
      console.error("Error toggling forum post like:", error);
      res.status(500).json({ message: "Failed to toggle like", error: error?.message });
    }
  });

  // Get forum statistics
  router.get("/api/forum/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getForumStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching forum stats:", error);
      res.status(500).json({ message: "Failed to fetch forum stats", error: error?.message });
    }
  });

  app.use(router);
}

