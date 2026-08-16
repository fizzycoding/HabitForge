import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from './error.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

  const user = await User.findById(decoded.id).select('_id email');
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = { id: user._id.toString(), email: user.email };
  next();
});
