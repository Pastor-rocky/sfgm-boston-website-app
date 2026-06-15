import type { Express, Request, Response } from "express";
import { Router } from "express";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { db } from "../db";
import { instructorMessages, users } from "../../shared/schema";
import { requireAuth } from "../middleware/requireAuth";

function requireStudent(req: Request, res: Response, next: () => void) {
  const u = (req as any).user;
  if (!u) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerStudentRoutes(app: Express) {
  const router = Router();

  router.get("/api/student/messages", requireAuth, requireStudent, async (req: any, res: Response) => {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const rows = await db
        .select()
        .from(instructorMessages)
        .where(eq(instructorMessages.studentId, studentId))
        .orderBy(desc(instructorMessages.sentAt))
        .limit(100);

      const instructorIds = [...new Set(rows.map((m) => m.instructorId))];
      const allInstructors =
        instructorIds.length > 0
          ? await db
              .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
              })
              .from(users)
              .where(inArray(users.id, instructorIds))
          : [];

      const out = rows.map((m) => {
        const instructor = allInstructors.find((i) => i.id === m.instructorId);
        const instructorName = instructor
          ? `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.email
          : "Your instructor";
        return {
          id: m.id,
          instructorId: m.instructorId,
          instructorName,
          channel: m.channel,
          subject: m.subject,
          body: m.body,
          sentAt: m.sentAt,
          readAt: m.readAt,
          isUnread: m.readAt == null,
        };
      });

      res.json(out);
    } catch (e) {
      console.error("Student messages:", e);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  router.patch(
    "/api/student/messages/:id/read",
    requireAuth,
    requireStudent,
    async (req: any, res: Response) => {
      try {
        const studentId = req.user?.id;
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
          return res.status(400).json({ message: "Invalid message ID" });
        }

        const [updated] = await db
          .update(instructorMessages)
          .set({ readAt: new Date() })
          .where(
            and(
              eq(instructorMessages.id, id),
              eq(instructorMessages.studentId, studentId),
              isNull(instructorMessages.readAt),
            ),
          )
          .returning();

        if (!updated) {
          const [existing] = await db
            .select()
            .from(instructorMessages)
            .where(and(eq(instructorMessages.id, id), eq(instructorMessages.studentId, studentId)))
            .limit(1);
          if (!existing) {
            return res.status(404).json({ message: "Message not found" });
          }
          return res.json(existing);
        }

        res.json(updated);
      } catch (e) {
        console.error("Mark message read:", e);
        res.status(500).json({ message: "Failed to update message" });
      }
    },
  );

  router.patch(
    "/api/student/messages/read-all",
    requireAuth,
    requireStudent,
    async (req: any, res: Response) => {
      try {
        const studentId = req.user?.id;
        await db
          .update(instructorMessages)
          .set({ readAt: new Date() })
          .where(
            and(eq(instructorMessages.studentId, studentId), isNull(instructorMessages.readAt)),
          );
        res.json({ success: true });
      } catch (e) {
        console.error("Mark all messages read:", e);
        res.status(500).json({ message: "Failed to update messages" });
      }
    },
  );

  app.use(router);
}
