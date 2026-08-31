import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import mongoose from 'mongoose';
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
  let bearerToken = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.split(' ')[1];
    if (bearerToken && bearerToken !== 'undefined' && bearerToken !== 'null') {
      const existingCookie = headers.get('cookie') || '';
      const cookieStr = `better-auth.session_token=${bearerToken}; __Secure-better-auth.session_token=${bearerToken}`;
      headers.set(
        'cookie',
        existingCookie ? `${existingCookie}; ${cookieStr}` : cookieStr,
      );
    }
  }

  let session = await auth.api.getSession({
    headers,
  });

  // Direct MongoDB session lookup fallback if Better-Auth session check is null
  if (!session && bearerToken && bearerToken !== 'undefined' && bearerToken !== 'null') {
    const db = mongoose.connection.db;
    if (db) {
      const sessionDoc = await db.collection('session').findOne({ token: bearerToken });
      if (sessionDoc && new Date(sessionDoc.expiresAt) > new Date()) {
        let userDoc = await db.collection('user').findOne({
          $or: [
            { _id: sessionDoc.userId },
            { id: sessionDoc.userId.toString() },
          ],
        });

        if (!userDoc && mongoose.Types.ObjectId.isValid(sessionDoc.userId.toString())) {
          userDoc = await db.collection('user').findOne({
            _id: new mongoose.Types.ObjectId(sessionDoc.userId.toString()),
          });
        }

        if (userDoc) {
          session = {
            session: {
              id: sessionDoc._id.toString(),
              token: sessionDoc.token,
              userId: sessionDoc.userId.toString(),
              expiresAt: sessionDoc.expiresAt,
              createdAt: sessionDoc.createdAt || new Date(),
              updatedAt: sessionDoc.updatedAt || new Date(),
              ...sessionDoc,
            },
            user: {
              id: userDoc._id.toString(),
              email: userDoc.email,
              name: userDoc.name,
              emailVerified: userDoc.emailVerified || false,
              image: userDoc.avatar || userDoc.image,
              createdAt: userDoc.createdAt,
              updatedAt: userDoc.updatedAt,
              uid: userDoc.uid || '',
              avatar: userDoc.avatar || 'avatar-01',
              xp: userDoc.xp || 0,
              level: userDoc.level || 1,
              subscription: userDoc.subscription || { plan: 'free', status: 'active' },
              badges: userDoc.badges || [],
            },
          } as any;
        }
      }
    }
  }

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
