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
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col overflow-hidden lowercase pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium text-[#2d2d2d]">habit details</h1>
        <button 
          onClick={toggleEdit} 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors",
            isEditing ? "bg-[#2d2d2d] text-white" : "bg-white text-[#2d2d2d]"
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
          <h2 className={cn("text-2xl font-bold text-[#2d2d2d] text-center px-10 transition-all", isEditing && "bg-white rounded-xl py-1")}>
            {isEditing ? (
              <input 
                value={editedHabit.name} 
                onChange={e => setEditedHabit({...editedHabit, name: e.target.value})}
                className="bg-transparent text-center outline-none w-full"
              />
            ) : editedHabit.name}
          </h2>
          <p className="text-[#8c8c8c] text-sm mt-1">{CATEGORIES.find(c => c.id === editedHabit.categoryId)?.name || 'habit'}</p>
        </div>

        {/* Arc Progress Section */}
        <div className="relative flex items-center justify-center mt-12 h-44">
          <svg className="w-64 h-64 -rotate-180" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#e5e5e5"
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
            <span className="block text-4xl font-bold text-[#2d2d2d]">{editedHabit.streak || 0}</span>
            <span className="text-[10px] text-[#8c8c8c] uppercase tracking-widest font-bold">streak days</span>
          </div>
          
          {/* Side Info in Arcs */}
          <div className="absolute top-4 left-4 text-center">
            <span className="block text-sm font-bold text-[#202020]">{stats.successRate}%</span>
            <span className="text-[8px] text-[#8c8c8c] uppercase font-bold">Rate</span>
          </div>
          <div className="absolute top-4 right-4 text-center">
            <span className="block text-sm font-bold text-[#202020]">{stats.totalCompletions}</span>
            <span className="text-[8px] text-[#8c8c8c] uppercase font-bold">Logs</span>
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
              <div className={cn("w-14 h-14 rounded-full border-4 flex items-center justify-center text-xs font-bold", stat.color)}>
                {stat.value}
              </div>
              <span className="text-[10px] text-[#8c8c8c] font-bold uppercase">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Custom Edit Sections */}
        <div className="mt-12 space-y-6">
          {/* Goal & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#8c8c8c] mb-1">
                <Clock size={14} />
                <span className="text-xs font-bold uppercase">goal</span>
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="number" 
                    value={editedHabit.duration} 
                    onChange={e => setEditedHabit({...editedHabit, duration: parseInt(e.target.value) || 0})}
                    className="text-lg font-bold outline-none w-full"
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
                    className="text-xs text-[#f27d26] outline-none"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    {!UNITS.includes(editedHabit.unit || '') && <option value={editedHabit.unit}>{editedHabit.unit}</option>}
                    <option value="custom">custom...</option>
                  </select>
                  {isCustomUnit && (
                    <input 
                      type="text" 
                      value={editedHabit.unit} 
                      onChange={e => setEditedHabit({...editedHabit, unit: e.target.value})}
                      placeholder="unit"
                      className="text-xs text-[#f27d26] border-b border-orange-200 outline-none w-full"
                    />
                  )}
                </div>
              ) : (
                <p className="text-lg font-bold text-[#2d2d2d]">{editedHabit.duration} {editedHabit.unit || 'mins'}</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#8c8c8c] mb-1">
                <Calendar size={14} />
                <span className="text-xs font-bold uppercase">frequency</span>
              </div>
              <p className="text-lg font-bold text-[#2d2d2d]">{editedHabit.repeatDays.length} days / week</p>
            </div>
          </div>

          {/* Repeat Days Selection (Editable) */}
          {isEditing && (
            <div className="bg-white p-6 rounded-3xl shadow-sm">
               <label className="text-xs font-bold uppercase text-[#8c8c8c] mb-4 block">Edit Schedule</label>
               <div className="flex justify-between">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      editedHabit.repeatDays.includes(i) ? "bg-[#2d2d2d] text-white" : "bg-[#f8f6f2] text-[#8c8c8c]"
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
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-[#8c8c8c] mb-4 block">Choose Color</label>
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
                <label className="text-xs font-bold uppercase text-[#8c8c8c] mb-4 block">Choose Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {EMOJIS.map(url => (
                    <button 
                      key={url}
                      onClick={() => setEditedHabit({...editedHabit, emojiUrl: url})}
                      className={cn("aspect-square rounded-xl bg-[#f8f6f2] flex items-center justify-center p-2", editedHabit.emojiUrl === url && "ring-2 ring-[#f27d26] bg-white")}
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
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#2d2d2d]">activity log</h3>
                  <span className="text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">last 7 days</span>
                </div>
                <div className="space-y-4">
                   {stats.last7Days.slice().reverse().map((day, i) => {
                    const isScheduled = editedHabit.repeatDays.includes(day.date.getDay());
                    const dayLabel = format(day.date, 'EEE, MMM d').toLowerCase();
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                         <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-[#2d2d2d]">{dayLabel}</p>
                                <div className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold",
                                !isScheduled ? "bg-gray-100 text-gray-400" :
                                day.completed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                )}>
                                {!isScheduled ? 'off' : day.completed ? 'completed' : 'missed'}
                                </div>
                            </div>
                            <div className="mt-1">
                                <p className="text-[10px] text-[#8c8c8c] lowercase">
                                    {!isScheduled ? 'rest day' : `${day.amount || 0} / ${editedHabit.duration || 1} ${editedHabit.unit || 'units'} done`}
                                </p>
                                {isScheduled && editedHabit.duration && (
                                    <div className="w-full h-1 bg-gray-50 rounded-full mt-1 overflow-hidden">
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
              className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-3xl border border-red-100 flex items-center justify-center gap-2"
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
