import { useAuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export function useAuth() {
  const context = useAuthContext();
  return { 
    user: context.user, 
    username: context.username, 
    loading: context.loading, 
    signOut: context.signOut, 
    signIn: authService.signIn, // still used for login
    signUp: authService.signUp 
  };
}
