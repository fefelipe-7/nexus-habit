import { Check, Clock, Plus } from 'lucide-react';
import { Habit, Completion } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { getColorById } from '../../constants/colors';
import { getCategoryById } from '../../constants/categories';
import { useNavigate } from 'react-router-dom';

type Props = {
  key?: string | number;
  habit: Habit;
  isCompleted: boolean;
  completion?: Completion;
  onToggle: (amount?: number) => void;
  onHabitClick: (id: string) => void;
  isLast?: boolean;
};


export default function HabitItem({ habit, isCompleted, completion, onToggle, onHabitClick, isLast }: Props) {
  const navigate = useNavigate();
  const nexusColor = getColorById(habit.color);
  const category = getCategoryById(habit.categoryId || '');

  const currentAmount = completion?.amount || 0;
  const progressPercent = habit.duration ? Math.min(100, (currentAmount / habit.duration) * 100) : 0;

  return (
    <motion.div 
      whileTap={{ scale: 0.99 }}
      className="flex items-start gap-4 relative"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] border-l-2 border-dashed border-[#e5e5e5]" />
      )}
      
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
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
        onClick={() => onHabitClick(habit.id)}
        animate={{ 
          scale: isCompleted ? 0.98 : 1,
          opacity: isCompleted ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform overflow-hidden relative"
      >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: nexusColor.bg, color: nexusColor.text }}
            >
                <img src={habit.emojiUrl} alt={habit.name} className="w-8 h-8 object-contain drop-shadow-sm" />
            </div>
            <div>
                <h3 className={cn("text-[#2d2d2d] font-bold text-sm transition-all duration-300 tracking-tight", isCompleted && "line-through text-[#8c8c8c]")}>{habit.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#8c8c8c]">{category.name}</span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <p className="text-[#8c8c8c] text-[8px] font-black uppercase tracking-widest">streak {habit.streak || 0} days</p>
                </div>
            </div>
            </div>
            
            <div className="flex items-center gap-3">
                {habit.duration && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/habit/${habit.id}/log`);
                        }}
                        className="w-8 h-8 rounded-full bg-[#f8f6f2] flex items-center justify-center text-[#2d2d2d] hover:bg-orange-50 hover:text-[#f27d26] transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                )}
                <div className="flex flex-col items-center gap-1 text-[#8c8c8c]">
                    <Clock size={16} />
                    <span className="text-[10px] whitespace-nowrap">{habit.duration || 1} {habit.unit || 'units'}</span>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        {habit.duration && (
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                    <span className="text-[#8c8c8c]">progress</span>
                    <span className="text-[#2d2d2d]">{currentAmount} / {habit.duration} {habit.unit}</span>
                </div>
                <div className="w-full h-1.5 bg-[#f8f6f2] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                    />
                </div>
            </div>
        )}
      </motion.div>
    </motion.div>
  );
}
