import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

/**
 * Validates req.body using the provided Zod schema and stores the parsed
 * value on req.validatedBody for downstream handlers.
 */
export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: result.error.flatten(),
      });
    }

    (req as any).validatedBody = result.data;
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
    }
  }
}

export {};

