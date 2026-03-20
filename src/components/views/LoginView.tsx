import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, CheckCircle2, Loader2, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { authService } from '../../services/authService';

type Props = {
  onLogin: () => void;
};

export default function LoginView({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // 6 digit numeric
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || password.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const { error: authError } = await authService.signIn(username, password);
        if (authError) throw authError;
        onLogin();
      } else {
        const { error: authError } = await authService.signUp(username, password);
        if (authError) throw authError;
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMode('login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPassword(val);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-gray-300 group-focus-within:text-[#f27d26] transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white rounded-[24px] py-5 pl-14 pr-32 text-sm font-medium shadow-sm outline-none border-2 border-transparent focus:border-[#f27d26]/20 transition-all placeholder:text-gray-300"
                required
              />
              <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">@nexus.com.br</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-gray-300 group-focus-within:text-[#f27d26] transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                inputMode="numeric"
                placeholder="6-digit password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-white rounded-[24px] py-5 pl-14 pr-6 text-sm font-medium shadow-sm outline-none border-2 border-transparent focus:border-[#f27d26]/20 transition-all placeholder:text-gray-300 tracking-[0.5em]"
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-green-500 text-[10px] font-black uppercase tracking-widest"
              >
                account created! logging in...
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            disabled={loading || password.length !== 6 || !username}
            className="w-full bg-[#2d2d2d] text-white rounded-[24px] py-5 font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {mode === 'login' ? 'Nexus Login' : 'Create Account'}
                {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              </>
            )}
          </button>
        </form>

        <div className="pt-4">
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#2d2d2d] transition-colors"
          >
            {mode === 'login' ? 'no account? create one' : 'already have an account? login'}
          </button>
        </div>

        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest fixed bottom-12">nexus habit &copy; 2026</p>
      </motion.div>
    </div>
  );
}
