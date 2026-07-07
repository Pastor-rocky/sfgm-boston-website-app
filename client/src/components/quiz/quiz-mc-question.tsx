import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { buildQuestionSpeechText, speakText } from "@/lib/quiz-speech";

export interface QuizMcQuestionData {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
}

export default function QuizMcQuestion({
  question,
  index,
  answer,
  review = false,
  speechSupported = false,
  isSpeaking = false,
  onAnswerChange,
  onSpeakingChange,
  speechRate = 0.8,
}: {
  question: QuizMcQuestionData;
  index: number;
  answer: string;
  review?: boolean;
  speechSupported?: boolean;
  isSpeaking?: boolean;
  onAnswerChange?: (value: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  speechRate?: number;
}) {
  return (
    <div className="border-b border-slate-200 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-gray-900 text-base md:text-lg font-medium leading-relaxed flex-1">
          {index + 1}. {question.question}
        </p>
        {speechSupported && !review && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              speakText(buildQuestionSpeechText(question, index), {
                rate: speechRate,
                onStart: () => onSpeakingChange?.(true),
                onEnd: () => onSpeakingChange?.(false),
              })
            }
            disabled={isSpeaking}
            className="flex-shrink-0 text-sm"
          >
            🔊 Read
          </Button>
        )}
      </div>
      {question.options && (
        <RadioGroup
          value={answer || ""}
          onValueChange={(value) => !review && onAnswerChange?.(value)}
          className="space-y-2"
        >
          {question.options.map((option, optIndex) => {
            const cleanOption = option.replace(/^[A-D]\)\s*/, "");
            const isUserAnswer = answer === option;
            const isCorrectAnswer = review && option === question.correctAnswer;
            let optionClass = "flex items-center space-x-3 p-3 rounded-lg border";
            if (review) {
              if (isCorrectAnswer && isUserAnswer) optionClass += " bg-green-100 border-green-300 border-2";
              else if (isCorrectAnswer) optionClass += " bg-green-50 border-green-200";
              else if (isUserAnswer) optionClass += " bg-red-50 border-red-200 border-2";
              else optionClass += " bg-gray-50";
            } else {
              optionClass += " hover:bg-gray-50";
            }
            return (
              <div key={optIndex} className={optionClass}>
                <RadioGroupItem
                  value={option}
                  id={`q${question.id}-opt-${optIndex}`}
                  disabled={review}
                />
                <Label
                  htmlFor={`q${question.id}-opt-${optIndex}`}
                  className={`flex-1 ${review ? "" : "cursor-pointer"}`}
                >
                  {cleanOption}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}
