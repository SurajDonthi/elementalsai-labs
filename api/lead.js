// POST /api/lead: the quote form (typed or filled by the voice agent) sends one lead here.
// It emails the lead to LEAD_TO through Resend. Set these in Vercel: RESEND_API_KEY, LEAD_TO, LEAD_FROM (a sender on a domain verified in Resend).
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'bad_request' });
  if (b.website) return res.status(200).json({ ok: true }); // the hidden field: only bots fill it

  const lead = {
    name: clip(b.name, 80), idea: clip(b.idea, 2000), phone: clip(b.phone, 30), email: clip(b.email, 120),
    page: clip(b.page, 100), source: b.source === 'voice' ? 'voice' : 'form', conversation: clip(b.conversation, 80),
    origin: b.origin && typeof b.origin === 'object' ? Object.fromEntries(Object.entries(b.origin).slice(0, 12).map(([k, v]) => [clip(k, 40), clip(v, 200)])) : {}
  };
  const okPhone = lead.phone.replace(/\D/g, '').length >= 10, okEmail = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(lead.email);
  if (lead.name.length < 2 || lead.idea.length < 6 || !(okPhone || okEmail)) return res.status(422).json({ ok: false, error: 'missing_fields' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'not_configured' });
  const text = [
    `Name: ${lead.name}`, `Phone: ${lead.phone || '-'}`, `Email: ${lead.email || '-'}`, '', 'Idea:', lead.idea, '',
    `Sent by: ${lead.source === 'voice' ? 'the voice agent' : 'the typed form'}${lead.conversation ? ' (ElevenLabs conversation ' + lead.conversation + ')' : ''}`,
    `Page: ${lead.page}`, ...Object.entries(lead.origin).map(([k, v]) => `${k}: ${v}`), '',
    'Reply within 1 hour. The free quote is due in 12 hours.'
  ].join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.LEAD_FROM || 'ElementalsAI Labs <leads@elementalsai-labs.com>',
        to: [process.env.LEAD_TO || 'hello@elementalsai-labs.com'],
        reply_to: okEmail ? lead.email : undefined,
        subject: `New quote request: ${lead.name}${lead.source === 'voice' ? ' (voice)' : ''}`,
        text
      })
    });
    if (!r.ok) { console.error('lead email failed', r.status, (await r.text()).slice(0, 300)); return res.status(502).json({ ok: false, error: 'email_failed' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('lead email error', e && e.message);
    return res.status(502).json({ ok: false, error: 'email_failed' });
  }
}
