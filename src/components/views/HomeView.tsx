import { Habit, Completion } from '../../types';
import Header from '../layout/Header';
import CalendarStrip from '../home/CalendarStrip';
import ReminderCard from '../home/ReminderCard';
import HabitList from '../home/HabitList';
import { motion } from 'framer-motion';

type Props = {
  habits: Habit[];
  completions: Completion[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  toggleCompletion: (habitId: string, date: Date) => void;
  onShowStreak: () => void;
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

export default function HomeView({ habits, completions, selectedDate, setSelectedDate, toggleCompletion, onShowStreak }: Props) {
  return (
    <motion.div 
      className="flex-1 overflow-y-auto relative"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <Header date={selectedDate} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <ReminderCard />
      </motion.div>
      <motion.div variants={itemVariants}>
        <HabitList 
          habits={habits} 
          completions={completions} 
          selectedDate={selectedDate} 
          onToggleCompletion={toggleCompletion} 
          onShowStreak={onShowStreak}
        />
      </motion.div>
    </motion.div>
  );
}
