import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import {
  calculateXP,
  calculateLevel,
  calculateStreak,
  getLevelProgress,
} from '../utils/gamification.js';
import type { CreateHabitInput, UpdateHabitInput } from '../schemas/habit.schema.js';


export async function createHabit(userId: string, input: CreateHabitInput) {
  const habit = await Habit.create({
    userId,
    ...input,
  });
  return habit;
}

export async function getUserHabits(
  userId: string,
  filter: { status?: 'active' | 'archived' | 'all'; includeArchived?: boolean } = {},
) {
  const query: { userId: string; isArchived?: boolean } = { userId };

  if (filter.status === 'archived') {
    query.isArchived = true;
  } else if (filter.status === 'active' || (!filter.includeArchived && filter.status !== 'all')) {
    query.isArchived = false;
  }

  const habits = await Habit.find(query).sort({ createdAt: -1 });
  const today = new Date().toISOString().split('T')[0];

  const habitsWithStats = await Promise.all(
    habits.map(async (habit) => {
      const logs = await HabitLog.find({ userId, habitId: habit._id }).select('dateKey');
      const dateKeys = logs.map((log) => log.dateKey);

      const isCompletedToday = dateKeys.includes(today);
      const { currentStreak, maxStreak } = calculateStreak(dateKeys);

      return {
        ...habit.toJSON(),
        isCompletedToday,
        currentStreak,
        maxStreak,
        totalCompletions: logs.length,
      };
    }),
  );

  return habitsWithStats;
}

export async function getArchivedHabits(userId: string) {
  return getUserHabits(userId, { status: 'archived' });
}

export async function getHabitById(userId: string, habitId: string) {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const today = new Date().toISOString().split('T')[0];
  const logs = await HabitLog.find({ userId, habitId }).select('dateKey completedAt');
  const dateKeys = logs.map((log) => log.dateKey);

  const isCompletedToday = dateKeys.includes(today);
  const { currentStreak, maxStreak } = calculateStreak(dateKeys);

  return {
    ...habit.toJSON(),
    isCompletedToday,
    currentStreak,
    maxStreak,
    totalCompletions: logs.length,
    recentLogs: logs.slice(-10),
  };
}

export async function updateHabit(userId: string, habitId: string, input: UpdateHabitInput) {
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { $set: input },
    { new: true, runValidators: true },
  );

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  return habit;
}

export async function deleteHabit(userId: string, habitId: string) {
  const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  await HabitLog.deleteMany({ habitId, userId });

  return { message: 'Habit deleted successfully' };
}

export async function archiveHabit(userId: string, habitId: string) {
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { isArchived: true },
    { new: true },
  );

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  return habit;
}

export async function unarchiveHabit(userId: string, habitId: string) {
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { isArchived: false },
    { new: true },
  );

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  return habit;
}

export async function markComplete(userId: string, habitId: string, targetDateKey?: string) {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const dateKey = targetDateKey || new Date().toISOString().split('T')[0];

  const existingLog = await HabitLog.findOne({ userId, habitId, dateKey });
  if (existingLog) {
    throw new AppError('Habit already marked as complete for this date', 400);
  }

  const log = await HabitLog.create({
    userId,
    habitId,
    dateKey,
    completedAt: new Date(),
  });

  const allLogs = await HabitLog.find({ userId, habitId }).select('dateKey');
  const dateKeys = allLogs.map((l) => l.dateKey);
  const { currentStreak, maxStreak } = calculateStreak(dateKeys);

  const xpGained = calculateXP(currentStreak);

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const newXP = (user.xp || 0) + xpGained;
  const newLevel = calculateLevel(newXP);

  user.xp = newXP;
  user.level = newLevel;
  await user.save();

  const levelProgress = getLevelProgress(newXP);

  return {
    message: 'Habit marked as complete!',
    log,
    xpGained,
    streak: { currentStreak, maxStreak },
    user: {
      id: user._id.toString(),
      xp: user.xp,
      level: user.level,
      progress: levelProgress,
    },
  };
}

export async function undoComplete(userId: string, habitId: string, targetDateKey?: string) {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const dateKey = targetDateKey || new Date().toISOString().split('T')[0];

  const deletedLog = await HabitLog.findOneAndDelete({ userId, habitId, dateKey });
  if (!deletedLog) {
    throw new AppError('Completion log not found for this date', 404);
  }

  const remainingLogs = await HabitLog.find({ userId, habitId }).select('dateKey');
  const dateKeys = remainingLogs.map((l) => l.dateKey);
  const { currentStreak, maxStreak } = calculateStreak(dateKeys);

  const user = await User.findById(userId);
  if (user) {
    const xpDeducted = Math.min(user.xp || 0, calculateXP(0));
    const newXP = Math.max(0, (user.xp || 0) - xpDeducted);
    const newLevel = calculateLevel(newXP);

    user.xp = newXP;
    user.level = newLevel;
    await user.save();
  }

  const updatedUser = await User.findById(userId);
  const levelProgress = updatedUser ? getLevelProgress(updatedUser.xp || 0) : null;

  return {
    message: 'Habit completion undone successfully',
    streak: { currentStreak, maxStreak },
    user: updatedUser
      ? {
          id: updatedUser._id.toString(),
          xp: updatedUser.xp,
          level: updatedUser.level,
          progress: levelProgress,
        }
      : null,
  };
}
