import { Check, Clock } from 'lucide-react';
import { Habit } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

type Props = {
  key?: string | number;
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  isLast?: boolean;
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-500',
  green: 'bg-green-100 text-green-500',
  pink: 'bg-pink-100 text-pink-500',
  orange: 'bg-orange-100 text-orange-500',
  yellow: 'bg-yellow-100 text-yellow-500',
  purple: 'bg-purple-100 text-purple-500',
};

export default function HabitItem({ habit, isCompleted, onToggle, isLast }: Props) {
  const colorClass = colorMap[habit.color] || colorMap.blue;

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="flex items-start gap-4 relative cursor-pointer"
      onClick={onToggle}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] border-l-2 border-dashed border-[#e5e5e5]" />
      )}
      
      {/* Checkbox */}
      <button
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-3 z-10 transition-colors shrink-0",
          isCompleted ? "border-[#f27d26] bg-[#f27d26]" : "border-[#d1d1d1] bg-[#f8f6f2]"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check size={14} className="text-white" strokeWidth={3} />
        </motion.div>
      </button>

      {/* Card */}
      <motion.div 
        animate={{ 
          scale: isCompleted ? 0.98 : 1,
          opacity: isCompleted ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
            <img src={habit.emojiUrl} alt={habit.name} className="w-8 h-8 object-contain drop-shadow-sm" />
          </div>
          <div>
            <h3 className={cn("text-[#2d2d2d] font-medium text-sm transition-all duration-300", isCompleted && "line-through text-[#8c8c8c]")}>{habit.name}</h3>
            <p className="text-[#8c8c8c] text-xs mt-1">streak {habit.streak || 0} days</p>
          </div>
        </div>
        
        {habit.duration && (
          <div className="flex flex-col items-center gap-1 text-[#8c8c8c]">
            <Clock size={16} />
            <span className="text-[10px]">{habit.duration} min</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
