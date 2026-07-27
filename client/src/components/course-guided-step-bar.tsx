import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GuidedStep } from "@/lib/course-guided-flow";
import {
  getGuidedStepsForCourse,
  guidedStepIndex,
  nextActionLabel,
  stepLabel,
  stepShortLabel,
} from "@/lib/course-guided-flow";

export type GuidedQuizInfo = {
  title: string;
  detail: string;
  quizUrl: string;
  isAccessible: boolean;
  hasAttempts: boolean;
  latestPassed: boolean;
};

export default function CourseGuidedStepBar({
  courseId,
  week,
  step,
  onPrimaryAction,
  primaryDisabled,
  primaryLabel,
  quizInfo,
  standalone = false,
  theme = "blue",
}: {
  courseId: number;
  week: number;
  step: GuidedStep;
  onPrimaryAction?: () => void;
  primaryDisabled?: boolean;
  primaryLabel?: string;
  quizInfo?: GuidedQuizInfo | null;
  standalone?: boolean;
  theme?: "blue" | "purple";
}) {
  const steps = getGuidedStepsForCourse(courseId);
  const stepIndex = guidedStepIndex(step, courseId);
  const isPurple = theme === "purple";

  return (
    <div
      className={`${
        standalone ? "rounded-xl border" : "rounded-t-xl border border-b-0"
      } ${
        isPurple
          ? "border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50"
          : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
      } p-4 md:p-6 space-y-4`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${isPurple ? "bg-purple-600" : "bg-blue-600"} text-white text-sm px-3 py-1`}>
            Week {week}
          </Badge>
          <span className="text-sm font-medium text-slate-700">{stepLabel(step, week)}</span>
        </div>
        <span className="text-xs text-slate-500">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs" aria-label="Week progress">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < stepIndex
                  ? "bg-green-500"
                  : i === stepIndex
                    ? isPurple ? "bg-purple-600" : "bg-blue-600"
                    : "bg-slate-200"
              }`}
            />
            <span
              className={`hidden sm:inline shrink-0 ${
                i === stepIndex
                  ? isPurple ? "font-semibold text-purple-700" : "font-semibold text-blue-700"
                  : i < stepIndex ? "text-green-700" : "text-slate-400"
              }`}
            >
              {stepShortLabel(s)}
            </span>
            {i < steps.length - 1 ? (
              <span className="text-slate-300 hidden md:inline shrink-0">→</span>
            ) : null}
          </div>
        ))}
      </div>

      {step === "quiz" && quizInfo ? (
        <div className={`space-y-3 rounded-lg border ${isPurple ? "border-purple-100" : "border-blue-100"} bg-white/80 p-4`}>
          <div>
            <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <i className={`fas fa-quiz ${quizInfo.isAccessible ? "text-purple-600" : "text-slate-400"}`}></i>
              {quizInfo.title}
            </h4>
            <p className="text-sm text-slate-600 mt-1">{quizInfo.detail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {quizInfo.hasAttempts ? (
              quizInfo.latestPassed ? (
                <Badge className="bg-green-100 text-green-800">
                  <i className="fas fa-check mr-1"></i>
                  Passed
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <i className="fas fa-times mr-1"></i>
                  Failed
                </Badge>
              )
            ) : quizInfo.isAccessible ? (
              <Badge className={isPurple ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                <i className="fas fa-clock mr-1"></i>
                Available
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600">
                <i className="fas fa-lock mr-1"></i>
                Locked
              </Badge>
            )}
            {quizInfo.hasAttempts ? (
              <>
                <Button
                  onClick={() => {
                    window.location.href = `${quizInfo.quizUrl}?review=true`;
                  }}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <i className="fas fa-eye mr-2"></i>
                  View Previous Quiz
                </Button>
                {!quizInfo.latestPassed && quizInfo.isAccessible && (
                  <Button
                    onClick={() => {
                      window.location.href = quizInfo.quizUrl;
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Retake Quiz
                  </Button>
                )}
              </>
            ) : (
              <Button
                disabled={!quizInfo.isAccessible}
                onClick={() => {
                  window.location.href = quizInfo.quizUrl;
                }}
                className={`${
                  !quizInfo.isAccessible
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                }`}
              >
                {!quizInfo.isAccessible ? "🔒 Locked" : "📝 Take Quiz"}
              </Button>
            )}
          </div>
        </div>
      ) : primaryLabel && onPrimaryAction ? (
        <Button
          className={`w-full sm:w-auto font-semibold text-white ${
            isPurple ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </Button>
      ) : step !== "quiz" ? (
        <p className="text-sm text-slate-600">
          {step === "video"
            ? "Watch the video below, then continue when you are finished."
            : step === "readings"
              ? steps.includes("bible")
                ? "Open the e-book below. When you are done, continue to the Bible reading."
                : "Open the reading below. When you are done, continue to the quiz."
              : "Complete the Bible reading below, then continue to the quiz."}
        </p>
      ) : null}
    </div>
  );
}

export function resolveGuidedPrimaryLabel(step: GuidedStep, week: number, courseId?: number): string {
  return nextActionLabel(step, week, courseId) ?? `Take Week ${week} quiz`;
}
