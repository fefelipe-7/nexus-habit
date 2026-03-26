import { format } from 'date-fns';
import { motion } from 'framer-motion';

type Props = {
  date: Date;
  username: string;
  avatarUrl?: string;
  onProfileClick: () => void;
};

export default function Header({ date, username, avatarUrl, onProfileClick }: Props) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'dawn';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="flex items-center justify-between px-6 pt-12 pb-4">
      <div>
        <motion.h1 
          className="text-3xl font-medium text-[#2d2d2d] dark:text-white tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {getGreeting()}, {username}
        </motion.h1>
        <motion.p 
          className="text-[#8c8c8c] dark:text-gray-400 text-sm mt-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
        >
          {format(date, 'EEEE, d MMMM, yyyy')}
        </motion.p>
      </div>
      <motion.button 
        onClick={onProfileClick}
        className="w-12 h-12 rounded-full bg-[#ffdfbf] overflow-hidden border-2 border-white dark:border-[#1a1a1a] shadow-sm"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}&backgroundColor=ffdfbf`} alt="avatar" className="w-full h-full object-cover" />
      </motion.button>
    </div>
  );
}
