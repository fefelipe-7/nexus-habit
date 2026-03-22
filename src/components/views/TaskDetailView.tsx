import { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, CalendarDays, Clock, Trash2, CheckCircle2, AlertTriangle, Folder, Link2, Unlink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Task, Project, Priority } from '../../types';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { NEXUS_COLORS, getColorById } from '../../constants/colors';

type Props = {
  task: Task;
  projects: Project[];
  onUpdate: (updates: Partial<Task>) => void;
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
  high: { label: 'high', color: 'text-red-600', bg: 'bg-red-50' },
  medium: { label: 'medium', color: 'text-orange-600', bg: 'bg-orange-50' },
  low: { label: 'low', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function TaskDetailView({ task, projects, onUpdate, onClose, onDelete }: Props) {
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

  // Deadline countdown
  const deadlineDate = new Date(task.deadline);
  const daysRemaining = differenceInDays(deadlineDate, new Date());
  const isOverdue = isPast(deadlineDate) && !isToday(deadlineDate) && !task.completedAt;
  const deadlineLabel = task.completedAt 
    ? 'completed' 
    : isOverdue 
      ? `${Math.abs(daysRemaining)} days overdue` 
      : daysRemaining === 0 
        ? 'due today' 
        : daysRemaining === 1 
          ? 'due tomorrow' 
          : `${daysRemaining} days remaining`;

  // Linked project
  const linkedProject = projects.find(p => p.id === task.projectId);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col overflow-hidden lowercase"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-[#2d2d2d] active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[#2d2d2d]">task details</h1>
        <button 
          onClick={toggleEdit} 
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-all active:scale-90 border",
            isEditing ? "bg-[#2d2d2d] text-white border-[#2d2d2d]" : "bg-white text-[#2d2d2d] border-gray-100"
          )}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        {/* Task Name + Emoji Row */}
        <div className="flex items-center gap-4 mt-4 mb-6">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: getColorById(editedTask.color).bg }}
          >
            <img src={editedTask.emojiUrl} alt="" className="w-9 h-9 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input 
                value={editedTask.name} 
                onChange={e => setEditedTask({...editedTask, name: e.target.value})}
                className="w-full bg-white rounded-xl p-3 text-xl font-bold text-[#2d2d2d] shadow-sm outline-none border border-gray-100"
              />
            ) : (
              <h2 className="text-2xl font-bold text-[#2d2d2d] truncate">{editedTask.name}</h2>
            )}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-1",
              priorityConfig[editedTask.priority].bg,
              priorityConfig[editedTask.priority].color
            )}>
              <AlertTriangle size={10} />
              {priorityConfig[editedTask.priority].label}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {task.completedAt && (
          <div className="bg-green-50 text-green-600 font-bold text-xs py-3 px-5 rounded-2xl border border-green-100 flex items-center gap-2 mb-6">
            <CheckCircle2 size={16} />
            completed on {format(new Date(task.completedAt), 'MMM d, yyyy').toLowerCase()}
          </div>
        )}

        {/* Info Cards Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Deadline Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[#b0b0b0]">
              <CalendarDays size={14} />
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
              <>
                <p className="text-sm font-bold text-[#2d2d2d]">{format(deadlineDate, 'MMM d, yyyy').toLowerCase()}</p>
                <p className={cn("text-[10px] font-bold", isOverdue ? "text-red-500" : "text-[#f27d26]")}>
                  {deadlineLabel}
                </p>
              </>
            )}
          </div>

          {/* Duration Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[#b0b0b0]">
              <Clock size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">estimated</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={editedTask.estimatedTime} 
                  onChange={e => setEditedTask({...editedTask, estimatedTime: parseInt(e.target.value) || 0})}
                  className="w-14 text-sm font-bold text-[#2d2d2d] outline-none"
                />
                <span className="text-xs text-[#8c8c8c] font-bold">mins</span>
              </div>
            ) : (
              <p className="text-sm font-bold text-[#2d2d2d]">
                {editedTask.estimatedTime >= 60 
                  ? `${Math.floor(editedTask.estimatedTime / 60)}h ${editedTask.estimatedTime % 60}m` 
                  : `${editedTask.estimatedTime} mins`}
              </p>
            )}
          </div>
        </div>

        {/* Project Link */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 text-[#b0b0b0] mb-3">
            <Folder size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">project</span>
          </div>
          {isEditing ? (
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setEditedTask({...editedTask, projectId: undefined})}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                  !editedTask.projectId ? "bg-[#2d2d2d] text-white shadow-md" : "bg-gray-50 text-[#8c8c8c]"
                )}
              >
                no project
              </button>
              {projects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setEditedTask({...editedTask, projectId: p.id})}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    editedTask.projectId === p.id ? "bg-[#2d2d2d] text-white shadow-md" : "bg-gray-50 text-[#8c8c8c]"
                  )}
                >
                  <img src={p.emojiUrl} alt="" className="w-4 h-4" />
                  {p.name}
                </button>
              ))}
            </div>
          ) : linkedProject ? (
            <button 
              onClick={() => navigate(`/project/${linkedProject.id}`)}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <img src={linkedProject.emojiUrl} alt="" className="w-6 h-6 object-contain" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#2d2d2d] group-hover:text-[#f27d26] transition-colors">{linkedProject.name}</p>
                <p className="text-[10px] text-[#8c8c8c] flex items-center gap-1"><Link2 size={10} /> linked</p>
              </div>
            </button>
          ) : (
            <p className="text-sm text-[#b0b0b0] flex items-center gap-2"><Unlink size={14} /> no project linked</p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 text-[#b0b0b0] mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest">description</span>
          </div>
          {isEditing ? (
            <textarea 
              value={editedTask.description} 
              onChange={e => setEditedTask({...editedTask, description: e.target.value})}
              className="w-full bg-transparent text-sm font-medium text-[#2d2d2d] h-28 resize-none outline-none"
              placeholder="add a description..."
            />
          ) : (
            <p className="text-sm font-medium text-[#2d2d2d] leading-relaxed">
              {editedTask.description || <span className="text-[#b0b0b0] italic">no description provided</span>}
            </p>
          )}
        </div>

        {/* Edit Mode: Priority + Visuals */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden mb-6"
            >
              {/* Priority */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">priority</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setEditedTask({...editedTask, priority: p})}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all",
                        editedTask.priority === p ? 
                          (p === 'high' ? 'bg-red-500 text-white shadow-md' : p === 'medium' ? 'bg-[#2d2d2d] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') 
                          : 'bg-gray-50 text-[#8c8c8c]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visuals */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">visuals</span>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map(url => (
                    <button key={url} onClick={() => setEditedTask({...editedTask, emojiUrl: url})} className={cn("aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-2", editedTask.emojiUrl === url && "ring-2 ring-[#f27d26] bg-white shadow-sm")}>
                      <img src={url} alt="" className={cn("w-full h-full object-contain", editedTask.emojiUrl !== url && "opacity-40 grayscale")} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {COLORS.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setEditedTask({...editedTask, color: c.id})} 
                      className={cn("w-9 h-9 rounded-full flex-shrink-0 border-4 border-white shadow-sm transition-transform", editedTask.color === c.id ? "scale-110 shadow-md" : "opacity-30")} 
                      style={{ backgroundColor: c.primary }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="space-y-3 mt-4">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="w-full bg-[#2d2d2d] text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              <CheckCircle2 size={18} />
              save changes
            </button>
          ) : (
            <>
              {!task.completedAt && (
                <button 
                  onClick={() => onUpdate({ completedAt: new Date().toISOString() })}
                  className="w-full bg-[#f27d26] text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 size={18} />
                  mark as complete
                </button>
              )}
              <button 
                onClick={() => {
                  if (window.confirm('delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="w-full bg-red-50 text-red-500 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl border border-red-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <Trash2 size={18} />
                delete task
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
