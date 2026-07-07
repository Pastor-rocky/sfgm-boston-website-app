import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import QuizMcQuestion, { type QuizMcQuestionData } from "./quiz-mc-question";

export default function QuizSimpleList({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  speechSupported = false,
  isSpeaking = false,
  onSpeakingChange,
  speechRate = 0.8,
  showSubmitDialog,
  onShowSubmitDialogChange,
}: {
  questions: QuizMcQuestionData[];
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, value: string) => void;
  onSubmit: () => void;
  speechSupported?: boolean;
  isSpeaking?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
  speechRate?: number;
  showSubmitDialog: boolean;
  onShowSubmitDialogChange: (open: boolean) => void;
}) {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Answer all questions below</CardTitle>
          <p className="text-sm text-gray-600">
            Tap 🔊 Read on any question if reading is difficult.
          </p>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          {questions.map((q, index) => (
            <QuizMcQuestion
              key={q.id}
              question={q}
              index={index}
              answer={answers[q.id] || ""}
              speechSupported={speechSupported}
              isSpeaking={isSpeaking}
              onSpeakingChange={onSpeakingChange}
              speechRate={speechRate}
              onAnswerChange={(value) => onAnswerChange(q.id, value)}
            />
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-center px-2 py-3">
        <AlertDialog open={showSubmitDialog} onOpenChange={onShowSubmitDialogChange}>
          <AlertDialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 px-8 py-3 text-base font-semibold w-full sm:w-auto">
              <i className="fas fa-check mr-2"></i>
              Submit Quiz
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                You answered {Object.keys(answers).length} of {questions.length} questions.
                Once submitted, you cannot change your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Answers</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
