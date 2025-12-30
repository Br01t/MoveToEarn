/**
 * Utility to send notifications to specific Slack channels via different Webhooks.
 * Direct browser-to-slack calls are restricted by CORS. 
 * We use 'no-cors' and a plain text payload which Slack's webhook endpoint 
 * can typically parse if formatted as a JSON string.
 */

export type SlackChannel = 'RUNNERS' | 'MAP' | 'SYNC' | 'BUGS' | 'IDEAS' | 'SYSTEM';

export const sendSlackNotification = async (
  message: string, 
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO',
  channel: SlackChannel = 'SYSTEM'
) => {
  // Fix: Cast import.meta to any to bypass environment variable typing issues in specific build contexts
  const env = (import.meta as any).env;
  
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
    console.warn(`⚠️ Slack Webhook for channel ${channel} not found in .env. Notification skipped.`);
    return;
  }

  const icons = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ALERT: '🚨'
  };

  const payload = {
    text: `${icons[type]} *[${channel}] Notification*\n${message}\n_Timestamp: ${new Date().toLocaleString()}_`
  };

  try {
    // We send as text/plain with no-cors to bypass browser pre-flight checks.
    // Slack webhooks are designed to handle this "opaque" format.
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', // Use text/plain to avoid CORS pre-flight
      },
      body: JSON.stringify(payload),
    });
    
    // Fix: Cast import.meta to any here to fix compilation error
    if ((import.meta as any).env.DEV) {
        console.log(`📡 Slack [${channel}]: Message dispatched.`);
    }
  } catch (error) {
    console.error(`❌ Failed to dispatch Slack notification to ${channel}:`, error);
  }
};