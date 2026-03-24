import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'confirm',
  cancelText = 'cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm pointer-events-auto"
          />
          <div className="fixed inset-0 z-[101] pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-[32px] p-6 shadow-xl pointer-events-auto lowercase border border-black/5 dark:border-white/5"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-500'}`}>
                  {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                </div>
                
                <h3 className="text-xl font-bold text-[#2d2d2d] dark:text-white mb-2">{title}</h3>
                <p className="text-[#8c8c8c] dark:text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
                
                <div className="flex w-full gap-3">
                  <button 
                    onClick={onCancel}
                    className="flex-1 py-4 font-bold rounded-2xl bg-gray-100 dark:bg-gray-800 text-[#8c8c8c] dark:text-gray-400 active:scale-95 transition-all"
                  >
                    {cancelText}
                  </button>
                  <button 
                    onClick={onConfirm}
                    className={`flex-1 py-4 font-bold rounded-2xl active:scale-95 transition-all shadow-md ${isDestructive ? 'bg-red-500 text-white shadow-red-200 dark:shadow-none' : 'bg-[#2d2d2d] dark:bg-white text-white dark:text-black'}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
