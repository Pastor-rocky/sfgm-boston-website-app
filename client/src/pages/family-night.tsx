import { useState, useCallback } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import FamilyNightVideoPlayer from "@/components/family-night-video-player";
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

export default function FamilyNight() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [, bumpProgress] = useState(0);

  const cycle = CURRENT_FAMILY_NIGHT_CYCLE;
  const userId = (user as { id?: string } | null)?.id;

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

  const handleOpenVideo = (week: FamilyNightVideo) => {
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
    const watched = isVideoWatched(week.contentId);
    const hasVideo = !!week.videoUrl;
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

    if (!hasVideo) {
      return (
        <Button size="sm" disabled className="shrink-0 bg-gray-600/40 text-gray-300">
          Video Soon
        </Button>
      );
    }

    if (!watched) {
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

  const finalUnlocked =
    isAuthenticated && allTeachingsWatched(userId) && cycle.weeks.every((w) => w.videoUrl);

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
                  const hasVideo = !!week.videoUrl;
                  const isExpanded = expandedWeek === week.week;

                  return (
                    <div
                      key={week.week}
                      className={`p-4 rounded-lg border transition-all ${
                        watched
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
                            {watched && (
                              <Badge className="bg-green-600/80 text-white border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Watched
                              </Badge>
                            )}
                            {!hasVideo && (
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
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 sm:min-w-[140px]">
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

                      {!watched && hasVideo && isAuthenticated && !isExpanded && (
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
                      {!finalUnlocked && (
                        <p className="text-xs text-amber-200/70 mt-2">
                          Watch all three teachings to unlock the final exam.
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={!finalUnlocked || !cycle.finalExam.quizPath}
                      className="shrink-0 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                    >
                      {cycle.finalExam.quizPath ? "Final Exam" : "Exam Soon"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Trophy className="h-10 w-10 text-yellow-400/60 mx-auto mb-3" />
                  <p className="text-purple-100 text-sm mb-4">
                    Rankings appear once weekly quizzes are live.
                  </p>
                  <div className="space-y-2 text-left text-xs text-purple-200">
                    <p>• Overall champion</p>
                    <p>• Men&apos;s highest</p>
                    <p>• Women&apos;s highest</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
                  <p className="text-yellow-100 text-center text-xs font-medium">
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
