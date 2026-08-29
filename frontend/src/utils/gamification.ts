/**
 * HabitForge Gamification Engine - XP, Level, and Streak Mathematics
 * Dedicated utility module for frontend components and rendering logic.
 */

export const BASE_XP_PER_HABIT = 10;
export const XP_PER_STREAK_DAY = 2;
export const MAX_STREAK_BONUS_XP = 50;

export function calculateXP(streakLength: number = 0, baseXP: number = BASE_XP_PER_HABIT): number {
  const streakBonus = Math.min(streakLength * XP_PER_STREAK_DAY, MAX_STREAK_BONUS_XP);
  return baseXP + streakBonus;
}

export function calculateLevel(totalXP: number = 0): number {
  if (totalXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 25)) + 1;
}

export function getXPForNextLevel(level: number = 0): number {
  if (level <= 0) return 0;
  return level * level * 25;
}

export interface LevelProgress {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

export function getLevelProgress(totalXP: number = 0): LevelProgress {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForNextLevel(level - 1);
  const xpForNextLevel = getXPForNextLevel(level);
  const xpInCurrentLevel = Math.max(0, totalXP - xpForCurrentLevel);
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage =
    xpNeededForNextLevel > 0
      ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
      : 100;

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage,
  };
}

export function calculateStreak(dateKeys: string[] = [], timeZone?: string): { currentStreak: number; maxStreak: number } {
  if (!dateKeys || dateKeys.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  const uniqueDates = Array.from(new Set(dateKeys)).sort((a, b) => b.localeCompare(a));
  const now = new Date();
  let today = now.toISOString().split('T')[0];
  let yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  let yesterday = yesterdayDate.toISOString().split('T')[0];

  if (timeZone) {
    try {
      const options: Intl.DateTimeFormatOptions = { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' };
      const formatter = new Intl.DateTimeFormat('en-CA', options);
      today = formatter.format(now);

      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      yesterday = formatter.format(yest);
    } catch (e) {
      // Fallback to ISO string standard
    }
  }

  let currentStreak = 0;
  let maxStreak = 0;

  const startsWithToday = uniqueDates[0] === today;
  const startsWithYesterday = uniqueDates[0] === yesterday;

  if (startsWithToday || startsWithYesterday) {
    let checkDate = new Date(uniqueDates[0]);

    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr);
      const diffTime = checkDate.getTime() - currentDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays <= 1) {
        currentStreak++;
        checkDate = currentDate;
      } else {
        break;
      }
    }
  }

  let tempStreak = 1;
  maxStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const d1 = new Date(uniqueDates[i]);
    const d2 = new Date(uniqueDates[i + 1]);
    const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  return { currentStreak, maxStreak };
}
