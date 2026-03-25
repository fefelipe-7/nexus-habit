import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { BaseService } from './baseService';

export const projectService = {
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, emojiUrl:emoji_url, color, status, deadline, createdAt:created_at, updatedAt:updated_at')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const userId = await BaseService.getUserId();

    const dbProject = {
      name: project.name,
      description: project.description,
      emoji_url: project.emojiUrl,
      color: project.color,
      deadline: project.deadline || null,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([dbProject])
      .select('id, name, description, emojiUrl:emoji_url, color, status, deadline, createdAt:created_at, updatedAt:updated_at')
      .single();
    return { data, error };
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.emojiUrl) dbUpdates.emoji_url = updates.emojiUrl;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, name, description, emojiUrl:emoji_url, color, status, deadline, createdAt:created_at, updatedAt:updated_at')
      .single();
    return { data, error };
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  }
};
