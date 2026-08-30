import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import { AppError, asyncHandler } from './error.js';
import type { AuthUser } from '../schemas/user.schema.js';

export interface AuthRequest extends Request {
  user?: AuthUser;
  session?: any;
}

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const nodeHeaders = fromNodeHeaders(req.headers);
  const headers = new Headers(nodeHeaders);

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined' && token !== 'null') {
      const existingCookie = headers.get('cookie') || '';
      headers.set(
        'cookie',
        existingCookie ? `${existingCookie}; better-auth.session_token=${token}` : `better-auth.session_token=${token}`,
      );
    }
  }

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    throw new AppError('Not authorized, please log in', 401);
  }

  const { user } = session;
  req.session = session.session;
  req.user = {
    id: user.id,
    uid: (user as any).uid || '',
    email: user.email,
    name: user.name,
    avatar: (user as any).avatar || 'avatar-01',
    isEmailVerified: user.emailVerified || false,
    xp: (user as any).xp || 0,
    level: (user as any).level || 1,
    subscription: (user as any).subscription || { plan: 'free', status: 'active' },
    badges: (user as any).badges || [],
  };
  next();
});

export function isProUser(user?: AuthUser): boolean {
  if (!user || !user.subscription) return false;
  const { plan, status } = user.subscription;
  return plan !== 'free' && status === 'active';
}

export const requirePro = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Not authorized', 401);
  }

  if (!isProUser(req.user)) {
    throw new AppError('Pro subscription required for this feature', 403);
  }

  next();
});
