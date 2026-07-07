/** Courses that require G.R.O.W plus another qualifying Bible School course. */
export const PREREQUISITE_GATED_COURSE_IDS = [6, 7, 8] as const;

/** G.R.O.W must be completed before enrolling in gated leadership courses. */
export const REQUIRED_GROW_COURSE_ID = 4;

/**
 * Other Bible School courses whose completion satisfies the second prerequisite.
 * Excludes G.R.O.W and the gated courses themselves.
 */
export const OTHER_QUALIFYING_PREREQUISITE_COURSE_IDS = [1, 2, 3, 5, 16] as const;

export const PREREQUISITE_MESSAGE =
  "Complete the G.R.O.W course and at least one other Bible School course to unlock.";

export const PREREQUISITE_SHORT_LABEL = "G.R.O.W + one other course required";

export interface EnrollmentLite {
  courseId: number;
  status: string;
}

export function courseRequiresPriorCompletion(courseId: number): boolean {
  return (PREREQUISITE_GATED_COURSE_IDS as readonly number[]).includes(courseId);
}

export function hasCompletedGrow(enrollments: EnrollmentLite[]): boolean {
  return enrollments.some(
    (e) => e.status === "completed" && e.courseId === REQUIRED_GROW_COURSE_ID,
  );
}

export function hasCompletedOtherQualifyingCourse(
  enrollments: EnrollmentLite[],
  excludeCourseId?: number,
): boolean {
  return enrollments.some(
    (e) =>
      e.status === "completed" &&
      (OTHER_QUALIFYING_PREREQUISITE_COURSE_IDS as readonly number[]).includes(e.courseId) &&
      e.courseId !== excludeCourseId,
  );
}

export function getPrerequisiteEligibility(
  courseId: number,
  enrollments: EnrollmentLite[],
): { eligible: boolean; message: string; shortLabel: string } {
  if (!courseRequiresPriorCompletion(courseId)) {
    return { eligible: true, message: "", shortLabel: "" };
  }

  const growComplete = hasCompletedGrow(enrollments);
  const otherComplete = hasCompletedOtherQualifyingCourse(enrollments, courseId);

  if (growComplete && otherComplete) {
    return { eligible: true, message: "", shortLabel: "" };
  }

  return {
    eligible: false,
    message: PREREQUISITE_MESSAGE,
    shortLabel: PREREQUISITE_SHORT_LABEL,
  };
}

export class CoursePrerequisiteError extends Error {
  readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = "CoursePrerequisiteError";
  }
}
