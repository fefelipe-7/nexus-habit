import { useState, useEffect } from 'react';
import { X, Check, Minus, Plus, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
  currentAmount: number;
  onLog: (amount: number) => void;
};

export default function LogProgressModal({ isOpen, onClose, habit, currentAmount, onLog }: Props) {
  const [inputValue, setInputValue] = useState(currentAmount.toString());
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const nexusColor = getColorById(habit.color);

  const value = parseFloat(inputValue) || 0;

  useEffect(() => {
    if (isOpen) {
        setIsSuccess(false);
        setError(null);
        setInputValue(currentAmount.toString());
    }
  }, [isOpen, currentAmount]);

  const handleSave = async () => {
    if (value < currentAmount) {
        setError(`valor não pode ser menor que ${currentAmount}`);
        return;
    }
    
    setError(null);
    onLog(value);
    setIsSuccess(true);
    
    // Show success for a bit then redirect
    setTimeout(() => {
      onClose();
      navigate('/');
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()} // Prevent clicking through to parent HabitItem
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[70] shadow-2xl lowercase pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: nexusColor.bg, color: nexusColor.text }}
                >
                  <img src={habit.emojiUrl} alt="" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2d2d2d]">log progress</h2>
                  <p className="text-[10px] text-[#8c8c8c] font-bold uppercase tracking-widest">{habit.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-[#f8f6f2] rounded-full flex items-center justify-center text-[#2d2d2d]">
                <X size={20} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-6">
                    <PartyPopper size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d2d2d] mb-2">great job!</h3>
                  <p className="text-[#8c8c8c] text-center">your progress has been logged.<br/>redirecting you home...</p>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col items-center mb-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-4">enter amount ({habit.unit || 'units'})</div>
                    <div className="flex items-center gap-8">
                      <button 
                        onClick={() => setInputValue(Math.max(currentAmount, value - 1).toString())}
                        className="w-14 h-14 rounded-2xl bg-[#f8f6f2] flex items-center justify-center text-[#2d2d2d] active:scale-90 transition-transform"
                      >
                        <Minus size={24} />
                      </button>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-baseline gap-2">
                          <input 
                            type="text" 
                            inputMode="decimal"
                            value={inputValue} 
                            onChange={e => setInputValue(e.target.value)}
                            className={cn(
                                "text-6xl font-bold w-32 text-center outline-none bg-transparent transition-colors",
                                error ? "text-red-500" : "text-[#2d2d2d]"
                            )}
                            autoFocus
                          />
                          <span className="text-xl font-bold text-orange-500">/ {habit.duration}</span>
                        </div>
                        {error && (
                            <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                {error}
                            </motion.span>
                        )}
                      </div>
                      <button 
                        onClick={() => setInputValue((value + 1).toString())}
                        className="w-14 h-14 rounded-2xl bg-[#f8f6f2] flex items-center justify-center text-[#2d2d2d] active:scale-90 transition-transform"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                    
                    <div className="mt-8 flex gap-2 w-full">
                      {[0.25, 0.5, 0.75, 1].map(pct => {
                        const quickValue = Math.round((habit.duration || 1) * pct * 10) / 10;
                        const isDisabled = quickValue < currentAmount;
                        return (
                          <button 
                            key={pct}
                            disabled={isDisabled}
                            onClick={() => setInputValue(quickValue.toString())}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                              value === quickValue ? "bg-[#2d2d2d] text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100",
                              isDisabled && "opacity-20 cursor-not-allowed"
                            )}
                          >
                            {pct * 100}%
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={value < currentAmount}
                    className="w-full py-5 bg-[#f27d26] text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:grayscale"
                  >
                    <Check size={20} />
                    <span>save progress</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
