import type { Response } from 'express';
import {
  getMyProfile as getMyProfileService,
  getPublicProfileByUID,
  updateUserProfile,
} from '../services/user.service.js';
import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { UpdateProfileInput } from '../schemas/auth.schema.js';

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await getMyProfileService(userId);
  res.json({ user });
});

export const getPublicProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const uid = req.params.uid as string;
  const profile = await getPublicProfileByUID(uid);
  res.json({ profile });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const updatedUser = await updateUserProfile(userId, req.body as UpdateProfileInput);
  res.json({ message: 'Profile updated successfully', user: updatedUser });
});
