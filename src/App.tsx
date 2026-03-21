import { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import HomeView from './components/views/HomeView';
import AddWizardView from './components/views/AddWizardView';
import StatisticsView from './components/views/StatisticsView';
import StreakView from './components/views/StreakView';
import TasksView from './components/views/TasksView';
import ProfileView from './components/views/ProfileView';
import HabitDetailView from './components/views/HabitDetailView';
import TaskDetailView from './components/views/TaskDetailView';
import LoginView from './components/views/LoginView';
import BottomNav from './components/layout/BottomNav';
import { Habit, Task } from './types';
import { useAuth } from './hooks/useAuth';
import { useHabits } from './hooks/useHabits';
import { useTasks } from './hooks/useTasks';
import { Loader2 } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

function TaskDetailRoute({ tasks, onUpdate, onDelete }: { tasks: Task[], onUpdate: (task: any) => void, onDelete: (id: string) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find(t => t.id === id);
  if (!task) return null;
  return <TaskDetailView task={task} onUpdate={(updates) => onUpdate({ id, updates })} onDelete={onDelete} onClose={() => navigate('/tasks')} />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { user, username, loading: authLoading } = useAuth();
  const { habits, completions, stats, isLoading: habitsLoading, createHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const { tasks, toggleTask, createTask, updateTask, deleteTask, isLoading: tasksLoading } = useTasks();

  const background = location.state?.background;

  const navigateToModal = (path: string) => {
    navigate(path, { state: { background: location } });
  };

  const path = background?.pathname || location.pathname;
  let currentTab: 'home' | 'tasks' | 'stats' | 'streak' | 'profile' | 'add' = 'home';
  if (path === '/tasks') currentTab = 'tasks';
  else if (path === '/journey') currentTab = 'stats';
  else if (path === '/streak') currentTab = 'streak';
  else if (path === '/profile') currentTab = 'profile';

  const isModalOpen = !!background || location.pathname === '/add' || location.pathname.startsWith('/habit/') || location.pathname.startsWith('/task/') || location.pathname === '/profile';

  if (authLoading) {
    return (
      <div className="h-[100dvh] bg-[#f8f6f2] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#f27d26]" size={32} />
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={() => {}} />;
  }

  return (
    <div className="h-[100dvh] bg-gray-100 text-[#2d2d2d] font-sans flex justify-center lowercase selection:bg-[#f27d26] selection:text-white overflow-hidden">
      <div className="w-full bg-[#f8f6f2] h-full relative shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex-1 relative overflow-hidden">
          {/* Main Background Views */}
          <AnimatePresence>
            <Routes location={background || location} key={background?.pathname || location.pathname}>
              <Route path="/" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <HomeView 
                    habits={habits} 
                    tasks={tasks}
                    completions={completions} 
                    selectedDate={selectedDate} 
                    setSelectedDate={setSelectedDate}
                    toggleCompletion={(id, date) => toggleCompletion({ habitId: id, date: format(date, 'yyyy-MM-dd') })}
                    toggleTask={toggleTask}
                    onHabitClick={(id) => navigateToModal(`/habit/${id}`)}
                    onTaskClick={(id) => navigateToModal(`/task/${id}`)}
                    onShowStreak={() => navigate('/streak')}
                    onProfileClick={() => navigateToModal('/profile')}
                    isLoading={habitsLoading || tasksLoading}
                    username={username}
                    stats={stats}
                  />
                </motion.div>
              } />
              
              <Route path="/tasks" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <TasksView tasks={tasks} onToggleTask={toggleTask} onTaskClick={(id) => navigateToModal(`/task/${id}`)} isLoading={tasksLoading} />
                </motion.div>
              } />

              <Route path="/journey" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <StatisticsView habits={habits} completions={completions} stats={stats} onHabitClick={(id) => navigateToModal(`/habit/${id}`)} />
                </motion.div>
              } />

              <Route path="/streak" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <StreakView streak={stats.currentStreak} stats={stats} />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>

          {/* Modal / Overlay Routes */}
          <AnimatePresence>
            <Routes location={location} key={location.pathname.split('/')[1] || 'root'}>
              <Route path="/add/*" element={
                <AddWizardView 
                  onSave={(h) => createHabit(h).then(() => navigate('/'))} 
                  onAddTask={(t) => createTask(t).then(() => navigate('/tasks'))} 
                  onClose={() => navigate('/')} 
                />
              } />
              <Route path="/task/:id/*" element={
                <TaskDetailRoute tasks={tasks} onUpdate={updateTask} onDelete={(id) => deleteTask(id).then(() => navigate('/tasks'))} />
              } />
              <Route path="/profile" element={
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute inset-0 z-50 bg-[#f8f6f2] flex flex-col">
                  <ProfileView onBack={() => navigate(-1)} username={username} />
                </motion.div>
              } />
              <Route path="/habit/:id/*" element={
                <HabitDetailRoute 
                  habits={habits} 
                  onUpdate={(h) => updateHabit({ id: h.id, updates: h })} 
                  onDelete={(id) => deleteHabit(id).then(() => navigate('/'))} 
                  onClose={() => navigate(-1)} 
                />
              } />
              <Route path="*" element={null} />
            </Routes>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isModalOpen && (
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }} 
              exit={{ y: 100 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-40"
            >
              <BottomNav currentView={currentTab} onChangeView={(v) => {
                const viewToPath = {
                  'home': '/',
                  'tasks': '/tasks',
                  'stats': '/journey',
                  'streak': '/streak',
                  'profile': '/profile',
                  'add': '/add'
                } as any;
                if (v === 'add') navigateToModal('/add');
                else navigate(viewToPath[v]);
              }} onAddClick={() => navigateToModal('/add')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper component for Habit Details
function HabitDetailRoute({ habits, onUpdate, onDelete, onClose }: { 
  habits: Habit[], 
  onUpdate: (h: Habit) => void, 
  onDelete: (id: string) => void,
  onClose: () => void 
}) {
  const { id } = useParams();
  const habit = habits.find(h => h.id === id);
  if (!habit) return null;
  return <HabitDetailView habit={habit} onUpdate={onUpdate} onDelete={onDelete} onClose={onClose} />;
}
