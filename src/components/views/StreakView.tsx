import { Flame, Check, Trophy, CalendarDays, Zap, Share2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

type Props = {
  streak: number;
  stats: any;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function StreakView({ streak, stats }: Props) {
  // Use real last 7 days from stats
  const days = stats.last7Days || [];

  return (
    <motion.div 
      className="flex-1 overflow-y-auto relative bg-[#f8f6f2]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="px-6 pt-12 pb-6">
        <motion.div 
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-medium text-[#2d2d2d] tracking-tight">
            your streak
          </h1>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 hover:bg-gray-50 transition-colors active:scale-95">
            <Share2 size={18} className="text-[#2d2d2d]" />
          </button>
        </motion.div>

        <div className="flex flex-col items-center justify-center py-8">
          {/* Fire Icon */}
          <motion.div className="relative mb-8" variants={itemVariants}>
            <motion.div 
              animate={{ scale: [1.4, 1.5, 1.4], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-t from-pink-500 to-red-500 blur-2xl rounded-full" 
            />
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
              className="w-40 h-40 bg-gradient-to-t from-pink-500 to-red-500 rounded-full flex items-center justify-center relative shadow-lg"
            >
              <Flame size={80} className="text-white fill-white/20" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Streak Number */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-7xl font-bold text-[#f22659] tracking-tighter mb-1">
              {streak}
            </h2>
            <p className="text-xl font-medium text-[#f22659]">
              days in a row
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-3">
                <Trophy size={20} />
              </div>
              <p className="text-sm font-medium text-[#8c8c8c] mb-1">longest streak</p>
              <p className="text-2xl font-bold text-[#2d2d2d]">{stats.longestStreak || 0}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
                <Zap size={20} />
              </div>
              <p className="text-sm font-medium text-[#8c8c8c] mb-1">total days</p>
              <p className="text-2xl font-bold text-[#2d2d2d]">{stats.totalCompletions || 0}</p>
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-6 w-full shadow-sm border border-black/5"
          >
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays size={18} className="text-[#8c8c8c]" />
              <h3 className="font-medium text-[#2d2d2d]">recent activity</h3>
            </div>
            <div className="flex justify-between items-center">
              {days.map((day, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium text-[#8c8c8c]">
                    {format(day.date, 'EEE')}
                  </span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
                    day.completed ? (i === 6 ? "bg-blue-400" : "bg-[#f22659]") : "bg-gray-100"
                  )}>
                    {day.completed ? <Check size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
