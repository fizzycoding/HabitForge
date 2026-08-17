export interface Subscription {
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate?: string;
  endDate?: string;
}

export interface UserBadge {
  badgeId: string;
  unlockedAt: string;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  progress?: {
    level: number;
    currentXP: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    xpInCurrentLevel: number;
    xpNeededForNextLevel: number;
    progressPercentage: number;
  };
  subscription?: Subscription;
  badges?: UserBadge[];
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  icon: string;
  color: string;
  isPredefined?: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  tags?: Tag[];
  isArchived: boolean;
  isCompletedToday?: boolean;
  currentStreak?: number;
  maxStreak?: number;
  totalCompletions?: number;
  createdAt?: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  dateKey: string;
  completedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: 'total_completions' | 'streak' | 'level' | 'habits_created';
  requirementValue: number;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
}

export interface DashboardMetrics {
  totalActiveHabits: number;
  totalArchivedHabits: number;
  totalCompletions: number;
  todayCompletionsCount: number;
  todayCompletionRate: number;
  activeStreaksCount: number;
  bestStreak: number;
  unlockedBadgesCount: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: number;
  dayOfWeek: number;
}

export interface MonthlyReportDay {
  date: string;
  dayNumber: number;
  dayOfWeek: string;
  completedCount: number;
  totalActiveHabits: number;
  completionRate: number;
  isPerfectDay: boolean;
  completedHabits: {
    id: string;
    name: string;
    color: string;
    icon: string;
    completedAt: string;
  }[];
}
