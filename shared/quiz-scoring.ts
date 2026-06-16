/** Detect quiz questions that require research outside Scripture. */
export function isResearchQuestion(questionText: string): boolean {
  return /research\s+outside\s+the\s+bible/i.test(questionText);
}

/** Detect quiz questions tied to the weekly video lesson (participation-style grading). */
export function isVideoQuestion(questionText: string): boolean {
  const q = questionText.toLowerCase();
  return (
    q.includes("video lesson") ||
    q.includes("from the video") ||
    q.includes("according to the video") ||
    /\bweek \d+ video\b/.test(q)
  );
}

export function isAnswerProvided(userAnswer: unknown): boolean {
  if (userAnswer === null || userAnswer === undefined) return false;
  return String(userAnswer).trim().length > 0;
}

type ScorableQuestion = {
  type: string;
  question: string;
  correctAnswer?: string | null;
};

/** Score a single question. Video questions award credit for any non-empty answer. */
export function isQuestionCorrect(
  question: ScorableQuestion,
  userAnswer: unknown,
  essayMinWords: number
): boolean {
  const { type, question: text, correctAnswer } = question;

  if (isVideoQuestion(text)) {
    if (type === "essay" || type === "text_with_voice" || type === "subjective") {
      const wordCount = String(userAnswer || "")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      return wordCount >= essayMinWords;
    }
    return isAnswerProvided(userAnswer);
  }

  if (type === "multiple_choice" && correctAnswer) {
    return userAnswer === correctAnswer;
  }

  if (type === "true_false" && correctAnswer) {
    return userAnswer === correctAnswer;
  }

  if (type === "essay" || type === "text_with_voice" || type === "subjective") {
    const wordCount = String(userAnswer || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return wordCount >= essayMinWords;
  }

  return false;
}
