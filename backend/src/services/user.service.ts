import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { AppError } from '../middleware/error.js';
import { getLevelProgress, calculateStreak } from '../utils/gamification.js';
import { generateUniqueUID } from '../utils/uid.js';
import type { UpdateProfileInput, ChangePasswordInput } from '../schemas/auth.schema.js';

export function formatFullUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    uid: user.uid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified || false,
    xp: user.xp || 0,
    level: user.level || 1,
    progress: getLevelProgress(user.xp || 0),
    subscription: user.subscription,
    badges:
      user.badges?.map((b) => ({
        badgeId: b.badgeId.toString(),
        unlockedAt: b.unlockedAt,
      })) || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getMyProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.uid) {
    user.uid = await generateUniqueUID();
    await user.save();
  }

  return formatFullUser(user);
}

/**
 * Fetch public user profile by 8-digit UID
 */
export async function getPublicProfileByUID(uid: string) {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new AppError('User profile not found', 404);
  }

  const userId = user._id.toString();

  const [totalCompletions, activeHabits] = await Promise.all([
    HabitLog.countDocuments({ userId }),
    Habit.find({ userId, isArchived: false }).select('_id'),
  ]);

  let maxStreakAcrossHabits = 0;
  for (const habit of activeHabits) {
    const logs = await HabitLog.find({ userId, habitId: habit._id }).select('dateKey');
    const dateKeys = logs.map((l) => l.dateKey);
    const { maxStreak } = calculateStreak(dateKeys);
    if (maxStreak > maxStreakAcrossHabits) {
      maxStreakAcrossHabits = maxStreak;
    }
  }

  const levelProgress = getLevelProgress(user.xp || 0);

  return {
    uid: user.uid,
    name: user.name,
    avatar: user.avatar,
    xp: user.xp || 0,
    level: user.level || 1,
    progress: levelProgress,
    stats: {
      totalCompletions,
      bestStreak: maxStreakAcrossHabits,
      unlockedBadgesCount: user.badges?.length || 0,
    },
    badges: user.badges?.map((b) => ({
      badgeId: b.badgeId.toString(),
      unlockedAt: b.unlockedAt,
    })) || [],
    memberSince: user.createdAt,
  };
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (input.name !== undefined) user.name = input.name;
  if (input.avatar !== undefined) user.avatar = input.avatar;

  if (!user.uid) {
    user.uid = await generateUniqueUID();
  }

  await user.save();
  return formatFullUser(user);
}

export async function changeUserPassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordMatch = await bcrypt.compare(input.currentPassword, user.password);
  if (!isPasswordMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = await bcrypt.hash(input.newPassword, 10);
  await user.save();

  return { message: 'Password changed successfully' };
}
