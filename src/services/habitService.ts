import { supabase } from '../lib/supabase';
import { Habit, Completion } from '../types';
import { BaseService } from './baseService';

export const habitService = {
  async getHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select('id, name, emojiUrl:emoji_url, color, repeatDays:repeat_days, reminders, categoryId:category_id, duration, unit, createdAt:created_at, streak')
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async createHabit(habit: Omit<Habit, 'id' | 'streak'>) {
    const userId = await BaseService.getUserId();

    const dbHabit = {
      name: habit.name,
      emoji_url: habit.emojiUrl,
      color: habit.color,
      repeat_days: habit.repeatDays,
      reminders: habit.reminders,
      category_id: habit.categoryId || 'default',
      duration: habit.duration,
      unit: habit.unit,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([dbHabit])
      .select('id, name, emojiUrl:emoji_url, color, repeatDays:repeat_days, reminders, categoryId:category_id, duration, unit, createdAt:created_at, streak')
      .single();
    return { data, error };
  },

  async updateHabit(id: string, updates: Partial<Habit>) {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.emojiUrl) dbUpdates.emoji_url = updates.emojiUrl;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.repeatDays) dbUpdates.repeat_days = updates.repeatDays;
    if (updates.reminders !== undefined) dbUpdates.reminders = updates.reminders;
    if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.unit) dbUpdates.unit = updates.unit;

    const { data, error } = await supabase
      .from('habits')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, name, emojiUrl:emoji_url, color, repeatDays:repeat_days, reminders, categoryId:category_id, duration, unit, createdAt:created_at, streak')
      .single();
    return { data, error };
  },

  async deleteHabit(id: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    return { error };
  },

  async getCompletions() {
    const { data, error } = await supabase
      .from('completions')
      .select('habitId:habit_id, date, amount');
    return { data, error };
  },

  async toggleCompletion(habitId: string, date: string, amount?: number) {
    const userId = await BaseService.getUserId();

    // Check if completion exists
    const { data: existing } = await supabase
      .from('completions')
      .select('id, amount')
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    if (existing) {
      if (amount !== undefined) {
          const { data, error } = await supabase
            .from('completions')
            .update({ amount })
            .eq('id', existing.id)
            .select()
            .single();
          return { action: 'updated', data, error };
      }

      const { data: habit } = await supabase.from('habits').select('duration').eq('id', habitId).single();
      if (existing.amount < (habit?.duration || 1)) {
          const { data, error } = await supabase
            .from('completions')
            .update({ amount: habit?.duration || 1 })
            .eq('id', existing.id)
            .select()
            .single();
          return { action: 'updated', data, error };
      }

      const { error } = await supabase
        .from('completions')
        .delete()
        .eq('id', existing.id);
      return { action: 'deleted', error };
    } else {
      const { data: habit } = await supabase.from('habits').select('duration').eq('id', habitId).single();
      const initialAmount = amount !== undefined ? amount : (habit?.duration || 1);

      const { data, error } = await supabase
        .from('completions')
        .insert([{ habit_id: habitId, date, user_id: userId, amount: initialAmount }])
        .select()
        .single();
      return { action: 'created', data, error };
    }
  },

  async logHabitProgress(habitId: string, date: string, amount: number) {
    return this.toggleCompletion(habitId, date, amount);
  }
};
