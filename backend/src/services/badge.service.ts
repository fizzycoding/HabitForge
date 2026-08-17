import { Badge } from '../models/Badge.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { AppError } from '../middleware/error.js';

export interface BadgeSeedData {
  name: string;
  description: string;
  icon: string;
  requirementType: 'streak' | 'total_completions' | 'level' | 'habits_created';
  requirementValue: number;
}

export const PREDEFINED_BADGES: BadgeSeedData[] = [
  // Habit Creation Badges
  { name: 'Habit Starter', description: 'Created your first habit', icon: 'plus-circle', requirementType: 'habits_created', requirementValue: 1 },
  { name: 'Habit Builder', description: 'Created 3 habits', icon: 'layers', requirementType: 'habits_created', requirementValue: 3 },
  { name: 'Habit Architect', description: 'Created 5 habits', icon: 'grid', requirementType: 'habits_created', requirementValue: 5 },
  { name: 'Habit Mastermind', description: 'Created 10 habits', icon: 'cpu', requirementType: 'habits_created', requirementValue: 10 },

  // Habit Completion Badges
  { name: 'First Step', description: 'Completed your very first habit', icon: 'footsteps', requirementType: 'total_completions', requirementValue: 1 },
  { name: 'Getting Started', description: 'Completed habits 5 times', icon: 'check-circle', requirementType: 'total_completions', requirementValue: 5 },
  { name: 'Double Digits', description: 'Completed habits 10 times', icon: 'check-square', requirementType: 'total_completions', requirementValue: 10 },
  { name: 'Quarter Century', description: 'Completed habits 25 times', icon: 'award', requirementType: 'total_completions', requirementValue: 25 },
  { name: 'Half Century', description: 'Completed habits 50 times', icon: 'shield-check', requirementType: 'total_completions', requirementValue: 50 },
  { name: 'Century Club', description: 'Completed habits 100 times', icon: 'trophy', requirementType: 'total_completions', requirementValue: 100 },

  // Streak Badges
  { name: 'On Fire', description: 'Reached a 3-day habit streak', icon: 'flame', requirementType: 'streak', requirementValue: 3 },
  { name: 'Weekly Warrior', description: 'Reached a 7-day habit streak', icon: 'zap', requirementType: 'streak', requirementValue: 7 },
  { name: 'Fortnight Fighter', description: 'Reached a 14-day habit streak', icon: 'swords', requirementType: 'streak', requirementValue: 14 },
  { name: 'Monthly Legend', description: 'Reached a 30-day habit streak', icon: 'star', requirementType: 'streak', requirementValue: 30 },
  { name: 'Unstoppable', description: 'Reached an epic 100-day streak', icon: 'infinity', requirementType: 'streak', requirementValue: 100 },

  // Level Badges
  { name: 'Novice Explorer', description: 'Reached Level 2', icon: 'user', requirementType: 'level', requirementValue: 2 },
  { name: 'Rising Star', description: 'Reached Level 5', icon: 'sparkles', requirementType: 'level', requirementValue: 5 },
  { name: 'Forge Veteran', description: 'Reached Level 10', icon: 'shield', requirementType: 'level', requirementValue: 10 },
  { name: 'Grandmaster', description: 'Reached Level 25', icon: 'crown', requirementType: 'level', requirementValue: 25 },
];

export async function ensureBadgesSeeded() {
  for (const badge of PREDEFINED_BADGES) {
    await Badge.findOneAndUpdate(
      { name: badge.name },
      { $setOnInsert: badge },
      { upsert: true },
    );
  }
}


export async function getUserBadges(userId: string) {
  await ensureBadgesSeeded();

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const allBadges = await Badge.find().sort({ requirementType: 1, requirementValue: 1 });

  const unlockedMap = new Map<string, Date>();
  for (const b of user.badges || []) {
    unlockedMap.set(b.badgeId.toString(), b.unlockedAt);
  }

  return allBadges.map((badge) => {
    const isUnlocked = unlockedMap.has(badge._id.toString());
    return {
      ...badge.toJSON(),
      isUnlocked,
      unlockedAt: unlockedMap.get(badge._id.toString()) || null,
    };
  });
}


async function awardEligibleBadges(
  userId: string,
  requirementType: 'streak' | 'total_completions' | 'level' | 'habits_created',
  currentValue: number,
) {
  await ensureBadgesSeeded();

  const user = await User.findById(userId);
  if (!user) return [];

  const unlockedBadgeIds = new Set((user.badges || []).map((b) => b.badgeId.toString()));
  const candidateBadges = await Badge.find({
    requirementType,
    requirementValue: { $lte: currentValue },
  });

  const newlyUnlockedBadges = [];

  for (const badge of candidateBadges) {
    const badgeMongoIdStr = badge._id.toString();
    if (!unlockedBadgeIds.has(badgeMongoIdStr)) {
      user.badges.push({
        badgeId: badge._id as any,
        unlockedAt: new Date(),
      });
      newlyUnlockedBadges.push(badge.toJSON());
    }
  }

  if (newlyUnlockedBadges.length > 0) {
    await user.save();
  }

  return newlyUnlockedBadges;
}

export async function checkHabitBadge(userId: string) {
  const totalHabitsCreated = await Habit.countDocuments({ userId });
  return awardEligibleBadges(userId, 'habits_created', totalHabitsCreated);
}

export async function checkHabitCompleteBadge(userId: string) {
  const totalCompletions = await HabitLog.countDocuments({ userId });
  return awardEligibleBadges(userId, 'total_completions', totalCompletions);
}

export async function checkStreakBadge(userId: string, currentStreak: number) {
  return awardEligibleBadges(userId, 'streak', currentStreak);
}

export async function checkLevelBadge(userId: string, currentLevel: number) {
  return awardEligibleBadges(userId, 'level', currentLevel);
}
