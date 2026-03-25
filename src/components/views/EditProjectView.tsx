import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Folder, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../../hooks/useProjects';
import { cn } from '../../utils/cn';
import { NEXUS_COLORS, getColorById } from '../../constants/colors';
import { PROJECT_EMOJIS } from '../../constants/icons';

export default function EditProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  
  const project = projects.find(p => p.id === id);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(PROJECT_EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(NEXUS_COLORS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setSelectedEmoji(project.emojiUrl);
      setSelectedColor(project.color);
    }
  }, [project]);

  if (!project) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await updateProject({
        id: project.id,
        updates: {
          name,
          description,
          emojiUrl: selectedEmoji,
          color: selectedColor
        }
      });
      navigate(-1);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-[#f8f6f2] dark:bg-[#121212] flex flex-col lowercase overflow-y-auto pb-32 pointer-events-auto"
    >
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5">
            <ChevronLeft size={20} className="text-[#2d2d2d] dark:text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#f27d26]" />
            <h1 className="text-xl font-bold text-[#2d2d2d] dark:text-white uppercase tracking-tight">edit project</h1>
          </div>
          <button 
            disabled={!name.trim() || isSubmitting}
            onClick={handleSave}
            className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all",
                name.trim() ? "bg-[#f27d26] text-white" : "bg-gray-100 dark:bg-[#252525] text-gray-400 dark:text-gray-600"
            )}
          >
            {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <Check size={20} />
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* Visual Identity */}
          <div className="flex flex-col items-center gap-4">
            <div 
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-[#1a1a1a]"
                style={{ backgroundColor: getColorById(selectedColor).bg }}
            >
              <img src={selectedEmoji} alt="" className="w-12 h-12 object-contain" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c]">project identity</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-2 block">project name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. redesign portfolio"
                className="w-full bg-transparent border-none p-0 text-lg font-bold text-[#2d2d2d] dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-800 focus:ring-0"
              />
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-2 block">description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="what is this project about?"
                rows={2}
                className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#2d2d2d] dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-800 focus:ring-0 resize-none"
              />
            </div>
          </div>

          {/* Emoji Selection */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-4 block text-center">choose emoji</label>
            <div className="grid grid-cols-5 gap-3">
              {PROJECT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    selectedEmoji === emoji ? "bg-gray-50 dark:bg-white/10 scale-110 shadow-inner" : "hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <img src={emoji} alt="" className="w-8 h-8 object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8c8c8c] mb-4 block text-center">theme color</label>
            <div className="flex justify-between items-center">
              {NEXUS_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all flex items-center justify-center",
                    selectedColor === color.id ? "scale-110 ring-4 ring-white dark:ring-[#2d2d2d] shadow-lg" : ""
                  )}
                  style={{ backgroundColor: color.primary }}
                >
                  {selectedColor === color.id && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
