import { useState } from 'react';
import { X, Calendar, ArrowRight, ArrowLeft, Clock, AlertTriangle, Layers, Repeat } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Habit, Task, Priority } from '../../types';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

type Props = {
  onSave: (habit: Habit) => void;
  onAddTask: (task: Task) => void;
  onClose: () => void;
};

const DAYS = ['s', 'm', 't', 'w', 't', 'f', 's'];
const COLORS = ['blue', 'green', 'pink', 'orange', 'yellow', 'purple'];
const CATEGORIES = [
  { id: 'health', name: 'health & fitness', emojiUrl: '/health.png' },
  { id: 'productivity', name: 'productivity', emojiUrl: '/productivity.png' },
  { id: 'mind', name: 'mind', emojiUrl: '/mind.png' },
  { id: 'learning', name: 'learning', emojiUrl: '/learning.png' },
  { id: 'finance', name: 'finance', emojiUrl: '/finance.png' },
  { id: 'relation', name: 'relation', emojiUrl: '/relation.png' },
];
const UNITS = ['mins', 'hours', 'kg', 'l', 'km', 'cups', 'units'];
const EMOJIS = [
  '/newhabitwizard/body.png', '/newhabitwizard/book.png', '/newhabitwizard/diamond.png',
  '/newhabitwizard/dislike.png', '/newhabitwizard/idea.png', '/newhabitwizard/job.png',
  '/newhabitwizard/medicine.png', '/newhabitwizard/pencil.png', '/newhabitwizard/pig.png',
  '/newhabitwizard/pray.png', '/newhabitwizard/running.png', '/newhabitwizard/secret.png',
  '/newhabitwizard/skills.png', '/newhabitwizard/sleep.png', '/newhabitwizard/student.png',
  '/newhabitwizard/sugar.png', '/newhabitwizard/test.png', '/newhabitwizard/water.png',
];

export default function AddWizardView({ onSave, onAddTask, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const wildcard = params['*'] || '';
  
  // Logic to determine step and type from wildcard
  const isTask = wildcard.startsWith('task');
  const isHabit = wildcard.startsWith('habit');
  const typeSelected = isTask ? 'task' : isHabit ? 'habit' : null;
  
  const stepMatch = wildcard.match(/(\d+)$/);
  const step = stepMatch ? parseInt(stepMatch[1]) : 0;
  
  // Shared state
  const [name, setName] = useState('');
  const [emojiUrl, setEmojiUrl] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);

  // Habit specific
  const [categoryId, setCategoryId] = useState<string>('');
  const [repeatDays, setRepeatDays] = useState<number[]>([1,2,3,4,5]);
  const [reminders, setReminders] = useState(true);
  const [duration, setDuration] = useState(10);
  const [unit, setUnit] = useState('mins');

  // Task specific
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedTime, setEstimatedTime] = useState(30);

  const toggleDay = (index: number) => {
    setRepeatDays(prev => prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index].sort());
  };

  const handleNext = () => {
    if (typeSelected === 'habit') {
      if (step === 1 && !categoryId) return;
      if (step === 2 && !name.trim()) return;
      if (step < 3) navigate(`/add/habit/${step + 1}`);
      else handleSaveHabit();
    } else if (typeSelected === 'task') {
      if (step === 1 && !name.trim()) return;
      if (step < 3) navigate(`/add/task/${step + 1}`);
      else handleSaveTask();
    }
  };

  const handleBack = () => {
    if (step > 0) navigate(-1);
    else onClose();
  };

  const handleSaveHabit = () => {
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: name.toLowerCase(),
      emojiUrl, color, repeatDays, reminders, categoryId,
      createdAt: new Date().toISOString(),
      streak: 0, duration, unit,
    });
  };

  const handleSaveTask = () => {
    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      name: name.toLowerCase(),
      description, deadline, priority, estimatedTime, emojiUrl, color,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex-1 bg-[#f8f6f2] flex flex-col h-full absolute inset-0 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium text-[#2d2d2d]">
            {step === 0 ? 'choose type' : `new ${typeSelected}`}
          </h1>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d]">
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      {step > 0 && (
        <div className="px-6 mb-6">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", step >= s ? "bg-[#f27d26]" : "bg-gray-200")} />
            ))}
          </div>
        </div>
      )}

      {/* Steps Container */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<StepTypeSelect onSelect={(t) => navigate(`/add/${t}/1`)} />} />
            
            {/* Habit Flow */}
            <Route path="habit/1" element={<HabitStep1 categoryId={categoryId} setCategoryId={setCategoryId} />} />
            <Route path="habit/2" element={<HabitStep2 name={name} setName={setName} emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} />} />
            <Route path="habit/3" element={<HabitStep3 repeatDays={repeatDays} toggleDay={toggleDay} duration={duration} setDuration={setDuration} unit={unit} setUnit={setUnit} reminders={reminders} setReminders={setReminders} />} />
            
            {/* Task Flow */}
            <Route path="task/1" element={<TaskStep1 name={name} setName={setName} description={description} setDescription={setDescription} deadline={deadline} setDeadline={setDeadline} />} />
            <Route path="task/2" element={<TaskStep2 emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} priority={priority} setPriority={setPriority} />} />
            <Route path="task/3" element={<TaskStep3 estimatedTime={estimatedTime} setEstimatedTime={setEstimatedTime} name={name} deadline={deadline} priority={priority} />} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      {step > 0 && (
        <div className="p-6 bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2] to-transparent">
          <button 
            onClick={handleNext}
            className="w-full bg-[#f27d26] text-white font-medium py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 hover:bg-[#e06d1b] transition-colors"
          >
            <span>{step < 3 ? 'continue' : `save ${typeSelected}`}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function StepTypeSelect({ onSelect }: { onSelect: (type: 'habit' | 'task') => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-6 flex flex-col items-center justify-center h-full gap-6">
      <button 
        onClick={() => onSelect('habit')}
        className="w-full bg-white p-8 rounded-[40px] shadow-sm flex items-center gap-6 group hover:ring-2 hover:ring-[#f27d26] transition-all"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#f27d26]">
          <Repeat size={32} />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-bold text-[#2d2d2d]">habit</h2>
          <p className="text-sm text-[#8c8c8c]">recurring routine to build consistency</p>
        </div>
      </button>

      <button 
        onClick={() => onSelect('task')}
        className="w-full bg-white p-8 rounded-[40px] shadow-sm flex items-center gap-6 group hover:ring-2 hover:ring-[#f27d26] transition-all"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500">
          <Layers size={32} />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-bold text-[#2d2d2d]">task</h2>
          <p className="text-sm text-[#8c8c8c]">one-time job with a specific deadline</p>
        </div>
      </button>
    </motion.div>
  );
}

// HABIT STEPS (Reused from previous implementation)
function HabitStep1({ categoryId, setCategoryId }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d]">what area?</h2>
        <p className="text-[#8c8c8c] text-sm">choose a category</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategoryId(cat.id)} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl transition-all bg-white shadow-sm", categoryId === cat.id && "ring-2 ring-[#f27d26]")}>
            <img src={cat.emojiUrl} alt="" className="w-12 h-12 mb-3" />
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function HabitStep2({ name, setName, emojiUrl, setEmojiUrl, color, setColor }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-6 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="habit name" className="w-full bg-white rounded-2xl p-4 shadow-sm outline-none" autoFocus />
      <div className="grid grid-cols-5 gap-3 bg-white p-4 rounded-3xl shadow-sm">
        {EMOJIS.map(url => (
          <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-xl", emojiUrl === url && "bg-orange-50 ring-2 ring-[#f27d26]")}>
            <img src={url} alt="" className="w-8 h-8 m-auto" />
          </button>
        ))}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={cn("w-10 h-10 rounded-full flex-shrink-0 border-2 transition-transform", `bg-${c}-400`, color === c ? 'border-[#2d2d2d]' : 'border-transparent')} />
        ))}
      </div>
    </motion.div>
  );
}

function HabitStep3({ repeatDays, toggleDay, duration, setDuration, unit, setUnit, reminders, setReminders }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-6 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="flex justify-between bg-white rounded-2xl p-4 shadow-sm">
        {DAYS.map((day, index) => (
          <button key={index} onClick={() => toggleDay(index)} className={cn("w-8 h-8 rounded-full text-xs font-medium", repeatDays.includes(index) ? "bg-[#2d2d2d] text-white" : "text-gray-400")}>{day}</button>
        ))}
      </div>
      <div className="space-y-4">
        <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full bg-white rounded-2xl p-4 shadow-sm outline-none" placeholder="daily goal amount" />
        <div className="flex flex-wrap gap-2">
          {UNITS.map(u => (
            <button key={u} onClick={() => setUnit(u)} className={cn("px-3 py-1.5 rounded-full text-xs", unit === u ? "bg-[#f27d26] text-white" : "bg-white")}>{u}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// TASK STEPS
function TaskStep1({ name, setName, description, setDescription, deadline, setDeadline }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d]">what needs to be done?</h2>
        <p className="text-[#8c8c8c] text-sm">define your one-time task</p>
      </div>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="task name" className="w-full bg-white rounded-2xl p-4 shadow-sm outline-none" autoFocus />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="description (optional)" className="w-full bg-white rounded-2xl p-4 shadow-sm outline-none h-24 resize-none" />
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#2d2d2d]">
          <Calendar size={20} className="text-[#f27d26]" />
          <span className="text-sm font-medium">deadline</span>
        </div>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="outline-none text-sm text-[#f27d26] font-medium" />
      </div>
    </motion.div>
  );
}

function TaskStep2({ emojiUrl, setEmojiUrl, color, setColor, priority, setPriority }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div>
        <label className="text-xs text-[#8c8c8c] mb-2 block">priority level</label>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm gap-1">
          {(['low', 'medium', 'high'] as Priority[]).map(p => (
            <button key={p} onClick={() => setPriority(p)} className={cn("flex-1 py-2 text-xs font-medium rounded-xl capitalize", priority === p ? (p === 'high' ? "bg-red-500 text-white" : p === 'medium' ? "bg-orange-500 text-white" : "bg-blue-500 text-white") : "text-gray-400 font-normal")}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-[#8c8c8c] mb-2 block">icon & color</label>
        <div className="grid grid-cols-5 gap-3 bg-white p-4 rounded-3xl shadow-sm mb-4">
          {EMOJIS.map(url => (
            <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-xl", emojiUrl === url && "bg-orange-50 ring-2 ring-[#f27d26]")}>
              <img src={url} alt="" className="w-8 h-8 m-auto" />
            </button>
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={cn("w-10 h-10 rounded-full flex-shrink-0 border-2 transition-transform", `bg-${c}-400`, color === c ? 'border-[#2d2d2d]' : 'border-transparent')} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TaskStep3({ estimatedTime, setEstimatedTime, name, deadline, priority }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d]">almost done!</h2>
        <p className="text-[#8c8c8c] text-sm">last details for your task</p>
      </div>
      <div>
        <label className="text-xs text-[#8c8c8c] mb-2 block">estimated time (mins)</label>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(parseInt(e.target.value) || 0)} className="outline-none w-20" />
          <Clock size={20} className="text-gray-400" />
        </div>
      </div>
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h3 className="font-bold text-center text-[#2d2d2d]">Preview</h3>
        <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2d2d2d]">{name || 'Task Name'}</p>
            <p className="text-xs text-gray-400">Due {format(new Date(deadline), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-gray-400">Priority: <span className="text-[#2d2d2d] capitalize">{priority}</span></span>
          <span className="text-gray-400">Duration: <span className="text-[#2d2d2d]">{estimatedTime}m</span></span>
        </div>
      </div>
    </motion.div>
  );
}
