import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../../services/authService';

type Props = {
  onLogin: (email: string) => void;
};

export default function LoginView({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await authService.signUp(email);
      if (authError) throw authError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8f6f2] flex flex-col items-center justify-center px-8 text-center lowercase">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-12"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto mb-8 relative">
            <Sparkles className="text-[#f27d26] w-10 h-10" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-[#f27d26]/10 rounded-[32px] -z-10"
            />
          </div>
          <h1 className="text-4xl font-black text-[#2d2d2d] tracking-tighter">Nexus</h1>
          <p className="text-gray-400 text-sm font-medium px-4">your personal habit and task companion, synced everywhere.</p>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 group-focus-within:text-[#f27d26] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white rounded-[24px] py-5 pl-14 pr-6 text-sm font-medium shadow-sm outline-none border-2 border-transparent focus:border-[#f27d26]/20 transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              )}

              <button 
                disabled={loading}
                className="w-full bg-[#2d2d2d] text-white rounded-[24px] py-5 font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Send Login Link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[40px] shadow-sm space-y-6"
            >
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#2d2d2d]">check your inbox</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">we've sent a magic link to <span className="text-[#2d2d2d] font-bold">{email}</span>. click it to log in instantly.</p>
              </div>
              <button 
                onClick={() => setSent(false)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#2d2d2d] transition-colors"
              >
                back to login
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest fixed bottom-12">nexus habit &copy; 2026</p>
      </motion.div>
    </div>
  );
}
