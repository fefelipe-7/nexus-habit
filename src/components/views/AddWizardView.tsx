import { Habit, Task, Project, Priority } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { NEXUS_COLORS, getColorById } from '../../constants/colors';
import { HABIT_CATEGORIES } from '../../constants/categories';
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, X, ArrowRight, CheckCircle2, Repeat, Layers, Folder, Clock, Target, CalendarDays, AlertTriangle, Calendar, Palette, Link2 } from 'lucide-react';

type Props = {
  onSave: (habit: any) => void;
  onAddTask: (task: any) => void;
  onAddProject: (project: any) => void;
  onClose: () => void;
};

const DAYS = ['s', 'm', 't', 'w', 't', 'f', 's'];
const COLORS = NEXUS_COLORS;
const CATEGORIES = HABIT_CATEGORIES;
const UNITS = ['mins', 'hours', 'kg', 'l', 'km', 'cups', 'units'];
const EMOJIS = [
  '/newhabitwizard/body.webp', '/newhabitwizard/book.webp', '/newhabitwizard/diamond.webp',
  '/newhabitwizard/dislike.webp', '/newhabitwizard/idea.webp', '/newhabitwizard/job.webp',
  '/newhabitwizard/medicine.webp', '/newhabitwizard/pencil.webp', '/newhabitwizard/pig.webp',
  '/newhabitwizard/pray.webp', '/newhabitwizard/running.webp', '/newhabitwizard/secret.webp',
  '/newhabitwizard/skills.webp', '/newhabitwizard/sleep.webp', '/newhabitwizard/student.webp',
  '/newhabitwizard/sugar.webp', '/newhabitwizard/test.webp', '/newhabitwizard/water.webp',
];

export default function AddWizardView({ onSave, onAddTask, onAddProject, onClose }: Props) {
  const location = useLocation();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const [typeSelected, setTypeSelected] = useState<'habit' | 'task' | 'project' | null>(null);
  const [step, setStep] = useState(0);
  
  // Set initial projectId if passed in location state
  const initialProjectId = location.state?.projectId || '';
  const [projectId, setProjectId] = useState<string>(initialProjectId);
  
  // Project wizard: selected task IDs to link
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Shared state
  const [name, setName] = useState('');
  const [emojiUrl, setEmojiUrl] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0].id);

  // Habit specific
  const [categoryId, setCategoryId] = useState<string>('');
  const [repeatDays, setRepeatDays] = useState<number[]>([1,2,3,4,5]);
  const [reminders, setReminders] = useState(true);
  const [duration, setDuration] = useState('10');
  const [unit, setUnit] = useState('mins');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  // Task specific
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedTime, setEstimatedTime] = useState('30');

  const handleNext = () => {
    if (!typeSelected) return;
    
    if (typeSelected === 'habit') {
      if (step === 1 && !categoryId) return;
      if (step === 2 && !name.trim()) return;
      if (step < 3) setStep(prev => prev + 1);
      else handleSaveHabit();
    } else if (typeSelected === 'task') {
      if (step === 1 && !name.trim()) return;
      if (step < 3) setStep(prev => prev + 1);
      else handleSaveTask();
    } else if (typeSelected === 'project') {
      if (step === 1 && !name.trim()) return;
      if (step < 3) setStep(prev => prev + 1);
      else handleSaveProject();
    }
  };

  const handleSaveProject = () => {
    onAddProject({
      project: {
        name: name.toLowerCase(),
        description,
        emojiUrl,
        color,
        deadline: deadline || undefined
      },
      taskIds: selectedTaskIds
    });
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
    else if (step === 1) {
      setStep(0);
      setTypeSelected(null);
    }
    else onClose();
  };

  const handleSaveHabit = () => {
    onSave({
      name: name.toLowerCase(),
      emojiUrl,
      color,
      categoryId,
      repeatDays,
      reminders,
      duration: parseInt(duration) || 0,
      unit,
      streak: 0,
      lastCompleted: null
    });
  };

  const handleSaveTask = () => {
    onAddTask({
      name: name.toLowerCase(),
      description,
      deadline: deadline || undefined,
      priority,
      estimatedTime: parseInt(estimatedTime) || 0,
      emojiUrl,
      color,
      projectId
    });
  };

  const canContinue = useMemo(() => {
    if (typeSelected === 'habit') {
      if (step === 1) return !!categoryId;
      if (step === 2) return !!name.trim();
      if (step === 3) return repeatDays.length > 0;
    } else if (typeSelected === 'task') {
      if (step === 1) return !!name.trim();
      return true;
    } else if (typeSelected === 'project') {
      if (step === 1) return !!name.trim();
      return true;
    }
    return false;
  }, [typeSelected, step, categoryId, name, repeatDays]);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex-1 bg-[#f8f6f2] flex flex-col h-full absolute inset-0 z-50 overflow-hidden pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-medium text-[#2d2d2d] leading-tight">
              {step === 0 ? 'create new' : `new ${typeSelected}`}
            </h1>
            {step > 0 && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                step 0{step} / 0{typeSelected === 'project' ? '3' : '3'}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] active:scale-90 transition-transform">
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar (Interactive look) */}
      {step > 0 && (
        <div className="px-6 mb-8 mt-2">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={cn(
                  "h-1.5 rounded-full transition-all duration-500", 
                  step === s ? "bg-[#f27d26] w-full" : step > s ? "bg-[#f27d26] opacity-40 w-full" : "bg-gray-200 w-full"
                )} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <StepTypeSelect onSelect={(t) => { setTypeSelected(t); setStep(1); }} />
          ) : typeSelected === 'habit' ? (
            <div key={`habit-${step}`} className="h-full">
              {step === 1 && <HabitStep1 categoryId={categoryId} setCategoryId={setCategoryId} />}
              {step === 2 && <HabitStep2 name={name} setName={setName} emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} />}
              {step === 3 && <HabitStep3 repeatDays={repeatDays} toggleDay={(i: number) => setRepeatDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort())} duration={duration} setDuration={setDuration} unit={unit} setUnit={setUnit} isCustomUnit={isCustomUnit} setIsCustomUnit={setIsCustomUnit} reminders={reminders} setReminders={setReminders} />}
            </div>
          ) : typeSelected === 'task' ? (
            <div key={`task-${step}`} className="h-full">
              {step === 1 && <TaskStep1 name={name} setName={setName} description={description} setDescription={setDescription} projects={projects} projectId={projectId} setProjectId={setProjectId} />}
              {step === 2 && <TaskStep2 deadline={deadline} setDeadline={setDeadline} estimatedTime={estimatedTime} setEstimatedTime={setEstimatedTime} />}
              {step === 3 && <TaskStep3 emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} priority={priority} setPriority={setPriority} name={name} deadline={deadline} />}
            </div>
          ) : (
            <div key={`project-${step}`} className="h-full">
              {step === 1 && <ProjectStep1 name={name} setName={setName} description={description} setDescription={setDescription} deadline={deadline} setDeadline={setDeadline} />}
              {step === 2 && <ProjectStep2 emojiUrl={emojiUrl} setEmojiUrl={setEmojiUrl} color={color} setColor={setColor} />}
              {step === 3 && <ProjectStep3 tasks={tasks} selectedTaskIds={selectedTaskIds} setSelectedTaskIds={setSelectedTaskIds} />}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      {step > 0 && (
        <div className="p-6 pb-12 bg-white/50 backdrop-blur-sm border-t border-gray-100">
          <button 
            onClick={handleNext}
            disabled={!canContinue}
            className={cn(
              "w-full py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
              canContinue ? "bg-[#2d2d2d] text-white shadow-lg" : "bg-gray-200 text-gray-400"
            )}
          >
            <span>{step < 3 ? 'continue' : `save ${typeSelected}`}</span>
            {step < 3 ? <ArrowRight size={20} /> : <CheckCircle2 size={20} />}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function StepTypeSelect({ onSelect }: { onSelect: (type: 'habit' | 'task' | 'project') => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="px-6 flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">how do you want to start?</h2>
        <p className="text-gray-400">choose the best format for your goal</p>
      </div>
      
      <div className="w-full space-y-4">
        <button 
          onClick={() => onSelect('habit')}
          className="w-full bg-white p-8 rounded-[40px] shadow-sm flex items-center gap-6 group hover:ring-4 hover:ring-orange-100 transition-all text-left"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#f27d26] group-hover:scale-110 transition-transform">
            <Repeat size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d2d2d]">Habit</h2>
            <p className="text-sm text-[#8c8c8c]">Build consistency with a repeating routine every day or week.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelect('task')}
          className="w-full bg-white p-8 rounded-[40px] shadow-sm flex items-center gap-6 group hover:ring-4 hover:ring-blue-100 transition-all text-left"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d2d2d]">Task</h2>
            <p className="text-sm text-[#8c8c8c]">A one-time activity with a specific deadline and duration.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelect('project')}
          className="w-full bg-white p-8 rounded-[40px] shadow-sm flex items-center gap-6 group hover:ring-4 hover:ring-orange-100 transition-all text-left"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <Folder size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d2d2d]">Project</h2>
            <p className="text-sm text-[#8c8c8c]">Group related tasks into a bigger goal.</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// HABIT STEPS
function HabitStep1({ categoryId, setCategoryId }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f27d26]">
          <Layers size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">what area?</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">categorizing helps you track your balance</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategoryId(cat.id)} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl transition-all bg-white shadow-sm hover:scale-105 active:scale-95", categoryId === cat.id ? "ring-4 ring-orange-50 bg-orange-50/20" : "")}>
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors", categoryId === cat.id ? "bg-white" : "bg-gray-50")}>
              <img src={cat.emojiUrl} alt="" className="w-10 h-10 object-contain" />
            </div>
            <span className={cn("text-xs font-bold uppercase tracking-wider", categoryId === cat.id ? "text-[#f27d26]" : "text-gray-400")}>{cat.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function HabitStep2({ name, setName, emojiUrl, setEmojiUrl, color, setColor }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#2d2d2d] mb-1">the basics</h2>
        <p className="text-[#8c8c8c] text-sm">name your goal and pick a style</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-50">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Morning Yoga" 
            className="w-full bg-transparent p-5 outline-none text-lg font-medium text-[#2d2d2d] placeholder:text-gray-200" 
          />
        </div>

        <div className="bg-white rounded-[40px] p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">choose icon</label>
          <div className="grid grid-cols-5 gap-3">
            {EMOJIS.map(url => (
              <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90", emojiUrl === url ? "bg-orange-50" : "hover:bg-gray-50")}>
                <img src={url} alt="" className={cn("w-8 h-8 transition-transform", emojiUrl === url ? "scale-125" : "scale-100 opacity-60")} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">signature color</label>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {COLORS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setColor(c.id)} 
                className={cn(
                  "w-12 h-12 rounded-full flex-shrink-0 border-4 border-white shadow-md transition-all active:scale-90", 
                  color === c.id ? "scale-110 ring-2 ring-gray-100" : "opacity-40"
                )} 
                style={{ backgroundColor: c.primary }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HabitStep3({ repeatDays, toggleDay, duration, setDuration, unit, setUnit, isCustomUnit, setIsCustomUnit, reminders, setReminders }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide text-center">
      <div>
        <h2 className="text-xl font-bold text-[#2d2d2d] mb-1">frequency</h2>
        <p className="text-[#8c8c8c] text-sm">how often will you do this?</p>
      </div>

      <div className="bg-white rounded-[40px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">repeat routine</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{repeatDays.length} days / week</span>
        </div>
        <div className="flex justify-between">
          {DAYS.map((day, index) => (
            <button key={index} onClick={() => toggleDay(index)} className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all", repeatDays.includes(index) ? "bg-[#2d2d2d] text-white shadow-md scale-110" : "text-gray-300 hover:bg-gray-50")}>{day}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-6 shadow-sm space-y-6">
        <div className="text-left px-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-2">set a target</label>
          <div className="flex gap-4 items-center">
            <input type="text" inputMode="numeric" value={duration} onChange={e => {
              if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                setDuration(e.target.value);
              }
            }} className="text-4xl font-bold text-[#2d2d2d] w-24 outline-none bg-transparent" />
            <span className="text-xl font-medium text-orange-500">{unit}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {UNITS.map(u => (
            <button key={u} onClick={() => { setUnit(u); setIsCustomUnit(false); }} className={cn("px-4 py-2 rounded-2xl text-xs font-bold transition-all", unit === u && !isCustomUnit ? "bg-orange-100 text-[#f27d26]" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}>{u}</button>
          ))}
          <button 
            onClick={() => setIsCustomUnit(true)} 
            className={cn("px-4 py-2 rounded-2xl text-xs font-bold transition-all", isCustomUnit ? "bg-orange-100 text-[#f27d26]" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}
          >
            {isCustomUnit ? 'custom...' : '+ custom'}
          </button>
        </div>
        
        {isCustomUnit && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
            <input 
              type="text" 
              value={unit} 
              onChange={e => setUnit(e.target.value)} 
              placeholder="Enter unit (e.g. pages, km)" 
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm font-medium text-[#2d2d2d] focus:ring-2 focus:ring-orange-100 transition-all"
              autoFocus
            />
          </motion.div>
        )}
      </div>

      <button onClick={() => setReminders(!reminders)} className="w-full bg-white p-6 rounded-[40px] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", reminders ? "bg-orange-50 text-orange-500" : "bg-gray-50 text-gray-300")}>
            <Clock size={24} />
          </div>
          <div className="text-left">
            <p className="font-bold text-[#2d2d2d]">Daily Reminders</p>
            <p className="text-xs text-gray-400">Get notified at optimal times</p>
          </div>
        </div>
        <div className={cn("w-12 h-6 rounded-full relative transition-colors", reminders ? "bg-[#f27d26]" : "bg-gray-200")}>
          <motion.div animate={{ x: reminders ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
        </div>
      </button>
    </motion.div>
  );
}

// TASK STEPS - REFACTORED FOR BETTER LOGIC
function TaskStep1({ name, setName, description, setDescription, projects, projectId, setProjectId }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
          <Target size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">what's the goal?</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">define your one-time task and its purpose</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50 group focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Task name" 
            className="w-full bg-transparent p-6 outline-none text-xl font-bold text-[#2d2d2d] placeholder:text-gray-200" 
          />
        </div>
        
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50 group focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Detailed description (optional)" 
            className="w-full bg-transparent p-6 outline-none text-base font-medium text-[#2d2d2d] h-32 resize-none placeholder:text-gray-200 scrollbar-hide" 
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-3 px-4">Link to Project (Optional)</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setProjectId('')}
              className={cn(
                "px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                projectId === '' ? "bg-[#2d2d2d] text-white shadow-md" : "bg-white text-gray-400 border border-gray-50 shadow-sm"
              )}
            >
              No Project
            </button>
            {projects.map((p: Project) => (
              <button 
                key={p.id}
                onClick={() => setProjectId(p.id)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  projectId === p.id ? "bg-[#2d2d2d] text-white shadow-md" : "bg-white text-gray-400 border border-gray-50 shadow-sm"
                )}
              >
                <img src={p.emojiUrl} alt="" className="w-4 h-4" />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// PROJECT STEPS
function ProjectStep1({ name, setName, description, setDescription, deadline, setDeadline }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500">
          <Folder size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">new project</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">group related tasks under a bigger goal</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50 group focus-within:ring-4 focus-within:ring-purple-50 transition-all">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Project name" 
            className="w-full bg-transparent p-6 outline-none text-xl font-bold text-[#2d2d2d] placeholder:text-gray-200" 
          />
        </div>
        
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50 group focus-within:ring-4 focus-within:ring-purple-50 transition-all">
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="What is this project about? (optional)" 
            className="w-full bg-transparent p-6 outline-none text-base font-medium text-[#2d2d2d] h-32 resize-none placeholder:text-gray-200 scrollbar-hide" 
          />
        </div>

        <div className="bg-white rounded-[32px] px-8 py-5 shadow-sm border border-gray-50 group focus-within:ring-4 focus-within:ring-purple-50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">Target Date (Optional)</span>
            <Calendar size={14} className="text-purple-500" />
          </div>
          <input 
            type="date" 
            value={deadline || ''} 
            onChange={e => setDeadline(e.target.value)} 
            className="w-full bg-transparent outline-none text-xl font-bold text-[#2d2d2d] placeholder:text-gray-200" 
          />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectStep2({ emojiUrl, setEmojiUrl, color, setColor }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#2d2d2d] mb-1">style it</h2>
        <p className="text-[#8c8c8c] text-sm">make this project stand out</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-[40px] p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">choose icon</label>
          <div className="grid grid-cols-5 gap-3">
            {EMOJIS.map(url => (
              <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90", emojiUrl === url ? "bg-purple-50 ring-2 ring-purple-500/20" : "hover:bg-gray-50")}>
                <img src={url} alt="" className={cn("w-8 h-8 transition-transform", emojiUrl === url ? "scale-125" : "scale-100 opacity-60")} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">signature color</label>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {COLORS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setColor(c.id)} 
                className={cn(
                  "w-12 h-12 rounded-full flex-shrink-0 border-4 border-white shadow-md transition-all active:scale-90", 
                  color === c.id ? "scale-110 ring-2 ring-gray-100 opacity-100" : "opacity-40"
                )} 
                style={{ backgroundColor: c.primary }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskStep2({ deadline, setDeadline, estimatedTime, setEstimatedTime }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
          <CalendarDays size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">when & for how long?</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">set your timeline and estimated duration</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-[40px] p-8 shadow-sm group active:scale-[0.98] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">completion date</span>
            <AlertTriangle size={14} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="text-blue-500" size={32} />
            <input 
              type="date" 
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
              className="text-2xl font-bold text-[#2d2d2d] bg-transparent outline-none w-full" 
            />
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-sm group active:scale-[0.98] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">estimated time</span>
            <Clock size={14} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-end">
              <input 
              type="text" 
              inputMode="numeric"
              value={estimatedTime} 
              onChange={e => {
                if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                  setEstimatedTime(e.target.value);
                }
              }} 
              className="text-4xl font-bold text-[#2d2d2d] w-24 outline-none bg-transparent" 
            />
              <span className="text-xl font-medium text-blue-500 mb-1">mins</span>
            </div>
            <div className="flex-1 flex justify-end gap-1">
              {[30, 60, 120].map(m => (
                <button 
                  key={m} 
                  onClick={() => setEstimatedTime(m)}
                  className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all", estimatedTime === m ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-400")}
                >
                  {m === 120 ? '2h' : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskStep3({ emojiUrl, setEmojiUrl, color, setColor, priority, setPriority, name, deadline }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-8 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
          <Palette size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">priority & style</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">make it yours and define importance</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-3 px-4">priority level</label>
          <div className="flex bg-white rounded-3xl p-1.5 shadow-sm gap-1">
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <button 
                key={p} 
                onClick={() => setPriority(p)} 
                className={cn(
                  "flex-1 py-3 text-xs font-bold rounded-2xl capitalize transition-all", 
                  priority === p ? (
                    p === 'high' ? "bg-red-500 text-white shadow-md shadow-red-200" : 
                    p === 'medium' ? "bg-[#2d2d2d] text-white shadow-md" : 
                    "bg-blue-500 text-white shadow-md shadow-blue-200"
                  ) : "text-gray-400 bg-transparent"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">visual identity</label>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {EMOJIS.slice(0, 10).map(url => (
              <button key={url} onClick={() => setEmojiUrl(url)} className={cn("aspect-square rounded-2xl flex items-center justify-center transition-all", emojiUrl === url ? "bg-blue-50 ring-2 ring-blue-500/20" : "hover:bg-gray-50")}>
                <img src={url} alt="" className={cn("w-8 h-8 transition-all", emojiUrl === url ? "scale-110" : "opacity-40 grayscale")} />
              </button>
            ))}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {COLORS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setColor(c.id)} 
                className={cn("w-10 h-10 rounded-full flex-shrink-0 border-4 border-white shadow-sm transition-all", color === c.id ? "scale-110 opacity-100" : "opacity-30")} 
                style={{ backgroundColor: c.primary }}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Summary Preview */}
        <div className="bg-[#2d2d2d] rounded-[32px] p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">task preview</span>
            <div className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase", priority === 'high' ? 'bg-red-500' : 'bg-gray-700')}>
              {priority} priority
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <img src={emojiUrl} alt="" className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold leading-tight">{name || 'Unnamed Task'}</p>
              <p className="text-[10px] opacity-60">Complete by {format(new Date(deadline), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectStep3({ tasks, selectedTaskIds, setSelectedTaskIds }: { tasks: Task[], selectedTaskIds: string[], setSelectedTaskIds: (ids: string[]) => void }) {
  // Show tasks that are NOT already linked to a project
  const unlinkedTasks = tasks.filter(t => !t.projectId && !t.completedAt);

  const toggleTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-6 overflow-y-auto max-h-full pb-10 scrollbar-hide">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500">
          <Link2 size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#2d2d2d]">link tasks</h2>
        <p className="text-[#8c8c8c] text-sm leading-relaxed">optionally attach existing tasks to this project</p>
      </div>

      {unlinkedTasks.length === 0 ? (
        <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
          <p className="text-[#8c8c8c] text-sm">no unlinked tasks available</p>
          <p className="text-[10px] text-[#b0b0b0] mt-2">you can link tasks later from the task detail view</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">available tasks</span>
            <span className="text-[10px] font-bold text-[#f27d26]">{selectedTaskIds.length} selected</span>
          </div>
          {unlinkedTasks.map(task => {
            const isSelected = selectedTaskIds.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left",
                  isSelected ? "bg-purple-50 ring-2 ring-purple-200" : "bg-white shadow-sm border border-gray-100"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isSelected ? "bg-purple-500 text-white" : "bg-gray-100"
                )}>
                  {isSelected && <CheckCircle2 size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2d2d2d] truncate">{task.name}</p>
                  <p className="text-[10px] text-[#8c8c8c]">due {format(new Date(task.deadline), 'MMM d').toLowerCase()}</p>
                </div>
                <img src={task.emojiUrl} alt="" className="w-6 h-6 object-contain opacity-40" />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
