import { Plus, Folder, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { Project } from '../../types';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';
import { EmptyState } from '../ui/EmptyState';

export default function ProjectsView() {
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { tasks } = useTasks();

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => !!t.completedAt).length;
    const total = projectTasks.length;
    return {
      completed,
      total,
      progress: total > 0 ? (completed / total) * 100 : 0
    };
  };

  if (projectsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#f27d26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-12">
      <div className="px-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#2d2d2d]">Projects</h1>
          <p className="text-[#8c8c8c] text-sm mt-1">Organize your journey into goals</p>
        </div>
        <button 
          onClick={() => navigate('/add/project')}
          className="w-12 h-12 bg-[#2d2d2d] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {projects.length === 0 ? (
          <EmptyState 
            icon={Folder} 
            title="No projects yet" 
            description="Create a project to group related tasks together."
            actionLabel="Create Project"
            onAction={() => navigate('/add/project')}
          />
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {
              const stats = getProjectStats(project.id);
              const color = getColorById(project.color);
              
              return (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        <img src={project.emojiUrl} alt="" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#2d2d2d]">{project.name}</h3>
                        <p className="text-xs text-[#8c8c8c] uppercase font-bold tracking-wider">
                          {stats.total} {stats.total === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 text-gray-300 group-hover:text-[#f27d26] transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#8c8c8c]">
                      <span>Progress</span>
                      <span>{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden p-[2px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color.primary }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
