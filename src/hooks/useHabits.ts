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
    mutationFn: ({ habitId, date }: { habitId: string, date: string }) => 
      habitService.toggleCompletion(habitId, date),
    // Optimistic Update
    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: ['completions'] });
      const previousCompletions = queryClient.getQueryData(['completions']);

      queryClient.setQueryData(['completions'], (old: any[] | undefined) => {
        if (!old) return [];
        const exists = old.find(c => c.habit_id === habitId && c.date === date);
        if (exists) {
          return old.filter(c => c.id !== exists.id);
        } else {
          return [...old, { id: 'temp-' + Date.now(), habit_id: habitId, date }];
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
