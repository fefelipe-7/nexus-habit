import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../services/habitService';
import { Habit } from '../types';
import { calculateGlobalStats } from '../utils/stats';
import { notificationService } from '../services/notificationService';
import { useAuth } from './useAuth';

export function useHabits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await habitService.getHabits();
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const completionsQuery = useQuery({
    queryKey: ['completions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await habitService.getCompletions();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createHabitMutation = useMutation({
    mutationFn: habitService.createHabit,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      if (data) notificationService.scheduleHabitReminder(data as Habit);
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Habit> }) => 
      habitService.updateHabit(id, updates),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      if (data) notificationService.scheduleHabitReminder(data as Habit);
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: habitService.deleteHabit,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      notificationService.cancelNotification(id);
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: ({ habitId, date, amount }: { habitId: string, date: string, amount?: number }) => 
      habitService.toggleCompletion(habitId, date, amount),
    onMutate: async ({ habitId, date, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['completions', user?.id] });
      const previousCompletions = queryClient.getQueryData(['completions', user?.id]);

      queryClient.setQueryData(['completions', user?.id], (old: any[] | undefined) => {
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
      queryClient.setQueryData(['completions', user?.id], context?.previousCompletions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['completions', user?.id] });
    },
  });

  const habits = habitsQuery.data ?? [];
  const completions = completionsQuery.data ?? [];

  const stats = useMemo(() => 
    calculateGlobalStats(habits, completions),
    [habits, completions]
  );

  const createHabit = useCallback((h: any) => createHabitMutation.mutateAsync(h), [createHabitMutation]);
  const updateHabit = useCallback((args: { id: string, updates: any }) => updateHabitMutation.mutateAsync(args), [updateHabitMutation]);
  const deleteHabit = useCallback((id: string) => deleteHabitMutation.mutateAsync(id), [deleteHabitMutation]);
  const toggleCompletion = useCallback((args: { habitId: string, date: string, amount?: number }) => toggleCompletionMutation.mutateAsync(args), [toggleCompletionMutation]);

  return {
    habits,
    completions,
    stats,
    isLoading: habitsQuery.isLoading || completionsQuery.isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  };
}
