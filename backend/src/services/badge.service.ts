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
  { name: 'Habit Starter', description: 'Created your first habit', icon: '/badges/habit_starter_badge.png', requirementType: 'habits_created', requirementValue: 1 },
  { name: 'Habit Builder', description: 'Created 3 habits', icon: '/badges/habit_builder_badge.png', requirementType: 'habits_created', requirementValue: 3 },
  { name: 'Habit Architect', description: 'Created 5 habits', icon: '/badges/habit_architect_badge.png', requirementType: 'habits_created', requirementValue: 5 },
  { name: 'Habit Mastermind', description: 'Created 10 habits', icon: '/badges/habit_mastermind_badge.png', requirementType: 'habits_created', requirementValue: 10 },

  // Habit Completion Badges
  { name: 'First Step', description: 'Completed your very first habit', icon: '/badges/first_step_badge.png', requirementType: 'total_completions', requirementValue: 1 },
  { name: 'Getting Started', description: 'Completed habits 5 times', icon: '/badges/getting_started_badge.png', requirementType: 'total_completions', requirementValue: 5 },
  { name: 'Double Digits', description: 'Completed habits 10 times', icon: '/badges/double_badge.png', requirementType: 'total_completions', requirementValue: 10 },
  { name: 'Quarter Century', description: 'Completed habits 25 times', icon: '/badges/quater_century_badge.png', requirementType: 'total_completions', requirementValue: 25 },
  { name: 'Half Century', description: 'Completed habits 50 times', icon: '/badges/half_century_badge.png', requirementType: 'total_completions', requirementValue: 50 },
  { name: 'Century Club', description: 'Completed habits 100 times', icon: '/badges/century_club_badge.png', requirementType: 'total_completions', requirementValue: 100 },

  // Streak Badges
  { name: 'On Fire', description: 'Reached a 3-day habit streak', icon: '/badges/on_fire_badge.png', requirementType: 'streak', requirementValue: 3 },
  { name: 'Weekly Warrior', description: 'Reached a 7-day habit streak', icon: '/badges/weekly_warrior_badge.png', requirementType: 'streak', requirementValue: 7 },
  { name: 'Fortnight Fighter', description: 'Reached a 14-day habit streak', icon: '/badges/fortnight_fighter_badge.png', requirementType: 'streak', requirementValue: 14 },
  { name: 'Monthly Legend', description: 'Reached a 30-day habit streak', icon: '/badges/monthly_legend_badge.png', requirementType: 'streak', requirementValue: 30 },
  { name: 'Unstoppable', description: 'Reached an epic 100-day streak', icon: '/badges/unstoppable_badge.png', requirementType: 'streak', requirementValue: 100 },

  // Level Badges
  { name: 'Novice Explorer', description: 'Reached Level 2', icon: '/badges/novice_explorer_badge.png', requirementType: 'level', requirementValue: 2 },
  { name: 'Rising Star', description: 'Reached Level 5', icon: '/badges/raising_star_badge.png', requirementType: 'level', requirementValue: 5 },
  { name: 'Forge Veteran', description: 'Reached Level 10', icon: '/badges/forge_veteran_badge.png', requirementType: 'level', requirementValue: 10 },
  { name: 'Grandmaster', description: 'Reached Level 25', icon: '/badges/grandmaster_badge.png', requirementType: 'level', requirementValue: 25 },
];

export async function ensureBadgesSeeded() {
  for (const badge of PREDEFINED_BADGES) {
    await Badge.findOneAndUpdate(
      { name: badge.name },
      { $set: badge },
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
