
import { createClient } from '@supabase/supabase-js';

// 1. Prova a leggere dal file .env (assicurati che inizino con VITE_)
const env = (import.meta as any).env;
const envUrl = env.VITE_SUPABASE_URL;
const envKey = env.VITE_SUPABASE_ANON_KEY;


// Logica di selezione
const supabaseUrl = envUrl;
const supabaseAnonKey = envKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ATTENZIONE: Credenziali Supabase mancanti! Il login non funzionerà.");
  console.warn("Assicurati di avere un file .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, oppure incollale in supabaseClient.ts");
}

// Usa valori placeholder se tutto manca per evitare crash immediati, ma le chiamate falliranno
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);