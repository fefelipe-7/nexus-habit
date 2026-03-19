import { motion } from 'framer-motion';

export default function ExploreView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 p-6 flex flex-col items-center justify-center text-center">
      <motion.img 
        src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Compass.png" 
        alt="compass" 
        className="w-24 h-24 mb-6 drop-shadow-sm"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
      <motion.h2 
        className="text-2xl font-medium mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        explore
      </motion.h2>
      <motion.p 
        className="text-[#8c8c8c]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        discover new habits and challenges coming soon.
      </motion.p>
    </div>
  );
}
