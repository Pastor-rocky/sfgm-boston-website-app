import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getPrerequisiteEligibility } from "@shared/course-prerequisites";

interface CoursePrerequisiteBannerProps {
  courseId: number;
  enrollments: { courseId: number; status: string }[];
  variant?: "light" | "dark";
  className?: string;
}

export default function CoursePrerequisiteBanner({
  courseId,
  enrollments,
  variant = "light",
  className = "",
}: CoursePrerequisiteBannerProps) {
  const { eligible, message } = getPrerequisiteEligibility(courseId, enrollments);
  if (eligible) return null;

  const isDark = variant === "dark";

  return (
    <Alert
      className={`${
        isDark
          ? "bg-amber-500/10 border-amber-400/40 text-amber-50"
          : "bg-amber-50 border-amber-200 text-amber-900"
      } ${className}`}
    >
      <Lock className={`h-4 w-4 ${isDark ? "text-amber-300" : "text-amber-700"}`} />
      <AlertTitle className={isDark ? "text-amber-100" : "text-amber-900"}>
        Prerequisite required
      </AlertTitle>
      <AlertDescription className={`space-y-3 ${isDark ? "text-amber-100/90" : "text-amber-800"}`}>
        <p>{message}</p>
        <Link href="/bible-school">
          <Button
            size="sm"
            variant={isDark ? "outline" : "default"}
            className={
              isDark
                ? "border-amber-300/50 text-amber-100 hover:bg-amber-500/20"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }
          >
            Browse Bible School courses
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
