import { useState } from 'react';
import { Plus, Folder, MoreHorizontal, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { Project } from '../../types';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';
import { EmptyState } from '../ui/EmptyState';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';

export default function ProjectsView() {
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { tasks, toggleTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const navigateWeek = (dir: number) => {
    setSelectedDate(prev => addDays(prev, dir * 7));
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => !!t.completedAt).length;
    return { completed, total: projectTasks.length };
  };

  // Tasks due today from any project
  const todayTasks = tasks.filter(t => {
    if (!t.projectId) return false;
    const deadlineDate = new Date(t.deadline);
    return isSameDay(deadlineDate, selectedDate) || isToday(new Date(t.deadline));
  });

  if (projectsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#f27d26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto lowercase">
      {/* Header */}
      <div className="px-6 pt-12 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
            <Folder size={18} className="text-[#2d2d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2d2d2d]">projects</h1>
        </div>
        <span className="text-sm font-medium text-[#8c8c8c]">{format(selectedDate, 'MMMM, yyyy').toLowerCase()}</span>
      </div>

      {/* Calendar Strip */}
      <div className="px-4 py-4 flex items-center gap-1">
        <button onClick={() => navigateWeek(-1)} className="w-8 h-8 flex items-center justify-center text-[#8c8c8c] hover:text-[#2d2d2d] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 flex justify-between">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="flex flex-col items-center gap-1 relative"
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-[#2d2d2d]" : "text-[#b0b0b0]")}>
                  {format(day, 'EEE').toLowerCase()}
                </span>
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                  isSelected ? "bg-[#2d2d2d] text-white shadow-md" : "text-[#2d2d2d]"
                )}>
                  {format(day, 'd')}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={() => navigateWeek(1)} className="w-8 h-8 flex items-center justify-center text-[#8c8c8c] hover:text-[#2d2d2d] transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Pinned Project Section */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[#8c8c8c] uppercase tracking-wider">pinned project</span>
        <button 
          onClick={() => navigate('/add/project')}
          className="text-xs font-bold text-[#f27d26] flex items-center gap-1"
        >
          <Plus size={14} /> new
        </button>
      </div>

      {/* Project Cards Grid */}
      <div className="px-6">
        {projects.length === 0 ? (
          <EmptyState 
            icon={Folder} 
            title="no projects yet" 
            description="create a project to group related tasks together."
            action={{
              label: "create project",
              onClick: () => navigate('/add/project'),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {projects.map((project) => {
              const stats = getProjectStats(project.id);
              return (
                <motion.div
                  key={project.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <img src={project.emojiUrl} alt="" className="w-6 h-6 object-contain" />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="w-7 h-7 flex items-center justify-center text-[#c0c0c0] hover:text-[#2d2d2d] transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2d2d] leading-tight truncate">{project.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Sparkles size={12} className="text-[#f27d26]" />
                      <span className="text-[11px] text-[#8c8c8c] font-medium">
                        {stats.completed}/{stats.total} completed
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Tasks Section */}
      {todayTasks.length > 0 && (
        <div className="px-6 pt-8 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2d2d2d] uppercase tracking-wider">task</span>
              <span className="w-5 h-5 bg-[#2d2d2d] text-white text-[10px] font-bold rounded-md flex items-center justify-center">{todayTasks.length}</span>
            </div>
            <span className="text-xs font-bold text-[#8c8c8c] uppercase tracking-wider">today</span>
          </div>

          <div className="space-y-3">
            {todayTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const projectStats = task.projectId ? getProjectStats(task.projectId) : null;
              return (
                <motion.div
                  key={task.id}
                  layout
                  className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    {project && (
                      <span className="text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">{project.name}</span>
                    )}
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.completedAt ? (
                        <CheckCircle2 size={22} className="text-[#f27d26]" />
                      ) : (
                        <Circle size={22} className="text-[#d0d0d0]" />
                      )}
                    </button>
                  </div>
                  <h4 className={cn("text-base font-bold text-[#2d2d2d] mb-1", task.completedAt && "line-through opacity-50")}>
                    {task.name}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-[#8c8c8c] leading-relaxed mb-3">{task.description}</p>
                  )}
                  {projectStats && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Sparkles size={12} className="text-[#f27d26]" />
                      <span className="text-[11px] text-[#f27d26] font-bold">
                        {projectStats.completed}/{projectStats.total} completed
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom padding when no tasks */}
      {todayTasks.length === 0 && <div className="pb-24" />}
    </div>
  );
}
