import { DEFAULT_PASSING_SCORE } from "@shared/course-constants";

export interface QuizResultSummary {
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  passingScore: number;
}

export function scoreToPercent(raw: number): number {
  if (Number.isNaN(raw)) return 0;
  return raw <= 1 ? raw * 100 : raw;
}

export function buildQuizResultSummary(
  rawScore: number | string | null | undefined,
  totalQuestions: number,
  passingScore: number = DEFAULT_PASSING_SCORE,
): QuizResultSummary {
  const parsed = typeof rawScore === "string" ? parseFloat(rawScore) : (rawScore ?? 0);
  const scoreDecimal = parsed <= 1 ? parsed : parsed / 100;
  const scorePercent = scoreToPercent(parsed);
  const correctCount = Math.round(scoreDecimal * totalQuestions);
  return {
    scorePercent,
    passed: scorePercent >= passingScore,
    correctCount,
    totalQuestions,
    passingScore,
  };
}

/** True when every question is MC or true/false — use simple one-page list layout. */
export function usesSimpleListLayout(
  questions: Array<{ type: string }>,
): boolean {
  return questions.every(
    (q) => q.type === "multiple_choice" || q.type === "true_false",
  );
}
