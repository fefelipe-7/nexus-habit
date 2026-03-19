import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReminderCard() {
  return (
    <motion.div 
      className="mx-6 my-4 bg-[#ffdfbf] rounded-3xl p-5 flex items-center justify-between relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="z-10 max-w-[60%]">
        <h2 className="text-lg font-medium text-[#5c3a21] mb-1">set the reminder</h2>
        <p className="text-xs text-[#8c6b52] mb-4 leading-relaxed">
          never miss your morning routine! set a reminder to stay on track
        </p>
        <button className="bg-[#5c3a21] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#4a2e1a] transition-colors">
          set now
        </button>
      </div>
      <motion.div 
        className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-80 pointer-events-none text-[#f27d26]"
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <Bell size={120} strokeWidth={1} fill="currentColor" />
      </motion.div>
    </motion.div>
  );
}
