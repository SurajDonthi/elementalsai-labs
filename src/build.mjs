// Builds the ElementalsAI Labs landing pages v2 (D-91): one design system (styles.css), one script (app.js),
// the words of each page below. Run: node build.mjs   → writes ../review/NN-<slug>.html, each one self-contained (the review copy).
// The live site: npm run build (scripts/release.mjs) builds with LABS_PROD and writes ../public/.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
// LABS_OUT=<folder> writes the pages elsewhere; LABS_NO_DEVICES=1 leaves out src/devices (the built-in demos are used).
const SRC = new URL('./', import.meta.url), OUT = process.env.LABS_OUT ? pathToFileURL(process.env.LABS_OUT.replace(/\/?$/, '/')) : new URL('../review/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const NO_DEV = !!process.env.LABS_NO_DEVICES;
const read = (f) => readFileSync(new URL(f, SRC), 'utf8');
const b64 = (f, type) => `data:${type};base64,${readFileSync(new URL('assets/' + f, SRC)).toString('base64')}`;
/* IBM Plex, served from the site (src/assets/fonts: the Latin files from Google Fonts; Plex Sans is one variable file, plus its
   latin-ext file for the ₹ sign). The same faces and weights the Google Fonts link gave, so the type looks the same.
   The review copies carry them as data: URLs; the live build (scripts/release.mjs) turns them into cached /assets/ files. */
const FONT = (f) => b64('fonts/' + f + '.woff2', 'font/woff2');
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';
const SANS = FONT('plex-sans'), SANS_EXT = FONT('plex-sans-ext');
const face = (family, weight, style, src, range) => `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:swap;src:url(${src}) format('woff2');unicode-range:${range}}`;
const FONT_CSS = [
  ...['400', '500', '600'].map((w) => face('IBM Plex Mono', w, 'normal', FONT('plex-mono-' + w), LATIN)),
  ...['400', '500', '600', '700'].flatMap((w) => [face('IBM Plex Sans', w, 'normal', SANS_EXT, LATIN_EXT), face('IBM Plex Sans', w, 'normal', SANS, LATIN)]),
  ...['400', '500', '600'].map((w) => face('IBM Plex Serif', w, 'normal', FONT('plex-serif-' + w), LATIN)),
  face('IBM Plex Serif', '500', 'italic', FONT('plex-serif-500i'), LATIN),
].join('\n');
/* the live pages preload the main Plex Sans file (the body text) */
const fontPreload = () => (PROD ? `<link rel="preload" href="${SANS}" as="font" type="font/woff2" crossorigin>\n` : '');
const CSS = FONT_CSS + '\n' + read('styles.css'), JS = read('app.js');
// Devices for "Try it" (D-91): src/devices/<name>.js registers window.LABS_DEVICES[name]; <name>.css is namespaced .dv-<name>.
const DEV_DIR = new URL('devices/', SRC);
const hasDev = (n) => !NO_DEV && !!n && existsSync(new URL(n + '.js', DEV_DIR));
const devFiles = (ext, name) => (!NO_DEV && existsSync(DEV_DIR) ? readdirSync(DEV_DIR).filter((f) => f === name + ext).sort().map((f) => readFileSync(new URL(f, DEV_DIR), 'utf8')).join('\n') : '');
// one script block per device, so an error in one device cannot stop the others
const devScripts = (name) => (!NO_DEV && existsSync(DEV_DIR) ? readdirSync(DEV_DIR).filter((f) => f === name + '.js').sort().map((f) => '<script>' + readFileSync(new URL(f, DEV_DIR), 'utf8') + '</script>').join('\n') : '');
const deviceOf = (p) => (!p.try ? '' : hasDev(p.try.device) ? p.try.device : (p.try.fallback || p.try.device || 'phone'));
/* the official single-line logo (Nourd lettering), with white text for the dark site, made from the 2344 px original (D-99).
   The page uses a 416 × 56 copy (twice its 208 × 28 size); the 960 px file stays as the source */
const LOGO = b64('brand/logo-line-white-416.png', 'image/png');
/* the work screenshots, 800 px wide (re-encoded from the 1100 px originals beside them, which the build does not use) */
const IMG = Object.fromEntries(['toothlens', 'volunteeryatra', 'agshift', 'pilarsai'].map((k) => [k, b64(k + '-800.jpg', 'image/jpeg')]));
const DEEP = b64('deep-mehta.jpg', 'image/jpeg');
/* Diya's opening (D-98): her two lines, made in the agent's own voice, and the glass knock (the word times are in app.js).
   preload="none": app.js loads them on the first hover or tap of the orb (play() also loads them) */
const SND = { hello: b64('diya-hello.mp3', 'audio/mpeg'), knock: b64('knock.wav', 'audio/wav'), name: b64('diya-name.mp3', 'audio/mpeg') };
const PHONE = '+91 80887 33622', TEL = '+918088733622', EMAIL = 'hello@elementalsai-labs.com';
/* the ElevenLabs free quote agent (Suraj's script, 29 Oct 2026). The ID is public; the API key never goes in a page */
const VOICE_AGENT = 'agent_9701m6bb1fwqese82y1t2mjabdv5';
/* the live build: no draft notes, the form sends leads to /api/lead, search engines may index the pages, and the Google tag counts leads when its ID is set */
const PROD = !!process.env.LABS_PROD;
// Google Tag Manager loads Analytics, Clarity and the Google Ads conversion tags; app.js only pushes events to dataLayer.
const GTM = 'GTM-T9SDG58F';
const headExtra = () => (PROD ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');</script>\n<script defer src="/_vercel/insights/script.js"></script>\n` : '');
const labsCfg = (service) => ({ service, agent: VOICE_AGENT, lead: PROD ? '/api/lead' : '', phone: PHONE, email: EMAIL });
const robots = () => (PROD ? 'index, follow' : 'noindex, nofollow');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const I = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  phone: '<path d="M21 16.6v2.9a2 2 0 0 1-2.2 2A18.6 18.6 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h2.9a1.6 1.6 0 0 1 1.6 1.3c.2 1 .5 2 .9 2.9a1.6 1.6 0 0 1-.4 1.8L8.2 10.3a15 15 0 0 0 5.5 5.5L15 14.5a1.6 1.6 0 0 1 1.8-.4c.9.4 1.9.7 2.9.9a1.6 1.6 0 0 1 1.3 1.6z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 10h18M7 15h3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>', chat: '<path d="M4 5h16v11H9.5L4 20z"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2z"/><path d="M10 21h4"/>',
  bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>', repeat: '<path d="M20 11.5A8 8 0 1 1 17.7 6"/><path d="M20 4v5h-5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>', home: '<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>', stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
  face: '<path d="M4 8.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3M9 9v1.5M15 9v1.5M12 9v4h-1M9 15.6c1.7 1.3 4.3 1.3 6 0"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>', book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  heart: '<path d="M12 20s-7-4.3-8.8-8.6C1.9 8.1 3.9 4.8 7.3 4.8c1.9 0 3.4 1 4.7 2.6 1.3-1.6 2.8-2.6 4.7-2.6 3.4 0 5.4 3.3 4.1 6.6C19 15.7 12 20 12 20z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.6 3.6-5.6 6.5-5.6s5.5 2 6.5 5.6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.8 3 2.5 3.5 5.2"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  box: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>', trend: '<path d="M4 4v16h16"/><path d="M8 15l3.5-4.5 3 3L19 8"/>',
  doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>', shield: '<path d="M12 3l7.5 3v5.2c0 4.6-3.1 8.3-7.5 9.8-4.4-1.5-7.5-5.2-7.5-9.8V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
};
const SPRITE = `<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</defs></svg>`;

const PAGES_ORDER = [
  ['01-mobile-app-development', 'Mobile app development'], ['02-app-development', 'App development'], ['06-ai-development', 'AI development'],
  ['08-ai-agents-and-automation', 'AI agents and automation'], ['11-custom-software', 'Custom software'],
];
const CLIENTS = ['Toothlens', 'Volunteer Yatra', 'AgShift', 'Pilars AI', 'KPMG Singapore'];
// Facts from surajdonthi.com (impact section and /about), as the site shows them.
const SHOTS = {
  volunteeryatra: { site: 'volunteeryatra.com', period: '2024 — 2025', val: '30,000', lab: 'daily visitors' },
  pilarsai: { site: 'pilars.ai', period: '2024 — 2026', val: '10 days → 2 hours', lab: 'industry workflow' },
  toothlens: { site: 'toothlens.com', period: '2024 — 2025', val: '43% → 93%', lab: 'AI accuracy' },
  agshift: { site: 'agshift.com', period: '2021 — 2024', val: '$3M', lab: 'customer revenue' },
};
const REVIEWS = {
  sachin: { who: 'Sachin Shet', role: 'Founder, building for Indian causes', ini: 'SS', paras: [
    'For two years I tried agency after agency, and <mark>my app never got off the ground</mark>. The idea stayed blurry, and what they built did not feel right to use.',
    'Suraj’s team was different. I did not have to sit with them and explain every workflow. They studied the market, learned who my users were and what problems they had, and built for those users, not only for my list of features. <mark>In 5 days, my blurry idea was clear.</mark> <mark>Within the first month, we launched.</mark>',
    'They did not leave us midway after the launch. <mark>They stayed with us through the early growth, and made sure people adopted the app and it grew.</mark> They helped us get our first users, check that people really wanted the app, plan how to take it to market, and improve it from user feedback.',
    'Their experience stood out most. They have built and launched apps that real users adopt. <mark>They owned the problem as if it was theirs.</mark>'] },
  deep: { who: 'Deep Mehta', role: 'Co-founder, Toothlens', photo: true, paras: [
    'Our accuracy had been stuck for months. We had the data, we had a model, and <mark>no idea what to try next</mark>.',
    'Suraj did not hand us a roadmap. He sat with the team and <mark>made us systematic</mark>: how to define a dataset, when to retrain, how to choose a model and why. Three months later the module went from <mark>43% to 93%</mark>.',
    'Then the calls started coming in: <mark>enterprise deals</mark> we could not have had before.'] },
};

// ---- the words of each page ----
const P = {
  '01-mobile-app-development': {
    title: 'Mobile App Development | ElementalsAI Labs',
    desc: 'Send your app idea. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'Mobile app development',
    falseStart: 'We build mobile apps.', line: 'We build mobile apps your users will', verbs: ['love.', 'use daily.', 'pay for.', 'recommend.'],
    offerSub: 'Send your idea. A rough idea is enough.',
    proof: ['100+ apps delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'mobile apps',
    ideaLabel: 'Your app idea', ideaPh: 'A rough idea is enough. For example: a booking app for my salon.',
    try: { h: 'Type your app idea. <em>Watch it take shape.</em>', lede: 'A first sketch, drawn right here on the phone. Your working demo, built by our team, comes in 3 days.',
      ph: 'e.g. A booking app for my salon', chips: ['Booking app for my salon', 'Food delivery for my restaurant', 'Store for my handmade products', 'Attendance app for my field team'], tag: 'Live demo · a booking app' },
    cases: { h: 'Case studies', lede: 'What apps like these did for these businesses.', list: [
      ['Domino’s · India', 'Ordering app', '51% → 65%', 'of delivery sales ordered online', 'Customers order delivery in the app. Most online orders now come through it.'],
      ['Borosil · India', 'Field sales app', '+36%', 'new shops in 3 months', 'Sales reps take orders on their phones and add new shops. Managers see every visit live.'],
      ['Libas · India', 'Shopping app', '45%', 'of direct sales through the app', 'A new app replaced a weak one. Its rating went from 3.3 to 4.7.'],
      ['Oxygen Yoga & Fitness · Canada', 'Booking app', '62%', 'of all bookings in the app', 'Members book classes and manage their membership in the studio’s own app.']] },
    types: { h: 'Our app library.', noun: 'app', list: ['Booking and appointments', 'Food delivery', 'Online store', 'Grocery delivery', 'Restaurant ordering', 'Salon and spa', 'Doctor consultation', 'Pharmacy orders', 'Fitness and gym', 'Taxi and ride booking', 'Delivery tracking', 'Field team and attendance', 'Home services', 'Service marketplace', 'School and parents', 'Online courses', 'Real estate listings', 'Hotel and travel booking', 'Event tickets', 'Loyalty and rewards', 'Wallet and payments', 'Community and chat', 'Job portal', 'Apartment and society', 'Fleet and vehicle tracking', 'Farm and agriculture', 'Pet care', 'Sales team'] },
    shots: ['volunteeryatra', 'pilarsai', 'toothlens', 'agshift'],
    stats: [['100+', 'apps delivered'], ['10+', 'years building apps'], ['$10M+', 'client revenue enabled'], ['3 days', 'to your working demo']],
    worries: [
      ['It took months, and the launch date kept moving.', '<b>A working demo in 3 days.</b> Then your app, in days, not months.'],
      ['I have an idea, but I can’t explain it in tech terms.', '<b>Bring a rough idea, by voice or in writing.</b> We do the research, the business study and the requirements.'],
      ['We launched it, and nobody uses it.', '<b>Built for the people who will use it.</b> Before we build a screen, we walk it as a first-time user, a regular and an older user.'],
    ],
    steps: [['Tell us your idea', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'Your idea, working on your phone. Tap through it yourself.', '3 days'], ['Build it, or stop', 'Like it? We build the full app. If not, you stop there.', 'Your call']],
    review: 'sachin',
    faq: [
      ['What exactly do I get in 3 days?', 'A working demo of your idea: real screens that you can tap through on your phone. It is not the full app. It shows you that we understood your idea, before you commit.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['I only have a rough idea. Is that enough?', 'Yes. Talk to the orb or type it. We do the research and write the requirements with you.'],
      ['What will the app cost?', 'Every app is different, so we quote yours for free, in 12 hours. We give you a number only after we understand your idea.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the app?', 'Yes. You get the code ownership on completion.'],
      ['Android, iPhone or both?', 'Both. Tell us which phones your customers use.'],
      ['Will you stay after launch?', 'Yes. We support you after launch.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
  '02-app-development': {
    title: 'App Development Company | ElementalsAI Labs',
    desc: 'Send your app idea. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'App development',
    falseStart: 'We build apps.', line: 'We build apps your users will', verbs: ['love.', 'use daily.', 'pay for.', 'recommend.'],
    offerSub: 'Send your idea. A rough idea is enough.',
    proof: ['100+ apps delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'web apps and mobile apps',
    ideaLabel: 'Your app idea', ideaPh: 'A rough idea is enough. For example: an ordering app for my customers, and a dashboard for my team.',
    try: { device: 'webpro', fallback: 'web', demo: 'food', h: 'Type your app idea. <em>Watch it take shape.</em>', lede: 'A first sketch of your web app, drawn right here. Your working demo, built by our team, comes in 3 days.',
      ph: 'e.g. An ordering app for my bakery', chips: ['Ordering app for my bakery', 'Booking system for my clinic', 'Online store for my boutique', 'Portal for my coaching classes'], tag: 'Live demo · an orders dashboard' },
    shots: ['volunteeryatra', 'pilarsai', 'toothlens', 'agshift'],
    stats: [['100+', 'apps delivered'], ['10+', 'years building apps'], ['$10M+', 'client revenue enabled'], ['3 days', 'to your working demo']],
    worries: [
      ['They built what I said, not what I needed.', '<b>We build what you need, not only what you said.</b> We do the research and the business study first.'],
      ['Every new feature costs more and takes longer.', '<b>The next feature stays fast and cheap to add.</b> We plan for it before we build.'],
      ['I paid a big advance before I saw anything work.', '<b>A working demo in 3 days, before the big payments.</b> You see your idea work first.'],
    ],
    steps: [['Tell us your idea', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'Your idea, working. Tap and click through it yourself.', '3 days'], ['Build it, or stop', 'Like it? We build the full app. If not, you stop there.', 'Your call']],
    review: 'sachin',
    faq: [
      ['What exactly do I get in 3 days?', 'A working demo of your idea: real screens that you can tap and click through, on your phone and your computer. It is not the full app. It shows you that we understood your idea, before you commit.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['Web app, mobile app, or both?', 'Both. We build web apps, mobile apps, or one product that works on both. Tell us where your users are.'],
      ['I only have a rough idea. Is that enough?', 'Yes. Talk to the orb or type it. We do the research and write the requirements with you.'],
      ['What will the app cost?', 'Every app is different, so we quote yours for free, in 12 hours. We give you a number only after we understand your idea.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the code?', 'Yes. You get the code ownership on completion.'],
      ['Will you stay after launch?', 'Yes. We support you after launch.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
  '06-ai-development': {
    title: 'AI Development Company | ElementalsAI Labs',
    desc: 'Tell us the task. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'AI development',
    falseStart: 'We build AI.', line: 'We build AI your team will', verbs: ['love.', 'use daily.', 'trust.', 'rely on.'],
    offerSub: 'Tell us the task. A rough idea is enough.',
    proof: ['100+ applications delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'AI inside business products',
    ideaLabel: 'The task', ideaPh: 'A rough idea is enough. For example: matching invoices to orders takes our team hours every week.',
    try: { device: 'aiwork', fallback: 'agent', demo: 'invoices', h: 'Describe a task. <em>Watch the AI take it on.</em>', lede: 'Watch the AI read the work, show what it found and how sure it is, and pass anything unsure to a person. Your working demo, built by our team, comes in 3 days.',
      ph: 'e.g. Match invoices to purchase orders', chips: ['Match invoices to purchase orders', 'Reply to every customer enquiry', 'Check product photos for defects', 'Build the weekly sales report'], tag: 'Live demo · AI reading invoices' },
    shots: ['toothlens', 'agshift', 'pilarsai', 'volunteeryatra'],
    stats: [['$10M+', 'client revenue enabled'], ['100+', 'applications delivered'], ['10+', 'years building software'], ['3 days', 'to your working demo']],
    gambleH: 'Bringing in AI should not feel like <span class="band">a gamble.</span>',
    worriesLede: 'Three worries we hear from almost every team. Here is what changes with us.',
    worries: [
      ['We tried AI. The demo looked good, but nothing changed in our work.', '<b>AI that does real work every day.</b> The working demo grows into the full build. It is not a demo that stops there.'],
      ['We do not know where AI will really help us.', '<b>On day 1, we find the one task where AI proves its value.</b> We start there.'],
      ['The cost keeps going up, and we cannot show the value.', '<b>See the value in 3 days, before the big spend.</b> If it does not prove itself, you stop early.'],
    ],
    steps: [['Tell us the task', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'The AI doing your task, on your real work. Watch every step.', '3 days'], ['Build it, or stop', 'Like it? We build the full solution. If not, you stop there.', 'Your call']],
    review: 'deep',
    faq: [
      ['What exactly do I get in 3 days?', 'The AI doing your one task, on your real work, that you use yourself. It is not the full build. Then you decide: build the full solution, or stop.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['Where will AI help us most?', 'On day 1, we find the one task where AI proves its value. We build that first, so you see the value in 3 days.'],
      ['Is our data safe with the AI?', 'The AI sees only the data it should. We check every part for security before we build.'],
      ['Do I need a requirements document?', 'No. Bring a rough idea, by voice or in writing. We do the research and the requirements.'],
      ['What will it cost?', 'Every task is different, so we quote yours for free, in 12 hours. We give you a number only after we understand the task.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the code?', 'Yes. You get the code ownership on completion.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
  '08-ai-agents-and-automation': {
    title: 'AI Agent Development and Automation | ElementalsAI Labs',
    desc: 'Tell us the task. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'AI agents and automation',
    falseStart: 'We build AI agents.', line: 'We build AI agents your team will', verbs: ['love.', 'trust.', 'rely on.', 'use daily.'],
    offerSub: 'Tell us the task. A rough idea is enough.',
    proof: ['100+ applications delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'AI agents and automation',
    ideaLabel: 'The task', ideaPh: 'A rough idea is enough. For example: every order email is typed into our sheet by hand.',
    try: { device: 'agentflow', fallback: 'agent', demo: 'gst', h: 'Describe a workflow. <em>Watch an agent run it.</em>', lede: 'A first sketch of the agent, step by step: what it reads, decides and does, and when it asks you. Your working demo, built by our team, comes in 3 days.',
      ph: 'e.g. File our monthly GST returns', chips: ['File our monthly GST returns', 'Audit expense claims every week', 'Turn product photos into UGC videos', 'Run our sales pipeline follow-ups'], tag: 'Live demo · a GST filing agent' },
    shots: ['pilarsai', 'toothlens', 'agshift', 'volunteeryatra'],
    stats: [['$10M+', 'client revenue enabled'], ['100+', 'applications delivered'], ['10+', 'years building software'], ['3 days', 'to your working demo']],
    gambleH: 'Handing work to an agent should not feel like <span class="band">a gamble.</span>',
    worriesLede: 'Three worries we hear from almost every team. Here is what changes with us.',
    worries: [
      ['Work moves by hand between our apps, sheets, email and chats.', '<b>We map the work end to end.</b> Then it runs by itself, every case included, also the odd ones.'],
      ['The agent worked in the demo. On our real work, it broke.', '<b>See your agent work on your real work in 3 days,</b> before the big payments.'],
      ['What if the agent pays or sends something twice?', '<b>Nothing is paid or sent twice.</b> Each step is checked for retries. The agent sees only the data it should.'],
    ],
    steps: [['Tell us the task', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'One of your workflows, run by the agent on your real work. Watch every step.', '3 days'], ['Build it, or stop', 'Like it? We build the full solution. If not, you stop there.', 'Your call']],
    review: 'deep',
    faq: [
      ['What exactly do I get in 3 days?', 'One of your workflows, run by the agent on your real work. You watch each step yourself. It is not the full build. Then you decide: build the full solution, or stop.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['What is the difference between an AI agent and an automation?', 'An automation does the same fixed steps every time. An AI agent can also read, decide and act in your tools when a case needs judgment. Many workflows use both. On day 1, we pick what fits your work.'],
      ['Which work can it take over?', 'Work that your team repeats every week. For example: moving data between your apps, sheets, email and chats, or the follow-ups after each order.'],
      ['Can it do something twice, or see data it should not?', 'No. Each step is checked for retries, so nothing is paid or sent twice. The agent sees only the data it should.'],
      ['What will it cost?', 'Every workflow is different, so we quote yours for free, in 12 hours. We give you a number only after we understand the work.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the code?', 'Yes. You get the code ownership on completion.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
  '11-custom-software': {
    title: 'Custom Software Development | ElementalsAI Labs',
    desc: 'Tell us how you work. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'Custom software development',
    falseStart: 'We build software.', line: 'We build software your team will', verbs: ['love.', 'use daily.', 'rely on.', 'trust.'],
    offerSub: 'Tell us how you work. A rough idea is enough.',
    proof: ['100+ applications delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'custom software',
    ideaLabel: 'What should the software do?', ideaPh: 'A rough idea is enough. For example: track every job from enquiry to invoice.',
    try: { device: 'webpro', fallback: 'web', demo: 'jobs', h: 'Describe how you work. <em>Watch it take shape.</em>', lede: 'A first sketch of your software, drawn right here. Your working demo, built by our team, comes in 3 days.',
      ph: 'e.g. Track jobs from enquiry to invoice', chips: ['Track jobs from enquiry to invoice', 'Stock and orders for my warehouse', 'Bookings and billing for my clinic', 'Attendance and leave for my staff'], tag: 'Live demo · a job tracker' },
    cases: { h: 'Case studies', lede: 'What software like this did for these businesses.', list: [
      ['Ralpro · India', 'Production tracking', '180 → 440 tons', 'dispatched a month, within a year', 'One system runs orders, production, quality checks, packing, dispatch and billing.'],
      ['HCG hospitals · India', 'Patient queue system', '60 → 20 min', 'waiting time for a doctor', 'Patients check in at a kiosk and see their place in the queue on their phones.'],
      ['Air Liquide Medical · India', 'Quotes, orders and billing', '7–10 → 1–3 days', 'to prepare a quote', 'An approved quote becomes an order. Invoices and payment reminders go out by themselves.'],
      ['Xtep · sportswear', 'Warehouse and orders', '4 hours → 5 min', 'to process an order', 'One system replaced manual stock and order work, online and in stores.']] },
    types: { h: 'Our software library.', noun: 'software', list: ['CRM', 'ERP', 'Job tracking', 'Inventory and stock', 'Billing and invoicing', 'Quotations and estimates', 'Order management', 'Warehouse management', 'HR and payroll', 'Attendance and leave', 'Clinic management', 'Hospital management', 'School management', 'Restaurant billing (POS)', 'Field service management', 'Project management', 'Helpdesk and tickets', 'Dealer and distributor portal', 'Vendor portal', 'Customer portal', 'Production tracking', 'Fleet management', 'Property management', 'Lab reports', 'Document management', 'Approval workflows', 'Reports and dashboards', 'Tally and accounts link'] },
    shots: ['pilarsai', 'volunteeryatra', 'agshift', 'toothlens'],
    stats: [['100+', 'applications delivered'], ['10+', 'years building software'], ['$10M+', 'client revenue enabled'], ['3 days', 'to your working demo']],
    gambleH: 'Building software should not feel like <span class="band">a gamble.</span>',
    worriesLede: 'Three worries we hear from almost every business. Here is what changes with us.',
    worries: [
      ['Ready-made software does not fit the way we work.', '<b>Built around the way you work,</b> not the other way round. We map your process first.'],
      ['The project is months late, and the price keeps going up.', '<b>A working demo in 3 days.</b> You see it work before the big payments.'],
      ['Every change breaks something else.', '<b>A change in one place does not break another.</b> Before each change, we check everything it touches.'],
    ],
    steps: [['Tell us how you work', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'Your process, working on your screen. Click through it yourself.', '3 days'], ['Build it, or stop', 'Like it? We build the full software. If not, you stop there.', 'Your call']],
    review: 'sachin',
    faq: [
      ['What exactly do I get in 3 days?', 'A working demo of your software: real screens of your own process that you can click through. It is not the full build. It shows you that we understood how you work, before you commit.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['Do I need a requirements document?', 'No. Tell us how you work today, by voice or in writing. We map the process and write the requirements with you.'],
      ['Will it work on phones too?', 'Yes. Every screen is checked on a phone and on a computer.'],
      ['What will it cost?', 'Every business is different, so we quote yours for free, in 12 hours. We give you a number only after we understand how you work.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the code?', 'Yes. You get the code ownership on completion.'],
      ['Will you stay after launch?', 'Yes. We support you after launch.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
  // the home page: the same sections, with all 5 services in place of "Try it"
  'index': {
    home: true,
    title: 'ElementalsAI Labs | Apps, Software and AI Development',
    desc: 'We build mobile apps, web apps, AI and custom software. Free quote in 12 hours. Working demo in 3 days.',
    eyebrow: 'Apps, software and AI',
    falseStart: 'We build apps.', line: 'We build apps and AI your users will', verbs: ['love.', 'use daily.', 'pay for.', 'recommend.'],
    offerSub: 'Send your idea. A rough idea is enough.',
    proof: ['100+ applications delivered', '10+ years', '$10M+ client revenue enabled'],
    service: 'apps, software and AI',
    ideaLabel: 'Your idea', ideaPh: 'A rough idea is enough. For example: a booking app for my clinic.',
    shots: ['volunteeryatra', 'pilarsai', 'toothlens', 'agshift'],
    stats: [['100+', 'applications delivered'], ['10+', 'years building products'], ['$10M+', 'client revenue enabled'], ['3 days', 'to your working demo']],
    gambleH: 'Building software should not feel like <span class="band">a gamble.</span>',
    worries: [
      ['It took months, and the launch date kept moving.', '<b>A working demo in 3 days.</b> You see it work before the big payments.'],
      ['I have an idea, but I can’t explain it in tech terms.', '<b>Bring a rough idea, by voice or in writing.</b> We do the research, the business study and the requirements.'],
      ['We launched it, and nobody uses it.', '<b>Built for the people who will use it.</b> Before we build a screen, we walk it as a first-time user, a regular and an older user.'],
    ],
    steps: [['Tell us your idea', 'Talk to the orb or type. A rough idea is enough.', 'No specs'], ['Get your free quote', 'We reply within 1 hour. Your quote comes in 12 hours.', '12 hours'], ['See your working demo', 'Your idea, working on your screen. Click through it yourself.', '3 days'], ['Build it, or stop', 'Like it? We build the full product. If not, you stop there.', 'Your call']],
    review: 'sachin',
    faq: [
      ['What exactly do I get in 3 days?', 'A working demo of your idea: real screens that you can tap or click through. It is not the full build. It shows you that we understood your idea, before you commit.'],
      ['Is the quote really free?', 'Yes. Send your idea and get your quote in 12 hours. We reply within 1 hour.'],
      ['I only have a rough idea. Is that enough?', 'Yes. Talk to the orb or type it. We do the research and write the requirements with you.'],
      ['What will it cost?', 'Every product is different, so we quote yours for free, in 12 hours. We give you a number only after we understand your idea.'],
      ['When do I pay?', 'Only when you see it built. The payments come in predictable and easy cycles. Full money back if we don’t deliver.'],
      ['Do I own the code?', 'Yes. You get the code ownership on completion.'],
      ['Will you stay after launch?', 'Yes. We support you after launch.'],
    ],
    cta: { h: 'Your idea, <span class="band">working in 3 days.</span>', p: 'Free quote in 12 hours. A rough idea is enough.' },
  },
};

// ---- sections ----
const derisk = `<p class="derisk">${I('shield')}<span><b>Pay only when you see it built.</b> <span class="sep">·</span> Full money back if we don’t deliver.</span></p>`;
const strip = () => { const it = (f) => `<span class="it"${f ? '' : ' aria-hidden="true"'}>${I('phone')}Call <a href="tel:${TEL}"${f ? '' : ' tabindex="-1"'}>${PHONE}</a> or email <a href="mailto:${EMAIL}"${f ? '' : ' tabindex="-1"'}>${EMAIL}</a></span>`; return `<div class="strip" role="note" aria-label="Call or email us"><div class="trk">${Array.from({ length: 12 }, (_, i) => it(i === 0)).join('')}</div></div>`; };
const header = () => `<header class="top"><div class="wrap"><a class="brand" href="index.html" aria-label="ElementalsAI Labs home"><img src="${LOGO}" alt="ElementalsAI Labs" width="208" height="28"></a><nav aria-label="Free quote"><a class="btn primary sm" href="#quote">Get a free quote</a></nav></div><span class="prog" aria-hidden="true"></span></header>`;
/* the hero line, in the page once and shown at first paint; the last word rolls (app.js). The false start is kept in data-false */
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const titleHTML = (p) => `<h1 class="title" data-talk data-verbs='${JSON.stringify(p.verbs).replace(/'/g, '&#39;')}' data-false="${attr(p.falseStart)}"><span class="line">${esc(p.line)} <span class="band"><span class="rot"><span class="w">${esc(p.verbs[0])}</span></span></span><span class="pad"></span></span></h1>`;
// highest range first: it sets the price the buyer expects; the lowest range starts at the lowest project price
const BUDGETS = ['₹8 lakh+', '₹3–8 lakh', '₹1.5–3 lakh', '₹50,000–1.5 lakh'];
const quoteCard = (p) => `<form class="card" id="quote-form" novalidate aria-labelledby="qf-t" data-clarity-mask="True">
  <div class="card-h"><h2 class="eyebrow" id="qf-t">Your free quote</h2><span class="state">Talk or type</span></div>
  <div class="va" data-va data-state="idle">
   <button type="button" class="orb" aria-label="Talk to Diya, our voice agent"><canvas width="236" height="236"></canvas><span class="orb-css"></span></button>
   <div><p class="state" aria-hidden="true"><span class="led"></span><i class="eq"><b></b><b></b><b></b></i><span data-st>Diya</span></p><p class="va-cap" data-cap aria-hidden="true">Hello? Anybody there?</p><button type="button" class="talk" data-talk-btn>${I('stop')}Stop</button><p class="sr" role="status" data-va-live></p></div>
   ${Object.entries(SND).map(([k, src]) => `<audio data-snd="${k}" preload="none" src="${src}"></audio>`).join('')}
  </div>
  <p class="or">Or type it</p>
  <div class="fld"><label for="f-name">Your name</label><div class="box"><input id="f-name" name="name" autocomplete="name"></div></div>
  <div class="fld"><label for="f-idea">${esc(p.ideaLabel)}</label><div class="box"><textarea id="f-idea" name="idea" rows="2" placeholder="${esc(p.ideaPh)}"></textarea></div></div>
  <fieldset class="fld"><legend>Your budget</legend><div class="opts">${BUDGETS.map((b) => `<label class="opt"><input type="radio" name="budget" value="${esc(b)}"><span>${esc(b)}</span></label>`).join('')}</div></fieldset>
  <div class="two"><div class="fld"><label for="f-phone">Phone</label><div class="box"><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div></div><div class="fld"><label for="f-email">Email</label><div class="box"><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email"></div></div></div>
  <div class="hp" aria-hidden="true"><label for="f-web">Website</label><input id="f-web" name="website" tabindex="-1" autocomplete="off"></div>
  <button class="btn primary full beam" type="submit">Get my free quote ${I('arrow')}</button>
  <p class="fnote">${I('clock')}We reply within 1 hour. Your free quote comes in 12 hours.</p>
  ${derisk}
  <p class="status" role="status"></p>
 </form>`;
const hero = (p) => `<section class="hero" id="quote" aria-labelledby="hero-t"><canvas class="field" aria-hidden="true"></canvas><div class="wrap hero-grid">
 <div class="copy">
  <span class="eyebrow rise">${esc(p.eyebrow)}</span>
  ${titleHTML(p).replace('<h1 class="title"', '<h1 class="title" id="hero-t"')}
  <dl class="offer rise" aria-label="Our offer"><div><dt>Free quote</dt><dd><small>in</small>12 hours</dd></div><div><dt>Working demo</dt><dd><small>in</small>3 days</dd></div></dl>
  <p class="offer-sub rise">${esc(p.offerSub)}</p>
  <p class="proofline rise">${p.proof.map((x, i) => (i ? '<span class="dot" aria-hidden="true"></span>' : '') + `<span>${esc(x)}</span>`).join('')}</p>
 </div>
 ${quoteCard(p)}
</div></section>`;
const marquee = () => { const ul = (h) => `<ul${h ? ' aria-hidden="true"' : ''}>${CLIENTS.map((c) => `<li>${c}</li>`).join('')}</ul>`; return `<div class="mq" role="region" aria-label="Clients"><div class="trk">${ul(0)}${ul(1)}${ul(1)}${ul(1)}</div></div>`; };
const DEMO_APP = `<div class="a-hd"><div><small>Good evening</small><strong>Your bookings</strong></div><span class="a-ic">${I('calendar')}</span></div>
 <div class="hc"><div class="hc-t"><small>Next visit</small>${I('calendar')}</div><strong>Today, 6:30 pm</strong><div class="hc-r"><span class="okp">${I('check')}Confirmed</span><span class="rem">${I('bell')}Reminder on</span></div></div>
 <div class="tiles"><span><i>${I('calendar')}</i>Book</span><span class="tp"><i><b class="rs">₹</b></i>Pay<b class="tap"></b></span><span><i>${I('clock')}</i>History</span><span><i>${I('chat')}</i>Help</span></div>
 <div class="lh"><b>Recent</b><small>See all</small></div>
 <div class="rows"><div class="rw new hid"><div class="rw-in"><div class="rw-c"><span class="ri g">${I('check')}</span><div><b>Payment done</b><small>UPI · today</small></div><em>now</em></div></div></div><div class="rw"><div class="rw-in"><div class="rw-c"><span class="ri k">${I('calendar')}</span><div><b>Visit booked</b><small>Today, 6:30 pm</small></div></div></div></div><div class="rw"><div class="rw-in"><div class="rw-c"><span class="ri">${I('doc')}</span><div><b>Invoice sent</b><small>To your email</small></div></div></div></div></div>`;
const phone = () => `<div class="phone" aria-hidden="true"><div class="isl"></div><div class="scr lockon">
 <span class="bar"></span>
 <div class="sb"><b>9:41</b><span class="sbr"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 11.6l2.3-2.7a3.1 3.1 0 0 0-4.6 0z"/><path d="M3.3 6.5a6.7 6.7 0 0 1 9.4 0l-1.5 1.7a4.5 4.5 0 0 0-6.4 0z"/><path d="M.5 3.5a10.8 10.8 0 0 1 15 0l-1.5 1.7a8.6 8.6 0 0 0-12 0z"/></svg><span class="bat"><i></i></span></span></div>
 <div class="lk"><div class="fid">${I('face')}</div><b>Face ID</b><small>Unlocking securely</small></div>
 <div class="app">${DEMO_APP}</div>
 <div class="push"><span class="ri k">${I('bell')}</span><div><b>Reminder</b><small>Your visit is in 1 hour</small></div><em>now</em></div>
 <div class="paid"><span class="okc"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><b>Paid with UPI</b><small>Receipt sent to your email</small><span class="ref">UPI · TODAY</span></div>
 <nav class="tb"><span class="on">${I('home')}</span><span>${I('search')}</span><span>${I('calendar')}</span><span>${I('user')}</span></nav>
</div></div>`;
const webDevice = () => `<div class="web" aria-hidden="true"><div class="wb-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">${I('lock')}<span class="u">orders.app</span></span></div><span class="bar"></span><div class="wb-app"></div><div class="wb-toast">${I('bell')}<span></span></div></div>`;
const agentDevice = () => `<div class="web agentf" aria-hidden="true"><div class="wb-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">${I('lock')}<span class="u">agents.yourbusiness.app</span></span></div><div class="ag"><div class="ag-hd"><div><strong></strong><small></small></div><span class="ag-st"><span class="pill b run"><span class="spin"></span>Running</span><span class="pill g fin">${I('check')}Done</span></span></div><div class="flow"></div><div class="log"><div class="lg"></div></div><div class="ag-ft"><span class="pill g">${I('lock')}<span class="ag-scope"></span></span><span class="cnt">Steps done: <b>0</b> of <i>0</i></span></div></div></div>`;
const tryIt = (p) => { const dv = deviceOf(p); const builtin = ['phone', 'web', 'agent'].includes(dv); return `<section class="sec" id="try" data-try data-device="${dv}" data-demo="${p.try.demo || ''}" aria-labelledby="try-t"><div class="wrap try-grid">
 <div class="try-copy reveal">
  <span class="eyebrow">Try it</span>
  <h2 class="h2" id="try-t">${p.try.h}</h2>
  <p class="lede">${esc(p.try.lede)}</p>
  <div class="idea"><label class="sr" for="idea">${/agent|ai/.test(dv) ? 'Describe a task' : 'Describe your idea'}</label><input id="idea" type="text" autocomplete="off" placeholder="${esc(p.try.ph)}" maxlength="120"><button type="button" class="go" aria-label="Draw my sketch">${I('arrow')}</button></div>
  <div class="chips" aria-label="Or pick an example">${p.try.chips.map((c) => `<button type="button" class="chip" aria-pressed="false" data-idea="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="try-cta"><a class="btn primary" href="#quote">Get this as a working demo ${I('arrow')}</a>${derisk}</div>
 </div>
 <div class="stage${dv !== 'phone' ? ' webst' : ''}">${!builtin ? `<div class="dv-mount dv-${dv}" data-dv="${dv}" aria-hidden="true"></div>` : dv === 'web' ? webDevice() : dv === 'agent' ? agentDevice() : phone()}<p class="sketch-tag"><span class="led"></span><span>${esc(p.try.tag)}</span></p></div>
</div></section>`; };
/* the kinds of apps or software a service page builds; a tap puts the kind in the quote form as the idea */
const types = (p) => !p.types ? '' : `<section class="sec" id="types" aria-labelledby="ty-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="ty-t">${p.types.h}</h2></div>
 <ul class="types reveal">${p.types.list.map((t) => `<li><button type="button" data-quote-idea="${esc(`${t} ${p.types.noun}`)}"><span>${esc(t)}</span>${I('arrow')}</button></li>`).join('')}</ul>
</div></section>`;
/* results other businesses got from software of the same kind; described by business type only */
const cases = (p) => !p.cases ? '' : `<section class="sec" id="cases" aria-labelledby="cs-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="cs-t">${p.cases.h}</h2><p class="lede">${esc(p.cases.lede)}</p></div>
 <div class="cases reveal">${p.cases.list.map(([who, kind, val, lab, t]) => `<article class="case"><p class="cs-who"><b>${esc(who)}</b><span>${esc(kind)}</span></p><p class="val">${esc(val)}</p><p class="lab">${esc(lab)}</p><p class="tx">${esc(t)}</p></article>`).join('')}</div>
</div></section>`;
/* the home page's "What we build": one card for each service page, in the order of the footer */
const SERVICES = [
  ['01-mobile-app-development', 'bell', 'Mobile apps', 'Apps for iPhone and Android that people open every day.', 'Bookings · delivery · stores · field teams'],
  ['02-app-development', 'grid', 'App development', 'Web apps and mobile apps, from your idea to launch.', 'Orders · dashboards · portals'],
  ['06-ai-development', 'spark', 'AI development', 'AI inside your product. It reads, answers and checks, and shows how sure it is.', 'Invoices · customer replies · reports'],
  ['08-ai-agents-and-automation', 'repeat', 'AI agents and automation', 'Agents that do back-office work step by step, and ask you before they act.', 'GST filing · audits · sales follow-ups'],
  ['11-custom-software', 'tool', 'Custom software', 'Software built around how your business works today.', 'Job tracking · stock · billing'],
];
const services = () => `<section class="sec" id="services" aria-labelledby="sv-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">What we build</span><h2 class="h2" id="sv-t">Pick what you need. <em>See a working demo in 3 days.</em></h2><p class="lede">Every service starts the same way: a free quote in 12 hours, then a working demo in 3 days.</p></div>
 <div class="svc reveal">${SERVICES.map(([slug, ic, h, t, ex], i) => `<a class="svc-c" href="${slug}.html"><span class="hd"><span class="ic">${I(ic)}</span><span class="n">0${i + 1}</span></span><h3>${h}</h3><p>${t}</p><small>${ex}</small><span class="go">See this service ${I('arrow')}</span></a>`).join('')}</div>
</div></section>`;
const numParts = (v) => v.split(/(\d[\d,]*(?:\.\d+)?)/).filter(Boolean).map((t) => /^\d/.test(t) ? `<span class="num" data-to="${t.replace(/,/g, '')}"${t.includes(',') ? ' data-grp' : ''} style="--w:${t.length}ch">${t}</span>` : esc(t)).join('');
const impact = (p) => `<section class="sec" id="impact" aria-labelledby="imp-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">Impact</span><h2 class="h2" id="imp-t">Real products. <em>Real numbers.</em></h2><p class="lede">Each one is a live product that our team helped build. One number from each.</p></div>
 <div class="shots">${p.shots.map((k) => { const s = SHOTS[k]; return `<article class="shot"><div class="frame"><img src="${IMG[k]}" alt="The ${esc(s.site)} website" width="800" height="600" loading="lazy" decoding="async"><p class="site"><span>${s.site}</span><span>${s.period}</span></p></div><div class="row"><p class="val">${numParts(s.val)}</p><p class="lab">${esc(s.lab)}</p></div></article>`; }).join('')}</div>
</div></section>`;
const stats = (p) => `<div class="stats" role="region" aria-label="Our track record"><dl>${p.stats.map(([v, l]) => `<div class="cell"><dt><span class="pn" data-pn><span class="pn-text">${esc(v)}</span><canvas class="pn-canvas" aria-hidden="true"></canvas></span></dt><dd>${esc(l)}</dd></div>`).join('')}</dl></div>`;
const gamble = (p) => `<section class="sec" id="worries" aria-labelledby="gb-t"><div class="wrap gamble">
 <div class="sec-h reveal"><span class="eyebrow">Sound familiar?</span><h2 class="h2" id="gb-t">${p.gambleH || 'Building an app should not feel like <span class="band">a gamble.</span>'}</h2><p class="lede">${p.worriesLede || 'Three worries we hear from almost every founder. Here is what changes with us.'}</p></div>
 <div class="worries">${p.worries.map(([q, a]) => `<div class="wr"><span class="lab">What we hear</span><q>${esc(q)}</q><p class="ans"><span class="ok">${I('check')}</span><span>${a}</span></p></div>`).join('')}</div>
</div></section>`;
const how = (p) => `<section class="sec" id="how" aria-labelledby="how-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">How it works</span><h2 class="h2" id="how-t">From rough idea to <em>working demo in 3 days.</em></h2></div>
 <ol class="tl">${p.steps.map(([h, t, tag], i) => `<li class="st${i === 2 ? ' big' : ''}"><span class="node">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(t)}</p><span class="tag">${esc(tag)}</span></li>`).join('')}</ol>
 <div class="how-cta reveal"><a class="btn primary" href="#quote">Get my free quote ${I('arrow')}</a>${derisk}</div>
</div></section>`;
const review = (p) => { const r = REVIEWS[p.review]; return `<section class="sec" id="review" aria-labelledby="rv-t"><div class="wrap">
 <div class="sec-h reveal"><span class="eyebrow">What founders say</span><h2 class="h2" id="rv-t">What founders say about <em>working with us.</em></h2></div>
 <figure class="quote reveal"><blockquote>${r.paras.map((x) => `<p>${x}</p>`).join('')}</blockquote><figcaption class="who">${r.photo ? `<img src="${DEEP}" alt="" width="56" height="56">` : `<span class="ini" aria-hidden="true">${r.ini}</span>`}<span><b>${r.who}</b><small>${r.role}</small></span></figcaption></figure>
</div></section>`; };
const faq = (p) => `<section class="sec" id="faq" aria-labelledby="faq-t"><div class="wrap faq">
 <div class="sec-h reveal"><span class="eyebrow">Questions</span><h2 class="h2" id="faq-t">Your questions, <em>answered.</em></h2><p class="lede">Still unsure? Ask in the form. We reply within 1 hour.</p></div>
 <div class="qa">${p.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}<span class="pm" aria-hidden="true"></span></summary><div class="ans"><p>${esc(a)}</p></div></details>`).join('')}</div>
</div></section>`;
const cta = (p) => `<section class="cta" aria-labelledby="cta-t"><div class="wrap cta-grid">
 <div class="reveal"><span class="eyebrow">Next step</span><h2 class="h2" id="cta-t">${p.cta.h}</h2><p>${esc(p.cta.p)}</p></div>
 <div class="act reveal"><a class="btn primary" href="#quote">Get my free quote ${I('arrow')}</a>${derisk}</div>
</div></section>`;
const footer = (slug) => `<footer class="foot"><div class="wrap">
 <div><a class="brand" href="index.html" aria-label="ElementalsAI Labs home"><img src="${LOGO}" alt="ElementalsAI Labs" width="194" height="26"></a><p>Apps your users will love. Built with passion for great products.</p></div>
 <nav aria-label="Services">${PAGES_ORDER.map(([s, n]) => `<a href="${s}.html"${s === slug ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
 <p class="fine">© 2026 ElementalsAI Labs · <a href="how-it-works.html">How it works</a> · <a href="work.html">Our work</a> · <a href="quote.html">Get a quote</a> · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="contact.html">Contact</a>${PROD ? '' : ' · Draft for review, not the live site'}</p>
</div></footer>`;

function page(slug) {
  const p = P[slug];
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="robots" content="${robots()}">
<meta name="theme-color" content="#0A0A0B">
<!-- ElementalsAI Labs landing page (D-91 design). Built by src/build.mjs; edit the source, not this file. -->
${headExtra()}
<script>document.documentElement.classList.add('js')</script>
${fontPreload()}<style>${CSS}
${devFiles('.css', deviceOf(p))}</style>
</head>
<body>
${SPRITE}
<a class="skip" href="#quote-form">Skip to the quote form</a>
${strip()}
${header()}
<main id="top">
${hero(p)}
${marquee()}
${p.home ? services() : tryIt(p)}
${types(p)}
${cases(p)}
${stats(p)}
${gamble(p)}
${how(p)}
${review(p)}
${impact(p)}
${faq(p)}
${cta(p)}
</main>
${footer(slug)}
<script>window.LABS=${JSON.stringify(labsCfg(p.service))};</script>
${devScripts(deviceOf(p))}
<script>${JS}</script>
</body>
</html>`;
}

// The shared parts, for the site pages (src/site.mjs: privacy, terms, contact and the sitelink pages).
export { CSS, JS, SPRITE, LOGO, attr, fontPreload, IMG, DEEP, PAGES_ORDER, CLIENTS, SHOTS, REVIEWS, P, PHONE, TEL, EMAIL, VOICE_AGENT, PROD, headExtra, labsCfg, robots, esc, I, derisk, strip, header, footer, quoteCard, marquee, impact, stats, how, review, faq, cta, OUT };

// Build only when run directly (node build.mjs), not when another script imports the shared parts.
if (/build\.mjs$/.test(process.argv[1] || '')) {
  const only = process.argv.slice(2);
  for (const slug of Object.keys(P)) {
    if (only.length && !only.includes(slug)) continue;
    const html = page(slug);
    writeFileSync(new URL(slug + '.html', OUT), html);
    console.log(slug + '.html', Math.round(html.length / 1024) + ' KB');
  }
}
