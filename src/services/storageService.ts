import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadProfileImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getPublicUrl(path: string) {
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(path);
    return publicUrl;
  }
};
