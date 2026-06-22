import { db } from "../db";
import { quizAttempts, users } from "../../shared/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID } from "../../shared/family-night";
import { classifyLeaderboardPrizeBoard } from "../../shared/family-night-gender";

export type LeaderboardEntry = {
  rank: number;
  studentId: string;
  displayName: string;
  scorePercent: number;
  timeSpentMinutes: number;
  gender: string | null;
  firstName: string | null;
  prizeBoard: "men" | "women";
};

const LIVE_CACHE_MS = 8_000;
let liveCache: { expiresAt: number; payload: Awaited<ReturnType<typeof computeFamilyNightLeaderboard>> } | null =
  null;

/** Call after a final-exam attempt is saved so the board updates immediately. */
export function invalidateFamilyNightLeaderboardCache(): void {
  liveCache = null;
}

function normalizeScore(raw: string | number | null | undefined): number {
  const value = typeof raw === "string" ? parseFloat(raw || "0") : raw || 0;
  if (Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

function buildDisplayName(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || username || "Student";
}

function sortEntries(
  entries: Array<{
    studentId: string;
    displayName: string;
    scorePercent: number;
    timeSpentMinutes: number;
    gender: string | null;
    firstName: string | null;
    prizeBoard: "men" | "women";
  }>,
): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => {
      if (b.scorePercent !== a.scorePercent) {
        return b.scorePercent - a.scorePercent;
      }
      return a.timeSpentMinutes - b.timeSpentMinutes;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function pickChampion(entries: LeaderboardEntry[]): LeaderboardEntry | null {
  if (entries.length === 0) return null;
  const perfect = entries.filter((e) => e.scorePercent >= 100);
  return perfect[0] ?? entries[0];
}

async function computeFamilyNightLeaderboard() {
  const rows = await db
    .select({
      studentId: quizAttempts.studentId,
      score: quizAttempts.score,
      timeSpent: quizAttempts.timeSpent,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      gender: users.gender,
    })
    .from(quizAttempts)
    .innerJoin(users, eq(users.id, quizAttempts.studentId))
    .where(
      and(
        eq(quizAttempts.quizId, FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID),
        isNotNull(quizAttempts.completedAt),
      ),
    );

  const bestByStudent = new Map<
    string,
    {
      studentId: string;
      displayName: string;
      scorePercent: number;
      timeSpentMinutes: number;
      gender: string | null;
      firstName: string | null;
      prizeBoard: "men" | "women";
    }
  >();

  for (const row of rows) {
    if (!row.studentId) continue;

    const displayName = buildDisplayName(row.firstName, row.lastName, row.username);
    const scorePercent = normalizeScore(row.score);
    const timeSpentMinutes = row.timeSpent ?? 9999;
    const prizeBoard = classifyLeaderboardPrizeBoard(
      row.firstName,
      row.gender,
      displayName,
    );

    const candidate = {
      studentId: row.studentId,
      displayName,
      scorePercent,
      timeSpentMinutes,
      gender: row.gender,
      firstName: row.firstName,
      prizeBoard,
    };

    const existing = bestByStudent.get(row.studentId);
    if (
      !existing ||
      candidate.scorePercent > existing.scorePercent ||
      (candidate.scorePercent === existing.scorePercent &&
        candidate.timeSpentMinutes < existing.timeSpentMinutes)
    ) {
      bestByStudent.set(row.studentId, candidate);
    }
  }

  const pool = [...bestByStudent.values()];

  const all = sortEntries(pool);
  const women = sortEntries(pool.filter((e) => e.prizeBoard === "women"));
  const men = sortEntries(pool.filter((e) => e.prizeBoard === "men"));

  const perfectOverall = all.filter((e) => e.scorePercent >= 100);

  return {
    overall: all.slice(0, 15),
    men: men.slice(0, 10),
    women: women.slice(0, 10),
    champions: {
      /** Fastest perfect score — anyone (man or woman) can hold #1 overall */
      overall: perfectOverall[0] ?? all[0] ?? null,
      men: pickChampion(men),
      women: pickChampion(women),
    },
    quizId: FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID,
    rankedBy: "Highest score first, then fastest time",
    prizeNote: "Overall leader is open to all. Men's and Women's boards are for separate prizes.",
  };
}

export async function getFamilyNightLeaderboard() {
  const now = Date.now();
  if (liveCache && liveCache.expiresAt > now) {
    return liveCache.payload;
  }

  const payload = await computeFamilyNightLeaderboard();
  liveCache = { expiresAt: now + LIVE_CACHE_MS, payload };
  return payload;
}
