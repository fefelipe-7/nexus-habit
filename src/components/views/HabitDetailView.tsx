import { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, MoreHorizontal, Calendar, Clock, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Habit, Completion } from '../../types';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { NEXUS_COLORS, getColorById } from '../../constants/colors';
import { HABIT_CATEGORIES, getCategoryById } from '../../constants/categories';
import { calculateHabitStats } from '../../utils/stats';
import { format, subDays } from 'date-fns';
import ConfirmDialog from '../ui/ConfirmDialog';

type Props = {
  habit: Habit;
  completions: Completion[];
  onUpdate: (habit: Habit) => void;
  onClose: () => void;
  onDelete: (habitId: string) => void;
};

const CATEGORIES = HABIT_CATEGORIES;

const EMOJIS = [
  '/newhabitwizard/body.webp', '/newhabitwizard/book.webp', '/newhabitwizard/diamond.webp',
  '/newhabitwizard/dislike.webp', '/newhabitwizard/idea.webp', '/newhabitwizard/job.webp',
  '/newhabitwizard/medicine.webp', '/newhabitwizard/pencil.webp', '/newhabitwizard/pig.webp',
  '/newhabitwizard/pray.webp', '/newhabitwizard/running.webp', '/newhabitwizard/secret.webp',
  '/newhabitwizard/skills.webp', '/newhabitwizard/sleep.webp', '/newhabitwizard/student.webp',
  '/newhabitwizard/sugar.webp', '/newhabitwizard/test.webp', '/newhabitwizard/water.webp',
];

const COLORS = NEXUS_COLORS;
const DAYS = ['s', 'm', 't', 'w', 't', 'f', 's'];
const UNITS = ['mins', 'hours', 'kg', 'l', 'km', 'cups', 'units'];


export default function HabitDetailView({ habit, completions, onUpdate, onClose, onDelete }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.endsWith('/edit');
  const [editedHabit, setEditedHabit] = useState<Habit>(habit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCustomUnit, setIsCustomUnit] = useState(!UNITS.includes(habit.unit || ''));
  
  const stats = useMemo(() => calculateHabitStats(habit, completions), [habit, completions]);

  // Update local state if the prop habit changes
  useEffect(() => {
    setEditedHabit(habit);
  }, [habit]);
  
  // Progress Arc Logic — uses real successRate from stats
  const progress = stats.successRate;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 200); // Only half-circle arc

  const handleSave = () => {
    onUpdate(editedHabit);
    navigate(`/habit/${habit.id}`, { replace: true, state: location.state });
  };

  const toggleEdit = () => {
    if (isEditing) {
      navigate(`/habit/${habit.id}`, { replace: true, state: location.state });
    } else {
      navigate(`/habit/${habit.id}/edit`, { state: location.state });
    }
  };

  const toggleDay = (index: number) => {
    const days = [...editedHabit.repeatDays];
    if (days.includes(index)) {
      setEditedHabit({ ...editedHabit, repeatDays: days.filter(d => d !== index) });
    } else {
      setEditedHabit({ ...editedHabit, repeatDays: [...days, index].sort() });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] dark:bg-[#121212] flex flex-col overflow-hidden lowercase pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="w-10 h-10 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] dark:text-gray-300 border border-black/5 dark:border-white/5">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold uppercase tracking-widest text-[#2d2d2d] dark:text-white">habit details</h1>
        <button 
          onClick={toggleEdit} 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors border border-black/5 dark:border-white/5",
            isEditing ? "bg-[#2d2d2d] dark:bg-white text-white dark:text-black" : "bg-white dark:bg-[#1a1a1a] text-[#2d2d2d] dark:text-gray-300"
          )}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {/* Top Info */}
        <div className="flex flex-col items-center mt-4">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 shadow-sm"
            style={{ backgroundColor: getColorById(editedHabit.color).bg, color: getColorById(editedHabit.color).text }}
          >
            <img src={editedHabit.emojiUrl} alt="" className="w-12 h-12 object-contain drop-shadow-sm" />
          </div>
          <h2 className={cn("text-2xl font-bold text-[#2d2d2d] dark:text-white text-center px-10 transition-all", isEditing && "bg-white dark:bg-[#1a1a1a] rounded-xl py-1 border border-black/5 dark:border-white/5")}>
            {isEditing ? (
              <input 
                value={editedHabit.name} 
                onChange={e => setEditedHabit({...editedHabit, name: e.target.value})}
                className="bg-transparent text-center outline-none w-full dark:text-white"
              />
            ) : editedHabit.name}
          </h2>
          <p className="text-[#8c8c8c] dark:text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">{CATEGORIES.find(c => c.id === editedHabit.categoryId)?.name || 'habit'}</p>
        </div>

        {/* Arc Progress Section */}
        <div className="relative flex items-center justify-center mt-12 h-44">
          <svg className="w-64 h-64 -rotate-180" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-gray-100 dark:text-[#1a1a1a]"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference / 2}
              strokeLinecap="round"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="url(#arc-gradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference / 2 }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f27d26" />
                <stop offset="100%" stopColor="#ffb02e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-4">
            <span className="block text-4xl font-black text-[#2d2d2d] dark:text-white">{editedHabit.streak || 0}</span>
            <span className="text-[10px] text-[#8c8c8c] dark:text-gray-600 uppercase tracking-widest font-black">streak</span>
          </div>
          
          {/* Side Info in Arcs */}
          <div className="absolute top-4 left-4 text-center">
            <span className="block text-sm font-black text-[#202020] dark:text-white">{stats.successRate}%</span>
            <span className="text-[8px] text-[#8c8c8c] dark:text-gray-600 uppercase font-black">Rate</span>
          </div>
          <div className="absolute top-4 right-4 text-center">
            <span className="block text-sm font-black text-[#202020] dark:text-white">{stats.totalCompletions}</span>
            <span className="text-[8px] text-[#8c8c8c] dark:text-gray-600 uppercase font-black">Logs</span>
          </div>
        </div>

        {/* Small Progress Circles (Macro-like) */}
        <div className="flex justify-center gap-10 mt-8">
          {[
            { label: 'Longest', value: stats.longestStreak, color: 'border-green-500' },
            { label: 'Total', value: stats.totalCompletions, color: 'border-orange-500' },
            { label: 'Rate', value: `${stats.successRate}%`, color: 'border-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={cn("w-14 h-14 rounded-full border-4 flex items-center justify-center text-xs font-black dark:text-white", stat.color)}>
                {stat.value}
              </div>
              <span className="text-[10px] text-[#8c8c8c] dark:text-gray-500 font-black uppercase tracking-tighter">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Custom Edit Sections */}
        <div className="mt-12 space-y-6">
          {/* Goal & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl shadow-sm space-y-2 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-[#8c8c8c] dark:text-gray-600 mb-1">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">goal</span>
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={editedHabit.duration} 
                    onChange={e => {
                      if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                        setEditedHabit({...editedHabit, duration: parseInt(e.target.value) || 0});
                      }
                    }}
                    className="text-lg font-bold bg-white dark:bg-[#252525] dark:text-white outline-none w-full rounded-lg px-2 border border-black/5 dark:border-white/10"
                  />
                  <select 
                    value={isCustomUnit ? 'custom' : editedHabit.unit}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomUnit(true);
                      } else {
                        setIsCustomUnit(false);
                        setEditedHabit({...editedHabit, unit: e.target.value});
                      }
                    }}
                    className="text-[10px] font-black uppercase text-[#f27d26] bg-transparent outline-none"
                  >
                    {UNITS.map(u => <option key={u} value={u} className="bg-white dark:bg-[#1a1a1a]">{u}</option>)}
                    {!UNITS.includes(editedHabit.unit || '') && <option value={editedHabit.unit} className="bg-white dark:bg-[#1a1a1a]">{editedHabit.unit}</option>}
                    <option value="custom" className="bg-white dark:bg-[#1a1a1a]">custom...</option>
                  </select>
                  {isCustomUnit && (
                    <input 
                      type="text" 
                      value={editedHabit.unit} 
                      onChange={e => setEditedHabit({...editedHabit, unit: e.target.value})}
                      placeholder="unit"
                      className="text-xs text-[#f27d26] border-b border-orange-200 dark:border-orange-500/30 bg-transparent outline-none w-full"
                    />
                  )}
                </div>
              ) : (
                <p className="text-lg font-bold text-[#2d2d2d] dark:text-white leading-tight">{editedHabit.duration} {editedHabit.unit || 'mins'}</p>
              )}
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl shadow-sm space-y-2 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-[#8c8c8c] dark:text-gray-600 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">frequency</span>
              </div>
              <p className="text-lg font-bold text-[#2d2d2d] dark:text-white leading-tight">{editedHabit.repeatDays.length} days / week</p>
            </div>
          </div>

          {/* Repeat Days Selection (Editable) */}
          {isEditing && (
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/5">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] dark:text-gray-600 mb-4 block">Edit Schedule</label>
               <div className="flex justify-between">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all",
                      editedHabit.repeatDays.includes(i) ? "bg-[#2d2d2d] dark:bg-white text-white dark:text-black shadow-md scale-110" : "bg-[#f8f6f2] dark:bg-[#252525] text-[#8c8c8c] dark:text-gray-700"
                    )}
                  >
                    {day}
                  </button>
                ))}
               </div>
            </div>
          )}

          {/* Color & Icon (Editable) */}
          {isEditing && (
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm space-y-8 border border-black/5 dark:border-white/5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] dark:text-gray-600 mb-4 block">Choose Color</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {COLORS.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setEditedHabit({...editedHabit, color: c.id})}
                      className={cn("w-10 h-10 rounded-full flex-shrink-0 border-4 border-white shadow-sm transition-transform", 
                        editedHabit.color === c.id ? `scale-110 shadow-md` : 'opacity-40'
                      )}
                      style={{ backgroundColor: c.primary }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] dark:text-gray-600 mb-4 block">Choose Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {EMOJIS.map(url => (
                    <button 
                      key={url}
                      onClick={() => setEditedHabit({...editedHabit, emojiUrl: url})}
                      className={cn("aspect-square rounded-xl bg-[#f8f6f2] dark:bg-[#252525] flex items-center justify-center p-2 transition-all", editedHabit.emojiUrl === url && "ring-2 ring-[#f27d26] bg-white dark:bg-white scale-110 shadow-md")}
                    >
                      <img src={url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Log — Real data from last 7 days */}
          {!isEditing && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d] dark:text-white">activity log</h3>
                  <span className="text-[8px] font-black text-[#8c8c8c] dark:text-gray-600 uppercase tracking-widest">last 7 days</span>
                </div>
                <div className="space-y-4">
                   {stats.last7Days.slice().reverse().map((day, i) => {
                    const isScheduled = editedHabit.repeatDays.includes(day.date.getDay());
                    const dayLabel = format(day.date, 'EEE, MMM d').toLowerCase();
                    return (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
                         <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-black dark:text-white">{dayLabel}</p>
                                <div className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase",
                                !isScheduled ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600" :
                                day.completed ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                                )}>
                                {!isScheduled ? 'off' : day.completed ? 'completed' : 'missed'}
                                </div>
                            </div>
                            <div className="mt-1">
                                <p className="text-[10px] font-black text-[#8c8c8c] dark:text-gray-600 uppercase tracking-tighter">
                                    {!isScheduled ? 'rest day' : `${day.amount || 0} / ${editedHabit.duration || 1} ${editedHabit.unit || 'units'} done`}
                                </p>
                                {isScheduled && editedHabit.duration && (
                                    <div className="w-full h-1 bg-gray-50 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className="h-full bg-orange-400 rounded-full" 
                                            style={{ width: `${Math.min(100, ((day.amount || 0) / editedHabit.duration) * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                      </div>
                    );
                   })}
                </div>
            </div>
          )}
        </div>

        {/* Delete / Save Buttons */}
        <div className="mt-8 space-y-3 pb-12">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="w-full bg-[#f27d26] text-white font-bold py-4 rounded-3xl shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Save Changes
            </button>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 dark:bg-red-950/10 text-red-500 font-bold py-4 rounded-3xl border border-red-100 dark:border-red-900/10 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Habit
            </button>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="delete habit?"
        message="this habit and all its history will be permanently deleted. this action cannot be undone."
        confirmText="delete habit"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(editedHabit.id)}
      />
    </motion.div>
  );
}
