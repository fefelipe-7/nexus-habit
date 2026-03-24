import { Habit, Completion, Task } from '../../types';
import Header from '../layout/Header';
import CalendarStrip from '../home/CalendarStrip';
import FredCard from '../home/FredCard';
import HabitList from '../home/HabitList';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitSkeleton, TaskSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Plus, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  habits: Habit[];
  tasks: Task[];
  completions: Completion[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  toggleCompletion: (habitId: string, date: Date, amount?: number) => void;
  toggleTask: (taskId: string) => void;
  onShowStreak: () => void;
  onProfileClick: () => void;
  onHabitClick: (id: string) => void;
  onTaskClick: (id: string) => void;
  isLoading?: boolean;
  username: string;
  avatarUrl?: string;
  stats: any;
  profile?: any;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function HomeView({ habits, tasks, completions, selectedDate, setSelectedDate, toggleCompletion, toggleTask, onShowStreak, onProfileClick, onHabitClick, onTaskClick, isLoading, username, profile }: Props) {
  const navigate = useNavigate();
  const avatarUrl = profile?.avatarUrl;
  const showMascot = profile?.settings?.showMascotPhrases ?? true;

  const filteredHabits = habits.filter(habit => 
    habit.repeatDays.includes(selectedDate.getDay())
  );

  return (
    <motion.div 
      className="flex-1 overflow-y-auto relative"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <Header date={selectedDate} username={username} avatarUrl={avatarUrl} onProfileClick={onProfileClick} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <FredCard 
          habits={habits} 
          tasks={tasks} 
          completions={completions} 
          selectedDate={selectedDate} 
          showPhrases={showMascot}
        />
      </motion.div>
      <motion.div variants={itemVariants} className="px-6 space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeletons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <HabitSkeleton />
              <HabitSkeleton />
              <TaskSkeleton />
            </motion.div>
          ) : filteredHabits.length === 0 && tasks.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState 
                icon={Coffee}
                title="nothing for today?"
                description="it looks like you have a clear schedule. why not start a new habit?"
                action={{
                  label: "Add New Habit",
                  onClick: () => navigate('/add')
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HabitList 
                habits={filteredHabits} 
                tasks={tasks}
                completions={completions} 
                selectedDate={selectedDate} 
                onToggleCompletion={toggleCompletion} 
                onToggleTask={toggleTask}
                onShowStreak={onShowStreak}
                onHabitClick={onHabitClick}
                onTaskClick={onTaskClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
