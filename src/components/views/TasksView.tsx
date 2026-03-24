import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Task, Priority } from '../../types';
import { cn } from '../../utils/cn';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Clock, CheckCircle2, Circle, LayoutGrid, List as ListIcon, CalendarDays, ChevronRight, PackageOpen } from 'lucide-react';
import { format, differenceInDays, isPast, isToday, isTomorrow, startOfDay } from 'date-fns';
import { HabitSkeleton, TaskSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { getColorById } from '../../constants/colors';

type Props = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTaskClick: (id: string) => void;
  isLoading?: boolean;
};

export default function TasksView({ tasks, onToggleTask, onTaskClick, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'timeline'>('list');
  const navigate = useNavigate();

  const getUrgencyColor = (deadline: string) => {
    const date = new Date(deadline);
    const today = startOfDay(new Date());
    const daysLeft = differenceInDays(startOfDay(date), today);
    
    if (isPast(date) && !isToday(date)) return 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
    if (isToday(date)) return 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    if (daysLeft <= 3 && daysLeft >= 0) return 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    return 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a1a1a]';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'medium': return 'bg-[#2d2d2d] dark:bg-white text-white dark:text-black';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const todoTasks = useMemo(() => tasks.filter(t => !t.completedAt), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completedAt), [tasks]);

  return (
    <div className="flex-1 overflow-y-auto bg-inherit flex flex-col h-full scrollbar-hide lowercase">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#2d2d2d] dark:text-white tracking-tighter uppercase">Tasks</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8c8c] dark:text-gray-500">{todoTasks.length} pending items</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-sm text-gray-400 dark:text-gray-500 active:scale-90 transition-transform border border-black/5 dark:border-white/5">
              <Search size={18} />
            </button>
            <button 
              onClick={() => navigate('/add/task/1')}
              className="w-10 h-10 bg-[#f27d26] rounded-full flex items-center justify-center shadow-md text-white active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="flex p-1 mb-8">
          {[
            { id: 'board', icon: LayoutGrid },
            { id: 'list', icon: ListIcon },
            { id: 'timeline', icon: CalendarDays }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2.5 rounded-[18px] flex items-center justify-center gap-2 transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-[#2d2d2d] dark:bg-white text-white dark:text-black shadow-lg scale-[1.02]" 
                  : "text-[#8c8c8c] dark:text-gray-500 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.id}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pb-32"
          >
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-100 rounded-full w-24 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-12 animate-pulse" />
                </div>
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState 
                icon={PackageOpen}
                title="No tasks yet"
                description="Your task list is empty. Add your first objective to get started!"
                action={{
                  label: "Create Task",
                  onClick: () => navigate('/add/task/1')
                }}
              />
            ) : (
              <>
                {activeTab === 'list' && <ListView tasks={todoTasks} completed={completedTasks} onToggle={onToggleTask} onDetail={onTaskClick} getUrgencyColor={getUrgencyColor} getPriorityColor={getPriorityColor} />}
                {activeTab === 'board' && <BoardView tasks={todoTasks} onToggle={onToggleTask} onDetail={onTaskClick} getPriorityColor={getPriorityColor} />}
                {activeTab === 'timeline' && <TimelineView tasks={todoTasks} onToggle={onToggleTask} onDetail={onTaskClick} getUrgencyColor={getUrgencyColor} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const ListView = React.memo(function ListView({ tasks, completed, onToggle, onDetail, getUrgencyColor, getPriorityColor }: any) {
  return (
    <div className="space-y-10">
      <div>
        <HeaderSection title="Active Tasks" count={tasks.length} color="bg-orange-500" />
        <div className="space-y-4">
          {tasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onDetail={onDetail} getUrgencyColor={getUrgencyColor} getPriorityColor={getPriorityColor} />
          ))}
        </div>
      </div>
      
      {completed.length > 0 && (
        <div className="opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
          <HeaderSection title="Completed" count={completed.length} color="bg-green-500" />
          <div className="space-y-3">
            {completed.map((task: Task) => (
              <div key={task.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 border-l-4 border-l-green-500 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-bold text-[#2d2d2d] dark:text-gray-400 line-through">{task.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

function BoardView({ tasks, onToggle, onDetail, getPriorityColor }: any) {
  const priorities: Priority[] = ['high', 'medium', 'low'];
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
      {priorities.map(p => {
        const pTasks = tasks.filter((t: Task) => t.priority === p);
        return (
          <div key={p} className="w-[85%] flex-shrink-0 space-y-4">
            <HeaderSection title={p} count={pTasks.length} color={p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-[#2d2d2d]' : 'bg-blue-500'} />
            <div className="space-y-4">
              {pTasks.map((task: Task) => (
                <div 
                  key={task.id} 
                  onClick={() => onDetail(task.id)}
                  className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md dark:hover:bg-[#1e1e1e] transition-all active:scale-[0.98] border-l-4"
                  style={{ borderLeftColor: getColorById(task.color).primary }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: getColorById(task.color).bg }}>
                      <img src={task.emojiUrl} alt="" className="w-6 h-6 object-contain" />
                    </div>
                    <h3 className="font-bold text-[#2d2d2d] dark:text-white leading-tight flex-1">{task.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-300 dark:text-gray-600">
                      <Calendar size={10} />
                      {format(new Date(task.deadline), 'MMM d')}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                      className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-[#f27d26] hover:border-[#f27d26]"
                    >
                      <Circle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineView({ tasks, onToggle, onDetail, getUrgencyColor }: any) {
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  return (
    <div className="relative pl-8 space-y-12">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2d2d2d] dark:from-white via-gray-200 dark:via-gray-800 to-transparent rounded-full" />
      
      {sortedTasks.map((task, i) => {
        const isNewDay = i === 0 || format(new Date(task.deadline), 'yyyy-MM-dd') !== format(new Date(sortedTasks[i-1].deadline), 'yyyy-MM-dd');
        return (
          <div key={task.id} className="relative">
            {isNewDay && (
              <div className="absolute -left-[42px] top-0 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#f8f6f2] dark:bg-[#121212] border-4 border-[#2d2d2d] dark:border-white z-10 shadow-sm" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-[#2d2d2d] dark:text-white mt-2 whitespace-nowrap bg-white dark:bg-[#1a1a1a] px-2 py-0.5 rounded-full shadow-sm">
                  {isToday(new Date(task.deadline)) ? 'Today' : isTomorrow(new Date(task.deadline)) ? 'Tomorrow' : format(new Date(task.deadline), 'MMM d')}
                </span>
              </div>
            )}
            <div 
              onClick={() => onDetail(task.id)}
              className={cn(
                "bg-white dark:bg-[#1a1a1a] rounded-[32px] p-5 shadow-sm border border-black/5 dark:border-white/5 border-l-4 transition-all active:scale-[0.98] flex items-center gap-4"
              )}
              style={{ borderLeftColor: getColorById(task.color).primary }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: getColorById(task.color).bg }}>
                <img src={task.emojiUrl} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2d2d2d] dark:text-white leading-tight tracking-tight">{task.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[8px] text-gray-300 dark:text-gray-600 font-bold uppercase">
                    <Clock size={10} />
                    {task.estimatedTime}m
                  </div>
                  <div className={cn("px-2 py-0.5 rounded-md text-[6px] font-black uppercase", 
                    task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  )}>
                    {task.priority}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-200" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeaderSection({ title, count, color }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-4 rounded-full", color)} />
        <h2 className="font-black text-[10px] uppercase tracking-widest text-[#2d2d2d] dark:text-white">{title}</h2>
        <span className="text-[8px] font-black text-gray-300 dark:text-gray-600 bg-white dark:bg-[#1a1a1a] border border-gray-50 dark:border-white/5 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <MoreHorizontal size={16} className="text-gray-300 dark:text-gray-600" />
    </div>
  );
}

const TaskCard = React.memo(function TaskCard({ task, onToggle, onDetail, getUrgencyColor, getPriorityColor }: any) {
  return (
    <motion.div
      layoutId={task.id}
      className={cn(
        "bg-white dark:bg-[#1a1a1a] rounded-[32px] p-5 shadow-sm border border-black/5 dark:border-white/5 border-l-4 transition-all active:scale-[0.98]"
      )}
      style={{ borderLeftColor: getColorById(task.color).primary }}
      onClick={() => onDetail(task.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner"
            style={{ backgroundColor: getColorById(task.color).bg }}
          >
            <img src={task.emojiUrl} alt="" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-[#2d2d2d] dark:text-white text-lg leading-tight tracking-tight">{task.name}</h3>
            {task.description && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium line-clamp-1 mt-0.5">{task.description}</p>}
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-[#f27d26] hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
        >
          <Circle size={24} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
        <div className="flex gap-2">
          <span className={cn("text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider", getPriorityColor(task.priority))}>
            {task.priority}
          </span>
          <div className="flex items-center gap-1 text-[8px] text-gray-300 dark:text-gray-600 font-bold uppercase">
            <Clock size={12} />
            <span>{task.estimatedTime}m</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full",
          getUrgencyColor(task.deadline).split(' ').slice(1).join(' ')
        )}>
          <Calendar size={12} />
          <span>
            {isToday(new Date(task.deadline)) ? 'Today' : isTomorrow(new Date(task.deadline)) ? 'Tomorrow' : format(new Date(task.deadline), 'MMM d')}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
