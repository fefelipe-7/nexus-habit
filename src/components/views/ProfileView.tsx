import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

type Props = {
  onBack: () => void;
  username: string;
};

export default function ProfileView({ onBack, username }: Props) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 flex flex-col relative">
      <div className="px-6 pt-12 pb-4 flex items-center">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-[#2d2d2d]" />
        </button>
        <h1 className="text-2xl font-medium text-[#2d2d2d] ml-4">profile</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
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
          {username}
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
    </div>
  );
}
