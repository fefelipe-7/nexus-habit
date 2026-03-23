import { useState } from 'react';
import { Folder, Edit2, Trash2, Plus, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';
import { format } from 'date-fns';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function ProjectDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const { tasks, toggleTask } = useTasks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);

  if (!project) return null;

  const color = getColorById(project.color);
  const completedCount = projectTasks.filter(t => !!t.completedAt).length;

  // Find latest deadline among tasks as "due on"
  const latestDeadline = projectTasks.length > 0
    ? projectTasks.reduce((latest, t) => {
        const d = new Date(t.deadline);
        return d > latest ? d : latest;
      }, new Date(projectTasks[0].deadline))
    : null;

  const handleDelete = async () => {
    await deleteProject(project.id);
    navigate('/projects');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col overflow-hidden lowercase pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
            <img src={project.emojiUrl} alt="" className="w-6 h-6 object-contain" />
          </button>
          <h1 className="text-xl font-bold text-[#2d2d2d]">{project.name}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/project/${project.id}/edit`)} 
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-[#2d2d2d] hover:text-[#f27d26] transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Date Badges */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-wider mb-1">created on</span>
            <span className="text-sm font-bold text-[#2d2d2d]">{format(new Date(project.createdAt), 'd MMM').toLowerCase()}</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-wider mb-1">due on</span>
            <span className="text-sm font-bold text-[#2d2d2d]">
              {latestDeadline ? format(latestDeadline, 'd MMM').toLowerCase() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Indicator */}
      <div className="px-6 pb-4 flex items-center gap-2">
        <Sparkles size={14} className="text-[#f27d26]" />
        <span className="text-sm font-bold text-[#2d2d2d]">{completedCount}/{projectTasks.length} completed</span>
      </div>

      {/* Task Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Column Headers */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 mb-1">
          <span className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-wider w-10">task</span>
          <span className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-wider flex-1">description</span>
          <span className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-wider text-right w-16">status</span>
        </div>

        {/* Add Task Button */}
        <button 
          onClick={() => navigate('/add/task', { state: { projectId: project.id } })}
          className="w-full flex items-center gap-2 px-4 py-3 text-[#f27d26] text-xs font-bold hover:bg-orange-50/50 rounded-xl transition-colors mb-1"
        >
          <Plus size={14} /> add task
        </button>

        {projectTasks.length === 0 ? (
          <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-gray-100 text-center mt-4">
            <p className="text-[#8c8c8c] text-sm">no tasks found for this project</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projectTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                className={cn(
                  "flex items-start px-4 py-4 rounded-xl transition-colors hover:bg-white/80",
                  index % 2 === 0 ? "bg-white/40" : ""
                )}
              >
                {/* Row Number */}
                <div className="w-10 flex-shrink-0">
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                    task.completedAt ? "bg-[#f27d26]/10 text-[#f27d26]" : "bg-gray-100 text-[#8c8c8c]"
                  )}>
                    {index + 1}
                  </span>
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn("text-sm font-bold text-[#2d2d2d] leading-tight", task.completedAt && "line-through opacity-50")}>
                    {task.name}
                  </h4>
                  {task.description && (
                    <p className={cn("text-[11px] text-[#8c8c8c] mt-0.5 truncate", task.completedAt && "opacity-50")}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="w-16 flex flex-col items-end flex-shrink-0">
                  <button onClick={() => toggleTask(task.id)} className="group">
                    {task.completedAt ? (
                      <CheckCircle2 size={22} className="text-[#f27d26]" />
                    ) : (
                      <Circle size={22} className="text-[#d0d0d0] group-hover:text-[#f27d26] transition-colors" />
                    )}
                  </button>
                  {task.completedAt && (
                    <span className="text-[9px] text-[#8c8c8c] font-medium mt-1">
                      {format(new Date(task.completedAt), 'd MMM').toLowerCase()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="delete project?"
        message="are you sure? tasks will be unlinked but not deleted."
        confirmText="delete project"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
}
