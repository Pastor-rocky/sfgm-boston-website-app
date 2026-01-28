import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Trophy, Crown, Medal, X, Play, BookOpen, GraduationCap, 
  Award, BarChart3, Library, Wrench, FileText, Clock, 
  TrendingUp, Star, Zap, Target, Calendar, BookUser, Users,
  ChevronRight, CheckCircle, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

// Animated Progress Ring Component
function AnimatedProgressRing({ progress, size = 120, strokeWidth = 8, color = "blue" }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    blue: "stroke-blue-500",
    green: "stroke-green-500", 
    purple: "stroke-purple-500",
    yellow: "stroke-yellow-500",
    red: "stroke-red-500"
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClasses[color as keyof typeof colorClasses]} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "blue", 
  variant = "default",
  badge,
  disabled = false 
}: {
  icon: any;
  label: string;
  onClick: () => void;
  color?: string;
  variant?: "default" | "outline" | "ghost";
  badge?: string | number;
  disabled?: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${colorClasses[color as keyof typeof colorClasses]} transition-all duration-300 hover:scale-105 hover:shadow-lg group relative w-full h-12 text-base font-medium`}
      variant={variant}
    >
      <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <Badge className="ml-2 bg-white/20 text-white text-xs px-2 py-1">
          {badge}
        </Badge>
      )}
    </Button>
  );
}

// Course Card Component with Enhanced Features
function EnhancedCourseCard({ enrollment, instructors, onUnenroll, onContinue }: { 
  enrollment: any; 
  instructors: any[];
  onUnenroll: (enrollmentId: number, courseId: number) => void;
  onContinue: (courseId: number) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  const patchEnrollment = useMutation({
    mutationFn: async (payload: { chosenInstructorId?: string | null }) => {
      return apiRequest("PATCH", `/api/enrollments/${enrollment.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/student"] });
      toast({ title: "Saved", description: "Instructor updated." });
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    },
  });

  const saveInstructor = (instructorId: string) => {
    patchEnrollment.mutate({ chosenInstructorId: instructorId || null });
  };

  // Fetch quiz attempts for this course
  const { data: quizAttempts = [] } = useQuery<any[]>({
    queryKey: [`/api/quiz-attempts/course/${enrollment.courseId}`],
    enabled: !!enrollment.courseId,
  });

  // Calculate enhanced statistics
  // Sort attempts by completedAt (most recent first) for accurate latest score
  const sortedAttempts = Array.isArray(quizAttempts) ? [...quizAttempts].sort((a: any, b: any) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return dateB - dateA; // Most recent first
  }) : [];

  // Get unique quiz IDs to count total quizzes (not attempts)
  const uniqueQuizIds = new Set(sortedAttempts.map((a: any) => a.quizId));
  const totalUniqueQuizzes = uniqueQuizIds.size;
  
  // Get best score per quiz (for unique quiz counting)
  const bestScoresByQuiz = new Map<number, { score: number; passingScore: number }>();
  sortedAttempts.forEach((attempt: any) => {
    const quizId = attempt.quizId;
    const score = parseFloat(attempt.score || '0');
    const scorePercent = score <= 1 ? score * 100 : score;
    const passingScore = attempt.passingScore || 60;
    
    if (!bestScoresByQuiz.has(quizId) || scorePercent > (bestScoresByQuiz.get(quizId)?.score || 0)) {
      bestScoresByQuiz.set(quizId, { score: scorePercent, passingScore });
    }
  });
  
  const stats = sortedAttempts.length > 0 ? {
    totalQuizzes: totalUniqueQuizzes, // Count unique quizzes, not attempts
    averageScore: sortedAttempts.reduce((sum: number, attempt: any) => {
      // Score is stored as decimal (0.85), convert to percentage
      const score = parseFloat(attempt.score || '0');
      return sum + (score <= 1 ? score * 100 : score);
    }, 0) / sortedAttempts.length,
    latestScore: (() => {
      const latest = sortedAttempts[0];
      if (!latest) return 0;
      const score = parseFloat(latest.score || '0');
      // Score is stored as decimal (0.85), convert to percentage
      // Handle both decimal (0.85) and percentage (85) formats
      if (score <= 1) {
        return score * 100; // Decimal format
      } else if (score <= 100) {
        return score; // Already percentage
      } else {
        // If somehow > 100, assume it's already percentage
        return score;
      }
    })(),
    latestQuizTitle: sortedAttempts[0]?.quizTitle || '',
    passedQuizzes: Array.from(bestScoresByQuiz.values()).filter((quiz: any) => {
      return quiz.score >= quiz.passingScore;
    }).length, // Count unique quizzes passed, not attempts
    streak: calculateStreak(sortedAttempts),
    lastActivity: sortedAttempts[0]?.completedAt ? new Date(sortedAttempts[0].completedAt) : null
  } : null;

  function calculateStreak(attempts: any[]) {
    if (!attempts.length) return 0;
    let streak = 0;
    // Attempts are already sorted by completedAt (most recent first)
    
    for (let i = 0; i < attempts.length; i++) {
      const score = parseFloat(attempts[i].score || '0');
      const scorePercent = score <= 1 ? score * 100 : score;
      const passingScore = attempts[i].passingScore || 60;
      if (scorePercent >= passingScore) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const handleUnenroll = async () => {
    setIsUnenrolling(true);
    try {
      await onUnenroll(enrollment.id, enrollment.courseId);
      setShowUnenrollConfirm(false);
      toast({
        title: "Successfully Unenrolled",
        description: `You have been unenrolled from ${enrollment.course?.name}`,
      });
    } catch (error) {
      toast({
        title: "Unenrollment Failed",
        description: "Failed to unenroll from the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnenrolling(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Outstanding! 🌟";
    if (score >= 80) return "Great job! 👏";
    if (score >= 70) return "Good work! 👍";
    return "Keep studying! 📚";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-xl font-bold group-hover:text-blue-200 transition-colors">
              {enrollment.course?.name || 'Course Name'}
            </CardTitle>
            <p className="text-gray-900 text-sm mt-1 line-clamp-2 font-medium">
              {enrollment.course?.description || ''}
            </p>
            {/* Select instructor — inline in card */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <BookUser className="w-4 h-4 text-green-300" />
              <span className="text-gray-300">Instructor:</span>
              <select
                value={enrollment.chosenInstructorId ?? ""}
                onChange={(e) => saveInstructor(e.target.value)}
                disabled={patchEnrollment.isPending}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select instructor…</option>
                {instructors.map((i: any) => (
                  <option key={i.id} value={i.id}>
                    {i.firstName} {i.lastName}{i.sfgmChurch ? ` (${i.sfgmChurch})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="ml-4">
            <AnimatedProgressRing 
              progress={enrollment.progress || 0} 
              size={80} 
              strokeWidth={6}
              color="blue"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Stats Display */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">Latest Score</span>
              </div>
              <div className={`text-2xl font-bold ${getPerformanceColor(stats.latestScore)}`}>
                {Math.round(stats.latestScore)}%
              </div>
              <div className="text-xs text-gray-900 font-medium">
                {getPerformanceMessage(stats.latestScore)}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">Passed</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {stats.passedQuizzes}/{stats.totalQuizzes}
              </div>
              <div className="text-xs text-gray-900 font-medium">
                {stats.streak > 0 && `${stats.streak} streak`}
              </div>
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className="flex items-center justify-between text-sm text-gray-900 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {enrollment.course?.duration || 0} weeks
            </span>
          </div>
          {stats?.lastActivity && (
            <span className="text-xs text-gray-900 font-medium">
              Last active: {stats.lastActivity.toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onContinue(enrollment.courseId)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold group"
          >
            <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Continue Course
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnenrollConfirm(true)}
            className="bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 hover:border-red-400/70 hover:text-red-200"
            disabled={isUnenrolling}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      {/* Unenroll Confirmation Modal */}
      {showUnenrollConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-gray-900">Confirm Unenrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to unenroll from <strong>{enrollment.course?.name}</strong>? 
                This action cannot be undone and you will lose all progress in this course.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowUnenrollConfirm(false)}
                  disabled={isUnenrolling}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnenroll}
                  disabled={isUnenrolling}
                >
                  {isUnenrolling ? "Unenrolling..." : "Yes, Unenroll"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}

// Smart Recommendation Component - REMOVED as requested

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [hasShownBirthday, setHasShownBirthday] = useState(false);
  const [, setLocation] = useLocation();

  // Check for birthday and show message
  useEffect(() => {
    if (!user || hasShownBirthday) return;

    const userData = user as any;
    if (!userData.dateOfBirth) return;

    const today = new Date();
    const birthDate = new Date(userData.dateOfBirth);
    
    // Check if today is their birthday (same month and day)
    const isBirthday = 
      birthDate.getMonth() === today.getMonth() && 
      birthDate.getDate() === today.getDate();

    if (isBirthday) {
      const birthdayKey = `birthday_${userData.id}_${today.toISOString().split('T')[0]}`;
      const hasShownToday = sessionStorage.getItem(birthdayKey);
      
      if (!hasShownToday) {
        setHasShownBirthday(true);
        sessionStorage.setItem(birthdayKey, 'true');
        
        setTimeout(() => {
          toast({
            title: "🎉 Happy Birthday!",
            description: `Happy Birthday ${userData.firstName || 'Student'}! 🎂🎈 We're blessed to have you as part of our SFGM Boston Bible School family. May God continue to bless you on this special day and throughout the year!`,
            duration: 10000,
          });
        }, 1000);
      }
    }
  }, [user, toast, hasShownBirthday]);

  // Show congratulations message for new registrations
  useEffect(() => {
    const fromRegistration = document.referrer.includes('/register') || sessionStorage.getItem('newRegistration');
    
    if (fromRegistration && user && !hasShownWelcome) {
      setHasShownWelcome(true);
      sessionStorage.removeItem('newRegistration');
      sessionStorage.removeItem('registrationPassword');
      
      setTimeout(() => {
        toast({
          title: "🎉 Thank You for Joining SFGM Boston!",
          description: `Welcome ${(user as any)?.firstName || 'Student'}! We're thrilled to have you as part of our Bible School community. Your account is ready - start exploring courses and begin your spiritual journey with us!`,
          duration: 8000,
        });
      }, 500);
    }
  }, [user, toast, hasShownWelcome]);

  // Fetch student data
  const { data: gpaData } = useQuery({
    queryKey: ['/api/analytics/gpa'],
  });

  const { data: enrollments = [], isError: enrollmentsError, refetch: refetchEnrollments } = useQuery({
    queryKey: ['/api/enrollments/student'],
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['/api/instructors'],
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['/api/certificates'],
  });

  // Fetch Genesis to Revelation leaderboard
  const { data: genesisLeaderboard = [] } = useQuery({
    queryKey: ['/api/genesis-leaderboard'],
  });

  const activeEnrollments = (enrollments as any[]).filter((e: any) => e.status === 'active');
  const completedEnrollments = (enrollments as any[]).filter((e: any) => e.status === 'completed');
  const totalEnrollments = (enrollments as any[]).length;
  const currentGPA = (gpaData as any)?.gpa || 0;
  const certificateCount = (certificates as any[]).length;

  // Calculate overall progress
  const overallProgress = activeEnrollments.length > 0 
    ? Math.round(activeEnrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) / activeEnrollments.length)
    : 0;

  // Unenroll function
  const handleUnenroll = async (enrollmentId: number, courseId: number) => {
    try {
      const response = await fetch(`/api/enrollments/student/${(user as any)?.id}/course/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unenroll');
      }

      // Invalidate all relevant queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/enrollments/student'] }),
        queryClient.invalidateQueries({ queryKey: [`/api/quiz-attempts/course/${courseId}`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/student/quizzes/all`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/content-progress/${courseId}`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/quiz-attempts/student`] }),
      ]);
      
      // Clear all query caches to ensure no stale data
      queryClient.clear();
      
      // Wait a moment for cache to clear, then reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error unenrolling:', error);
      throw error;
    }
  };

  // Continue course function
  const handleContinueCourse = (courseId: number) => {
    setLocation(`/course/${courseId}`);
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'grades':
        setLocation('/student-grades');
        break;
      case 'certificates':
        setLocation('/my-certificates');
        break;
      case 'library':
        setLocation('/my-personal-library');
        break;
      case 'tools':
        setLocation('/bible-study-tools');
        break;
      case 'profile':
        setLocation('/student-profile');
        break;
      case 'enroll':
        setLocation('/course-catalog');
        break;
      default:
        break;
    }
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!user) return false;
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    return requiredFields.every(field => (user as any)[field]?.trim() !== '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Enhanced Welcome Header - entire block links to profile (student-profile = full profile editor) */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => setLocation('/student-profile')}
            className="inline-flex items-center gap-3 mb-4 no-underline group cursor-pointer bg-transparent border-0 p-0 text-left"
            title="Go to profile"
          >
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:from-blue-600 group-hover:to-purple-700 group-hover:shadow-lg">
              <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'S'}{user?.lastName?.charAt(0)?.toUpperCase() || ''}
              </span>
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                <i className="fas fa-edit text-blue-600 text-xs" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white group-hover:text-blue-100 transition-colors">
                Welcome back, {(user as any)?.firstName || 'Student'}!
              </h1>
              <p className="text-xl text-blue-200">
                Continue your spiritual journey with us
              </p>
            </div>
          </button>
        </div>


        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalEnrollments}</div>
              <div className="text-gray-700 text-sm font-medium">Total Courses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{activeEnrollments.length}</div>
              <div className="text-gray-700 text-sm font-medium">Active Courses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{completedEnrollments.length}</div>
              <div className="text-gray-700 text-sm font-medium">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{currentGPA.toFixed(1)}</div>
              <div className="text-gray-700 text-sm font-medium">Current GPA</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Course Progress & Active Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Progress Card */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <AnimatedProgressRing progress={overallProgress} size={120} color="blue" />
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total Progress</span>
                        <span className="text-gray-900 text-lg font-bold">{overallProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {enrollmentsError
                          ? 'Couldn’t load course data'
                          : activeEnrollments.length > 0 
                            ? `Based on ${activeEnrollments.length} active course${activeEnrollments.length !== 1 ? 's' : ''}`
                            : 'No active courses'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Courses */}
            {activeEnrollments.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Play className="h-6 w-6 text-blue-400" />
                  Continue Your Courses
                </h2>
                <div className="grid gap-6">
                  {activeEnrollments.map((enrollment: any) => (
                    <EnhancedCourseCard 
                      key={enrollment.id} 
                      enrollment={enrollment}
                      instructors={instructors as any[]}
                      onUnenroll={handleUnenroll}
                      onContinue={handleContinueCourse}
                    />
                  ))}
                </div>
              </div>
            ) : enrollmentsError ? (
              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm border-amber-500/30">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Couldn’t load your courses</h3>
                  <p className="text-gray-300 mb-6">
                    We couldn’t fetch your enrollments. If you’re testing locally, ensure you’re using the same database as production (check <code className="text-amber-200 bg-amber-900/50 px-1 rounded">.env</code> <code className="text-amber-200 bg-amber-900/50 px-1 rounded">DATABASE_URL</code>). Otherwise, try refreshing.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      onClick={() => refetchEnrollments()}
                      variant="outline"
                      className="border-amber-400 text-amber-100 hover:bg-amber-500/20"
                    >
                      Try again
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('enroll')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3"
                    >
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Courses</h3>
                  <p className="text-gray-300 mb-6">Start your spiritual journey by enrolling in a course</p>
                  <Button 
                    onClick={() => handleQuickAction('enroll')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3"
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Completed Courses */}
            {completedEnrollments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Completed Courses
                </h2>
                <div className="grid gap-4">
                  {completedEnrollments.map((enrollment: any) => (
                    <Card key={enrollment.id} className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm border-green-500/30">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg">{enrollment.course?.name || 'Course Name'}</h4>
                            <p className="text-green-200 text-sm">{enrollment.course?.description || ''}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                              <span>Completed: {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'N/A'}</span>
                              <span>Duration: {enrollment.course?.duration || 0} weeks</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-green-400">{enrollment.grade || 'N/A'}</div>
                            <div className="text-xs text-gray-300">Final Grade</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions, Leaderboard, Recommendations */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuickActionButton
                  icon={BarChart3}
                  label="Check Grades"
                  onClick={() => handleQuickAction('grades')}
                  color="green"
                  badge={activeEnrollments.length}
                />
                <QuickActionButton
                  icon={Award}
                  label="My Certificates"
                  onClick={() => handleQuickAction('certificates')}
                  color="yellow"
                  badge={certificateCount}
                />
                <QuickActionButton
                  icon={Library}
                  label="My Library"
                  onClick={() => handleQuickAction('library')}
                  color="purple"
                />
                <QuickActionButton
                  icon={Wrench}
                  label="Study Tools"
                  onClick={() => handleQuickAction('tools')}
                  color="indigo"
                />
                {!isProfileComplete() && (
                  <QuickActionButton
                    icon={Users}
                    label="Complete Your Profile"
                    onClick={() => handleQuickAction('profile')}
                    color="blue"
                  />
                )}
              </CardContent>
            </Card>

            {/* Enrollment Options */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                  Enroll in Courses
                </CardTitle>
                <p className="text-gray-900 text-sm font-medium">
                  Choose from our available programs
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/sfgm-orlando">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">SFGM Orlando Bible School</h4>
                      <p className="text-gray-900 text-xs font-medium">Bible study programs in Orlando</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link href="/bible-university">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">SFGM Boston BBU</h4>
                      <p className="text-gray-900 text-xs font-medium">Full degree programs in Boston</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link href="/course-catalog">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">Mini Courses</h4>
                      <p className="text-gray-900 text-xs font-medium">Short-term courses and studies</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </CardContent>
            </Card>


            {/* Genesis to Revelation Leaderboard */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Genesis to Revelation Leaderboard
                </CardTitle>
                <p className="text-gray-900 text-sm font-medium">
                  Monthly competition • Prizes for top performers
                </p>
              </CardHeader>
              <CardContent>
                {Array.isArray(genesisLeaderboard) && genesisLeaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {/* Top 3 Overall */}
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-sm">Top Performers</h4>
                      {genesisLeaderboard.slice(0, 3).map((entry: any, index: number) => {
                        const isCurrentUser = entry.userId === (user as any)?.id;
                        return (
                          <div 
                            key={entry.userId || entry.id} 
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-blue-500/20 border border-blue-400/50' 
                                : 'bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                              {index === 1 && <Medal className="h-4 w-4 text-gray-300" />}
                              {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                              <span className="text-white text-sm font-medium">
                                {entry.firstName} {entry.lastName}
                                {isCurrentUser && <span className="text-blue-300 ml-1">(You)</span>}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-white font-bold text-sm">{entry.totalScore || 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Monthly Prize Info */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-200 text-center font-semibold text-xs">
                        🏆 This Month's Prize: Beautiful Study Bible 🏆
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-900 text-sm font-medium">Complete quizzes to see your ranking!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}