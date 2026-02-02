import { supabase } from '../supabaseClient';
import { logger } from './logger';

export type SlackChannel = 'RUNNERS' | 'MAP' | 'SYNC' | 'BUGS' | 'IDEAS' | 'SYSTEM';

export const sendSlackNotification = async (
  message: string, 
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO',
  channel: SlackChannel = 'SYSTEM'
) => {
  try {
    const { error } = await supabase.functions.invoke('smart-processor', {
      body: {
        table: 'manual_alert',
        record: { 
          message, 
          type, 
          channel,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) {
      logger.warn(`⚠️ [SLACK] Edge Function returned error:`, error);
    }
  } catch (error) {
    logger.error(`❌ [SLACK] Error calling smart-processor:`, error);
  }
};