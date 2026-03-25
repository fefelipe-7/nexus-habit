import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  username: string;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const username = user?.email?.split('@')[0] || user?.user_metadata?.display_name || 'user';

  useEffect(() => {
    // Check current session immediately (fast)
    // authService.getCurrentUser is slow but used for initial load
    authService.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const result = await authService.signOut();
    if (!result.error) setUser(null);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, loading, username, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
