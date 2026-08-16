import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from './error.js';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AuthUser } from '../schemas/auth.schema.js';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('Not authorized, no access token provided', 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('_id email name avatar xp level subscription badges');
    
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      subscription: user.subscription,
      badges: user.badges.map((b) => ({
        badgeId: b.badgeId.toString(),
        unlockedAt: b.unlockedAt,
      })),
    };
    next();
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired access token', 401);
  }
});
