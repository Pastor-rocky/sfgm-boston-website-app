#!/usr/bin/env node
/**
 * Quiz Data Backup Script
 * Exports all quiz attempts to JSON/CSV for scheduled backups
 * 
 * Usage:
 *   npm run backup-quizzes
 *   npm run backup-quizzes -- --format=csv
 *   npm run backup-quizzes -- --output=./backups
 */

import { readFileSync } from "fs";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Parse command line arguments
const args = process.argv.slice(2);
const format = args.find((arg) => arg.startsWith("--format="))?.split("=")[1] || "json";
const outputDir = args.find((arg) => arg.startsWith("--output="))?.split("=")[1] || join(projectRoot, "backups");

// Load environment variables
const envFile = join(projectRoot, ".env");
let envVars = {};
try {
  const envContent = readFileSync(envFile, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  });
} catch (error) {
  console.warn("Warning: Could not read .env file, using process.env");
}

// Set environment variables
Object.entries(envVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

async function backupQuizzes() {
  try {
    console.log("Starting quiz data backup...");
    console.log(`Format: ${format}`);
    console.log(`Output directory: ${outputDir}`);

    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true });

    // Import storage dynamically (ESM)
    const { storage } = await import("../server/storage.js");

    // Get all quiz attempts
    console.log("Fetching quiz attempts from database...");
    const attempts = await storage.getAllQuizAttemptsForAdmin();
    console.log(`Found ${attempts.length} quiz attempts`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const filename = `quiz-backup-${timestamp}`;

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Attempt ID",
        "Student ID",
        "Student Name",
        "Student Email",
        "Quiz ID",
        "Quiz Title",
        "Score",
        "Submitted At",
        "Completed At",
        "Time Spent (minutes)",
        "Is Final Exam",
        "Course Name",
      ];

      const csvRows = [
        headers.join(","),
        ...attempts.map((attempt) => {
          return [
            attempt.attemptId || attempt.id || "",
            attempt.studentId || "",
            `"${(attempt.studentName || "").replace(/"/g, '""')}"`,
            attempt.studentEmail || "",
            attempt.quizId || "",
            `"${(attempt.quizTitle || "").replace(/"/g, '""')}"`,
            attempt.score || "0",
            attempt.submittedAt || "",
            attempt.completedAt || "",
            attempt.timeSpent || "0",
            attempt.isFinalExam ? "Yes" : "No",
            `"${(attempt.courseName || "").replace(/"/g, '""')}"`,
          ].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const csvPath = join(outputDir, `${filename}.csv`);
      writeFileSync(csvPath, csvContent, "utf-8");
      console.log(`✅ Backup saved to: ${csvPath}`);
    } else {
      // Default to JSON
      const jsonData = {
        exportedAt: new Date().toISOString(),
        totalAttempts: attempts.length,
        attempts,
      };

      const jsonPath = join(outputDir, `${filename}.json`);
      writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");
      console.log(`✅ Backup saved to: ${jsonPath}`);
    }

    console.log("Backup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during backup:", error);
    process.exit(1);
  }
}

backupQuizzes();


