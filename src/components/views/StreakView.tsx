import { Flame, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

type Props = {
  streak: number;
  onClose: () => void;
};

export default function StreakView({ streak, onClose }: Props) {
  // Generate the last 7 days ending today
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    return {
      date: d,
      dayName: format(d, 'EEE'), // e.g., Wed
      completed: i < 7, // mock all as completed for the streak view
      isToday: i === 6
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 bg-[#f8f6f2] flex flex-col h-full absolute inset-0 z-50"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        
        {/* Fire Icon */}
        <div className="relative mb-6">
          <motion.div 
            animate={{ scale: [1.5, 1.6, 1.5], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-pink-500 to-red-500 blur-2xl rounded-full" 
          />
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
            className="w-32 h-32 bg-gradient-to-t from-pink-500 to-red-500 rounded-full flex items-center justify-center relative shadow-lg"
          >
            <Flame size={64} className="text-white fill-white/20" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Streak Number */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-7xl font-bold text-[#f22659] tracking-tighter mb-1"
        >
          {streak}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[#f22659] mb-12"
        >
          days streak
        </motion.p>

        {/* Calendar Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-md rounded-3xl p-6 w-full shadow-sm border border-white/40"
        >
          <div className="flex justify-between items-center mb-6">
            {days.map((day, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05, type: "spring" }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-[#8c8c8c]">
                  {day.dayName}
                </span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
                  day.isToday ? "bg-blue-400" : "bg-[#f22659]"
                )}>
                  <Check size={16} strokeWidth={3} />
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-[#8c8c8c] text-sm">
            Congrats! You've completed {streak} days in a row!
          </p>
        </motion.div>
      </div>

      {/* Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 pb-12"
      >
        <button 
          onClick={onClose}
          className="w-full bg-[#f22659] text-white font-bold py-4 rounded-2xl shadow-md hover:bg-[#d91e4c] transition-colors active:scale-95"
        >
          I'm committed
        </button>
      </motion.div>
    </motion.div>
  );
}
