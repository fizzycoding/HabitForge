import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from './error.js';

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new AppError(`Validation failed: ${issues}`, 400));
      }
      next(error);
    }
  };
};
