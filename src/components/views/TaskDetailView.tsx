import { useState, useEffect } from 'react';
import { X, ArrowLeft, MoreHorizontal, Calendar, Clock, Trash2, CheckCircle2, AlertTriangle, Target, CalendarDays, Palette } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Task, Priority } from '../../types';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { NEXUS_COLORS, getColorById } from '../../constants/colors';

type Props = {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
  onDelete: (taskId: string) => void;
};

const COLORS = NEXUS_COLORS;
const EMOJIS = [
  '/newhabitwizard/body.png', '/newhabitwizard/book.png', '/newhabitwizard/diamond.png',
  '/newhabitwizard/dislike.png', '/newhabitwizard/idea.png', '/newhabitwizard/job.png',
  '/newhabitwizard/medicine.png', '/newhabitwizard/pencil.png', '/newhabitwizard/pig.png',
  '/newhabitwizard/pray.png', '/newhabitwizard/running.png', '/newhabitwizard/secret.png',
  '/newhabitwizard/skills.png', '/newhabitwizard/sleep.png', '/newhabitwizard/student.png',
  '/newhabitwizard/sugar.png', '/newhabitwizard/test.png', '/newhabitwizard/water.png',
];

const priorityConfig: Record<Priority, { label: string, color: string, bg: string }> = {
  high: { label: 'High Priority', color: 'text-red-600', bg: 'bg-red-50' },
  medium: { label: 'Medium Priority', color: 'text-orange-600', bg: 'bg-orange-50' },
  low: { label: 'Low Priority', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function TaskDetailView({ task, onUpdate, onClose, onDelete }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.endsWith('/edit');
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = () => {
    onUpdate(editedTask);
    navigate(`/task/${task.id}`, { replace: true });
  };

  const toggleEdit = () => {
    if (isEditing) {
      navigate(`/task/${task.id}`, { replace: true });
    } else {
      navigate(`/task/${task.id}/edit`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col overflow-hidden lowercase"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d] active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium text-[#2d2d2d]">task details</h1>
        <button 
          onClick={toggleEdit} 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90",
            isEditing ? "bg-[#2d2d2d] text-white" : "bg-white text-[#2d2d2d]"
          )}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        {/* Top Visual Section */}
        <div className="flex flex-col items-center mt-8">
          <motion.div 
            layoutId={`task-icon-${task.id}`}
            className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-6 shadow-sm transition-colors duration-500"
            style={{ backgroundColor: getColorById(editedTask.color).bg, color: getColorById(editedTask.color).text }}
          >
            <img src={editedTask.emojiUrl} alt="" className="w-14 h-14 object-contain" />
          </motion.div>
          
          <div className="w-full text-center space-y-2">
            {isEditing ? (
              <input 
                value={editedTask.name} 
                onChange={e => setEditedTask({...editedTask, name: e.target.value})}
                className="w-full bg-white rounded-2xl p-4 text-2xl font-bold text-[#2d2d2d] text-center shadow-sm outline-none"
              />
            ) : (
              <h2 className="text-3xl font-bold text-[#2d2d2d] px-4 tracking-tight">{editedTask.name}</h2>
            )}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              priorityConfig[editedTask.priority].bg,
              priorityConfig[editedTask.priority].color
            )}>
              <AlertTriangle size={12} />
              {priorityConfig[editedTask.priority].label}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarDays size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">deadline</span>
              </div>
              {isEditing ? (
                <input 
                  type="date" 
                  value={editedTask.deadline} 
                  onChange={e => setEditedTask({...editedTask, deadline: e.target.value})}
                  className="w-full text-sm font-bold text-[#2d2d2d] outline-none"
                />
              ) : (
                <p className="text-lg font-bold text-[#2d2d2d]">{format(new Date(editedTask.deadline), 'MMM d, yyyy')}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">duration</span>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={editedTask.estimatedTime} 
                    onChange={e => setEditedTask({...editedTask, estimatedTime: parseInt(e.target.value) || 0})}
                    className="w-12 text-sm font-bold text-[#2d2d2d] outline-none"
                  />
                  <span className="text-xs text-gray-400 font-bold uppercase">mins</span>
                </div>
              ) : (
                <p className="text-lg font-bold text-[#2d2d2d]">{editedTask.estimatedTime}m</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Target size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">description</span>
            </div>
            {isEditing ? (
              <textarea 
                value={editedTask.description} 
                onChange={e => setEditedTask({...editedTask, description: e.target.value})}
                className="w-full bg-transparent text-sm font-medium text-[#2d2d2d] h-32 resize-none outline-none"
                placeholder="No description provided..."
              />
            ) : (
              <p className="text-sm font-medium text-[#2d2d2d] leading-relaxed">
                {editedTask.description || <span className="text-gray-300 italic">No description provided</span>}
              </p>
            )}
          </div>

          {/* Edit Mode Customizations */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">change priority</span>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as Priority[]).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setEditedTask({...editedTask, priority: p})}
                        className={cn(
                          "flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all",
                          editedTask.priority === p ? 
                            (p === 'high' ? 'bg-red-500 text-white shadow-md shadow-red-100' : p === 'medium' ? 'bg-[#2d2d2d] text-white shadow-md' : 'bg-blue-500 text-white shadow-md shadow-blue-100') 
                            : 'bg-gray-50 text-gray-400'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[40px] shadow-sm">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-4">visuals</label>
                  <div className="grid grid-cols-6 gap-3 mb-6">
                    {EMOJIS.map(url => (
                      <button key={url} onClick={() => setEditedTask({...editedTask, emojiUrl: url})} className={cn("aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-2", editedTask.emojiUrl === url && "ring-2 ring-blue-500 bg-white shadow-sm")}>
                        <img src={url} alt="" className={cn("w-full h-full object-contain", editedTask.emojiUrl !== url && "opacity-40 grayscale")} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {COLORS.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setEditedTask({...editedTask, color: c.id})} 
                        className={cn("w-10 h-10 rounded-full flex-shrink-0 border-4 border-white shadow-sm transition-transform", editedTask.color === c.id ? "scale-110 shadow-md" : "opacity-30")} 
                        style={{ backgroundColor: c.primary }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 space-y-3">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="w-full bg-[#2d2d2d] text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-[32px] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              <CheckCircle2 size={18} />
              Save Changes
            </button>
          ) : (
            <>
              {task.completedAt ? (
                <div className="bg-green-50 text-green-600 font-black uppercase tracking-widest text-[10px] py-5 rounded-[32px] border border-green-100 flex items-center justify-center gap-3">
                  <CheckCircle2 size={18} />
                  Task Completed on {format(new Date(task.completedAt), 'MMM d')}
                </div>
              ) : (
                <button 
                  onClick={() => onUpdate({...task, completedAt: new Date().toISOString()})}
                  className="w-full bg-[#f27d26] text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-[32px] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 size={18} />
                  Mark as Complete
                </button>
              )}
              <button 
                onClick={() => {
                  if (window.confirm('Delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="w-full bg-red-50 text-red-500 font-black uppercase tracking-widest text-[10px] py-5 rounded-[32px] border border-red-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <Trash2 size={18} />
                Delete Task
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
