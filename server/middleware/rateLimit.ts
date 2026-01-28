/**
 * Rate limiting middleware to prevent API abuse
 * Simple in-memory rate limiter (for production, consider Redis-based solution)
 */

import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Creates a rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests per window default
    message = "Too many requests, please try again later.",
    keyGenerator = (req: Request) => {
      // Default: use IP address or user ID
      return (req as any).user?.id || req.ip || 'anonymous';
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or get existing entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      const resetTime = new Date(store[key].resetTime);
      res.status(429).json({
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000), // seconds
        resetAt: resetTime.toISOString(),
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    next();
  };
}

/**
 * Standard rate limiter for API endpoints
 * Optimized for upgraded capacity (Render + Neon scale-up)
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 250, // 250 requests per 15 minutes (upgraded capacity)
  message: "Too many requests. Please slow down.",
});

/**
 * Strict rate limiter for content updates (prevent spam)
 */
export const contentUpdateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 updates per minute
  message: "Too many content updates. Please slow down.",
});
