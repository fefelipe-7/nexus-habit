import { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Habit } from '../../types';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  onSave: (habit: Habit) => void;
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

export default function AddHabitView({ onSave, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { step: stepParam } = useParams();
  const step = parseInt(stepParam || '1');
  
  // Habit state (preserved while navigating steps as long as component doesn't unmount)
  const [categoryId, setCategoryId] = useState<string>('');
  const [name, setName] = useState('');
  const [emojiUrl, setEmojiUrl] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [repeatDays, setRepeatDays] = useState<number[]>([1,2,3,4,5]);
  const [reminders, setReminders] = useState(true);
  const [duration, setDuration] = useState(10);
  const [unit, setUnit] = useState('mins');

  const toggleDay = (index: number) => {
    setRepeatDays(prev => prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index].sort());
  };

  const handleNext = () => {
    if (step === 1 && !categoryId) return;
    if (step === 2 && !name.trim()) return;
    if (step < 3) navigate(`/add/${step + 1}`, { state: location.state });
    else handleSave();
  };

  const handleBack = () => {
    if (step > 1) navigate(-1);
    else onClose();
  };

  const handleSave = () => {
    if (!name.trim() || !categoryId) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toLowerCase(),
      emojiUrl, color, repeatDays, reminders, categoryId,
      createdAt: new Date().toISOString(),
      streak: 0, duration, unit,
    };
    onSave(newHabit);
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex-1 bg-[#f8f6f2] flex flex-col h-full absolute inset-0 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium text-[#2d2d2d]">new habit</h1>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] hover:bg-gray-50 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", step >= s ? "bg-[#f27d26]" : "bg-gray-200")} />
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Step1 categoryId={categoryId} setCategoryId={setCategoryId} />} />
            <Route path="/1" element={<Step1 categoryId={categoryId} setCategoryId={setCategoryId} />} />
            <Route path="/2" element={<Step2 name={name} setName={setName} emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} />} />
            <Route path="/3" element={<Step3 repeatDays={repeatDays} toggleDay={toggleDay} duration={duration} setDuration={setDuration} unit={unit} setUnit={setUnit} reminders={reminders} setReminders={setReminders} />} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Next / Save Button */}
      <div className="p-6 bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2] to-transparent">
        <button 
          onClick={handleNext}
          disabled={(step === 1 && !categoryId) || (step === 2 && !name.trim()) || (step === 3 && repeatDays.length === 0)}
          className="w-full bg-[#f27d26] text-white font-medium py-4 rounded-2xl shadow-md disabled:opacity-50 hover:bg-[#e06d1b] transition-colors flex items-center justify-center gap-2"
        >
          {step < 3 ? (
            <><span>continue</span><ArrowRight size={18} /></>
          ) : (
            <span>save habit</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Sub-components for each step to keep it clean
function Step1({ categoryId, setCategoryId }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">what area of life?</h2>
        <p className="text-[#8c8c8c] text-sm">choose a category for your new habit</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategoryId(cat.id)} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-200 shadow-sm", categoryId === cat.id ? "bg-white ring-2 ring-[#f27d26] scale-105" : "bg-white hover:bg-gray-50 hover:scale-105")}>
            <img src={cat.emojiUrl} alt={cat.name} className="w-16 h-16 mb-4 drop-shadow-sm" />
            <span className="text-sm font-medium text-[#2d2d2d] text-center">{cat.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Step2({ name, setName, emojiUrl, setEmojiUrl, color, setColor }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 h-full overflow-y-auto pb-10 scrollbar-hide">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">what's your habit?</h2>
        <p className="text-[#8c8c8c] text-sm">give it a name and an icon</p>
      </div>
      <div>
        <label className="block text-sm text-[#8c8c8c] mb-2">habit name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. morning meditation" className="w-full bg-white rounded-2xl px-4 py-4 text-[#2d2d2d] outline-none shadow-sm focus:ring-2 focus:ring-[#f27d26]/20 placeholder:text-gray-300" autoFocus />
      </div>
      <div>
        <label className="block text-sm text-[#8c8c8c] mb-2">choose an emoji</label>
        <div className="grid grid-cols-5 gap-3 bg-white p-4 rounded-3xl shadow-sm">
          {EMOJIS.map(url => (
            <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-2xl flex items-center justify-center transition-all duration-200", emojiUrl === url ? "bg-orange-50 ring-2 ring-[#f27d26] scale-110" : "hover:bg-gray-50 hover:scale-110")}>
              <img src={url} alt="emoji" className="w-8 h-8 drop-shadow-sm" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-[#8c8c8c] mb-2">choose a color</label>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={cn("w-12 h-12 rounded-full flex-shrink-0 border-2 transition-transform hover:scale-110", `bg-${c}-100`, color === c ? `border-${c}-500` : 'border-transparent')} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Step3({ repeatDays, toggleDay, duration, setDuration, unit, setUnit, reminders, setReminders }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 h-full overflow-y-auto pb-10 scrollbar-hide">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">how often?</h2>
        <p className="text-[#8c8c8c] text-sm">set your schedule and reminders</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><label className="text-sm text-[#8c8c8c]">repeat days</label><span className="text-xs text-[#f27d26] font-medium">{repeatDays.length} days/week</span></div>
        <div className="flex justify-between bg-white rounded-2xl p-4 shadow-sm">{DAYS.map((day, index) => (
          <button key={index} onClick={() => toggleDay(index)} className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors", repeatDays.includes(index) ? "bg-[#2d2d2d] text-white" : "text-[#8c8c8c] hover:bg-gray-100")}>{day}</button>
        ))}</div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><label className="text-sm text-[#8c8c8c]">set a daily goal (optional)</label></div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm">
            <input type="number" placeholder="amount" className="w-full outline-none bg-transparent" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
            <span className="text-xs text-[#f27d26] font-medium ml-2">{unit}</span>
          </div>
          <div className="flex flex-wrap gap-2">{UNITS.map(u => (
            <button key={u} onClick={() => setUnit(u)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", unit === u ? "bg-[#f27d26] text-white" : "bg-white text-[#8c8c8c] border border-gray-100")}>{u}</button>
          ))}</div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"><span className="text-[#2d2d2d]">get reminders</span><button onClick={() => setReminders(!reminders)} className={cn("w-12 h-6 rounded-full relative transition-colors", reminders ? "bg-[#f27d26]" : "bg-gray-200")}><div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", reminders ? "right-1" : "left-1")} /></button></div>
    </motion.div>
  );
}


