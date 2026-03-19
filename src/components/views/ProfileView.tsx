import { motion } from 'framer-motion';

export default function ProfileView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 p-6 flex flex-col items-center justify-center text-center">
      <motion.img 
        src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png" 
        alt="profile" 
        className="w-24 h-24 mb-6 drop-shadow-sm"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
      <motion.h2 
        className="text-2xl font-medium mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        profile
      </motion.h2>
      <motion.p 
        className="text-[#8c8c8c]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        your personal settings and achievements coming soon.
      </motion.p>
    </div>
  );
}
