// POST /api/lead: the quote form (typed or filled by the voice agent) sends one lead here.
// 1. It keeps every lead in the project's private Blob store (BLOB_READ_WRITE_TOKEN, set by Vercel). Read them at /api/leads.
// 2. When an email sender is set up (RESEND_API_KEY, LEAD_TO, LEAD_FROM), it also emails the lead.
import { put } from '@vercel/blob';

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

  const at = new Date().toISOString();
  let saved = false, emailed = false;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const path = `leads/${at.slice(0, 10)}/${at.replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}.json`;
      await put(path, JSON.stringify({ at, ...lead }), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
      saved = true;
    } catch (e) { console.error('lead save failed', e && e.message); }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
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
      emailed = r.ok;
      if (!r.ok) console.error('lead email failed', r.status, (await r.text()).slice(0, 300));
    } catch (e) { console.error('lead email error', e && e.message); }
  }

  if (!saved && !emailed) return res.status(503).json({ ok: false, error: 'not_saved' });
  return res.status(200).json({ ok: true });
}
