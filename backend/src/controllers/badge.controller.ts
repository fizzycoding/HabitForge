import type { Response } from 'express';
import {
  getUserBadges as getUserBadgesService,
  ensureBadgesSeeded,
} from '../services/badge.service.js';
import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getUserBadges = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const badges = await getUserBadgesService(userId);
  res.json({ badges });
});

export const seedBadges = asyncHandler(async (_req: AuthRequest, res: Response) => {
  await ensureBadgesSeeded();
  res.json({ message: 'Predefined badges ensured in database successfully' });
});
