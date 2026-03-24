import { Habit, Completion, Task } from '../../types';
import HabitItem from './HabitItem';
import { format, isSameDay } from 'date-fns';
import { Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getColorById } from '../../constants/colors';

type Props = {
  habits: Habit[];
  tasks: Task[];
  completions: Completion[];
  selectedDate: Date;
  onToggleCompletion: (habitId: string, date: Date, amount?: number) => void;
  onToggleTask: (taskId: string) => void;
  onShowStreak: () => void;
  onHabitClick: (id: string) => void;
  onTaskClick: (id: string) => void;
};

export default function HabitList({ habits, tasks, completions, selectedDate, onToggleCompletion, onToggleTask, onShowStreak, onHabitClick, onTaskClick }: Props) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter habits for the selected day of the week
  const dayOfWeek = selectedDate.getDay();
  const todaysHabits = habits.filter(h => h.repeatDays.includes(dayOfWeek));
  
  // Filter tasks: uncompleted tasks always show, completed tasks only show on their completion day
  const relevantTasks = tasks.filter(t => {
    if (!t.completedAt) return true;
    return isSameDay(new Date(t.completedAt), selectedDate);
  });

  const totalEntries = todaysHabits.length + relevantTasks.length;
  
  const completedHabitsCount = todaysHabits.filter(habit => 
    completions.some(c => c.habitId === habit.id && c.date === dateStr)
  ).length;

  const completedTasksCount = relevantTasks.filter(t => t.completedAt).length;

  const allCompleted = totalEntries > 0 && (completedHabitsCount + completedTasksCount) === totalEntries;

  return (
    <div className="px-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#2d2d2d]">daily routine</h2>
        <button className="text-xs text-[#8c8c8c] hover:text-[#2d2d2d] transition-colors">see all</button>
      </div>
      
      <motion.div 
        className="flex flex-col gap-4"
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.05 } }
        }}
      >
        {totalEntries === 0 ? (
          <p className="text-sm text-[#8c8c8c] text-center py-8">nothing scheduled for today.</p>
        ) : (
          <>
            {/* Habits */}
            {todaysHabits.map((habit, index) => {
              const completionForDay = completions.find(c => c.habitId === habit.id && c.date === dateStr);
              const isCompleted = !!completionForDay && completionForDay.amount >= (habit.duration || 1);
              return (
                <motion.div 
                  key={habit.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <HabitItem
                    habit={habit}
                    isCompleted={isCompleted}
                    completion={completionForDay}
                    onToggle={(amount) => onToggleCompletion(habit.id, selectedDate, amount)}
                    onHabitClick={onHabitClick}
                    isLast={index === todaysHabits.length - 1 && relevantTasks.length === 0}
                  />
                </motion.div>
              );
            })}

            {/* Tasks (Simplified list view for home) */}
            {relevantTasks.map((task) => (
              <motion.div 
                key={task.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                className={cn(
                  "bg-white rounded-3xl p-4 shadow-sm flex items-center justify-between border-l-4 transition-all active:scale-[0.98]",
                  task.completedAt ? "opacity-50" : ""
                )}
                style={{ borderLeftColor: getColorById(task.color).primary }}
                onClick={() => onTaskClick(task.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getColorById(task.color).bg }}>
                    <img src={task.emojiUrl} alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h3 className={cn("text-sm font-bold text-[#2d2d2d] tracking-tight", task.completedAt && "line-through text-[#8c8c8c]")}>{task.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#8c8c8c] uppercase font-black tracking-widest">{task.priority} task</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    task.completedAt ? "bg-green-500 text-white shadow-sm" : "bg-gray-100 text-gray-300 active:scale-90"
                  )}
                >
                  <CheckCircle2 size={20} />
                </button>
              </motion.div>
            ))}
            
            {allCompleted && totalEntries > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onShowStreak}
                className="mt-4 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-3xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Flame size={20} className="text-white fill-white/50" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">Day complete!</h3>
                    <p className="text-sm text-white/80">Everything checked off.</p>
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
