import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { announcements } from "@shared/schema";
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { registerAuthRoutes } from "./routes/auth";
import { registerQuizRoutes } from "./routes/quizzes";
import { registerCourseRoutes } from "./routes/courses";
import { registerMediaRoutes } from "./routes/media";
import { registerBibleRoutes } from "./routes/bible";
import { registerProfileRoutes } from "./routes/profile";
import { registerEssayRoutes } from "./routes/essays";
import { registerForumRoutes } from "./routes/forum";
import { registerBirthdayRoutes } from "./routes/birthday";
import { registerAdminRoutes } from "./routes/admin";
import { registerInstructorApplicationRoutes } from "./routes/instructorApplications";
import { registerInstructorRoutes } from "./routes/instructor";
import { extractAuthToken } from "./utils/auth";
import express from "express";
import { apiRateLimit } from "./middleware/rateLimit";
import { pool } from "./db";

export function setupRoutes(app: Express): Server {
  const server = createServer(app);
  
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  
  // Apply rate limiting to all API routes (except health checks)
  app.use((req: any, res: any, next: any) => {
    // Skip rate limiting for health checks
    if (req.path === '/api/health' || req.path === '/health') {
      return next();
    }
    // Apply rate limiting to API routes
    if (req.path.startsWith('/api/')) {
      return apiRateLimit(req, res, next);
    }
    next();
  });
  
  // Simple authentication middleware for testing
  app.use(async (req: any, res: any, next: any) => {
    const token = extractAuthToken(req) || 'guest';
    
    // Only log tokens in development mode for security
    if (process.env.NODE_ENV === 'development') {
      console.log(`Auth middleware: ${req.method} ${req.path}, token: ${token ? 'present' : 'missing'}`);
    }
    
    // For testing purposes, create a test user for test-token
    if (token === 'test-token') {
      req.user = {
        id: 'test-user',
        username: 'test-user',
        email: 'test@example.com',
        roles: ['student'],
        primaryRole: 'student'
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('Set test user:', req.user);
      }
    } else if (token && token !== 'guest') {
      // Try to get user by token from database
      const user = await storage.getUserByToken(token);
      if (user) {
        req.user = user;
        if (process.env.NODE_ENV === 'development') {
          console.log('Set user from token:', { id: user.id, username: user.username, email: user.email });
        }
      }
    }
    
    next();
  });
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  registerAuthRoutes(app);
  registerQuizRoutes(app);
  registerCourseRoutes(app);
  registerMediaRoutes(app);
  registerBibleRoutes(app);
  registerProfileRoutes(app);
  registerEssayRoutes(app);
  registerForumRoutes(app);
  registerBirthdayRoutes(app);
  registerAdminRoutes(app);
  registerInstructorApplicationRoutes(app);
  registerInstructorRoutes(app);

  // Health check endpoints for monitoring
  app.get('/api/health', async (_req, res) => {
    try {
      // Basic health check - just verify server is running
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
  });

  app.get('/api/health/detailed', async (_req, res) => {
    try {
      const startTime = Date.now();
      
      // Test database connection
      let dbStatus = 'unknown';
      let dbResponseTime = 0;
      let poolStats = null;
      try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        dbResponseTime = Date.now() - dbStart;
        dbStatus = 'connected';
        
        // Get connection pool statistics for monitoring
        poolStats = {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount,
          maxConnections: (pool as any).options?.max || 30,
        };
      } catch (error) {
        dbStatus = 'error';
        console.error('Database health check failed:', error);
      }

      const totalResponseTime = Date.now() - startTime;

      res.json({
        status: dbStatus === 'connected' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
            connectionPool: poolStats ? {
              active: poolStats.totalCount - poolStats.idleCount,
              idle: poolStats.idleCount,
              waiting: poolStats.waitingCount,
              max: poolStats.maxConnections,
              utilization: poolStats.maxConnections > 0 
                ? `${Math.round(((poolStats.totalCount - poolStats.idleCount) / poolStats.maxConnections) * 100)}%`
                : '0%',
            } : null,
          },
        },
        system: {
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB',
          },
          nodeVersion: process.version,
        },
        responseTime: `${totalResponseTime}ms`,
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Detailed health check failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/uptime', (_req, res) => {
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeSecs = Math.floor(uptimeSeconds % 60);

    res.json({
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSecs}s`,
        hours: uptimeHours,
        minutes: uptimeMinutes,
      },
      startedAt: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/announcements', async (_req, res) => {
    try {
      const announcementsList = await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt));
      res.json(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Diagnostics endpoints: admin-only in production
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PANEL_PASSWORD || (process.env.NODE_ENV === 'development' ? '123' : null);

  const requireDiagnosticsAccess = (req: any, res: any, next: any) => {
    // In production, require both auth + admin password
    if (process.env.NODE_ENV === 'production') {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      if (!ADMIN_PASSWORD) return res.status(503).json({ message: 'Admin panel is not configured' });
      const provided = req.headers['x-admin-password'];
      if (provided !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin password' });
    }

    next();
  };

  // Diagnostics: verify DB schema has critical auth/enrollment columns
  // Safe to expose: reports only existence, not data.
  app.get('/api/diagnostics/db-schema', requireDiagnosticsAccess, async (_req, res) => {
    try {
      const checks = {
        users: ['id', 'email', 'username', 'password', 'phone'],
        enrollments: ['id', 'student_id', 'course_id'],
        courses: ['id', 'name'],
      } as const;

      const results: Record<string, any> = {};

      for (const [table, columns] of Object.entries(checks)) {
        const r = await pool.query(
          `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
          [table]
        );
        const existing = new Set((r.rows || []).map((row: any) => row.column_name));
        results[table] = {
          exists: existing.size > 0,
          missingColumns: (columns as string[]).filter((c) => !existing.has(c)),
        };
      }

      res.json({
        ok: Object.values(results).every((t: any) => t.exists && (t.missingColumns?.length || 0) === 0),
        results,
      });
    } catch (error: any) {
      console.error('DB schema diagnostics failed:', error);
      res.status(500).json({
        ok: false,
        error: 'Diagnostics failed',
        message: error?.message || String(error),
      });
    }
  });

  // Return JSON 404 for unmatched /api/* so clients never receive HTML (avoids res.json() throws)
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "The requested resource was not found.", code: "NOT_FOUND" });
  });

  return server;
}
