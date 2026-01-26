
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  const env = (import.meta as any).env;
  if (env && env[key]) return env[key];
  try {
    if (process.env && process.env[key]) return process.env[key];
  } catch (e) {}
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('API_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERRORE CRITICO: Credenziali Supabase mancanti!");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const safeRpc = async (fnName: string, params: any, retryCount = 2) => {
  let attempt = 0;
  while (attempt <= retryCount) {
    try {
      const { data, error } = await supabase.rpc(fnName, params);
      if (error) {
        // Se è un errore di rete, riproviamo
        if (error.message.includes('fetch') || error.code === 'PGRST301') {
          attempt++;
          if (attempt <= retryCount) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
            continue;
          }
        }
        throw error;
      }
      return { data, success: true };
    } catch (err: any) {
      if (attempt >= retryCount) {
        return { 
          success: false, 
          error: err.message || 'Errore di connessione al protocollo.' 
        };
      }
      attempt++;
    }
  }
  return { success: false, error: 'Protocollo non raggiungibile.' };
};