// The live build: npm run build → public/.
// It builds every page with LABS_PROD, then moves the inline styles, scripts and images into cached files under public/assets/,
// gives each page its clean address (/mobile-app-development, /quote …), and writes robots.txt, sitemap.xml and 404.html.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url), PUB = new URL('public/', ROOT), AS = new URL('assets/', PUB);
const SITE = 'https://elementalsai-labs.com';
/* the review files keep their numbers; the live addresses match the Google Ads final URLs and sitelinks */
const ROUTE = { '01-mobile-app-development': 'mobile-app-development', '02-app-development': 'app-development', '06-ai-development': 'ai-development', '08-ai-agents-and-automation': 'ai-agents-and-automation', '11-custom-software': 'custom-software' };
const route = (name) => (name === 'index' ? '' : ROUTE[name] || name); // the home page is /

const tmp = mkdtempSync(join(tmpdir(), 'labs-release-'));
try {
  const env = { ...process.env, LABS_PROD: '1', LABS_OUT: tmp };
  for (const f of ['build.mjs', 'site.mjs']) execFileSync(process.execPath, [fileURLToPath(new URL('src/' + f, ROOT))], { env, stdio: 'inherit' });

  rmSync(PUB, { recursive: true, force: true }); mkdirSync(AS, { recursive: true });
  const saved = new Map();
  const save = (buf, ext) => { const h = createHash('sha1').update(buf).digest('hex').slice(0, 12), name = h + '.' + ext; if (!saved.has(name)) { writeFileSync(new URL(name, AS), buf); saved.set(name, buf.length); } return '/assets/' + name; };
  const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
  const routes = [];
  let mainCss = '';

  for (const file of readdirSync(tmp).filter((f) => f.endsWith('.html'))) {
    const name = file.replace(/\.html$/, ''), r = route(name);
    let html = readFileSync(join(tmp, file), 'utf8');
    html = html.replace(/data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)/g, (_, type, b64) => save(Buffer.from(b64, 'base64'), EXT[type]));
    html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => { const u = save(Buffer.from(css), 'css'); if (!mainCss) mainCss = u; return `<link rel="stylesheet" href="${u}">`; });
    html = html.replace(/<script>([\s\S]*?)<\/script>/g, (all, js) => (js.length > 400 ? `<script src="${save(Buffer.from(js), 'js')}"></script>` : all));
    html = html.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g, (_, n, hash) => `href="/${route(n)}${hash || ''}"`);
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'ElementalsAI Labs';
    const desc = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
    const url = SITE + '/' + r;
    html = html.replace('</head>', `<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="ElementalsAI Labs">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
</head>`);
    writeFileSync(new URL((r || 'index') + '.html', PUB), html);
    routes.push(r);
    console.log('public/' + (r || 'index') + '.html', Math.round(html.length / 1024) + ' KB');
  }

  writeFileSync(new URL('favicon.svg', PUB), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0A0A0B"/><circle cx="32" cy="32" r="22" fill="#FFBD59"/></svg>\n');
  writeFileSync(new URL('robots.txt', PUB), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  writeFileSync(new URL('sitemap.xml', PUB), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.sort().map((r) => `  <url><loc>${SITE}/${r}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(new URL('404.html', PUB), `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found · ElementalsAI Labs</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@600&display=swap"><link rel="stylesheet" href="${mainCss}"></head>
<body><main class="wrap" style="min-height:100vh;display:grid;align-content:center;gap:20px"><span class="eyebrow">404</span><h1 class="h2">This page does not exist.</h1><p class="lede">Get a free quote in 12 hours, or see what we build.</p><p><a class="btn primary" href="/quote">Get a free quote</a></p><p><a href="/mobile-app-development">Mobile apps</a> · <a href="/app-development">App development</a> · <a href="/ai-development">AI development</a> · <a href="/ai-agents-and-automation">AI agents</a> · <a href="/custom-software">Custom software</a></p></main></body></html>
`);
  const kb = [...saved.values()].reduce((a, b) => a + b, 0) / 1024;
  console.log(`assets: ${saved.size} files, ${Math.round(kb)} KB · pages: ${routes.length}`);
} finally { rmSync(tmp, { recursive: true, force: true }); }
