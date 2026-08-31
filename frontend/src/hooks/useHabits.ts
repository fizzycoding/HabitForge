import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../api/habits.js';
import { useAuth } from '../context/AuthContext.js';
import { useCelebration } from '../context/CelebrationContext.js';
import { playXpSound } from '../utils/audio.js';
import { triggerConfetti } from '../utils/confetti.js';

export function useHabits(filter: 'all' | 'daily' | 'weekly' = 'all') {
  return useQuery({
    queryKey: ['habits', filter],
    queryFn: async () => {
      const res = await habitsApi.getAll('all');
      let filtered = res.habits;
      if (filter === 'daily') filtered = res.habits.filter((h) => h.frequency === 'daily');
      if (filter === 'weekly') filtered = res.habits.filter((h) => h.frequency === 'weekly');
      return filtered;
    },
  });
}

export function useHabitMutations() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { triggerLevelUp, triggerBadgeUnlock, triggerXpGain } = useCelebration();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['badges'] });
    refreshUser();
  };

  const createHabit = useMutation({
    mutationFn: (data: any) => habitsApi.create(data),
    onSuccess: (res: any) => {
      if (res?.newlyUnlockedBadges?.length > 0) {
        triggerBadgeUnlock(res.newlyUnlockedBadges[0]);
      }
      invalidate();
    },
  });

  const updateHabit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => habitsApi.update(id, data),
    onSuccess: invalidate,
  });

  const deleteHabit = useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: invalidate,
  });

  const toggleComplete = useMutation({
    mutationFn: ({ id }: { id: string; isCompleted?: boolean; habitName?: string }) =>
      habitsApi.complete(id),

    onSuccess: (res: any, variables) => {
      playXpSound();
      triggerConfetti();

      triggerXpGain({
        xp: res?.xpGained || 20,
        habitName: variables?.habitName,
        streak: res?.streak?.currentStreak,
      });

      if (res?.isLevelUp) {
        triggerLevelUp(res.newLevel);
      } else if (res?.newlyUnlockedBadges?.length > 0) {
        triggerBadgeUnlock(res.newlyUnlockedBadges[0]);
      }
      invalidate();
    },
  });

  return {
    createHabit,
    updateHabit,
    deleteHabit,
    toggleComplete,
  };
}
