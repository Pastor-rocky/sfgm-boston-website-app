import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { canAccessInstructorPortal } from "@/lib/auth-redirect";

export function useInstructorAccess() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const role = ((user as { role?: string } | null)?.role ?? "").toLowerCase();
  const isInstructor = canAccessInstructorPortal(role);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const returnTo = `${location}${window.location.search}`;
      setLocation(
        `/instructor-login?returnTo=${encodeURIComponent(returnTo || "/instructor-portal")}`,
      );
      return;
    }

    if (!isInstructor) {
      setLocation("/dashboard?notice=instructor-only");
    }
  }, [isAuthenticated, isInstructor, isLoading, setLocation, location]);

  return { user, isInstructor, isLoading, role };
}
