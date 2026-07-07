import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  computeGuidedWeek,
  getPreviousReviewWeeks,
  type ContentProgressItem,
  type QuizAttemptLite,
  type VideoLite,
} from "@/lib/course-guided-progress";
import { usesGuidedFlow } from "@/lib/course-guided-flow";

export default function DashboardGuidedPreviousWeeks({ courseId }: { courseId: number }) {
  const isGuided = usesGuidedFlow(courseId);

  const { data: contentProgress = [] } = useQuery<ContentProgressItem[]>({
    queryKey: [`/api/content-progress/${courseId}`],
    enabled: isGuided,
  });

  const { data: videos = [] } = useQuery<VideoLite[]>({
    queryKey: [`/api/courses/${courseId}/videos`],
    enabled: isGuided,
  });

  const { data: quizAttempts = [] } = useQuery<QuizAttemptLite[]>({
    queryKey: [`/api/quiz-attempts/course/${courseId}`],
    enabled: isGuided,
  });

  if (!isGuided) return null;

  const guidedWeek = computeGuidedWeek(
    courseId,
    contentProgress,
    videos,
    quizAttempts,
  );
  const previousWeeks = getPreviousReviewWeeks(guidedWeek);

  if (previousWeeks.length === 0) return null;

  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-300">
        <i className="fas fa-history text-green-300"></i>
        <span>Previous weeks ({previousWeeks.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {previousWeeks.map((week) => (
          <Link key={week} href={`/course/${courseId}?reviewWeek=${week}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-green-400/40 bg-green-900/20 text-green-200 hover:bg-green-800/30 hover:text-white text-xs"
            >
              <i className="fas fa-check-circle mr-1 text-green-400"></i>
              Week {week}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
