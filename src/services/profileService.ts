import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export const profileService = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .select('id, displayName:display_name, bio, avatarUrl:avatar_url, settings, updatedAt:updated_at')
      .eq('id', user.id)
      .single();

    return { data: data as Profile | null, error };
  },

  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbUpdates: any = {};
    if (updates.displayName) dbUpdates.display_name = updates.displayName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.settings) dbUpdates.settings = updates.settings;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select('id, displayName:display_name, bio, avatarUrl:avatar_url, settings, updatedAt:updated_at')
      .single();

    return { data: data as Profile | null, error };
  },

  async uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { publicUrl };
  }
};
