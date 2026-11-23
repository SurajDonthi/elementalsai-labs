// The ads funnel page /build (Suraj, 21 and 22 Nov 2026): the live service page plus the /build sections, one template with a version for each of the 5 services.
// The base is the live service page: its sections come from src/build.mjs, imported, not rebuilt. The /build words come from src/go-content.json (Jane's words).
// Which version a click gets: ?s= (the service slug, its ad group number such as ?s=06, or "06-<slug>") or ?service_line=;
// else the ad keyword (?kw=, ?keyword= or utm_term) matched against pick.keyword_rules, in order; else the general version.
// The page holds every version; a small script in the head picks one before the first paint (html[data-svc]) and CSS hides the rest.
// A script before the site's script then removes the other versions, so each id is in the page once.
// Run: node src/go.mjs → review/build.html (a draft copy). The live build (npm run build, scripts/release.mjs) writes public/build.html.
// The page stands alone: not in the header, footer or sitemap; noindex; its logo links to the main site.
// Page order (Suraj's 22-section list, 22 Nov 2026, F-319; strip above the header, 13:21): contact strip, header (logo and one button), hero with the quote form (no budget question) and the voice agent, clients,
// worries, who it is for, before and after, how it works, what happens on the call, what you keep, alone vs with us, the number strip (the 4 numbers),
// founder, testimonials, see our work, app library, case studies, guarantee, final call to action, FAQ, footer; then the form drawer on phones. No "Try it" (F-314).
// No #limit (the "4 to 5 clients a month" block): Suraj had it removed, 23 Nov 2026.
// No "Real products. Real numbers." (the live impact section): Suraj removed it (22 Nov 2026, 15:13 and 15:14). The approved Impact is the case studies part.
// The strip and the header both stay at the top while the page scrolls (13:26). On phones the header shows only the logo and the form is a drawer from the bottom (13:45).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { hasShowcase, showcase, SHOWCASE_CSS, SHOWCASE_JS } from './showcase.mjs';
import { pathToFileURL } from 'node:url';
import { CSS, JS, SPRITE, REVIEWS, P, fontPreload, headExtra, labsCfg, esc, attr, I, strip, header, footer, hero, marquee, gamble, how, stats, review, types, cases, cta, faq, OUT, TX, useText, deriskOf } from './build.mjs';

const C = JSON.parse(readFileSync(process.env.GO_CONTENT || new URL('go-content.json', import.meta.url), 'utf8'));
const fail = (m) => { throw new Error('go.mjs: ' + m); };
/* each change to a reused part must hit exactly one place, so a change in build.mjs or app.js stops the build instead of breaking the page */
const must = (s, a, b) => { if (s.split(a).length !== 2) fail('expected one ' + JSON.stringify(a.slice(0, 80))); return s.replace(a, () => b); };
const mustRe = (s, re, b) => { const n = (s.match(new RegExp(re.source, 'g')) || []).length; if (n !== 1) fail('expected one ' + re); return s.replace(re, () => b); };
const json = (o) => { const s = JSON.stringify(o); if (s.includes('<')) fail('a < in the page data'); return s; };

const { config: CF, sections: S, services: SV } = C;
if (/^Draft/.test(C.status || '')) console.warn('go.mjs: ' + C.status);
const SERVICES = Object.keys(SV).filter((k) => k !== 'default') /* the 7 search-theme versions (Suraj, 23 Nov 2026); the 4 old service versions are parked in src/parked-variations.json */, SLUGS = [...SERVICES, 'default'];
if (!SV.default || !SV[SV.default.lines_from]) fail('services.default.lines_from is not a service');
for (const r of C.pick.keyword_rules) if (!SERVICES.includes(r.service)) fail('keyword rule for an unknown service: ' + r.service);
/* the general version takes its lines (headline, problems, before and after, FAQ) from services.default.lines_from */
const svc = (slug) => { const v = SV[slug]; return v.lines_from ? { ...SV[v.lines_from], ...v } : v; };

/* {service_name} and {modules example} come from the service, {slots_left} from config; any other {word} stops the build */
const VARS = { service_name: (s) => s.service_name, 'modules example': (s) => s.modules, slots_left: () => CF.slots_left };
const fill = (t, s) => String(t).replace(/\{([a-z_ ]+)\}/g, (m, k) => {
  if (!Object.hasOwn(VARS, k)) fail('unknown ' + m + ' in: ' + t);
  const v = VARS[k](s); if (v == null || v === '') fail(m + ' has no value in: ' + t); return String(v);
});
/* each [REPLACE …] shows on the page as a visible placeholder */
const ph = (t) => esc(t).replace(/\[REPLACE[^\]]*\]/g, (m) => `<span class="go-ph">${m}</span>`);
/* the highlights of the reviews, marked as on surajdonthi.com (its lib/rich.ts): *words* show in bold, __words__ are underlined, both in the Labs amber (--accent), never the blue of the personal site
   (Suraj, 22 Nov 2026, 16:17 and 16:20); the text is escaped first. plain() is the text without the marks */
const rich = (t) => esc(t).replace(/\*(.+?)\*/g, '<b class="rich-b">$1</b>').replace(/__(.+?)__/g, '<u class="rich-u">$1</u>');
const plain = (t) => String(t).replace(/\*(.+?)\*/g, '$1').replace(/__(.+?)__/g, '$1');
/* one copy of each distinct text, marked with the versions that show it */
const groups = (f) => { const g = new Map(); for (const s of SLUGS) { const h = f(svc(s), s); if (!g.has(h)) g.set(h, []); g.get(h).push(s); } return g; };
const vary = (f) => { const g = groups(f); return g.size === 1 ? [...g.keys()][0] : [...g].map(([h, ss]) => `<span data-if="${ss.join(' ')}">${h}</span>`).join(''); };
const varyBlock = (f) => { const g = groups(f); return g.size === 1 ? [...g.keys()][0] : [...g].map(([h, ss]) => h.replace(/^<([a-z0-9]+)/, (m) => `${m} data-if="${ss.join(' ')}"`)).join('\n'); };
const V = (t) => vary((s) => ph(fill(t, s)));

/* the picker: ?s= takes the slug, the ad group number (06 or 6) or "06-<slug>" */
const ALIAS = { default: 'default' };
for (const s of SERVICES) { ALIAS[s] = s; for (const g0 of [].concat(SV[s].ad_groups || SV[s].ad_group || [])) { const g = String(g0); for (const a of [g, String(Number(g)), g + '-' + s]) ALIAS[a] = s; } }
const PICK = {
  sp: C.pick.service_params, kp: C.pick.keyword_params, alias: ALIAS,
  rules: C.pick.keyword_rules.map((r) => [r.service, r.words.map((w) => w.toLowerCase())]),
  title: Object.fromEntries(SLUGS.map((s) => [s, svc(s).callout + ' | ' + CF.brand.name])),
};
/* the one config object every button reads (skill S8.1) */
const GO_CFG = { booking_link: CF.booking_link, slots_left: CF.slots_left, contact: CF.contact, brand: CF.brand, tracking: { datalayer_key: 'service_line', events: CF.tracking.events } };
/* runs in the head, before the first paint and before Google Tag Manager: picks the version, sets the title, tells the dataLayer */
const HEAD_JS = 'window.GO_CFG=' + json(GO_CFG) + ';\n(function(P){' + String.raw`var q,s,k='',hit='',i,j,t,A=Object.prototype.hasOwnProperty;
try{q=new URLSearchParams(location.search)}catch(e){q={get:function(){return null}}}
function norm(v){return String(v||'').toLowerCase().trim().replace(/[\s_+]+/g,'-').replace(/^-+|-+$/g,'')}
for(i=0;i<P.sp.length&&!hit;i++){s=norm(q.get(P.sp[i]));if(s&&A.call(P.alias,s))hit=P.alias[s]}
for(i=0;i<P.kp.length&&!k;i++)k=q.get(P.kp[i])||'';
if(!hit&&k){t=' '+k.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' ';
 for(i=0;i<P.rules.length&&!hit;i++)for(j=0;j<P.rules[i][1].length;j++)if(t.indexOf(' '+P.rules[i][1][j]+' ')>-1){hit=P.rules[i][0];break}}
hit=hit||'default';
document.documentElement.setAttribute('data-svc',hit);
if(A.call(P.title,hit))document.title=P.title[hit];
(window.dataLayer=window.dataLayer||[]).push({service_line:hit});` + '})(' + json(PICK) + ');';

/* the live service page behind each version; the general version shows the custom software page */
const KEY = { 'build-an-app': '02-app-development', 'ecommerce-apps': '02-app-development', 'build-with-ai': '06-ai-development', 'automate-work': '08-ai-agents-and-automation', 'custom-software': '11-custom-software', 'healthcare-apps': '02-app-development', 'fintech-apps': '02-app-development', default: '11-custom-software' };
for (const s of SLUGS) if (!Object.hasOwn(KEY, s) || !P[KEY[s]]) fail('no live service page for the version ' + s);
/* the same change n times */
const mustN = (s, a, b, n) => { const k = s.split(a).length - 1; if (k !== n) fail('expected ' + n + ' of ' + JSON.stringify(a.slice(0, 80)) + ', found ' + k); return s.split(a).join(b); };
/* a section that differs by version: one copy of each distinct version; the build stops if a copy did not get its data-if */
const byVersion = (name, f) => {
  const g = groups(f), out = varyBlock(f);
  if (g.size > 1) for (const [h, ss] of g) if (h && (!/^<[a-z0-9]+/.test(h) || !out.includes(`data-if="${ss.join(' ')}"`))) fail(name + ': the version ' + ss.join(' ') + ' got no data-if');
  return out;
};
/* a live section, made by build.mjs from the version's own service page */
const live = (name, fn) => byVersion(name, (_, s) => fn(P[KEY[s]], s).trim());

/* the site's script, with three changes: the lead names its version (/build?s=<slug>); the form does not need a budget (the /build form has no budget question, Suraj, 22 Nov 2026);
   a button to the form opens the form drawer on phones, and elsewhere scrolls the form to just under the strip and the header, which both stay at the top */
let GO_JS = must(must(JS, 'page: location.pathname,', "page: location.pathname + '?s=' + (root.getAttribute('data-svc') || ''),"), "source !== 'voice' && !valid.budget(budget) && 'your budget', ", '');
GO_JS = must(GO_JS, "var hh = parseFloat(getComputedStyle(root).getPropertyValue('--hh')) || 72, r = card.getBoundingClientRect();", "if (W.GO_DR && W.GO_DR.open()) return;\n  var hh = Math.round($('.top').getBoundingClientRect().bottom) || 72, r = card.getBoundingClientRect();");

/* an X: the "Not for you if" mark (red, Suraj, 22 Nov 2026, 15:21) and the drawer's close button */
const X_ICON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const TEL_A = `<a href="tel:${attr(CF.contact.tel)}">${esc(CF.contact.phone)}</a>`, MAIL_A = `<a href="mailto:${attr(CF.contact.email)}">${esc(CF.contact.email)}</a>`;
/* a photo: true is Deep's (build.mjs), else a .jpg file name in src/assets */
const photoOf = (f) => { if (f === true) return true; if (!/^[a-z0-9-]+\.jpe?g$/.test(f)) fail('a photo must be a .jpg in src/assets: ' + f); return 'data:image/jpeg;base64,' + readFileSync(new URL('assets/' + f, import.meta.url)).toString('base64'); };

/* the approved words (Suraj, 22 Nov 2026); the build stops if the content file says anything else */
const STEPS = [
  'Book your free strategy session with our team.',
  'Pass a quick eligibility check.',
  'Get free UI design mockups, product specs, architecture, modules, tech stack & implementation plan.',
  'Want more? Request your free working proof of concept worth ₹50,000.*',
  'Commence your project.',
  'Delivered in 2 to 8 weeks. Either you love what we built or you get a full refund. Pay only when you see it built.',
];
const TERMS = '* Terms & Conditions of Eligibility Apply';
/* the guarantee section (Suraj, 22 Nov 2026), the guarantee line under the form's send button and the money-back words of step 6 */
/* the guarantee line: Suraj's new line, 22 Nov 2026, 18:25 (F-398), in place of "Zero risk: you love it, or you get a full refund. …" everywhere.
   The form line and step 6 say it too, word for word, in place of "Complete money-back guarantee if not satisfied." and "Not satisfied? Complete money-back guaranteed." (Daisy's brief, 22 Nov 2026, 22:3x) */
const GUARD_T = 'Either you love what we built or you get a full refund. Pay only when you see it built.', GUARD_FORM_T = GUARD_T;
const CTA_BTN = 'Get my free strategy session', CTA_LINE = 'Pay only when you see it built.', CALLBACK = 'Get a callback in 1 hour.';
/* the 4th number: the free proof of concept line of "What you keep" (Proof of Work Build), in place of "3 days to a working proof": the working demo is not a separate point (Daisy's brief, 22 Nov 2026, 22:3x) */
const STATS = [['120+', 'applications delivered'], ['10+', 'years building products'], ['$10M+', 'in client revenue enabled'], ['Free', 'working proof of concept worth Rs. 50,000']];
const DEEP_T = 'Our accuracy had been stuck for months. We had the data, we had a model, and no idea what to try next. Suraj did not hand us a roadmap. He sat with the team and made us systematic — how to define a dataset, when to retrain, how to choose a model and why. Three months later the module went from 43% to 93%. Then the calls started coming in: enterprise deals we could not have had before.';
const SACHIN_T = 'I had spent two years building something I believed in, and I could not get it to move. Not for lack of effort. For lack of clarity — and no reliable partner. One month with Suraj and I could finally see it — who my users were, what they actually needed, and what to build first. Two months later I was ready for market. In the third month I launched. Users came. And revenue, which until then I had only imagined, started showing up.';
if (JSON.stringify(S.process.steps) !== JSON.stringify(STEPS)) fail('sections.process.steps are not the 6 approved steps');
if (S.process.terms !== TERMS) fail('sections.process.terms is not "' + TERMS + '"');
if (S.guarantee.text !== GUARD_T) fail('sections.guarantee.text is not "' + GUARD_T + '"');
if (S.guarantee.form_line !== GUARD_FORM_T) fail('sections.guarantee.form_line is not "' + GUARD_FORM_T + '"');
if (!STEPS[5].endsWith(' ' + GUARD_T)) fail('step 6 does not end with the approved guarantee line "' + GUARD_T + '"');
if (JSON.stringify(S.stats) !== JSON.stringify(STATS)) fail('sections.stats are not the 4 approved numbers');
if (S.footer.line2 !== undefined) fail('footer.line2 (the trade name line) was removed from /build');

/* the site's header with its one button, in /build words (Suraj, 22 Nov 2026): the logo links home; the button goes to the quote form; the progress line stays */
const HEADER = must(header(), '<nav aria-label="Free quote"><a class="btn primary sm" href="#quote">Get a free quote</a></nav>', `<nav aria-label="${attr(C.header.nav)}"><a class="btn primary sm" href="#quote">${esc(C.header.button)}</a></nav>`);
if ((HEADER.match(/<a\b/g) || []).length !== 2) fail('the header must hold only the logo and the one button');

/* the form's title and send button (Suraj, 22 Nov 2026, 13:45), and the names of the drawer's buttons */
const QF = C.quote_form || {};
for (const k of ['title', 'button', 'open', 'close']) if (typeof QF[k] !== 'string' || !QF[k].trim()) fail('quote_form.' + k + ' is empty');
/* GDPR/DPDP: the form named no data use and no link to the privacy policy anywhere (Suraj, 23 Nov 2026, "Fix it. Ensure the page is GDPR compliant too!!").
   One line under the form's reply-time note: what we use the data for, and a link to the privacy policy (same page, same policy, as the footer link below). */
if (!CF.privacy_url) fail('config.privacy_url is empty: the consent line needs a privacy policy link');
const CONSENT_LINE = `By sending this form, you agree to our <a href="${attr(CF.privacy_url)}">privacy policy</a>.`;
/* the live hero (the quote form, with Deepak inside the card) and the live worries, each from the version's service page */
const HERO = live('hero', (p, s) => {
  /* the hero label names the version (Suraj, 23 Nov 2026: "APP DEVELOPMENT -> ECOMMERCE APP"): services.<slug>.eyebrow, else the page's own */
  if (!C.services[s] || !C.services[s].eyebrow) fail('services.' + s + '.eyebrow is empty');
  p = { ...p, eyebrow: C.services[s].eyebrow };
  /* the hero headline per version (Suraj, 23 Nov 2026): services.<slug>.hero_headline = { line, end }; none = the page's own */
  const hl = C.services[s].hero_headline;
  if (hl) { if (!hl.line || !hl.end) fail('services.' + s + '.hero_headline needs line and end'); p = { ...p, line: hl.line, verbs: [hl.end] }; }
  if (!/^100\+ (apps|applications) delivered$/.test(p.proof[0])) fail('hero: the first proof line is no longer "100+ apps delivered" or "100+ applications delivered"');
  /* the first proof line is the first number of the number strip, "120+ applications delivered", on every version: never "120+ apps" (Daisy's brief, 22 Nov 2026, 22:3x) */
  /* no budget question in the form on /build (Suraj, 22 Nov 2026) */
  let h = mustRe(hero({ ...p, proof: [S.stats[0][0] + ' ' + S.stats[0][1], ...p.proof.slice(1)] }), /<fieldset class="fld"><legend>[^<]*<\/legend><div class="opts">[\s\S]*?<\/div><\/fieldset>/, '');
  if (h.includes('name="budget"')) fail('hero: the form still has the budget question');
  /* the left tile: the free strategy session and the 8 assets (Suraj, 23 Nov 2026, 08:1x: "Free strategy session + 8 assets, yours to keep"), in place of the free quote in 12 hours */
  h = must(h, '<dt>Free quote</dt><dd><small>in</small>12 hours</dd>', '<dt>Free strategy session</dt><dd class="go-off"><small>+</small>7 assets<small class="go-keep-s">, yours to keep</small></dd><dd class="go-off"><small>+</small>' + esc(C.header.poc).replace(/^(.*? worth) (.*)$/, '<small class="go-keep-s go-poc-s">$1 </small>$2').replace('Proof of Concept', '<u class="go-u">Proof of Concept</u>') + '</dd>'); /* hero offer: the session and 7 assets, then the free proof of concept worth 50k (Suraj, 23 Nov 2026) */
  /* the hero line under the tiles of the "how you work" version (Suraj, 23 Nov 2026: "Tell us your challenges.") */
  h = h.replace(/(<p class="offer-sub rise">)[^<]*(<\/p>)/, '$1Tell us your problem statement.$2'); /* every version, not only one (Suraj, 23 Nov 2026) */
  /* the right tile (Working demo in 3 days) is removed from the hero (Suraj, 23 Nov 2026) */
  h = must(h, '<div><dt>Working demo</dt><dd><small>in</small>3 days</dd></div>', '');
  /* the form says what the header button said (13:45); its guarantee line is the approved guarantee line (F-398), word for word */
  h = must(h, `<h2 class="eyebrow" id="qf-t">${TX.card.title}</h2>`, `<h2 class="eyebrow" id="qf-t">${esc(QF.title)}</h2>`);
  h = must(h, `type="submit">${TX.card.submit} `, `type="submit">${esc(QF.button)} `);
  /* the idea question of every version's form, in /build words (Suraj, 22 Nov 2026, 19:22, F-407; on all 6 versions: Daisy's brief, 22 Nov 2026, 22:3x) */
  h = must(h, `<label for="f-idea">${esc(p.ideaLabel)}</label>`, `<label for="f-idea">${esc(QF.idea_label)}</label>`);
  h = must(h, deriskOf(TX.derisk), `<p class="derisk">${I('shield')}<span><b>${esc(CTA_LINE)}</b></span></p>`);
  /* GDPR/DPDP consent line, under the reply-time note (23 Nov 2026) */
  h = must(h, `<p class="fnote">${I('clock')}${TX.card.note}</p>`, `<p class="fnote">${I('clock')}${esc(CALLBACK)}</p><p class="fnote go-consent">${CONSENT_LINE}</p>`);
  return h;
});
/* the problem mirror (Suraj, 22 Nov 2026, 15:19 and 15:20): only the problems, each a red line like a deleted line in a diff, with a red "−" before it.
   No "What we hear" label, no strike, no solution lines. The words of the problems do not change.
   At least 5 problems (Suraj, 22 Nov 2026: "Yes, show five problems at least."): the live page's 3, then the version's mirror_more in go-content.json,
   word for word from the pains already written (each line names its source file). The lede counts them: "Three worries" becomes "Five worries". */
const MIRROR_MIN = 5, COUNT = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const WORRIES = byVersion('worries', (sv, s) => {
  const p = P[KEY[s]], more = sv.mirror_more || [], ANS = /<p class="ans">[\s\S]*?<\/p>(?=<\/div>)/g;
  for (const m of more) if (typeof m.line !== 'string' || !m.line.trim() || typeof m.source !== 'string' || !m.source.trim()) fail('services.' + s + '.mirror_more: each problem needs its line and its source');
  const mine = sv.problems || [];
  for (const m of mine) if (typeof m.line !== 'string' || !m.line.trim() || typeof m.source !== 'string' || !m.source.trim()) fail('services.' + s + '.problems: each problem needs its line and its source');
  const worries = mine.length ? mine.map((m) => [m.line, '']) : [...p.worries, ...more.map((m) => [m.line, ''])], n = worries.length, seen = new Set();
  if (n < MIRROR_MIN || n >= COUNT.length) fail('worries: the version ' + s + ' has ' + n + ' problems, not ' + MIRROR_MIN + ' to ' + (COUNT.length - 1));
  for (const [q] of worries) { const k = q.toLowerCase().replace(/[’']/g, "'"); if (seen.has(k)) fail('worries: the version ' + s + ' has a problem twice: ' + q); seen.add(k); }
  const lede = p.worriesLede || TX.worries.lede;
  if (!/^Three worries /.test(lede)) fail('worries: the lede no longer starts with "Three worries": ' + lede);
  let h = mustN(gamble({ ...p, worries, ...(sv.gamble_heading ? { gambleH: esc(sv.gamble_heading).replace(/\*(.+?)\*/, '<span class="band">$1</span>') } : {}) }), `<div class="wr"><span class="lab">${TX.worries.lab}</span>`, '<div class="wr"><span class="go-del" aria-hidden="true">−</span>', n);
  if ((h.match(ANS) || []).length !== n) fail('worries: expected ' + n + ' solution lines to remove');
  h = h.replace(ANS, '');
  h = must(h, `<p class="lede">${lede}</p>`, `<p class="lede">${lede.replace(/^Three /, COUNT[n] + ' ')}</p>`);
  if (/class="(lab|ans|ok)"|What we hear/.test(h)) fail('worries: a label or a solution line is still there');
  for (const [q] of worries) if (!h.includes(`<q>${esc(q)}</q>`)) fail('worries: a problem is not word for word: ' + q);
  if ((h.match(/<q>/g) || []).length !== n) fail('worries: expected ' + n + ' problems on the page');
  return h.trim();
});

/* Before and after (Suraj, 22 Nov 2026, 18:13, F-393): the 3 approved versions A, B and C in one template; each service names its version
   (A: app development, custom software and the general version; B: AI development, AI agents; C: mobile apps). Its headline, then 3 rows, each laid out as
   option 2 of prototypes/before-and-after.html: the Before card, a big amber arrow, then the After card with the heavy frame. *words* get the brand highlight (.band), _words_ an accent underline (.go-u); the words do not change. */
const BA_V = S.before_after.versions || {}, BA_WANT = { 'build-an-app': 'C', 'ecommerce-apps': 'E', 'build-with-ai': 'B', 'automate-work': 'B', 'custom-software': 'A', 'healthcare-apps': 'H', 'fintech-apps': 'F', default: 'A' };
const BA_HEAD = { A: 'Your customers. Your revenue. Sooner.', B: 'Your business. Running without you.', C: 'The app you pictured. Live.' };
for (const k of Object.keys(BA_V)) { const v = BA_V[k], h = BA_HEAD[k]; if (!v || !v.headline || (h && v.headline !== h)) fail('before_after.versions.' + k + ' must have the headline' + (h ? ' "' + h + '"' : '')); if (!Array.isArray(v.rows) || v.rows.length !== 3 || v.rows.some((r) => !Array.isArray(r) || r.length !== 2 || r.some((t) => typeof t !== 'string' || !t.trim()))) fail('before_after.versions.' + k + ' needs 3 rows of [before, after]'); }
for (const s of SLUGS) if (svc(s).before_after !== BA_WANT[s]) fail('services.' + s + ': before_after must be version ' + BA_WANT[s]);
const baRich = (t) => esc(t).replace(/\*(.+?)\*/g, '<span class="band">$1</span>').replace(/_(.+?)_/g, '<span class="go-u">$1</span>');
const BA = `<section class="sec" id="ba" aria-labelledby="ba-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">${esc(S.before_after.heading)}</span>${byVersion('before and after headline', (s) => `<h2 class="h2 go-ba-h" id="ba-t">${esc(BA_V[s.before_after].headline)}</h2>`)}</div>
 ${byVersion('before and after', (s) => `<ul class="go-ba reveal">${BA_V[s.before_after].rows.map(([b, a]) => `<li><div class="before"><span class="lab">${esc(S.before_after.before_label)}</span><p>${baRich(b)}</p></div><span class="go-ba-ar" aria-hidden="true">${I('arrow')}</span><div class="after"><span class="lab">${esc(S.before_after.after_label)}</span><p>${baRich(a)}</p></div></li>`).join('')}</ul>`)}
</div></section>`;
/* Who it is for (Suraj, 22 Nov 2026, F-386 and F-390; the layout: option 1 of prototypes/who-it-is-for.html, back from option 2): one big column,
   "This is for you" large with "for you" in amber, its 3 lines with a green tick; the app types and the industries as chips in two columns under it;
   then "Not for you if:" small, below a dashed line, with a red X on each line.
   No section heading (Suraj, 22 Nov 2026: "Who it is for, and who it is not for" is off the page): "This is for you" names the section. */
if (S.fit.heading != null) fail('sections.fit.heading must stay off: the section has no heading');
for (const k of ['apps', 'industries']) if (!Array.isArray(S.fit[k]) || !S.fit[k].length || typeof S.fit[k + '_label'] !== 'string') fail('sections.fit.' + k + ' and its label are needed');
const chips = (label, list) => `<div class="go-chips-g"><p class="go-lab">${esc(label)}</p><ul class="go-chips">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
const FOR_H = esc(S.fit.for_label).replace(/(for you)$/i, '<span>$1</span>');
const FIT = `<section class="sec go-alt" id="fit" aria-labelledby="fit-t"><div class="wrap">
 <div class="go-fit reveal"><h2 class="go-for-h" id="fit-t">${FOR_H}</h2>
  <ul class="go-for">${S.fit.for.map((t) => `<li><span class="go-for-i" aria-hidden="true">${I('check')}</span><span>${V(t)}</span></li>`).join('')}</ul>
  <div class="go-groups">${chips(S.fit.apps_label, S.fit.apps)}
  ${chips(S.fit.industries_label, S.fit.industries)}</div>
 <div class="go-not"><h3 class="go-not-h">${esc(S.fit.not_label)}</h3><ul>${S.fit.not.map((t) => `<li><span class="go-not-i" aria-hidden="true">${X_ICON}</span><span>${V(t)}</span></li>`).join('')}</ul></div></div>
</div></section>`;
if (FIT.includes('go-poster')) fail('fit: the option 2 amber block is still on the page');
if (FIT.includes('sec-h') || /who it is not for/i.test(FIT) || !FIT.includes(`<h2 class="go-for-h" id="fit-t">${FOR_H}</h2>`)) fail('fit: no section heading; "This is for you" is the heading of the section');

/* the live "How it works" (rail, nodes, the big third step, its button), with Suraj's 6 steps as the step titles and the small terms line */
const CTA_NOTE = `<p class="derisk">${I('shield')}<span><b class="go-nb">${esc(CTA_LINE)}</b></span></p>`;
let HOW = how({ steps: S.process.steps.map((t) => [t, '', '']) });
HOW = HOW.replace(/<p class="derisk">.*?<\/p>(<\/div>)/s, CTA_NOTE + '$1');
HOW = must(HOW, '>Get my free quote <', `>${esc(CTA_BTN)} <`);
HOW = must(HOW, '</ol>', `</ol>\n <p class="go-terms">${esc(TERMS)}</p>`);
if ((HOW.match(/<li class="st/g) || []).length !== 6) fail('How it works: expected 6 steps');
for (const t of STEPS) if (!HOW.includes(`<h3>${esc(t)}</h3>`)) fail('How it works: a step is not word for word: ' + t);
/* the key words of each step in bold amber (.go-hk), the rest normal weight and soft white: option 1 of prototypes/how-it-works.html, the same key words */
const HOW_KEYS = [['free strategy session'], ['quick eligibility check'], ['free UI design mockups'], ['free working proof of concept worth ₹50,000'], ['Commence your project'], ['2 to 8 weeks', 'full refund']];
STEPS.forEach((t, i) => {
  let h = esc(t);
  for (const k of HOW_KEYS[i]) h = must(h, esc(k), `<b class="go-hk">${esc(k)}</b>`);
  HOW = must(HOW, `<h3>${esc(t)}</h3>`, `<h3>${h}</h3>`);
});
if ((HOW.match(/<b class="go-hk">/g) || []).length !== HOW_KEYS.flat().length) fail('How it works: expected ' + HOW_KEYS.flat().length + ' key words');



/* What you keep (Suraj, 22 Nov 2026, 17:54, F-388): the approved lead line, a muted intro line and 8 rows, word for word, as big rows like the problem mirror with an accent "+";
   the last row (Rs. 50,000) is the strongest: larger bold text (Suraj, 22 Nov 2026, 19:50) in the site's card box (about 20:20), in place of the green border */
const KEEP_T = ['Premium App UI Mockups: free premium screens of app.', 'Product Requirements Dossier: personas, feature list, criteria.', 'System Architecture Plan: diagram, data model, APIs, security.', 'Module and Technology Stack Specification: map, frontend, backend, database, cloud.', 'Implementation Schedule: milestones, sprints, timelines, release dates.', 'User Adoption Plan: onboarding, acceptance tests, metrics.', 'Project Cost Estimate: pricing, payment, delivery, sent to you within 24 hours of the call.', 'Proof of Work Build: 3 days, free, worth ₹50,000.'];
const KEEP_LEAD = 'Leave now and you miss out. Book your free strategy session and you get:';
const KEEP_TICK = `<svg class="go-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const keepRow = t => { const c = t.indexOf(":") + 1; return `<span class="go-gut" aria-hidden="true">${KEEP_TICK}</span><span><b>${esc(t.slice(0, c))}</b>${esc(t.slice(c))}</span>`; };
if (S.keep.lead !== KEEP_LEAD) fail('sections.keep.lead is not "' + KEEP_LEAD + '"');
if (JSON.stringify(S.keep.items) !== JSON.stringify(KEEP_T)) fail('sections.keep.items are not the 8 approved rows');
const KEEP = `<section class="sec" id="keep" aria-labelledby="keep-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="keep-t">${esc(S.keep.heading)}</h2><p class="lede go-keep-lead">${esc(S.keep.lead)}</p></div>
 <ul class="go-rows go-keep reveal">${S.keep.items.map((t, i, a) => `<li${i === a.length - 1 ? ' class="go-top"' : ''}>${keepRow(t)}</li>`).join('')}</ul>
 <div class="go-keep-cta reveal"><a class="btn primary" href="#quote">${esc(CTA_BTN)} ${I('arrow')}</a>${CTA_NOTE}</div>
</div></section>`;

/* Compliance, just before the FAQ (Suraj, 22 Nov 2026, 16:01, F-370): we follow the international data and software standards and processes;
   GDPR compliant and SOC 2 compliant. Never the word "certified" on /build */
const CP = S.compliance || {};
if (typeof CP.heading !== 'string' || !CP.heading.trim() || JSON.stringify(CP.badges) !== JSON.stringify(['GDPR compliant', 'SOC 2 compliant'])) fail('sections.compliance needs its heading and the 2 badges "GDPR compliant" and "SOC 2 compliant"');
const COMPLIANCE = `<section class="sec go-alt" id="compliance" aria-labelledby="cp-t"><div class="wrap go-cp reveal">
 <div><span class="eyebrow">${esc(CP.eyebrow)}</span><h2 class="go-cp-h" id="cp-t">${esc(CP.heading)}</h2></div>
 <ul class="go-cp-b">${CP.badges.map((b) => `<li><span class="go-shield" aria-hidden="true">${I('shield')}</span><span>${esc(b)}</span></li>`).join('')}</ul>
</div></section>`;
/* Alone vs with us (Suraj, 22 Nov 2026): the scoreboard, option 2 of prototypes/alone-vs-with-us.html. A red column of crosses against an amber column of ticks,
   the rows in line. Only the two column headings; no label on each row. The 6 approved rows, word for word */
const CMP_L = 'Alone or with a usual agency', CMP_R = 'With us';
const CMP_T = [
  ['You write long specs first.', 'Bring a rough idea. We do the research and the requirements.'],
  ['You see the first result after weeks.', 'You see a free working proof of concept first.'],
  ['Nobody checks each release for security or reliability.', 'Our engineers review every release for security, privacy and reliability.'],
  ['Nobody plans how your data stays private and secure.', 'Your data stays private and secure, to GDPR and SOC 2 standards.'],
  ['It is unclear who owns the code.', 'You own the code when the build is complete.'],
  ['Support ends at launch.', 'You get 6 months of support after launch.'],
];
if (S.compare.left_label !== CMP_L || S.compare.right_label !== CMP_R) fail('sections.compare: the column headings must be "' + CMP_L + '" and "' + CMP_R + '"');
if (JSON.stringify(S.compare.rows) !== JSON.stringify(CMP_T)) fail('sections.compare.rows are not the 6 approved rows');
const COMPARE = `<section class="sec go-alt" id="compare" aria-labelledby="compare-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="compare-t">${esc(S.compare.heading)}</h2></div>
 <div class="go-board reveal" role="table" aria-labelledby="compare-t">
  <div class="go-bd-r" role="row"><h3 class="go-bd-h l" role="columnheader">${esc(S.compare.left_label)}</h3><h3 class="go-bd-h r" role="columnheader">${esc(S.compare.right_label)}</h3></div>
  ${S.compare.rows.map(([l, r]) => `<div class="go-bd-r" role="row"><div class="go-bd-c l" role="cell"><span class="go-bd-i" aria-hidden="true">${X_ICON}</span><p>${esc(l)}</p></div><div class="go-bd-c r" role="cell"><span class="go-bd-i" aria-hidden="true">${I('check')}</span><p>${esc(r)}</p></div></div>`).join('\n  ')}
 </div>
</div></section>`;
if (/Usual:|With us:|Alone or with a usual agency:/.test(COMPARE)) fail('compare: no label on each row, only the two column headings');

/* the number strip: the live numbers band, the same 4 numbers on every version */
const STATS_BAND = stats({ stats: S.stats });
for (const [v, l] of STATS) if (!STATS_BAND.includes(`<span class="pn-text">${esc(v)}</span>`) || !STATS_BAND.includes(`<dd>${esc(l)}</dd>`)) fail('the numbers band is missing ' + v + ' ' + l);

/* the founder: the approved photo (Suraj, 22 Nov 2026, 15:27: surajdonthi.com/people/suraj-approved.png, copied into src/assets; the page shows its 720 px copy)
   and the founder's name under it, shown like a client's name in the testimonials (Suraj, 15:47: "Suraj Donthi"; never empty, never a placeholder) */
if (!/^[a-z0-9-]+\.jpe?g$/.test(S.founder.photo || '')) fail('sections.founder.photo must be the photo file in src/assets');
if (typeof S.founder.name !== 'string' || !S.founder.name.trim() || /\[REPLACE/.test(S.founder.name)) fail('sections.founder.name must be the founder\'s name');
const FOUNDER = `<section class="sec go-dark" id="founder" aria-labelledby="founder-t"><div class="wrap go-founder">
 <figure class="go-pic reveal"><img src="${photoOf(S.founder.photo)}" alt="" width="720" height="1080" loading="lazy" decoding="async"><figcaption>${esc(S.founder.name)}</figcaption></figure>
 <div class="sec-h reveal"><h2 class="h2" id="founder-t">${esc(S.founder.heading)}</h2><p class="lede">${esc(S.founder.text)}</p></div>
</div></section>`;

/* testimonials: the live review section, with the two approved reviews (client-reviews-v1.md) in the live quote figure: Deep first, then Sachin.
   Each has the highlights of the same review on surajdonthi.com (Suraj, 22 Nov 2026, 16:01): b = amber bold, u = amber underline, in this order */
const TM = S.testimonials.items, TM_WANT = [['Deep Mehta', DEEP_T, true], ['Sachin Shet', SACHIN_T, true]];
const TM_MARKS = [
  { u: ['no idea what to try next'], b: ['made us systematic', '43% to 93%', 'enterprise deals'] },
  { u: ['I could not get it to move'], b: ['lack of clarity', 'no reliable partner', 'what to build first', 'Users came.'] },
];
if (!Array.isArray(TM) || TM.length !== 2) fail('sections.testimonials.items must hold the 2 reviews');
TM.forEach((r, i) => {
  const [who, text, photo] = TM_WANT[i];
  if (r.who !== who) fail('testimonial ' + (i + 1) + ' must be ' + who + ', not ' + r.who);
  if (plain(r.paras.join(' ')) !== text) fail('the testimonial of ' + who + ' is not word for word');
  if (!!r.photo !== photo || (!photo && !r.initials)) fail('the testimonial of ' + who + ' needs ' + (photo ? 'the photo' : 'initials'));
});
/* the section is named "Testimonials" (Suraj), with its own id */
useText({ ...TX, review: { ...TX.review, id: 'testimonials', hid: 'tm-t', eyebrow: esc(S.testimonials.eyebrow) } });
const FIGS = TM.map((r, i) => {
  const k = 'go-testimonial-' + i;
  REVIEWS[k] = { who: esc(r.who), role: esc(r.role), paras: r.paras.map(rich), ...(r.photo ? { photo: photoOf(r.photo) } : { ini: esc(r.initials) }) };
  const sec = review({ review: k }); delete REVIEWS[k];
  const m = sec.match(/<figure class="quote reveal">[\s\S]*?<\/figure>/g); if (!m || m.length !== 1) fail('testimonials: expected one quote figure');
  return { sec, fig: m[0] };
});
useText(TX);
const TESTIMONIALS = must(FIGS[0].sec, FIGS[0].fig, '<div class="go-revs">\n ' + FIGS[0].fig + '\n ' + FIGS[1].fig + '\n </div>');
/* only the approved highlights: no amber band (mark), and in each review exactly its bold and underlined words */
if (TESTIMONIALS.includes('<mark')) fail('the testimonials must have no amber highlight');
FIGS.forEach(({ fig }, i) => {
  const got = (tag) => JSON.stringify([...fig.matchAll(new RegExp(`<${tag} class="rich-${tag}">(.*?)</${tag}>`, 'g'))].map((m) => m[1]));
  for (const tag of ['b', 'u']) if (got(tag) !== JSON.stringify(TM_MARKS[i][tag].map(esc))) fail('the ' + (tag === 'b' ? 'bold' : 'underlined') + ' words of ' + TM[i].who + ' are not the approved ones: ' + got(tag));
});
if (/Reviews/.test(TESTIMONIALS) || !TESTIMONIALS.includes('id="testimonials"') || (TESTIMONIALS.match(/<img src="data:image\/jpeg/g) || []).length !== 2) fail('testimonials: the name, the id or the 2 photos');
for (const r of TM) for (const p of r.paras) if (!TESTIMONIALS.includes(`<p>${rich(p)}</p>`)) fail('testimonial paragraph missing: ' + p);

/* See our work: the apps that fit each version (the map in sections.work.apps), in Suraj's order (22 Nov 2026): Divine Blossoms, After Party,
   Concrete Gang, Tracto, Signal Clarity, then any other card, then AgShift, then Volunteer Yatra last (WORK_ORDER checks it).
   One row at every width (F-316), a carousel (CAROUSEL_JS): it moves one card every few seconds by itself, slowly, and after the last card it goes back to the first.
   It stops while the mouse is on it, while a finger touches it (and a few seconds after), while it has the focus, while a video plays in it, and off screen.
   With prefers-reduced-motion it never moves by itself. A swipe moves it on phones; a mouse drag or the arrow buttons (work.carousel) on computers.
   With no script it stays a row that scrolls sideways; the next card peeks.
   A row of 2 or more cards can scroll, so it takes the keyboard focus (arrow keys scroll it) and has the heading as its name.
   A card shows its app's still images ("images", the first is the main image), from assets/work, with its "kind" under its name;
   an app with no images shows an empty 16:9 slot. A card whose images are not all there stays hidden.
   A card video is a YouTube video, never a local file ("youtube_id", its 11-letter id; Suraj, 22 Nov 2026, 17:56: "it would be better to put the video on Youtube as unlisted and embed them here!").
   With an id, the main media is a 16:9 poster (the first image) with a play button; a tap puts the youtube-nocookie.com player in its place (YT_JS),
   and it plays at once, muted, looping and inline. Nothing loads from YouTube before the tap. While the id is empty, the card shows only its image.
   Divine Blossoms: its id stays empty until Ivy uploads Tess's blurred admin panel recording; its poster is the dashboard still, its label
   "CRM / e-commerce admin panel"; its 8 blurred stills stay in its viewer.
   A tap on a main image, or on the count on a poster, opens all the app's images in its viewer (GALLERIES, GALLERY_JS): the arrow buttons, a swipe or the arrow keys move; Esc or the X closes it.
   The images go in the page as data: URIs; the live build (scripts/release.mjs) moves them into cached files under /assets/, like the photos.
   GO_WORK_DIR=<folder> reads them from another folder (for a test build). */
const WORK_DIR = process.env.GO_WORK_DIR ? pathToFileURL(process.env.GO_WORK_DIR.replace(/[\\/]*$/, '/')) : new URL('../assets/work/', import.meta.url);
const VW = S.work.viewer || {};
for (const k of ['open', 'close', 'prev', 'next', 'play']) if (typeof VW[k] !== 'string' || !VW[k].trim()) fail('work.viewer.' + k + ' is empty');
const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* a PNG with its own size (from its IHDR), so the page keeps the image's place before it loads */
const pngOf = (f) => {
  const b = readFileSync(f);
  if (b.toString('latin1', 1, 4) !== 'PNG' || b.toString('latin1', 12, 16) !== 'IHDR') fail('work: ' + f.pathname + ' is not a PNG file');
  return { src: 'data:image/png;base64,' + b.toString('base64'), w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};
/* the YouTube player for a video id: no cookies until a visitor plays it (youtube-nocookie.com), muted (the recordings have no sound, and a muted
   video may start at once on every phone), looping (playlist = the same id), inline on iPhones, and no other channels' videos at the end */
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const ytSrc = (id) => 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id + '&playsinline=1&rel=0';
const MEDIA = {};
for (const a of S.work.apps) {
  for (const s of a.services) if (!SLUGS.includes(s)) fail('work: ' + a.name + ' names an unknown version: ' + s);
  if (a.kind != null && (typeof a.kind !== 'string' || !a.kind.trim())) fail('work: ' + a.name + ': its kind is empty');
  if (a.video != null) fail('work: ' + a.name + ': a card video is youtube_id, video_file (only while youtube_id is empty) or video_url (a video already on the app\'s own site)');
  if (a.youtube_id != null && (typeof a.youtube_id !== 'string' || (a.youtube_id !== '' && !YT_ID.test(a.youtube_id)))) fail('work: ' + a.name + ': youtube_id must be empty or the 11-letter YouTube video id, not ' + JSON.stringify(a.youtube_id));
  if ((a.youtube_id || a.video_file || a.video_url) && a.images == null) fail('work: ' + a.name + ': a video needs the images: the first one is its poster');
  if (a.video_file != null && (!/^[a-z0-9-]+\.mp4$/.test(a.video_file) || !existsSync(new URL(a.video_file, WORK_DIR)))) fail('work: ' + a.name + ': video_file must be an .mp4 in assets/work: ' + a.video_file);
  if (a.video_url != null && !/^https:\/\/[^\s"<>]+\.mp4$/.test(a.video_url)) fail('work: ' + a.name + ': video_url must be the https address of an .mp4');
  if (a.video_file && a.video_url) fail('work: ' + a.name + ': one video only');
  if (a.images == null) continue;
  if (!Array.isArray(a.images) || !a.images.length) fail('work: ' + a.name + ': its images list is empty');
  for (const m of a.images) if (!/^[a-z0-9-]+\.png$/.test(m.file || '') || typeof m.name !== 'string' || !m.name.trim()) fail('work: ' + a.name + ': each image needs a .png file name in assets/work and a name: ' + JSON.stringify(m));
  const miss = a.images.filter((m) => !existsSync(new URL(m.file, WORK_DIR)));
  if (miss.length) { console.warn('go.mjs: work: ' + a.name + ' stays hidden until all its images are in assets/work: ' + miss.map((m) => m.file).join(', ')); continue; }
  /* the video while the YouTube id is empty (item 21, 22 Nov 2026): the local recording in assets/work, as a data: URI (the live build moves it into /assets/) */
  const mp4 = a.youtube_id ? '' : a.video_file ? 'data:video/mp4;base64,' + readFileSync(new URL(a.video_file, WORK_DIR)).toString('base64') : a.video_url || '';
  if (a.youtube_id === '' && a.video_file) console.warn('go.mjs: work: ' + a.name + ' plays its local recording until its youtube_id is filled in');
  MEDIA[a.name] = { images: a.images.map((x) => ({ ...pngOf(new URL(x.file, WORK_DIR)), name: x.name })), yt: a.youtube_id || '', mp4 };
}
if (existsSync(WORK_DIR)) for (const f of readdirSync(WORK_DIR)) if (/\.(mp4|png)$/i.test(f) && !S.work.apps.some((a) => a.video_file === f || (a.images || []).some((m) => m.file === f))) console.warn('go.mjs: work: no card uses assets/work/' + f);
const shown = (a) => a.images == null || Object.hasOwn(MEDIA, a.name);
const viewerSays = (t, a) => {
  const s = t.replace(/\{name\}/g, () => a.name).replace(/\{count\}/g, () => String(MEDIA[a.name].images.length));
  if (/\{[^}]*\}/.test(s)) fail('work.viewer: unknown {word} in: ' + t); return s;
};
const PLAY_ICON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5v13L19 12z"/></svg>';
const workMedia = (a) => {
  const m = MEDIA[a.name];
  /* an app with no media yet: its name in the 16:9 slot, never a placeholder (Suraj, 22 Nov 2026: no "[REPLACE" on /build) */
  if (!m) return `<div class="go-media go-tile" aria-hidden="true"><span>${esc(a.name)}</span></div>`;
  const p = m.images[0], open = `data-gal-open="go-gal-${slugOf(a.name)}" aria-haspopup="dialog" aria-label="${attr(viewerSays(VW.open, a))}"`;
  const img = `<img src="${p.src}" width="${p.w}" height="${p.h}" alt="" loading="lazy" decoding="async">`;
  const count = m.images.length > 1 ? `<button class="go-shot-n" type="button" ${open}>${I('grid')}${m.images.length}</button>` : '';
  const title = attr(a.name + (a.kind ? ': ' + a.kind : ''));
  if (m.yt) return `<div class="go-media go-yt" data-yt="${attr(ytSrc(m.yt))}" data-yt-title="${title}"><button class="go-yt-play" type="button" aria-label="${attr(viewerSays(VW.play, a))}">${img}<span class="go-yt-btn" aria-hidden="true">${PLAY_ICON}</span></button>${count}</div>`;
  if (m.mp4) return `<div class="go-media go-yt" data-mp4="${attr(m.mp4)}" data-yt-title="${title}"><button class="go-yt-play" type="button" aria-label="${attr(viewerSays(VW.play, a))}">${img}<span class="go-yt-btn" aria-hidden="true">${PLAY_ICON}</span></button>${count}</div>`;
  return `<button class="go-media go-shot" type="button" ${open}>${img}${m.images.length > 1 ? `<span class="go-shot-n" aria-hidden="true">${I('grid')}${m.images.length}</span>` : ''}</button>`;
};
/* one viewer per app with images, only in the versions that show its card (PRUNE_JS takes it out of the others); its images load only when it opens */
/* a viewer only when a card can open it: more than one image, or one image with no video */
const hasGal = (a) => !!MEDIA[a.name] && (MEDIA[a.name].images.length > 1 || !(MEDIA[a.name].yt || MEDIA[a.name].mp4));
const GALLERIES = S.work.apps.filter(hasGal).map((a) => {
  const im = MEDIA[a.name].images, only = a.services.length < SLUGS.length ? ` data-if="${a.services.join(' ')}"` : '';
  return `<dialog class="go-gal" id="go-gal-${slugOf(a.name)}"${only} aria-label="${attr(a.name + (a.kind ? ': ' + a.kind : ''))}">
 <div class="go-gal-bar"><p class="go-gal-cap" aria-live="polite"><b data-gal-num>1 / ${im.length}</b><span data-gal-name>${esc(im[0].name)}</span></p><button class="go-gal-btn go-gal-prev" type="button" data-gal-prev aria-label="${attr(VW.prev)}" disabled>${I('arrow')}</button><button class="go-gal-btn" type="button" data-gal-next aria-label="${attr(VW.next)}">${I('arrow')}</button><button class="go-gal-btn" type="button" data-gal-close aria-label="${attr(VW.close)}" autofocus>${X_ICON}</button></div>
 <ul class="go-gal-track">${im.map((p) => `<li data-name="${attr(p.name)}"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${attr(a.name + ': ' + p.name)}" loading="lazy" decoding="async"></li>`).join('')}</ul>
</dialog>`;
}).join('\n');
const GALLERY_JS = String.raw`(function(d){if(!d.querySelector('dialog.go-gal'))return;var smooth=!matchMedia('(prefers-reduced-motion: reduce)').matches;
[].forEach.call(d.querySelectorAll('dialog.go-gal'),function(g){if(typeof g.showModal!=='function')return;
var t=g.querySelector('.go-gal-track'),s=t.children,n=s.length,num=g.querySelector('[data-gal-num]'),nm=g.querySelector('[data-gal-name]'),pv=g.querySelector('[data-gal-prev]'),nx=g.querySelector('[data-gal-next]'),at=0;
function show(i){var f=d.activeElement;at=i;num.textContent=(i+1)+' / '+n;nm.textContent=s[i].getAttribute('data-name');pv.disabled=i===0;nx.disabled=i===n-1;if(f===nx&&nx.disabled)pv.focus();else if(f===pv&&pv.disabled)nx.focus();}
function go(i,now){i=Math.max(0,Math.min(n-1,i));t.scrollTo({left:s[i].offsetLeft,behavior:now||!smooth?'auto':'smooth'});show(i);}
t.addEventListener('scroll',function(){var i=Math.round(t.scrollLeft/(t.clientWidth||1));if(i!==at&&i>=0&&i<n)show(i);},{passive:true});
pv.addEventListener('click',function(){go(at-1);});nx.addEventListener('click',function(){go(at+1);});
g.querySelector('[data-gal-close]').addEventListener('click',function(){g.close();});
g.addEventListener('click',function(e){if(e.target===g||e.target.parentNode===t)g.close();});
g.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(at+(e.key==='ArrowLeft'?-1:1));}});
[].forEach.call(d.querySelectorAll('[data-gal-open="'+g.id+'"]'),function(b){b.addEventListener('click',function(){g.showModal();go(0,true);});});
});})(document);`;
/* the YouTube posters (after PRUNE_JS, so only this version's cards): a tap on the poster puts the player in place of the poster and its count, and moves
   the focus to the player. The player address comes from go.mjs (ytSrc, checked there); it plays at once, as the tap was the visitor's own. */
/* a video with no YouTube id (data-mp4: the local recording, or the video on the app's own site): the same tap puts a muted, looping, inline video player in place of the poster */
const YT_JS = String.raw`(function(d){[].forEach.call(d.querySelectorAll('.go-yt[data-yt],.go-yt[data-mp4]'),function(m){var b=m.querySelector('.go-yt-play');if(!b)return;
b.addEventListener('click',function(){var f,v=m.getAttribute('data-mp4');if(v){f=d.createElement('video');f.src=v;f.muted=true;f.loop=true;f.autoplay=true;f.controls=true;f.setAttribute('playsinline','');f.setAttribute('aria-label',m.getAttribute('data-yt-title'));}
else{f=d.createElement('iframe');f.src=m.getAttribute('data-yt');f.title=m.getAttribute('data-yt-title');
f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');f.setAttribute('allowfullscreen','');f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');}
m.textContent='';m.appendChild(f);m.classList.add('go-yt-on');if(v&&f.play)f.play().catch(function(){});f.focus();});});})(document);`;
const HAS_YT = Object.values(MEDIA).some((m) => m.yt || m.mp4);
/* the card order: these first, in this order; then any other card; then these last, in this order */
const WORK_FIRST = ['Divine Blossoms', 'After Party', 'Concrete Gang', 'Tracto', 'Signal Clarity'], WORK_LAST = ['AgShift', 'Volunteer Yatra'];
{
  const names = S.work.apps.map((a) => a.name), mid = names.filter((n) => !WORK_FIRST.includes(n) && !WORK_LAST.includes(n));
  if (JSON.stringify(names) !== JSON.stringify([...WORK_FIRST, ...mid, ...WORK_LAST])) fail('work: the card order must be ' + [...WORK_FIRST, '(others)', ...WORK_LAST].join(', ') + ', not ' + names.join(', '));
}
const CAR = S.work.carousel || {};
for (const k of ['prev', 'next']) if (typeof CAR[k] !== 'string' || !CAR[k].trim()) fail('work.carousel.' + k + ' is empty');
/* the carousel (after PRUNE_JS and YT_JS's page parts, so only this version's row): one card on every 4.5 s, back to the first after the last;
   the arrows show only with a mouse (CSS) and once this script runs; a mouse drag moves the row and a drag is never a tap on a card */
const CAROUSEL_JS = String.raw`(function(d,W){var rm=W.matchMedia('(prefers-reduced-motion: reduce)').matches;
[].forEach.call(d.querySelectorAll('.go-work'),function(r){var c=r.children;if(c.length<2)return;
var nav=r.nextElementSibling&&r.nextElementSibling.classList.contains('go-work-nav')?r.nextElementSibling:null,hold=0,seen=true,down=false,moved=false,x0=0,s0=0,tt;
function w(){return c[1].getBoundingClientRect().left-c[0].getBoundingClientRect().left||r.clientWidth;}
function max(){return r.scrollWidth-r.clientWidth;}
function to(l){r.scrollTo({left:l,behavior:rm?'auto':'smooth'});}
function go(k){var m=max(),l=r.scrollLeft;if(k>0)to(l>=m-4?0:Math.min(m,l+w()));else to(l<=4?m:Math.max(0,l-w()));}
function on(b,e,f){b.addEventListener(e,f,{passive:true});}
if(nav){nav.hidden=false;nav.querySelector('[data-work-prev]').addEventListener('click',function(){go(-1);});nav.querySelector('[data-work-next]').addEventListener('click',function(){go(1);});}
[r,nav].forEach(function(b){if(!b)return;on(b,'mouseenter',function(){hold|=1;});on(b,'mouseleave',function(){hold&=~1;});});
on(r,'touchstart',function(){clearTimeout(tt);hold|=4;});
function up(){clearTimeout(tt);tt=setTimeout(function(){hold&=~4;},5000);}on(r,'touchend',up);on(r,'touchcancel',up);
r.addEventListener('focusin',function(){hold|=2;});r.addEventListener('focusout',function(e){if(!r.contains(e.relatedTarget))hold&=~2;});
if('IntersectionObserver' in W)new IntersectionObserver(function(e){seen=e[0].isIntersecting;}).observe(r);
r.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;x0=e.clientX;s0=r.scrollLeft;});
W.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-x0;if(!moved&&Math.abs(dx)>5){moved=true;r.classList.add('go-drag');}if(moved)r.scrollLeft=s0-dx;});
W.addEventListener('pointerup',function(){if(!down)return;down=false;if(!moved)return;var s=w(),l=r.scrollLeft;r.classList.remove('go-drag');r.scrollLeft=l;to(Math.min(max(),Math.round(l/s)*s));});
r.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
r.addEventListener('dragstart',function(e){e.preventDefault();});
if(!rm)setInterval(function(){if(!hold&&!down&&seen&&!d.hidden&&!r.querySelector('.go-yt-on'))go(1);},4500);
});})(document,window);`;
/* See our work: hidden on the page, its code kept (Daisy's brief, 22 Nov 2026, 22:3x) */
const SHOW_WORK = false;
const WORK = byVersion('work', (v, s) => {
  const apps = S.work.apps.filter((a) => a.services.includes(s) && shown(a)); if (!apps.length) fail('work: no app for the version ' + s);
  return `<section class="sec" id="work" aria-labelledby="work-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="work-t">${esc(S.work.heading)}</h2><p class="lede">${ph(v.stack_line)}</p></div>
 <ul class="go-work"${apps.length > 1 ? ' tabindex="0" aria-labelledby="work-t"' : ''}>${apps.map((a) => `<li class="reveal">${workMedia(a)}<h3 class="go-h3">${esc(a.name)}</h3>${a.kind ? `<p class="go-kind">${esc(a.kind)}</p>` : ''}</li>`).join('')}</ul>
 ${apps.length > 1 ? `<div class="go-work-nav" hidden><button class="go-work-btn go-work-prev" type="button" data-work-prev aria-label="${attr(CAR.prev)}">${I('arrow')}</button><button class="go-work-btn" type="button" data-work-next aria-label="${attr(CAR.next)}">${I('arrow')}</button></div>` : ''}
</div></section>`;
});
/* the guarantee line keeps its approved words (GUARD_T); its spans only set the sizes and the amber of the key words:
   one key phrase large, the rest smaller and lighter, full width (Suraj, 22 Nov 2026, 16:51) */
const SAY_G = /^(Either you love what we built) (or you get a )(full refund)(\.) (Pay only when you see it built)(\.)$/;
const sayOf = (re, t, f) => { const m = re.exec(t); if (!m) fail('the words "' + t + '" no longer fit their sizes: change ' + re + ' with them'); return f(m.slice(1).map(esc)); };
const GUARANTEE = `<section class="sec" id="guarantee" aria-labelledby="guarantee-t"><div class="wrap go-gcta"><div class="reveal"><h2 class="go-say" id="guarantee-t">${sayOf(SAY_G, S.guarantee.text, (m) => `<span class="go-k"><span class="go-shield" aria-hidden="true">${I('shield')}</span></span><span class="go-xl">${m[0]} ${m[1]}<span class="band">${m[2]}</span>${m[3]}</span> <span class="go-md"><span class="go-u">${m[4]}</span>${m[5]}</span>`)}</h2></div><div class="go-gbtn reveal"><a class="btn primary" href="#quote">${esc(CTA_BTN)} ${I("arrow")}</a>${CTA_NOTE}</div></div></section>`;

/* the live app library and case studies (only 01 and custom software have them, so 01, 11 and the general version), each with its /build heading
   (F-315, F-317): must() swaps the live h2, so the build stops if build.mjs changes it; nothing else changes. Then the live final call to action. */
const GO_H = { types: ['ty-t', 'See what we can build'], cases: ['cs-t', 'Impact'] };
const WITH_H = ['custom-software', 'default']; /* the app library and case studies come from the custom software page for every version */
const retitled = (key, fn) => (p) => {
  const h = fn(p).trim(), [id, text] = GO_H[key], tag = `<h2 class="h2" id="${id}">`;
  if (!p[key]) { if (h) fail(key + ': a section without its page data'); return ''; }
  if (!h.includes(tag)) fail(key + ': the live h2 (#' + id + ') is gone');
  return must(h, tag + p[key].h + '</h2>', tag + esc(text) + '</h2>');
};
const TYPES_OF = retitled('types', types), CASES_OF = retitled('cases', cases);
for (const s of WITH_H) for (const [key, f] of [['types', TYPES_OF], ['cases', CASES_OF]]) {
  const [id, text] = GO_H[key], h = f(P[KEY[s]]);
  if (h.split(`<h2 class="h2" id="${id}">${esc(text)}</h2>`).length !== 2) fail(key + ': the version ' + s + ' must have the one h2 "' + text + '"');
}
const TYPES = byVersion('types', (_, s) => hasShowcase(s) ? showcase(s, GO_H.types[1]) : TYPES_OF(P[KEY['custom-software']]).trim());
const CASES = byVersion('cases', () => CASES_OF(P[KEY['custom-software']]).trim());

/* the live questions of the version first, then the /build questions (sections.faq.add); an answer comes from faq.items, else from the version's own faq line */
for (const s of Object.keys(S.faq.add)) if (!SLUGS.includes(s)) fail('faq.add: unknown version ' + s);
const FAQ_Q_OLD = 'Is the quote really free?', FAQ_Q_NEW = 'Are the documents really free?';
const FAQ = byVersion('faq', (v, s) => {
  const p = P[KEY[s]], add = S.faq.add[s];
  if (!Array.isArray(add) || !add.length) fail('faq.add has no questions for ' + s);
  const extra = add.map((q) => S.faq.items.find(([iq]) => iq === q) || (v.faq && v.faq[0] === q ? v.faq : fail('faq.add: no answer for "' + q + '" (' + s + ')')));
  if (!p.faq.some(([q]) => q === FAQ_Q_OLD)) fail('faq: "' + FAQ_Q_OLD + '" is gone from the version ' + s + ' (/build renames it)');
  const pFaq = p.faq.map(([q, a]) => (q === FAQ_Q_OLD ? [FAQ_Q_NEW, a] : [q, a.replace('we quote yours for free, in 12 hours.', 'your project cost estimate is sent to you within 24 hours of the call.')]));
  const FAQ_KEEP = /session really free|What do I get from it|free working proof|How long does a full build|cost\?|Do I own|refund/;
  const all = [...pFaq, ...extra].filter(([q]) => FAQ_KEEP.test(q)), seen = new Set();
  if (all.length !== 7) fail('faq: ' + s + ' must show exactly 7 questions, has ' + all.length);
  for (const [q] of all) { if (seen.has(q)) fail('faq: "' + q + '" is in ' + s + ' twice'); seen.add(q); }
  let h = faq({ ...p, faq: all.map(([q, a]) => [q === 'What do I get from it?' ? 'What do I get from the session?' : q, a]) }).trim();
  h = mustRe(h, /<div class="sec-h reveal"><span class="eyebrow">[^<]*<\/span><h2 class="h2" id="faq-t">[\s\S]*?<\/h2>/,`<div class="sec-h reveal"><h2 class="h2" id="faq-t">${esc(S.faq.heading)}</h2>`);
  return h;
});
if (S.faq.heading !== 'FAQ') fail('sections.faq.heading is not "FAQ"');

/* the live footer, with the company line and the trade name line of /build above its last line */
const FOOT_LINE = S.footer.line1.split(' · ').map((part) => {
  if (part.startsWith(CF.contact.phone)) return TEL_A + ph(part.slice(CF.contact.phone.length));
  if (part === CF.contact.email) return MAIL_A;
  /* "Privacy" and "Terms" link to config.privacy_url and config.terms_url; "Privacy [REPLACE]" stays a placeholder until the link exists */
  const legal = part.match(/^(Privacy|Terms)( \[REPLACE\])?$/);
  if (legal) {
    const key = legal[1].toLowerCase() + '_url', url = CF[key];
    if (url) return `<a href="${attr(url)}">${legal[1]}</a>`;
    if (!legal[2]) fail('the footer says "' + legal[1] + '", but config.' + key + ' has no link');
    return `<span class="go-nw">${ph(part)}</span>`;
  }
  return ph(part);
}).join(' <span class="sep">·</span> ');
/* the live footer's last line (copyright, extra links, draft note) is replaced by one line: the copyright, then the company line (Suraj, 23 Nov 2026) */
const FOOT_RAW = footer('build').replace(/<nav aria-label="[^"]*">[\s\S]*?<\/nav>/, ''), FOOT_C = (FOOT_RAW.match(/<p class="fine">(© [^<·]*?)(?: · |<\/p>)/) || [])[1];
if (!FOOT_C) fail('the footer has no "© ..." line');
const FOOTER = mustRe(FOOT_RAW, /<p class="fine">[^]*?<\/p>(?:\s*<p class="fine">[^]*?<\/p>)*/, `<p class="go-ln">${FOOT_C} <span class="sep">·</span> ${FOOT_LINE}</p>`);
/* the form drawer on phones (under 768 px; Suraj, 22 Nov 2026, 13:45), a copy of the bottom sheet of surajdonthi.com (BookingWidget.astro) with its grip, close button and keys.
   Closed, it is a card fixed at the bottom of the screen: Deepak's orb on the left, at the size of the desktop orb (104 px), so it has the same soft glow (Suraj, 22 Nov 2026, 15:18 and 15:19),
   and the form's title beside it. A pull up or a tap opens the whole form.
   DRAWER_JS moves the one form (#quote-form) into it on phones and back into the hero on wider screens, so the form, Deepak and his call stay one. */
const DRAWER = `<div class="go-dr" data-go-dr>
 <div class="go-dr-scrim" data-dr-close></div>
 <div class="go-dr-sheet" data-dr-sheet tabindex="-1" aria-labelledby="qf-t">
  <div class="go-dr-bar"><button class="go-dr-grip" type="button" data-dr-grip aria-haspopup="dialog" aria-label="${attr(QF.open)}"><span></span></button><button class="go-dr-x" type="button" data-dr-close aria-label="${attr(QF.close)}">${X_ICON}</button></div>
  <div class="go-dr-body" data-dr-body></div>
 </div>
</div>`;

/* the page order of Suraj's 22-section list (F-319) */
const MAIN = [HERO, marquee(), WORRIES, FIT, BA, HOW, KEEP, COMPARE, STATS_BAND, FOUNDER, TESTIMONIALS, SHOW_WORK ? WORK : '', TYPES, CASES, GUARANTEE, COMPLIANCE, FAQ].filter(Boolean).join('\n');
const left = (MAIN + FOOTER).match(/\{[a-z_ ]+\}/gi); if (left) fail('words not filled in: ' + left.join(', '));
for (const t of ['Results vary by project', 'How booking works', 'Real products', 'id="impact"']) if ((HEADER + MAIN + FOOTER).includes(t)) fail('"' + t + '" must not be on the page');
/* no "Try it" (F-314) and the call section once; the app library and case studies only with their /build headings */
const MARKUP = HEADER + MAIN + FOOTER + DRAWER;
if (/id="try"|data-try|data-device|data-demo/.test(MARKUP)) fail('"Try it" is still on the page');
if (MARKUP.includes('id="call"')) fail('the call section must not be on the page');
/* no placeholder and no empty field anywhere (Suraj, 22 Nov 2026), and never the word "certified" (F-370) */
if (/\[REPLACE|class="go-ph"/.test(MARKUP)) fail('a [REPLACE] placeholder is on the page');
if (/certified/i.test(MARKUP)) fail('the word "certified" must not be on /build');
/* an element the scripts fill (it has a data- attribute or a role, such as a live region) may start empty */
{ const e = MARKUP.match(/.{0,120}<(h[1-6]|p|li|figcaption|dd)\b(?![^>]*\s(?:data-|role=))[^>]*>\s*<\/\1>/); if (e) fail('an empty field is on the page: ' + e[0]); }
if (MARKUP.includes('Zero risk')) fail('the old guarantee line "Zero risk: …" is still on the page');
for (const t of ['id="ty-t">Our ', 'id="cs-t">Case studies']) if (MARKUP.includes(t)) fail('a live heading is still on the page: ' + t);
for (const [key, [id, text]] of Object.entries(GO_H)) if (!MARKUP.includes(`<h2 class="h2" id="${id}">${esc(text)}</h2>`)) fail(key + ': no h2 "' + text + '"');
/* each version hides the text of the others; with no data-svc (no script) the general version shows */
const COND = SLUGS.map((s) => `html[data-svc="${s}"] [data-if]:not([data-if~="${s}"])`).join(',') + ',html:not([data-svc]) [data-if]:not([data-if~="default"]){display:none!important}';

/* runs before the site's script: removes the other versions, so each id and each live part is in the page once */
const PRUNE_JS = "(function(d){var s=d.documentElement.getAttribute('data-svc')||'default';[].forEach.call(d.querySelectorAll('[data-if]'),function(n){if((' '+n.getAttribute('data-if')+' ').indexOf(' '+s+' ')<0&&n.parentNode)n.parentNode.removeChild(n)})})(document);";
/* the site's page settings with the live voice agent; the service Deepak talks about is the version's own */
const SVC_OF = Object.fromEntries(SLUGS.map((s) => [s, P[KEY[s]].service]));
const LABS_JS = 'window.LABS=' + json(labsCfg('')) + ';(function(m,s){window.LABS.service=m[s]||m["default"]})(' + json(SVC_OF) + ",document.documentElement.getAttribute('data-svc')||'default');";
/* the form drawer on phones. It runs after PRUNE_JS (one form is left) and before the site's script, so the site's script finds the form where it shows.
   Copied from BookingWidget.astro: the scroll lock, the focus on open and back on close, Escape and the Tab loop, the keyboard offset (--kb),
   a field scrolled into view, and the grip drag (up 30 px opens, down 90 px closes). Closed, a pull up or a tap on the title opens it.
   When a voice call starts, the drawer opens, so the visitor sees Deepak's words and the form. If this script stops, the form stays in the hero. */
const DRAWER_JS = String.raw`(function(d,W){var root=d.documentElement;try{
var dr=d.querySelector('[data-go-dr]'),form=d.getElementById('quote-form');if(!dr||!form||!W.matchMedia){root.classList.remove('go-dj');return}
var sheet=dr.querySelector('[data-dr-sheet]'),body=dr.querySelector('[data-dr-body]'),grip=dr.querySelector('[data-dr-grip]');
var home=form.parentNode,next=form.nextSibling,mq=W.matchMedia('(max-width:767px)'),RM=W.matchMedia('(prefers-reduced-motion:reduce)');
var on=false,open=false,opener=null,skipT=0,drag=null,CALL=/^(connecting|speaking|listening)$/;
function rest(v){[].forEach.call(form.children,function(c){if(c.matches('.card-h,.va'))return;if(v)c.setAttribute('inert','');else c.removeAttribute('inert')})}
function peek(){if(!on||open)return;body.scrollTop=0;
 var s=sheet.getBoundingClientRect().top,h=form.querySelector('.card-h'),o=form.querySelector('.orb');
 var p=Math.ceil(Math.max(h?h.getBoundingClientRect().bottom:0,o?o.getBoundingClientRect().bottom:0)-s+14+(parseFloat(getComputedStyle(sheet).paddingBottom)||0));
 if(p>40){sheet.style.setProperty('--go-peek',p+'px');root.style.setProperty('--go-dr-h',p+'px')}}
function place(){var m=mq.matches;if(m===on)return;
 if(m){on=true;body.appendChild(form);dr.classList.add('on');rest(true);peek()}
 else{shut(true);on=false;home.insertBefore(form,next&&next.parentNode===home?next:null);dr.classList.remove('on');rest(false);root.style.removeProperty('--go-dr-h')}}
function show(){if(!on)return false;if(open)return true;
 open=true;opener=d.activeElement;rest(false);dr.classList.add('open');
 sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');grip.setAttribute('tabindex','-1');grip.setAttribute('aria-hidden','true');
 root.style.overflow='hidden';kb();requestAnimationFrame(function(){sheet.focus({preventScroll:true})});return true}
function shut(quiet){if(!open)return;open=false;dr.classList.remove('open');
 sheet.removeAttribute('role');sheet.removeAttribute('aria-modal');grip.removeAttribute('tabindex');grip.removeAttribute('aria-hidden');
 root.style.overflow='';dr.style.removeProperty('--kb');body.scrollTop=0;rest(true);
 var o=opener;opener=null;if(quiet)return;
 if(o&&o!==d.body&&o.focus&&d.contains(o)&&!o.closest('[inert]')&&o.getClientRects().length)o.focus({preventScroll:true});else grip.focus({preventScroll:true})}
d.addEventListener('keydown',function(e){if(!open)return;
 if(e.key==='Escape'){e.preventDefault();shut();return}
 if(e.key!=='Tab')return;
 var it=[].filter.call(sheet.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])'),function(el){return el.getAttribute('tabindex')!=='-1'&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[inert]')});
 if(!it.length)return;var a=d.activeElement,f=it[0],l=it[it.length-1];
 if(e.shiftKey&&(a===f||a===sheet)){e.preventDefault();l.focus()}else if(!e.shiftKey&&a===l){e.preventDefault();f.focus()}});
var vv=W.visualViewport;
function kb(){if(!vv||!open)return;dr.style.setProperty('--kb',Math.max(0,Math.round(W.innerHeight-vv.height-vv.offsetTop))+'px')}
if(vv){vv.addEventListener('resize',kb);vv.addEventListener('scroll',kb)}
dr.addEventListener('focusin',function(e){var t=e.target;if(open&&/^(INPUT|TEXTAREA)$/.test(t.tagName))setTimeout(function(){if(open)t.scrollIntoView({block:'center',behavior:RM.matches?'auto':'smooth'})},300)});
sheet.addEventListener('pointerdown',function(e){if(!on||drag||(e.pointerType==='mouse'&&e.button!==0))return;
 var t=e.target;if(t.closest('.orb,.go-dr-x')||(open&&!t.closest('.go-dr-bar')))return;
 drag={y:e.clientY,id:e.pointerId,dy:0,moved:false}});
sheet.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;
 var dy=e.clientY-drag.y;drag.dy=dy;
 if(!drag.moved){if(Math.abs(dy)<6)return;drag.moved=true;dr.setAttribute('data-dragging','');try{sheet.setPointerCapture(e.pointerId)}catch(x){}}
 if(open)sheet.style.transform=dy>0?'translateY('+Math.round(dy)+'px)':'';else sheet.style.maxHeight=dy<0?'calc(var(--go-peek) + '+Math.round(-dy)+'px)':''});
function end(e){if(!drag||e.pointerId!==drag.id)return;var g=drag;drag=null;if(!g.moved)return;
 try{sheet.releasePointerCapture(e.pointerId)}catch(x){}
 skipT=Date.now()+400;dr.removeAttribute('data-dragging');sheet.style.transform='';sheet.style.maxHeight='';
 if(open){if(g.dy>90)shut()}else if(g.dy< -30)show()}
sheet.addEventListener('pointerup',end);sheet.addEventListener('pointercancel',end);
grip.addEventListener('click',function(){if(Date.now()>skipT)show()});
sheet.addEventListener('click',function(e){if(!on||open||Date.now()<skipT)return;var t=e.target;if(!t.closest('.orb,.go-dr-grip')&&t.closest('.card-h'))show()});
dr.addEventListener('click',function(e){if(e.target.closest('[data-dr-close]'))shut()});
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#quote-form"]');if(a&&show())e.preventDefault()});
var va=form.querySelector('[data-va]'),was='';
if(va&&W.MutationObserver)new MutationObserver(function(){var s=va.getAttribute('data-state')||'';if(on&&!open&&CALL.test(s)&&!CALL.test(was))show();was=s}).observe(va,{attributes:true,attributeFilter:['data-state']});
var rz=0;W.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){place();peek()},150)},{passive:true});
if(mq.addEventListener)mq.addEventListener('change',place);else if(mq.addListener)mq.addListener(place);
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(peek);W.addEventListener('load',peek);
place();W.GO_DR={open:show,on:function(){return on}};
}catch(x){root.classList.remove('go-dj');if(W.console)console.warn('Form drawer:',x)}})(document,window);`;

const GO_CSS = String.raw`.go{--go-green:#3FCF6E;--dark:#050506;--go-red:#F85149;--go-red-line:rgba(248,81,73,.15);--go-red-gut:rgba(248,81,73,.3)}
/* the testimonials: the bold and underlined words of surajdonthi.com (.rich-b in TestimonialCard.astro, .rich-u in base.css), in the Labs amber (--accent), not the personal site's blue (Suraj, 22 Nov 2026, 16:17 and 16:20).
   While the words are said, an underline waits for its last word */
.go #testimonials .quote blockquote b.rich-b{color:var(--accent);font-weight:600}
.go #testimonials .quote blockquote u.rich-u{text-decoration:underline;text-decoration-color:var(--accent);text-decoration-thickness:2px;text-underline-offset:.16em}
.js .go #testimonials .quote:not(.done) u.rich-u:has(.w:not(.on)){text-decoration-color:transparent}
.go-ph{display:inline-block;padding:1px 8px;border:1px dashed var(--ink-2);background:var(--field);font:500 .8em/1.6 var(--font-m);letter-spacing:.02em;color:var(--ink)}
.go-media{display:grid;place-content:center;justify-items:center;gap:12px;padding:24px;background:var(--panel);border:1px solid var(--line);text-align:center}
.go-media{aspect-ratio:16/9}
.go-media .i{font-size:40px;color:var(--ink-2)}
.go-media figcaption{font:500 11px/1.5 var(--font-m);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);max-width:34ch}
/* one type scale for every /build part (item 17): the site's .h2 for headings, then --go-t1 (big rows), --go-t2 (body), --go-t3 (small) and --go-tl (labels) */
.go{--page-max:1200px;--go-t1:clamp(16px,1.4vw,20px);--go-t2:16px;--go-t3:14px;--go-tl:500 11px/1.4 var(--font-m)}
.go-h3{font:600 var(--go-t2)/1.4 var(--font-s);color:var(--ink);margin-bottom:12px}
.go-lab{font:var(--go-tl);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.go-list{border-top:1px solid var(--line)}
.go-list li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:14px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line);font-size:var(--go-t2);line-height:1.55;color:var(--ink-2)}
.go-ok,.go-no{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--go);color:var(--go)}
.go-no{border-color:var(--go-red);color:var(--go-red)}
.go-ok .i,.go-no .i{font-size:15px;stroke-width:3}
/* big rows, like the problem mirror: a 44 px gutter with the mark, then the words (What you keep: an accent "+"; This is for you: an accent tick) */
.go-rows{display:grid;gap:2px}
.go-rows li{display:grid;grid-template-columns:44px minmax(0,1fr);background:var(--field)}
.go-rows li>span:last-child{padding:clamp(9px,1vw,13px) clamp(14px,1.5vw,20px);font:600 var(--go-t1)/1.35 var(--font-s);color:var(--ink)}
.go-gut{display:grid;justify-items:center;align-content:start;padding-top:clamp(9px,1vw,13px);background:rgba(255,189,89,.12);color:var(--accent);font:600 clamp(18px,1.6vw,22px)/1.1 var(--font-m)}
.go-gut .i{font-size:clamp(16px,1.4vw,20px);stroke-width:3;margin-top:.15em}
/* the green marks (Suraj, 22 Nov 2026, 19:02): the "+" of What you keep and the tick of This is for you, in one shared green (--go-green) on a dark green cell */
.go-keep .go-gut{background:color-mix(in srgb,var(--go-green) 16%,var(--accent-ink));color:var(--go-green)}
/* the last row (Rs. 50,000): the site's card box, as the hero form (.card), the After cards (.go-ba .after) and the scoreboard (.go-board): the panel background,
   the heavy ink border, the amber offset shadow, square corners, 11 px free on the right for the shadow; larger bold text, the same green "+"
   (Suraj, 22 Nov 2026, about 20:20: "the border in our style, I mean the app style"; no green border) */
.go-keep .go-top{background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset);margin-right:11px}
.go-rows.go-keep li>span:last-child{font-size:clamp(15px,1.4vw,18px);font-weight:400;color:var(--muted,#c9c3b8)}
.go-rows.go-keep li>span:last-child b{font-weight:700;color:var(--ink)}
.go-rows.go-keep .go-top>span:last-child{font-size:clamp(17px,1.6vw,22px)}
.go-keep .go-tick{box-sizing:border-box;width:clamp(30px,2.8vw,40px);height:clamp(30px,2.8vw,40px);padding:22%;border-radius:50%;background:var(--go-green);color:var(--accent-ink);margin-top:0}
.go-keep-lead{max-width:none;color:var(--ink)}
.go .offer dd.go-off+dd.go-off{font-size:clamp(26px,2.9vw,36px)}
.go .offer dd.go-off .go-poc-s{font-size:.75em;color:var(--ink-2);font-weight:400}
.go .offer{grid-template-columns:1fr}.go .offer dd.go-off{white-space:normal;line-height:1.15}.go .offer dd.go-off .go-keep-s{margin:0}
.go-keep-cta,.go-cta,.go-gbtn{display:flex;flex-direction:column;align-items:flex-end;text-align:right;margin:clamp(24px,3vw,40px) 0 0}
.go-cta{margin-top:0}
.go .fnote.go-consent{display:block}
.go-gcta{display:flex;align-items:center;justify-content:space-between;gap:clamp(20px,3vw,40px)}
.go-gcta .go-gbtn{flex:none}
@media(max-width:720px){.go-gcta{flex-direction:column;align-items:stretch}.go-gcta .go-gbtn{align-self:flex-end}}

/* Who it is for (option 1): one big column, "for you" in amber, a big green tick (--go-green on a dark green cell) on each line,
   the chips in two columns under it, "Not for you if:" small below a dashed line, with a red X in a red frame */
.go-for-h{font:600 clamp(28px,3vw,44px)/1.05 var(--font-d);letter-spacing:-.03em;color:var(--ink);margin-bottom:16px}
.go-for-h span{color:var(--accent)}
.go-for li{display:flex;gap:16px;align-items:flex-start;padding:clamp(10px,1.1vw,14px) 0;border-top:1px solid var(--line);font:500 clamp(17px,1.5vw,22px)/1.3 var(--font-d);letter-spacing:-.01em;color:var(--ink)}
.go-for li:last-child{border-bottom:1px solid var(--line)}
.go-for-i{flex:none;display:grid;place-items:center;width:32px;height:32px;margin-top:0;background:color-mix(in srgb,var(--go-green) 16%,var(--accent-ink));color:var(--go-green)}
.go-for-i .i{font-size:18px;stroke-width:3}
.go-groups{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(16px,2vw,24px);margin-top:clamp(18px,2vw,28px)}
@media (min-width:760px){.go-groups{grid-template-columns:repeat(2,minmax(0,1fr))}}
.go-groups .go-lab{color:var(--accent)}
.go-chips{display:flex;flex-wrap:wrap;gap:10px}
.go-chips li{padding:8px 14px;border:1px solid var(--line);background:var(--field);font:500 var(--go-t3)/1.3 var(--font-s);color:var(--ink)}
.go-not{margin-top:clamp(20px,2.4vw,32px);padding-top:16px;border-top:1px dashed var(--line);max-width:720px}
.go-not-h{font:500 13px/1.4 var(--font-m);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.go-not li{display:flex;align-items:center;gap:12px;padding:6px 0;font-size:15px;line-height:1.45;color:var(--muted)}
.go-not-i{flex:none;display:grid;place-items:center;width:20px;height:20px;border:1px solid var(--go-red);color:var(--go-red)}
.go-not-i .i{font-size:12px;stroke-width:3}
/* Before and after (option 2): in each row the Before card, a big amber arrow, then the After card with the heavy frame and the amber shadow; on phones the arrow points down */
.go-ba-h{margin-top:10px;max-width:none}
.go-ba{display:grid;gap:clamp(14px,1.6vw,22px)}
.go-ba li{display:grid;grid-template-columns:minmax(0,1fr);align-items:stretch}
@media (min-width:760px){.go-ba li{grid-template-columns:minmax(0,1fr) clamp(56px,7vw,96px) minmax(0,1.2fr)}}
.go-ba li>div{display:grid;gap:10px;align-content:start;padding:clamp(14px,1.6vw,22px)}
.go-ba .before{background:var(--bg);border:1px solid var(--line)}
.go-ba .after{background:var(--bg);border:var(--heavy);box-shadow:var(--heavy-offset);margin-right:11px}
.go-ba-ar{display:grid;place-items:center;padding:8px 0;color:var(--accent)}
.go-ba-ar .i{font-size:clamp(28px,2.6vw,40px);stroke-width:2.4;transform:rotate(90deg)}
@media (min-width:760px){.go-ba-ar{padding:0}.go-ba-ar .i{transform:none}}
.go-ba .lab{font:var(--go-tl);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.go-ba .before .lab{color:var(--go-red)}
.go-ba .after .lab{color:var(--go)}
.go-ba p{font:400 var(--go-t1)/1.6 var(--font-s);color:var(--ink-2)}
.go-ba .after p{font-weight:600;color:var(--ink)}
/* the highlight block in Before and after: inline, so it wraps with the line; the padding and the line height keep every letter inside it, also the letters below the line (g, p, y) */
.go-ba .band{display:inline;margin:0;padding:.1em .14em .16em;line-height:inherit;background-size:100% 100%}
/* compliance: short and visual, the page's shield and its words */
.go-cp{display:grid;gap:24px;align-items:center}
@media (min-width:900px){.go-cp{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:clamp(40px,5vw,72px)}}
.go-cp-h{margin-top:12px;font:600 var(--go-t1)/1.35 var(--font-d);color:var(--ink);text-wrap:balance}
.go-cp-b{display:grid;gap:2px}
.go-cp-b li{display:flex;align-items:center;gap:16px;padding:10px 14px;background:var(--field);font:600 var(--go-t1)/1.2 var(--font-s);color:var(--ink)}
/* a work card with no media yet: its name in the slot */
.go-tile{background:var(--panel)}
.go-tile span{font:600 var(--go-t1)/1.2 var(--font-d);color:var(--ink-2)}
/* Alone vs with us (option 2): the scoreboard. Each row holds its two cells, so the rows stay in line; the heavy frame and the amber shadow */
.go-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:var(--heavy);box-shadow:var(--heavy-offset);margin-right:11px}
.go-bd-r{display:contents}
.go-bd-h{padding:clamp(10px,1.2vw,16px) clamp(14px,1.8vw,24px);font:600 var(--go-t1)/1.2 var(--font-d);letter-spacing:-.01em}
.go-bd-h.l{background:var(--go-red-gut);color:var(--go-red)}
.go-bd-h.r{background:var(--accent);color:var(--accent-ink)}
.go-bd-c{display:flex;gap:clamp(10px,1.4vw,16px);align-items:flex-start;padding:clamp(10px,1.2vw,16px) clamp(14px,1.8vw,24px);border-top:1px solid var(--line)}
.go-bd-c.l{background:var(--go-red-line)}
.go-bd-c.r{border-left:2px solid var(--ink);background:linear-gradient(90deg,rgba(255,189,89,.14),rgba(255,189,89,.04))}
.go-bd-h.r{border-left:2px solid var(--ink)}
.go-bd-i{flex:none;display:grid;place-items:center;width:28px;height:28px}
.go-bd-i .i{font-size:16px;stroke-width:3}
.go-bd-c.l .go-bd-i{border:2px solid var(--go-red);color:var(--go-red)}
.go-bd-c.r .go-bd-i{background:var(--accent);color:var(--accent-ink)}
.go-bd-c p{font-size:var(--go-t2);line-height:1.5;color:var(--ink-2)}
.go-bd-c.r p{font-weight:600;color:var(--ink)}
@media (max-width:599px){.go-bd-c{flex-direction:column}}
.go-pic{width:100%;max-width:260px}
/* the photo keeps the old placeholder's 4:5 frame, so nothing else moves; the frame keeps the top of the photo (the head) and cuts the lower shirt */
.go-pic img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 0;background:var(--panel);border:1px solid var(--line)}
.go-pic figcaption{margin-top:12px;font:600 16px/1.4 var(--font-s);color:var(--ink)}
.go-founder{display:grid;grid-template-columns:minmax(0,1fr);gap:40px;align-items:center}
@media (min-width:900px){.go-founder{grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:clamp(36px,4vw,64px)}}
.go-founder .sec-h,.go-dark .sec-h{margin-bottom:0}
.go-note{margin-top:16px;font-size:13.5px;color:var(--muted)}
/* the guarantee line (Suraj, 22 Nov 2026, 16:51): full width, one key phrase large and the rest smaller and lighter,
   the key words in the Labs amber: a highlight block (.band) or an amber underline (.go-u) */
.go-say{display:grid;gap:clamp(8px,1vw,14px);font:400 16px/1.4 var(--font-s);color:var(--ink)}
.go-say>span{display:block;text-wrap:balance}
.go-say>.go-k{display:flex;align-items:center;gap:14px;margin-bottom:clamp(4px,.8vw,10px);font:500 13px/1.4 var(--font-m);letter-spacing:.22em;text-transform:uppercase;color:var(--go)}
.go-say>.go-k::after{content:"";flex:1;height:1px;margin-left:10px;background:var(--line)}
.go-shield{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--go);color:var(--go)}
.go-shield .i{font-size:22px}
.go-xl{font:600 clamp(26px,3vw,44px)/1.08 var(--font-d);letter-spacing:-.03em;color:var(--ink)}
.go-md{font:400 clamp(17px,1.6vw,24px)/1.35 var(--font-s);color:var(--ink-2)}
.go-u{color:var(--ink);font-weight:500;text-decoration:underline;text-decoration-color:var(--accent);text-decoration-thickness:3px;text-underline-offset:.24em;text-decoration-skip-ink:none}
.go-slots{margin-top:4px;font:500 12px/1.5 var(--font-m);letter-spacing:.12em;text-transform:uppercase;color:var(--ink)}
.go-alt{background:var(--panel)}
.go-dark{background:var(--dark)}
.go-ln a{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
.go-ln{line-height:1.8}
.go-ln .sep{margin:0 .3em;color:var(--muted)}
.go-nw,.go-ln a[href^="tel:"],.go-ln a[href^="mailto:"]{white-space:nowrap}
.go .strip{position:sticky;top:0;z-index:60}
.go .top{top:36px}
html{scroll-padding-top:calc(var(--hh) + 56px)}
@media (min-width:1000px){.go .gamble .sec-h{top:calc(var(--hh) + 76px)}}
/* the problem mirror: each problem a red line, like a deleted line in a diff (GitHub's dark diff red); no strike, no quote marks, no amber line */
.go #worries .worries{display:grid;gap:2px;border-top:0}
.go #worries .wr{grid-template-columns:44px minmax(0,1fr);gap:0;align-items:stretch;padding:0;border-bottom:0;background:var(--go-red-line)}
.go #worries .wr::after{content:none}
.go-del{display:block;padding-top:clamp(9px,1vw,13px);text-align:center;background:var(--go-red-gut);color:var(--go-red);font:500 var(--go-t1)/1.35 var(--font-m)}
.go #worries .wr q{padding:clamp(9px,1vw,13px) clamp(14px,1.5vw,20px);font-size:var(--go-t1);color:var(--go-red);text-decoration:none}
.go #worries .wr q::before,.go #worries .wr q::after{content:none}
.go-dr{display:none}
@media (max-width:767px){
 .go .top nav{display:none}
 .go-dj body.go .hero .card{display:none}
 body.go{padding-bottom:var(--go-dr-h,0px)}
 .go-dr.on{display:block}
 .go-dr-scrim{position:fixed;inset:0;z-index:99;background:rgb(0 0 0/.78);opacity:0;visibility:hidden;transition:opacity var(--t2) var(--ez),visibility 0s linear var(--t2)}
 .go-dr.open .go-dr-scrim{opacity:1;visibility:visible;transition:opacity var(--t2) var(--ez),visibility 0s}
 .go-dr-sheet{position:fixed;left:0;right:0;bottom:var(--kb,0px);z-index:100;display:flex;flex-direction:column;max-height:var(--go-peek,108px);background:var(--panel);border-top:var(--heavy);padding-bottom:env(safe-area-inset-bottom,0px);overflow:hidden;outline:0;touch-action:none;transition:max-height var(--t2) var(--ez),transform var(--t2) var(--ez)}
 .go-dr.open .go-dr-sheet{max-height:min(50vh,calc(100vh - var(--kb,0px) - 24px));max-height:min(50svh,calc(100svh - var(--kb,0px) - 24px));touch-action:auto}
 .go-dr[data-dragging] .go-dr-sheet{transition:none}
 .go-dr-bar{position:relative;flex:none;height:24px;touch-action:none;transition:height var(--t2) var(--ez)}
 .go-dr.open .go-dr-bar{height:44px}
 .go-dr-grip{display:grid;place-items:center;width:100%;height:100%;cursor:grab}
 .go-dr-grip span{width:40px;height:4px;background:var(--muted)}
 .go-dr-x{position:absolute;top:0;right:8px;display:none;place-items:center;width:44px;height:44px;color:var(--ink-2)}
 .go-dr-x:hover,.go-dr-x:focus-visible{color:var(--ink);background:var(--field-hi)}
 .go-dr-x .i{font-size:20px}
 .go-dr.open .go-dr-x{display:grid}
 .go-dr-body{flex:1 1 auto;min-height:0;overscroll-behavior:contain}
 .go-dr.open .go-dr-body{overflow-y:auto}
 .go-dr .card{max-width:none;margin:0;padding:4px 20px 24px;border:0;box-shadow:none}
 .go-dr .card-h{flex-direction:column;align-items:flex-start;justify-content:center;gap:6px;min-height:104px;padding-left:120px}
 .go-dr .va{position:static;display:block}
 .go-dr .orb{position:absolute;top:4px;left:20px;width:104px;height:104px}
 .go-dr:not(.open) .card-h{cursor:pointer}
}
@media (prefers-reduced-motion:reduce){.go-dr-sheet,.go-dr-scrim,.go-dr-bar{transition:none}}
.go #how .st h3{font:400 16px/1.55 var(--font-s);color:var(--ink-2)}
.go #how .st h3 .go-hk{font-weight:700;color:var(--accent)}
.go .go-terms{margin-top:18px;font-size:10px;line-height:1.5;color:var(--muted)}
@media (min-width:1000px){.go .tl{grid-template-columns:repeat(6,minmax(0,1fr))}}
.go-revs{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.go-revs .quote{gap:20px;padding:clamp(18px,2vw,28px)}
.go-revs .quote blockquote{font-size:clamp(16px,1.3vw,18px)}
.go .lib.wide .lib-track li{width:clamp(170px,16vw,220px)}
@media (min-width:1000px){.go-revs{grid-template-columns:repeat(2,minmax(0,1fr))}.go-revs .quote{grid-template-columns:minmax(0,1fr);gap:20px;padding:clamp(18px,2vw,28px)}}
.go-work{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 16px)/1.2);gap:16px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:thin;scrollbar-color:var(--muted) transparent;padding-bottom:14px}
.go-work>li{min-width:0;scroll-snap-align:start}
@media (min-width:700px){.go-work{grid-auto-columns:calc((100% - 48px)/2.2);gap:24px}}
@media (min-width:1000px){.go-work{grid-auto-columns:calc((100% - 96px)/3.2);gap:32px}}
.go-work .go-h3{margin:14px 0 0}
.go-work.go-drag{scroll-snap-type:none;cursor:grabbing;user-select:none}
.go-work.go-drag *{pointer-events:none}
.go-work-nav{display:none}
@media (hover:hover) and (pointer:fine){.go-work{cursor:grab}}
@media (hover:hover) and (pointer:fine) and (min-width:700px){.go-work-nav:not([hidden]){display:flex;justify-content:flex-end;gap:8px;margin-top:12px}}
.go-work-btn{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer;transition:border-color .2s}
.go-work-btn:hover,.go-work-btn:focus-visible{border-color:var(--accent)}
.go-work-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.go-work-btn .i{font-size:20px}
.go-work-prev .i{transform:scaleX(-1)}
@media (prefers-reduced-motion:reduce){.go-work-btn{transition:none}}
/* a card's YouTube poster: the first image, full card width, 16:9, with the play button in the middle; a tap puts the player in its place */
.go-yt{display:block;position:relative;padding:0;overflow:hidden;background:var(--dark)}
.go-yt-play{display:block;position:relative;width:100%;height:100%;padding:0;border:0;background:none;cursor:pointer}
.go-yt-play img{display:block;width:100%;height:100%;object-fit:contain}
.go-yt-btn{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:clamp(56px,5vw,68px);aspect-ratio:1;background:var(--accent);color:var(--accent-ink);box-shadow:0 10px 30px rgba(0,0,0,.5);transform:translate(-50%,-50%);transition:transform .2s ease,background-color .2s}
.go-yt-btn .i{font-size:clamp(24px,2.2vw,30px);fill:currentColor;stroke-width:1.5}
.go-yt-play:hover .go-yt-btn,.go-yt-play:focus-visible .go-yt-btn{background:var(--accent-2);transform:translate(-50%,-50%) scale(1.06)}
.go-yt-play:focus-visible{outline:2px solid var(--accent);outline-offset:-4px}
.go-yt iframe{display:block;width:100%;height:100%;border:0}
.go-yt .go-shot-n{top:clamp(10px,1.2vw,14px);right:clamp(10px,1.2vw,14px);bottom:auto;cursor:zoom-in}
.go-yt .go-shot-n:hover,.go-yt .go-shot-n:focus-visible{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
/* a card's main image (Divine Blossoms: its dashboard): the whole screen on the panel of the empty slots, never cut; a tap opens the viewer */
.go-shot{display:block;position:relative;width:100%;padding:clamp(8px,1vw,12px);overflow:hidden;color:var(--ink);font:inherit;cursor:zoom-in}
.go-shot img{display:block;width:100%;height:100%;object-fit:contain;transition:transform .3s ease}
.go-shot:hover img{transform:scale(1.025)}
.go-shot-n{position:absolute;right:clamp(14px,1.6vw,20px);bottom:clamp(14px,1.6vw,20px);display:flex;align-items:center;gap:6px;padding:6px 9px;background:var(--bg);border:1px solid var(--line);font:600 12px/1 var(--font-m);letter-spacing:.06em;color:var(--ink);transition:background-color .2s,border-color .2s,color .2s}
.go-shot-n .i{font-size:14px}
.go-shot:hover .go-shot-n,.go-shot:focus-visible .go-shot-n{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
/* the viewer: all of an app's images, one at a time, full screen */
.go-gal{width:100%;max-width:none;height:100%;max-height:none;margin:0;padding:0;border:0;background:transparent;color:var(--ink);overflow:hidden}
.go-gal[open]{display:grid;grid-template-rows:auto minmax(0,1fr)}
.go-gal::backdrop{background:var(--dark,#050506)}
html:has(.go-gal[open]){overflow:hidden}
.go-gal-bar{display:flex;align-items:center;gap:8px;padding:max(12px,env(safe-area-inset-top)) var(--gutter) 12px}
.go-gal-cap{display:flex;align-items:baseline;gap:14px;min-width:0;margin:0 auto 0 0;font:500 13px/1.4 var(--font-m);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);white-space:nowrap}
.go-gal-cap b{flex:none;font-weight:600;color:var(--accent)}
.go-gal-cap span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.go-gal-btn{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
.go-gal-btn:hover{border-color:var(--accent)}
.go-gal-btn:disabled{opacity:.35;cursor:default;border-color:var(--line)}
.go-gal-btn .i{font-size:20px}
.go-gal-prev .i{transform:scaleX(-1)}
.go-gal-track{display:grid;grid-auto-flow:column;grid-auto-columns:100%;margin:0;padding:0;list-style:none;overflow-x:auto;overflow-y:hidden;overscroll-behavior:contain;scroll-snap-type:x mandatory;scrollbar-width:none}
.go-gal-track::-webkit-scrollbar{display:none}
.go-gal-track>li{display:grid;place-items:center;min-width:0;min-height:0;padding:0 var(--gutter) max(20px,env(safe-area-inset-bottom));scroll-snap-align:center}
.go-gal-track img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;border:1px solid var(--line)}
@media (prefers-reduced-motion:reduce){.go-shot img,.go-shot-n,.go-yt-btn{transition:none}.go-shot:hover img{transform:none}}
.go-kind{margin-top:4px;font-size:var(--go-t3);line-height:1.5;color:var(--muted)}
/* FAQ (Suraj, 22 Nov 2026, 16:01): the questions column is wider on desktop; on phones it is full width */
@media (min-width:1000px){.go .faq{grid-template-columns:minmax(160px,.6fr) minmax(0,3fr);gap:clamp(32px,4vw,64px)}.go .qa .ans p{max-width:none}}
.go .qa summary{padding:14px 0;font-size:var(--go-t2)}
.go .qa .ans p{font-size:var(--go-t2)}
.go .foot .go-ln{grid-column:1/-1;max-width:none;margin-top:0}
.go .sec{padding:clamp(32px,3.2vw,48px) 0}
.go .sec-h{gap:12px;margin-bottom:clamp(16px,1.8vw,24px)}
.go .h2{font-size:clamp(24px,2.4vw,34px)}
.go .title{font-size:clamp(30px,3.6vw,48px)}
.go .cta .h2{font-size:clamp(26px,3vw,40px)}
.go .lede{font-size:16px}
.go .gamble .sec-h,.go .go-founder .sec-h,.go .go-dark .sec-h
.go .hero{padding-bottom:clamp(28px,3vw,40px)}
.go .cta{padding:clamp(36px,3.6vw,56px) 0}
.go .stats .cell{padding:28px 20px}
@media (min-width:760px){.go .stats .cell{padding:36px 28px}}
.go .how-cta{margin-top:clamp(18px,2vw,28px);display:flex;flex-direction:column;align-items:flex-end;text-align:right}
.go .cases,.go .types{margin-top:24px}
${SHOWCASE_CSS}
@media (max-width:999px){.go .st:not(:last-child){padding-bottom:28px}.go .gamble{gap:28px}}
/* the form's text box: pulled down only, to 240px (200px on phones); then the text scrolls inside it; never wider than the form (Suraj, 22 Nov 2026) */
.go .fld textarea{resize:vertical;min-height:72px;max-height:240px;max-width:100%;overflow-y:auto;box-sizing:border-box}
@media (max-width:767px){.go .fld textarea{max-height:200px}}`;

/* the page description: the live page's words, with the free proof of concept line of "What you keep" (Proof of Work Build) in place of "Working demo in 3 days." (Daisy's brief, 22 Nov 2026, 22:3x) */
const DESC = must(P[KEY.default].desc, 'Working demo in 3 days.', KEEP_T[KEEP_T.length - 1]).replace('Free quote in 12 hours.', 'Free quote in 24 hours.').replace(/^[\s\S]*$/, 'Free strategy session, 7 assets, yours to keep.');
const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(PICK.title.default)}</title>
<meta name="description" content="${attr(DESC)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0A0A0B">
<!-- ElementalsAI Labs ads funnel page /build: the live service page plus the /build sections (D-91 design). Built by src/go.mjs from src/build.mjs and src/go-content.json; edit those, not this file. -->
<script data-go>${HEAD_JS}</script>
${headExtra()}
<script>document.documentElement.classList.add('js','go-dj')</script>
${fontPreload()}<style>${CSS}</style>
<style>${GO_CSS}
${COND}</style>
</head>
<body class="go">
${SPRITE}
<a class="skip" href="#quote-form">Skip to the quote form</a>
${strip()}
${HEADER}
<main id="top">
${MAIN}
</main>
${FOOTER}
${DRAWER}
${SHOW_WORK ? GALLERIES : ''}
<script data-go>${PRUNE_JS}</script>
<script data-go>${LABS_JS}</script>
<script data-go>${DRAWER_JS}</script>
<script data-go>${GALLERY_JS}</script>
${HAS_YT ? `<script data-go>${YT_JS}</script>\n` : ''}<script data-go>${CAROUSEL_JS}</script>
<script data-go>${SHOWCASE_JS}</script>
<script>${GO_JS}</script>
</body>
</html>
`;
/* the parts are in the order of the list (F-319): the section ids, with the versions of one section side by side, then every part */
const ORDER = ['quote', 'worries', 'fit', 'ba', 'how', 'keep', 'compare', 'founder', 'testimonials', ...(SHOW_WORK ? ['work'] : []), 'types', 'cases', 'guarantee', 'compliance', 'faq'];
const IDS = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]).filter((id, i, a) => id !== a[i - 1]);
if (IDS.join(' ') !== ORDER.join(' ')) fail('the sections are not in the order of the list: ' + IDS.join(' '));
const PARTS = ['<div class="strip"', '<header class="top">', 'id="quote"', '<div class="mq"', 'id="worries"', 'id="fit"', 'id="ba"', 'id="how"', 'id="keep"', 'id="compare"', '<div class="stats"', 'id="founder"', 'id="testimonials"', ...(SHOW_WORK ? ['id="work"'] : []), 'id="types"', 'id="cases"', 'id="guarantee"', 'id="compliance"', 'id="faq"', '<footer class="foot">', '<div class="go-dr"'];
/* the drawer script stays inline and must parse: if it does not run, go-dj would hide the form on phones */
try { new Function(DRAWER_JS); } catch (e) { fail('the drawer script does not parse: ' + e.message); }
try { new Function(GALLERY_JS); } catch (e) { fail('the viewer script does not parse: ' + e.message); }
try { new Function(YT_JS); } catch (e) { fail('the YouTube script does not parse: ' + e.message); }
try { new Function(CAROUSEL_JS); } catch (e) { fail('the carousel script does not parse: ' + e.message); }
if (html.split('<script data-go>' + CAROUSEL_JS + '</script>').length !== 2) fail('work: the carousel script must be on the page once');
if (!/prefers-reduced-motion: reduce/.test(CAROUSEL_JS) || !/if\(!rm\)setInterval/.test(CAROUSEL_JS)) fail('work: the carousel must not move by itself with prefers-reduced-motion');
for (const m of html.matchAll(/<ul class="go-work" tabindex="0"[^>]*>[\s\S]*?<\/ul>\s*(<div class="go-work-nav"[^>]*>)?/g)) if (!m[1]) fail('work: a row of 2 or more cards needs its arrow buttons');
let at = html.indexOf('<body');
for (const p of PARTS) { const i = html.indexOf(p, at); if (i < 0) fail('the part ' + p + ' is missing or out of order'); at = i; }
/* the checks below read the page without its data: files (photos, sounds, videos), so their base64 letters cannot match by chance */
const TEXT = html.replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, 'data:');
/* the Labs colors only: no blue of surajdonthi.com (its --accent, #1E90FF) anywhere on /build (Suraj, 22 Nov 2026, 16:17 and 16:20) */
if (/#1e90ff|30\s*,\s*144\s*,\s*255|dodgerblue|--go-blue/i.test(TEXT)) fail('the blue of the personal site (#1E90FF) must not be on /build: use the Labs colors (--accent)');
/* What you keep: only the last row (Rs. 50,000) is in the site's card box (the hero form's .card: --panel, --heavy, --heavy-offset), with no green border (Suraj, 22 Nov 2026, about 20:20) */
if (TEXT.split('<li class="go-top">').length !== 2 || !TEXT.includes(`<li class="go-top">${keepRow(KEEP_T[KEEP_T.length - 1])}</li></ul>`)) fail('keep: only the last row (' + KEEP_T[KEEP_T.length - 1] + ') may be the box row');
if (!TEXT.includes('.go-keep .go-top{background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset);margin-right:11px}') || /\.go-top\{[^}]*--go-green/.test(TEXT)) fail('keep: the Rs. 50,000 row must be in the site\'s card box (--panel, --heavy, --heavy-offset), not in a green border');
/* never the word "Dukan" (Suraj, 22 Nov 2026, through Daisy) */
if (/duka+n/i.test(TEXT)) fail('the word "Dukan" must not be on /build');
/* the form's idea question in /build words, and its text box with a size limit (Suraj, 22 Nov 2026) */
if (TEXT.includes(QF.idea_label_old)) fail('the old form question "' + QF.idea_label_old + '" is still on /build');
if (!TEXT.includes(`<label for="f-idea">${esc(QF.idea_label)}</label>`)) fail('the form question "' + QF.idea_label + '" is not on /build');
/* Daisy's brief, 22 Nov 2026, 22:3x, on all 6 versions: every form asks "What is your app requirement?" and says the approved guarantee line (F-398);
   "120+ applications", never "120+ apps"; the long tech stack line; no "Working demo in 3 days" point in the page description or the number strip */
const HEROES = TEXT.split('class="hero" id="quote"').length - 1, IDEA_LABELS = [...TEXT.matchAll(/<label for="f-idea">([^<]*)<\/label>/g)].map((m) => m[1]);
if (!HEROES || IDEA_LABELS.length !== HEROES || IDEA_LABELS.some((l) => l !== esc(QF.idea_label))) fail('every form must ask "' + QF.idea_label + '": ' + IDEA_LABELS.length + ' labels for ' + HEROES + ' heroes');
if (TEXT.split(`<span><b>${esc(CTA_LINE)}</b></span></p>`).length - 1 !== HEROES) fail('every form must say the approved guarantee line "' + GUARD_T + '"');
if (/120\+ apps\b|100\+|apps delivered/.test(TEXT)) fail('the page must say "120+ applications", never "120+ apps" or "100+"');
for (const s of SLUGS) if (svc(s).stack_line !== SV['custom-software'].stack_line) fail('the version ' + s + ' must have the long tech stack line');
if (TEXT.split(`<p class="lede">${ph(SV['custom-software'].stack_line)}</p>`).length - 1 !== TEXT.split('id="work-t"').length - 1) fail('every "Our work" section must show the long tech stack line');
if (/working demo/i.test(DESC) || STATS.some(([v, l]) => /3 days|working demo/i.test(v + ' ' + l))) fail('the page description and the number strip must not have "Working demo in 3 days" as a point');
if (!/\.go \.fld textarea\{resize:vertical;[^}]*max-height:240px/.test(TEXT) || !/\.go \.fld textarea\{max-height:200px\}/.test(TEXT)) fail('the form text box has no size limit (240px, 200px on phones)');
/* the "See our work" checks below only apply while the section is shown (SHOW_WORK); its code and data stay checked when it is on again */
if (SHOW_WORK) {
/* each app with images: its cards open its one viewer, and the viewer shows all its images in their order, the main image first */
for (const a of S.work.apps.filter(hasGal)) {
  const id = 'go-gal-' + slugOf(a.name), im = MEDIA[a.name].images, at = TEXT.indexOf(`<dialog class="go-gal" id="${id}"`);
  if (at < 0 || TEXT.split(`id="${id}"`).length !== 2) fail('work: ' + a.name + ' needs one viewer');
  const opens = TEXT.split(`data-gal-open="${id}"`).length - 1, cards = SLUGS.filter((s) => a.services.includes(s)).length;
  if (opens < 1 || opens > cards) fail('work: ' + a.name + ': ' + opens + ' cards open its viewer');
  const names = [...TEXT.slice(at, TEXT.indexOf('</dialog>', at)).matchAll(/<li data-name="([^"]*)">/g)].map((m) => m[1]);
  if (JSON.stringify(names) !== JSON.stringify(im.map((p) => attr(p.name)))) fail('work: ' + a.name + ': its viewer must show all ' + im.length + ' images in order');
}
/* each app with a video (a YouTube id; else its local recording or the video on its own site): its cards show its poster (its first image) with the play button
   and the video address, in place of the image, and the play script is on the page; with no video, its cards show its first image.
   No player, no video and nothing from YouTube is on the page when it loads. */
let ytCards = 0;
for (const a of S.work.apps.filter((x) => MEDIA[x.name])) {
  const m = MEDIA[a.name], cards = SLUGS.filter((s) => a.services.includes(s)).length;
  const vid = m.yt || m.mp4, vAttr = m.yt ? `data-yt="${attr(ytSrc(m.yt))}"` : `data-mp4="${m.mp4.startsWith('data:') ? 'data:' : attr(m.mp4)}"`;
  const posters = vid ? TEXT.split(`<div class="go-media go-yt" ${vAttr} data-yt-title="${attr(a.name + (a.kind ? ': ' + a.kind : ''))}">`).length - 1 : 0;
  const shots = TEXT.split(`<button class="go-media go-shot" type="button" data-gal-open="go-gal-${slugOf(a.name)}"`).length - 1;
  if (vid ? posters < 1 || posters > cards || shots : shots < 1 || shots > cards) fail('work: ' + a.name + ': its cards must show ' + (vid ? 'its video poster, not its image' : 'its first image') + ' (' + posters + ' posters, ' + shots + ' images)');
  if (vid && html.split(`<button class="go-yt-play" type="button" aria-label="${attr(viewerSays(VW.play, a))}"><img src="${m.images[0].src}"`).length - 1 !== posters) fail('work: ' + a.name + ': the poster of its video must be its first image, ' + S.work.apps.find((x) => x.name === a.name).images[0].file);
  ytCards += posters;
}
if (TEXT.split('class="go-media go-yt"').length - 1 !== ytCards) fail('work: a video poster has no app');
}
if (/<iframe|<video/i.test(TEXT) || /(?:src|href)="[^"]*(?:youtube|ytimg)/i.test(TEXT)) fail('nothing from YouTube may load with /build: the player comes only with a tap');
if (HAS_YT !== TEXT.includes('<script data-go>' + YT_JS + '</script>')) fail('the play script must be on the page exactly when a card has a video');
/* the two headings say their approved words, word for word, once their sizing spans are taken out */
const h2Words = (id) => ((TEXT.match(new RegExp('id="' + id + '">([\\s\\S]*?)</h2>')) || [])[1] || '').replace(/<[^>]+>/g, '');
if (h2Words('guarantee-t') !== esc(GUARD_T)) fail('the guarantee section does not say "' + GUARD_T + '"');
/* the thank-you message of the form: the callback and the 24 hours (Suraj, 23 Nov 2026: "Your 7 assets along with the Project Estimate is sent to within 24 hours of the call.") */
writeFileSync(new URL('build.html', OUT), html.replace('We reply within 1 hour. Your free quote comes in 12 hours.', 'Get a callback in 1 hour. Your 7 assets, including your Project Cost Estimate, are sent to you within 24 hours of the call.'));
console.log('build.html', Math.round(html.length / 1024) + ' KB');
