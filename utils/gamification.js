/**
 * HabitForge Gamification Engine - XP, Level, and Streak Mathematics
 * Isolated utility module independent of API routes and UI components.
 */

// XP Constants
export const BASE_XP_PER_HABIT = 10;
export const XP_PER_STREAK_DAY = 2;
export const MAX_STREAK_BONUS_XP = 50;

/**
 * Calculates total XP gained for completing a habit on a given streak day.
 * Formula: Base XP + min(Streak * BonusPerDay, MaxBonus)
 * 
 * @param {number} streakLength - Current active consecutive streak length
 * @param {number} baseXP - Base XP reward (default 10)
 * @returns {number} Total XP earned
 */
export function calculateXP(streakLength = 0, baseXP = BASE_XP_PER_HABIT) {
  const streakBonus = Math.min(streakLength * XP_PER_STREAK_DAY, MAX_STREAK_BONUS_XP);
  return baseXP + streakBonus;
}

/**
 * Calculates current User Level based on total accumulated XP.
 * Formula: Level = floor( sqrt( TotalXP / 25 ) ) + 1
 * 
 * @param {number} totalXP 
 * @returns {number} Current level (minimum 1)
 */
export function calculateLevel(totalXP = 0) {
  if (totalXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 25)) + 1;
}

/**
 * Returns total cumulative XP required to reach the target level.
 * Formula: Level^2 * 25
 * 
 * @param {number} level 
 * @returns {number} XP threshold
 */
export function getXPForNextLevel(level = 0) {
  if (level <= 0) return 0;
  return level * level * 25;
}

/**
 * Calculates granular user level progress information for UI rendering.
 * 
 * @param {number} totalXP 
 * @returns {Object} Progress breakdown
 */
export function getLevelProgress(totalXP = 0) {
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

/**
 * Streak Calculation Algorithm
 * Handles consecutive daily logs, missed days, and timezone date key normalization.
 * 
 * Rules:
 * 1. Takes an array of date keys ('YYYY-MM-DD').
 * 2. Deduplicates & sorts dates in descending order (newest first).
 * 3. Active Streak:
 *    - Valid if newest log is TODAY or YESTERDAY.
 *    - Increments for each consecutive calendar day.
 *    - Resets to 0 if more than 1 day is missed between today/yesterday and last completed date.
 * 4. Max Streak:
 *    - Tracks the longest unbroken streak run across the entire historical log array.
 * 
 * @param {string[]} dateKeys - Array of completed date keys formatted as YYYY-MM-DD
 * @param {string} [timeZone] - Optional IANA timezone string for local date evaluation
 * @returns {{ currentStreak: number, maxStreak: number }}
 */
export function calculateStreak(dateKeys = [], timeZone) {
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
      const options = { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' };
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
