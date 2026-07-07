/** Where to send a student after enrolling in a course. */
export function resolvePostEnrollmentPath(
  enrollmentCountBefore: number,
  courseId: number,
): string {
  if (enrollmentCountBefore === 0) {
    return "/course-catalog";
  }
  return `/course/${courseId}`;
}
