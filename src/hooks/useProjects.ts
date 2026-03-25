import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { useAuth } from './useAuth';

export function useProjects() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await projectService.getProjects();
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Project> }) => 
      projectService.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  const createProject = useCallback((p: Partial<Project>) => createProjectMutation.mutateAsync(p), [createProjectMutation]);
  const updateProject = useCallback((args: { id: string, updates: Partial<Project> }) => updateProjectMutation.mutateAsync(args), [updateProjectMutation]);
  const deleteProject = useCallback((id: string) => deleteProjectMutation.mutateAsync(id), [deleteProjectMutation]);

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
}
