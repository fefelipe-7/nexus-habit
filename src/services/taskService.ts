import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, name, description, deadline, priority, estimatedTime:estimated_time, emojiUrl:emoji_url, color, createdAt:created_at, completedAt:completed_at, projectId:project_id')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbTask = {
      name: task.name,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      estimated_time: task.estimatedTime,
      emoji_url: task.emojiUrl,
      color: task.color,
      user_id: user.id,
      project_id: task.projectId
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select('id, name, description, deadline, priority, estimatedTime:estimated_time, emojiUrl:emoji_url, color, createdAt:created_at, completedAt:completed_at, projectId:project_id')
      .single();
    return { data, error };
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.deadline) dbUpdates.deadline = updates.deadline;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.estimatedTime) dbUpdates.estimated_time = updates.estimatedTime;
    if (updates.emojiUrl) dbUpdates.emoji_url = updates.emojiUrl;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, name, description, deadline, priority, estimatedTime:estimated_time, emojiUrl:emoji_url, color, createdAt:created_at, completedAt:completed_at, projectId:project_id')
      .single();
    return { data, error };
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    return { error };
  },

  async toggleTask(id: string) {
    const { data: current } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed_at: current?.completed_at ? null : new Date().toISOString() 
      })
      .eq('id', id)
      .select('id, name, description, deadline, priority, estimatedTime:estimated_time, emojiUrl:emoji_url, color, createdAt:created_at, completedAt:completed_at')
      .single();
    
    return { data, error };
  }
};
