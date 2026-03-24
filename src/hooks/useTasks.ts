import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { Task } from '../types';
import { notificationService } from '../services/notificationService';

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await taskService.getTasks();
      if (error) throw error;
      return data as Task[];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data) notificationService.scheduleTaskReminder(data as Task);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) => 
      taskService.updateTask(id, updates),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data) notificationService.scheduleTaskReminder(data as Task);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notificationService.cancelNotification(id);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: taskService.toggleTask,
    // Optimistic Update
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        if (!old) return [];
        return old.map(t => t.id === taskId ? { 
          ...t, 
          completedAt: t.completedAt ? null : new Date().toISOString() 
        } : t);
      });

      return { previousTasks };
    },
    onError: (_err, _newVal, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    onSettled: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const data = result?.data;
      if (data) {
        if (data.completedAt) {
          notificationService.cancelNotification(data.id);
        } else {
          notificationService.scheduleTaskReminder(data);
        }
      }
    },
  });

  const createTask = useCallback((t: any) => createTaskMutation.mutateAsync(t), [createTaskMutation]);
  const updateTask = useCallback((args: { id: string, updates: any }) => updateTaskMutation.mutateAsync(args), [updateTaskMutation]);
  const deleteTask = useCallback((id: string) => deleteTaskMutation.mutateAsync(id), [deleteTaskMutation]);
  const toggleTask = useCallback((id: string) => toggleTaskMutation.mutateAsync(id), [toggleTaskMutation]);

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
