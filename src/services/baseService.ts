import { supabase } from '../lib/supabase';

export abstract class BaseService {
  protected static async getUserId(): Promise<string> {
    // getSession is much faster and doesn't acquire the lock in the same way getUser does
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      // Fallback to getUser which is slower but more reliable if session is stale
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return user.id;
    }
    return session.user.id;
  }
}
