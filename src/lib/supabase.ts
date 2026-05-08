/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Basic connectivity check
if (supabaseUrl) {
  supabase.from('profiles').select('id').limit(1).then(({ error }) => {
    if (error && error.message?.includes('fetch')) {
      console.error('SUPABASE CONNECTION ERROR: The project might be paused or the URL is unreachable.');
    }
  });
}
