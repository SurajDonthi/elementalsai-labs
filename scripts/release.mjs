// The live build: npm run build → public/.
// It builds every page with LABS_PROD, then moves the inline styles, scripts, images, sounds and fonts into cached files under public/assets/,
// gives each page its clean address (/mobile-app-development, /quote …), and writes robots.txt, sitemap.xml and 404.html.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url), PUB = new URL('public/', ROOT), AS = new URL('assets/', PUB);
const SITE = 'https://elementalsai-labs.com';
/* the review files keep their numbers; the live addresses match the Google Ads final URLs and sitelinks */
const ROUTE = { '01-mobile-app-development': 'mobile-app-development', '02-app-development': 'app-development', '06-ai-development': 'ai-development', '08-ai-agents-and-automation': 'ai-agents-and-automation', '11-custom-software': 'custom-software' };
/* the icons (from the official Elementals.ai-icons folder) and the sharing image, served from the site root */
const BRAND = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-96x96.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'og-image.png'];
const ICONS = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32"><link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"><link rel="manifest" href="/site.webmanifest">
<meta name="apple-mobile-web-app-title" content="ElementalsAI Labs"><meta name="application-name" content="ElementalsAI Labs">`;
const ORG = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'ElementalsAI Labs', url: 'https://elementalsai-labs.com/', logo: 'https://elementalsai-labs.com/icon-512.png', email: 'hello@elementalsai-labs.com', telephone: '+91 80887 33622', areaServed: 'IN' });
const route = (name) => (name === 'index' ? '' : ROUTE[name] || name); // the home page is /
/* each service page: a Service (named by the page's eyebrow, described by its meta description) and its breadcrumb, Home → page */
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const ld = (o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const serviceLd = (name, description, url) => ld({ '@context': 'https://schema.org', '@type': 'Service', name, description, url,
  provider: { '@type': 'Organization', name: 'ElementalsAI Labs', url: SITE + '/' }, areaServed: { '@type': 'Country', name: 'India' } }) + '\n' +
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name, item: url }] });

const tmp = mkdtempSync(join(tmpdir(), 'labs-release-'));
try {
  const env = { ...process.env, LABS_PROD: '1', LABS_OUT: tmp };
  for (const f of ['build.mjs', 'site.mjs']) execFileSync(process.execPath, [fileURLToPath(new URL('src/' + f, ROOT))], { env, stdio: 'inherit' });

  rmSync(PUB, { recursive: true, force: true }); mkdirSync(AS, { recursive: true });
  const saved = new Map();
  const save = (buf, ext) => { const h = createHash('sha1').update(buf).digest('hex').slice(0, 12), name = h + '.' + ext; if (!saved.has(name)) { writeFileSync(new URL(name, AS), buf); saved.set(name, buf.length); } return '/assets/' + name; };
  const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'font/woff2': 'woff2' };
  const routes = [];
  let mainCss = '';

  for (const file of readdirSync(tmp).filter((f) => f.endsWith('.html'))) {
    const name = file.replace(/\.html$/, ''), r = route(name);
    let html = readFileSync(join(tmp, file), 'utf8');
    html = html.replace(/data:(image\/(?:png|jpeg|webp|gif|svg\+xml)|audio\/(?:mpeg|wav)|font\/woff2);base64,([A-Za-z0-9+/=]+)/g, (_, type, b64) => save(Buffer.from(b64, 'base64'), EXT[type]));
    /* LF line endings, so a build on Windows names css/js files the same as the Vercel build */
    const lf = (s) => Buffer.from(s.replace(/\r\n/g, '\n'));
    html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => { const u = save(lf(css), 'css'); if (!mainCss) mainCss = u; return `<link rel="stylesheet" href="${u}">`; });
    html = html.replace(/<script>([\s\S]*?)<\/script>/g, (all, js) => (js.length > 400 ? `<script src="${save(lf(js), 'js')}"></script>` : all));
    html = html.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g, (_, n, hash) => `href="/${route(n)}${hash || ''}"`);
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'ElementalsAI Labs';
    const desc = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
    const url = SITE + '/' + r;
    html = html.replace('</head>', `<link rel="canonical" href="${url}">
${ICONS}
<meta property="og:type" content="website"><meta property="og:site_name" content="ElementalsAI Labs"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="ElementalsAI Labs: we build apps and AI your users will love. Free quote in 12 hours, working demo in 3 days.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}/og-image.png">${r ? '' : '\n<script type="application/ld+json">' + ORG + '</script>'}${ROUTE[name] ? '\n' + serviceLd(unesc((html.match(/<span class="eyebrow[^"]*">([^<]+)<\/span>/) || [])[1] || title.split(' | ')[0]), unesc(desc), url) : ''}
</head>`);
    writeFileSync(new URL((r || 'index') + '.html', PUB), html);
    routes.push(r);
    console.log('public/' + (r || 'index') + '.html', Math.round(html.length / 1024) + ' KB');
  }

  for (const f of BRAND) copyFileSync(new URL('src/assets/brand/' + f, ROOT), new URL(f, PUB));
  writeFileSync(new URL('site.webmanifest', PUB), JSON.stringify({ name: 'ElementalsAI Labs', short_name: 'ElementalsAI', start_url: '/', display: 'browser', background_color: '#0A0A0B', theme_color: '#0A0A0B',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 1) + '\n');
  writeFileSync(new URL('robots.txt', PUB), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  writeFileSync(new URL('sitemap.xml', PUB), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.sort().map((r) => `  <url><loc>${SITE}/${r}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(new URL('404.html', PUB), `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found · ElementalsAI Labs</title><meta name="robots" content="noindex">
${ICONS}<link rel="stylesheet" href="${mainCss}"></head>
<body><main class="wrap" style="min-height:100vh;display:grid;align-content:center;gap:20px"><span class="eyebrow">404</span><h1 class="h2">This page does not exist.</h1><p class="lede">Get a free quote in 12 hours, or see what we build.</p><p><a class="btn primary" href="/quote">Get a free quote</a></p><p><a href="/mobile-app-development">Mobile apps</a> · <a href="/app-development">App development</a> · <a href="/ai-development">AI development</a> · <a href="/ai-agents-and-automation">AI agents</a> · <a href="/custom-software">Custom software</a></p></main></body></html>
`);
  /* old style and script files stay online, so Clarity can replay visits recorded on earlier versions of the site.
     assets-keep/ holds every css/js file a past build made; commit new ones with each change (scripts/keep-assets.mjs fills in past versions). */
  const KEEP = new URL('assets-keep/', ROOT);
  mkdirSync(KEEP, { recursive: true });
  for (const n of saved.keys()) if (/\.(css|js)$/.test(n) && !existsSync(new URL(n, KEEP))) copyFileSync(new URL(n, AS), new URL(n, KEEP));
  let kept = 0;
  for (const n of readdirSync(KEEP)) if (!saved.has(n)) { copyFileSync(new URL(n, KEEP), new URL(n, AS)); kept++; }
  console.log(`kept ${kept} older css/js files for session replays`);
  const kb = [...saved.values()].reduce((a, b) => a + b, 0) / 1024;
  console.log(`assets: ${saved.size} files, ${Math.round(kb)} KB · pages: ${routes.length}`);
} finally { rmSync(tmp, { recursive: true, force: true }); }
