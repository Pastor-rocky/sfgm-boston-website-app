/** Lesson quizzes only (Introduction has no quiz). IDs 234–242 map to Lessons 1–9. */
export const INTRODUCTION_TO_PROPHECY_QUIZ_IDS = [
  234, 235, 236, 237, 238, 239, 240, 241, 242,
] as const;

export const INTRODUCTION_TO_PROPHECY_QUIZ_SLUGS: Record<number, string> = {
  1: "introduction-to-prophecy-week-1",
  2: "introduction-to-prophecy-week-2",
  3: "introduction-to-prophecy-week-3",
  4: "introduction-to-prophecy-week-4",
  5: "introduction-to-prophecy-week-5",
  6: "introduction-to-prophecy-week-6",
  7: "introduction-to-prophecy-week-7",
  8: "introduction-to-prophecy-week-8",
  9: "introduction-to-prophecy-week-9",
  10: "introduction-to-prophecy-week-10",
};

export const INTRODUCTION_TO_PROPHECY_QUIZ_TITLES: Record<number, string> = {
  1: "Introduction to Prophecy — Introduction Quiz",
  2: "Introduction to Prophecy — Lesson 1 Quiz",
  3: "Introduction to Prophecy — Lesson 2 Quiz",
  4: "Introduction to Prophecy — Lesson 3 Quiz",
  5: "Introduction to Prophecy — Lesson 4 Quiz",
  6: "Introduction to Prophecy — Lesson 5 Quiz",
  7: "Introduction to Prophecy — Lesson 6 Quiz",
  8: "Introduction to Prophecy — Lesson 7 Quiz",
  9: "Introduction to Prophecy — Lesson 8 Quiz",
  10: "Introduction to Prophecy — Lesson 9 Quiz",
};

export function getIntroductionToProphecyQuizUrl(chapterId: number): string {
  const slug = INTRODUCTION_TO_PROPHECY_QUIZ_SLUGS[chapterId];
  return slug ? `/quiz/${slug}` : "/textbook-catalog";
}

export function getIntroductionToProphecyQuizLabel(chapterId: number): string {
  if (chapterId <= 1) return "";
  return `Take Lesson ${chapterId - 1} Quiz`;
}
