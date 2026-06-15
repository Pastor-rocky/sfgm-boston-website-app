const INSTRUCTOR_ROLES = new Set(["instructor", "admin", "dean"]);

export function canAccessInstructorPortal(role: string | undefined | null): boolean {
  return INSTRUCTOR_ROLES.has((role || "").toLowerCase());
}

export function resolvePostLoginRedirect(
  role: string | undefined | null,
  options?: { returnTo?: string | null; instructorFlow?: boolean },
): string {
  const normalized = (role || "").toLowerCase();
  const returnTo = options?.returnTo?.trim() || "";

  if (
    options?.instructorFlow &&
    returnTo.startsWith("/instructor-portal") &&
    canAccessInstructorPortal(normalized)
  ) {
    return returnTo;
  }

  if (normalized === "dean") return "/instructor-portal";
  if (normalized === "admin") return "/admin";
  if (normalized === "instructor") return "/instructor-portal";
  return "/dashboard";
}
