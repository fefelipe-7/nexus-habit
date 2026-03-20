import { createClient } from '@supabase/supabase-js';

// Vite environment variables are loaded at startup. 
// If you just added them to .env, you MUST restart the dev server!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('--- Supabase Setup Error ---');
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.');
  console.error('Current URL loaded:', supabaseUrl);
  console.error('Action Required: Ensure .env is in the project root and start with VITE_');
  console.error('Action Required: RESTART your development server (npm run dev).');
  console.error('----------------------------');
}

// Fallback to empty string if missing to avoid uncaught error during init, 
// though actual calls will fail until the keys are provided.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
