import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger';

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
  logger.error("CRITICAL: Missing Supabase credentials!");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (err: any) {
            lastError = err;
            const isNetworkError = !err.status || (err.status >= 500 && err.status <= 599);
            
            if (!isNetworkError || attempt === maxAttempts) {
                throw err;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            logger.warn(`Network failure. Retrying attempt ${attempt}/${maxAttempts} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

type SafeRpcResponse<T = any> = 
  | { success: true; data: T }
  | { success: false; error: string };

export const safeRpc = async <T = any>(fnName: string, params: any): Promise<SafeRpcResponse<T>> => {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc(fnName, params);
    if (error) {
        logger.error(`RPC Error [${fnName}]:`, error);
        throw error;
    }
    return { data: data as T, success: true as const };
  }).catch(err => {
    return { success: false as const, error: err.message || 'Errore di connessione al protocollo.' };
  });
};

type SafeQueryResponse<T> = 
  | { success: true; data: T | null }
  | { success: false; error: string };

export const safeQuery = async <T>(queryPromise: PromiseLike<{ data: T | null; error: any }>): Promise<SafeQueryResponse<T>> => {
    return withRetry(async () => {
        const { data, error } = await queryPromise;
        if (error) {
            logger.error(`Query Error:`, error);
            throw error;
        }
        return { data, success: true as const };
    }).catch(err => {
        return { success: false as const, error: err.message || 'Errore database.' };
    });
};