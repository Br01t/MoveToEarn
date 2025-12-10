
import { createClient } from '@supabase/supabase-js';

// 1. Prova a leggere dal file .env (assicurati che inizino con VITE_)
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// 2. Se non li trova nel .env, usa queste stringhe (INCOLLA QUI LE TUE CHIAVI SE NECESSARIO)
// Esempio: const manualUrl = 'https://xyz.supabase.co';
const manualUrl = 'https://fjvmeffshcivnoctaikj.supabase.co'; 
const manualKey = 'sb_publishable_rrcpVeL90qgmctU7FLIo7w_YOsFSnXs';

// Logica di selezione
const supabaseUrl = envUrl || manualUrl;
const supabaseAnonKey = envKey || manualKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ATTENZIONE: Credenziali Supabase mancanti! Il login non funzionerà.");
  console.warn("Assicurati di avere un file .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, oppure incollale in supabaseClient.ts");
}

// Usa valori placeholder se tutto manca per evitare crash immediati, ma le chiamate falliranno
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);