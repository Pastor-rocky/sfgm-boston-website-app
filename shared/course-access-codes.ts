/** Staff access codes for locked courses (Deacon, Youth Ministry). */
export const COURSE_ACCESS_CODES: Record<number, string> = {
  6: "123", // Deacon Course
  8: "123", // Youth Ministry Course
};

export function isValidCourseAccessCode(courseId: number, code?: string | null): boolean {
  const expected = COURSE_ACCESS_CODES[courseId];
  if (!expected || !code) return false;
  return code === expected;
}
