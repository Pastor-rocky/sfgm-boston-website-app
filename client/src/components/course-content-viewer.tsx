import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';


interface ContentProgressItem {
  id: number;
  studentId: string;
  courseId: number;
  contentType: 'video' | 'reading' | 'quiz';
  contentId: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface CourseVideo {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  orderIndex: number;
  isRequired: boolean;
  isPublished: boolean;
}

interface CourseReading {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  readingType: 'text' | 'book_chapter' | 'external_link';
  content: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  chapterNumber: number | null;
  chapterTitle: string | null;
  pageRange: string | null;
  externalUrl: string | null;
  pdfUrl: string | null;
  hasAudioOption: boolean;
  audioUrl: string | null;
  estimatedTime: number | null;
  orderIndex: number;
  isRequired: boolean;
  isPublished: boolean;
}

interface Quiz {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  isPublished: boolean;
  isFinalExam: boolean;
  orderIndex: number;
  questions: number;
}

interface QuizAttempt {
  id: number;
  studentId: string;
  quizId: number;
  score: number;
  startedAt?: string;
  completedAt: string;
  timeSpent: number;
  passed: boolean;
}

interface CourseContentViewerProps {
  courseId: number;
}

export default function CourseContentViewer({ courseId }: CourseContentViewerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  // For courses without videos (Course 2, Course 4), start with readings tab
  const [activeTab, setActiveTab] = useState((courseId === 2 || courseId === 4) ? 'readings' : 'videos');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<CourseVideo | null>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Fetch course content
  const { data: videos = [], isLoading: videosLoading } = useQuery<CourseVideo[]>({
    queryKey: [`/api/courses/${courseId}/videos`],
    enabled: !!courseId,
  });

  // Helper function to create progress tracking for readings
  const createReadingProgressHandler = (contentId: number, action: () => void) => {
    return async () => {
      try {
        // For Course 2, Course 4, and Course 7, update manual completions immediately for instant UI feedback
        if (courseId === 2) {
          const manualKey = `reading-${contentId}`;
          setCourse2Completions(prev => ({ ...prev, [manualKey]: true }));
        } else if (courseId === 4) {
          const manualKey = `reading-${contentId}`;
          setManualCompletions(prev => ({ ...prev, [manualKey]: true }));
        } else if (courseId === 7) {
          const manualKey = `reading-${contentId}`;
          setCourse7Completions(prev => ({ ...prev, [manualKey]: true }));
        }
        
        await progressMutation.mutateAsync({
          courseId,
          contentType: 'reading',
          contentId,
          completed: true
        });
        // Invalidate queries to refresh UI - use the correct query key with courseId
        await queryClient.invalidateQueries({ queryKey: [`/api/content-progress/${courseId}`] });
        // Force refetch immediately
        await queryClient.refetchQueries({ queryKey: [`/api/content-progress/${courseId}`] });
      } catch (error) {
        console.error('Failed to update reading progress:', error);
        // Remove manual completion on error
        if (courseId === 2) {
          const manualKey = `reading-${contentId}`;
          setCourse2Completions(prev => {
            const next = { ...prev };
            delete next[manualKey];
            return next;
          });
        } else if (courseId === 4) {
          const manualKey = `reading-${contentId}`;
          setManualCompletions(prev => {
            const next = { ...prev };
            delete next[manualKey];
            return next;
          });
        } else if (courseId === 7) {
          const manualKey = `reading-${contentId}`;
          setCourse7Completions(prev => {
            const next = { ...prev };
            delete next[manualKey];
            return next;
          });
        }
      }
      action();
    };
  };


  const { data: readings = [], isLoading: readingsLoading, error: readingsError, refetch: refetchReadings } = useQuery<CourseReading[]>({
    queryKey: [`/api/courses/${courseId}/readings`],
    enabled: !!courseId,
    staleTime: 0, // Force fresh data for course 4
    gcTime: courseId === 4 ? 0 : 5 * 60 * 1000, // Don't cache course 4 readings (cacheTime renamed to gcTime in v5)
  });

  // Force refetch for course 4 if readings are empty (one-time fix for cache issues)
  if (courseId === 4 && !readingsLoading && readings.length === 0) {
    // Fixing course readings cache
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/readings`] });
      refetchReadings();
    }, 100);
  }

  const { data: allQuizzes = [], isLoading: allQuizzesLoading, error: quizzesError, refetch: refetchQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/student/quizzes/all`],
    enabled: !!courseId,
    retry: 1,
    staleTime: 0, // Force fresh data 
    gcTime: 0, // Don't cache 
  });


  // Force refetch quizzes if they're empty (similar to readings fix)
  if (courseId === 4 && !allQuizzesLoading && allQuizzes.length === 0) {
    // Fixing course quizzes cache
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: [`/api/student/quizzes/all`] });
      refetchQuizzes();
    }, 100);
  }

  // Debug API errors
  if (quizzesError) {
    console.error('Quiz API error:', quizzesError);
  }

  // Filter quizzes for the current course
  let quizzes = allQuizzes.filter((q: any) => q.courseId === courseId);
  
  // Special handling for Acts in Action course (courseId = 1)
  // Since quizzes aren't linked to courses, we need to filter by title pattern
  if (courseId === 1) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && (q.title.includes('Acts in Action') || q.title.includes('Acts Week'))
    );
  }
  
  // Special handling for Fire Starter course (courseId = 2)
  if (courseId === 2) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('Fire Starter')
    );
  }
  
  // Special handling for Don't Be a Jonah course (courseId = 3)
  if (courseId === 3) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && (q.title.includes('Jonah') || q.title.includes('DBAJ'))
    );
  }
  
  // Special handling for Studying for Service course (courseId = 5)
  if (courseId === 5) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('Studying for Service')
    );
  }
  
  // Special handling for G.R.O.W course (courseId = 4)
  if (courseId === 4) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('G.R.O.W')
    );
  }
  
  // Special handling for Deacon Course (courseId = 6)
  if (courseId === 6) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('Deacon Course')
    );
  }
  
  // Special handling for Level Up Leadership Course (courseId = 7)
  if (courseId === 7) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('Level Up Leadership')
    );
  }
  
  // Special handling for Youth Ministry Course (courseId = 8)
  if (courseId === 8) {
    quizzes = allQuizzes.filter((q: any) => 
      q.title && q.title.includes('Youth Ministry')
    );
  }
  
  // Quiz filtering complete

  // Fetch student progress with forced refresh
  const [forceRefresh, setForceRefresh] = useState(0);
  const { data: contentProgress = [], isLoading: contentProgressLoading, error: contentProgressError, refetch: refetchProgress } = useQuery<ContentProgressItem[]>({
    queryKey: [`/api/content-progress/${courseId}`, forceRefresh],
    enabled: !!courseId,
    staleTime: 0,
    gcTime: 0, // Don't cache at all
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Manual completion tracking for G.R.O.W course cache issues
  const [manualCompletions, setManualCompletions] = useState<{[key: string]: boolean}>({});
  
  // Manual completion tracking for Course 2 to ensure immediate UI updates
  const [course2Completions, setCourse2Completions] = useState<{[key: string]: boolean}>({});
  
  // Initialize Course 2 completions from contentProgress on load
  useEffect(() => {
    if (courseId === 2 && contentProgress.length > 0) {
      const course2Progress = contentProgress.filter((p: any) => 
        p.courseId === 2 && p.contentType === 'reading' && p.completed
      );
      const completions: {[key: string]: boolean} = {};
      course2Progress.forEach((p: any) => {
        const key = `reading-${p.contentId}`;
        completions[key] = true;
      });
      setCourse2Completions(completions);
    }
  }, [courseId, contentProgress]);

  // Manual completion tracking for Course 7 to ensure immediate UI updates
  const [course7Completions, setCourse7Completions] = useState<{[key: string]: boolean}>({});
  
  // Initialize Course 7 completions from contentProgress on load
  useEffect(() => {
    if (courseId === 7 && contentProgress.length > 0) {
      const course7Progress = contentProgress.filter((p: any) => 
        p.courseId === 7 && p.contentType === 'reading' && p.completed
      );
      const completions: {[key: string]: boolean} = {};
      course7Progress.forEach((p: any) => {
        const key = `reading-${p.contentId}`;
        completions[key] = true;
      });
      setCourse7Completions(completions);
    }
  }, [courseId, contentProgress]);

  // Initialize Course 4 completions from contentProgress on load
  useEffect(() => {
    if (courseId === 4 && contentProgress.length > 0) {
      const course4Progress = contentProgress.filter((p: any) => 
        p.courseId === 4 && p.contentType === 'reading' && p.completed
      );
      const completions: {[key: string]: boolean} = {};
      course4Progress.forEach((p: any) => {
        const key = `reading-${p.contentId}`;
        completions[key] = true;
      });
      setManualCompletions(completions);
    }
  }, [courseId, contentProgress]);

  const deaconReadingSchedule = [
    { week: 1, title: 'Introduction & Chapter 1: The Unignorable Nudge', route: '/deacon-course-ch1' },
    { week: 2, title: 'Chapter 2: Laying the Foundation', route: '/deacon-course-ch2' },
    { week: 3, title: 'Chapter 3: The Servant in Motion', route: '/deacon-course-ch3' },
    { week: 4, title: 'Chapter 4: The Spiritual Battlefield', route: '/deacon-course-ch4' },
    { week: 5, title: 'Chapter 5: Commissioned for Impact', route: '/deacon-course-ch5' },
  ];

  const youthReadingSchedule = [
    { week: 1, title: 'Chapter 1: The Calling', route: '/youth-ministry-course-ch1' },
    { week: 2, title: 'Chapter 2: Requirements', route: '/youth-ministry-course-ch2' },
    { week: 3, title: 'Chapter 3: Responsibilities', route: '/youth-ministry-course-ch3' },
    { week: 4, title: 'Chapter 4: Accountability', route: '/youth-ministry-course-ch4' },
    { week: 5, title: 'Chapter 5: Making New Disciples', route: '/youth-ministry-course-ch5' },
  ];

  // Load manual completions from API once
  React.useEffect(() => {
    if (courseId === 4 && Object.keys(manualCompletions).length === 0) {
      const loadManualCompletions = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        try {
          const response = await fetch(`/api/content-progress/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          
          if (Array.isArray(data)) {
            const completions: {[key: string]: boolean} = {};
            data.forEach((item: any) => {
              if (item.completed) {
                const key = `${item.contentType}-${item.contentId}`;
                completions[key] = true;
              }
            });
            setManualCompletions(completions);
            // Manual completions loaded
          }
        } catch (error) {
          console.error('Failed to load manual completions:', error);
        }
      };
      
      loadManualCompletions();
    }
  }, [courseId, manualCompletions]);

  // Content progress tracking complete

  // Content progress tracking

  // Fetch quiz attempts for this course with manual authentication
  const { data: quizAttempts = [], isLoading: attemptsLoading, error: attemptsError, refetch: refetchQuizAttempts } = useQuery<QuizAttempt[]>({
    queryKey: [`/api/quiz-attempts/course/${courseId}`],
    enabled: courseId !== null && courseId !== undefined && courseId >= 0, // Enable for courseId 0
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the results (cacheTime renamed to gcTime in v5)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token');
      
      const response = await fetch(`/api/quiz-attempts/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }
  });
  
  // Refetch quiz attempts when courseId changes or when returning from quiz
  React.useEffect(() => {
    if (courseId !== null && courseId !== undefined) {
      // Refetch quiz attempts when component mounts or courseId changes
      refetchQuizAttempts();
    }
  }, [courseId, refetchQuizAttempts]);

  // Refetch quiz attempts when page becomes visible (user returns from quiz page)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && courseId !== null && courseId !== undefined) {
        if (courseId === 3 || courseId === 4) {
          console.log(`[Course ${courseId}] Page became visible, refetching quiz attempts...`);
        }
        refetchQuizAttempts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refetch on focus (when user switches back to this tab)
    const handleFocus = () => {
      if (courseId !== null && courseId !== undefined) {
        if (courseId === 3 || courseId === 4) {
          console.log(`[Course ${courseId}] Window focused, refetching quiz attempts...`);
        }
        refetchQuizAttempts();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [courseId, refetchQuizAttempts]);

  const getQuizAttemptInfo = (quizId: number) => {
    const completedAttempts = quizAttempts.filter((attempt: QuizAttempt) => attempt.quizId === quizId && !!attempt.completedAt);
    if (completedAttempts.length === 0) {
      return {
        count: 0,
        bestScorePercent: null as number | null,
        latestScorePercent: null as number | null,
        latestPassed: false,
      };
    }

    const normalizeScore = (raw: number) => {
      if (Number.isNaN(raw)) return 0;
      return raw <= 1 ? raw * 100 : raw;
    };

    const bestScorePercent = Math.max(
      ...completedAttempts.map((attempt) => {
        const raw = typeof attempt.score === 'string'
          ? parseFloat(attempt.score || '0')
          : attempt.score || 0;
        return normalizeScore(raw);
      }),
    );

    const latestAttempt = [...completedAttempts].sort((a, b) => {
      const aDate = new Date(a.completedAt || a.startedAt || 0).getTime();
      const bDate = new Date(b.completedAt || b.startedAt || 0).getTime();
      return bDate - aDate;
    })[0];

    const latestRaw = typeof latestAttempt.score === 'string'
      ? parseFloat(latestAttempt.score || '0')
      : latestAttempt.score || 0;
    const latestScorePercent = normalizeScore(latestRaw);
    const passingScore = quizzes.find((q: any) => q.id === quizId)?.passingScore || 60;
    const latestPassed = latestScorePercent >= passingScore;

    return {
      count: completedAttempts.length,
      bestScorePercent,
      latestScorePercent,
      latestPassed,
    };
  };
  
  // Quiz attempts loaded successfully

  // Prerequisites removed - all content is freely accessible

  // Progress tracking mutation
  const progressMutation = useMutation({
    mutationFn: async (data: {
      courseId: number;
      contentType: 'video' | 'reading' | 'quiz';
      contentId: number;
      completed: boolean;
    }) => {
      return apiRequest('POST', '/api/content-progress', data);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: [`/api/content-progress/${variables.courseId}`] });
      
      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<ContentProgressItem[]>([`/api/content-progress/${variables.courseId}`]);
      
      // Optimistically update the cache immediately
      queryClient.setQueryData<ContentProgressItem[]>([`/api/content-progress/${variables.courseId}`], (old = []) => {
        // Check if this progress item already exists
        const existingIndex = old.findIndex(
          (p: ContentProgressItem) => 
            p.courseId === variables.courseId &&
            p.contentType === variables.contentType &&
            p.contentId === variables.contentId
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          const updated = [...old];
          updated[existingIndex] = {
            ...updated[existingIndex],
            completed: variables.completed
          };
          return updated;
        } else {
          // Add new item
          return [...old, {
            courseId: variables.courseId,
            contentType: variables.contentType,
            contentId: variables.contentId,
            completed: variables.completed,
            // Add placeholder fields that might be needed
            id: Date.now(), // Temporary ID
            userId: 0, // Will be set by server
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ContentProgressItem];
        }
      });
      
      // Force a complete refresh by updating the force refresh counter
      setForceRefresh(prev => prev + 1);
      
      // Return context with previous value for rollback
      return { previousProgress };
    },
    onSuccess: async (data, variables) => {
      console.log('[Progress Mutation Success]', {
        courseId: variables.courseId,
        contentType: variables.contentType,
        contentId: variables.contentId,
        completed: variables.completed
      });
      
      // Invalidate and refetch content progress to get server response
      await queryClient.invalidateQueries({ queryKey: [`/api/content-progress/${variables.courseId}`] });
      await queryClient.refetchQueries({ queryKey: [`/api/content-progress/${variables.courseId}`] });
      
      // Force refresh the readings data as well
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/readings`] });
      
      console.log('[Progress Mutation] Query refreshed, UI should update');
    },
    onError: (error, variables, context) => {
      console.error('Progress mutation failed:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Rollback optimistic update on error
      if (context?.previousProgress) {
        queryClient.setQueryData([`/api/content-progress/${variables.courseId}`], context.previousProgress);
      }
    },
  });

  const handleContentComplete = async (contentType: 'video' | 'reading' | 'quiz', contentId: number) => {
    try {
      await progressMutation.mutateAsync({
        courseId,
        contentType,
        contentId,
        completed: true,
      });
      toast({
        title: 'Progress Updated',
        description: `${contentType === 'video' ? 'Video' : contentType === 'reading' ? 'Reading' : 'Quiz'} marked as complete!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const isContentCompleted = (contentType: 'video' | 'reading' | 'quiz', contentId: number) => {
    // For G.R.O.W course, use manual completions as fallback
    if (courseId === 4) {
      const manualKey = `${contentType}-${contentId}`;
      const manualCompletion = manualCompletions[manualKey];
      if (manualCompletion) return true;
    }
    
    // For Course 2, check manual completions first (immediate UI update)
    if (courseId === 2 && contentType === 'reading') {
      const manualKey = `${contentType}-${contentId}`;
      const manualCompletion = course2Completions[manualKey];
      if (manualCompletion) return true;
    }
    
    // For Course 7, check manual completions first (immediate UI update)
    if (courseId === 7 && contentType === 'reading') {
      const manualKey = `${contentType}-${contentId}`;
      const manualCompletion = course7Completions[manualKey];
      if (manualCompletion) return true;
    }
    
    // Check contentProgress array - MUST filter by courseId!
    const isCompleted = contentProgress.some(
      (p) => p.courseId === courseId && p.contentType === contentType && p.contentId === contentId && p.completed
    );
    
    return isCompleted;
  };

  // Get quiz attempt for a specific quiz
  const getQuizAttempt = (quizId: number) => {
    return quizAttempts.find((attempt: QuizAttempt) => attempt.quizId === quizId);
  };

  // Check if quiz was passed
  const isQuizPassed = (quizId: number, passingScore: number) => {
    const attempt = getQuizAttempt(quizId);
    return attempt ? attempt.score >= passingScore : false;
  };

  // Get congratulations message
  const getCongratulationsMessage = (score: number, passingScore: number) => {
    const percentage = Math.round(score);
    if (percentage >= 90) {
      return `🎉 Excellent work! You scored ${percentage}% - Outstanding performance!`;
    } else if (percentage >= passingScore) {
      return `🎊 Congratulations! You passed with ${percentage}% - Great job!`;
    } else {
      return `📚 You scored ${percentage}%. Keep studying to reach the ${passingScore}% passing score.`;
    }
  };

  const getCompletionStats = () => {
    const publishedVideos = videos.filter((v: CourseVideo) => v.isPublished);
    const publishedReadings = readings.filter((r: CourseReading) => r.isPublished);
    // Use all quizzes for this course (they come from the quiz system, not course structure)
    const totalQuizzes = quizzes.length;
    
    const completedVideos = publishedVideos.filter((v: CourseVideo) => 
      isContentCompleted('video', v.id)
    ).length;
    
    const completedReadings = publishedReadings.filter((r: CourseReading) => 
      isContentCompleted('reading', r.id)
    ).length;
    
    // Count completed quizzes based on actual quiz attempts (regardless of pass/fail)
    const completedQuizzes = quizzes.filter((q: any) => 
      q.attempts > 0
    ).length;

    // Special handling for Acts in Action course (courseId = 1)
    if (courseId === 1) {
      // For Acts in Action, we have 10 weeks of hardcoded Bible readings
      const totalReadings = 10; // 10 weeks of Bible readings
      const totalQuizzesForCourse = 11; // 10 weekly quizzes + 1 final exam
      const totalVideosForCourse = 10; // 10 weeks of video content
      
      // Count completed reading weeks for Acts in Action (not individual readings)
      // Each week has 3 readings: Introduction, Chapter, Bible
      // We count a week as completed when ALL 3 readings for that week are done
      const completedReadingWeeks = [];
      for (let week = 1; week <= 10; week++) {
        const weekReadingIds = getCourse1ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => p.contentId === id && p.contentType === 'reading' && p.completed)
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForActs = completedReadingWeeks.length;
      
      // Count completed quizzes for Acts in Action - count all attempts regardless of pass/fail
      const completedQuizzesForActs = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: completedVideos, total: totalVideosForCourse },
        readings: { completed: completedReadingsForActs, total: totalReadings },
        quizzes: { completed: completedQuizzesForActs, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Fire Starter course (courseId = 2)
    if (courseId === 2) {
      // For Fire Starter, we have 10 weeks of readings (textbook chapters)
      const totalReadings = 10; // 10 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = 11; // 10 weekly quizzes + 1 final exam
      const totalVideosForCourse = publishedVideos.length; // Count actual published videos
      
      // Count completed videos from content progress
      const completedVideosForFireStarter = contentProgress.filter((p: any) => 
        p.courseId === courseId && p.contentType === 'video' && p.completed
      ).length;
      
      // Count completed reading weeks (like Course 1) - only count weeks where BOTH readings are done
      // Only count the hardcoded IDs (101-120) to ignore old progress with different IDs
      const validReadingIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 10; week++) {
        const weekReadingIds = getCourse2ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForFireStarter = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForFireStarter = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: completedVideosForFireStarter, total: totalVideosForCourse },
        readings: { completed: completedReadingsForFireStarter, total: totalReadings },
        quizzes: { completed: completedQuizzesForFireStarter, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Don't Be a Jonah course (courseId = 3)
    if (courseId === 3) {
      // For Don't Be a Jonah, we have 11 weeks of readings (textbook chapters)
      const totalReadings = 11; // 11 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = 12; // 11 weekly quizzes + 1 final exam
      const totalVideosForCourse = publishedVideos.length; // Count actual published videos
      
      // Count completed videos from content progress
      const completedVideosForJonah = contentProgress.filter((p: any) => 
        p.courseId === courseId && p.contentType === 'video' && p.completed
      ).length;
      
      // Count completed reading weeks (like Course 1 and 2) - only count weeks where BOTH readings are done
      // Only count the hardcoded IDs (201-222) to ignore old progress with different IDs
      const validReadingIds = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 11; week++) {
        const weekReadingIds = getCourse3ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForJonah = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForJonah = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: completedVideosForJonah, total: totalVideosForCourse },
        readings: { completed: completedReadingsForJonah, total: totalReadings },
        quizzes: { completed: completedQuizzesForJonah, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for G.R.O.W course (courseId = 4)
    if (courseId === 4) {
      // For G.R.O.W, we have 4 weeks of readings (textbook chapters only, no videos)
      const totalReadings = 4; // 4 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = quizzes.length; // Count actual quizzes
      const totalVideosForCourse = 0; // No videos for Course 4
      
      // Count completed reading weeks - only count weeks where reading is done
      // Only count the hardcoded IDs (301-304) to ignore old progress with different IDs
      const validReadingIds = [301, 302, 303, 304];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 4; week++) {
        const weekReadingIds = getCourse4ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForGrow = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForGrow = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: 0, total: 0 },
        readings: { completed: completedReadingsForGrow, total: totalReadings },
        quizzes: { completed: completedQuizzesForGrow, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Studying for Service course (courseId = 5)
    if (courseId === 5) {
      // For Studying for Service, we have 12 weeks of readings (textbook chapters + Bible reading)
      const totalReadings = 12; // 12 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = quizzes.length; // Count actual quizzes
      const totalVideosForCourse = publishedVideos.length; // Count actual published videos
      
      // Count completed videos from content progress
      const completedVideosForStudying = contentProgress.filter((p: any) => 
        p.courseId === courseId && p.contentType === 'video' && p.completed
      ).length;
      
      // Count completed reading weeks (like Course 1, 2, 3) - only count weeks where BOTH readings are done
      // Only count the hardcoded IDs (401-424) to ignore old progress with different IDs
      const validReadingIds = [401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 12; week++) {
        const weekReadingIds = getCourse5ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForStudying = completedReadingWeeks.length;

      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForStudying = quizzes.filter((q: any) =>
        q.attempts > 0
      ).length;

      return {
        videos: { completed: completedVideosForStudying, total: totalVideosForCourse },
        readings: { completed: completedReadingsForStudying, total: totalReadings },
        quizzes: { completed: completedQuizzesForStudying, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Deacon Course (courseId = 6)
    if (courseId === 6) {
      // For Deacon Course, we have 5 weeks of readings (textbook chapters only, no videos)
      const totalReadings = 5; // 5 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = quizzes.length; // Count actual quizzes
      const totalVideosForCourse = 0; // No videos for Course 6
      
      // Count completed reading weeks - only count weeks where reading is done
      // Only count the hardcoded IDs (501-505) to ignore old progress with different IDs
      const validReadingIds = [501, 502, 503, 504, 505];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 5; week++) {
        const weekReadingIds = getCourse6ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForDeacon = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForDeacon = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: 0, total: 0 },
        readings: { completed: completedReadingsForDeacon, total: totalReadings },
        quizzes: { completed: completedQuizzesForDeacon, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Level Up Leadership Course (courseId = 7)
    if (courseId === 7) {
      // For Level Up Leadership, we have 6 weeks of readings (textbook chapters) and 7 videos
      const totalReadings = 6; // 6 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = quizzes.length; // Count actual quizzes
      const totalVideosForCourse = publishedVideos.length; // Count actual published videos (should be 7)
      
      // Count completed videos from content progress
      const completedVideosForLeadership = contentProgress.filter((p: any) => 
        p.courseId === courseId && p.contentType === 'video' && p.completed
      ).length;
      
      // Count completed reading weeks - only count weeks where reading is done
      // Only count the hardcoded IDs (601-606) to ignore old progress with different IDs
      const validReadingIds = [601, 602, 603, 604, 605, 606];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 6; week++) {
        const weekReadingIds = getCourse7ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForLeadership = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForLeadership = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: completedVideosForLeadership, total: totalVideosForCourse },
        readings: { completed: completedReadingsForLeadership, total: totalReadings },
        quizzes: { completed: completedQuizzesForLeadership, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for Youth Ministry Course (courseId = 8)
    if (courseId === 8) {
      const totalReadings = 5; // 5 weeks (count weeks, not individual readings)
      const totalQuizzesForCourse = quizzes.length; // Count actual quizzes
      const totalVideosForCourse = 0; // No videos
      
      // Count completed reading weeks - only count weeks where reading is done
      // Only count the hardcoded IDs (701-705) to ignore old progress with different IDs
      const validReadingIds = [701, 702, 703, 704, 705];
      const completedReadingWeeks = [];
      for (let week = 1; week <= 5; week++) {
        const weekReadingIds = getCourse8ReadingIds(week);
        const allWeekReadingsCompleted = weekReadingIds.every(id => 
          contentProgress.some((p: any) => 
            p.courseId === courseId && 
            p.contentType === 'reading' && 
            p.contentId === id && 
            p.completed &&
            validReadingIds.includes(p.contentId)
          )
        );
        if (allWeekReadingsCompleted) {
          completedReadingWeeks.push(week);
        }
      }
      const completedReadingsForYouth = completedReadingWeeks.length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForYouth = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;

      return {
        videos: { completed: 0, total: 0 },
        readings: { completed: completedReadingsForYouth, total: totalReadings },
        quizzes: { completed: completedQuizzesForYouth, total: totalQuizzesForCourse },
      };
    }
    
    // Special handling for G.R.O.W course (courseId = 4)
    if (courseId === 4) {
      // For G.R.O.W, we have 4 weeks of readings (textbook chapters)
      const totalReadings = 4; // 4 weeks of readings
      const totalQuizzesForCourse = 5; // 4 weekly quizzes + 1 final exam
      const totalVideosForCourse = 0; // No videos
      
      // Count completed readings from content progress
      const completedReadingsForGrow = contentProgress.filter((p: any) => 
        p.contentType === 'reading' && p.completed
      ).length;
      
      // Count completed quizzes - count all attempts regardless of pass/fail
      const completedQuizzesForGrow = quizzes.filter((q: any) => 
        q.attempts > 0
      ).length;
      
      return {
        videos: { completed: 0, total: 0 }, // No videos for G.R.O.W
        readings: { completed: completedReadingsForGrow, total: totalReadings },
        quizzes: { completed: completedQuizzesForGrow, total: totalQuizzesForCourse },
      };
    }

    return {
      videos: { completed: completedVideos, total: publishedVideos.length },
      readings: { completed: completedReadings, total: publishedReadings.length },
      quizzes: { completed: completedQuizzes, total: totalQuizzes },
    };
  };


  // Extract week number from content title
  const extractWeekNumber = (title: string) => {
    // Handle reflection essay - should be treated as week 12 (requires ALL course completion)
    if (title.toLowerCase().includes('reflection essay')) {
      return 12;
    }
    
    // Handle final exam - should be treated as week 11 (after all regular weeks)
    if (title.toLowerCase().includes('final exam')) {
      return 11;
    }
    
    // Look for "Week X" pattern
    const weekMatch = title.match(/Week (\d+)/i);
    if (weekMatch) {
      return parseInt(weekMatch[1]);
    }
    
    // For videos and readings without explicit week numbers, 
    // we'll use orderIndex to determine week number
    // orderIndex 0-9 = Week 1, 10-19 = Week 2, etc.
    // This is a fallback for content that doesn't have "Week X" in title
    return 1; // Default to Week 1 if no pattern found
  };

  // Check if a week's content (videos + readings) is completed (simpler - doesn't check quiz)
  const isWeekContentCompleted = (weekNumber: number) => {
    // Get all videos and readings for the specific week
    const weekVideos = videos.filter((v: CourseVideo) => {
      const videoWeek = extractWeekNumber(v.title);
      // Only include videos that have a proper week number in their title
      // This excludes test videos or videos without week numbers
      const hasWeekNumber = /Week \d+/i.test(v.title);
      return videoWeek === weekNumber && v.isPublished && hasWeekNumber;
    });
    
    const weekReadings = readings.filter((r: CourseReading) => {
      const readingWeek = extractWeekNumber(r.title);
      return readingWeek === weekNumber && r.isPublished;
    });
    
    // Check if ALL videos for this week are completed
    const allVideosCompleted = weekVideos.length === 0 || weekVideos.every((video: CourseVideo) => 
        isContentCompleted('video', video.id)
      );
    
    // Check if ALL readings for this week are completed
    let allReadingsCompleted = true;
    
    // Special handling for Course 1 (Acts in Action) - has hardcoded readings
    if (courseId === 1) {
      const hardcodedReadingIds = getCourse1ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 2) {
      // Special handling for Course 2 (Fire Starter) - has hardcoded readings
      const hardcodedReadingIds = getCourse2ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
          isContentCompleted('reading', id)
        );
    } else if (courseId === 3) {
      // Special handling for Course 3 (Don't Be a Jonah) - has hardcoded readings
      const hardcodedReadingIds = getCourse3ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 4) {
      // Special handling for Course 4 (G.R.O.W) - has hardcoded readings
      const hardcodedReadingIds = getCourse4ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 5) {
      // Special handling for Course 5 (Studying for Service) - has hardcoded readings
      const hardcodedReadingIds = getCourse5ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 6) {
      // Special handling for Course 6 (Deacon Course) - has hardcoded readings
      const hardcodedReadingIds = getCourse6ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 7) {
      // Special handling for Course 7 (Level Up Leadership) - has hardcoded readings
      const hardcodedReadingIds = getCourse7ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 8) {
      // Special handling for Course 8 (Youth Ministry) - has hardcoded readings
      const hardcodedReadingIds = getCourse8ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else {
      allReadingsCompleted = weekReadings.length === 0 || weekReadings.every((reading: CourseReading) => 
        isContentCompleted('reading', reading.id)
      );
    }
    
    return allVideosCompleted && allReadingsCompleted;
  };

  // Check if a specific week's content is accessible
  const canAccessWeek = (weekNumber: number) => {
    // Week 1 is always accessible
    if (weekNumber <= 1) return true;
    
    // For all other weeks, check if previous week's CONTENT (videos + readings) is completed
    // This breaks the circular dependency - we don't require quiz to be passed
    const previousWeek = weekNumber - 1;
    return isWeekContentCompleted(previousWeek);
  };

  // Check if readings can be accessed (requires all videos for that week to be completed)
  const canAccessReadings = (weekNumber: number) => {
    // Can't access readings if week isn't accessible
    if (!canAccessWeek(weekNumber)) return false;
    
    // Check if this course has videos
    const hasVideos = videos.some((v: CourseVideo) => v.isPublished && v.videoUrl);
    
    // For courses without videos, readings are accessible once week is unlocked
    if (!hasVideos) return true;
    
    // For courses with videos, check if ALL videos for this week are completed
    const weekVideos = videos.filter((v: CourseVideo) => {
      const videoWeek = extractWeekNumber(v.title);
      // Only include videos that have a proper week number in their title
      // This excludes test videos or videos without week numbers
      const hasWeekNumber = /Week \d+/i.test(v.title);
      return videoWeek === weekNumber && v.isPublished && hasWeekNumber;
    });
      
    // If no videos exist for this week, readings are accessible
    if (weekVideos.length === 0) return true;
    
    // Check if ALL videos for this week are completed
    const allCompleted = weekVideos.every((video: CourseVideo) => 
      isContentCompleted('video', video.id)
    );
    
    // Debug logging for Week 1
    if (weekNumber === 1 && courseId === 1) {
      console.log('[Week 1 Reading Unlock Debug]', {
        weekNumber,
        weekVideos: weekVideos.map(v => ({ id: v.id, title: v.title })),
        videoCompletions: weekVideos.map(v => ({
          videoId: v.id,
          completed: isContentCompleted('video', v.id)
        })),
        contentProgress: contentProgress.filter(p => 
          p.courseId === courseId && p.contentType === 'video'
        ),
        allCompleted
      });
    }
    
    return allCompleted;
  };

  // Get hardcoded reading IDs for Course 1 (Acts in Action)
  // Helper function to get Course 2 reading IDs by week number (like Course 1)
  const getCourse2ReadingIds = (weekNumber: number): number[] => {
    // Course 2 has hardcoded readings with specific IDs (starting from 100 to avoid conflicts):
    // Week 1: IDs 101, 102 (Chapter 1, Bible Chapters 1-4)
    // Week 2: IDs 103, 104 (Chapter 2, Bible Chapters 5-8)
    // Week 3: IDs 105, 106 (Chapter 3, Bible Chapters 9-12)
    // Week 4: IDs 107, 108 (Chapter 4, Bible Chapters 13-16)
    // Week 5: IDs 109, 110 (Chapter 5, Bible Chapters 17-20)
    // Week 6: IDs 111, 112 (Chapter 6, Bible Chapters 21-24)
    // Week 7: IDs 113, 114 (Chapter 7, Bible Chapters 1-5 John)
    // Week 8: IDs 115, 116 (Chapter 8, Bible Chapters 6-10 John)
    // Week 9: IDs 117, 118 (Chapter 9, Bible Chapters 11-15 John)
    // Week 10: IDs 119, 120 (Chapter 10, Bible Chapters 16-21 John)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [101, 102],   // Chapter 1, Bible 1-4
      2: [103, 104],   // Chapter 2, Bible 5-8
      3: [105, 106],   // Chapter 3, Bible 9-12
      4: [107, 108],   // Chapter 4, Bible 13-16
      5: [109, 110],   // Chapter 5, Bible 17-20
      6: [111, 112],   // Chapter 6, Bible 21-24
      7: [113, 114],   // Chapter 7, Bible John 1-5
      8: [115, 116],   // Chapter 8, Bible John 6-10
      9: [117, 118],   // Chapter 9, Bible John 11-15
      10: [119, 120]   // Chapter 10, Bible John 16-21
    };
    
    return readingIdMap[weekNumber] || [];
  };

  const getCourse2ReadingAssignmentIds = (weekNumber: number): { chapterId?: number; bibleId?: number } => {
    const ids = getCourse2ReadingIds(weekNumber);
    const [chapterId, bibleId] = ids;
    return { chapterId, bibleId };
  };

  // Helper function to get Course 3 reading IDs by week number (like Course 1 and 2)
  const getCourse3ReadingIds = (weekNumber: number): number[] => {
    // Course 3 has hardcoded readings with specific IDs (starting from 201 to avoid conflicts):
    // Week 1: IDs 201, 202 (Chapter 1, Bible 1 Timothy 1)
    // Week 2: IDs 203, 204 (Chapter 2, Bible 1 Timothy 2)
    // Week 3: IDs 205, 206 (Chapter 3, Bible 1 Timothy 3)
    // Week 4: IDs 207, 208 (Chapter 4, Bible 1 Timothy 4)
    // Week 5: IDs 209, 210 (Chapter 5, Bible 1 Timothy 5)
    // Week 6: IDs 211, 212 (Chapter 6, Bible 1 Timothy 6)
    // Week 7: IDs 213, 214 (Chapter 7, Bible 2 Timothy 1)
    // Week 8: IDs 215, 216 (Chapter 8, Bible 2 Timothy 2)
    // Week 9: IDs 217, 218 (Chapter 9, Bible 2 Timothy 3)
    // Week 10: IDs 219, 220 (Chapter 10, Bible 2 Timothy 4)
    // Week 11: IDs 221, 222 (Chapter 11, Bible Titus 1-3)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [201, 202],   // Chapter 1, Bible 1 Timothy 1
      2: [203, 204],   // Chapter 2, Bible 1 Timothy 2
      3: [205, 206],   // Chapter 3, Bible 1 Timothy 3
      4: [207, 208],   // Chapter 4, Bible 1 Timothy 4
      5: [209, 210],   // Chapter 5, Bible 1 Timothy 5
      6: [211, 212],   // Chapter 6, Bible 1 Timothy 6
      7: [213, 214],   // Chapter 7, Bible 2 Timothy 1
      8: [215, 216],   // Chapter 8, Bible 2 Timothy 2
      9: [217, 218],   // Chapter 9, Bible 2 Timothy 3
      10: [219, 220],  // Chapter 10, Bible 2 Timothy 4
      11: [221, 222]   // Chapter 11, Bible Titus 1-3
    };
    
    return readingIdMap[weekNumber] || [];
  };

  const getCourse1ReadingIds = (weekNumber: number): number[] => {
    // Course 1 has hardcoded readings with specific IDs:
    // Week 1: IDs 1, 2, 3 (Introduction, Chapter 1, Bible Chapters 1-2)
    // Week 2: IDs 4, 5 (Chapter 2, Bible Chapters 3-5)
    // Week 3: IDs 6, 7 (Chapter 3, Bible Chapters 6-8)
    // Week 4: IDs 8, 9 (Chapter 4, Bible Chapters 9-11)
    // Week 5: IDs 10, 11 (Chapter 5, Bible Chapters 12-14)
    // Week 6: IDs 12, 13 (Chapter 6, Bible Chapters 15-17)
    // Week 7: IDs 14, 15 (Chapter 7, Bible Chapters 18-20)
    // Week 8: IDs 16, 17 (Chapter 8, Bible Chapters 21-23)
    // Week 9: IDs 18, 19 (Chapter 9, Bible Chapters 24-26)
    // Week 10: IDs 20, 21 (Chapter 10, Bible Chapters 27-28)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [1, 2, 3],   // Introduction, Chapter 1, Bible 1-2
      2: [4, 5],       // Chapter 2, Bible 3-5
      3: [6, 7],       // Chapter 3, Bible 6-8
      4: [8, 9],       // Chapter 4, Bible 9-11
      5: [10, 11],     // Chapter 5, Bible 12-14
      6: [12, 13],     // Chapter 6, Bible 15-17
      7: [14, 15],     // Chapter 7, Bible 18-20
      8: [16, 17],     // Chapter 8, Bible 21-23
      9: [18, 19],     // Chapter 9, Bible 24-26
      10: [20, 21]     // Chapter 10, Bible 27-28
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Helper function to get Course 4 reading IDs by week number (G.R.O.W)
  const getCourse4ReadingIds = (weekNumber: number): number[] => {
    // Course 4 has hardcoded readings with specific IDs (starting from 301 to avoid conflicts):
    // Week 1: ID 301 (Chapter 1: Give - Time, Talents, Treasure)
    // Week 2: ID 302 (Chapter 2: Read - Feed Daily on God's Word)
    // Week 3: ID 303 (Chapter 3: Obey - Listen and Apply God's Word)
    // Week 4: ID 304 (Chapter 4: Win - Go, Witness, Make Disciples)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [301],   // Chapter 1
      2: [302],   // Chapter 2
      3: [303],   // Chapter 3
      4: [304]    // Chapter 4
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Helper function to get Course 5 reading IDs by week number (Studying for Service)
  const getCourse5ReadingIds = (weekNumber: number): number[] => {
    // Course 5 has hardcoded readings with specific IDs (starting from 401 to avoid conflicts):
    // Week 1: IDs 401, 402 (Chapter 1, Bible Matthew 1-4)
    // Week 2: IDs 403, 404 (Chapter 2, Bible Matthew 5-8)
    // Week 3: IDs 405, 406 (Chapter 3, Bible Matthew 9-12)
    // Week 4: IDs 407, 408 (Chapter 4, Bible Matthew 13-16)
    // Week 5: IDs 409, 410 (Chapter 5, Bible Matthew 17-20)
    // Week 6: IDs 411, 412 (Chapter 6, Bible Matthew 21-24)
    // Week 7: IDs 413, 414 (Chapter 7, Bible Matthew 25-28)
    // Week 8: IDs 415, 416 (Chapter 8, Bible Mark 1-4)
    // Week 9: IDs 417, 418 (Chapter 9, Bible Mark 5-6)
    // Week 10: IDs 419, 420 (Chapter 10, Bible Mark 7-8)
    // Week 11: IDs 421, 422 (Chapter 11, Bible Mark 9-11)
    // Week 12: IDs 423, 424 (Chapter 12, Bible Mark 12-16)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [401, 402],   // Chapter 1, Bible Matthew 1-4
      2: [403, 404],   // Chapter 2, Bible Matthew 5-8
      3: [405, 406],   // Chapter 3, Bible Matthew 9-12
      4: [407, 408],   // Chapter 4, Bible Matthew 13-16
      5: [409, 410],   // Chapter 5, Bible Matthew 17-20
      6: [411, 412],   // Chapter 6, Bible Matthew 21-24
      7: [413, 414],   // Chapter 7, Bible Matthew 25-28
      8: [415, 416],   // Chapter 8, Bible Mark 1-4
      9: [417, 418],   // Chapter 9, Bible Mark 5-6
      10: [419, 420],  // Chapter 10, Bible Mark 7-8
      11: [421, 422],  // Chapter 11, Bible Mark 9-11
      12: [423, 424]   // Chapter 12, Bible Mark 12-16
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Helper function to get Course 6 reading IDs by week number (Deacon Course)
  const getCourse6ReadingIds = (weekNumber: number): number[] => {
    // Course 6 has hardcoded readings with specific IDs (starting from 501 to avoid conflicts):
    // Week 1: ID 501 (Introduction/Chapter 1: The Unignorable Nudge)
    // Week 2: ID 502 (Chapter 2: Laying the Foundation)
    // Week 3: ID 503 (Chapter 3: The Servant in Motion)
    // Week 4: ID 504 (Chapter 4: The Spiritual Battlefield)
    // Week 5: ID 505 (Chapter 5: Commissioned for Impact)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [501],   // Introduction/Chapter 1
      2: [502],   // Chapter 2
      3: [503],   // Chapter 3
      4: [504],   // Chapter 4
      5: [505]    // Chapter 5
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Helper function to get Course 7 reading IDs by week number (Level Up Leadership)
  const getCourse7ReadingIds = (weekNumber: number): number[] => {
    // Course 7 has hardcoded readings with specific IDs (starting from 601 to avoid conflicts):
    // Week 1: ID 601 (Position Leadership - Pages 1-81)
    // Week 2: ID 602 (Permission Leadership - Pages 85-129)
    // Week 3: ID 603 (Production Leadership - Pages 133-178)
    // Week 4: ID 604 (People Development Leadership - Pages 181-228)
    // Week 5: ID 605 (Pinnacle Leadership - Pages 229-286)
    // Week 6: ID 606 (Integration & Application)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [601],   // Position Leadership
      2: [602],   // Permission Leadership
      3: [603],   // Production Leadership
      4: [604],   // People Development Leadership
      5: [605],   // Pinnacle Leadership
      6: [606]    // Integration & Application
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Helper function to get Course 8 reading IDs by week number (Youth Ministry)
  const getCourse8ReadingIds = (weekNumber: number): number[] => {
    // Course 8 has hardcoded readings with specific IDs (starting from 701 to avoid conflicts):
    // Week 1: ID 701 (Chapter 1: The Calling)
    // Week 2: ID 702 (Chapter 2: Requirements)
    // Week 3: ID 703 (Chapter 3: Responsibilities)
    // Week 4: ID 704 (Chapter 4: Accountability)
    // Week 5: ID 705 (Chapter 5: Making New Disciples)
    
    const readingIdMap: { [key: number]: number[] } = {
      1: [701],   // Chapter 1: The Calling
      2: [702],   // Chapter 2: Requirements
      3: [703],   // Chapter 3: Responsibilities
      4: [704],   // Chapter 4: Accountability
      5: [705]    // Chapter 5: Making New Disciples
    };
    
    return readingIdMap[weekNumber] || [];
  };

  // Check if all readings for a specific week are completed
  const areAllWeekReadingsCompleted = (weekNumber: number): boolean => {
    // Special handling for Course 1 (Acts in Action) - has hardcoded readings
    if (courseId === 1) {
      const hardcodedReadingIds = getCourse1ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 2) {
      // Special handling for Course 2 (Fire Starter) - has hardcoded readings like Course 1
      const hardcodedReadingIds = getCourse2ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 3) {
      // Special handling for Course 3 (Don't Be a Jonah) - has hardcoded readings like Course 1
      const hardcodedReadingIds = getCourse3ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 4) {
      // Special handling for Course 4 (G.R.O.W) - has hardcoded readings
      const hardcodedReadingIds = getCourse4ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 5) {
      // Special handling for Course 5 (Studying for Service) - has hardcoded readings
      const hardcodedReadingIds = getCourse5ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 6) {
      // Special handling for Course 6 (Deacon Course) - has hardcoded readings
      const hardcodedReadingIds = getCourse6ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 7) {
      // Special handling for Course 7 (Level Up Leadership) - has hardcoded readings
      const hardcodedReadingIds = getCourse7ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else if (courseId === 8) {
      // Special handling for Course 8 (Youth Ministry) - has hardcoded readings
      const hardcodedReadingIds = getCourse8ReadingIds(weekNumber);
      if (hardcodedReadingIds.length === 0) return false;
      return hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else {
      // For other courses, check readings that match the week number
      const weekReadings = readings.filter((r: CourseReading) => {
        const readingWeek = extractWeekNumber(r.title);
        return readingWeek === weekNumber && r.isPublished;
      });
      
      if (weekReadings.length === 0) return false;
      return weekReadings.every((reading: CourseReading) => 
        isContentCompleted('reading', reading.id)
      );
    }
  };

  // Check if quiz can be accessed (requires all videos AND readings for that week to be completed)
  const canAccessQuiz = (weekNumber: number, isFinalExam: boolean = false) => {
    // Special case: Final exams require ALL weeks' content (videos + readings) to be completed
    if (isFinalExam) {
      // Get the maximum week number for this course
      const maxWeek = Math.max(
        ...videos.map(v => extractWeekNumber(v.title)).filter(w => w > 0),
        ...readings.map(r => extractWeekNumber(r.title)).filter(w => w > 0),
        ...quizzes.map(q => extractWeekNumber(q.title)).filter(w => w > 0 && w < 11) // Exclude final exam itself
      );
      
      // Check that ALL weeks' content (videos + readings) is completed
      for (let week = 1; week <= maxWeek; week++) {
        if (!isWeekContentCompleted(week)) {
          return false;
        }
      }
      return true;
    }
    
    // Can't access quiz if week isn't accessible
    if (!canAccessWeek(weekNumber)) return false;
    
    // Simply check if this week's content (videos + readings) is completed
    return isWeekContentCompleted(weekNumber);
  };

  // Get the completion message for locked content
  const getCompletionMessage = (weekNumber: number, contentType: 'video' | 'reading' | 'quiz' = 'video') => {
    // Special case for reflection essay (week 12)
    if (weekNumber === 12 && contentType === 'quiz') {
      return "Complete All Course Content First";
    }
    
    // Check if this is a textbook-only course
    const hasVideos = videos.some((v: CourseVideo) => v.isPublished && v.videoUrl);
    
    if (contentType === 'reading') {
      // For textbook-only courses, readings are always accessible once the week is unlocked
      if (!hasVideos) {
        return "Available";
      }
      
      // For courses with videos, check if videos are completed
      const weekVideos = videos.filter((v: CourseVideo) => {
        const videoWeek = extractWeekNumber(v.title);
        return videoWeek === weekNumber && v.isPublished;
      });
      
      const incompleteVideos = weekVideos.filter((video: CourseVideo) => 
        !isContentCompleted('video', video.id)
      );
      
      if (incompleteVideos.length > 0) {
        return "Watch Videos First";
      }
    }
    
    if (contentType === 'quiz') {
      // For textbook-only courses, only check readings
      if (!hasVideos) {
        const weekReadings = readings.filter((r: CourseReading) => {
          const readingWeek = extractWeekNumber(r.title);
          return readingWeek === weekNumber && r.isPublished;
        });
        
        const incompleteReadings = weekReadings.filter((reading: CourseReading) => 
          !isContentCompleted('reading', reading.id)
        );
        
        if (incompleteReadings.length > 0) {
          return "Complete Readings First";
        }
        return "Available";
      }
      
      // For courses with videos, check what's incomplete
      const weekVideos = videos.filter((v: CourseVideo) => {
        const videoWeek = extractWeekNumber(v.title);
        return videoWeek === weekNumber && v.isPublished;
      });
      
      const weekReadings = readings.filter((r: CourseReading) => {
        const readingWeek = extractWeekNumber(r.title);
        return readingWeek === weekNumber && r.isPublished;
      });
      
      const incompleteVideos = weekVideos.filter((video: CourseVideo) => 
        !isContentCompleted('video', video.id)
      );
      
      const incompleteReadings = weekReadings.filter((reading: CourseReading) => 
          !isContentCompleted('reading', reading.id)
        );
      
      if (incompleteVideos.length > 0) {
        return "Watch Videos First";
      } else if (incompleteReadings.length > 0) {
        return "Complete Required Reading";
      }
    }
    
    const previousWeek = weekNumber - 1;
    if (previousWeek <= 0) return "Complete Previous Week";
    return `Complete Week ${previousWeek} First`;
  };

  // Check if a week is fully completed (all videos + readings + quiz with passing score)
  const isWeekFullyCompleted = (weekNumber: number) => {
    // Get all content for the specific week
    const weekVideos = videos.filter((v: CourseVideo) => {
      const videoWeek = extractWeekNumber(v.title);
      return videoWeek === weekNumber && v.isPublished;
    });
    
    const weekReadings = readings.filter((r: CourseReading) => {
      const readingWeek = extractWeekNumber(r.title);
      return readingWeek === weekNumber && r.isPublished;
    });
    
    const weekQuizzes = quizzes.filter((q: any) => {
      const quizWeek = extractWeekNumber(q.title);
      return quizWeek === weekNumber;
    });
    
    // Check if ALL videos for this week are completed
    const allVideosCompleted = weekVideos.every((video: CourseVideo) => 
      isContentCompleted('video', video.id)
    );
    
    // Check if ALL readings for this week are completed
    let allReadingsCompleted = true;
    
    // Special handling for Course 1 (Acts in Action) - has hardcoded readings
    if (courseId === 1) {
      const hardcodedReadingIds = getCourse1ReadingIds(weekNumber);
      allReadingsCompleted = hardcodedReadingIds.length === 0 || hardcodedReadingIds.every(id => 
        isContentCompleted('reading', id)
      );
    } else {
      allReadingsCompleted = weekReadings.every((reading: CourseReading) => 
        isContentCompleted('reading', reading.id)
      );
    }
    
    // Check if quiz is completed with passing score
    let quizCompleted = true; // Default true if no quiz exists
    if (weekQuizzes.length > 0) {
      quizCompleted = weekQuizzes.some((quiz: any) => {
        const attempts = quiz.attempts || 0;
        const bestScore = quiz.bestScore || 0;
        const passingScore = quiz.passingScore || 60;
        return attempts > 0 && bestScore >= passingScore;
      });
    }
    
    // Week is fully completed only when ALL requirements are met
    return allVideosCompleted && allReadingsCompleted && quizCompleted;
  };

  const stats = getCompletionStats();

  if (videosLoading || readingsLoading || allQuizzesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600"></i>
            Course Progress
          </CardTitle>
          <CardDescription>
            Week-based progression: complete each week's quiz to unlock the next week
          </CardDescription>
        </CardHeader>
        <CardContent>
      <div className={`grid grid-cols-1 ${(courseId === 4 || courseId === 6 || courseId === 8) ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {courseId !== 4 && courseId !== 6 && courseId !== 8 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.videos.completed}/{stats.videos.total}
            </div>
            <div className="text-sm text-gray-600">Videos Completed</div>
            <Progress 
              value={stats.videos.total > 0 ? (stats.videos.completed / stats.videos.total) * 100 : 0} 
              className="mt-2"
            />
          </div>
        )}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.readings.completed}/{stats.readings.total}
              </div>
              <div className="text-sm text-gray-600">Readings Completed</div>
              <Progress 
                value={stats.readings.total > 0 ? (stats.readings.completed / stats.readings.total) * 100 : 0} 
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.quizzes.completed}/{stats.quizzes.total}
              </div>
              <div className="text-sm text-gray-600">Quizzes Completed</div>
              <Progress 
                value={stats.quizzes.total > 0 ? (stats.quizzes.completed / stats.quizzes.total) * 100 : 0} 
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className={`grid w-full ${(courseId === 4 || courseId === 6 || courseId === 8) ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {courseId !== 4 && courseId !== 6 && courseId !== 8 && (
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <i className="fas fa-video"></i>
            Videos ({stats.videos.completed}/{stats.videos.total})
          </TabsTrigger>
        )}
        <TabsTrigger value="readings" className="flex items-center gap-2">
          <i className="fas fa-book"></i>
          Readings ({stats.readings.completed}/{stats.readings.total})
        </TabsTrigger>
        <TabsTrigger value="quizzes" className="flex items-center gap-2">
          <i className="fas fa-quiz"></i>
          Quizzes ({stats.quizzes.completed}/{stats.quizzes.total})
        </TabsTrigger>
      </TabsList>

        {courseId !== 0 && courseId !== 4 && courseId !== 6 && courseId !== 8 && (
          <TabsContent value="videos" className="space-y-4">
            {courseId === 3 ? (
              // Special video schedule for Don't Be a Jonah course
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(weekNumber => {
                  const hasVideo = [1, 3, 5, 7, 9].includes(weekNumber);
                  const video = videos.find(v => {
                    const videoWeek = extractWeekNumber(v.title);
                    return videoWeek === weekNumber || (weekNumber === 1 && v.orderIndex === 1);
                  });
                  const isAccessible = canAccessWeek(weekNumber);
                  const isCompleted = video && isContentCompleted('video', video.id);
                  
                  return (
                    <Card key={weekNumber} className={`border-l-4 ${isAccessible ? 'border-blue-500' : 'border-gray-300'} h-56 sm:h-44 flex flex-col ${!isAccessible ? 'opacity-60' : ''}`}>
                      <CardHeader className="flex-shrink-0 pb-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <i className={`fas ${hasVideo ? 'fa-play' : 'fa-video-slash'} ${isAccessible ? 'text-blue-600' : 'text-gray-400'}`}></i>
                              {video?.title || `Week ${weekNumber}`}
                              {!isAccessible && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                  <i className="fas fa-lock mr-1"></i>
                                  Locked
                                </Badge>
                              )}
                              {isAccessible && isCompleted && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  Completed - Proceed to Reading Section
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {hasVideo ? 'Video lesson available' : 'No video for this week'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-end pb-2">
                        <div className="flex items-center gap-2 w-full">
                          {hasVideo && isAccessible ? (
                            <Button
                              onClick={() => {
                                if (video?.videoUrl) {
                                  setCurrentVideo(video);
                                  setVideoModalOpen(true);
                                  progressMutation.mutateAsync({
                                    courseId,
                                    contentType: 'video',
                                    contentId: video.id,
                                    completed: true
                                  }).then(() => {
                                    // Optimistic update handles immediate UI refresh
                                    // Additional refresh will happen in onSuccess callback
                                  }).catch(error => {
                                    console.error('Failed to update video progress:', error);
                                    toast({
                                      title: 'Error',
                                      description: 'Failed to mark video as complete',
                                      variant: 'destructive',
                                    });
                                  });
                                } else {
                                  toast({
                                    title: 'Video Not Available',
                                    description: 'This video has not been uploaded yet.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              <i className="fas fa-play"></i>
                              Watch Video
                            </Button>
                          ) : !hasVideo ? (
                            <Button
                              disabled
                              variant="outline"
                              className="flex items-center gap-2 cursor-not-allowed"
                              size="sm"
                            >
                              <i className="fas fa-video-slash"></i>
                              No Video This Week
                            </Button>
                          ) : null}
                          {!isAccessible && (
                            <Button
                              disabled
                              variant="outline"
                              className="flex items-center gap-2 cursor-not-allowed"
                              size="sm"
                            >
                              <i className="fas fa-lock"></i>
                              {getCompletionMessage(weekNumber, 'reading')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : courseId === 7 ? (
              // Level Up Leadership Course Videos
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600">No videos available yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  videos
                    .sort((a: CourseVideo, b: CourseVideo) => a.orderIndex - b.orderIndex)
                    .map((video: CourseVideo) => {
                      let weekNumber = extractWeekNumber(video.title);
                      if (weekNumber === 1 && !video.title.toLowerCase().includes('week')) {
                        weekNumber = video.orderIndex + 1;
                      }
                      const isAccessible = canAccessWeek(weekNumber);
                      const isCompleted = isContentCompleted('video', video.id);
                      return (
                        <Card
                          key={video.id}
                          className={`border-l-4 ${isAccessible ? 'border-purple-500' : 'border-gray-300'} h-56 sm:h-44 flex flex-col ${!isAccessible ? 'opacity-60' : ''}`}
                        >
                          <CardHeader className="flex-shrink-0 pb-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                  <i className={`fas fa-play ${isAccessible ? 'text-purple-600' : 'text-gray-400'}`}></i>
                                  {video.title}
                                  {!isAccessible && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                      <i className="fas fa-lock mr-1"></i>
                                      Locked
                                    </Badge>
                                  )}
                                  {isAccessible && isCompleted && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                      Completed - Proceed to Reading Section
                                    </Badge>
                                  )}
                                </CardTitle>
                                {video.description && (
                                  <CardDescription className="text-xs mt-1">
                                    {video.description}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex items-end pb-2">
                            <div className="flex items-center gap-2 w-full">
                              {isAccessible ? (
                                <Button
                                  onClick={() => {
                                    if (video?.videoUrl) {
                                      setCurrentVideo(video);
                                      setVideoModalOpen(true);
                                      progressMutation
                                        .mutateAsync({
                                          courseId,
                                          contentType: 'video',
                                          contentId: video.id,
                                          completed: true,
                                        })
                                        .then(() => {
                                          // Optimistic update handles immediate UI refresh
                                          // Additional refresh will happen in onSuccess callback
                                        })
                                        .catch(error => {
                                          console.error('Failed to update video progress:', error);
                                          toast({
                                            title: 'Error',
                                            description: 'Failed to mark video as complete',
                                            variant: 'destructive',
                                          });
                                        });
                                    } else {
                                      toast({
                                        title: 'Video Not Available',
                                        description: 'This video has not been uploaded yet.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                                  size="sm"
                                >
                                  <i className="fas fa-play"></i>
                                  Watch Video
                                </Button>
                              ) : (
                                <Button
                                  disabled
                                  variant="outline"
                                  className="flex items-center gap-2 cursor-not-allowed"
                                  size="sm"
                                >
                                  <i className="fas fa-lock"></i>
                                  {getCompletionMessage(weekNumber, 'video')}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                )}
              </div>
            ) : (
              // Default video rendering for other courses
              videos.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">No videos available yet</p>
                  </CardContent>
                </Card>
              ) : (
                // Render available videos only
                videos
                    .sort((a: CourseVideo, b: CourseVideo) => a.orderIndex - b.orderIndex)
                    .map((video: CourseVideo) => {
                      let weekNumber = extractWeekNumber(video.title);
                      if (weekNumber === 1 && !video.title.toLowerCase().includes('week')) {
                        weekNumber = video.orderIndex + 1;
                      }
                      const isAccessible = canAccessWeek(weekNumber);
                      
                      // Transform display for Course 1 (Acts in Action)
                      let displayTitle = video.title;
                      let displayDescription = video.description;
                      
                      if (courseId === 1 && weekNumber === 1) {
                        displayTitle = 'Introduction';
                        displayDescription = "Bishop Anthony Lee's introduction to the Acts in Action course";
                      }
                      
                      return (
                        <Card key={video.id} className={`border-l-4 ${isAccessible ? 'border-blue-500' : 'border-gray-300'} h-56 sm:h-44 flex flex-col ${!isAccessible ? 'opacity-60' : ''}`}>
                          <CardHeader className="flex-shrink-0 pb-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                  <i className={`fas fa-play ${isAccessible ? 'text-blue-600' : 'text-gray-400'}`}></i>
                                  {displayTitle}
                                  {!isAccessible && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                      <i className="fas fa-lock mr-1"></i>
                                      Locked
                                    </Badge>
                                  )}
                                  {isAccessible && isContentCompleted('video', video.id) && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                      Completed - Proceed to Reading Section
                                    </Badge>
                                  )}
                                </CardTitle>
                                {displayDescription && (
                                  <CardDescription className="text-xs">{displayDescription}</CardDescription>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex items-end pb-2">
                            <div className="flex items-center gap-2 w-full">
                              {isAccessible ? (
                                <Button
                                  onClick={() => {
                                    if (video.videoUrl) {
                                      setCurrentVideo(video);
                                      setVideoModalOpen(true);
                                      progressMutation.mutateAsync({
                                        courseId,
                                        contentType: 'video',
                                        contentId: video.id,
                                        completed: true
                                      }).then(() => {
                                        // Optimistic update handles immediate UI refresh
                                        // Additional refresh will happen in onSuccess callback
                                      }).catch(error => {
                                        console.error('Failed to update video progress:', error);
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to mark video as complete',
                                          variant: 'destructive',
                                        });
                                      });
                                    } else {
                                      toast({
                                        title: 'Video Not Available',
                                        description: 'This video has not been uploaded yet.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  className="flex items-center gap-2"
                                  size="sm"
                                >
                                  <i className="fas fa-play"></i>
                                  Watch Video
                                </Button>
                              ) : null}
                              {!isAccessible && (
                                <Button
                                  disabled
                                  variant="outline"
                                  className="flex items-center gap-2 cursor-not-allowed"
                                  size="sm"
                                >
                                  <i className="fas fa-lock"></i>
                                  {getCompletionMessage(weekNumber, 'reading')}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
              )
            )}
          </TabsContent>
        )}

        <TabsContent value="readings" className="space-y-4">
          {courseId === 3 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 1</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Don’t Be a Jonah — Chapter 1</p>
                      </div>
                      <div className="flex gap-2">
                      <Button
                        disabled={!canAccessReadings(1)}
                          onClick={createReadingProgressHandler(201, () => setLocation('/dont-be-a-jonah-player-ch1'))}
                        className={`${!canAccessReadings(1)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 201)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                          {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 201) ? 'Complete' : 'E-book'}
                      </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 1 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(202, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+1&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(1)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(1)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : areAllWeekReadingsCompleted(1) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 2</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Don’t Be a Jonah — Chapter 2</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(2)}
                          onClick={createReadingProgressHandler(203, () => setLocation('/dont-be-a-jonah-player-ch2'))}
                        className={`${!canAccessReadings(2)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 203)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 203) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 2 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(204, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+2&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(2)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(2)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : areAllWeekReadingsCompleted(2) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 3</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 3</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(3)}
                          onClick={createReadingProgressHandler(205, () => setLocation('/dont-be-a-jonah-player-ch3'))}
                        className={`${!canAccessReadings(3)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 205)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 205) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 3 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(206, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+3&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(3)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(3)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : areAllWeekReadingsCompleted(3) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 4</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 4</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(4)}
                          onClick={createReadingProgressHandler(207, () => setLocation('/dont-be-a-jonah-player-ch4'))}
                        className={`${!canAccessReadings(4)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 207)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 207) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 4 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(208, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+4&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(4)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(4)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : areAllWeekReadingsCompleted(4) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 5 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 5</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 5</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(5)}
                          onClick={createReadingProgressHandler(209, () => setLocation('/dont-be-a-jonah-player-ch5'))}
                        className={`${!canAccessReadings(5)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 209)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(5) ? '🔒 Locked' : isContentCompleted('reading', 209) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 5 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(210, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+5&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(5)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(5)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : areAllWeekReadingsCompleted(5) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 6 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 6</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 6</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(6)}
                          onClick={createReadingProgressHandler(211, () => setLocation('/dont-be-a-jonah-player-ch6'))}
                        className={`${!canAccessReadings(6)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 211)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(6) ? '🔒 Locked' : isContentCompleted('reading', 211) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">1 Timothy Chapter 6 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(212, () => window.open('https://www.biblegateway.com/passage/?search=1+Timothy+6&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(6)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(6)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(6) ? '🔒 Locked' : areAllWeekReadingsCompleted(6) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 7 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 7</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 7</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(7)}
                          onClick={createReadingProgressHandler(213, () => setLocation('/dont-be-a-jonah-player-ch7'))}
                        className={`${!canAccessReadings(7)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 213)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(7) ? '🔒 Locked' : isContentCompleted('reading', 213) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">2 Timothy Chapter 1 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(7)}
                        onClick={createReadingProgressHandler(214, () => window.open('https://www.biblegateway.com/passage/?search=2+Timothy+1&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(7)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(7)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(7) ? '🔒 Locked' : areAllWeekReadingsCompleted(7) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 8 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 8</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 8</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(8)}
                          onClick={createReadingProgressHandler(215, () => setLocation('/dont-be-a-jonah-player-ch8'))}
                        className={`${!canAccessReadings(8)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 215)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(8) ? '🔒 Locked' : isContentCompleted('reading', 215) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">2 Timothy Chapter 2 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(8)}
                        onClick={createReadingProgressHandler(216, () => window.open('https://www.biblegateway.com/passage/?search=2+Timothy+2&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(8)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(8)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(8) ? '🔒 Locked' : areAllWeekReadingsCompleted(8) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 9 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 9</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 9</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(9)}
                          onClick={createReadingProgressHandler(217, () => setLocation('/dont-be-a-jonah-player-ch9'))}
                        className={`${!canAccessReadings(9)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 217)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(9) ? '🔒 Locked' : isContentCompleted('reading', 217) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">2 Timothy Chapter 3 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(9)}
                        onClick={createReadingProgressHandler(218, () => window.open('https://www.biblegateway.com/passage/?search=2+Timothy+3&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(9)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(9)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(9) ? '🔒 Locked' : areAllWeekReadingsCompleted(9) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 10 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 10</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 10</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(10)}
                          onClick={createReadingProgressHandler(219, () => setLocation('/dont-be-a-jonah-player-ch10'))}
                        className={`${!canAccessReadings(10)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 219)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(10) ? '🔒 Locked' : isContentCompleted('reading', 219) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">2 Timothy Chapter 4 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(10)}
                        onClick={createReadingProgressHandler(220, () => window.open('https://www.biblegateway.com/passage/?search=2+Timothy+4&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(10)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(10)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(10) ? '🔒 Locked' : areAllWeekReadingsCompleted(10) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 11 Required Reading for Don't Be a Jonah */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 11</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700">Don’t Be a Jonah — Chapter 11</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        disabled={!canAccessReadings(11)}
                          onClick={createReadingProgressHandler(221, () => setLocation('/dont-be-a-jonah-player-ch11'))}
                        className={`${!canAccessReadings(11)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 221)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {!canAccessReadings(11) ? '🔒 Locked' : isContentCompleted('reading', 221) ? 'Complete' : 'E-book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Titus Chapter 1 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(11)}
                        onClick={createReadingProgressHandler(222, () => window.open('https://www.biblegateway.com/passage/?search=Titus+1&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(11)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(11)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(11) ? '🔒 Locked' : areAllWeekReadingsCompleted(11) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : courseId === 1 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading Card */}
              <Card className={`${!canAccessReadings(1) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 1
                    {!canAccessReadings(1) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Introduction */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Introduction</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(1, () => window.location.href = '/acts-audio-player')}
                        className={`${!canAccessReadings(1) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 1)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 1) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>

                  {/* Acts in Action Section - Chapter 1 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 1</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(2, () => window.location.href = '/acts-audio-player-ch1')}
                        className={`${!canAccessReadings(1) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 2)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 2) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 1-2</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(3, () => window.open('https://www.biblegateway.com/passage/?search=Acts+1-2&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(1) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(1)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : areAllWeekReadingsCompleted(1) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading Card */}
              <Card className={`${!canAccessReadings(2) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 2
                    {!canAccessReadings(2) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 2 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 2</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(4, () => window.location.href = '/acts-audio-player-ch2')}
                        className={`${!canAccessReadings(2) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 4)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 4) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 3-5</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(5, () => window.open('https://www.biblegateway.com/passage/?search=Acts+3-5&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(2) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(2)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : areAllWeekReadingsCompleted(2) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading Card */}
              <Card className={`${!canAccessReadings(3) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 3
                    {!canAccessReadings(3) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 3 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 3</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(6, () => window.location.href = '/acts-audio-player-ch3')}
                        className={`${!canAccessReadings(3) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 6)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 6) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 6-8</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(7, () => window.open('https://www.biblegateway.com/passage/?search=Acts+6-8&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(3) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(3)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : areAllWeekReadingsCompleted(3) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading Card */}
              <Card className={`${!canAccessReadings(4) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 4
                    {!canAccessReadings(4) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 4 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 4</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(8, () => window.location.href = '/acts-audio-player-ch4')}
                        className={`${!canAccessReadings(4) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 8)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 8) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 9-11</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(9, () => window.open('https://www.biblegateway.com/passage/?search=Acts+9-11&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(4) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(4)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : areAllWeekReadingsCompleted(4) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 5 Required Reading Card */}
              <Card className={`${!canAccessReadings(5) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 5
                    {!canAccessReadings(5) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 5 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 5</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(10, () => window.location.href = '/acts-audio-player-ch5')}
                        className={`${!canAccessReadings(5) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 10)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : isContentCompleted('reading', 10) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 12-14</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(11, () => window.open('https://www.biblegateway.com/passage/?search=Acts+12-14&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(5) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(5)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : areAllWeekReadingsCompleted(5) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 6 Required Reading Card */}
              <Card className={`${!canAccessReadings(6) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 6
                    {!canAccessReadings(6) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 6 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 6</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(12, () => window.location.href = '/acts-audio-player-ch6')}
                        className={`${!canAccessReadings(6) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 12)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(6) ? '🔒 Locked' : isContentCompleted('reading', 12) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 15-17</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(13, () => window.open('https://www.biblegateway.com/passage/?search=Acts+15-17&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(6) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(6)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(6) ? '🔒 Locked' : areAllWeekReadingsCompleted(6) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 7 Required Reading Card */}
              <Card className={`${!canAccessReadings(7) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 7
                    {!canAccessReadings(7) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 7 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 7</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(7)}
                        onClick={createReadingProgressHandler(14, () => window.location.href = '/acts-audio-player-ch7')}
                        className={`${!canAccessReadings(7) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 14)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(7) ? '🔒 Locked' : isContentCompleted('reading', 14) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 18-20</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(7)}
                        onClick={createReadingProgressHandler(15, () => window.open('https://www.biblegateway.com/passage/?search=Acts+18-20&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(7) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(7)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(7) ? '🔒 Locked' : areAllWeekReadingsCompleted(7) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 8 Required Reading Card */}
              <Card className={`${!canAccessReadings(8) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 8
                    {!canAccessReadings(8) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 8 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 8</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(8)}
                        onClick={createReadingProgressHandler(16, () => window.location.href = '/acts-audio-player-ch8')}
                        className={`${!canAccessReadings(8) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 16)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(8) ? '🔒 Locked' : isContentCompleted('reading', 16) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 21-23</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(8)}
                        onClick={createReadingProgressHandler(17, () => window.open('https://www.biblegateway.com/passage/?search=Acts+21-23&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(8) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(8)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(8) ? '🔒 Locked' : areAllWeekReadingsCompleted(8) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 9 Required Reading Card */}
              <Card className={`${!canAccessReadings(9) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 9
                    {!canAccessReadings(9) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 9 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 9</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(9)}
                        onClick={createReadingProgressHandler(18, () => window.location.href = '/acts-audio-player-ch9')}
                        className={`${!canAccessReadings(9) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 18)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(9) ? '🔒 Locked' : isContentCompleted('reading', 18) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 24-26</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(9)}
                        onClick={createReadingProgressHandler(19, () => window.open('https://www.biblegateway.com/passage/?search=Acts+24-26&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(9) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(9)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(9) ? '🔒 Locked' : areAllWeekReadingsCompleted(9) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 10 Required Reading Card */}
              <Card className={`${!canAccessReadings(10) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 10
                    {!canAccessReadings(10) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Acts in Action Section - Chapter 10 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Reading</h4>
                        <p className="text-sm text-gray-600">Acts in Action Chapter 10</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(10)}
                        onClick={createReadingProgressHandler(20, () => window.location.href = '/acts-audio-player-ch10')}
                        className={`${!canAccessReadings(10) 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 20)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(10) ? '🔒 Locked' : isContentCompleted('reading', 20) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bible Reading Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Required Bible Reading</h4>
                        <p className="text-sm text-gray-600">Acts Chapters 27-28</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(10)}
                        onClick={createReadingProgressHandler(21, () => window.open('https://www.biblegateway.com/passage/?search=Acts+27-28&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(10) 
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(10)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(10) ? '🔒 Locked' : areAllWeekReadingsCompleted(10) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : courseId === 2 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 1</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 1: Becoming a Fire Starter</p>
                          </div>
                      <div className="flex gap-2">
                          <Button
                            disabled={!canAccessReadings(1)}
                          onClick={createReadingProgressHandler(101, () => setLocation('/becoming-a-firestarter-ch1'))}
                            className={`${!canAccessReadings(1)
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 101)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                            }`}
                          >
                          {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 101) ? 'Complete' : 'E-book'}
                          </Button>
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 1-4 (NLT)</p>
                          </div>
                          <Button
                            disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(102, () => window.open('https://www.biblegateway.com/passage/?search=Luke+1-4&version=NLT', '_blank'))}
                            variant="outline"
                            className={`${!canAccessReadings(1)
                              ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(1)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                        {!canAccessReadings(1) ? '🔒 Locked' : areAllWeekReadingsCompleted(1) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 2 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 2</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 2: It's Fire or Nothing!</p>
                          </div>
                      <div className="flex gap-2">
                          <Button
                            disabled={!canAccessReadings(2)}
                          onClick={createReadingProgressHandler(103, () => setLocation('/becoming-a-firestarter-ch2'))}
                            className={`${!canAccessReadings(2)
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : isContentCompleted('reading', 103)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                            }`}
                          >
                          {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 103) ? 'Complete' : 'E-book'}
                          </Button>
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 5-8 (NLT)</p>
                          </div>
                          <Button
                            disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(104, () => window.open('https://www.biblegateway.com/passage/?search=Luke+5-8&version=NLT', '_blank'))}
                            variant="outline"
                            className={`${!canAccessReadings(2)
                              ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                              : areAllWeekReadingsCompleted(2)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                        {!canAccessReadings(2) ? '🔒 Locked' : areAllWeekReadingsCompleted(2) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 3 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 3</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 3: Fuel for the Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(3);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(3);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch3'))
                            : () => setLocation('/becoming-a-firestarter-ch3');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 9-12 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(3);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(3);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=Luke+9-12&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=Luke+9-12&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 4 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 4</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 4: Keep Your Eyes on the Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(4);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(4);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch4'))
                            : () => setLocation('/becoming-a-firestarter-ch4');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 13-16 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(4);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(4);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=Luke+13-16&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=Luke+13-16&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 5 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 5</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 5: Tested by Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(5);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(5);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch5'))
                            : () => setLocation('/becoming-a-firestarter-ch5');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 17-20 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(5);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(5);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=Luke+17-20&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=Luke+17-20&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 6 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 6</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 6: The Consuming Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(6);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(6);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch6'))
                            : () => setLocation('/becoming-a-firestarter-ch6');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Luke Chapters 21-24 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(6);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(6);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=Luke+21-24&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=Luke+21-24&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 7 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 7</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 7: Fasting for Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(7);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(7);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch7'))
                            : () => setLocation('/becoming-a-firestarter-ch7');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">John Chapters 1-5 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(7);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(7);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=John+1-5&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=John+1-5&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 8 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 8</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 8: Fellowship of Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(8);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(8);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch8'))
                            : () => setLocation('/becoming-a-firestarter-ch8');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">John Chapters 6-10 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(8);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(8);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=John+6-10&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=John+6-10&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 9 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 9</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 9: Fan the Fire</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(9);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(9);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch9'))
                            : () => setLocation('/becoming-a-firestarter-ch9');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">John Chapters 11-15 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(9);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(9);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=John+11-15&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=John+11-15&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 10 Required Reading for Firestarter */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week 10</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Fire Starter — Chapter 10: Conclusion</p>
                          </div>
                      <div className="flex gap-2">
                        {(() => {
                          const { chapterId } = getCourse2ReadingAssignmentIds(10);
                          const isCompleted = chapterId ? isContentCompleted('reading', chapterId) : false;
                          const canAccess = canAccessReadings(10);
                          const handleClick = chapterId
                            ? createReadingProgressHandler(chapterId, () => setLocation('/becoming-a-firestarter-ch10'))
                            : () => setLocation('/becoming-a-firestarter-ch10');
                          return (
                            <Button
                              disabled={!canAccess}
                              onClick={handleClick}
                              className={`${!canAccess
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : isCompleted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'E-book'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                        </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">John Chapters 16-21 (NLT)</p>
                          </div>
                      {(() => {
                        const { bibleId } = getCourse2ReadingAssignmentIds(10);
                        const isCompleted = bibleId ? isContentCompleted('reading', bibleId) : false;
                        const canAccess = canAccessReadings(10);
                        const handleClick = bibleId
                          ? createReadingProgressHandler(bibleId, () => window.open('https://www.biblegateway.com/passage/?search=John+16-21&version=NLT', '_blank'))
                          : () => window.open('https://www.biblegateway.com/passage/?search=John+16-21&version=NLT', '_blank');
                        return (
                          <Button
                            disabled={!canAccess}
                            onClick={handleClick}
                            variant="outline"
                            className={`${!canAccess
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400'
                              : isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {!canAccess ? '🔒 Locked' : isCompleted ? 'Complete' : 'Bible Chapter'}
                          </Button>
                        );
                      })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
            </div>
          ) : courseId === 5 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(1) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 1
                    {!canAccessReadings(1) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 1: Know Your Text</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(401, () => setLocation('/studying-for-service-ch1'))}
                        className={`${!canAccessReadings(1)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 401)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 401) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 1-4 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(402, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+1-4&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(1)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(1)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : areAllWeekReadingsCompleted(1) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(2) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 2
                    {!canAccessReadings(2) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 2: Notice the Names</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(403, () => setLocation('/studying-for-service-ch2'))}
                        className={`${!canAccessReadings(2)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 403)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 403) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 5-8 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(404, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+5-8&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(2)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(2)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : areAllWeekReadingsCompleted(2) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(3) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 3
                    {!canAccessReadings(3) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 3: Keep the Cities in Sight</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(405, () => setLocation('/studying-for-service-ch3'))}
                        className={`${!canAccessReadings(3)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 405)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 405) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 9-12 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(406, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+9-12&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(3)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(3)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : areAllWeekReadingsCompleted(3) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(4) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 4
                    {!canAccessReadings(4) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 4: Numbers Add Up</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(407, () => setLocation('/studying-for-service-ch4'))}
                        className={`${!canAccessReadings(4)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 407)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 407) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 13-16 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(408, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+13-16&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(4)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(4)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : areAllWeekReadingsCompleted(4) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 5 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(5) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 5
                    {!canAccessReadings(5) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 5: The Original Language</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(409, () => setLocation('/studying-for-service-ch5'))}
                        className={`${!canAccessReadings(5)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 409)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(5) ? '🔒 Locked' : isContentCompleted('reading', 409) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 17-20 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(410, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+17-20&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(5)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(5)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : areAllWeekReadingsCompleted(5) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 6 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(6) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 6
                    {!canAccessReadings(6) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 6: Stories That Bring Glory</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(411, () => setLocation('/studying-for-service-ch6'))}
                        className={`${!canAccessReadings(6)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 411)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(6) ? '🔒 Locked' : isContentCompleted('reading', 411) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 21-24 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(412, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+21-24&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(6)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(6)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(6) ? '🔒 Locked' : areAllWeekReadingsCompleted(6) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 7 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(7) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 7
                    {!canAccessReadings(7) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 7: Illustrated Sermons</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(7)}
                        onClick={createReadingProgressHandler(413, () => setLocation('/studying-for-service-ch7'))}
                        className={`${!canAccessReadings(7)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 413)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(7) ? '🔒 Locked' : isContentCompleted('reading', 413) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Matthew Chapters 25-28 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(7)}
                        onClick={createReadingProgressHandler(414, () => window.open('https://www.biblegateway.com/passage/?search=Matthew+25-28&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(7)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(7)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(7) ? '🔒 Locked' : areAllWeekReadingsCompleted(7) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 8 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(8) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 8
                    {!canAccessReadings(8) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 8: Application Applied</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(8)}
                        onClick={createReadingProgressHandler(415, () => setLocation('/studying-for-service-ch8'))}
                        className={`${!canAccessReadings(8)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 415)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(8) ? '🔒 Locked' : isContentCompleted('reading', 415) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Mark Chapters 1-4 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(8)}
                        onClick={createReadingProgressHandler(416, () => window.open('https://www.biblegateway.com/passage/?search=Mark+1-4&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(8)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(8)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(8) ? '🔒 Locked' : areAllWeekReadingsCompleted(8) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 9 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(9) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 9
                    {!canAccessReadings(9) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 9: Putting the Sermon Together</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(9)}
                        onClick={createReadingProgressHandler(417, () => setLocation('/studying-for-service-ch9'))}
                        className={`${!canAccessReadings(9)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 417)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(9) ? '🔒 Locked' : isContentCompleted('reading', 417) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Mark Chapters 5-6 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(9)}
                        onClick={createReadingProgressHandler(418, () => window.open('https://www.biblegateway.com/passage/?search=Mark+5-6&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(9)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(9)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(9) ? '🔒 Locked' : areAllWeekReadingsCompleted(9) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 10 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(10) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 10
                    {!canAccessReadings(10) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 10: The Full Gospel</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(10)}
                        onClick={createReadingProgressHandler(419, () => setLocation('/studying-for-service-ch10'))}
                        className={`${!canAccessReadings(10)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 419)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(10) ? '🔒 Locked' : isContentCompleted('reading', 419) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Mark Chapters 7-8 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(10)}
                        onClick={createReadingProgressHandler(420, () => window.open('https://www.biblegateway.com/passage/?search=Mark+7-8&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(10)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(10)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(10) ? '🔒 Locked' : areAllWeekReadingsCompleted(10) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 11 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(11) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 11
                    {!canAccessReadings(11) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 11: Being a Man of the Word</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(11)}
                        onClick={createReadingProgressHandler(421, () => setLocation('/studying-for-service-ch11'))}
                        className={`${!canAccessReadings(11)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 421)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(11) ? '🔒 Locked' : isContentCompleted('reading', 421) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Mark Chapters 9-11 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(11)}
                        onClick={createReadingProgressHandler(422, () => window.open('https://www.biblegateway.com/passage/?search=Mark+9-11&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(11)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(11)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(11) ? '🔒 Locked' : areAllWeekReadingsCompleted(11) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 12 Required Reading for Studying for Service */}
              <Card className={`${!canAccessReadings(12) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 12
                    {!canAccessReadings(12) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-1">Required Reading</h4>
                        <p className="text-blue-700 text-sm">Studying for Service — Chapter 12: Conclusion</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(12)}
                        onClick={createReadingProgressHandler(423, () => setLocation('/studying-for-service-ch12'))}
                        className={`${!canAccessReadings(12)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 423)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                        {!canAccessReadings(12) ? '🔒 Locked' : isContentCompleted('reading', 423) ? 'Complete' : 'E-book'}
                        </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Bible Reading</h4>
                        <p className="text-green-700 text-sm">Mark Chapters 12-16 (NLT)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(12)}
                        onClick={createReadingProgressHandler(424, () => window.open('https://www.biblegateway.com/passage/?search=Mark+12-16&version=NLT', '_blank'))}
                        variant="outline"
                        className={`${!canAccessReadings(12)
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                          : areAllWeekReadingsCompleted(12)
                            ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {!canAccessReadings(12) ? '🔒 Locked' : areAllWeekReadingsCompleted(12) ? 'Complete - Proceed to Quiz' : 'Bible Chapter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : courseId === 4 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for G.R.O.W */}
              <Card className={`${!canAccessReadings(1) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 1
                    {!canAccessReadings(1) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">G.R.O.W — Introduction & Chapter 1: Give - Time, Talents, Treasure</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(301, () => window.location.href = '/grow-ch1')}
                        className={`${!canAccessReadings(1)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 301)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 301) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading for G.R.O.W */}
              <Card className={`${!canAccessReadings(2) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 2
                    {!canAccessReadings(2) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">G.R.O.W — Chapter 2: Read - Feed Daily on God's Word</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(302, () => window.location.href = '/grow-ch2')}
                        className={`${!canAccessReadings(2)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 302)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 302) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading for G.R.O.W */}
              <Card className={`${!canAccessReadings(3) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 3
                    {!canAccessReadings(3) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">G.R.O.W — Chapter 3: Obey - Listen and Apply God's Word</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(303, () => window.location.href = '/grow-ch3')}
                        className={`${!canAccessReadings(3)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 303)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 303) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading for G.R.O.W */}
              <Card className={`${!canAccessReadings(4) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 4
                    {!canAccessReadings(4) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-green-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">G.R.O.W — Chapter 4: Win - Go, Witness, Make Disciples</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(304, () => window.location.href = '/grow-ch4')}
                        className={`${!canAccessReadings(4)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 304)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 304) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : courseId === 6 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Deacon Course */}
              <Card className={`${!canAccessReadings(1) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                      <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 1
                    {!canAccessReadings(1) && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                            <i className="fas fa-lock mr-1"></i>
                            Locked
                          </Badge>
                        )}
                      </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                          <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">Deacon Course — Introduction/Chapter 1: The Unignorable Nudge</p>
                          </div>
                          <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(501, () => window.location.href = '/deacon-course-ch1')}
                        className={`${!canAccessReadings(1)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 501)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 501) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading for Deacon Course */}
              <Card className={`${!canAccessReadings(2) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 2
                    {!canAccessReadings(2) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">Deacon Course — Chapter 2: Laying the Foundation</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(502, () => window.location.href = '/deacon-course-ch2')}
                        className={`${!canAccessReadings(2)
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 502)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 502) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading for Deacon Course */}
              <Card className={`${!canAccessReadings(3) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 3
                    {!canAccessReadings(3) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">Deacon Course — Chapter 3: The Servant in Motion</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(503, () => window.location.href = '/deacon-course-ch3')}
                        className={`${!canAccessReadings(3)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 503)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 503) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading for Deacon Course */}
              <Card className={`${!canAccessReadings(4) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 4
                    {!canAccessReadings(4) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">Deacon Course — Chapter 4: The Spiritual Battlefield</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(504, () => window.location.href = '/deacon-course-ch4')}
                        className={`${!canAccessReadings(4)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 504)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 504) ? 'Complete' : 'E-book'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Week 5 Required Reading for Deacon Course */}
              <Card className={`${!canAccessReadings(5) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 5
                    {!canAccessReadings(5) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">Deacon Course — Chapter 5: Commissioned for Impact</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(505, () => window.location.href = '/deacon-course-ch5')}
                        className={`${!canAccessReadings(5)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isContentCompleted('reading', 505)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : isContentCompleted('reading', 505) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          ) : courseId === 7 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(1) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 1
                    {!canAccessReadings(1) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — Position Leadership (Pages 1-81)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(1)}
                        onClick={createReadingProgressHandler(601, () => window.location.href = '/level-up-leadership-week1')}
                        className={`${!canAccessReadings(1)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 601)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(1) ? '🔒 Locked' : isContentCompleted('reading', 601) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 2 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(2) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 2
                    {!canAccessReadings(2) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — Permission Leadership (Pages 85-129)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(2)}
                        onClick={createReadingProgressHandler(602, () => window.location.href = '/level-up-leadership-week2')}
                        className={`${!canAccessReadings(2)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 602)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(2) ? '🔒 Locked' : isContentCompleted('reading', 602) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 3 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(3) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 3
                    {!canAccessReadings(3) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — Production Leadership (Pages 133-178)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(3)}
                        onClick={createReadingProgressHandler(603, () => window.location.href = '/level-up-leadership-week3')}
                        className={`${!canAccessReadings(3)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 603)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(3) ? '🔒 Locked' : isContentCompleted('reading', 603) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 4 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(4) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 4
                    {!canAccessReadings(4) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — People Development Leadership (Pages 181-228)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(4)}
                        onClick={createReadingProgressHandler(604, () => window.location.href = '/level-up-leadership-week4')}
                        className={`${!canAccessReadings(4)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 604)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(4) ? '🔒 Locked' : isContentCompleted('reading', 604) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 5 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(5) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 5
                    {!canAccessReadings(5) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — Pinnacle Leadership (Pages 229-286)</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(5)}
                        onClick={createReadingProgressHandler(605, () => window.location.href = '/level-up-leadership-week5')}
                        className={`${!canAccessReadings(5)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 605)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(5) ? '🔒 Locked' : isContentCompleted('reading', 605) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week 6 Required Reading for Level Up Leadership */}
              <Card className={`${!canAccessReadings(6) ? 'opacity-60' : ''}`}>
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                    Required Reading Week 6
                    {!canAccessReadings(6) && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <i className="fas fa-lock mr-1"></i>
                        Locked
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-semibold text-purple-900 mb-1">Required Reading</h4>
                        <p className="text-gray-700 text-lg">⬆️ Level Up Leadership — Integration & Application</p>
                      </div>
                      <Button
                        disabled={!canAccessReadings(6)}
                        onClick={createReadingProgressHandler(606, () => window.location.href = '/level-up-leadership-week6')}
                        className={`${!canAccessReadings(6)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : isContentCompleted('reading', 606)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        {!canAccessReadings(6) ? '🔒 Locked' : isContentCompleted('reading', 606) ? 'Complete' : 'E-book'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : courseId === 8 ? (
            <div className="space-y-4">
              {/* Week 1 Required Reading for Youth Ministry Course */}
              {youthReadingSchedule.map(({ week, title, route }) => {
                const isAccessible = canAccessWeek(week);
                const readingId = getCourse8ReadingIds(week)[0];
                const isCompleted = readingId ? isContentCompleted('reading', readingId) : false;
                
                return (
                  <Card 
                    key={week}
                    className={`border-l-4 ${isAccessible ? 'border-orange-500' : 'border-gray-300'} ${!isAccessible ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="text-center py-8">
                      <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Required Reading Week {week}</h3>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-left flex-1">
                            <p className="text-orange-900 font-semibold text-xl mb-1">👥 Youth Ministry Course</p>
                            <p className="text-gray-700 text-lg">{title}</p>
                            {!isAccessible && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs mt-2">
                                <i className="fas fa-lock mr-1"></i>
                                Locked - Complete previous week first
                              </Badge>
                            )}
                            {isAccessible && isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs mt-2">
                                <i className="fas fa-check mr-1"></i>
                                Completed
                              </Badge>
                            )}
                          </div>
                          {isAccessible ? (
                            <Button
                              onClick={createReadingProgressHandler(readingId, () => window.location.href = route)}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              E-book
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="bg-gray-400 text-gray-200 cursor-not-allowed"
                            >
                              <i className="fas fa-lock mr-2"></i>
                              Locked
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : readings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No readings available yet</h3>
                <p className="text-gray-500">Check back later for course materials.</p>
              </CardContent>
            </Card>
          ) : (
            readings
              .sort((a: CourseReading, b: CourseReading) => a.orderIndex - b.orderIndex)
              .map((reading: CourseReading) => {
                // Extract week number from reading title for access control
                const weekNumber = extractWeekNumber(reading.title);
                const isAccessible = canAccessReadings(weekNumber);
                return (
                <Card key={reading.id} className={`border-l-4 ${isAccessible ? 'border-green-500' : 'border-gray-300'} h-56 sm:h-44 flex flex-col ${!isAccessible ? 'opacity-60' : ''} mb-6`}>
                  <CardHeader className="flex-shrink-0 pb-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <i className={`fas fa-book ${isAccessible ? 'text-green-600' : 'text-gray-400'}`}></i>
                          {(() => {
                            // Clean up reading title to show only "Week X:" format
                            // Remove everything after the colon including chapter references and Bible book names
                            const cleanTitle = reading.title.replace(/:\s*.*$/i, ':');
                            return cleanTitle;
                          })()}
                          {!isAccessible && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                              <i className="fas fa-lock mr-1"></i>
                              Locked
                            </Badge>
                          )}
                          {isAccessible && isContentCompleted('reading', reading.id) && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Completed
                            </Badge>
                          )}

                        </CardTitle>
                        {reading.description && (
                          <CardDescription className="text-xs">{reading.description}</CardDescription>
                        )}
                        
                        {/* Add required reading format display for all assignments */}
                        {reading.content && reading.content.startsWith('{') ? (
                          (() => {
                            try {
                              const readingData = JSON.parse(reading.content);
                              
                              // Extract week number to determine requirements
                              const weekNumber = extractWeekNumber(reading.title);
                              
                              // Handle combined assignments
                              if (readingData.type === 'combined' && readingData.assignments) {
                                const textbookAssignment = readingData.assignments.find((a: any) => a.type === 'textbook');
                                const bibleAssignment = readingData.assignments.find((a: any) => a.type === 'bible');
                                
                                // Format display with clean chapter references
                                let displayText = '';
                                if (textbookAssignment && textbookAssignment.title) {
                                  // Convert "Chapters 1-2" to "Chapters 1-2 of the textbook"
                                  const chapterMatch = textbookAssignment.title.match(/Chapters? (\d+)(?:-(\d+))?/i);
                                  if (chapterMatch) {
                                    const startChapter = chapterMatch[1];
                                    const endChapter = chapterMatch[2];
                                    if (endChapter) {
                                      displayText += `Chapters ${startChapter}-${endChapter} of the textbook`;
                                    } else {
                                      displayText += `Chapter ${startChapter} of the textbook`;
                                    }
                                  } else {
                                    displayText += textbookAssignment.title;
                                  }
                                }
                                
                                // Add Bible reading assignment
                                if (bibleAssignment && bibleAssignment.title) {
                                  if (displayText) displayText += ' + ';
                                  // Replace "2 Timothy" with just "Timothy"
                                  let bibleTitle = bibleAssignment.title.replace(/2\s*Timothy/gi, 'Timothy');
                                  displayText += bibleTitle;
                                }
                                
                                if (courseId === 1 && weekNumber <= 4) { // Don't Be A Jonah course, only weeks 1-4 have Jonah chapters
                                  if (displayText) displayText += ' + ';
                                  displayText += `Jonah ${weekNumber}`;
                                }
                                
                                if (displayText) {
                                  return (
                                    <p className="text-xs text-blue-600 mt-1 font-medium">
                                      <i className="fas fa-list-ul mr-1"></i>
                                      Required: {displayText}
                                    </p>
                                  );
                                }
                              }
                              
                              // Handle old format with direct textbook/bible properties - clean chapter references
                              if (readingData.textbook || readingData.bible) {
                                let displayText = '';
                                if (readingData.textbook && readingData.textbook.title) {
                                  // Convert "Chapters 1-2" to "Chapters 1-2 of the textbook"
                                  const chapterMatch = readingData.textbook.title.match(/Chapters? (\d+)(?:-(\d+))?/i);
                                  if (chapterMatch) {
                                    const startChapter = chapterMatch[1];
                                    const endChapter = chapterMatch[2];
                                    if (endChapter) {
                                      displayText += `Chapters ${startChapter}-${endChapter} of the textbook`;
                                    } else {
                                      displayText += `Chapter ${startChapter} of the textbook`;
                                    }
                                  } else {
                                    displayText += readingData.textbook.title;
                                  }
                                }
                                
                                // Add Bible reading assignment
                                if (readingData.bible && readingData.bible.title) {
                                  if (displayText) displayText += ' + ';
                                  // Replace "2 Timothy" with just "Timothy"
                                  let bibleTitle = readingData.bible.title.replace(/2\s*Timothy/gi, 'Timothy');
                                  displayText += bibleTitle;
                                }
                                
                                if (courseId === 1 && weekNumber <= 4) { // Don't Be A Jonah course, only weeks 1-4 have Jonah chapters
                                  if (displayText) displayText += ' + ';
                                  displayText += `Jonah ${weekNumber}`;
                                }
                                
                                if (displayText) {
                                  return (
                                    <p className="text-xs text-blue-600 mt-1 font-medium">
                                      <i className="fas fa-list-ul mr-1"></i>
                                      Required: {displayText}
                                    </p>
                                  );
                                }
                              }
                            } catch (e) {
                              // Silent fail for malformed JSON
                            }
                            return null;
                          })()
                        ) : null}
                        {reading.bookTitle && (
                          <p className="text-xs text-gray-600 mt-1">
                            <i className="fas fa-bookmark mr-1"></i>
                            {reading.bookTitle}
                            {reading.bookAuthor && ` by ${reading.bookAuthor}`}
                            {reading.chapterNumber && ` - Chapter ${reading.chapterNumber}`}
                            {reading.chapterTitle && `: ${reading.chapterTitle}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {reading.estimatedTime && (
                          <span className="text-xs text-gray-500">
                            <i className="fas fa-clock mr-1"></i>
                            {reading.estimatedTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-end pt-1 px-4">
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                      {reading.content && reading.content.startsWith('{') ? (
                        // For required reading assignments (JSON format), show both buttons
                        (() => {
                          try {
                            const readingData = JSON.parse(reading.content);
                            
                            // Handle textbook_chapters format (G.R.O.W course 0)
                            if (readingData.type === 'textbook_chapters' && readingData.assignments) {
                              const textbookAssignment = readingData.assignments.find((a: any) => a.type === 'textbook');
                              
                              return (
                                <div className="flex w-full">
                                  {textbookAssignment && isAccessible && (
                                    <Button
                                      onClick={() => {
                                        
                                        // Navigate to complete book reader for G.R.O.W textbook
                                        const url = `/completE-book-reader?courseId=${courseId}`;
                                        window.location.href = url;
                                        
                                        // Update progress in background
                                        progressMutation.mutateAsync({
                                          courseId,
                                          contentType: 'reading',
                                          contentId: reading.id,
                                          completed: true,
                                        }).catch(error => {
                                          console.error('Failed to update reading progress:', error);
                                        });
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-2 px-3 text-sm font-medium min-h-[36px] rounded shadow-sm w-full"
                                      title={`🌱 ${textbookAssignment.title} - Let's Start Growing!`}
                                    >
                                      🌱 Let's Start Growing
                                    </Button>
                                  )}
                                  {!isAccessible && (
                                    <Button
                                      disabled
                                      className="bg-gray-300 text-gray-500 flex items-center justify-center py-2 px-3 text-sm font-medium min-h-[36px] rounded shadow-sm w-full cursor-not-allowed"
                                    >
                                      🔒 Locked
                                    </Button>
                                  )}
                                </div>
                              );
                            }

                            // Handle combined format (assignments array)
                            if (readingData.type === 'combined' && readingData.assignments) {
                              const textbookAssignment = readingData.assignments.find((a: any) => a.type === 'textbook');
                              const bibleAssignment = readingData.assignments.find((a: any) => a.type === 'bible');
                              
                              // Helper function to get Jonah chapter for each week
                              const getJonahChapterForWeek = (weekNumber: number) => {
                                const jonahChapters = {
                                  1: { chapter: 1, title: "Jonah 1", url: "https://www.biblegateway.com/passage/?search=Jonah%201&version=NLT" },
                                  2: { chapter: 2, title: "Jonah 2", url: "https://www.biblegateway.com/passage/?search=Jonah%202&version=NLT" },
                                  3: { chapter: 3, title: "Jonah 3", url: "https://www.biblegateway.com/passage/?search=Jonah%203&version=NLT" },
                                  4: { chapter: 4, title: "Jonah 4", url: "https://www.biblegateway.com/passage/?search=Jonah%204&version=NLT" }
                                };
                                return jonahChapters[weekNumber as keyof typeof jonahChapters];
                              };

                              // Get current week number from reading title
                              const currentWeekNumber = (() => {
                                const match = reading.title.match(/Week (\d+)/i);
                                return match ? parseInt(match[1]) : 1;
                              })();

                              const jonahChapter = courseId === 1 ? getJonahChapterForWeek(currentWeekNumber) : null;

                              return (
                                <div className="flex flex-col gap-2 w-full">
                                  {/* Reading Resources */}
                                  <div className="flex flex-row gap-1 w-full">
                                    {textbookAssignment && isAccessible && (
                                      <Button
                                        onClick={() => {
                                          
                                          // Navigate to textbook reader (avoiding popup blockers)
                                          const chapterTitle = encodeURIComponent(textbookAssignment.title);
                                          const url = `/completE-book-reader?courseId=${courseId}&chapterToRead=${chapterTitle}`;
                                          window.location.href = url;
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center py-2 px-1 text-xs font-medium min-h-[32px] rounded shadow-sm flex-1"
                                        title={`📚 Reading Assignment: Please read ${textbookAssignment.title}. Click "SELECT CHAPTER" in the book reader to choose the correct chapter.`}
                                      >
                                        <span className="text-sm">📚</span>
                                      </Button>
                                    )}
                                  {bibleAssignment && isAccessible && (
                                    <Button
                                      onClick={() => {
                                        
                                        // Open Bible URL immediately to avoid popup blockers
                                        window.open(bibleAssignment.url, '_blank');
                                        
                                        // Update progress in background
                                        progressMutation.mutateAsync({
                                          courseId,
                                          contentType: 'reading',
                                          contentId: reading.id,
                                          completed: true,
                                        }).catch(error => {
                                          console.error('Failed to update reading progress:', error);
                                        });
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-2 px-1 text-xs font-medium min-h-[32px] rounded shadow-sm flex-1"
                                      title={(() => {
                                        // Extract Bible chapters from URL or default message
                                        const url = bibleAssignment.url;
                                        if (url.includes('1%20Timothy%201-2')) {
                                          return "✝️ Bible Reading Assignment: Please read 1 Timothy chapters 1-2";
                                        } else if (url.includes('1%20Timothy%203-4')) {
                                          return "✝️ Bible Reading Assignment: Please read 1 Timothy chapters 3-4";
                                        } else if (url.includes('1%20Timothy%205-6')) {
                                          return "✝️ Bible Reading Assignment: Please read 1 Timothy chapters 5-6";
                                        } else if (url.includes('2%20Timothy%201-3')) {
                                          return "✝️ Bible Reading Assignment: Please read 2 Timothy chapters 1-3";
                                        } else if (url.includes('Titus%201-3')) {
                                          return "✝️ Bible Reading Assignment: Please read Titus chapters 1-3";
                                        } else {
                                          return "✝️ Bible Reading Assignment: Please read the assigned Bible chapters";
                                        }
                                      })()}
                                    >
                                      <span className="text-sm">✝️</span>
                                    </Button>
                                  )}
                                  {jonahChapter && isAccessible && (
                                    <Button
                                      onClick={() => {
                                        
                                        // Open Jonah chapter URL
                                        window.open(jonahChapter.url, '_blank');
                                        
                                        // Update progress in background
                                        progressMutation.mutateAsync({
                                          courseId,
                                          contentType: 'reading',
                                          contentId: reading.id,
                                          completed: true,
                                        }).catch(error => {
                                          console.error('Failed to update reading progress:', error);
                                        });
                                      }}
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center py-2 px-1 text-xs font-medium min-h-[32px] rounded shadow-sm flex-1"
                                      title={`🐋 Jonah Reading Assignment: Please read ${jonahChapter.title} - The Call and the Flight`}
                                    >
                                      <span className="text-sm">🐋</span>
                                    </Button>
                                  )}
                                  {!isAccessible && (
                                    <Button
                                      disabled
                                      className="w-full bg-gray-400 text-gray-200 flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg cursor-not-allowed"
                                    >
                                      <i className="fas fa-lock text-lg"></i>
                                      {getCompletionMessage(weekNumber, 'reading')}
                                    </Button>
                                  )}
                                  </div>
                                </div>
                              );
                            }
                            
                            // Handle Bible-only format for Acts in Action course
                            if (readingData.type === 'bible' && readingData.assignments) {
                              const bibleAssignment = readingData.assignments[0];
                              
                              return (
                                <div className="flex w-full">
                                  {bibleAssignment && isAccessible && (
                                    <Button
                                      onClick={() => {
                                        
                                        // Open Bible Gateway URL
                                        window.open(bibleAssignment.url, '_blank');
                                        
                                        // Update progress in background
                                        progressMutation.mutateAsync({
                                          courseId,
                                          contentType: 'reading',
                                          contentId: reading.id,
                                          completed: true,
                                        }).catch(error => {
                                          console.error('Failed to update reading progress:', error);
                                        });
                                      }}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg shadow-md"
                                      title={`✝️ Bible Reading Assignment: ${bibleAssignment.description}`}
                                    >
                                      <i className="fas fa-bible text-lg"></i>
                                      <span className="hidden sm:inline">Read {bibleAssignment.title}</span>
                                      <span className="sm:hidden">Bible Reading</span>
                                    </Button>
                                  )}
                                  {!isAccessible && (
                                    <Button
                                      disabled
                                      className="w-full bg-gray-400 text-gray-200 flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg cursor-not-allowed"
                                    >
                                      <i className="fas fa-lock text-lg"></i>
                                      {getCompletionMessage(weekNumber, 'reading')}
                                    </Button>
                                  )}
                                </div>
                              );
                            }
                            
                            // Handle old format (direct textbook/bible properties)
                            if (readingData.textbook && readingData.bible) {
                              return (
                                <div className="flex flex-col gap-2 w-full">
                                  {readingData.textbook && readingData.textbook.title && isAccessible && (
                                    <Button
                                      onClick={async () => {
                                        // Automatically mark reading as complete when clicked
                                        try {
                                          await progressMutation.mutateAsync({
                                            courseId,
                                            contentType: 'reading',
                                            contentId: reading.id,
                                            completed: true,
                                          });
                                        } catch (error) {
                                          console.error('Failed to update reading progress:', error);
                                        }
                                        // Navigate to complete book reader with chapter notification
                                        const chapterTitle = encodeURIComponent(readingData.textbook.title);
                                        window.location.href = `/completE-book-reader?courseId=${courseId}&chapterToRead=${chapterTitle}`;
                                      }}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg shadow-md"
                                      title={`📚 Reading Assignment: Please read ${readingData.textbook.title}. Click "SELECT CHAPTER" in the book reader to choose the correct chapter.`}
                                    >
                                      <i className="fas fa-book-open text-lg"></i>
                                      <span className="hidden sm:inline">Go to Book Chapters</span>
                                      <span className="sm:hidden">Book Chapters</span>
                                    </Button>
                                  )}
                                  {readingData.bible && readingData.bible.url && isAccessible && (
                                    <Button
                                      onClick={async () => {
                                        // Automatically mark reading as complete when clicked
                                        try {
                                          await progressMutation.mutateAsync({
                                            courseId,
                                            contentType: 'reading',
                                            contentId: reading.id,
                                            completed: true,
                                          });
                                        } catch (error) {
                                          console.error('Failed to update reading progress:', error);
                                        }
                                        window.open(readingData.bible.url, '_blank');
                                      }}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg shadow-md"
                                    >
                                      <i className="fas fa-book-open text-lg"></i>
                                      <span className="hidden sm:inline">Go to Bible Chapters</span>
                                      <span className="sm:hidden">Bible Chapters</span>
                                    </Button>
                                  )}
                                  {!isAccessible && (
                                    <Button
                                      disabled
                                      className="w-full bg-gray-400 text-gray-200 flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg cursor-not-allowed"
                                    >
                                      <i className="fas fa-lock text-lg"></i>
                                      {getCompletionMessage(weekNumber, 'reading')}
                                    </Button>
                                  )}
                                </div>
                              );
                            }
                            
                            // Fallback for other formats
                            return isAccessible ? (
                              <Button
                                onClick={async () => {
                                  // Automatically mark reading as complete when clicked
                                  try {
                                    await progressMutation.mutateAsync({
                                      courseId,
                                      contentType: 'reading',
                                      contentId: reading.id,
                                      completed: true,
                                    });
                                  } catch (error) {
                                    console.error('Failed to update reading progress:', error);
                                  }
                                  // Navigate to complete book reader for textbook content
                                  window.location.href = `/completE-book-reader?courseId=${courseId}`;
                                }}
                                className="flex items-center gap-2"
                              >
                                <i className="fas fa-book-open"></i>
                                Start Reading
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="w-full bg-gray-400 text-gray-200 flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg cursor-not-allowed"
                              >
                                <i className="fas fa-lock text-lg"></i>
                                {getCompletionMessage(weekNumber, 'reading')}
                              </Button>
                            );
                          } catch (e) {
                            return isAccessible ? (
                              <Button
                                onClick={async () => {
                                  // Automatically mark reading as complete when clicked
                                  try {
                                    await progressMutation.mutateAsync({
                                      courseId,
                                      contentType: 'reading',
                                      contentId: reading.id,
                                      completed: true,
                                    });
                                  } catch (error) {
                                    console.error('Failed to update reading progress:', error);
                                  }
                                  // Navigate to complete book reader for textbook content
                                  window.location.href = `/completE-book-reader?courseId=${courseId}`;
                                }}
                                className="flex items-center gap-2"
                              >
                                <i className="fas fa-book-open"></i>
                                Start Reading
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="w-full bg-gray-400 text-gray-200 flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold min-h-[44px] rounded-lg cursor-not-allowed"
                              >
                                <i className="fas fa-lock text-lg"></i>
                                {getCompletionMessage(weekNumber, 'reading')}
                              </Button>
                            );
                          }
                        })()
                      ) : isAccessible && reading.externalUrl ? (
                        <Button
                          onClick={async () => {
                            // Automatically mark reading as complete when clicked
                            try {
                              await progressMutation.mutateAsync({
                                courseId,
                                contentType: 'reading',
                                contentId: reading.id,
                                completed: true,
                              });
                            } catch (error) {
                              console.error('Failed to update reading progress:', error);
                            }
                            window.location.href = reading.externalUrl!;
                          }}
                          className="flex items-center gap-2"
                        >
                          <i className="fas fa-book-open"></i>
                          Open Textbook
                        </Button>
                      ) : isAccessible ? (
                        <Button 
                          onClick={async () => {
                            // Automatically mark reading as complete when clicked
                            try {
                              await progressMutation.mutateAsync({
                                courseId,
                                contentType: 'reading',
                                contentId: reading.id,
                                completed: true,
                              });
                            } catch (error) {
                              console.error('Failed to update reading progress:', error);
                            }
                            // Navigate to complete book reader for textbook content
                            window.location.href = `/completE-book-reader?courseId=${courseId}`;
                          }}
                          className="flex items-center gap-2"
                        >
                          <i className="fas fa-book-open"></i>
                          Start Reading
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="flex items-center gap-2 bg-gray-400 text-gray-200 cursor-not-allowed"
                        >
                          <i className="fas fa-lock"></i>
                          {getCompletionMessage(weekNumber, 'reading')}
                        </Button>
                      )}

                    </div>
                  </CardContent>
                </Card>
                );
              })
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {/* Dynamic Quiz Display */}
          {quizzes.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
                  {courseId === 1 ? 'Acts in Action Week Quizzes' : 'Course Quizzes'}
                </h3>
              
              {/* Dynamic Quiz Cards */}
              {quizzes.sort((a: any, b: any) => {
                // Final exams always go last
                if (a.isFinalExam && !b.isFinalExam) return 1;
                if (!a.isFinalExam && b.isFinalExam) return -1;
                // Sort by week number in title, then by quiz ID
                const aWeek = parseInt(a.title.match(/Week (\d+)/)?.[1] || '0');
                const bWeek = parseInt(b.title.match(/Week (\d+)/)?.[1] || '0');
                if (aWeek !== bWeek) return aWeek - bWeek;
                return a.id - b.id;
              }).map((quiz: any) => {
                const isFinalExam = quiz.isFinalExam;
                const quizNumber = quiz.title.match(/Week (\d+)/)?.[1];
                const weekNumber = isFinalExam ? 11 : parseInt(quizNumber || '1');
                const isAccessible = canAccessQuiz(weekNumber, isFinalExam);
                const quizAttemptInfo = getQuizAttemptInfo(quiz.id);
                const hasAttempts = quizAttemptInfo.count > 0;
                
                return (
                  <Card 
                    key={quiz.id} 
                    className={`border-l-4 ${isFinalExam ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50' : 'border-purple-500'} ${!isAccessible ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`${isFinalExam ? 'text-xl font-bold' : 'text-lg font-semibold'} text-gray-800 flex items-center gap-2`}>
                            <i className={`fas ${isFinalExam ? 'fa-graduation-cap text-red-600' : isAccessible ? 'fa-quiz text-purple-600' : 'fa-quiz text-gray-400'}`}></i>
                            {quiz.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {isFinalExam 
                              ? `${quiz.questions?.length || 50} questions • 60 minutes • 60% passing score`
                              : `${quiz.questions?.length || 10} questions • 15 minutes • 60% passing score`}
                          </p>
                          {isFinalExam && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p className="font-medium text-red-700">📝 Includes Essay Component</p>
                              <p className="text-xs text-gray-600">• {quiz.questions?.length || 50} multiple choice questions covering all course material</p>
                              <p className="text-xs text-gray-600">• 100-word minimum essay reflection</p>
                              <p className="text-xs text-gray-600">• Essay sent to pastor_rocky@sfgmboston.com for review</p>
                              <p className="text-xs text-gray-600">• Course completion certificate via email after review</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {(() => {
                            if (!hasAttempts) return null;
                            return quizAttemptInfo.latestPassed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <i className="fas fa-check mr-1"></i>
                                Passed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <i className="fas fa-times mr-1"></i>
                                Failed
                              </Badge>
                            );
                          })()}
                          {!hasAttempts && isAccessible && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <i className="fas fa-clock mr-1"></i>
                              Available
                            </Badge>
                          )}
                          {!hasAttempts && !isAccessible && (
                            <Badge className="bg-gray-100 text-gray-600">
                              <i className="fas fa-lock mr-1"></i>
                              Locked
                            </Badge>
                          )}
                          {quiz.timeLimit && (
                            <span className="text-sm text-gray-500">
                              <i className="fas fa-clock mr-1"></i>
                              {quiz.timeLimit} min
                            </span>
                          )}
                          
                          {/* Quiz Action Buttons */}
                          {hasAttempts ? (
                            // Quiz completed - show view previous quiz button
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={() => {
                              // Generate quiz URL based on courseId
                              let quizUrl;
                              if (courseId === 1) {
                                quizUrl = isFinalExam ? '/quiz/acts-final-exam' : `/quiz/acts-week-${quizNumber}`;
                              } else if (courseId === 2) {
                                quizUrl = isFinalExam ? '/quiz/firestarter-final-exam' : `/quiz/firestarter-week-${quizNumber}`;
                              } else if (courseId === 3) {
                                quizUrl = isFinalExam ? '/quiz/dbaj-final-exam' : `/quiz/dbaj-week-${quizNumber}`;
                                } else if (courseId === 5) {
                                  quizUrl = isFinalExam ? '/quiz/studying-for-service-final-exam' : `/quiz/studying-for-service-week-${quizNumber}`;
                                } else if (courseId === 4) {
                                  quizUrl = isFinalExam ? '/quiz/grow-final-exam' : `/quiz/grow-week-${quizNumber}`;
                                } else if (courseId === 6) {
                                  quizUrl = isFinalExam ? '/quiz/deacon-course-final-exam' : `/quiz/deacon-course-week-${quizNumber}`;
                                } else if (courseId === 8) {
                                  quizUrl = isFinalExam ? '/quiz/youth-ministry-final-exam' : `/quiz/youth-ministry-week-${quizNumber}`;
                                } else {
                                  quizUrl = `/quiz/${quiz.id}`;
                                }
                                window.location.href = `${quizUrl}?review=true`;
                                }}
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                <i className="fas fa-eye mr-2"></i>
                                View Previous Quiz
                              </Button>
                              <p className="text-xs text-gray-500 text-center">
                                {quizAttemptInfo.latestPassed ? '✅ Completed' : '❌ Failed - No Retry'}
                              </p>
                            </div>
                          ) : (
                            // Quiz not taken - show take quiz button or locked state
                            <Button
                              disabled={!isAccessible}
                              onClick={() => {
                                // Generate quiz URL based on courseId
                                let quizUrl;
                                if (courseId === 1) {
                                  quizUrl = isFinalExam ? '/quiz/acts-final-exam' : `/quiz/acts-week-${quizNumber}`;
                                } else if (courseId === 2) {
                                  quizUrl = isFinalExam ? '/quiz/firestarter-final-exam' : `/quiz/firestarter-week-${quizNumber}`;
                                } else if (courseId === 3) {
                                  quizUrl = isFinalExam ? '/quiz/dbaj-final-exam' : `/quiz/dbaj-week-${quizNumber}`;
                                } else if (courseId === 5) {
                                  quizUrl = isFinalExam ? '/quiz/studying-for-service-final-exam' : `/quiz/studying-for-service-week-${quizNumber}`;
                                } else if (courseId === 4) {
                                  quizUrl = isFinalExam ? '/quiz/grow-final-exam' : `/quiz/grow-week-${quizNumber}`;
                                } else if (courseId === 6) {
                                  quizUrl = isFinalExam ? '/quiz/deacon-course-final-exam' : `/quiz/deacon-course-week-${quizNumber}`;
                                } else if (courseId === 8) {
                                  quizUrl = isFinalExam ? '/quiz/youth-ministry-final-exam' : `/quiz/youth-ministry-week-${quizNumber}`;
                                } else {
                                  quizUrl = `/quiz/${quiz.id}`;
                                }
                                window.location.href = quizUrl;
                              }}
                              className={`${!isAccessible 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : isFinalExam 
                                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg px-6 py-3'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                              }`}
                            >
                            {!isAccessible 
                                ? '🔒 Locked' 
                                : isFinalExam 
                                  ? '🎓 Take Final Exam' 
                                  : '📝 Take Quiz'
                              }
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            </div>
          )}

          {/* No Quizzes Message */}
          {quizzes.length === 0 && courseId !== 1 && (
            <Card>
              <CardContent className="text-center py-8 space-y-4">
                <i className="fas fa-quiz text-4xl text-gray-400"></i>
                <p className="text-gray-600">No quizzes available yet</p>
              </CardContent>
            </Card>
          )}

        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-play text-blue-600"></i>
              {currentVideo?.title}
            </DialogTitle>
            <DialogDescription>
              Watch this video to continue your learning journey
            </DialogDescription>
          </DialogHeader>
          {currentVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <iframe
                  src={(() => {
                    if (!currentVideo.videoUrl) return '';
                    const videoId = getYouTubeVideoId(currentVideo.videoUrl);
                    if (videoId) {
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                    return currentVideo.videoUrl;
                  })()}
                  title={currentVideo.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <i className="fas fa-clock mr-1"></i>
                  {currentVideo.duration || 'Duration not available'}
                </div>
                <Button
                  onClick={() => {
                    if (currentVideo.videoUrl) {
                      window.open(currentVideo.videoUrl, '_blank');
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <i className="fab fa-youtube mr-2"></i>
                  Open on YouTube
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
