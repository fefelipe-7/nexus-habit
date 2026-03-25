import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { convertToWebP } from '../utils/image';
import { BaseService } from './baseService';

export const profileService = {
  async getProfile() {
    const userId = await BaseService.getUserId();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, displayName:display_name, bio, avatarUrl:avatar_url, settings, updatedAt:updated_at')
      .eq('id', userId)
      .single();

    return { data: data as Profile | null, error };
  },

  async updateProfile(updates: Partial<Profile>) {
    const userId = await BaseService.getUserId();

    const dbUpdates: any = {};
    if (updates.displayName) dbUpdates.display_name = updates.displayName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.settings) dbUpdates.settings = updates.settings;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('id, displayName:display_name, bio, avatarUrl:avatar_url, settings, updatedAt:updated_at')
      .single();

    return { data: data as Profile | null, error };
  },

  async uploadAvatar(file: File) {
    const userId = await BaseService.getUserId();

    // 1. Convert to WebP
    const webpBlob = await convertToWebP(file);
    const fileName = `${userId}/${Date.now()}.webp`;
    const filePath = `${fileName}`;

    // 2. Get current profile to find old avatar path
    const { data: profile } = await this.getProfile();
    const oldAvatarUrl = profile?.avatarUrl;

    // 3. Delete old avatar if it exists in storage
    if (oldAvatarUrl && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
        const oldPath = oldAvatarUrl.split('/avatars/').pop();
        if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([oldPath]);
        }
    }

    // 4. Upload new WebP
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, webpBlob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { publicUrl };
  }
};
