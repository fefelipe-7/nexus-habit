import { useState } from 'react';
import { X, Calendar, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Habit } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

type Props = {
  onSave: (habit: Habit) => void;
  onClose: () => void;
};

const DAYS = ['s', 'm', 't', 'w', 't', 'f', 's'];
const COLORS = ['blue', 'green', 'pink', 'orange', 'yellow', 'purple'];

const CATEGORIES = [
  { id: 'health', name: 'health & fitness', emojiUrl: '/newhabitwizard/body.png' },
  { id: 'productivity', name: 'productivity', emojiUrl: '/newhabitwizard/pencil.png' },
  { id: 'mind', name: 'mind', emojiUrl: '/newhabitwizard/pray.png' },
  { id: 'learning', name: 'learning', emojiUrl: '/newhabitwizard/book.png' },
  { id: 'finance', name: 'finance', emojiUrl: '/newhabitwizard/pig.png' },
  { id: 'relation', name: 'relation', emojiUrl: '/newhabitwizard/skills.png' },
];

const EMOJIS = [
  '/newhabitwizard/body.png',
  '/newhabitwizard/book.png',
  '/newhabitwizard/diamond.png',
  '/newhabitwizard/dislike.png',
  '/newhabitwizard/idea.png',
  '/newhabitwizard/job.png',
  '/newhabitwizard/medicine.png',
  '/newhabitwizard/pencil.png',
  '/newhabitwizard/pig.png',
  '/newhabitwizard/pray.png',
  '/newhabitwizard/running.png',
  '/newhabitwizard/secret.png',
  '/newhabitwizard/skills.png',
  '/newhabitwizard/sleep.png',
  '/newhabitwizard/student.png',
  '/newhabitwizard/sugar.png',
  '/newhabitwizard/test.png',
  '/newhabitwizard/water.png',
];

export default function AddHabitView({ onSave, onClose }: Props) {
  const [step, setStep] = useState(1);
  
  // Habit state
  const [categoryId, setCategoryId] = useState<string>('');
  const [name, setName] = useState('');
  const [emojiUrl, setEmojiUrl] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [repeatDays, setRepeatDays] = useState<number[]>([1,2,3,4,5]); // Default M-F
  const [reminders, setReminders] = useState(true);
  const [duration, setDuration] = useState(10);

  const toggleDay = (index: number) => {
    if (repeatDays.includes(index)) {
      setRepeatDays(repeatDays.filter(d => d !== index));
    } else {
      setRepeatDays([...repeatDays, index].sort());
    }
  };

  const handleNext = () => {
    if (step === 1 && !categoryId) return;
    if (step === 2 && !name.trim()) return;
    if (step < 3) setStep(step + 1);
    else handleSave();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    if (!name.trim() || !categoryId) return;
    
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toLowerCase(),
      emojiUrl,
      color,
      repeatDays,
      reminders,
      categoryId,
      createdAt: new Date().toISOString(),
      streak: 0,
      duration: duration,
    };
    
    onSave(newHabit);
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex-1 bg-[#f8f6f2] flex flex-col h-full absolute inset-0 z-50"
    >
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
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
            <div 
              key={s} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                step >= s ? "bg-[#f27d26]" : "bg-gray-200"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        
        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">what area of life?</h2>
              <p className="text-[#8c8c8c] text-sm">choose a category for your new habit</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-200 shadow-sm",
                    categoryId === cat.id 
                      ? "bg-white ring-2 ring-[#f27d26] scale-105" 
                      : "bg-white hover:bg-gray-50 hover:scale-105"
                  )}
                >
                  <img src={cat.emojiUrl} alt={cat.name} className="w-16 h-16 mb-4 drop-shadow-sm" />
                  <span className="text-sm font-medium text-[#2d2d2d] text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: NAME & EMOJI */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">what's your habit?</h2>
              <p className="text-[#8c8c8c] text-sm">give it a name and an icon</p>
            </div>

            <div>
              <label className="block text-sm text-[#8c8c8c] mb-2">habit name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. morning meditation"
                className="w-full bg-white rounded-2xl px-4 py-4 text-[#2d2d2d] outline-none shadow-sm focus:ring-2 focus:ring-[#f27d26]/20 placeholder:text-gray-300"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-[#8c8c8c] mb-2">choose an emoji</label>
              <div className="grid grid-cols-5 gap-3 bg-white p-4 rounded-3xl shadow-sm">
                {EMOJIS.map(url => (
                  <button 
                    key={url}
                    onClick={() => setEmojiUrl(url)}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center transition-all duration-200", 
                      emojiUrl === url ? "bg-orange-50 ring-2 ring-[#f27d26] scale-110" : "hover:bg-gray-50 hover:scale-110"
                    )}
                  >
                    <img src={url} alt="emoji" className="w-8 h-8 drop-shadow-sm" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#8c8c8c] mb-2">choose a color</label>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn("w-12 h-12 rounded-full flex-shrink-0 border-2 transition-transform hover:scale-110", 
                      `bg-${c}-100`, 
                      color === c ? `border-${c}-500` : 'border-transparent'
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: FREQUENCY & REMINDERS */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">how often?</h2>
              <p className="text-[#8c8c8c] text-sm">set your schedule and reminders</p>
            </div>

            {/* Repeat Days */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-[#8c8c8c]">repeat days</label>
                <span className="text-xs text-[#f27d26] font-medium">{repeatDays.length} days/week</span>
              </div>
              <div className="flex justify-between bg-white rounded-2xl p-4 shadow-sm">
                {DAYS.map((day, index) => {
                  const isSelected = repeatDays.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        isSelected ? "bg-[#2d2d2d] text-white" : "text-[#8c8c8c] hover:bg-gray-100"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-[#8c8c8c]">set a daily goal (optional)</label>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-2xl px-4 py-4 flex items-center justify-between text-[#2d2d2d] shadow-sm">
                  <input 
                    type="number" 
                    placeholder="amount" 
                    className="w-full outline-none bg-transparent placeholder:text-gray-300"
                    onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  />
                  <span className="text-xs text-[#f27d26] font-medium ml-2">mins</span>
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
              <span className="text-[#2d2d2d]">get reminders</span>
              <button 
                onClick={() => setReminders(!reminders)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors",
                  reminders ? "bg-[#f27d26]" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                  reminders ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Next / Save Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2] to-transparent">
        <button 
          onClick={handleNext}
          disabled={(step === 1 && !categoryId) || (step === 2 && !name.trim()) || (step === 3 && repeatDays.length === 0)}
          className="w-full bg-[#f27d26] text-white font-medium py-4 rounded-2xl shadow-md disabled:opacity-50 hover:bg-[#e06d1b] transition-colors flex items-center justify-center gap-2"
        >
          {step < 3 ? (
            <>
              <span>continue</span>
              <ArrowRight size={18} />
            </>
          ) : (
            <span>save habit</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

