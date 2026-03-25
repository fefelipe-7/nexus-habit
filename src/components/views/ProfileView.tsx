import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, LogOut, Camera, Loader2, Bell, Ghost, Moon, Target, Check, AlertCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '../../utils/cn';
import { UserSettings } from '../../types';

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

export default function ProfileView({ onBack, onLogout }: Props) {
  const { profile, isLoading, updateProfile, uploadAvatar, isUpdating } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localDailyGoal, setLocalDailyGoal] = useState<number>(3);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (profile?.settings.dailyHabitGoal !== undefined) {
      setLocalDailyGoal(profile.settings.dailyHabitGoal);
    }
  }, [profile?.settings.dailyHabitGoal]);

  // Debounce profile updates for the range input
  useEffect(() => {
    if (profile && localDailyGoal !== profile.settings.dailyHabitGoal) {
      setIsDebouncing(true);
      const timer = setTimeout(() => {
        updateProfile({
          settings: { ...profile.settings, dailyHabitGoal: localDailyGoal }
        }).finally(() => setIsDebouncing(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localDailyGoal, updateProfile, profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!profile) return;
    try {
      await updateProfile({
        settings: { ...profile.settings, ...newSettings }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f6f2] dark:bg-[#121212]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f27d26]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 flex flex-col relative bg-[#f8f6f2] dark:bg-[#121212] scroll-smooth">
      <div className="px-6 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm flex items-center justify-center border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#2d2d2d] dark:text-gray-100" />
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm flex items-center justify-center border border-black/5 dark:border-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-10">Account</h1>

        {/* Profile Card */}
        <div className="flex items-center gap-5 mb-12 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#252525] overflow-hidden ring-4 ring-white dark:ring-[#1a1a1a] shadow-md">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#252525] dark:to-[#333] text-gray-400">
                  <User size={32} />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-white/5 text-[#f27d26]">
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">{profile?.displayName || 'User'}</h2>
            <p className="text-sm text-[#8c8c8c] font-medium">{profile?.bio || 'Nexus Habit User'}</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Settings Direct Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
        >
            <h3 className="text-sm font-bold text-[#8c8c8c] uppercase tracking-wider ml-1">Settings</h3>
            
            <div className="space-y-3">
                {/* Notifications */}
                <motion.div layout className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">Notifications</h3>
                            <p className="text-[10px] text-[#8c8c8c] font-medium">Daily reminders</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateSettings({ notifications: !profile?.settings.notifications })}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            profile?.settings.notifications ? "bg-[#f27d26]" : "bg-gray-200 dark:bg-[#333]"
                        )}
                    >
                        <motion.div 
                            animate={{ x: profile?.settings.notifications ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </motion.div>

                {/* Mascot Phrases */}
                <motion.div layout className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                            <Ghost size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">Fred Mascot</h3>
                            <p className="text-[10px] text-[#8c8c8c] font-medium">Show mascot phrases</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateSettings({ showMascotPhrases: !profile?.settings.showMascotPhrases })}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            profile?.settings.showMascotPhrases ? "bg-[#f27d26]" : "bg-gray-200 dark:bg-[#333]"
                        )}
                    >
                        <motion.div 
                            animate={{ x: profile?.settings.showMascotPhrases ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </motion.div>

                {/* Theme Selection */}
                <div className="p-4 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-300 flex items-center justify-center">
                            <Moon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">Appearance</h3>
                            <p className="text-[10px] text-[#8c8c8c] font-medium">Customize your theme</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((t) => (
                            <button
                                key={t}
                                onClick={() => updateSettings({ theme: t as any })}
                                className={cn(
                                    "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                    profile?.settings.theme === t 
                                        ? "border-[#f27d26] bg-orange-50 dark:bg-orange-900/10" 
                                        : "border-gray-50 dark:border-[#252525] bg-gray-50 dark:bg-[#252525]"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    profile?.settings.theme === t ? "text-[#f27d26]" : "text-gray-400 dark:text-gray-500"
                                )}>
                                    {t}
                                </span>
                                {profile?.settings.theme === t && <Check size={12} className="text-[#f27d26]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Daily Habit Goal */}
                <motion.div layout className="p-4 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-[#f27d26] flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">Daily Target</h3>
                            <p className="text-[10px] text-[#8c8c8c] font-medium">Habits per day</p>
                        </div>
                        <span className="ml-auto text-sm font-bold text-[#f27d26] bg-[#fef1e6] dark:bg-orange-900/30 px-3 py-1 rounded-full flex items-center gap-2">
                            {isDebouncing && <Loader2 size={10} className="animate-spin" />}
                            {localDailyGoal}
                        </span>
                    </div>
                    <div className="px-2 pb-2">
                        <input 
                            type="range"
                            min="1"
                            max="10"
                            value={localDailyGoal}
                            onChange={(e) => setLocalDailyGoal(parseInt(e.target.value))}
                            style={{ touchAction: 'none' }}
                            className="w-full h-1.5 bg-gray-100 dark:bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#f27d26]"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLogoutConfirm(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/5"
                    >
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white text-center mb-2">Logout</h2>
                        <p className="text-[#8c8c8c] text-center mb-8 font-medium">Are you sure you want to log out of your account?</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="py-4 rounded-2xl font-bold text-[#8c8c8c] bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onLogout}
                                className="py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                            >
                                Yes, logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <div className="mt-16 text-center">
          <p className="text-[10px] text-[#d1d1d1] dark:text-gray-600 font-bold tracking-[0.2em] uppercase">Nexus Habit v1.3.0</p>
        </div>
      </div>
    </div>
  );
}
