// Builds the ElementalsAI Labs site pages on the landing page design (D-91): privacy, terms, contact,
// and the three Google Ads sitelink pages (how it works, get a free quote, our work).
// Run: node site.mjs   → writes ../review/privacy.html, terms, contact, how-it-works, quote and work (npm run build makes the live copies).
// It imports the shared parts from build.mjs (importing does not rebuild the service pages). Extra CSS is prefixed .sp-.
import { writeFileSync } from 'node:fs';
import { CSS, JS, SPRITE, LOGO, attr, fontPreload, DEEP, REVIEWS, PHONE, TEL, EMAIL, VOICE_AGENT, PROD, headExtra, labsCfg, robots, esc, I, derisk, strip, header, footer, quoteCard, marquee, impact, stats, how, cta, OUT } from './build.mjs';

const UPDATED = '1 November 2026';
const SLUG = 'site'; // matches no service page, so the footer marks none of them as current

// ---- the words that fit every service ----
const G = {
  service: 'apps, software and AI',
  ideaLabel: 'Your idea',
  ideaPh: 'A rough idea is enough. For example: a booking app for my clinic.',
  proof: ['100+ applications delivered', '10+ years', '$10M+ client revenue enabled'],
  shots: ['volunteeryatra', 'pilarsai', 'toothlens', 'agshift'],
  stats: [['100+', 'applications delivered'], ['10+', 'years building software'], ['$10M+', 'client revenue enabled'], ['3 days', 'to your working demo']],
  steps: [['Tell us your idea', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'Your idea, working. Tap, click or watch it work yourself.', '3 days'], ['Build it, or stop', 'Like it? We build the full product. If not, you stop there.', 'Your call']],
  cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
};

// ---- extra CSS for these pages only (after the design system, every selector .sp-) ----
const SP_CSS = `
/* ---- site pages (src/site.mjs) ---- */
.sp-head{padding:clamp(36px,4.6vw,68px) 0 clamp(60px,6.4vw,96px)}
.sp-head>.wrap:not(.hero-grid){display:flex;flex-direction:column;align-items:flex-start;gap:26px}
.sp-head .lede{max-width:56ch}
.sp-head .title{max-width:24ch}
.sp-page .tl .st{align-content:start}
.sp-h1{font:600 clamp(40px,5.2vw,68px)/1.12 var(--font-d);letter-spacing:-.026em;color:var(--ink);max-width:15ch;text-wrap:balance}
.sp-meta{display:inline-flex;align-items:center;gap:10px;font:500 11px/1.5 var(--font-m);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.sp-meta .i{font-size:15px;color:var(--accent)}
.sp-quiet{display:inline-flex;align-items:center;gap:9px;padding-bottom:4px;font-weight:600;font-size:15.5px;color:var(--ink-2);--draw-h:1px;transition:color var(--t1)}
.sp-quiet:hover{color:var(--ink)}
.sp-quiet .i{color:var(--accent);transition:transform var(--t2) var(--ez)}
.sp-quiet:hover .i{transform:translateX(3px)}

/* the legal pages: contents on the left, the text on the right */
.sp-legal-sec{padding-top:clamp(48px,5vw,80px)}
.sp-legal{display:grid;grid-template-columns:minmax(0,1fr);gap:48px}
@media (min-width:1000px){.sp-legal{grid-template-columns:240px minmax(0,1fr);gap:clamp(56px,7vw,112px)}}
.sp-toc{display:none}
@media (min-width:1000px){.sp-toc{display:block;position:sticky;top:calc(var(--hh) + 36px);align-self:start;max-height:calc(100vh - var(--hh) - 72px);overflow:auto}}
.sp-toc .eyebrow{margin-bottom:18px}
.sp-toc ol{border-left:1px solid var(--line)}
.sp-toc a{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr);padding:7px 0 7px 18px;font-size:14px;line-height:1.45;color:var(--muted);transition:color var(--t1)}
.sp-toc a span{font:500 11px/1.9 var(--font-m);letter-spacing:.06em;transition:color var(--t1)}
.sp-toc a::before{content:"";position:absolute;left:-1px;top:4px;bottom:4px;width:2px;background:var(--accent);transform:scaleY(0);transform-origin:top;transition:transform var(--t2) var(--ez)}
.sp-toc a:hover{color:var(--ink)}
.sp-toc a[aria-current]{color:var(--ink)}
.sp-toc a[aria-current] span{color:var(--accent)}
.sp-toc a[aria-current]::before{transform:scaleY(1)}
@media (prefers-reduced-motion:no-preference){html:has(.sp-toc){scroll-behavior:smooth}}
.sp-doc{min-width:0;max-width:740px}
.sp-short{position:relative;background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset);padding:clamp(22px,3vw,34px);margin:0 11px clamp(48px,5vw,64px) 0}
.sp-short h2{margin-bottom:20px}
.sp-short ul{display:grid;gap:14px}
.sp-short li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:14px;align-items:start;font-size:16.5px;line-height:1.55;color:var(--ink)}
.sp-ok{width:26px;height:26px;display:grid;place-items:center;background:var(--accent);color:var(--accent-ink)}
.sp-ok .i{font-size:14px;stroke-width:3}
.sp-sec{padding:44px 0;border-top:1px solid var(--line)}
.sp-sec:last-child{padding-bottom:0}
.sp-sec h2{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:baseline;gap:16px;margin-bottom:20px;font:600 clamp(23px,2.3vw,29px)/1.25 var(--font-d);letter-spacing:-.018em;color:var(--ink)}
.sp-sec h2 .n{font:500 12px/1 var(--font-m);letter-spacing:.08em;color:var(--accent)}
.sp-sec h3{margin:30px 0 10px;font:600 17px/1.4 var(--font-s);color:var(--ink)}
.sp-sec h2+h3{margin-top:0}
.sp-sec p,.sp-sec li{font-size:16.5px;line-height:1.7;color:var(--ink-2)}
.sp-sec p+p,.sp-sec p+ul,.sp-sec ul+p,.sp-sec p+.sp-reach,.sp-sec .sp-reach+p{margin-top:14px}
.sp-sec ul{display:grid;gap:10px}
.sp-sec li{position:relative;padding-left:24px}
.sp-sec li::before{content:"";position:absolute;left:2px;top:.74em;width:6px;height:6px;background:var(--accent)}
.sp-sec b{color:var(--ink);font-weight:600}
.sp-doc a:not(.btn){color:var(--ink);background-image:linear-gradient(var(--accent),var(--accent));background-repeat:no-repeat;background-position:0 100%;background-size:100% 1px;transition:background-size .3s var(--out)}
.sp-doc a[href^="tel:"]{white-space:nowrap}
.sp-doc a:not(.btn):hover,.sp-doc a:not(.btn):focus-visible{background-size:100% 2px}
.sp-reach{display:grid;gap:12px;padding:20px 22px;background:var(--field);box-shadow:inset 6px 0 0 var(--accent)}
.sp-reach a{justify-self:start;display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:17px}
.sp-reach .i{font-size:17px;color:var(--accent)}
.sp-reach p{display:flex;align-items:center;gap:10px;font-size:14.5px;line-height:1.5;color:var(--muted)}
.sp-sec .sp-reach p{font-size:14.5px;color:var(--muted)}

/* contact: phone and email, large, on the one heavy card */
.sp-card{position:relative;background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset);padding:clamp(22px,2.6vw,32px);width:100%;max-width:560px;justify-self:end}
@media (max-width:1079px){.sp-card{justify-self:start;max-width:min(560px,calc(100% - 11px))}}
.sp-card .card-h{margin-bottom:6px}
.sp-ch{display:grid;gap:12px;padding:26px 0}
.sp-ch+.sp-ch{border-top:1px solid var(--line)}
.sp-ch:last-child{padding-bottom:6px}
.sp-lab{display:inline-flex;align-items:center;gap:10px;font:500 10.5px/1 var(--font-m);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.sp-lab .i{font-size:15px;color:var(--accent)}
.sp-big{justify-self:start;padding-bottom:6px;font:600 clamp(30px,3.2vw,42px)/1.12 var(--font-d);letter-spacing:-.022em;color:var(--accent);white-space:nowrap;--draw-h:2px}
.sp-big.mail{font-size:clamp(21px,2.3vw,30px);white-space:normal;letter-spacing:-.015em}
.sp-note{display:flex;align-items:center;gap:9px;font-size:14.5px;line-height:1.5;color:var(--ink-2)}
.sp-note .i{font-size:15px;color:var(--accent)}
@media (max-width:420px){.sp-big{font-size:28px}.sp-big.mail{font-size:20px}}

/* how it works: the 3 days */
.sp-days{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
@media (min-width:900px){.sp-days{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}}
.sp-day{display:flex;flex-direction:column;gap:14px;background:var(--panel);border:1px solid var(--line);padding:clamp(24px,2.6vw,34px)}
.sp-day.hi{border:var(--heavy);box-shadow:var(--heavy-offset)}
@media (max-width:899px){.sp-day.hi{margin-right:11px}}
.sp-dn{display:flex;align-items:baseline;gap:12px;margin-bottom:4px}
.sp-dn span{font:500 11px/1 var(--font-m);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.sp-dn b{font:600 clamp(52px,5vw,68px)/.9 var(--font-d);letter-spacing:-.03em;color:var(--accent)}
.sp-day h3{font:600 clamp(22px,2vw,26px)/1.25 var(--font-d);letter-spacing:-.015em;color:var(--ink)}
.sp-day .tx{font-size:16px;line-height:1.6;color:var(--ink-2)}
.sp-get{margin-top:auto;padding-top:18px;border-top:1px solid var(--line);font-size:15.5px;line-height:1.55;color:var(--ink)}
.sp-get span{display:block;margin-bottom:8px;font:500 10.5px/1 var(--font-m);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.sp-after{margin-top:clamp(40px,4.4vw,56px);display:flex;flex-direction:column;align-items:flex-start}

/* get a free quote: what happens next, in 3 steps */
@media (min-width:1000px){.sp-tl3{grid-template-columns:repeat(3,minmax(0,1fr))}}

/* our work: both reviews */
.sp-reviews{display:grid;gap:16px}
`;

// ---- small scripts for these pages only ----
// the contents list marks the section you are reading
const TOC_JS = `<script>(function(){var links=[].slice.call(document.querySelectorAll('.sp-toc a')),secs=[].slice.call(document.querySelectorAll('.sp-sec'));if(!links.length||!secs.length)return;
var cur='',q=0;function upd(){q=0;var y=innerHeight*.32,id=secs[0].id;secs.forEach(function(s){if(s.getBoundingClientRect().top<y)id=s.id;});if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)id=secs[secs.length-1].id;if(id===cur)return;cur=id;links.forEach(function(a){if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}
addEventListener('scroll',function(){if(!q)q=requestAnimationFrame(upd);},{passive:true});addEventListener('resize',upd,{passive:true});upd();})();</script>`;
// app.js says the first review word by word; this says the other reviews the same way, at the same pace

// ---- parts ----
const toQuotePage = (html) => html.replace(/href="#quote"/g, 'href="quote.html"');
// the headline of the landing pages: the real line, in the page once and shown at first paint; its last word rolls (app.js).
// The false start is kept in data-false. " / " in the line breaks it there
const talkTitle = (id, falseStart, line, verbs) => {
  const ws = (s) => s.split(' / ').map(esc).join(' <br>');
  return `<h1 class="title" id="${id}" data-talk data-verbs='${JSON.stringify(verbs).replace(/'/g, '&#39;')}' data-false="${attr(falseStart)}"><span class="line">${ws(line)} <span class="band"><span class="rot"><span class="w">${esc(verbs[0])}</span></span></span><span class="pad"></span></span></h1>`;
};
// a page head with the particle field; "rise" items show at once with the title, "reveal" items rise in on their own
const pageHead = ({ id, eyebrow, h1, lede, after = '', talk = false }) => {
  const m = talk ? 'rise' : 'reveal';
  return `<section class="hero sp-head" aria-labelledby="${id}"><canvas class="field" aria-hidden="true"></canvas><div class="wrap">
 <span class="eyebrow ${m}">${esc(eyebrow)}</span>
 ${h1}
 ${lede ? `<p class="lede ${m}">${lede}</p>` : ''}
 ${after.replace(/class="(sp-[a-z]+)/g, `class="$1 ${m}`)}
</div></section>`;
};
const staticH1 = (id, html) => `<h1 class="sp-h1 reveal" id="${id}">${html}</h1>`;
const reach = () => `<div class="sp-reach"><a href="mailto:${EMAIL}">${I('mail')}<span>${EMAIL}</span></a><a href="tel:${TEL}">${I('phone')}<span>${PHONE}</span></a><p>${I('clock')}<span>Calls: 10 am to 8 pm, India time, every day. We reply within 1 hour.</span></p></div>`;
const figure = (key) => { const r = REVIEWS[key]; return `<figure class="quote reveal"><blockquote>${r.paras.map((x) => `<p>${x}</p>`).join('')}</blockquote><figcaption class="who">${r.photo ? `<img src="${DEEP}" alt="" width="56" height="56">` : `<span class="ini" aria-hidden="true">${r.ini}</span>`}<span><b>${r.who}</b><small>${r.role}</small></span></figcaption></figure>`; };

// a legal page: the short version, numbered sections, and a contents list on wide screens
const legal = ({ short, sections }) => `<section class="sec sp-legal-sec" aria-label="The full text"><div class="wrap sp-legal">
 <nav class="sp-toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>${sections.map((s, i) => `<li><a href="#${s.id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.t)}</a></li>`).join('')}</ol></nav>
 <div class="sp-doc">
  <aside class="sp-short" aria-labelledby="short-t"><h2 class="eyebrow" id="short-t">The short version</h2><ul>${short.map((x) => `<li><span class="sp-ok">${I('check')}</span><span>${x}</span></li>`).join('')}</ul></aside>
  ${sections.map((s, i) => `<section class="sp-sec" id="${s.id}" aria-labelledby="${s.id}-t"><h2 id="${s.id}-t"><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${esc(s.t)}</span></h2>${s.html}</section>`).join('\n  ')}
 </div>
</div></section>`;

function shell({ file, title, desc, main, quote = false, scripts = '' }) {
  const skip = quote ? '<a class="skip" href="#quote-form">Skip to the quote form</a>' : '<a class="skip" href="#top">Skip to the content</a>';
  const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots()}">
<meta name="theme-color" content="#0A0A0B">
<!-- ElementalsAI Labs site page (D-91 design). Built by src/site.mjs; edit the source, not this file. -->
${headExtra()}
<script>document.documentElement.classList.add('js')</script>
${fontPreload()}<style>${CSS}
${SP_CSS}</style>
</head>
<body class="sp-page">
${SPRITE}
${skip}
${strip()}
${quote ? header() : toQuotePage(header())}
<main id="top">
${quote ? main : toQuotePage(main)}
</main>
${footer(SLUG)}
${quote ? `<script>window.LABS=${JSON.stringify(labsCfg(G.service))};</script>\n` : ''}<script>${JS}</script>
${scripts}
</body>
</html>`;
  writeFileSync(new URL(file, OUT), html);
  console.log(file, Math.round(html.length / 1024) + ' KB');
}

// ---- get a free quote (sitelink: "A rough idea is enough · Your quote in 12 hours") ----
shell({
  file: 'quote.html', quote: true,
  title: 'Get a Free Quote | ElementalsAI Labs',
  desc: 'Send your idea. A rough idea is enough. Free quote in 12 hours. Working demo in 3 days.',
  main: `<section class="hero" id="quote" aria-labelledby="hero-t"><canvas class="field" aria-hidden="true"></canvas><div class="wrap hero-grid">
 <div class="copy">
  <span class="eyebrow rise">Get a free quote</span>
  ${talkTitle('hero-t', 'Write a full brief first.', 'A rough idea is', ['enough.', 'all we need.'])}
  <dl class="offer rise" aria-label="Our offer"><div><dt>Free quote</dt><dd><small>in</small>12 hours</dd></div><div><dt>Working demo</dt><dd><small>in</small>3 days</dd></div></dl>
  <p class="offer-sub rise">Talk to the orb or type. We reply within 1 hour.</p>
  <p class="proofline rise">${G.proof.map((x, i) => (i ? '<span class="dot" aria-hidden="true"></span>' : '') + `<span>${esc(x)}</span>`).join('')}</p>
 </div>
 ${quoteCard(G)}
</div></section>
${marquee()}
<section class="sec" id="next" aria-labelledby="next-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">What happens next</span><h2 class="h2" id="next-t">You send your idea. <em>Then three things happen.</em></h2></div>
 <ol class="tl sp-tl3">${[['We reply', 'Our team gets back to you within 1 hour.', '1 hour'], ['Your free quote', 'Your quote comes in 12 hours. It is free, and you do not have to buy anything.', '12 hours'], ['Your working demo', 'Say yes, and see your idea working in 3 days. Then build it, or stop.', '3 days']].map(([h, t, tag], i) => `<li class="st${i === 2 ? ' big' : ''}"><span class="node">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(t)}</p><span class="tag">${esc(tag)}</span></li>`).join('')}</ol>
 <div class="how-cta reveal"><a class="btn primary" href="#quote">Get my free quote ${I('arrow')}</a>${derisk}</div>
</div></section>`,
});

// ---- how it works (sitelink: "From idea to working proof · Day 1 plan, day 3 working proof") ----
const day = (n, h, t, get, hi) => `<li class="sp-day reveal${hi ? ' hi' : ''}"><p class="sp-dn"><span>Day</span><b>${n}</b></p><h3>${esc(h)}</h3><p class="tx">${esc(t)}</p><p class="sp-get"><span>You get</span>${esc(get)}</p></li>`;
shell({
  file: 'how-it-works.html',
  title: 'How It Works | ElementalsAI Labs',
  desc: 'From idea to working demo. Day 1 a plan, day 3 a working demo. Free quote in 12 hours.',
  main: `${pageHead({ id: 'pg-t', talk: true, eyebrow: 'How it works', h1: talkTitle('pg-t', 'Months before you see anything.', 'Day 1, a plan. / Day 3, a working', ['demo.', 'proof.']), lede: 'From your idea to a working demo, in 4 steps. A rough idea is enough to start.' })}
${how(G).replace('<span class="eyebrow">How it works</span>', '<span class="eyebrow">The 4 steps</span>')}
<section class="sec" id="days" aria-labelledby="days-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">The 3 days</span><h2 class="h2" id="days-t">Your working demo, <em>day by day.</em></h2><p class="lede">It is a working demo of your idea, not the full product. It shows you that we understood your idea, before you commit.</p></div>
 <ol class="sp-days">
  ${day(1, 'We study and plan.', 'We study your idea and your business. Then we plan the first screens, or the first task for the AI, that prove your idea.', 'The plan, and what the demo will show.')}
  ${day(2, 'We build.', 'We build the core of your idea: the first screens, or the AI doing the first task.', 'An update on the build.')}
  ${day(3, 'You use it.', 'We finish and test the working demo. Then you use it yourself: tap and click through it, or watch the AI do the task.', 'The working demo. Then you decide: build the full product, or stop.', true)}
 </ol>
</div></section>
${cta(G)}`,
});

// ---- our work (sitelink: "Apps and products we built · Real projects, real screens") ----
shell({
  file: 'work.html',
  title: 'Our Work | ElementalsAI Labs',
  desc: 'Apps and products we built. Real projects, real screens, real numbers.',
  main: `${pageHead({ id: 'pg-t', talk: true, eyebrow: 'Our work', h1: talkTitle('pg-t', 'Take our word for it.', 'Apps and products', ['we built.']), lede: 'Real projects, real screens. Each one is a live product that our team helped build, for founders and for enterprises.' })}
${marquee()}
${impact(G)}
${stats(G)}
<section class="sec" id="review" aria-labelledby="rv-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">What founders say</span><h2 class="h2" id="rv-t">What founders say about <em>working with us.</em></h2></div>
 <div class="sp-reviews">${figure('sachin')}${figure('deep')}</div>
</div></section>
${cta(G)}`,
  scripts: '', // app.js now speaks every review on the page
});

// ---- contact (sitelink: "Call or Email Us: Talk to us directly · Phone and email, no forms") ----
shell({
  file: 'contact.html',
  title: 'Call or Email Us | ElementalsAI Labs',
  desc: 'Talk to us directly. Call +91 80887 33622 or email hello@elementalsai-labs.com. We reply within 1 hour.',
  main: `<section class="hero sp-head" aria-labelledby="pg-t"><canvas class="field" aria-hidden="true"></canvas><div class="wrap hero-grid">
 <div class="copy">
  <span class="eyebrow reveal">Call or email us</span>
  ${staticH1('pg-t', 'Talk to us <span class="band">directly.</span>')}
  <p class="lede reveal">Phone and email, no forms. Tell us your idea in your own words. A rough idea is enough.</p>
  <a class="sp-quiet draws reveal" href="quote.html">Prefer to type it? Get a free quote ${I('arrow')}</a>
 </div>
 <div class="sp-card reveal">
  <div class="card-h"><h2 class="eyebrow">Talk to us</h2><span class="state"><span class="led"></span>Every day</span></div>
  <div class="sp-ch"><p class="sp-lab">${I('phone')}Call us</p><a class="sp-big draws" href="tel:${TEL}" aria-label="Call ${PHONE}">${PHONE}</a><p class="sp-note">${I('clock')}10 am to 8 pm, India time, every day.</p></div>
  <div class="sp-ch"><p class="sp-lab">${I('mail')}Email us</p><a class="sp-big mail draws" href="mailto:${EMAIL}" aria-label="Email ${EMAIL}">hello@<wbr>elementalsai-labs.com</a><p class="sp-note">${I('check')}We reply within 1 hour.</p></div>
 </div>
</div></section>`,
});

// ---- privacy policy ----
const P_SECTIONS = [
  { id: 'who', t: 'Who we are', html: `<p>ElementalsAI Labs builds apps, AI software and custom software for businesses. In this policy, “we” and “us” mean ElementalsAI Labs.</p>
<p>This policy covers this website, our quote form and voice agent, our Google ads and the Google lead form, and the calls and emails that you send us.</p>
<p>Under India’s Digital Personal Data Protection Act, 2023, we are the Data Fiduciary for this data. This means that we decide why and how it is used, and we are responsible for it.</p>
${reach()}` },
  { id: 'collect', t: 'What we collect, and how', html: `<h3>When you ask for a quote on this site</h3>
<p>You can type in the form, or talk to our voice agent. We collect your name, phone number, email address and your idea. We also collect anything else that you choose to tell us, for example the name of your company.</p>
<p>The voice agent uses your microphone only if you allow it in your browser. We use what you say only to fill in your request, in the same way as what you type.</p>
<h3>When you send the Google lead form</h3>
<p>Some of our Google ads have a form that opens inside Google. Google fills in your name, email address, phone number and company name from your Google account. You check them before you send the form. The form also asks what you want to build and when you want to start. When you send it, Google gives your answers to us.</p>
<h3>When you call us</h3>
<p>Our Google ads can show a phone number from Google. Google sends the call on to us, and tells us some details about it, for example when it started and how long it lasted. When the call reaches us, we see your phone number, the same as with any call.</p>
<p>We do not record calls without telling you first.</p>
<h3>When you email us</h3>
<p>We get your email address, your name if you give it, and what you write.</p>
<h3>When you visit this site</h3>
<p>This site uses the Google tag and Google Analytics. They collect data about your visit: the pages that you see, the ad that brought you here, and technical data such as your browser, your device and your IP address. They also record when you send the quote form, start a call with the voice agent, tap our phone number or email address, and book a call with us.</p>
<p>When you send the quote form, the Google tag sends your email address and phone number to Google in a scrambled (hashed) form. Google uses them only to count which ads bring requests.</p>
<p>The Google tag also adds your browser to our visitor lists. With these lists, Google can show you our ads again later.</p>
<p>This site also uses Microsoft Clarity. It records how you use the site: where you click, how far you scroll and which pages you open. We see this as recordings and heat maps, and we use them to make the site easier to use. Clarity does not record what you type in the quote form.</p>
<h3>Cookies</h3>
<p>The Google tag, Google Analytics and Microsoft Clarity use cookies. Cookies are small files that your browser keeps. They let Google connect a visit, a sent form or a booked call to the ad that brought you here, and they let Google and Microsoft know that two visits came from the same browser. They also add your browser to our visitor lists.</p>
<p>You can block or delete cookies in your browser settings. This site still works without them. To turn off personalised ads from Google, use <a href="https://myadcenter.google.com/" rel="noopener">My Ad Center</a>. To learn how Google uses data from sites like this one, read <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">Google’s page about it</a>.</p>
<h3>What we do not collect</h3>
<p>We do not ask for bank or card details, ID numbers, health data or passwords on this site or in our forms. Please do not send them to us.</p>` },
  { id: 'why', t: 'Why we use it', html: `<p>We use your data only for these purposes:</p>
<ul>
<li>To reply to you, and to send your free quote.</li>
<li>To talk with you about your idea, make your working demo, and do your project if you go ahead.</li>
<li>To support you after launch, if you are a client.</li>
<li>To keep records of our work, and to do what the law requires, for example for tax and accounts.</li>
<li>To learn which of our ads bring requests, so that we spend on the ads that work.</li>
<li>To learn how visitors use this site, so that we can make it better.</li>
<li>To show our ads again to people who visited this site.</li>
<li>To keep this site and our services safe and working.</li>
</ul>
<p>We do not use your data for any other purpose without asking you first.</p>` },
  { id: 'consent', t: 'Your consent, and the law we follow', html: `<p>We follow India’s Digital Personal Data Protection Act, 2023, and the rules made under it. We use your data only on a ground that this law allows:</p>
<ul>
<li><b>Your consent.</b> You give it when you send the quote form, talk to the voice agent, send the Google lead form, call us or email us. It covers the purposes in section 3.</li>
<li><b>Uses that the law allows.</b> For example, when you give us your data yourself for a clear purpose, such as a quote, and you do not tell us that you object.</li>
<li><b>Our legal duties.</b> For example, when a law or a court order requires us to keep or share data.</li>
</ul>
<h3>Withdraw your consent</h3>
<p>You can withdraw your consent at any time. It is as easy as giving it: email us at <a href="mailto:${EMAIL}">${EMAIL}</a>, or call us. After that, we stop using your data for that purpose, and we delete it, unless a law requires us to keep it.</p>
<p>Withdrawing does not change what we did before. If you withdraw, we may not be able to send your quote or continue your project.</p>` },
  { id: 'share', t: 'Who we share it with', html: `<p><b>We never sell your data.</b> We do not rent it or trade it. We share it only with:</p>
<ul>
<li><b>Google</b>, for our ads, the Google lead form, call reporting, the Google tag and Google Analytics. Google also uses data under its own <a href="https://policies.google.com/privacy" rel="noopener">privacy policy</a>.</li>
<li><b>Microsoft</b>, for Clarity. Microsoft also uses data under its own <a href="https://privacy.microsoft.com/privacystatement" rel="noopener">privacy statement</a>.</li>
<li><b>Our service providers</b>, for example the companies that host this site, run the voice agent, and carry our email and calls. They use your data only to do that work for us, and they must keep it safe.</li>
<li><b>The people on our team</b> who work on your request or your project.</li>
<li><b>Government bodies and courts</b>, only when a law requires it.</li>
</ul>` },
  { id: 'keep', t: 'How long we keep it', html: `<p>We keep your data only for as long as we need it for the purpose. Then we delete it, or our service providers delete it for us.</p>
<ul>
<li>If you ask us to delete your data, we delete it, unless a law requires us to keep it.</li>
<li>If a law requires us to keep a record, for example for tax and accounts, we keep it only for that time.</li>
<li>Our visitor lists keep a browser only for the time that we set in Google Ads. Then Google removes it.</li>
</ul>` },
  { id: 'safe', t: 'How we keep it safe', html: `<p>We take reasonable security steps to protect your data from loss, misuse and access by people who must not see it.</p>
<ul>
<li>Only the people who need your data for their work can see it.</li>
<li>We use trusted service providers, and they must protect your data too.</li>
<li>We keep your idea confidential.</li>
</ul>
<p>No system is completely safe. If a breach affects your data, we tell you and the Data Protection Board of India, as the law requires.</p>` },
  { id: 'rights', t: 'Your rights', html: `<p>Under the law, you can:</p>
<ul>
<li><b>See your data.</b> Ask for a summary of the data that we have about you, what we do with it, and who we shared it with.</li>
<li><b>Correct it.</b> Ask us to correct, complete or update your data.</li>
<li><b>Delete it.</b> Ask us to delete your data, unless a law requires us to keep it.</li>
<li><b>Withdraw your consent</b> at any time (section 4).</li>
<li><b>Complain.</b> Tell us when something is wrong, and get an answer (section 12).</li>
<li><b>Name a nominee.</b> Choose a person who can use these rights for you if you die, or if illness or injury stops you from using them.</li>
</ul>
<h3>How to use your rights</h3>
<p>Email <a href="mailto:${EMAIL}">${EMAIL}</a> from the email address that you gave us, or call <a href="tel:${TEL}">${PHONE}</a>. Tell us which right you want to use. We may ask you to confirm who you are before we act. We answer as soon as we can, and within the time that the law sets.</p>` },
  { id: 'children', t: 'Children', html: `<p>Our services are for businesses and adults. We do not knowingly collect data from anyone under 18. If you think that a child sent us data, tell us, and we delete it.</p>` },
  { id: 'outside', t: 'Data outside India', html: `<p>Some of our service providers, such as Google, can store or process data on servers outside India. We allow this only where Indian law permits it. Our providers must protect your data wherever they keep it.</p>` },
  { id: 'changes', t: 'Changes to this policy', html: `<p>We may change this policy when our services or the law change. The date at the top of this page shows the last change. If a change affects how we use data that you already gave us, we tell you before it applies.</p>` },
  { id: 'grievances', t: 'Questions and complaints', html: `<p>For a question or a complaint about your data, contact us. We answer for ElementalsAI Labs:</p>
${reach()}
<p>We answer as soon as we can, and within the time that the law sets. If you are not happy with our answer, you can complain to the Data Protection Board of India.</p>` },
];
shell({
  file: 'privacy.html',
  title: 'Privacy Policy | ElementalsAI Labs',
  desc: 'How ElementalsAI Labs collects, uses and protects your data, and your rights under India’s data protection law.',
  main: `${pageHead({ id: 'pg-t', eyebrow: 'Privacy policy', h1: staticH1('pg-t', 'How we use <span class="band">your data.</span>'), lede: 'What we collect, why we collect it, and what you can do about it. In plain words.', after: `<p class="sp-meta">${I('calendar')}Last updated: ${UPDATED}</p>` })}
${legal({
  short: ['We collect only what you give us for a quote, and what the Google tag counts on this site.', 'We use it to reply to you, to make your quote and your project, and to run and measure our Google ads.', 'We never sell your data.', 'We keep it only for as long as we need it. Then we delete it.', 'You can see, correct or delete your data, or withdraw your consent, at any time.'],
  sections: P_SECTIONS,
})}`,
  scripts: TOC_JS,
});

// ---- terms and conditions ----
const T_SECTIONS = [
  { id: 'about', t: 'About these terms', html: `<p>These terms are between you and ElementalsAI Labs (“we”, “us”). They apply when you use this website, ask us for a quote, or work with us.</p>
<p>For each project, we send you a written proposal with the details of your project. If your proposal and these terms say different things, your proposal applies to that project.</p>
<p>When you use this site, you agree to these terms. If you do not agree, please do not use the site.</p>` },
  { id: 'site', t: 'Using this site', html: `<p>Use this site to learn about our services and to ask for a quote. Please do not:</p>
<ul>
<li>send false details, or the details of another person without their permission;</li>
<li>try to break the site, overload it, or get into parts that are not public;</li>
<li>copy the site, or use it to send spam or harmful code.</li>
</ul>
<p>The information on this site is general. It is not a quote or an offer for your project. We can change or remove any part of the site at any time.</p>
<p>This site can link to other sites. We do not control them, and we are not responsible for them.</p>` },
  { id: 'quote', t: 'The free quote', html: `<p>The quote is free, and you do not have to buy anything. A rough idea is enough.</p>
<p>We reply within 1 hour. Your free quote comes in 12 hours.</p>
<p>We base the quote on what you tell us. If your idea changes, the quote can change too.</p>` },
  { id: 'demo', t: 'The working demo in 3 days', html: `<p>After your quote, if you choose to go ahead, we make a working demo of your idea in 3 days.</p>
<ul>
<li><b>What it is:</b> the core of your idea, working, that you can use yourself. For example, real screens that you tap and click through, or the AI doing one of your tasks.</li>
<li><b>What it is not:</b> the full product. It shows you that we understood your idea, before you commit to the full build.</li>
</ul>
<p>Then you decide: build the full product with us, or stop there.</p>
<p>Your written proposal confirms what the demo covers, when the 3 days start, and what we need from you.</p>` },
  { id: 'payments', t: 'Payments', html: `<p><b>You pay only when you see it built.</b></p>
<p>The payments come in predictable and easy payment cycles. Your written proposal sets out each payment and when it is due. You see it before you agree to anything.</p>` },
  { id: 'money-back', t: 'Full money back', html: `<p><b>Full money back if we don’t deliver.</b></p>
<p>Your written proposal sets out the precise conditions.</p>` },
  { id: 'code', t: 'Code ownership', html: `<p>You get the code ownership on completion of your project.</p>
<p>Some parts belong to others, for example open-source libraries and outside services that your product uses. They stay under their own licences.</p>
<p>Our own tools that we use to build, which are not part of your product, stay ours.</p>` },
  { id: 'support', t: 'Support after launch', html: `<p>We support you after launch. Your written proposal sets out what the support covers.</p>` },
  { id: 'confidential', t: 'Your idea stays confidential', html: `<p>Your idea is yours. We keep it confidential, and also what you tell us about your business.</p>
<p>We use it only to make your quote, your working demo and your project. We share it only with the people and service providers who help us do that work. They must keep it confidential too.</p>
<p>This does not apply to information that is already public, or that a law or a court requires us to share.</p>
<p>For how we handle personal data, read our <a href="privacy.html">privacy policy</a>.</p>` },
  { id: 'content', t: 'Our content on this site', html: `<p>The words, design, logo, images and code of this site belong to ElementalsAI Labs, or to others who let us use them. The client names, products and screenshots belong to their owners.</p>
<p>Please do not copy or reuse them without our written permission.</p>` },
  { id: 'liability', t: 'Limits of our liability', html: `<p>We do our work with care and skill. But no software is free of errors, and we cannot promise that this site will always work.</p>
<p>We are not responsible for losses that we could not reasonably expect, or for indirect losses, for example lost profit, lost business or lost data.</p>
<p>For a project, our total liability is at most the amount that you paid us for that project.</p>
<p>Nothing in these terms limits a liability that the law does not let us limit.</p>` },
  { id: 'law', t: 'The law and disputes', html: `<p>Indian law applies to these terms.</p>
<p>If something goes wrong, please tell us first. We try to fix it with you, quickly and fairly. If we cannot agree, the courts of India decide.</p>` },
  { id: 'changes', t: 'Changes to these terms', html: `<p>We may change these terms. The date at the top of this page shows the last change.</p>
<p>A change does not alter a proposal that we already agreed with you. We change a proposal only when we both agree.</p>` },
  { id: 'contact', t: 'Contact us', html: `<p>For a question about these terms, contact us:</p>
${reach()}` },
];
shell({
  file: 'terms.html',
  title: 'Terms and Conditions | ElementalsAI Labs',
  desc: 'The terms for this site and for our free quotes, working demos and projects.',
  main: `${pageHead({ id: 'pg-t', eyebrow: 'Terms and conditions', h1: staticH1('pg-t', 'The terms of <span class="band">working with us.</span>'), lede: 'The rules for this site, and for our quotes, working demos and projects. In plain words.', after: `<p class="sp-meta">${I('calendar')}Last updated: ${UPDATED}</p>` })}
${legal({
  short: ['The quote is free. You do not have to buy anything.', 'The working demo in 3 days is a demo of your idea. It is not the full product.', 'You pay only when you see it built, in predictable and easy payment cycles.', 'Full money back if we don’t deliver. Your written proposal sets out the precise conditions.', 'You get the code ownership on completion. We support you after launch.', 'We keep your idea confidential.'],
  sections: T_SECTIONS,
})}`,
  scripts: TOC_JS,
});
