import { useEffect } from "react";
import { useLocation } from "wouter";

/** Legacy URL — sends instructors to the new portal. */
export default function InstructorPortalRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/instructor-portal");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      Opening Instructor Portal…
    </div>
  );
}
