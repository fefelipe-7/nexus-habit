import { Home, Compass, ClipboardList, Flame, Folder } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ExpandableTabs, TabItem } from '../ui/expandable-tabs';

type Props = {
  currentView: 'home' | 'tasks' | 'stats' | 'streak' | 'projects';
  onChangeView: (view: 'home' | 'tasks' | 'stats' | 'streak' | 'projects') => void;
};

export default function BottomNav({ currentView, onChangeView }: Props) {
  const tabs: TabItem[] = [
    { title: "Tasks", icon: ClipboardList },
    { title: "Journey", icon: Compass },
    { title: "Home", icon: Home },
    { title: "Projects", icon: Folder },
    { title: "Streak", icon: Flame },
  ];

  const viewToIndex: Record<string, number> = {
    'tasks': 0,
    'stats': 1,
    'home': 2,
    'projects': 3,
    'streak': 4,
  };

  const indexToView: Record<number, 'home' | 'tasks' | 'stats' | 'streak' | 'projects'> = {
    0: 'tasks',
    1: 'stats',
    2: 'home',
    3: 'projects',
    4: 'streak',
  };

  const handleTabChange = (index: number | null) => {
    if (index !== null && indexToView[index] !== undefined) {
      onChangeView(indexToView[index]);
    }
  };

  return (
    <>
      {/* Gradient fade for smooth scrolling behind the nav */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8f6f2] dark:from-[#121212] via-[#f8f6f2]/80 dark:via-[#121212]/80 to-transparent pointer-events-none z-30" />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-max max-w-[calc(100vw-2rem)]">
        <ExpandableTabs 
          tabs={tabs} 
          activeColor="text-[#f27d26] bg-[#f27d26]/10 dark:bg-orange-500/20" 
          className="border-[#d1d1d1] dark:border-white/5 bg-[#f8f6f2] dark:bg-[#1a1a1a] shadow-[0_8px_16px_rgba(0,0,0,0.05)]"
          defaultSelected={viewToIndex[currentView]}
          onChange={handleTabChange}
        />
      </div>
    </>
  );
}
