import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Maximize2,
  Minimize2,
  Monitor,
  Radio,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FamilyNightFinalExamCountdown from "@/components/family-night-final-exam-countdown";
import {
  ChampionCard,
  LeaderboardPanels,
  type LeaderboardChampions,
  type LeaderboardEntry,
} from "@/components/family-night-leaderboard-panels";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL } from "@/lib/family-night-quizzes";
import { CURRENT_FAMILY_NIGHT_CYCLE } from "@/lib/family-night-config";
import type { FamilyNightLiveViewMode } from "@shared/family-night";

type DisplayQuestion = {
  id: number;
  orderIndex: number;
  question: string;
  type: string;
  options: string[] | null;
};

type LiveState = {
  cycleId: string;
  activeQuestionIndex: number | null;
  viewMode: FamilyNightLiveViewMode;
  updatedAt: string;
};

function usePageFlags() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  return {
    isDisplayMode: params.get("display") === "1",
    isHostMode: params.get("host") === "1",
  };
}

function QuestionStage({
  question,
  questionNumber,
  totalQuestions,
  large,
  hostControls,
}: {
  question: DisplayQuestion;
  questionNumber: number;
  totalQuestions: number;
  large?: boolean;
  hostControls?: {
    activeIndex: number;
    canUse: boolean;
    isPending: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
  };
}) {
  const isTrueFalse = question.type === "true_false";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-[#1a1033] via-[#2d1a4a] to-[#12081f] shadow-[0_0_40px_rgba(251,191,36,0.15)] ${
        large ? "p-8 md:p-10 min-h-[320px]" : "p-6 min-h-[200px]"
      }`}
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500 text-sm font-bold px-3 py-1">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge variant="outline" className="border-purple-300/40 text-purple-100">
              {isTrueFalse ? "True or False" : "Multiple Choice"}
            </Badge>
          </div>
          {hostControls ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/25 bg-white/5"
                disabled={
                  !hostControls.canUse ||
                  hostControls.isPending ||
                  hostControls.activeIndex <= 0
                }
                onClick={hostControls.onPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 font-semibold"
                disabled={
                  !hostControls.canUse ||
                  hostControls.isPending ||
                  hostControls.activeIndex >= totalQuestions - 1
                }
                onClick={hostControls.onNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : null}
        </div>
        <p
          className={`font-semibold leading-snug text-white ${
            large ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl"
          }`}
        >
          {question.question}
        </p>
        {question.options && question.options.length > 0 ? (
          <div
            className={`mt-8 grid gap-3 ${
              isTrueFalse ? "grid-cols-2 max-w-xl" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {question.options.map((option) => (
              <div
                key={option}
                className={`rounded-xl border border-white/15 bg-white/5 text-white font-medium ${
                  large ? "px-5 py-4 text-xl md:text-2xl" : "px-4 py-3 text-lg"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        ) : null}
        {hostControls ? (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <Button
                key={index}
                size="sm"
                disabled={!hostControls.canUse || hostControls.isPending}
                className={
                  hostControls.activeIndex === index
                    ? "bg-amber-500 text-amber-950 hover:bg-amber-400 min-w-[2.5rem] font-bold"
                    : "bg-white/10 hover:bg-white/20 min-w-[2.5rem]"
                }
                onClick={() => hostControls.onSelect(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HostReadyCard({
  totalQuestions,
  hostControls,
}: {
  totalQuestions: number;
  hostControls: {
    canUse: boolean;
    isPending: boolean;
    onSelect: (index: number) => void;
  };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-[#1a1033] via-[#2d1a4a] to-[#12081f] p-8 text-center">
      <Crown className="h-12 w-12 text-amber-400/70 mx-auto mb-4" />
      <p className="text-xl font-semibold text-white mb-2">Ready for the final exam</p>
      <p className="text-purple-200/80 mb-6">Tap a question to put it on the TV screen.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <Button
            key={index}
            size="lg"
            disabled={!hostControls.canUse || hostControls.isPending}
            className={
              index === 0
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400 min-w-[3rem] font-bold"
                : "bg-white/10 hover:bg-white/20 min-w-[3rem]"
            }
            onClick={() => hostControls.onSelect(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function FamilyNightLeaderboardLive() {
  const { user, isAuthenticated } = useAuth();
  const { isDisplayMode, isHostMode } = usePageFlags();
  const isHostPage = isHostMode && !isDisplayMode;
  const cycle = CURRENT_FAMILY_NIGHT_CYCLE;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const role = ((user as { role?: string } | null)?.role || "").toLowerCase();
  const isInstructor = ["instructor", "admin", "dean"].includes(role);
  const canControl = (isHostMode || isInstructor) && !isDisplayMode;

  const { data: leaderboard, dataUpdatedAt: leaderboardUpdatedAt } = useQuery<{
    overall: LeaderboardEntry[];
    men: LeaderboardEntry[];
    women: LeaderboardEntry[];
    champions: LeaderboardChampions;
  }>({
    queryKey: ["/api/family-night/leaderboard/public"],
    staleTime: 3_000,
    refetchInterval: 8_000,
    refetchOnMount: "always",
  });

  const { data: questionsPayload } = useQuery<{
    questions: DisplayQuestion[];
  }>({
    queryKey: ["/api/family-night/live/questions"],
    staleTime: 60_000,
  });

  const { data: livePayload } = useQuery<{ state: LiveState }>({
    queryKey: ["/api/family-night/live/state"],
    staleTime: 500,
    refetchInterval: canControl ? 2_000 : 1_500,
    refetchOnMount: "always",
  });

  const questions = questionsPayload?.questions ?? [];
  const liveState = livePayload?.state;
  const activeIndex = liveState?.activeQuestionIndex ?? null;
  const viewMode = liveState?.viewMode ?? "split";
  const activeQuestion =
    activeIndex !== null && questions[activeIndex] ? questions[activeIndex] : null;

  const updateLiveState = useMutation({
    mutationFn: async (patch: {
      activeQuestionIndex?: number | null;
      viewMode?: FamilyNightLiveViewMode;
    }) => {
      const res = await apiRequest("POST", "/api/family-night/live/state", patch);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-night/live/state"] });
    },
  });

  const setQuestionIndex = useCallback(
    (index: number | null) => {
      if (!canControl) return;
      updateLiveState.mutate({ activeQuestionIndex: index, viewMode: "split" });
    },
    [canControl, updateLiveState],
  );

  const goPrev = useCallback(() => {
    if (!canControl || questions.length === 0) return;
    const current = activeIndex ?? 0;
    setQuestionIndex(Math.max(0, current - 1));
  }, [activeIndex, canControl, questions.length, setQuestionIndex]);

  const goNext = useCallback(() => {
    if (!canControl || questions.length === 0) return;
    const current = activeIndex ?? -1;
    setQuestionIndex(Math.min(questions.length - 1, current + 1));
  }, [activeIndex, canControl, questions.length, setQuestionIndex]);

  useEffect(() => {
    if (!canControl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key >= "1" && event.key <= "9") {
        const num = Number(event.key) - 1;
        if (num < questions.length) setQuestionIndex(num);
      }
      if (event.key === "0" && questions.length >= 10) {
        setQuestionIndex(9);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canControl, goNext, goPrev, questions.length, setQuestionIndex]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(false);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  const secondsSinceUpdate = leaderboardUpdatedAt
    ? Math.max(0, Math.floor((Date.now() - leaderboardUpdatedAt) / 1000))
    : null;

  const showQuestionPanel = isHostPage
    ? true
    : viewMode === "question" || (viewMode === "split" && activeQuestion !== null);
  const showLeaderboardPanel = isHostPage
    ? false
    : viewMode === "leaderboard" || viewMode === "split";

  const hostControlsProps = canControl
    ? {
        canUse: isAuthenticated,
        isPending: updateLiveState.isPending,
        onPrev: goPrev,
        onNext: goNext,
        onSelect: setQuestionIndex,
      }
    : undefined;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#12081f] via-[#1f0f33] to-[#0d0618] text-white ${
        isDisplayMode ? "" : ""
      }`}
    >
      {isFullscreen ? (
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2">
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg"
            onClick={() => void exitFullscreen()}
          >
            <Minimize2 className="h-4 w-4 mr-1.5" />
            Exit Fullscreen
          </Button>
          <span className="hidden sm:inline text-xs text-purple-200/80">or press Esc</span>
        </div>
      ) : null}
      {!isDisplayMode ? (
        <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link href="/family-night" className="text-sm text-purple-200 hover:text-white">
              ← Family Night
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/family-night/leaderboard?display=1" target="_blank">
                <Button size="sm" variant="outline" className="border-purple-400/40 text-purple-100">
                  <Monitor className="h-4 w-4 mr-1.5" />
                  Open TV view
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-400/40 text-amber-100"
                onClick={() => void toggleFullscreen()}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4 mr-1.5" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 mr-1.5" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>
      ) : null}

      <main
        className={`mx-auto ${isDisplayMode ? "max-w-7xl px-4 py-4 md:px-8 md:py-6" : isHostPage ? "max-w-4xl px-4 py-5" : "max-w-7xl px-4 py-6"}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-purple-600 hover:bg-purple-600">Family Night Live</Badge>
              <Badge variant="outline" className="border-amber-300/50 text-amber-100">
                {cycle.theme} · {cycle.monthLabel}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live
              </span>
            </div>
            <h1
              className={`font-bold text-white flex items-center gap-3 ${
                isDisplayMode ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
              }`}
            >
              <Trophy className="h-8 w-8 text-amber-400 shrink-0" />
              {cycle.finalExam.title}
            </h1>
            {!isHostPage ? (
              <p className="text-purple-200/90 mt-2 max-w-2xl">
                10-question championship · highest score wins, then fastest time · separate
                men&apos;s and women&apos;s prizes
              </p>
            ) : null}
          </div>

          <div className="text-right space-y-2 shrink-0">
            {!isHostPage ? <FamilyNightFinalExamCountdown /> : null}
            {secondsSinceUpdate !== null ? (
              <p className="text-xs text-purple-300/80">Board updated {secondsSinceUpdate}s ago</p>
            ) : null}
          </div>
        </div>

        {isHostPage && leaderboard?.champions?.overall ? (
          <div className="mb-5">
            <ChampionCard
              label="Overall leader"
              champion={leaderboard.champions.overall}
              borderClass="border-2 border-amber-300/50 from-amber-500/25 via-yellow-500/15 to-orange-600/10 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              labelClass="text-amber-200"
            />
          </div>
        ) : null}

        {isHostPage && !leaderboard?.champions?.overall ? (
          <div className="mb-5 rounded-xl border border-dashed border-amber-400/30 bg-black/20 px-4 py-3 text-center">
            <p className="text-sm text-purple-200/80">No scores yet — leaderboard updates as students finish.</p>
          </div>
        ) : null}

        <div
          className={`grid gap-6 ${
            showQuestionPanel && showLeaderboardPanel
              ? "lg:grid-cols-[1.15fr_0.85fr]"
              : "grid-cols-1"
          }`}
        >
          {showQuestionPanel ? (
            <section>
              {activeQuestion ? (
                <QuestionStage
                  question={activeQuestion}
                  questionNumber={activeIndex! + 1}
                  totalQuestions={questions.length}
                  large={isDisplayMode}
                  hostControls={
                    hostControlsProps && activeIndex !== null
                      ? { ...hostControlsProps, activeIndex }
                      : undefined
                  }
                />
              ) : isHostPage && hostControlsProps && questions.length > 0 ? (
                <HostReadyCard totalQuestions={questions.length} hostControls={hostControlsProps} />
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-400/30 bg-black/20 p-10 text-center">
                  <Crown className="h-12 w-12 text-amber-400/70 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-white mb-2">Ready for the final exam</p>
                  <p className="text-purple-200/80">
                    {canControl
                      ? "Select a question to put it on the screen."
                      : `Waiting for the host to reveal a question. Exam opens ${FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL}.`}
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {showLeaderboardPanel ? (
            <section
              className={`rounded-2xl border border-amber-400/30 bg-black/25 ${
                isDisplayMode ? "p-5" : "p-4"
              }`}
            >
              {leaderboard?.overall?.length ? (
                <LeaderboardPanels
                  champions={leaderboard.champions}
                  overall={leaderboard.overall}
                  men={leaderboard.men}
                  women={leaderboard.women}
                  large={isDisplayMode}
                  overallLimit={isDisplayMode ? 6 : 5}
                  prizeLimit={5}
                />
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-amber-400/60 mx-auto mb-3" />
                  <p className="text-lg font-medium text-white">No scores yet</p>
                  <p className="text-sm text-purple-200/70 mt-1">
                    Rankings appear here as students submit the final exam.
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </div>

        {!isHostPage && !canControl && !isDisplayMode ? (
          <p className="mt-6 text-center text-sm text-purple-300/80">
            Presenter? Add <span className="text-amber-200">?host=1</span> to this URL while logged
            in as instructor.
          </p>
        ) : null}
        {isHostPage && !isAuthenticated ? (
          <p className="mt-4 text-center text-sm text-rose-300/90">
            Log in as instructor to control questions on the TV screen.
          </p>
        ) : null}
      </main>
    </div>
  );
}
