import { motion } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center lowercase"
    >
      <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6 relative">
        {Icon ? <Icon className="text-gray-300 w-10 h-10" /> : <Sparkles className="text-gray-200 w-10 h-10" />}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-0 bg-[#f27d26]/10 rounded-[32px] -z-10"
        />
      </div>
      
      <h3 className="text-lg font-bold text-[#2d2d2d] tracking-tight mb-2">{title}</h3>
      <p className="text-xs text-[#8c8c8c] font-medium max-w-[200px] leading-relaxed mb-8">
        {description}
      </p>

      {action && (
        <button 
          onClick={action.onClick}
          className="bg-[#2d2d2d] text-white rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
