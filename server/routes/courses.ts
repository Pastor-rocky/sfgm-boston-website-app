import type { Express, Request, Response } from "express";
import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { z } from "zod";
import { sendErrorResponse } from "../utils/errorHandler";
import { withRetry, isRetryableError, shouldNotRetry } from "../utils/retry";

const contentProgressSchema = z.object({
  courseId: z.coerce.number().int().positive(),
  contentType: z.string().min(1),
  contentId: z.union([z.string().min(1), z.coerce.number()]),
  completed: z.boolean(),
});

const enrollSchema = z.object({
  studentId: z.string().min(1).optional(),
  courseId: z.coerce.number().int().positive(),
});

const miniCourseSchema = z.object({
  courseId: z.coerce.number().int().positive(),
});

const patchEnrollmentSchema = z.object({
  chosenInstructorId: z.string().nullable().optional(),
  sfgmChurch: z.string().nullable().optional(),
});

export function registerCourseRoutes(app: Express) {
  const router = Router();

  router.get("/api/courses", async (_req: Request, res: Response) => {
    try {
      const coursesList = await db.select().from(schema.courses).where(eq(schema.courses.isActive, true));
      res.json(coursesList);
    } catch (error) {
      sendErrorResponse(res, error, "Fetch Courses");
    }
  });

  // Single readings endpoint (no duplicate /public route; frontend uses this)
  router.get("/api/courses/:courseId/readings", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const readings = await storage.getCourseReadings(courseId);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching readings:", error);
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  router.get("/api/courses/:courseId/videos", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const videos = await storage.getCourseVideos(courseId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Helper function to extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Helper function to parse ISO 8601 duration (PT1H2M10S) to minutes
  const parseISODuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 60 + minutes + Math.round(seconds / 60);
  };

  // Endpoint to fetch YouTube video duration
  router.get("/api/youtube-duration", async (req: Request, res: Response) => {
    try {
      const { videoUrl } = req.query;
      if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ message: "videoUrl parameter is required" });
      }

      const videoId = extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      // Try YouTube Data API v3 if API key is available
      const youtubeApiKey = process.env.YOUTUBE_API_KEY;
      if (youtubeApiKey) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${youtubeApiKey}`
          );
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const duration = parseISODuration(data.items[0].contentDetails.duration);
            return res.json({ duration, videoId });
          }
        } catch (apiError) {
          console.error("YouTube API error:", apiError);
        }
      }

      // Fallback: Try to extract duration from video page (scraping approach)
      // This is a workaround when API key is not available
      try {
        const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const html = await videoPageResponse.text();
        // Try to extract duration from JSON-LD or other metadata
        const durationMatch = html.match(/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/);
        if (durationMatch) {
          const duration = parseISODuration(`PT${durationMatch[1] || ''}${durationMatch[2] || ''}${durationMatch[3] || ''}`);
          if (duration > 0) {
            return res.json({ duration, videoId });
          }
        }
      } catch (scrapeError) {
        console.error("Failed to scrape duration:", scrapeError);
      }

      // Return null if we couldn't get duration
      res.json({ duration: null, videoId, message: "YouTube API key not configured or video not found" });
    } catch (error) {
      console.error("Error fetching YouTube duration:", error);
      res.status(500).json({ message: "Failed to fetch video duration" });
    }
  });

  router.post("/api/content-progress", requireAuth, validateBody(contentProgressSchema), async (req: any, res: Response) => {
    try {
      const { courseId, contentType, contentId, completed } = req.validatedBody;
      // Ensure contentId is a number (coerce from string if needed)
      const numericContentId = typeof contentId === 'string' ? parseInt(contentId, 10) : Number(contentId);
      if (isNaN(numericContentId)) {
        return res.status(400).json({ message: "Invalid contentId: must be a valid number" });
      }
      await storage.updateContentProgress(req.user!.id, courseId, contentType, numericContentId, completed);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating content progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  router.get("/api/content-progress/:courseId", async (req: any, res: Response) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user?.id;

      if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const progress = await storage.getContentProgress(studentId, courseIdNum);
      res.json(progress);
    } catch (error) {
      sendErrorResponse(res, error, "Fetch Content Progress");
    }
  });

  router.post("/api/enroll", requireAuth, validateBody(enrollSchema), async (req: any, res: Response) => {
    try {
      const { studentId, courseId } = req.validatedBody;
      const finalStudentId = studentId || req.user!.id;
      
      // Use retry logic for enrollment
      await withRetry(
        () => storage.enrollStudent({ studentId: finalStudentId, courseId }),
        {
          maxRetries: 2,
          shouldRetry: (error) => isRetryableError(error) && !shouldNotRetry(error),
        }
      );
      
      res.json({ success: true });
    } catch (error) {
      sendErrorResponse(res, error, "Student Enrollment");
    }
  });

  router.post("/api/enrollments", requireAuth, validateBody(enrollSchema), async (req: any, res: Response) => {
    try {
      const { studentId, courseId } = req.validatedBody;
      const finalStudentId = studentId || req.user!.id;
      const enrollment = await storage.enrollStudent({
        studentId: finalStudentId,
        courseId,
      });
      res.json({ success: true, enrollment });
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  });

  router.delete("/api/enrollments/:courseId", requireAuth, async (req: any, res: Response) => {
    try {
      const { courseId } = req.params;
      const result = await storage.unenrollStudent(req.user!.id, parseInt(courseId));
      if (result.success) {
        res.json({ success: true, message: "Successfully unenrolled from course" });
      } else {
        res.status(400).json({ message: "Failed to unenroll from course" });
      }
    } catch (error) {
      console.error("Error unenrolling student (compat):", error);
      res.status(500).json({ message: "Failed to unenroll student" });
    }
  });

  router.get("/api/enrollments/student", requireAuth, async (req: any, res: Response) => {
    try {
      const enrollments = await storage.getStudentEnrollments(req.user!.id);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  router.patch("/api/enrollments/:id", requireAuth, validateBody(patchEnrollmentSchema), async (req: any, res: Response) => {
    try {
      const enrollmentId = parseInt(req.params.id, 10);
      if (isNaN(enrollmentId)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }
      const { chosenInstructorId, sfgmChurch } = req.validatedBody;
      const userId = req.user!.id;

      if (chosenInstructorId !== undefined) {
        const updated = await storage.updateEnrollmentChosenInstructor(enrollmentId, userId, chosenInstructorId ?? null);
        if (!updated) {
          return res.status(404).json({ message: "Enrollment not found or access denied" });
        }
      }

      if (sfgmChurch !== undefined) {
        await storage.updateUserProfile(userId, { sfgmChurch: sfgmChurch ?? null } as any);
      }

      const enrollments = await storage.getStudentEnrollments(userId);
      const one = enrollments.find((e: any) => e.id === enrollmentId);
      return res.json(one ?? {});
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ message: "Failed to update enrollment" });
    }
  });

  router.get("/api/instructors", requireAuth, async (_req: Request, res: Response) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        sfgmChurch: u.sfgmChurch ?? null,
      })));
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  router.get("/api/analytics/gpa", requireAuth, async (req: any, res: Response) => {
    try {
      const quizAttempts = await storage.getAllQuizAttempts(req.user!.id);
      if (quizAttempts.length === 0) {
        return res.json({ gpa: 0 });
      }
      const totalScore = quizAttempts.reduce((sum, attempt) => {
        const score = parseFloat(attempt.score || "0") * 100;
        return sum + score;
      }, 0);
      const averageScore = totalScore / quizAttempts.length;
      const gpa = (averageScore / 100) * 4;
      res.json({ gpa: Math.round(gpa * 100) / 100 });
    } catch (error) {
      console.error("Error fetching student GPA:", error);
      res.status(500).json({ message: "Failed to fetch GPA" });
    }
  });

  router.get("/api/certificates", requireAuth, async (req: any, res: Response) => {
    try {
      const certificates = await storage.getStudentCertificates(req.user!.id);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  router.get("/api/genesis-leaderboard", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Placeholder until Family Night leaderboard is implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching genesis leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  router.delete("/api/enrollments/student/:studentId/course/:courseId", requireAuth, async (req: Request, res: Response) => {
    try {
      const { studentId, courseId } = req.params;
      if (!studentId || !courseId) {
        return res.status(400).json({ message: "Student ID and Course ID are required" });
      }
      const result = await storage.unenrollStudent(studentId, parseInt(courseId));
      if (result.success) {
        res.json({ success: true, message: "Successfully unenrolled from course" });
      } else {
        res.status(400).json({ message: "Failed to unenroll from course" });
      }
    } catch (error) {
      console.error("Error unenrolling student:", error);
      res.status(500).json({ message: "Failed to unenroll student" });
    }
  });

  router.post("/api/mini-course-enroll", requireAuth, validateBody(miniCourseSchema), async (req: any, res: Response) => {
    try {
      const { courseId } = req.validatedBody;
      const existingEnrollments = await storage.getStudentEnrollments(req.user!.id);
      const alreadyEnrolled = existingEnrollments.some((e: any) => e.courseId === parseInt(courseId));
      if (alreadyEnrolled) {
        return res.json({ success: true, message: "Already enrolled in this course" });
      }
      const enrollment = await storage.enrollStudent({
        studentId: req.user!.id,
        courseId,
      });
      res.json({ success: true, enrollment });
    } catch (error) {
      console.error("Error enrolling in mini course:", error);
      res.status(500).json({ message: "Failed to enroll in mini course" });
    }
  });

  router.post("/api/mini-course-unenroll", requireAuth, validateBody(miniCourseSchema), async (req: any, res: Response) => {
    try {
      const { courseId } = req.validatedBody;
      const result = await storage.unenrollStudent(req.user!.id, courseId);
      if (result.success) {
        res.json({ success: true, message: "Successfully unenrolled from mini course" });
      } else {
        res.status(400).json({ message: "Failed to unenroll from mini course" });
      }
    } catch (error) {
      console.error("Error unenrolling from mini course:", error);
      res.status(500).json({ message: "Failed to unenroll from mini course" });
    }
  });

  router.get("/api/mini-course-enrollment-status/:courseId", requireAuth, async (req: any, res: Response) => {
    try {
      const { courseId } = req.params;
      const enrollments = await storage.getStudentEnrollments(req.user!.id);
      const enrollment = enrollments.find((e: any) => e.courseId === parseInt(courseId));
      res.json({
        enrolled: !!enrollment,
        enrolledAt: enrollment?.enrolledAt,
      });
    } catch (error) {
      console.error("Error checking enrollment status:", error);
      res.status(500).json({ message: "Failed to check enrollment status" });
    }
  });

  router.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Get instructor information if course has an instructor
      let instructorInfo = null;
      if ((course as any).instructorId) {
        const instructor = await storage.getUser((course as any).instructorId);
        if (instructor) {
          instructorInfo = {
            id: instructor.id,
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            sfgmChurch: (instructor as any).sfgmChurch || null,
          };
        }
      }
      
      res.json({
        ...course,
        instructor: instructorInfo,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.use(router);
}

