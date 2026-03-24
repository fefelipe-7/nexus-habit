import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { Project } from '../types';

export function useProjects() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await projectService.getProjects();
      if (error) throw error;
      return data as Project[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Project> }) => 
      projectService.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
