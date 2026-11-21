// Voice lead capture (T-1): the team alert email. Same Resend call as api/lead.js.
// The only file that talks to Resend for voice leads.
import { REQUIRED_FOR_FULL, CANONICAL } from './voice-fields.js';

const val = (lead, k) => (lead.fields[k] ? lead.fields[k].value : '');
const mark = (lead, k) => (lead.fields[k] && lead.fields[k].confirmed === false ? ' (not confirmed)' : '');

export function alertEmail(lead) {
  const c = lead.completeness || { have: [], missing: REQUIRED_FOR_FULL };
  const other = Object.keys(lead.fields).filter((k) => !CANONICAL.includes(k));
  const booked = lead.booking && lead.booking.status === 'booked';
  const lines = [
    `Status: ${lead.status} (${c.have.length} of ${REQUIRED_FOR_FULL.length}${c.missing.length ? `, missing ${c.missing.join(', ')}` : ''})`,
    `Name: ${val(lead, 'name') || '-'}`,
    `Phone: ${val(lead, 'phone') || '-'}${mark(lead, 'phone')}`,
    `Email: ${val(lead, 'email') || '-'}${mark(lead, 'email')}`,
    `Need: ${val(lead, 'need') || '-'}`,
    `Business: ${val(lead, 'business') || '-'}`,
    `Timeline: ${val(lead, 'timeline') || '-'}`,
    ...other.map((k) => `${k}: ${val(lead, k)}`),
    `Booking: ${booked ? `${lead.booking.start} (Cal.com ${lead.booking.uid})` : 'none'}`,
    `Summary: ${(lead.analysis && lead.analysis.summary) || '-'}`,
    `Call: ${lead.call ? `${lead.call.duration_secs == null ? '?' : lead.call.duration_secs} s, ${lead.call.termination_reason || 'no reason given'}` : '-'}`,
    `Lead: ${lead.lead_id}, conversation ${lead.conversation_id}`,
  ];
  const email = lead.fields.email && lead.fields.email.confirmed ? lead.fields.email.value : undefined;
  return { subject: `Voice lead (${lead.status}): ${val(lead, 'name') || 'no name'}`, text: lines.join('\n'), replyTo: email };
}

export function resendSender({ apiKey, from, to, fetchImpl = fetch, timeoutMs = 8000 }) {
  return async function sendEmail({ subject, text, replyTo }) {
    try {
      const r = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      return { ok: r.ok, status: r.status };
    } catch (e) {
      return { ok: false, status: 0, code: e && e.name === 'TimeoutError' ? 'timeout' : 'network' };
    }
  };
}
