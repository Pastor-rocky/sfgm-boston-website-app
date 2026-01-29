/**
 * Error handling utilities for API routes
 * Provides consistent error responses and user-friendly messages
 */

import type { Response } from "express";

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

/**
 * Determines if an error is a database connection error
 */
export function isDatabaseConnectionError(error: Error): boolean {
  const connectionPatterns = [
    /connection/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
    /timeout/i,
    /network/i,
    /pool/i,
  ];
  return connectionPatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Determines if an error is a validation/constraint error
 */
export function isValidationError(error: Error): boolean {
  const validationPatterns = [
    /invalid/i,
    /validation/i,
    /foreign key/i,
    /unique constraint/i,
    /duplicate/i,
    /not null/i,
    /constraint/i,
  ];
  return validationPatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Determines if an error is an authentication/authorization error
 */
export function isAuthError(error: Error): boolean {
  const authPatterns = [
    /unauthorized/i,
    /forbidden/i,
    /authentication/i,
    /authorization/i,
    /token/i,
  ];
  return authPatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Determines if an error is a "not found" error
 */
export function isNotFoundError(error: Error): boolean {
  const notFoundPatterns = [
    /not found/i,
    // NOTE:
    // Avoid treating generic "does not exist"/"missing" as NOT_FOUND.
    // Postgres schema errors (e.g. relation/column does not exist)
    // should surface as 5xx so deployment/migrations can be fixed.
  ];
  return notFoundPatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Converts an error to a user-friendly API error response
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Database connection errors
    if (isDatabaseConnectionError(error)) {
      return {
        message: "Database temporarily unavailable. Please try again in a moment.",
        code: "DATABASE_UNAVAILABLE",
        statusCode: 503,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }

    // Validation errors
    if (isValidationError(error)) {
      return {
        message: "Invalid request data. Please check your input and try again.",
        code: "VALIDATION_ERROR",
        statusCode: 400,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }

    // Authentication errors
    if (isAuthError(error)) {
      return {
        message: "Authentication required. Please log in and try again.",
        code: "AUTH_ERROR",
        statusCode: 401,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }

    // Not found errors
    if (isNotFoundError(error)) {
      return {
        message: "The requested resource was not found.",
        code: "NOT_FOUND",
        statusCode: 404,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }

    // Generic error
    return {
      message: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  // Unknown error type
  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
}

/**
 * Sends a standardized error response
 */
export function sendErrorResponse(res: Response, error: unknown, logContext?: string): void {
  const apiError = toApiError(error);
  
  // Log error with context
  if (logContext) {
    console.error(`[${logContext}]`, error);
  } else {
    console.error("API Error:", error);
  }

  // Send response
  res.status(apiError.statusCode).json({
    message: apiError.message,
    code: apiError.code,
    ...(apiError.details && { details: apiError.details }),
  });
}

/**
 * Wraps an async route handler with error handling
 */
export function withErrorHandling(
  handler: (req: any, res: Response) => Promise<void>,
  context?: string
) {
  return async (req: any, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendErrorResponse(res, error, context);
    }
  };
}
