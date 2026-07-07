export interface QuizSpeechQuestion {
  question: string;
  type: string;
  options?: string[];
}

export function buildQuestionSpeechText(q: QuizSpeechQuestion, index: number): string {
  let text = `Question ${index + 1}. ${q.question}`;
  if ((q.type === "multiple_choice" || q.type === "true_false") && q.options) {
    text += ". The answers are: ";
    q.options.forEach((option, optIndex) => {
      const cleanOption = option.replace(/^[A-D]\)\s*/, "");
      text += `Answer ${optIndex + 1}: ${cleanOption}. `;
    });
  }
  return text;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(
  text: string,
  options?: { rate?: number; onStart?: () => void; onEnd?: () => void },
): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.8;
  utterance.pitch = 1.0;
  utterance.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.name.includes("Google") ||
      v.name.includes("Microsoft") ||
      v.name.includes("Samantha") ||
      v.name.includes("Alex"),
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
