import { Habit, Completion } from '../../types';
import HabitItem from './HabitItem';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  habits: Habit[];
  completions: Completion[];
  selectedDate: Date;
  onToggleCompletion: (habitId: string, date: Date) => void;
  onShowStreak: () => void;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function HabitList({ habits, completions, selectedDate, onToggleCompletion, onShowStreak }: Props) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter habits for the selected day of the week
  const dayOfWeek = selectedDate.getDay();
  const todaysHabits = habits.filter(h => h.repeatDays.includes(dayOfWeek));
  
  const completedCount = todaysHabits.filter(habit => 
    completions.some(c => c.habitId === habit.id && c.date === dateStr)
  ).length;

  const allCompleted = todaysHabits.length > 0 && completedCount === todaysHabits.length;

  return (
    <div className="px-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#2d2d2d]">daily routine</h2>
        <button className="text-xs text-[#8c8c8c] hover:text-[#2d2d2d] transition-colors">see all</button>
      </div>
      
      <motion.div 
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {todaysHabits.length === 0 ? (
          <motion.p variants={itemVariants} className="text-sm text-[#8c8c8c] text-center py-8">no habits scheduled for today.</motion.p>
        ) : (
          <>
            {todaysHabits.map((habit, index) => {
              const isCompleted = completions.some(c => c.habitId === habit.id && c.date === dateStr);
              return (
                <motion.div key={habit.id} variants={itemVariants}>
                  <HabitItem
                    habit={habit}
                    isCompleted={isCompleted}
                    onToggle={() => onToggleCompletion(habit.id, selectedDate)}
                    isLast={index === todaysHabits.length - 1}
                  />
                </motion.div>
              );
            })}
            
            {allCompleted && (
              <motion.button 
                variants={itemVariants}
                onClick={onShowStreak}
                className="mt-4 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-3xl shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Flame size={20} className="text-white fill-white/50" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">All habits completed!</h3>
                    <p className="text-sm text-white/80">Tap to view your streak</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-white text-[#f22659] rounded-full flex items-center justify-center font-bold">
                  16
                </div>
              </motion.button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
