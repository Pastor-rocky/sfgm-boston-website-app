import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizResultSummary } from "@/lib/quiz-result-utils";

export type QuizResultsLabels = {
  passedContinue: string;
  failedReturn: string;
};

const DEFAULT_LABELS: QuizResultsLabels = {
  passedContinue: "Continue to Course",
  failedReturn: "Return to Course",
};

export default function QuizResultsScreen({
  result,
  quizTitle,
  labels = DEFAULT_LABELS,
  onContinue,
  onReview,
}: {
  result: QuizResultSummary;
  quizTitle: string;
  labels?: Partial<QuizResultsLabels>;
  onContinue: () => void;
  onReview: () => void;
}) {
  const merged = { ...DEFAULT_LABELS, ...labels };
  const { scorePercent, passed, correctCount, totalQuestions, passingScore } = result;
  const roundedScore = Math.round(scorePercent);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <Badge
          className={
            passed
              ? "mb-4 bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
              : "mb-4 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
          }
        >
          {passed ? "Passed" : "Keep studying"}
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">{roundedScore}%</h1>
        <p className="text-gray-600 mb-2">You scored {roundedScore}%</p>
        <p className="text-gray-500 text-sm mb-6">
          {correctCount} of {totalQuestions} correct on {quizTitle}
          {!passed && ` · Passing score: ${passingScore}%`}
        </p>
        <p className="text-lg text-gray-800 mb-8">
          {passed
            ? "Congratulations! You passed this quiz. Great work — continue to your next step."
            : "Please continue to study. Review the course material and try again when you're ready."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
            <i className={`fas ${passed ? "fa-arrow-right" : "fa-arrow-left"} mr-2`}></i>
            {passed ? merged.passedContinue : merged.failedReturn}
          </Button>
          <Button variant="outline" onClick={onReview}>
            <i className="fas fa-eye mr-2"></i>
            Review Answers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
