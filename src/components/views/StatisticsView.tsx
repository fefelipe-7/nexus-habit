import { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Habit, Completion } from '../../types';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  habits: Habit[];
  completions: Completion[];
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

export default function StatisticsView({ habits, completions }: Props) {
  const [tab, setTab] = useState<'today' | 'weekly' | 'overall'>('weekly');
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="px-6 pt-12 pb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-medium text-[#2d2d2d] text-center mb-6"
        >
          statistics
        </motion.h1>
        
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex bg-white rounded-full p-1 shadow-sm mb-6 relative"
        >
          {['today', 'weekly', 'overall'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-full transition-colors capitalize relative z-10",
                tab === t ? "text-white" : "text-[#8c8c8c] hover:text-[#2d2d2d]"
              )}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="stats-tab-indicator"
                  className="absolute inset-0 bg-[#2d2d2d] rounded-full z-[-1]"
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
                <h2 className="text-sm font-medium text-[#2d2d2d] mb-3">summary:</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <p className="text-xs text-[#8c8c8c] mb-1">current streak</p>
                    <p className="text-lg font-medium text-[#2d2d2d]">53 days</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <p className="text-xs text-[#8c8c8c] mb-1">success rate</p>
                    <p className="text-lg font-medium text-[#2d2d2d]">92%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <p className="text-xs text-[#8c8c8c] mb-1">best streak day</p>
                    <p className="text-lg font-medium text-[#2d2d2d]">86 days</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <p className="text-xs text-[#8c8c8c] mb-1">completed habits</p>
                    <p className="text-lg font-medium text-[#2d2d2d]">758</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {habits.map(habit => {
                const colorClass = colorMap[habit.color] || colorMap.blue;
                const heatColor = heatMapColors[habit.color] || 'bg-blue-300';
                
                return (
                  <motion.div key={habit.id} variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
                          <img src={habit.emojiUrl} alt={habit.name} className="w-5 h-5 object-contain drop-shadow-sm" />
                        </div>
                        <h3 className="text-sm font-medium text-[#2d2d2d]">{habit.name}</h3>
                      </div>
                      <span className="text-xs text-[#8c8c8c]">
                        {habit.repeatDays.length === 7 ? 'everyday' : `${habit.repeatDays.length} days per week`}
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
                              <span className="text-[10px] text-[#8c8c8c]">{format(day, 'EEE')}</span>
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                isCompleted ? colorClass.split(' ')[0] : "bg-[#f8f6f2]",
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
                            {Array.from({ length: 7 * 15 }).map((_, i) => {
                              const isFilled = Math.random() > 0.3;
                              return (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-3 h-3 rounded-sm transition-colors",
                                    isFilled ? heatColor : "bg-[#f8f6f2]"
                                  )} 
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                          <span className="text-sm text-[#8c8c8c]">today's status</span>
                          {completions.some(c => c.habitId === habit.id && c.date === format(today, 'yyyy-MM-dd')) ? (
                            <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                              <Check size={16} /> completed
                            </span>
                          ) : habit.repeatDays.includes(today.getDay()) ? (
                            <span className="text-sm font-medium text-orange-500">pending</span>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">rest day</span>
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
