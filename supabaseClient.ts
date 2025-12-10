import { createClient } from '@supabase/supabase-js';

// Access environment variables safely to prevent crashes if import.meta.env is undefined
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase credentials not found in .env file. Authentication will not work.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);