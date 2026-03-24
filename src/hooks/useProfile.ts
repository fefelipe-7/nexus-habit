import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { Profile } from '../types';

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await profileService.getProfile();
      if (error) throw error;
      
      const profile = data as Profile;
      // Ensure settings has defaults
      if (!profile.settings || Object.keys(profile.settings).length === 0) {
        profile.settings = {
          notifications: true,
          theme: 'light',
          dailyHabitGoal: 3,
          showMascotPhrases: true
        };
      }
      return profile;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Profile>) => profileService.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.data);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: async (data) => {
      await updateProfileMutation.mutateAsync({ avatarUrl: data.publicUrl });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending || uploadAvatarMutation.isPending,
  };
}
