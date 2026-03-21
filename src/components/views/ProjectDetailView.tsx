import { ArrowLeft, Edit2, Trash2, Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { Project, Task } from '../../types';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';
import { format } from 'date-fns';

export default function ProjectDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject } = useProjects();
  const { tasks, toggleTask } = useTasks();

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);

  if (!project) return null;

  const color = getColorById(project.color);
  const completedCount = projectTasks.filter(t => !!t.completedAt).length;
  const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? Tasks will be unlinked but not deleted.')) {
      await deleteProject(project.id);
      navigate('/projects');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col overflow-hidden lowercase"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={() => navigate('/projects')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium text-[#2d2d2d]">Project Details</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/project/${project.id}/edit`)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2d2d]">
            <Edit2 size={18} />
          </button>
          <button onClick={handleDelete} className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shadow-sm text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Project Card */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm mb-8 border border-gray-100 flex flex-col items-center text-center">
          <div 
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-md"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            <img src={project.emojiUrl} alt="" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2d2d] mb-2">{project.name}</h2>
          {project.description && (
            <p className="text-[#8c8c8c] text-sm mb-6 max-w-xs">{project.description}</p>
          )}

          <div className="w-full space-y-3">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#8c8c8c]">
                <span>Progress</span>
                <span>{completedCount} / {projectTasks.length} tasks</span>
             </div>
             <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden p-[3px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color.primary }}
                />
             </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2d2d2d]">Tasks in Project</h3>
            <button 
              onClick={() => navigate('/add/task', { state: { projectId: project.id } })}
              className="text-xs font-bold text-[#f27d26] flex items-center gap-1"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          {projectTasks.length === 0 ? (
             <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-[#8c8c8c] text-sm lowercase">No tasks found for this project</p>
             </div>
          ) : (
            <div className="grid gap-3">
              {projectTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className={cn(
                    "p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4 group",
                    task.completedAt && "opacity-60"
                  )}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completedAt ? (
                      <CheckCircle2 size={24} className="text-[#f27d26]" />
                    ) : (
                      <Circle size={24} className="text-gray-300 group-hover:text-[#f27d26] transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-sm font-bold text-[#2d2d2d] truncate", task.completedAt && "line-through")}>
                      {task.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={12} className="text-[#8c8c8c]" />
                       <span className="text-[10px] text-[#8c8c8c] font-medium">
                          due {format(new Date(task.deadline), 'MMM d')}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
