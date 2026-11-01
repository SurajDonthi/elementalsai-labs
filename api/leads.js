// GET /api/leads: Suraj's private list of every lead, newest first. The browser asks for a password (LEADS_KEY); any user name works.
import { list, get } from '@vercel/blob';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ist = (iso) => new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  const want = process.env.LEADS_KEY, auth = String(req.headers.authorization || '');
  const pass = auth.startsWith('Basic ') ? Buffer.from(auth.slice(6), 'base64').toString().split(':').slice(1).join(':') : '';
  if (!want || pass !== want) { res.setHeader('WWW-Authenticate', 'Basic realm="ElementalsAI Labs leads"'); return res.status(401).send('Password needed.'); }

  const blobs = [];
  let cursor;
  do { const r = await list({ prefix: 'leads/', cursor, limit: 1000 }); blobs.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined; } while (cursor && blobs.length < 2000);
  blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  const rows = await Promise.all(blobs.slice(0, 300).map(async (b) => {
    try { const g = await get(b.pathname, { access: 'private', useCache: false }); return g && g.stream ? JSON.parse(await new Response(g.stream).text()) : null; } catch { return null; }
  }));
  const tr = rows.filter(Boolean).map((l) => `<tr><td>${esc(ist(l.at))}</td><td>${l.source === 'voice' ? 'Voice' : 'Form'}</td><td><b>${esc(l.name)}</b></td>
<td>${l.phone ? `<a href="tel:${esc(l.phone.replace(/[^\d+]/g, ''))}">${esc(l.phone)}</a>` : ''}${l.email ? `<br><a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : ''}</td>
<td>${esc(l.idea)}</td><td>${esc(l.page)}${Object.keys(l.origin || {}).length ? '<br><small>' + Object.entries(l.origin).map(([k, v]) => esc(k + ': ' + v)).join('<br>') + '</small>' : ''}</td></tr>`).join('\n');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Leads · ElementalsAI Labs</title>
<style>body{margin:0;background:#0A0A0B;color:#fff;font:15px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}main{max-width:1200px;margin:0 auto;padding:28px 16px}h1{font:600 26px/1.2 Georgia,serif;margin:0 0 4px}p{color:#8A8780;margin:0 0 20px}
.t{overflow-x:auto;border:1px solid #232327}table{border-collapse:collapse;width:100%;min-width:760px}th,td{padding:12px 14px;border-bottom:1px solid #232327;text-align:left;vertical-align:top}th{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#FFBD59;background:#111113}td small{color:#8A8780}a{color:#FFBD59}</style></head>
<body><main><h1>Leads</h1><p>${rows.filter(Boolean).length} so far, newest first. Times are India time. Reply within 1 hour.</p>
<div class="t"><table><thead><tr><th>When</th><th>From</th><th>Name</th><th>Contact</th><th>Idea</th><th>Page and ad</th></tr></thead><tbody>${tr || '<tr><td colspan="6">No leads yet.</td></tr>'}</tbody></table></div></main></body></html>`);
}
