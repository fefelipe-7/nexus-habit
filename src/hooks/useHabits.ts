import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../services/habitService';
import { Habit } from '../types';
import { calculateGlobalStats } from '../utils/stats';

export function useHabits() {
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await habitService.getHabits();
      if (error) throw error;
      return data as Habit[];
    },
  });

  const completionsQuery = useQuery({
    queryKey: ['completions'],
    queryFn: async () => {
      const { data, error } = await habitService.getCompletions();
      if (error) throw error;
      return data;
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: habitService.createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Habit> }) => 
      habitService.updateHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: habitService.deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: ({ habitId, date, amount }: { habitId: string, date: string, amount?: number }) => 
      habitService.toggleCompletion(habitId, date, amount),
    // Optimistic Update
    onMutate: async ({ habitId, date, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['completions'] });
      const previousCompletions = queryClient.getQueryData(['completions']);

      queryClient.setQueryData(['completions'], (old: any[] | undefined) => {
        if (!old) return [];
        const exists = old.find(c => c.habitId === habitId && c.date === date);
        if (exists) {
          if (amount !== undefined) {
              return old.map(c => c.habitId === habitId && c.date === date ? { ...c, amount } : c);
          }
          return old.filter(c => !(c.habitId === habitId && c.date === date));
        } else {
          return [...old, { id: 'temp-' + Date.now(), habitId, date, amount: amount ?? 1 }];
        }
      });

      return { previousCompletions };
    },
    onError: (_err, _newVal, context) => {
      queryClient.setQueryData(['completions'], context?.previousCompletions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
    },
  });

  const stats = calculateGlobalStats(habitsQuery.data ?? [], completionsQuery.data ?? []);

  return {
    habits: habitsQuery.data ?? [],
    completions: completionsQuery.data ?? [],
    stats,
    isLoading: habitsQuery.isLoading || completionsQuery.isLoading,
    createHabit: createHabitMutation.mutateAsync,
    updateHabit: updateHabitMutation.mutateAsync,
    deleteHabit: deleteHabitMutation.mutateAsync,
    toggleCompletion: toggleCompletionMutation.mutateAsync,
  };
}
