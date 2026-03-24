import { X, Check, Search, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import { useState } from 'react';
import { cn } from '../../utils/cn';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAssociate: (taskIds: string[]) => void;
};

export default function TaskSelectionModal({ isOpen, onClose, tasks, onAssociate }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(t => 
    !t.projectId && 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onAssociate(selectedIds);
    onClose();
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
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 bg-[#f8f6f2] rounded-t-[40px] p-8 z-[70] shadow-2xl lowercase flex flex-col max-h-[85vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d]">associate tasks</h2>
                <p className="text-[10px] text-[#8c8c8c] font-bold uppercase tracking-widest">select existing tasks</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2d2d2d] shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]" />
              <input 
                type="text"
                placeholder="search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white px-12 py-4 rounded-2xl outline-none text-sm font-medium text-[#2d2d2d] shadow-sm placeholder:text-gray-300"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-8 pr-2 scrollbar-hide">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-[#8c8c8c] text-sm italic">
                  no unassigned tasks found
                </div>
              ) : (
                filteredTasks.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => toggleSelect(task.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left",
                      selectedIds.includes(task.id) ? "bg-white shadow-sm ring-2 ring-orange-100" : "bg-white/50 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        selectedIds.includes(task.id) ? "border-[#f27d26] bg-[#f27d26]" : "border-[#d1d1d1]"
                      )}>
                        {selectedIds.includes(task.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2d2d2d]">{task.name}</p>
                        <p className="text-[10px] text-[#8c8c8c]">{task.deadline || 'no deadline'}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <button 
              onClick={handleSave}
              disabled={selectedIds.length === 0}
              className="w-full py-5 bg-[#f27d26] text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              <Check size={20} />
              <span>associate {selectedIds.length} tasks</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
