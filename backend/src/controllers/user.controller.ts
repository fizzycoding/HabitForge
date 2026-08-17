import type { Response } from 'express';
import {
  getMyProfile as getMyProfileService,
  getPublicProfileByUID,
  updateUserProfile,
} from '../services/user.service.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { UpdateProfileInput, UpdateSubscriptionInput } from '../schemas/user.schema.js';
import { User } from '../models/User.js';

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

export const updateSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as UpdateSubscriptionInput;
  const userId = req.user!.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.subscription = {
    plan,
    status: 'active',
    startDate: new Date(),
    endDate: plan === 'free' ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  await user.save();

  res.json({
    message: `Subscription updated to ${plan} plan successfully`,
    user,
  });
});
