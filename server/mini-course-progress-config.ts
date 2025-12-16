export interface MiniCourseProgressDefinition {
  /**
   * Total number of lesson units (or weeks) students must finish to hit 100%.
   * When `mini_course_content` rows exist this acts as a fallback/reference value.
   */
  lessonCount: number;
  /**
   * Optional quiz IDs associated with the mini course.
   * Used for automated quiz completion stats and score summaries.
   */
  quizIds?: number[];
  /**
   * Optional friendly label shown in logs so we can quickly identify the mini course.
   */
  label?: string;
}

/**
 * Mini course configuration catalog.
 * Add new mini courses here once they are introduced so progress+quiz tracking
 * automatically recognizes them without additional backend changes.
 */
export const miniCourseProgressConfig: Record<number, MiniCourseProgressDefinition> = {
  1: {
    label: 'Genesis to Revelation Study',
    lessonCount: 52, // Weekly journey through the full Bible
    quizIds: [], // Genesis to Revelation uses leaderboard scoring instead of individual quizzes (for now)
  },
  2: {
    label: 'Power of Preaching',
    lessonCount: 5,
    quizIds: [], // Quizzes can be added later; hook already in place
  },
};





















