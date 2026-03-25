import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { Habit, Task, Completion } from '../../types';
import phrases from '../../../fredphrases.json';

type Props = {
  habits: Habit[];
  tasks: Task[];
  completions: Completion[];
  selectedDate: Date;
  showPhrases?: boolean;
};

type Mood = 'alone' | 'confident' | 'confused' | 'happy' | 'idle' | 'joking' | 'rage' | 'sad' | 'satisfied';

export default function FredCard({ habits, tasks, completions, selectedDate, showPhrases = true }: Props) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = selectedDate.getDay();

  // 1. Calculate stats for the selected date
  const todaysHabits = habits.filter(h => h.repeatDays.includes(dayOfWeek));
  const relevantTasks = tasks.filter(t => {
    if (!t.completedAt) return true;
    return isSameDay(new Date(t.completedAt), selectedDate);
  });

  const totalEntries = todaysHabits.length + relevantTasks.length;
  
  const completedHabitsCount = todaysHabits.filter(habit => 
    completions.some(c => c.habitId === habit.id && c.date === dateStr)
  ).length;

  const completedTasksCount = relevantTasks.filter(t => t.completedAt).length;
  const completedCount = completedHabitsCount + completedTasksCount;

  // 2. Determine Mood with refined thresholds for smoother transitions
  const mood = useMemo((): Mood => {
    if (totalEntries === 0) return 'idle';
    
    const percentage = completedCount / totalEntries;
    const hour = new Date().getHours();

    // High progress
    if (percentage >= 1) return 'joking';
    if (percentage >= 0.8) return 'happy';
    if (percentage >= 0.55) return 'confident';
    if (percentage >= 0.3) return 'satisfied';
    if (percentage > 0) return 'confused';
    
    // 0% completion cases (more forgiving thresholds)
    if (hour >= 21 && totalEntries >= 4) return 'rage'; // Late night, high workload, no progress
    if (hour >= 14) return 'sad'; // Afternoon, some items scheduled, no progress
    return 'alone'; // Early day or few items, just starting
  }, [totalEntries, completedCount]);

  // 3. Pick a phrase (randomized even within the same mood)
  const phrase = useMemo(() => {
    const lines = (phrases as any)[`${mood}_lines` as keyof typeof phrases];
    if (!lines || lines.length === 0) return "just here, watching the day unfold...";
    
    // Pick a random index weighted by completion count to ensure it changes
    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
  }, [mood, completedCount, selectedDate]);

  // 4. Mascot Image Path
  const mascotPath = `/fred/fred ${mood}.webp`;

  return (
    <motion.div 
      className="mx-6 my-4 bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-6 shadow-sm border border-[#e8e4dc] dark:border-white/5 relative overflow-hidden flex items-center justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="z-10 flex-1 pr-4">
        {showPhrases && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f27d26] bg-[#fef1e6] dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                fred says
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={phrase}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-sm font-medium text-[#2d2d2d] dark:text-white leading-relaxed mb-4 italic"
              >
                "{phrase}"
              </motion.p>
            </AnimatePresence>
          </>
        )}
        
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-[#8c8c8c] dark:text-gray-400 font-medium">
            Today: <span className="text-[#2d2d2d] dark:text-white font-bold">{completedCount}/{totalEntries}</span> items finished
          </p>
          <p className="text-[11px] text-[#8c8c8c] dark:text-gray-400 font-medium">
            Total: <span className="text-[#2d2d2d] dark:text-white font-bold">{habits.length}</span> habits • <span className="text-[#2d2d2d] dark:text-white font-bold">{tasks.filter(t => !t.completedAt).length}</span> active tasks
          </p>
        </div>
      </div>

      <div className="relative w-32 h-32 flex-shrink-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={mascotPath}
            src={mascotPath}
            alt={`Fred is ${mood}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        </AnimatePresence>
        
        {/* Subtle background glow based on mood */}
        <div className={`absolute inset-0 -z-10 blur-2xl opacity-20 rounded-full bg-gradient-to-br ${
          mood === 'rage' ? 'from-red-500' :
          mood === 'joking' || mood === 'happy' ? 'from-yellow-400' :
          mood === 'satisfied' || mood === 'confident' ? 'from-green-400' :
          'from-blue-400'
        }`} />
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#f8f6f2] dark:bg-[#252525] rounded-full -z-20 opacity-50" />
    </motion.div>
  );
}
