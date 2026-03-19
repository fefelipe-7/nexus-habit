/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import HomeView from './components/views/HomeView';
import AddHabitView from './components/views/AddHabitView';
import StatisticsView from './components/views/StatisticsView';
import StreakView from './components/views/StreakView';
import ExploreView from './components/views/ExploreView';
import ProfileView from './components/views/ProfileView';
import BottomNav from './components/layout/BottomNav';
import { Habit, Completion } from './types';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'stats' | 'streak' | 'profile' | 'add'>('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock initial data
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'drink a glass of water', emojiUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Droplet.png', color: 'blue', repeatDays: [0,1,2,3,4,5,6], reminders: true, createdAt: new Date().toISOString(), duration: 5, streak: 16 },
    { id: '2', name: 'meditate to relax', emojiUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Person%20in%20Lotus%20Position.png', color: 'green', repeatDays: [1,3,5], reminders: true, createdAt: new Date().toISOString(), duration: 15, streak: 16 },
    { id: '3', name: 'stretch for 10 minutes', emojiUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Person%20Running.png', color: 'pink', repeatDays: [1,2,3,4,5], reminders: true, createdAt: new Date().toISOString(), duration: 10, streak: 16 },
    { id: '4', name: 'go for a short walk', emojiUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Footprints.png', color: 'orange', repeatDays: [0,1,2,3,4,5,6], reminders: true, createdAt: new Date().toISOString(), streak: 16 },
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

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit]);
    setCurrentView('home');
  };

  return (
    <div className="h-[100dvh] bg-gray-100 text-[#2d2d2d] font-sans flex justify-center lowercase selection:bg-[#f27d26] selection:text-white overflow-hidden">
      <div className="w-full bg-[#f8f6f2] h-full relative shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24">
                <HomeView 
                  habits={habits} 
                  completions={completions} 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate}
                  toggleCompletion={toggleCompletion}
                  onShowStreak={() => setCurrentView('streak')}
                  onProfileClick={() => setCurrentView('profile')}
                />
              </motion.div>
            )}
            {currentView === 'explore' && (
              <motion.div key="explore" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24">
                <ExploreView />
              </motion.div>
            )}
            {currentView === 'stats' && (
              <motion.div key="stats" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24">
                <StatisticsView habits={habits} completions={completions} />
              </motion.div>
            )}
            {currentView === 'streak' && (
              <motion.div key="streak" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24">
                <StreakView streak={16} />
              </motion.div>
            )}
            {currentView === 'profile' && (
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pb-24">
                <ProfileView onBack={() => setCurrentView('home')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {currentView === 'add' && (
            <AddHabitView onSave={addHabit} onClose={() => setCurrentView('home')} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentView !== 'add' && currentView !== 'profile' && (
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }} 
              exit={{ y: 100 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-40"
            >
              <BottomNav currentView={currentView} onChangeView={setCurrentView} onAddClick={() => setCurrentView('add')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
