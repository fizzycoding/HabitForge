import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../api/habits.js';
import { useAuth } from '../context/AuthContext.js';
import type { Habit } from '../types/index.js';

export function useHabits(filter: 'all' | 'daily' | 'weekly' | 'archived' = 'all') {
  return useQuery({
    queryKey: ['habits', filter],
    queryFn: async () => {
      const statusParam = filter === 'archived' ? 'archived' : 'all';
      const res = await habitsApi.getAll(statusParam);
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['badges'] });
    refreshUser();
  };

  const createHabit = useMutation({
    mutationFn: (data: any) => habitsApi.create(data),
    onSuccess: invalidate,
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
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      isCompleted ? habitsApi.uncomplete(id) : habitsApi.complete(id),

    // ⚡ Optimistic Update: Flips checkbox state in 0ms BEFORE network request completes!
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });

      const previousHabitsQueries = queryClient.getQueriesData<Habit[]>({ queryKey: ['habits'] });

      queryClient.setQueriesData<Habit[]>({ queryKey: ['habits'] }, (old) => {
        if (!old) return [];
        return old.map((habit) => {
          if (habit.id === id) {
            const nextState = !isCompleted;
            const currentStreak = Math.max(0, (habit.currentStreak || 0) + (nextState ? 1 : -1));
            return {
              ...habit,
              isCompletedToday: nextState,
              currentStreak,
            };
          }
          return habit;
        });
      });

      return { previousHabitsQueries };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousHabitsQueries) {
        context.previousHabitsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      refreshUser();
    },
  });

  return {
    createHabit,
    updateHabit,
    deleteHabit,
    toggleComplete,
  };
}
