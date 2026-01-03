/**
 * Utility to send notifications to specific Slack channels via Webhooks.
 * IMPORTANT: Slack Webhooks do not support CORS headers for browser-side JSON POSTs.
 * We use a "Simple Request" approach with x-www-form-urlencoded and 'payload' 
 * which Slack legacy API supports to bypass CORS preflight.
 */

export type SlackChannel = 'RUNNERS' | 'MAP' | 'SYNC' | 'BUGS' | 'IDEAS' | 'SYSTEM';

export const sendSlackNotification = async (
  message: string, 
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO',
  channel: SlackChannel = 'SYSTEM'
) => {
  const env = (import.meta as any).env;
  
  // Mappatura Webhook URLs
  const webhookUrls: Record<SlackChannel, string | undefined> = {
    RUNNERS: env.VITE_SLACK_WEBHOOK_RUNNERS,
    MAP: env.VITE_SLACK_WEBHOOK_MAP,
    SYNC: env.VITE_SLACK_WEBHOOK_SYNC,
    BUGS: env.VITE_SLACK_WEBHOOK_BUGS,
    IDEAS: env.VITE_SLACK_WEBHOOK_IDEAS,
    SYSTEM: env.VITE_SLACK_WEBHOOK_SYSTEM
  };

  const webhookUrl = webhookUrls[channel] || env.VITE_SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    if (env.DEV) {
        console.warn(`⚠️ [SLACK] Webhook non trovato per il canale ${channel}. Controlla il file .env`);
    }
    return;
  }

  const icons = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ALERT: '🚨'
  };

  // Costruzione del payload Slack standard
  const slackPayload = {
    text: `${icons[type]} *[${channel}] Notification*\n${message}\n_Timestamp: ${new Date().toLocaleString()}_`
  };

  try {
    /**
     * BROWSER CORS HACK:
     * Slack non invia Access-Control-Allow-Origin.
     * Usiamo il formato legacy "payload=JSON_STRING" con Content-Type semplice.
     */
    const body = new URLSearchParams();
    body.append('payload', JSON.stringify(slackPayload));

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Fondamentale: impedisce al browser di bloccare la richiesta per mancanza di CORS
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (env.DEV) {
        console.log(`📡 [SLACK] Messaggio inviato al canale ${channel} (Richiesta Opaque)`);
    }
  } catch (error) {
    console.error(`❌ [SLACK] Errore critico durante l'invio a ${channel}:`, error);
  }
};