import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, User, Shield, Zap, MessageSquare, LogOut, Camera, Loader2, Bell, Moon, Globe, Target, Ghost, Check } from 'lucide-react';
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
  const [showSettings, setShowSettings] = useState(false);

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

  const menuItems = [
    { icon: User, title: 'Settings', subtitle: 'Notifications, theme & language', color: 'bg-blue-50 text-blue-500', onClick: () => setShowSettings(true) },
    { icon: Shield, title: 'Security', subtitle: 'Manage your data and account', color: 'bg-green-50 text-green-500' },
    { icon: Zap, title: 'Power ups', subtitle: 'Connect with other software', color: 'bg-purple-50 text-purple-500' },
    { icon: MessageSquare, title: 'Support', subtitle: 'Get help using Nexus Habit', color: 'bg-orange-50 text-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f27d26]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 flex flex-col relative bg-white">
      <AnimatePresence mode="wait">
        {!showSettings ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 pt-12 pb-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={20} className="text-[#2d2d2d]" />
              </button>
              <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 hover:bg-red-50 text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-10">Account</h1>

            {/* Profile Card */}
            <div className="flex items-center gap-5 mb-12 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden ring-4 ring-white shadow-md">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 text-[#f27d26]">
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#1a1a1a]">{profile?.displayName || 'User'}</h2>
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

            {/* Menu Items */}
            <div className="space-y-2">
              {menuItems.map((item, i) => (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", item.color)}>
                    <item.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#1a1a1a]">{item.title}</h3>
                    <p className="text-xs text-[#8c8c8c] font-medium">{item.subtitle}</p>
                  </div>
                  <ChevronRight size={18} className="text-[#d1d1d1] group-hover:text-[#1a1a1a] transition-colors" />
                </motion.button>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-xs text-[#d1d1d1] font-bold tracking-widest uppercase">Version 1.2.0 (20260321)</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 pt-12 pb-6"
          >
             <button 
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 hover:bg-gray-50 transition-colors mb-8"
              >
                <ArrowLeft size={20} className="text-[#2d2d2d]" />
              </button>

              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-10">Settings</h1>

              <div className="space-y-8">
                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a]">Notifications</h3>
                            <p className="text-xs text-[#8c8c8c]">Daily reminders</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateSettings({ notifications: !profile?.settings.notifications })}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            profile?.settings.notifications ? "bg-[#f27d26]" : "bg-gray-200"
                        )}
                    >
                        <motion.div 
                            animate={{ x: profile?.settings.notifications ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </div>

                {/* Mascot Phrases */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
                            <Ghost size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a]">Fred Mascot</h3>
                            <p className="text-xs text-[#8c8c8c]">Show mascot phrases</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateSettings({ showMascotPhrases: !profile?.settings.showMascotPhrases })}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            profile?.settings.showMascotPhrases ? "bg-[#f27d26]" : "bg-gray-200"
                        )}
                    >
                        <motion.div 
                            animate={{ x: profile?.settings.showMascotPhrases ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#8c8c8c] uppercase tracking-wider ml-4">Appearance</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((t) => (
                            <button
                                key={t}
                                onClick={() => updateSettings({ theme: t as any })}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                    profile?.settings.theme === t ? "border-[#f27d26] bg-orange-50" : "border-gray-100 bg-white"
                                )}
                            >
                                <Moon size={18} className={profile?.settings.theme === t ? "text-[#f27d26]" : "text-gray-400"} />
                                <span className={cn("text-xs font-bold capitalize", profile?.settings.theme === t ? "text-[#f27d26]" : "text-gray-400")}>
                                    {t}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#8c8c8c] uppercase tracking-wider ml-4">Language</h3>
                    <div className="flex gap-3">
                        {[
                            { code: 'pt', label: 'Português' },
                            { code: 'en', label: 'English' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => updateSettings({ language: lang.code as any })}
                                className={cn(
                                    "flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                                    profile?.settings.language === lang.code ? "border-[#f27d26] bg-orange-50" : "border-gray-100 bg-white"
                                )}
                            >
                                <span className={cn("text-xs font-bold", profile?.settings.language === lang.code ? "text-[#f27d26]" : "text-gray-400")}>
                                    {lang.label}
                                </span>
                                {profile?.settings.language === lang.code && <Check size={14} className="text-[#f27d26]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Daily Habit Goal */}
                <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f27d26] flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a]">Daily Target</h3>
                            <p className="text-xs text-[#8c8c8c]">Number of habits per day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range"
                            min="1"
                            max="10"
                            value={profile?.settings.dailyHabitGoal || 3}
                            onChange={(e) => updateSettings({ dailyHabitGoal: parseInt(e.target.value) })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f27d26]"
                        />
                        <span className="w-8 text-center font-bold text-[#f27d26]">{profile?.settings.dailyHabitGoal}</span>
                    </div>
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
