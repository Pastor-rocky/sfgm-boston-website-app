const INSTRUCTOR_ROLES = new Set(["instructor", "admin", "dean"]);

export function canAccessInstructorPortal(role: string | undefined | null): boolean {
  return INSTRUCTOR_ROLES.has((role || "").toLowerCase());
}

/** Safe post-login paths for the student sign-in page (not instructor portal). */
function isStudentLoginReturnPath(path: string): boolean {
  return Boolean(path) && !path.startsWith("/instructor-portal") && !path.startsWith("/admin");
}

export function resolvePostLoginRedirect(
  role: string | undefined | null,
  options?: { returnTo?: string | null; instructorFlow?: boolean },
): string {
  const normalized = (role || "").toLowerCase();
  const returnTo = options?.returnTo?.trim() || "";

  if (options?.instructorFlow) {
    if (
      returnTo.startsWith("/instructor-portal") &&
      canAccessInstructorPortal(normalized)
    ) {
      return returnTo;
    }
    if (normalized === "dean" || normalized === "instructor") return "/instructor-portal";
    if (normalized === "admin") return "/admin";
    return "/dashboard";
  }

  // Regular student login — always land on the student dashboard.
  if (returnTo && isStudentLoginReturnPath(returnTo)) {
    return returnTo;
  }
  return "/dashboard";
}
