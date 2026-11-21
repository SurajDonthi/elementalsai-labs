// Voice lead capture (T-1): config from server env. Values are never logged or returned.
export const TZ = 'Asia/Kolkata';

export function voiceConfig(env = process.env) {
  return Object.freeze({
    toolSecret: env.VOICE_TOOL_SECRET || '',
    webhookSecret: env.ELEVENLABS_WEBHOOK_SECRET || '',
    calKey: env.CAL_API_KEY || '',
    calEventTypeId: Number(env.CAL_EVENT_TYPE_ID) || 0,
    leadsKey: env.VOICE_LEADS_KEY || '',
    agentId: env.VOICE_AGENT_ID || '',
    // Same Resend setup as api/lead.js: no key = no email.
    resendKey: env.RESEND_API_KEY || '',
    leadTo: env.LEAD_TO || 'hello@elementalsai-labs.com',
    leadFrom: env.LEAD_FROM || 'ElementalsAI Labs <leads@elementalsai-labs.com>',
  });
}
