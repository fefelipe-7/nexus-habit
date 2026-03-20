import { useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import HomeView from './components/views/HomeView';
import AddWizardView from './components/views/AddWizardView';
import StatisticsView from './components/views/StatisticsView';
import StreakView from './components/views/StreakView';
import TasksView from './components/views/TasksView';
import ProfileView from './components/views/ProfileView';
import HabitDetailView from './components/views/HabitDetailView';
import BottomNav from './components/layout/BottomNav';
import { Habit, Completion, Task } from './types';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // This state allows us to keep the "background" route rendered under our modals
  const background = location.state?.background;

  // Mock initial data
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'drink a glass of water', emojiUrl: '/newhabitwizard/water.png', color: 'blue', repeatDays: [0,1,2,3,4,5,6], reminders: true, createdAt: new Date().toISOString(), duration: 8, unit: 'cups', streak: 16 },
    { id: '2', name: 'meditate to relax', emojiUrl: '/newhabitwizard/pray.png', color: 'green', repeatDays: [1,3,5], reminders: true, createdAt: new Date().toISOString(), duration: 15, unit: 'mins', streak: 16 },
    { id: '3', name: 'stretch for 10 minutes', emojiUrl: '/newhabitwizard/body.png', color: 'pink', repeatDays: [1,2,3,4,5], reminders: true, createdAt: new Date().toISOString(), duration: 10, unit: 'mins', streak: 16 },
    { id: '4', name: 'go for a short walk', emojiUrl: '/newhabitwizard/running.png', color: 'orange', repeatDays: [0,1,2,3,4,5,6], reminders: true, createdAt: new Date().toISOString(), duration: 2, unit: 'km', streak: 16 },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', name: 'Finish UI Design', deadline: format(new Date(), 'yyyy-MM-dd'), estimatedTime: 120, emojiUrl: '/newhabitwizard/heart.png', color: 'pink', priority: 'high', createdAt: new Date().toISOString() },
    { id: 't2', name: 'Buy groceries', deadline: format(addDays(new Date(), 2), 'yyyy-MM-dd'), estimatedTime: 45, emojiUrl: '/newhabitwizard/food.png', color: 'orange', priority: 'medium', createdAt: new Date().toISOString() },
  ]);
  
  const [completions, setCompletions] = useState<Completion[]>([
    { habitId: '1', date: format(new Date(), 'yyyy-MM-dd') },
    { habitId: '2', date: format(new Date(), 'yyyy-MM-dd') },
  ]);

  const toggleCompletion = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = completions.find(c => c.habitId === habitId && c.date === dateStr);
    
    let newCompletions;
    if (existing) {
      newCompletions = completions.filter(c => c !== existing);
    } else {
      newCompletions = [...completions, { habitId, date: dateStr }];
    }
    setCompletions(newCompletions);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completedAt: t.completedAt ? undefined : new Date().toISOString() };
      }
      return t;
    }));
  };

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit]);
    navigate('/');
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    navigate('/tasks');
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
    navigate(-1);
  };

  const navigateToModal = (path: string) => {
    navigate(path, { state: { background: location } });
  };

  // Determine current tab for BottomNav
  const path = background?.pathname || location.pathname;
  let currentTab: 'home' | 'tasks' | 'stats' | 'streak' | 'profile' | 'add' = 'home';
  if (path === '/tasks') currentTab = 'tasks';
  else if (path === '/journey') currentTab = 'stats';
  else if (path === '/streak') currentTab = 'streak';
  else if (path === '/profile') currentTab = 'profile';

  const isModalOpen = !!background || location.pathname === '/add' || location.pathname.startsWith('/habit/') || location.pathname === '/profile';

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
                    toggleCompletion={toggleCompletion}
                    toggleTask={toggleTask}
                    onHabitClick={(id) => navigateToModal(`/habit/${id}`)}
                    onShowStreak={() => navigate('/streak')}
                    onProfileClick={() => navigateToModal('/profile')}
                  />
                </motion.div>
              } />
              
              <Route path="/tasks" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <TasksView tasks={tasks} onToggleTask={toggleTask} />
                </motion.div>
              } />

              <Route path="/journey" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <StatisticsView habits={habits} completions={completions} onHabitClick={(id) => navigateToModal(`/habit/${id}`)} />
                </motion.div>
              } />

              <Route path="/streak" element={
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24 bg-[#f8f6f2]">
                  <StreakView streak={16} />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>

          {/* Modal / Overlay Routes */}
          <AnimatePresence>
            <Routes location={location} key={location.pathname}>
              <Route path="/add/*" element={
                <AddWizardView onSave={addHabit} onAddTask={addTask} onClose={() => navigate('/')} />
              } />
              <Route path="/profile" element={
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute inset-0 z-50 bg-[#f8f6f2] flex flex-col">
                  <ProfileView onBack={() => navigate(-1)} />
                </motion.div>
              } />
              <Route path="/habit/:id/*" element={
                <HabitDetailRoute 
                  habits={habits} 
                  onUpdate={updateHabit} 
                  onDelete={deleteHabit} 
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
