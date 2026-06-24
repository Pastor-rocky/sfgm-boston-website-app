import { db } from "../db";
import { quizQuestions } from "../../shared/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  FAMILY_NIGHT_CYCLE,
  FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID,
  type FamilyNightLiveState,
  type FamilyNightLiveViewMode,
} from "../../shared/family-night";

export type DisplayQuestion = {
  id: number;
  orderIndex: number;
  question: string;
  type: string;
  options: string[] | null;
};

const defaultState = (): FamilyNightLiveState => ({
  cycleId: FAMILY_NIGHT_CYCLE.id,
  activeQuestionIndex: null,
  viewMode: "split",
  updatedAt: new Date().toISOString(),
});

let liveState: FamilyNightLiveState = defaultState();

export function getFamilyNightLiveState(): FamilyNightLiveState {
  return liveState;
}

export function updateFamilyNightLiveState(
  patch: Partial<Pick<FamilyNightLiveState, "activeQuestionIndex" | "viewMode">>,
): FamilyNightLiveState {
  liveState = {
    ...liveState,
    ...patch,
    cycleId: FAMILY_NIGHT_CYCLE.id,
    updatedAt: new Date().toISOString(),
  };
  return liveState;
}

export function resetFamilyNightLiveState(): FamilyNightLiveState {
  liveState = defaultState();
  return liveState;
}

export async function getFinalExamDisplayQuestions(): Promise<DisplayQuestion[]> {
  const rows = await db
    .select({
      id: quizQuestions.id,
      orderIndex: quizQuestions.orderIndex,
      question: quizQuestions.question,
      type: quizQuestions.type,
      options: quizQuestions.options,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID))
    .orderBy(asc(quizQuestions.orderIndex));

  return rows.map((row) => ({
    id: row.id,
    orderIndex: row.orderIndex,
    question: row.question,
    type: row.type,
    options: Array.isArray(row.options) ? (row.options as string[]) : null,
  }));
}

export function clampQuestionIndex(
  index: number | null,
  questionCount: number,
): number | null {
  if (index === null) return null;
  if (questionCount <= 0) return null;
  return Math.max(0, Math.min(questionCount - 1, index));
}

export function parseViewMode(value: unknown): FamilyNightLiveViewMode {
  if (value === "question" || value === "leaderboard" || value === "split") {
    return value;
  }
  return "split";
}
