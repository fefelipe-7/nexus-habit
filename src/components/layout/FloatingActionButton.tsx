import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

type Props = {
  onClick: () => void;
  className?: string;
};

export default function FloatingActionButton({ onClick, className }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 z-50 p-4 rounded-full",
        "bg-[#f27d26] text-white shadow-[0_8px_16px_rgba(242,125,38,0.3)]",
        "flex items-center justify-center transition-shadow hover:shadow-[0_12px_24px_rgba(242,125,38,0.4)]",
        className
      )}
      aria-label="Add Habit or Task"
    >
      <Plus size={24} strokeWidth={2.5} />
    </motion.button>
  );
}
