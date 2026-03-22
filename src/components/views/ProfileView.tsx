import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, User, Shield, Zap, MessageSquare, LogOut, Camera, Loader2 } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '../../utils/cn';

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

export default function ProfileView({ onBack, onLogout }: Props) {
  const { profile, isLoading, updateProfile, uploadAvatar, isUpdating } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const menuItems = [
    { icon: User, title: 'General', subtitle: 'Profile, notifications & storage', color: 'bg-blue-50 text-blue-500' },
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
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
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
      </div>
    </div>
  );
}
