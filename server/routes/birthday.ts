import type { Express, Request, Response } from "express";
import { Router } from "express";
import { storage } from "../storage";
import { sendBirthdayEmail } from "../services/emailService";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export function registerBirthdayRoutes(app: Express) {
  const router = Router();

  // Endpoint to check and send birthday messages
  // This should be called daily via cron job or scheduled task
  router.post("/api/birthday/check", async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayFormatted = `${month}-${day}`;

      // Get all users with date of birth
      const allUsers = await db.select().from(users).where(sql`date_of_birth IS NOT NULL`);

      const birthdayUsers = allUsers.filter((user) => {
        if (!user.dateOfBirth) return false;
        
        // Parse date of birth (format: YYYY-MM-DD)
        const dob = new Date(user.dateOfBirth);
        const dobMonth = String(dob.getMonth() + 1).padStart(2, "0");
        const dobDay = String(dob.getDate()).padStart(2, "0");
        const dobFormatted = `${dobMonth}-${dobDay}`;
        
        return dobFormatted === todayFormatted;
      });

      const results = [];

      for (const user of birthdayUsers) {
        try {
          const emailResult = await sendBirthdayEmail({
            firstName: user.firstName || "Student",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || undefined,
            dateOfBirth: user.dateOfBirth || "",
            textMessageConsent: false, // TODO: Add text message consent field to schema
          });

          results.push({
            userId: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email,
            email: user.email,
            sent: emailResult.delivered,
            reason: emailResult.reason,
          });
        } catch (error) {
          console.error(`[birthday] Failed to send birthday message to ${user.email}:`, error);
          results.push({
            userId: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email,
            email: user.email,
            sent: false,
            reason: (error as Error)?.message || "Unknown error",
          });
        }
      }

      return res.json({
        success: true,
        date: today.toISOString().split("T")[0],
        totalBirthdays: birthdayUsers.length,
        results,
      });
    } catch (error) {
      console.error("[birthday] Error checking birthdays:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to check birthdays",
        error: (error as Error)?.message || "Unknown error",
      });
    }
  });

  app.use(router);
}

