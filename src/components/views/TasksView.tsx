import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import { cn } from '../../utils/cn';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

type Props = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
};

export default function TasksView({ tasks, onToggleTask }: Props) {
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'timeline'>('list');

  const getUrgencyColor = (deadline: string) => {
    const date = new Date(deadline);
    const daysLeft = differenceInDays(date, new Date());
    
    if (isPast(date) && !isToday(date)) return 'border-purple-500 text-purple-600 bg-purple-50';
    if (isToday(date)) return 'border-red-500 text-red-600 bg-red-50';
    if (daysLeft <= 3) return 'border-orange-500 text-orange-600 bg-orange-50';
    return 'border-gray-200 text-gray-600 bg-white';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-orange-100 text-orange-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const todoTasks = tasks.filter(t => !t.completedAt);
  const completedTasks = tasks.filter(t => t.completedAt);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f2] flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-medium text-[#2d2d2d] tracking-tight">tasks</h1>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500">
              <Search size={18} />
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 rounded-2xl p-1 mb-8">
          {['board', 'list', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-all capitalize",
                activeTab === tab ? "bg-white text-[#2d2d2d] shadow-sm" : "text-[#8c8c8c]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task List Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* To Do Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full" />
                  <h2 className="font-medium text-[#2d2d2d]">To Do</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                </div>
                <div className="flex gap-2">
                  <Plus size={18} className="text-gray-400" />
                  <MoreHorizontal size={18} className="text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                {todoTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    className={cn(
                      "bg-white rounded-3xl p-5 shadow-sm border-l-4 transition-all active:scale-[0.98]",
                      getUrgencyColor(task.deadline).split(' ')[0]
                    )}
                    onClick={() => onToggleTask(task.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50", task.color === 'pink' ? 'bg-pink-50' : '')}>
                          <img src={task.emojiUrl} alt="" className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#2d2d2d] leading-tight">{task.name}</h3>
                          {task.description && <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>}
                        </div>
                      </div>
                      <button className="text-gray-300">
                        <Circle size={20} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={12} />
                          <span>{task.estimatedTime}m</span>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                        getUrgencyColor(task.deadline).split(' ').slice(1).join(' ')
                      )}>
                        <Calendar size={12} />
                        <span>
                          {isToday(new Date(task.deadline)) ? 'Today' : format(new Date(task.deadline), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Completed Section (Optional) */}
            {completedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-green-500 rounded-full" />
                  <h2 className="font-medium text-[#2d2d2d]">Completed</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                </div>
                <div className="space-y-4 opacity-60">
                  {completedTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-3xl p-5 shadow-sm border-l-4 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={24} className="text-green-500" />
                          <h3 className="font-medium text-[#2d2d2d] line-through">{task.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
