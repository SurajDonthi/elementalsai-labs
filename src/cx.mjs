/* "See what we can build" as real product consoles, one per funnel variant (Suraj, 23 Nov 2026: "a real admin console, not a cartoon";
   scope = the full system; light theme so it reads as a separate real app, not part of the funnel page).
   One window: browser bar, app top bar, sidebar of modules, a dense live view per module. The sidebar plays the tour; a click picks a module.
   Motion is quiet and functional: rows stream in, statuses change, numbers tick, sync lights blink, charts draw.
   Speed: all markup sits in a <template> and is built only when the section comes within 400 px of the screen; only transform and opacity
   animate; everything pauses off screen; reduced motion shows the end state. No images, no libraries.
   Every word and number inside the consoles is Bolt's draft mock data. */
import { esc, ic } from './cx-kit.mjs';
import ecommerce from './cx-ecommerce.mjs';
import healthcare from './cx-healthcare-apps.mjs';
import fintech from './cx-fintech-apps.mjs';
import { aiSection, AI_CSS, AI_JS } from './ai-scan.mjs';
import { wfSection, WF_CSS, WF_JS } from './wf.mjs';
import { phoneSlide, PHONE_CSS, PHONE_JS } from './cx-phone.mjs';

/* product colour per console: each reads as its own product, apart from the amber funnel page */
/* one app = one window; several apps (healthcare, fintech: Suraj, 24 Nov 2026) = a carousel, the ERP first */
const CONSOLES = {
  'ecommerce-apps': [{ ...ecommerce, accent: '#4F46E5' }],
  'healthcare-apps': healthcare,
  'fintech-apps': fintech,
};
const slugOf = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* AI agents and automation: the workflow player from the earlier site, not a console (Suraj, 24 Nov 2026) */
/* AI: scan tiles on real drawings and QA photos, no console (Suraj, 24 Nov 2026) */
export const hasConsole = (slug) => slug === 'automate-work' || slug === 'build-with-ai' || Object.hasOwn(CONSOLES, slug);

export const consoleSection = (slug, heading) => {
  if (slug === 'automate-work') return wfSection(heading);
  if (slug === 'build-with-ai') return aiSection(heading);
  const apps = CONSOLES[slug];
  const win = (app, k) => {
  if (app.phones) return phoneSlide(app, !k);
  const { top: t, mods, accent, tab } = app;
  const body = `<div class="cx-bd">
<nav class="cx-nav" aria-label="Modules">${mods.map((m, i) => `<button type="button" class="cx-ni" data-u="${slugOf(m.n)}" aria-pressed="${i === 0}">${ic(m.i)}<span>${esc(m.n)}</span><i></i></button>`).join('')}</nav>
<div class="cx-main">${mods.map((m, i) => `<section class="cx-vw${i === 0 ? ' on' : ''}" aria-label="${esc(m.n)}"><div class="cx-ph1"><div><h3>${esc(m.n)}</h3><p>${m.sub}</p></div><span class="cx-dt">Today ${ic('down', 'sm')}</span><span class="cx-bt">${m.btn}</span></div>${m.v()}</section>`).join('')}</div></div>`;
  return `<div class="cx${apps.length > 1 && !k ? ' cur' : ''}" data-cx style="--xa:${accent}"${apps.length > 1 ? ` role="group" aria-roledescription="slide" aria-label="${esc(tab)}"` : ''}>
  <div class="cx-chrome" aria-hidden="true"><i></i><i></i><i></i><span class="cx-url">${ic('shield', 'sm')}${t.url}/<b>${slugOf(mods[0].n)}</b></span></div>
  <div class="cx-top"><span class="cx-mk">${ic(t.mark)}</span><b>${t.name}</b><span class="cx-st">${t.scope} ${ic('down', 'sm')}</span>
   <span class="cx-sr">${ic('search', 'sm')}${t.search}</span><span class="cx-sy"><i></i>${t.sync}</span><span class="cx-bl">${ic('bell')}<i>${t.bell}</i></span><span class="cx-av">${t.av}</span></div>
  <div class="cx-mount" aria-busy="true"><template>${body}</template></div>
 </div>`;
  };
  const inner = apps.length === 1 ? win(apps[0], 0) : `<div class="cx-car" aria-roledescription="carousel">
 <div class="cx-tabs">${apps.map((a, i) => `<button type="button" class="cx-tab" style="--xa:${a.accent}" aria-selected="${i === 0}"><span>${ic(a.top.mark)}</span>${esc(a.tab)}</button>`).join('')}
  <span class="cx-arw"><button type="button" data-d="-1" aria-label="Previous app">${ic('arrow', 'sm')}</button><button type="button" data-d="1" aria-label="Next app">${ic('arrow', 'sm')}</button></span></div>
 <div class="cx-vp"><div class="cx-trk">${apps.map(win).join('')}</div></div>
</div>`;
  return `<section class="sec" id="types" aria-labelledby="ty-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="ty-t">${esc(heading)}</h2></div>
 ${inner}
</div></section>`;
};

export const CONSOLE_CSS = String.raw`.cx{--xk:#18181B;--x2:#3F3F46;--xm:#71717A;--xl:#E4E4E7;--xf:#F4F4F5;--xs:#FAFAFA;--xas:color-mix(in srgb,var(--xa) 9%,#fff);
position:relative;margin-top:24px;overflow:hidden;border-radius:14px;background:#fff;color:var(--x2);font:400 12px/1.4 ui-sans-serif,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color-scheme:light;
box-shadow:0 0 0 1px rgba(255,255,255,.14),0 2px 4px rgba(0,0,0,.2),0 50px 100px -40px rgba(0,0,0,.9)}
.cx b,.cx strong{font-weight:600}
.cx-i{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cx-i.sm{width:12px;height:12px}
.cx-chrome{display:flex;align-items:center;gap:7px;height:34px;padding:0 12px;background:#EDEDF0;border-bottom:1px solid #DCDCE0}
.cx-chrome>i{width:10px;height:10px;border-radius:50%;background:#FF5F57}.cx-chrome>i:nth-child(2){background:#FEBC2E}.cx-chrome>i:nth-child(3){background:#28C840}
.cx-url{display:flex;align-items:center;gap:6px;margin:0 auto;min-width:0;max-width:420px;width:60%;padding:4px 10px;border-radius:7px;background:#fff;border:1px solid #DCDCE0;font:400 11px ui-sans-serif,system-ui,sans-serif;color:var(--xm);white-space:nowrap;overflow:hidden}
.cx-url b{font-weight:400;color:var(--xk)}.cx-url .cx-i{color:#16A34A}
.cx-top{display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border-bottom:1px solid var(--xl);background:#fff}
.cx-mk{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;background:var(--xa);color:#fff}.cx-mk .cx-i{width:15px;height:15px}
.cx-top>b{font-size:13px;color:var(--xk);white-space:nowrap}
.cx-st,.cx-dt{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:7px;border:1px solid var(--xl);background:#fff;font-size:11px;font-weight:500;color:var(--x2);white-space:nowrap}
.cx-sr{flex:1;max-width:300px;display:flex;align-items:center;gap:8px;margin-left:6px;padding:6px 10px;border-radius:7px;background:var(--xf);border:1px solid var(--xl);font-size:11px;color:var(--xm);white-space:nowrap;overflow:hidden}
.cx-sy{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:var(--x2);white-space:nowrap}
.cx-sy i,.cx-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#16A34A;box-shadow:0 0 0 3px rgba(22,163,74,.15)}
.cx-live{margin-right:7px;vertical-align:1px}
.cx-bl{position:relative;color:var(--x2)}.cx-bl i{position:absolute;top:-5px;right:-7px;min-width:14px;height:14px;border-radius:7px;background:#DC2626;color:#fff;font:700 9px/14px ui-sans-serif,system-ui,sans-serif;text-align:center;font-style:normal}
.cx-av{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--xas);font-size:11px;font-weight:600;color:var(--xa)}
.cx-mount{height:620px;background:#fff}
.cx-mount[aria-busy]{background:linear-gradient(100deg,transparent 30%,rgba(0,0,0,.03) 50%,transparent 70%) 0 0/200% 100%}
.cx-bd{display:grid;grid-template-columns:206px 1fr;height:100%}
.cx-nav{position:relative;display:flex;flex-direction:column;gap:1px;padding:10px 8px;border-right:1px solid var(--xl);background:var(--xs);overflow-y:auto;scrollbar-width:none}
.cx-nav::-webkit-scrollbar{display:none}
.cx-ni{position:relative;flex:none;display:flex;align-items:center;gap:9px;padding:6px 9px;border:0;border-radius:7px;background:none;color:var(--x2);font:500 12px ui-sans-serif,system-ui,"Segoe UI",sans-serif;text-align:left;cursor:pointer;overflow:hidden;transition:background var(--t1),color var(--t1)}
.cx-ni .cx-i{width:15px;height:15px;color:var(--xm)}
.cx-ni:hover{background:var(--xf);color:var(--xk)}
.cx-ni:focus-visible{outline:2px solid var(--xa);outline-offset:-2px}
.cx-ni[aria-pressed=true]{background:var(--xas);color:var(--xa)}
.cx-ni[aria-pressed=true] .cx-i{color:var(--xa)}
.cx-ni>i{position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--xa);transform:scaleX(0);transform-origin:left;opacity:.55}
.cx-main{position:relative;min-width:0;overflow:hidden;background:#fff}
.cx-vw{display:none;flex-direction:column;gap:12px;height:100%;padding:16px 18px;box-sizing:border-box;overflow:hidden;contain:layout paint}
.cx-vw.on{display:flex}
.cx-ph1{display:flex;align-items:center;gap:10px}
.cx-ph1>div{flex:1;min-width:0}
.cx-ph1 h3{margin:0;font-size:16px;font-weight:600;color:var(--xk);letter-spacing:-.01em}
.cx-ph1 p{margin:2px 0 0;font-size:11.5px;color:var(--xm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-bt{padding:6px 12px;border-radius:7px;background:var(--xa);color:#fff;font-size:11.5px;font-weight:600;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.cx-kp{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.cx-k{display:grid;gap:2px;padding:10px 12px;border-radius:9px;background:#fff;border:1px solid var(--xl);min-width:0;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cx-k span{font-size:10.5px;font-weight:500;color:var(--xm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-k b{font-size:18px;color:var(--xk);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.cx-k small{font-size:10.5px;color:var(--xm)}
.cx-n{font-variant-numeric:tabular-nums}
.cx-tb{display:grid;border:1px solid var(--xl);border-radius:9px;overflow:hidden;background:#fff}
.cx-tr{display:grid;grid-template-columns:var(--g);align-items:center;gap:10px;padding:0 12px;min-height:33px;border-top:1px solid var(--xf);font-size:11.5px;color:var(--x2)}
.cx-tr>span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-tr>span:first-child{color:var(--xk);font-weight:500}
.cx-tr b{color:var(--xk);font-variant-numeric:tabular-nums}
.cx-tr.th{min-height:30px;border-top:0;background:var(--xs);border-bottom:1px solid var(--xl);font-size:10.5px;font-weight:500;color:var(--xm)}
.cx-tr.th>span:first-child{color:var(--xm)}
.cx-tr.hl{background:var(--xas);box-shadow:inset 2px 0 0 var(--xa)}
.cx-c{display:inline-flex;align-items:center;gap:5px;padding:1px 8px;border-radius:99px;font-size:10.5px;font-weight:500;font-style:normal;white-space:nowrap;border:1px solid}
.cx-c.ok{color:#067647;background:#ECFDF3;border-color:#ABEFC6}
.cx-c.w{color:#B54708;background:#FFFAEB;border-color:#FEDF89}
.cx-c.m{color:#52525B;background:var(--xf);border-color:var(--xl)}
.cx-c.bad{color:#B42318;background:#FEF3F2;border-color:#FECDCA}
.cx-c.a{color:var(--xa);background:var(--xas);border-color:color-mix(in srgb,var(--xa) 30%,#fff)}
.cx-sw{display:inline-grid}.cx-sw>em{grid-area:1/1}.cx-sw .o{opacity:0}
.cx-spin{width:9px;height:9px;border-radius:50%;border:1.5px solid rgba(181,71,8,.25);border-top-color:#B54708}
.cx-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cx-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.cx-cd{display:flex;flex-direction:column;gap:7px;padding:12px;border-radius:9px;background:#fff;border:1px solid var(--xl);min-width:0;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cx-cd .cx-tb{border-radius:7px}
.cx-ct{display:flex;align-items:center;gap:6px;margin:0;font-size:12px;font-weight:600;color:var(--xk)}
.cx-kv{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0;font-size:11.5px;color:var(--xm)}
.cx-kv b{color:var(--xk);font-variant-numeric:tabular-nums}
.cx-cap{margin:0;font-size:11.5px;color:var(--xm)}
.cx-bar{display:block;flex:1;height:6px;border-radius:9px;background:var(--xf);overflow:hidden}
.cx-bar>i{display:block;height:100%;border-radius:9px;background:var(--xa);transform:scaleX(var(--w));transform-origin:left}
.cx-bar.g>i{background:#A1A1AA}
.cx-ab{display:grid;grid-template-columns:18px 1fr 40px;align-items:center;gap:10px;font-size:11px;font-weight:600;color:var(--xk)}
.cx-ab.wide{grid-template-columns:var(--lw,96px) 1fr 40px;font-weight:400;font-size:11.5px;color:var(--x2)}
.cx-ab.wide span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-ab b{text-align:right;font-variant-numeric:tabular-nums}
.cx-bs{display:grid;gap:8px}
.cx-split{display:flex;gap:3px;height:8px}
.cx-split i{flex:var(--w);border-radius:3px;background:var(--xa);transform-origin:left}
.cx-split i:nth-child(2){background:color-mix(in srgb,var(--xa) 65%,#fff)}.cx-split i:nth-child(3){background:color-mix(in srgb,var(--xa) 40%,#fff)}.cx-split i:nth-child(4){background:#D4D4D8}.cx-split i:nth-child(5){background:#E4E4E7}
.cx-lg{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0;font-size:10.5px;color:var(--xm)}
.cx-rl{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0;padding:6px 0;border-top:1px solid var(--xf);font-size:11.5px;color:var(--x2)}
.cx-ct+.cx-rl{border-top:0}
.cx-tg{position:relative;flex:none;width:26px;height:15px;border-radius:9px;background:#16A34A}
.cx-tg:after{content:"";position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transform:translateX(11px)}
.cx-big{margin:0;font-size:26px;font-weight:600;color:var(--xa);font-variant-numeric:tabular-nums}
.cx-big b{font:inherit;color:inherit}
.cx-ph{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cx-ph i{aspect-ratio:4/3;border-radius:6px;border:1px solid var(--xl);background:radial-gradient(45% 40% at 50% 58%,#D4D4D8,transparent 70%),linear-gradient(#F4F4F5,#E9E9EC)}
.cx-trk{display:flex;justify-content:space-between;margin:0;padding:0;list-style:none;font-size:10.5px;color:var(--xm)}
.cx-trk li.d{color:var(--x2)}.cx-trk li.a{color:var(--xa);font-weight:600}
.cx-flow{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.cx-flow li{display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;background:var(--xs);border:1px solid var(--xl);font-size:11px;color:var(--x2)}
.cx-flow li+li:before{content:"→";margin-right:2px;color:var(--xm)}
.cx-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cx-tl{display:grid;gap:6px;margin:0;padding:0;list-style:none}
.cx-tl li{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--x2)}
.cx-tl li:before{content:"";flex:none;width:6px;height:6px;border-radius:50%;background:var(--xa)}
.cx-chart svg{width:100%;height:110px;display:block}
.cx-chart .gr{stroke:var(--xf);stroke-width:1;vector-effect:non-scaling-stroke;fill:none}
.cx-chart .ar{fill:var(--xas)}
.cx-chart .ln{fill:none;stroke:var(--xa);stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-dasharray:1}
.cx-ch{display:grid;gap:6px}
.cx-nd{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;border:1px solid var(--xl);background:#fff;position:relative}
.cx-nd+.cx-nd:before{content:"";position:absolute;left:23px;top:-7px;width:2px;height:6px;background:var(--xl)}
.cx-nd small{font-size:10px;color:var(--xm)}.cx-nd p{margin:0;font-size:11.5px;color:var(--xk);font-weight:500}
.cx-ni2{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:var(--xas);color:var(--xa)}
.cx-cv{position:relative;aspect-ratio:16/8;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#E9E9EC,#D9D9DE);border:1px solid var(--xl)}
.cx-cvl{position:absolute;left:8px;top:6px;z-index:2;display:flex;align-items:center;padding:2px 7px;border-radius:5px;background:rgba(255,255,255,.85);font-size:10.5px;font-weight:500;color:var(--xk)}
.cx-part{position:absolute;left:22%;top:22%;width:56%;height:60%;border-radius:40% 40% 30% 30%;background:radial-gradient(60% 50% at 40% 35%,#F4F4F5,#BDBDC4)}
.cx-bx{position:absolute;border:2px solid var(--xa);border-radius:3px}
.cx-bx em{position:absolute;left:-2px;bottom:100%;padding:1px 5px;border-radius:3px 3px 0 0;background:var(--xa);color:#fff;font-size:9.5px;font-style:normal;white-space:nowrap}
.cx-scan{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--xa),transparent);opacity:0}
.cx-gr{display:flex;align-items:center;gap:8px;overflow:hidden}
.cx-gc{display:grid;gap:6px;flex:1;min-width:0}
.cx-gn{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;border:1px solid var(--xl);background:#fff;font-size:11px;font-weight:500;color:var(--x2);white-space:nowrap;overflow:hidden;position:relative}
.cx-gn .cx-i{width:13px;height:13px;color:var(--xm)}
.cx-gn.h{border-style:dashed}
.cx-gn>i{position:absolute;inset:0;background:var(--xas);border-radius:6px;z-index:0;opacity:0}
.cx-gn>*:not(i){position:relative;z-index:1}
.cx-ga{flex:none;color:#C4C4CC}
.cx-gn.dn{border-color:color-mix(in srgb,var(--xa) 45%,#fff)}
.cx-ask{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;background:#FFFAEB;border:1px solid #FEDF89}
.cx-ask p{flex:1;margin:0;font-size:11.5px;color:#7A2E0E}.cx-ask p b{display:block;color:#3F1D06}
@media (max-width:899px){.cx-sr,.cx-st{display:none}.cx-bd{grid-template-columns:1fr;grid-template-rows:auto 1fr}.cx-nav{flex-direction:row;overflow-x:auto;overflow-y:hidden;border-right:0;border-bottom:1px solid var(--xl);padding:8px}.cx-ni{white-space:nowrap}.cx-mount{height:680px}.cx-3{grid-template-columns:1fr 1fr}}
@media (max-width:599px){.cx-sy,.cx-bl,.cx-dt{display:none}.cx-hm{display:none}.cx-kp{grid-template-columns:1fr 1fr}.cx-2,.cx-3{grid-template-columns:1fr}.cx-seg{grid-template-columns:1fr 1fr}.cx-mount{height:820px}.cx-vw{padding:12px}.cx-url{width:auto;flex:1}}
@media (prefers-reduced-motion:no-preference){
.cx.run .cx-ni[aria-pressed=true]>i{animation:cx-fill 7s linear both}
.cx-mount:hover .cx-ni>i,.cx:not(.vis) *{animation-play-state:paused!important}
.cx-mount[aria-busy]{animation:cx-mv 1.4s linear infinite}
.cx-sy i,.cx-live{animation:cx-blink 1.8s ease-in-out infinite}
.cx-vw.on .r{animation:cx-in .5s var(--out) var(--d,0s) both}
.cx-vw.on .nw{animation:cx-in .5s var(--out) var(--d) both,cx-hl 2.4s ease-out var(--d) both}
.cx-vw.on .cx-sw .o{animation:cx-o .25s ease-out var(--t) both}
.cx-vw.on .cx-sw .n{animation:cx-n .35s var(--out) var(--t) both}
.cx-vw.on .cx-lt{animation:cx-n .4s var(--out) var(--d) both;display:inline-block}
.cx-vw.on .cx-bar>i{animation:cx-bar 1.4s var(--out) var(--d,0s) both}
.cx-vw.on .cx-split i{animation:cx-bar 1s var(--out) .5s both}
.cx-vw.on .cx-spin{animation:cx-rot .8s linear infinite}
.cx-vw.on .cx-tg{animation:cx-tgb .3s ease-out var(--t) both}
.cx-vw.on .cx-tg:after{animation:cx-tgk .3s var(--out) var(--t) both}
.cx-vw.on .cx-ph i,.cx-vw.on .cx-flow li,.cx-vw.on .cx-tl li{animation:cx-in .45s var(--out) var(--d) both}
.cx-vw.on .cx-chart .ln{animation:cx-draw 1.8s ease-in-out .4s both}
.cx-vw.on .cx-chart .ar{animation:cx-fade 1s ease-out 1.6s both}
.cx-vw.on .cx-bx{animation:cx-n .35s var(--out) var(--d) both}
.cx-vw.on .cx-scan{animation:cx-scan 2.6s ease-in-out .3s infinite}
.cx-vw.on .cx-gn{animation:cx-in .4s var(--out) var(--d) both}
.cx-vw.on .cx-gn>i{animation:cx-lit 1.4s ease-out var(--t) both}}
@keyframes cx-fill{to{transform:scaleX(1)}}
@keyframes cx-mv{to{background-position:-200% 0}}
@keyframes cx-blink{50%{opacity:.4}}
@keyframes cx-in{from{opacity:0;transform:translateY(6px)}}
@keyframes cx-hl{0%{background:var(--xas)}to{background:transparent}}
@keyframes cx-o{from{opacity:1}to{opacity:0}}
@keyframes cx-n{from{opacity:0;transform:scale(.9)}}
@keyframes cx-bar{from{transform:scaleX(0)}}
@keyframes cx-rot{to{transform:rotate(360deg)}}
@keyframes cx-tgb{from{background:#D4D4D8}}
@keyframes cx-tgk{from{transform:none}}
@keyframes cx-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes cx-fade{from{opacity:0}}
@keyframes cx-scan{0%{opacity:0;transform:translateY(0)}10%{opacity:.9}90%{opacity:.9}to{opacity:0;transform:translateY(260px)}}
@keyframes cx-lit{0%{opacity:0}30%{opacity:1}to{opacity:.55}}
.cx-car{margin-top:24px}
.cx-tabs{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.cx-tab{display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:rgba(255,255,255,.72);font:500 13px ui-sans-serif,system-ui,"Segoe UI",sans-serif;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.cx-tab>span{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--xa);color:#fff}.cx-tab .cx-i{width:13px;height:13px}
.cx-tab:hover{color:#fff;border-color:rgba(255,255,255,.3)}
.cx-tab[aria-selected=true]{background:#fff;color:#18181B;border-color:#fff}
.cx-tab:focus-visible,.cx-arw button:focus-visible{outline:2px solid #fff;outline-offset:2px}
.cx-arw{display:flex;gap:6px;margin-left:auto}
.cx-arw button{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.04);color:#fff;cursor:pointer}
.cx-arw button:first-child .cx-i{transform:rotate(180deg)}
.cx-arw button:hover{background:rgba(255,255,255,.12)}
.cx-vp{overflow:hidden;margin:14px 0 -70px;padding:4px 0 70px}
.cx-trk{display:flex;gap:16px;transform:translateX(calc(var(--k,0)*(-92% - 16px)));transition:transform .55s cubic-bezier(.3,.7,.2,1)}
.cx-trk>.cx{flex:0 0 92%;margin-top:0;transition:opacity .4s}
.cx-trk>.cx:not(.cur){opacity:.4;cursor:pointer}
@media (max-width:599px){.cx-trk{transform:translateX(calc(var(--k,0)*(-100% - 16px)))}.cx-trk>.cx{flex-basis:100%}.cx-tab{font-size:12px}}
@media (prefers-reduced-motion:reduce){.cx-trk,.cx-trk>.cx{transition:none}}` + PHONE_CSS + WF_CSS + AI_CSS;

/* the player: builds the console when it comes within 400 px of the screen; the active module's sidebar bar runs 7 s, then the next module opens;
   a click opens a module; hover pauses; off screen pauses; numbers count with requestAnimationFrame; the address bar follows the module */
export const CONSOLE_JS = String.raw`(function(d,W){var rm=W.matchMedia('(prefers-reduced-motion: reduce)').matches,IO=W.IntersectionObserver,
F={n:function(v){return Math.round(v).toLocaleString('en-IN')},inr:function(v){return '₹'+Math.round(v).toLocaleString('en-IN')},l:function(v){return '₹'+v.toFixed(1)+'L'},cr:function(v){return '₹'+v.toFixed(1)+' Cr'},p:function(v){return v.toFixed(1)+'%'},x:function(v){return v.toFixed(1)+'x'},ms:function(v){return Math.round(v)+' ms'},d1:function(v){return v.toFixed(1)}};
[].forEach.call(d.querySelectorAll('[data-cx]'),function(r){var m=r.querySelector('.cx-mount'),u=r.querySelector('.cx-url b'),nav,ni,vw,k=0,T=[],built=0;
function pad(x){return(x<10?'0':'')+x}
function go(n){k=n;T.forEach(function(t){clearTimeout(t);clearInterval(t)});T=[];
ni.forEach(function(x,i){x.setAttribute('aria-pressed',String(i===n))});vw.forEach(function(x,i){x.classList.toggle('on',i===n)});
if(u)u.textContent=ni[n].getAttribute('data-u');
var b=ni[n];if(nav.scrollHeight>nav.clientHeight)nav.scrollTop=b.offsetTop-nav.clientHeight/2;else if(nav.scrollWidth>nav.clientWidth)nav.scrollLeft=b.offsetLeft-nav.clientWidth/2;
if(rm)return;
[].forEach.call(vw[n].querySelectorAll('[data-n]'),function(el){var a=el.getAttribute('data-n').split(','),f=F[a[3]]||F.n,x=+a[0],y=+a[1],ms=+a[2];el.textContent=f(x);
T.push(setTimeout(function(){var t0=0;requestAnimationFrame(function s(t){if(k!==n)return;t0=t0||t;var p=Math.min(1,(t-t0)/ms);p=1-Math.pow(1-p,3);el.textContent=f(x+(y-x)*p);if(p<1)requestAnimationFrame(s)})},(+el.getAttribute('data-at')||0)*1000))});
var cd=vw[n].querySelector('.js-cd');if(cd){var s=134;cd.textContent='02:14';T.push(setInterval(function(){s=Math.max(0,s-1);cd.textContent=pad(s/60|0)+':'+pad(s%60)},1000))}}
function build(){if(built)return;built=1;m.appendChild(m.querySelector('template').content.cloneNode(true));m.removeAttribute('aria-busy');
nav=m.querySelector('.cx-nav');ni=[].slice.call(m.querySelectorAll('.cx-ni'));vw=[].slice.call(m.querySelectorAll('.cx-vw'));
ni.forEach(function(x,i){x.addEventListener('click',function(){go(i)});x.querySelector('i').addEventListener('animationend',function(){if(i===k)go((k+1)%ni.length)})});go(0)}
if(!IO){build();r.classList.add('run','vis');return}
new IO(function(e,o){if(e[0].isIntersecting){build();o.disconnect()}},{rootMargin:'400px 0px'}).observe(r);
new IO(function(e){var v=e[0].isIntersecting;if(v){build();r.classList.add('run')}r.classList.toggle('vis',v)},{threshold:.2}).observe(r)});
/* carousel of apps: tabs and arrows pick an app; a click on the dimmed next or previous app opens it; a swipe on its bars too */
[].forEach.call(d.querySelectorAll('.cx-car'),function(c){var t=c.querySelector('.cx-trk'),s=[].slice.call(t.children),b=[].slice.call(c.querySelectorAll('.cx-tab')),k=0,x0=null;
function go(n){k=(n+s.length)%s.length;t.style.setProperty('--k',k);s.forEach(function(x,i){x.classList.toggle('cur',i===k);if(i===k)x.removeAttribute('inert');else x.setAttribute('inert','')});b.forEach(function(x,i){x.setAttribute('aria-selected',String(i===k))})}
b.forEach(function(x,i){x.addEventListener('click',function(){go(i)})});
[].forEach.call(c.querySelectorAll('.cx-arw button'),function(x){x.addEventListener('click',function(){go(k+(+x.getAttribute('data-d')))})});
c.querySelector('.cx-vp').addEventListener('click',function(e){if(s[k].contains(e.target))return;var r=s[k].getBoundingClientRect();if(e.clientX>r.right)go(k+1);else if(e.clientX<r.left)go(k-1)});
t.addEventListener('touchstart',function(e){x0=e.target.closest('.cx-chrome,.cx-top,.cx-phd,.cx-pf')?e.touches[0].clientX:null},{passive:true});
t.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(k+(dx<0?1:-1));x0=null},{passive:true});
go(0)})})(document,window);` + PHONE_JS + WF_JS + AI_JS;
