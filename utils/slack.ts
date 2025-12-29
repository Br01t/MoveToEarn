/**
 * Utility to send notifications to specific Slack channels via different Webhooks.
 */

export type SlackChannel = 'RUNNERS' | 'MAP' | 'SYNC' | 'BUGS' | 'IDEAS' | 'SYSTEM';

export const sendSlackNotification = async (
  message: string, 
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO',
  channel: SlackChannel = 'SYSTEM'
) => {
  const env = (import.meta as any).env;
  
  // Mapping channels to their respective environment variables
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
    console.warn(`⚠️ Slack Webhook for channel ${channel} not found. Notification skipped.`);
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
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });
  } catch (error) {
    console.error(`❌ Failed to send Slack notification to ${channel}:`, error);
  }
};