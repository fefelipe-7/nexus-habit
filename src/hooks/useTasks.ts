import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { Task } from '../types';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) => 
      taskService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createTask = useCallback((t: Partial<Task>) => createTaskMutation.mutateAsync(t), [createTaskMutation]);
  const updateTask = useCallback((args: { id: string, updates: Partial<Task> }) => updateTaskMutation.mutateAsync(args), [updateTaskMutation]);
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
