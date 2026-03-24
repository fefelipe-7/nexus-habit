import { useState, useEffect } from 'react';
import { X, Check, Minus, Plus, PartyPopper, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit, Completion } from '../../types';
import { cn } from '../../utils/cn';
import { getColorById } from '../../constants/colors';

type Props = {
  habits: Habit[];
  completions: Completion[];
  onLog: (habitId: string, amount: number) => void;
  onClose: () => void;
};

export default function LogProgressView({ habits, completions, onLog, onClose }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const habit = habits.find(h => h.id === id);

  // Get current progress for today
  const today = new Date().toISOString().split('T')[0];
  const currentCompletion = completions.find(c => c.habitId === id && c.date === today);
  const currentAmount = currentCompletion?.amount || 0;

  const [inputValue, setInputValue] = useState(currentAmount.toString());
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#f8f6f2]">
        <p className="text-[#8c8c8c] mb-4">habit not found</p>
        <button onClick={onClose} className="px-6 py-3 bg-[#2d2d2d] text-white rounded-2xl font-bold">go back</button>
      </div>
    );
  }

  const nexusColor = getColorById(habit.color);
  const value = parseFloat(inputValue) || 0;

  const handleSave = async () => {
    if (value < currentAmount) {
      setError(`valor não pode ser menor que ${currentAmount}`);
      return;
    }
    
    setError(null);
    onLog(habit.id, value);
    setIsSuccess(true);
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] flex flex-col lowercase pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#8c8c8c]">log progress</h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col p-8 items-center justify-center">
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm"
          style={{ backgroundColor: nexusColor.bg, color: nexusColor.text }}
        >
          <img src={habit.emojiUrl} alt="" className="w-12 h-12 object-contain" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#2d2d2d] mb-1 text-center">{habit.name}</h2>
        <p className="text-xs text-[#8c8c8c] font-bold uppercase tracking-widest mb-12">current: {currentAmount} / {habit.duration} {habit.unit || 'units'}</p>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-6">
                <PartyPopper size={48} />
              </div>
              <h3 className="text-3xl font-bold text-[#2d2d2d] mb-2">excelente!</h3>
              <p className="text-[#8c8c8c] text-center">seu progresso foi salvo.<br/>voltando para o início...</p>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-sm flex flex-col items-center">
              <div className="bg-white rounded-[40px] p-10 shadow-sm w-full mb-8 flex flex-col items-center">
                <div className="flex items-center gap-8 mb-6">
                  <button 
                    onClick={() => setInputValue(Math.max(currentAmount, value - 1).toString())}
                    className="w-16 h-16 rounded-3xl bg-[#f8f6f2] flex items-center justify-center text-[#2d2d2d] active:scale-90 transition-transform"
                  >
                    <Minus size={28} />
                  </button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-baseline gap-2">
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        className={cn(
                            "text-6xl font-bold w-40 text-center outline-none bg-transparent transition-colors",
                            error ? "text-red-500" : "text-[#2d2d2d]"
                        )}
                        autoFocus
                      />
                    </div>
                    {error && (
                        <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">
                            {error}
                        </motion.span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setInputValue((value + 1).toString())}
                    className="w-16 h-16 rounded-3xl bg-[#f8f6f2] flex items-center justify-center text-[#2d2d2d] active:scale-90 transition-transform"
                  >
                    <Plus size={28} />
                  </button>
                </div>

                <div className="w-full flex gap-2">
                  {[0.25, 0.5, 0.75, 1].map(pct => {
                    const quickValue = Math.round((habit.duration || 1) * pct * 10) / 10;
                    const isDisabled = quickValue < currentAmount;
                    return (
                      <button 
                        key={pct}
                        disabled={isDisabled}
                        onClick={() => setInputValue(quickValue.toString())}
                        className={cn(
                          "flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all",
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
                className="w-full py-6 bg-[#f27d26] text-white rounded-[2.5rem] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:grayscale"
              >
                <Check size={24} />
                <span>confirm progress</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
