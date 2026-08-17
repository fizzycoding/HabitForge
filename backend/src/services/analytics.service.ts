import mongoose from 'mongoose';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { calculateStreak, getLevelProgress } from '../utils/gamification.js';


//  Dashboard Overview & Summary Metrics

export async function getDashboardOverview(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const today = new Date().toISOString().split('T')[0];

  const [activeHabitsCount, archivedHabitsCount, totalCompletions, userHabits] =
    await Promise.all([
      Habit.countDocuments({ userId, isArchived: false }),
      Habit.countDocuments({ userId, isArchived: true }),
      HabitLog.countDocuments({ userId }),
      Habit.find({ userId, isArchived: false }).select('_id'),
    ]);

  const activeHabitIds = userHabits.map((h) => h._id);

  const todayLogsCount = await HabitLog.countDocuments({
    userId,
    habitId: { $in: activeHabitIds },
    dateKey: today,
  });

  const todayCompletionRate =
    activeHabitsCount > 0 ? Math.round((todayLogsCount / activeHabitsCount) * 100) : 0;

  let maxStreakAcrossHabits = 0;
  let activeStreaksCount = 0;

  for (const habitId of activeHabitIds) {
    const logs = await HabitLog.find({ userId, habitId }).select('dateKey');
    const dateKeys = logs.map((l) => l.dateKey);
    const { currentStreak, maxStreak } = calculateStreak(dateKeys);

    if (currentStreak > 0) {
      activeStreaksCount++;
    }
    if (maxStreak > maxStreakAcrossHabits) {
      maxStreakAcrossHabits = maxStreak;
    }
  }

  const levelProgress = getLevelProgress(user.xp || 0);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      xp: user.xp || 0,
      level: user.level || 1,
      progress: levelProgress,
    },
    metrics: {
      totalActiveHabits: activeHabitsCount,
      totalArchivedHabits: archivedHabitsCount,
      totalCompletions,
      todayCompletionsCount: todayLogsCount,
      todayCompletionRate,
      activeStreaksCount,
      bestStreak: maxStreakAcrossHabits,
      unlockedBadgesCount: user.badges?.length || 0,
    },
  };
}



// GitHub-Style 365-Day Yearly Activity Heatmap

export async function getYearlyHeatmap(userId: string) {
  const endDateObj = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 364);

  const startDateKey = startDateObj.toISOString().split('T')[0];
  const endDateKey = endDateObj.toISOString().split('T')[0];

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const dailyCounts = await HabitLog.aggregate([
    {
      $match: {
        userId: userObjectId,
        dateKey: { $gte: startDateKey, $lte: endDateKey },
      },
    },
    {
      $group: {
        _id: '$dateKey',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>();
  let totalCompletions = 0;

  for (const item of dailyCounts) {
    countMap.set(item._id, item.count);
    totalCompletions += item.count;
  }

  const heatmap = [];
  const current = new Date(startDateObj);

  while (current <= endDateObj) {
    const dateStr = current.toISOString().split('T')[0];
    const count = countMap.get(dateStr) || 0;

    let intensity = 0;
    if (count > 0 && count <= 2) intensity = 1;
    else if (count >= 3 && count <= 4) intensity = 2;
    else if (count >= 5 && count <= 6) intensity = 3;
    else if (count >= 7) intensity = 4;

    heatmap.push({
      date: dateStr,
      count,
      intensity,
      dayOfWeek: current.getDay(),
    });

    current.setDate(current.getDate() + 1);
  }

  return {
    totalCompletions,
    startDate: startDateKey,
    endDate: endDateKey,
    heatmap,
  };
}

export async function getMonthlyChartAnalysis(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const activeHabitsCount = await Habit.countDocuments({ userId, isArchived: false });

  const monthlyLogs = await HabitLog.aggregate([
    {
      $match: {
        userId: userObjectId,
      },
    },
    {
      $project: {
        yearMonth: { $substr: ['$dateKey', 0, 7] }, // "YYYY-MM"
      },
    },
    {
      $group: {
        _id: '$yearMonth',
        totalCompletions: { $sum: 1 },
      },
    },
  ]);

  const logMap = new Map<string, number>();
  for (const item of monthlyLogs) {
    logMap.set(item._id, item.totalCompletions);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const yearMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const label = `${monthNames[monthIndex]} ${year}`;

    const totalCompletions = logMap.get(yearMonth) || 0;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const targetCompletions = activeHabitsCount * daysInMonth;

    const completionRate =
      targetCompletions > 0 ? Math.min(100, Math.round((totalCompletions / targetCompletions) * 100)) : 0;

    result.push({
      yearMonth,
      label,
      month: monthNames[monthIndex],
      year,
      totalCompletions,
      activeHabitsCount,
      completionRate,
    });
  }

  return result;
}


export async function getCompletionHistory(userId: string, daysCount: number = 30) {
  const result = [];
  const activeHabitsCount = await Habit.countDocuments({ userId, isArchived: false });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];

    const completionsCount = await HabitLog.countDocuments({ userId, dateKey });
    const completionRate =
      activeHabitsCount > 0
        ? Math.min(100, Math.round((completionsCount / activeHabitsCount) * 100))
        : 0;

    result.push({
      date: dateKey,
      completedCount: completionsCount,
      totalActiveHabits: activeHabitsCount,
      completionRate,
    });
  }

  return result;
}


export async function getHabitsAnalytics(userId: string) {
  const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
  const dateKey30DaysAgo = date30DaysAgo.toISOString().split('T')[0];

  const analytics = await Promise.all(
    habits.map(async (habit) => {
      const logs = await HabitLog.find({ userId, habitId: habit._id }).select(
        'dateKey completedAt',
      );
      const dateKeys = logs.map((l) => l.dateKey);

      const { currentStreak, maxStreak } = calculateStreak(dateKeys);

      const completionsLast30Days = logs.filter((l) => l.dateKey >= dateKey30DaysAgo).length;
      const completionRate30Days = Math.min(100, Math.round((completionsLast30Days / 30) * 100));

      const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

      return {
        id: habit._id.toString(),
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
        frequency: habit.frequency,
        isArchived: habit.isArchived,
        totalCompletions: logs.length,
        completionsLast30Days,
        completionRate30Days,
        currentStreak,
        maxStreak,
        lastCompletedAt: lastLog ? lastLog.completedAt : null,
      };
    }),
  );

  return analytics;
}
