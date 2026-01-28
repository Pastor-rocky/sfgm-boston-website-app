/**
 * Retry utility for critical database operations
 * Provides exponential backoff and configurable retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Executes an operation with automatic retry logic
 * @param operation The async operation to retry
 * @param options Retry configuration options
 * @returns The result of the operation
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    delayMs = 100,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: Error | unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // If this was the last retry, break
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (error instanceof Error && !shouldRetry(error)) {
        throw error;
      }

      // Call retry callback if provided
      if (onRetry && error instanceof Error) {
        onRetry(attempt + 1, error);
      }

      // Exponential backoff: delayMs * 2^attempt
      const delay = delayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error("Operation failed after retries");
}

/**
 * Helper to determine if an error is retryable
 * Database connection errors, timeouts, and deadlocks are typically retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /connection/i,
    /timeout/i,
    /deadlock/i,
    /network/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
  ];

  return retryablePatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Helper to determine if an error should NOT be retried
 * Validation errors, authentication errors, and constraint violations should not be retried
 */
export function shouldNotRetry(error: Error): boolean {
  const nonRetryablePatterns = [
    /invalid/i,
    /validation/i,
    /unauthorized/i,
    /forbidden/i,
    /not found/i,
    /foreign key/i,
    /unique constraint/i,
    /duplicate/i,
  ];

  return nonRetryablePatterns.some((pattern) => pattern.test(error.message));
}
