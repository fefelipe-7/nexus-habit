import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { Profile } from '../types';
import { useAuth } from './useAuth';

export function useProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await profileService.getProfile();
      if (error) throw error;
      
      const profile = data as Profile;
      // Ensure settings has defaults
      if (!profile?.settings || Object.keys(profile.settings).length === 0) {
        profile.settings = {
          notifications: true,
          theme: 'light',
          dailyHabitGoal: 3,
          showMascotPhrases: true
        };
      }
      return profile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache profile for 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Profile>) => profileService.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data.data);
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
    isLoading: profileQuery.isFetching && !profileQuery.data,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending || uploadAvatarMutation.isPending,
  };
}
