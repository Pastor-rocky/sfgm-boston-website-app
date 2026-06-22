import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import FamilyNightVideoPlayer from "@/components/family-night-video-player";
import FamilyNightFinalExamCountdown, {
  useFinalExamCountdown,
} from "@/components/family-night-final-exam-countdown";
import { FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL } from "@/lib/family-night-quizzes";
import {
  ArrowLeft,
  Clock,
  Play,
  Trophy,
  Users,
  BookOpen,
  Crown,
  Lock,
  CheckCircle2,
  VideoOff,
  Medal,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CURRENT_FAMILY_NIGHT_CYCLE,
  FAMILY_NIGHT_COURSE_ID,
  type FamilyNightVideo,
} from "@/lib/family-night-config";
import {
  isFamilyNightVideoWatched,
  markFamilyNightVideoWatched,
  allTeachingsWatched,
} from "@/lib/family-night-progress";

type LeaderboardEntry = {
  rank: number;
  displayName: string;
  scorePercent: number;
  timeSpentMinutes: number;
};

function rankRowClass(rank: number): string {
  if (rank === 1) {
    return "bg-gradient-to-r from-amber-500/35 to-yellow-600/20 border-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]";
  }
  if (rank === 2) {
    return "bg-gradient-to-r from-slate-400/25 to-slate-500/15 border-slate-300/40";
  }
  if (rank === 3) {
    return "bg-gradient-to-r from-orange-700/30 to-amber-800/20 border-orange-400/35";
  }
  return "bg-white/5 border-white/10";
}

function LeaderboardList({
  title,
  entries,
  emptyMessage,
  accentClass = "text-amber-300",
}: {
  title: string;
  entries: LeaderboardEntry[];
  emptyMessage: string;
  accentClass?: string;
}) {
  return (
    <div className="mb-5 rounded-xl border border-white/10 bg-black/25 p-3">
      <p
        className={`text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${accentClass}`}
      >
        <Medal className="h-3.5 w-3.5 shrink-0" />
        {title}
      </p>
      {entries.length === 0 ? (
        <p className="text-xs text-purple-200/60 px-1">{emptyMessage}</p>
      ) : (
        <ol className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <li
              key={`${title}-${entry.rank}-${entry.displayName}`}
              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-sm ${rankRowClass(entry.rank)}`}
            >
              <span className="truncate text-white font-medium">
                <span
                  className={`inline-flex min-w-[2rem] justify-center rounded-md px-1.5 py-0.5 text-xs font-bold mr-2 ${
                    entry.rank === 1
                      ? "bg-amber-400 text-amber-950"
                      : entry.rank === 2
                        ? "bg-slate-300 text-slate-900"
                        : entry.rank === 3
                          ? "bg-orange-400 text-orange-950"
                          : "bg-purple-800/80 text-purple-100"
                  }`}
                >
                  #{entry.rank}
                </span>
                {entry.displayName}
              </span>
              <span className="shrink-0 text-xs font-semibold text-amber-100/90 tabular-nums">
                {Math.round(entry.scorePercent)}%
                <span className="text-purple-200/70 font-normal"> · {entry.timeSpentMinutes}m</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function FamilyNight() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [, bumpProgress] = useState(0);

  const cycle = CURRENT_FAMILY_NIGHT_CYCLE;
  const userId = (user as { id?: string } | null)?.id;

  const { data: leaderboard } = useQuery<{
    overall: LeaderboardEntry[];
    men: LeaderboardEntry[];
    women: LeaderboardEntry[];
    champions: {
      overall: LeaderboardEntry | null;
      men: LeaderboardEntry | null;
      women: LeaderboardEntry | null;
    };
    rankedBy: string;
  }>({
    queryKey: ["/api/family-night/leaderboard"],
    enabled: isAuthenticated,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnMount: "always",
  });

  const refreshProgress = useCallback(() => {
    bumpProgress((n) => n + 1);
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: [`/api/content-progress/${FAMILY_NIGHT_COURSE_ID}`],
      });
    }
  }, [userId]);

  const isVideoWatched = (contentId: number) =>
    userId ? isFamilyNightVideoWatched(userId, contentId) : false;

  const isQuizUnlocked = (week: FamilyNightVideo) =>
    week.noVideo || isVideoWatched(week.contentId);

  const handleOpenVideo = (week: FamilyNightVideo) => {
    if (week.noVideo) return;
    if (!week.videoUrl) {
      toast({
        title: "Coming soon",
        description: "This teaching video will be posted shortly.",
      });
      return;
    }
    if (!isAuthenticated) {
      toast({
        title: "Sign in to watch",
        description: "Create a free account to track your progress and take quizzes.",
        variant: "destructive",
      });
      return;
    }
    setExpandedWeek((current) => (current === week.week ? null : week.week));
  };

  const handleMarkWatched = async (week: FamilyNightVideo) => {
    if (!userId) return;

    markFamilyNightVideoWatched(userId, week.contentId);

    try {
      await apiRequest("POST", "/api/content-progress", {
        courseId: FAMILY_NIGHT_COURSE_ID,
        contentType: "video",
        contentId: week.contentId,
        completed: true,
      });
    } catch {
      // Local progress still works if course 9 is not in DB yet
    }

    toast({
      title: "Teaching marked as watched",
      description: "You can now take the quiz when it is available.",
    });
    refreshProgress();
  };

  const renderQuizButton = (week: FamilyNightVideo) => {
    const quizReady = isQuizUnlocked(week);
    const hasVideo = !!week.videoUrl && !week.noVideo;
    const hasQuiz = !!week.quizPath;

    if (!isAuthenticated) {
      return (
        <Link href="/login">
          <Button size="sm" variant="outline" className="shrink-0 border-purple-400/50 text-purple-100">
            Log in for Quiz
          </Button>
        </Link>
      );
    }

    if (!week.noVideo && !hasVideo) {
      return (
        <Button size="sm" disabled className="shrink-0 bg-gray-600/40 text-gray-300">
          Video Soon
        </Button>
      );
    }

    if (!quizReady) {
      return (
        <Button
          size="sm"
          disabled
          className="shrink-0 bg-gray-600/40 text-gray-300 gap-1"
          title="Watch the teaching first"
        >
          <Lock className="h-3 w-3" />
          Take Quiz
        </Button>
      );
    }

    if (!hasQuiz) {
      return (
        <Button size="sm" disabled className="shrink-0 bg-purple-600/30 text-purple-200">
          Quiz Soon
        </Button>
      );
    }

    return (
      <Link href={week.quizPath!}>
        <Button size="sm" className="shrink-0 bg-purple-600 hover:bg-purple-700">
          Take Quiz
        </Button>
      </Link>
    );
  };

  const finalExamCountdown = useFinalExamCountdown();

  const finalWeeksReady =
    isAuthenticated &&
    allTeachingsWatched(userId) &&
    cycle.weeks.every((w) => w.videoUrl || w.noVideo);

  const finalUnlocked = finalWeeksReady && finalExamCountdown.isOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="mb-6">
          <Link href="/previous-services-blogs">
            <button
              type="button"
              className="flex items-center text-purple-300 hover:text-purple-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Previous Services & Blogs
            </button>
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge className="bg-purple-500/30 text-purple-100 border-purple-400/40">
              Wednesday Midweek Family Night
            </Badge>
            <Badge className="bg-emerald-500/30 text-emerald-100 border-emerald-400/40">
              Theme: {cycle.theme}
            </Badge>
            <Badge variant="outline" className="border-purple-400/40 text-purple-200">
              {cycle.monthLabel}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Users className="inline-block h-10 w-10 mr-3 text-purple-300" />
            Family Night
          </h1>
          <p className="text-xl text-purple-100 mb-3">
            Watch the teaching, take the weekly quiz, and climb the leaderboard.
          </p>
          <p className="text-gray-300 max-w-2xl mx-auto">
            This month we&apos;re studying <strong className="text-white">{cycle.theme}</strong>.
            Watch each teaching before taking that week&apos;s quiz. Fastest correct answers win
            weekly — monthly champions are crowned after the final exam.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 text-purple-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Watch First</h3>
              <p className="text-sm text-purple-200">
                Open the teaching video, then mark it watched to unlock the quiz
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Speed Wins</h3>
              <p className="text-sm text-purple-200">
                100% correct — fastest time tops the board
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 text-amber-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Monthly Prizes</h3>
              <p className="text-sm text-purple-200">
                Overall, men&apos;s, and women&apos;s champions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="h-5 w-5 text-purple-300" />
                  {cycle.theme} — {cycle.monthLabel}
                </CardTitle>
                <p className="text-purple-200 text-sm">
                  Step 1: Watch the teaching. Step 2: Take the quiz (unlocks after watching).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {cycle.weeks.map((week) => {
                  const watched = isVideoWatched(week.contentId);
                  const hasVideo = !!week.videoUrl && !week.noVideo;
                  const isExpanded = expandedWeek === week.week;

                  return (
                    <div
                      key={week.week}
                      className={`p-4 rounded-lg border transition-all ${
                        week.noVideo
                          ? "bg-indigo-900/20 border-indigo-400/30"
                          : watched
                            ? "bg-green-900/20 border-green-500/30"
                            : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-white font-semibold">
                              Week {week.week}: {week.title}
                            </span>
                            {watched && hasVideo && (
                              <Badge className="bg-green-600/80 text-white border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Watched
                              </Badge>
                            )}
                            {week.noVideo && (
                              <Badge variant="outline" className="border-indigo-400/50 text-indigo-200">
                                Quiz only
                              </Badge>
                            )}
                            {!hasVideo && !week.noVideo && (
                              <Badge variant="outline" className="border-amber-400/50 text-amber-200">
                                Video coming soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-purple-200 font-medium text-sm mb-1">
                            {week.subtitle}
                          </p>
                          {week.preacher !== "TBD" && (
                            <p className="text-gray-400 text-xs mb-1">
                              <i className="fas fa-user mr-1" />
                              {week.preacher}
                            </p>
                          )}
                          <p className="text-sm text-purple-200/80">{week.description}</p>

                          {week.noVideo && (
                            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-indigo-400/40 bg-indigo-950/30 py-8 px-4 text-center">
                              <VideoOff className="h-12 w-12 text-indigo-300/80 mb-3" />
                              <p className="text-indigo-100 font-medium">Sorry — no video this week</p>
                              <p className="text-sm text-indigo-200/70 mt-1 max-w-xs">
                                There is no recording for this teaching. You can still take the quiz below.
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 sm:min-w-[140px]">
                          {!week.noVideo && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenVideo(week)}
                              disabled={!hasVideo}
                              className={
                                watched
                                  ? "bg-green-700 hover:bg-green-600"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {isExpanded ? "Hide Video" : watched ? "Rewatch" : "Watch Teaching"}
                            </Button>
                          )}
                          {renderQuizButton(week)}
                        </div>
                      </div>

                      {isExpanded && hasVideo && isAuthenticated && (
                        <div className="mt-4 space-y-4 border-t border-white/10 pt-4 overflow-x-hidden">
                          <FamilyNightVideoPlayer
                            videoUrl={week.videoUrl}
                            isInstagram={week.isInstagram}
                            title={`${week.subtitle} — Week ${week.week}`}
                          />
                          <p className="text-gray-300 text-sm text-center">
                            When you&apos;ve finished watching, mark complete to unlock the quiz.
                          </p>
                          <Button
                            onClick={() => handleMarkWatched(week)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            I&apos;ve Watched — Unlock Quiz
                          </Button>
                        </div>
                      )}

                      {!week.noVideo && !watched && hasVideo && isAuthenticated && !isExpanded && (
                        <p className="text-xs text-purple-300/70 mt-3 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Watch the teaching before you can take the quiz
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Final exam */}
                <div
                  className={`p-4 rounded-lg border ${
                    finalUnlocked
                      ? "bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-400/40"
                      : "bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-400/20 opacity-80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-amber-300" />
                        <span className="text-white font-semibold">{cycle.finalExam.title}</span>
                        {!finalUnlocked && (
                          <Badge variant="outline" className="border-gray-500/50 text-gray-400">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-amber-100">{cycle.finalExam.description}</p>

                      {!finalWeeksReady && (
                        <p className="text-xs text-amber-200/70 mt-2">
                          Complete all three weeks to unlock the monthly championship exam.
                        </p>
                      )}

                      {finalWeeksReady && !finalExamCountdown.isOpen && (
                        <div className="mt-3">
                          <p className="text-xs text-amber-200/80 mb-2">
                            Final exam opens {FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL}.
                          </p>
                          <FamilyNightFinalExamCountdown showOpensLabel={false} />
                        </div>
                      )}
                    </div>
                    {finalUnlocked && cycle.finalExam.quizPath ? (
                      <Link href={cycle.finalExam.quizPath}>
                        <Button
                          size="sm"
                          className="shrink-0 bg-amber-600 hover:bg-amber-700"
                        >
                          Take Final Exam
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="shrink-0 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                      >
                        {!finalWeeksReady
                          ? "Final Exam Locked"
                          : !finalExamCountdown.isOpen
                            ? "Opens Wed 9 PM"
                            : "Exam Soon"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:z-20 self-start">
            <Card className="relative z-20 overflow-hidden border-2 border-amber-400/45 bg-gradient-to-br from-[#1a1033] via-[#2d1a4a] to-[#1f0f33] shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_48px_rgba(251,191,36,0.12)] ring-1 ring-amber-200/20">
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
              <CardHeader className="relative border-b border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-transparent pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-900/40">
                    <Trophy className="h-5 w-5 text-amber-950" />
                  </span>
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-5">
                <p className="text-amber-100/90 text-xs mb-4 leading-relaxed">
                  Overall leader is open to everyone. Men&apos;s and Women&apos;s boards are for
                  separate monthly prizes — highest score, then fastest time.
                </p>

                {!isAuthenticated ? (
                  <p className="text-purple-100 text-sm text-center py-4">
                    Log in to view rankings after taking the final exam.
                  </p>
                ) : leaderboard?.overall?.length ? (
                  <>
                    {leaderboard.champions?.overall ? (
                      <div className="mb-5 rounded-xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-500/25 via-yellow-500/15 to-orange-600/10 p-4 shadow-[0_0_24px_rgba(251,191,36,0.2)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-5 w-5 text-amber-300" />
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
                            Overall leader
                          </p>
                        </div>
                        <p className="text-xl font-bold text-white">
                          {leaderboard.champions.overall.displayName}
                        </p>
                        <p className="text-sm font-semibold text-amber-100 mt-1">
                          {Math.round(leaderboard.champions.overall.scorePercent)}% in{" "}
                          {leaderboard.champions.overall.timeSpentMinutes} min
                        </p>
                      </div>
                    ) : null}
                    <LeaderboardList
                      title="Overall"
                      entries={leaderboard.overall}
                      emptyMessage="No final exam attempts yet."
                    />
                    {leaderboard.champions?.men ? (
                      <div className="mb-3 rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-200 mb-1">
                          Men&apos;s prize leader
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {leaderboard.champions.men.displayName}
                        </p>
                        <p className="text-xs text-sky-100/80">
                          {Math.round(leaderboard.champions.men.scorePercent)}% ·{" "}
                          {leaderboard.champions.men.timeSpentMinutes}m
                        </p>
                      </div>
                    ) : null}
                    <LeaderboardList
                      title="Men's prize board"
                      entries={leaderboard.men}
                      emptyMessage="No men's entries yet."
                      accentClass="text-sky-300"
                    />
                    {leaderboard.champions?.women ? (
                      <div className="mb-3 rounded-lg border border-pink-400/35 bg-pink-500/10 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-200 mb-1">
                          Women&apos;s prize leader
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {leaderboard.champions.women.displayName}
                        </p>
                        <p className="text-xs text-pink-100/80">
                          {Math.round(leaderboard.champions.women.scorePercent)}% ·{" "}
                          {leaderboard.champions.women.timeSpentMinutes}m
                        </p>
                      </div>
                    ) : null}
                    <LeaderboardList
                      title="Women's prize board"
                      entries={leaderboard.women}
                      emptyMessage="No women's entries yet."
                      accentClass="text-pink-300"
                    />
                  </>
                ) : (
                  <div className="text-center py-6 rounded-xl border border-dashed border-amber-400/30 bg-black/20">
                    <Trophy className="h-10 w-10 text-amber-400/70 mx-auto mb-3" />
                    <p className="text-purple-100 text-sm">
                      Take the final exam to appear on the leaderboard.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-500/20 border border-amber-400/40 mt-2 shadow-inner">
                  <p className="text-amber-50 text-center text-xs font-semibold leading-relaxed">
                    {cycle.prizeDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {!isAuthenticated ? (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-purple-100 text-sm mb-4">
                    Sign in to watch teachings, track progress, and compete on the leaderboard.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href="/register">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Sign Up Free
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full border-purple-400/50 text-purple-100"
                      >
                        Log In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-purple-100 text-sm">
                    Signed in as{" "}
                    <span className="text-white font-medium">
                      {(user as { firstName?: string })?.firstName || "Student"}
                    </span>
                    . Your watch progress is saved on this device.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
