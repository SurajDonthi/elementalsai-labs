// npm run dev → http://localhost:4173 serves public/ the way Vercel does (clean addresses; / is the home page).
// POST /api/lead saves the lead to leads.local.jsonl, so local tests never reach the live lead store; LABS_REAL_LEADS=1 runs api/lead.js instead.
import { createServer } from 'node:http';
import { readFile, appendFile } from 'node:fs/promises';
import handler from '../api/lead.js';

const PUB = new URL('../public/', import.meta.url), PORT = Number(process.env.PORT) || 4173;
const TYPE = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', xml: 'application/xml', txt: 'text/plain', mp3: 'audio/mpeg', wav: 'audio/wav', woff2: 'font/woff2' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/api/lead') {
    let raw = ''; for await (const c of req) raw += c;
    let body = null; try { body = JSON.parse(raw); } catch {}
    if (!process.env.LABS_REAL_LEADS) {
      await appendFile(new URL('../leads.local.jsonl', import.meta.url), JSON.stringify({ at: new Date().toISOString(), ...body }) + '\n');
      console.log('lead (saved locally, not emailed):', body && body.name, '|', body && (body.phone || body.email), '|', body && body.source);
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"ok":true}');
    }
    const out = { statusCode: 200, status(c) { this.statusCode = c; return this; }, setHeader() {}, json(o) { res.writeHead(this.statusCode, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); } };
    return handler({ method: req.method, body }, out);
  }
  const tries = path.endsWith('/') ? [path + 'index.html'] : /\.\w+$/.test(path) ? [path] : [path + '.html', path + '/index.html'];
  for (const t of tries) {
    try { const buf = await readFile(new URL('.' + t, PUB)); res.writeHead(200, { 'Content-Type': TYPE[t.split('.').pop()] || 'application/octet-stream' }); return res.end(buf); } catch {}
  }
  try { const nf = await readFile(new URL('404.html', PUB)); res.writeHead(404, { 'Content-Type': TYPE.html }); res.end(nf); } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, () => console.log(`ElementalsAI Labs site: http://localhost:${PORT}`));
