/**
 * Quiz Monitoring Service
 * Tracks quiz submission failures and provides hooks for alerting
 */

export interface QuizSubmissionFailure {
  timestamp: Date;
  quizId: number;
  studentId: string;
  error: Error | unknown;
  attemptData?: {
    answers?: Record<string, any>;
    timeSpent?: number;
  };
}

class QuizMonitoringService {
  private failures: QuizSubmissionFailure[] = [];
  private readonly MAX_FAILURES_STORED = 100;

  /**
   * Record a failed quiz submission
   */
  recordFailure(failure: QuizSubmissionFailure): void {
    this.failures.unshift(failure);
    
    // Keep only recent failures
    if (this.failures.length > this.MAX_FAILURES_STORED) {
      this.failures = this.failures.slice(0, this.MAX_FAILURES_STORED);
    }

    // Log to console with structured format
    console.error("=== QUIZ SUBMISSION FAILURE ===");
    console.error("Timestamp:", failure.timestamp.toISOString());
    console.error("Quiz ID:", failure.quizId);
    console.error("Student ID:", failure.studentId);
    console.error("Error:", failure.error);
    if (failure.attemptData) {
      console.error("Attempt Data:", JSON.stringify(failure.attemptData, null, 2));
    }
    console.error("===============================");

    // Hook for external monitoring (can be extended to send to external services)
    this.notifyExternalServices(failure);
  }

  /**
   * Get recent failures (for admin/debugging)
   */
  getRecentFailures(limit: number = 20): QuizSubmissionFailure[] {
    return this.failures.slice(0, limit);
  }

  /**
   * Get failure count in the last N minutes
   */
  getFailureCountInLastMinutes(minutes: number = 60): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.failures.filter((f) => f.timestamp >= cutoff).length;
  }

  /**
   * Hook for external monitoring services
   * Can be extended to send to Sentry, DataDog, email, etc.
   */
  private notifyExternalServices(failure: QuizSubmissionFailure): void {
    // Example: If you want to send to an external service, uncomment and configure:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(failure.error, {
    //     tags: { quizId: failure.quizId, studentId: failure.studentId },
    //     extra: failure.attemptData,
    //   });
    // }

    // For now, we just log - but this is where you'd add external integrations
    if (this.getFailureCountInLastMinutes(5) > 10) {
      console.warn("⚠️  HIGH FAILURE RATE: More than 10 quiz submission failures in the last 5 minutes!");
    }
  }

  /**
   * Clear old failures (for cleanup)
   */
  clearOldFailures(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.failures = this.failures.filter((f) => f.timestamp >= cutoff);
  }
}

export const quizMonitoring = new QuizMonitoringService();


