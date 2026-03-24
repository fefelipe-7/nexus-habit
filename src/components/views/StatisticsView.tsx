import { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Habit, Completion } from '../../types';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  habits: Habit[];
  completions: Completion[];
  stats: any;
  onHabitClick: (id: string) => void;
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-500 border-blue-200',
  green: 'bg-green-100 text-green-500 border-green-200',
  pink: 'bg-pink-100 text-pink-500 border-pink-200',
  orange: 'bg-orange-100 text-orange-500 border-orange-200',
  yellow: 'bg-yellow-100 text-yellow-500 border-yellow-200',
  purple: 'bg-purple-100 text-purple-500 border-purple-200',
};

const heatMapColors: Record<string, string> = {
  blue: 'bg-blue-300',
  green: 'bg-green-300',
  pink: 'bg-pink-300',
  orange: 'bg-orange-300',
  yellow: 'bg-yellow-300',
  purple: 'bg-purple-300',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function StatisticsView({ habits, completions, stats, onHabitClick }: Props) {
  const [tab, setTab] = useState<'today' | 'weekly' | 'overall'>('weekly');
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-inherit">
      <div className="px-6 pt-12 pb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold uppercase tracking-widest text-[#2d2d2d] dark:text-white text-center mb-6"
        >
          statistics
        </motion.h1>
        
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-full p-1 shadow-sm mb-6 relative"
        >
          {['today', 'weekly', 'overall'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
               className={cn(
                "flex-1 py-2 text-sm font-bold rounded-full transition-colors capitalize relative z-10",
                tab === t ? "text-white dark:text-black" : "text-[#8c8c8c] dark:text-gray-500 hover:text-[#2d2d2d] dark:hover:text-white"
              )}
            >
              {t}
               {tab === t && (
                <motion.div
                  layoutId="stats-tab-indicator"
                  className="absolute inset-0 bg-[#2d2d2d] dark:bg-white rounded-full z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={containerVariants}
          >
            {tab === 'overall' && (
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#2d2d2d] dark:text-white mb-4 ml-1">summary:</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-1">current streak</p>
                    <p className="text-lg font-bold text-[#2d2d2d] dark:text-white">{stats.currentStreak} days</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-1">success rate</p>
                    <p className="text-lg font-bold text-[#2d2d2d] dark:text-white">{stats.successRate}%</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-1">best streak</p>
                    <p className="text-lg font-bold text-[#2d2d2d] dark:text-white">{stats.longestStreak} days</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-1">completed</p>
                    <p className="text-lg font-bold text-[#2d2d2d] dark:text-white">{stats.totalCompletions}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {habits.map(habit => {
                const colorClass = colorMap[habit.color] || colorMap.blue;
                const heatColor = heatMapColors[habit.color] || 'bg-blue-300';
                
                return (
                  <motion.div 
                    key={habit.id} 
                    variants={itemVariants} 
                    className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-sm cursor-pointer"
                    onClick={() => onHabitClick(habit.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
                          <img src={habit.emojiUrl} alt={habit.name} className="w-5 h-5 object-contain drop-shadow-sm" />
                        </div>
                        <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white tracking-tight">{habit.name}</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] dark:text-gray-500">
                        {habit.repeatDays.length === 7 ? 'everyday' : `${habit.repeatDays.length} days / week`}
                      </span>
                    </div>

                    {tab === 'weekly' ? (
                      <div className="flex justify-between mt-4">
                        {weekDays.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = completions.some(c => c.habitId === habit.id && c.date === dateStr);
                          const isScheduled = habit.repeatDays.includes(day.getDay());
                          
                          return (
                            <div key={dateStr} className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-[#8c8c8c] dark:text-gray-500 font-bold uppercase">{format(day, 'EEE')}</span>
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                isCompleted ? colorClass.split(' ')[0] : "bg-[#f8f6f2] dark:bg-[#252525]",
                                !isScheduled && "opacity-30"
                              )}>
                                {isCompleted && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  >
                                    <Check size={14} className={colorClass.split(' ')[1]} strokeWidth={3} />
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : tab === 'overall' ? (
                      <div className="mt-4">
                        <div className="flex gap-1">
                          <div className="flex flex-col gap-1 text-[8px] text-[#8c8c8c] justify-between py-1 pr-1">
                            <span>m</span><span>w</span><span>f</span><span>s</span>
                          </div>
                          <div className="flex-1 grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto scrollbar-hide">
                            {stats.heatmap.map((day: any, i: number) => {
                              const opacity = day.value === 0 ? 0 : Math.min(0.3 + (day.value * 0.2), 1);
                              return (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-3 h-3 rounded-sm transition-colors",
                                    day.value > 0 ? heatColor : "bg-[#f8f6f2] dark:bg-[#252525]"
                                  )} 
                                  style={day.value > 0 ? { opacity } : {}}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] dark:text-gray-500">today's status</span>
                          {completions.some(c => c.habitId === habit.id && c.date === format(today, 'yyyy-MM-dd')) ? (
                            <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-1">
                              <Check size={14} /> completed
                            </span>
                          ) : habit.repeatDays.includes(today.getDay()) ? (
                            <span className="text-[10px] font-black uppercase text-orange-500">pending</span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600">rest day</span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
