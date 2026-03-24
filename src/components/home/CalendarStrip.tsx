import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function CalendarStrip({ selectedDate, onSelectDate }: Props) {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="flex justify-between px-6 py-4">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className="flex flex-col items-center gap-3 relative"
          >
            <span className={cn("text-xs font-bold z-10 transition-colors uppercase tracking-widest", isSelected ? "text-white" : "text-[#8c8c8c] dark:text-gray-500")}>
              {format(day, 'EEE')}
            </span>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors",
                isSelected ? "text-white" : "bg-white dark:bg-[#1a1a1a] text-[#2d2d2d] dark:text-gray-100 shadow-sm"
              )}
            >
              {format(day, 'd')}
            </div>
            {isSelected && (
              <motion.div
                layoutId="calendar-selection"
                className="absolute inset-0 bg-[#2d2d2d] dark:bg-[#f27d26] rounded-full -top-2 -bottom-2 -left-1 -right-1 z-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
