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
import { extractAuthToken } from "./utils/auth";
import express from "express";

export function setupRoutes(app: Express): Server {
  const server = createServer(app);
  
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  
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
      try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        dbResponseTime = Date.now() - dbStart;
        dbStatus = 'connected';
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

  return server;
}
