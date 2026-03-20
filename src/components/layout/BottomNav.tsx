import { Home, Compass, ClipboardList, Flame, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ExpandableTabs, TabItem } from '../ui/expandable-tabs';

type Props = {
  currentView: 'home' | 'explore' | 'stats' | 'streak' | 'profile' | 'add';
  onChangeView: (view: 'home' | 'explore' | 'stats' | 'streak' | 'profile' | 'add') => void;
  onAddClick: () => void;
};

export default function BottomNav({ currentView, onChangeView, onAddClick }: Props) {
  const tabs: TabItem[] = [
    { title: "Home", icon: Home },
    { title: "Tasks", icon: Compass },
    { type: "separator" },
    { title: "Add", icon: Plus },
    { type: "separator" },
    { title: "Journey", icon: ClipboardList },
    { title: "Streak", icon: Flame },
  ];

  const viewToIndex: Record<string, number> = {
    'home': 0,
    'tasks': 1,
    'add': 3,
    'stats': 5,
    'streak': 6,
  };

  const indexToView: Record<number, 'home' | 'tasks' | 'stats' | 'streak' | 'add'> = {
    0: 'home',
    1: 'tasks',
    3: 'add',
    5: 'stats',
    6: 'streak',
  };

  const handleTabChange = (index: number | null) => {
    if (index !== null && indexToView[index]) {
      if (indexToView[index] === 'add') {
        onAddClick();
      } else {
        onChangeView(indexToView[index]);
      }
    }
  };

  return (
    <>
      {/* Gradient fade for smooth scrolling behind the nav */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2]/80 to-transparent pointer-events-none z-30" />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-max max-w-[calc(100vw-2rem)]">
        <ExpandableTabs 
          tabs={tabs} 
          activeColor="text-[#f27d26] bg-[#f27d26]/10" 
          className="border-[#d1d1d1] bg-[#f8f6f2] shadow-[0_8px_16px_rgba(0,0,0,0.05)]"
          defaultSelected={viewToIndex[currentView]}
          onChange={handleTabChange}
        />
      </div>
    </>
  );
}
