/* Consumer app slides: three phone screens of one app, for the fintech and healthcare carousels
   (Suraj, 24 Nov 2026: "why does everything have to be a console!! ... A lot of people want fintech consumer apps!" and "Likewise with the healthcare thing").
   Light, no images. Motion uses the console classes: rows come in (.r), status chips switch (sw), bars fill, a tick and a line draw.
   Every word and number is Bolt's draft mock data. */
import { esc, ic, chip, sw, spin, bar } from './cx-kit.mjs';

const d = (x) => `style="--d:${x}s"`;
export const P = {
  // a title row: page name, small line, avatar letter
  head: (t, s = '', av = 'P') => `<div class="cx-pt"><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div><span class="cx-pav">${av}</span></div>`,
  // a coloured card: label, big value, small line
  hero: (l, v, s = '', at = 0.1) => `<div class="cx-pbal r" ${d(at)}><small>${l}</small><b>${v}</b>${s ? `<span>${s}</span>` : ''}</div>`,
  // 4 round quick actions
  acts: (list, at = 0.25) => `<div class="cx-pqa r" ${d(at)}>${list.map(([i, t]) => `<span>${ic(i)}<small>${t}</small></span>`).join('')}</div>`,
  // a list row: initials, name, small line, right side
  row: (av, t, s, r, at) => `<div class="cx-pli r" ${d(at)}><span class="cx-pin">${av}</span><div><b>${t}</b><small>${s}</small></div>${r}</div>`,
  rows: (list, at = 0.4) => list.map((x, i) => P.row(...x, at + i * 0.12)).join(''),
  sec: (t) => `<p class="cx-psec">${t}</p>`,
  kv: (k, v, at) => `<p class="cx-pkv r" ${d(at)}><span>${k}</span>${v}</p>`,
  btn: (t, at = 1) => `<span class="cx-pbtn r" ${d(at)}>${t}</span>`,
  chips: (list, on = 0, at = 0.5) => `<div class="cx-pch r" ${d(at)}>${list.map((t, i) => `<span${i === on ? ' class="on"' : ''}>${t}</span>`).join('')}</div>`,
  bar: (w, at = 0.5) => `<div class="r" ${d(at)}>${bar(w, at + 0.2)}</div>`,
  tick: (big, s, at = 0.2) => `<div class="cx-pok r" ${d(at)}><span>${ic('check')}</span><b>${big}</b><small>${s}</small></div>`,
  line: (vals, at = 0.4) => { const mx = Math.max(...vals), mn = Math.min(...vals), pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 200},${56 - ((v - mn) / (mx - mn || 1)) * 50}`).join(' ');
    return `<svg class="cx-spk r" ${d(at)} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><polyline class="ln" pathLength="1" points="${pts}"/></svg>`; },
  card: (body, at = 0.3) => `<div class="cx-pcd r" ${d(at)}>${body}</div>`,
  video: (big, small, at = 0.2) => `<div class="cx-pvid r" ${d(at)}><span class="cx-pbig">${big}</span><span class="cx-psm">${small}</span><span class="cx-ptm"><i class="cx-live"></i><b class="js-cd">02:14</b></span><span class="cx-pctl"><i>${ic('mic', 'sm')}</i><i>${ic('video', 'sm')}</i><i class="end">${ic('phone', 'sm')}</i></span></div>`,
};
export { chip, sw, spin };

const phone = ({ cap, body }) => `<figure class="cx-pf"><div class="cx-pscr"><div class="cx-psb"><b>9:41</b><span><i></i><i></i><i></i></span></div><div class="cx-vw cx-psc">${body}</div></div><figcaption>${cap}</figcaption></figure>`;

export const phoneSlide = (app, cur) => `<div class="cx cx-ps${cur ? ' cur' : ''}" style="--xa:${app.accent}" role="group" aria-roledescription="slide" aria-label="${esc(app.tab)}">
 <div class="cx-phd"><span class="cx-mk">${ic(app.top.mark)}</span><div><b>${app.top.name}</b><small>${app.top.line}</small></div><span class="cx-pst">${ic('phone', 'sm')}iOS and Android</span></div>
 <div class="cx-prw">${app.phones.map(phone).join('')}</div>
</div>`;

export const PHONE_CSS = String.raw`
.cx-ps{display:flex;flex-direction:column;background:linear-gradient(180deg,var(--xas),#fff 70%)}
.cx-phd{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--xl);background:#fff}
.cx-phd>div{flex:1;min-width:0}.cx-phd b{display:block;font-size:14px;color:var(--xk)}.cx-phd small{font-size:11.5px;color:var(--xm)}
.cx-pst{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:99px;border:1px solid var(--xl);font-size:11px;font-weight:500;white-space:nowrap}
.cx-prw{display:flex;justify-content:center;gap:34px;padding:26px 20px 22px;overflow-x:auto;scrollbar-width:none;height:620px;box-sizing:border-box}
.cx-prw::-webkit-scrollbar{display:none}
.cx-pf{flex:none;margin:0;display:flex;flex-direction:column;align-items:center;gap:12px}
.cx-pf figcaption{font-size:12px;font-weight:500;color:var(--x2)}
.cx-pscr{position:relative;width:236px;height:500px;box-sizing:border-box;border-radius:38px;background:#fff;border:7px solid #18181B;box-shadow:0 0 0 1px #3F3F46,0 30px 60px -24px rgba(0,0,0,.35);overflow:hidden;display:flex;flex-direction:column}
.cx-pscr:before{content:"";position:absolute;top:7px;left:50%;width:70px;height:20px;margin-left:-35px;border-radius:12px;background:#18181B;z-index:2}
.cx-psb{display:flex;justify-content:space-between;align-items:center;height:34px;padding:0 20px;flex:none;font-size:11px;color:var(--xk)}
.cx-psb span{display:flex;gap:3px;align-items:flex-end}.cx-psb i{width:3px;border-radius:1px;background:var(--xk)}.cx-psb i:nth-child(1){height:5px}.cx-psb i:nth-child(2){height:7px}.cx-psb i:nth-child(3){height:9px}
.cx-vw.cx-psc{display:flex;flex:1;gap:9px;padding:6px 14px 14px;height:auto;overflow:hidden;font-size:11.5px}
.cx-pt{display:flex;align-items:center;gap:8px}.cx-pt>div{flex:1;min-width:0}.cx-pt b{display:block;font-size:15px;color:var(--xk)}.cx-pt small{font-size:10.5px;color:var(--xm)}
.cx-pav{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--xas);color:var(--xa);font-weight:600;font-size:11px}
.cx-pbal{display:grid;gap:2px;padding:13px 14px;border-radius:16px;background:linear-gradient(135deg,var(--xa),color-mix(in srgb,var(--xa) 65%,#000));color:#fff}
.cx-pbal small{font-size:10.5px;opacity:.8}.cx-pbal b{font-size:21px;letter-spacing:-.01em;font-variant-numeric:tabular-nums}.cx-pbal span{font-size:10.5px;opacity:.85}
.cx-pqa{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.cx-pqa span{display:grid;justify-items:center;gap:4px}.cx-pqa .cx-i{width:36px;height:36px;padding:9px;box-sizing:border-box;border-radius:12px;background:var(--xas);color:var(--xa)}
.cx-pqa small{font-size:9.5px;color:var(--x2)}
.cx-psec{margin:4px 0 -2px;font-size:10.5px;font-weight:600;color:var(--xm);text-transform:uppercase;letter-spacing:.04em}
.cx-pli{display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1px solid var(--xf)}
.cx-pli>div{flex:1;min-width:0}.cx-pli b{display:block;font-size:11.5px;color:var(--xk);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cx-pli small{display:block;font-size:10px;color:var(--xm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-pli>b,.cx-pli>span:last-child{flex:none;font-size:11.5px;font-weight:600;color:var(--xk)}
.cx-pli>div.r{flex:0 0 58px}.cx-pli .up{color:#067647}.cx-pli .dn{color:#B42318}
.cx-pin{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:50%;background:var(--xf);font-size:10.5px;font-weight:600;color:var(--x2)}
.cx-pkv{display:flex;justify-content:space-between;gap:8px;margin:0;padding:6px 0;border-bottom:1px solid var(--xf);font-size:11.5px}.cx-pkv span{color:var(--xm)}.cx-pkv b{color:var(--xk)}
.cx-pbtn{display:block;margin-top:auto;padding:11px;border-radius:13px;background:var(--xa);color:#fff;text-align:center;font-weight:600;font-size:12.5px}
.cx-pch{display:flex;gap:6px;flex-wrap:wrap}.cx-pch span{padding:5px 10px;border-radius:99px;border:1px solid var(--xl);font-size:10.5px;font-weight:500}.cx-pch .on{background:var(--xa);border-color:var(--xa);color:#fff}
.cx-pok{display:grid;justify-items:center;gap:4px;padding:18px 0 8px;text-align:center}
.cx-pok span{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#16A34A;color:#fff;box-shadow:0 0 0 8px #DCFCE7}.cx-pok .cx-i{width:28px;height:28px;stroke-width:2.6}
.cx-pok b{margin-top:10px;font-size:22px;color:var(--xk)}.cx-pok small{font-size:11px;color:var(--xm)}
.cx-pcd{padding:10px 12px;border-radius:13px;border:1px solid var(--xl);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cx-spk{display:block;width:100%;height:60px}.cx-spk .ln{fill:none;stroke:var(--xa);stroke-width:2.2;stroke-dasharray:1;vector-effect:non-scaling-stroke}
.cx-pvid{position:relative;flex:1;min-height:250px;border-radius:16px;background:linear-gradient(160deg,#334155,#0F172A);overflow:hidden}
.cx-pbig{position:absolute;inset:0;display:grid;place-items:center;font-size:34px;font-weight:600;color:rgba(255,255,255,.85)}
.cx-psm{position:absolute;right:10px;top:10px;display:grid;place-items:center;width:62px;height:86px;border-radius:10px;background:#64748B;color:#fff;font-weight:600;border:2px solid rgba(255,255,255,.6)}
.cx-ptm{position:absolute;left:10px;top:10px;display:flex;align-items:center;padding:3px 8px;border-radius:99px;background:rgba(0,0,0,.4);color:#fff;font-size:10.5px}
.cx-pctl{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:12px}
.cx-pctl i{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);color:#fff}.cx-pctl i.end{background:#DC2626}
@media (prefers-reduced-motion:no-preference){.cx-vw.on .cx-spk .ln{animation:cx-draw 1.8s ease-in-out .5s both}.cx-vw.on .cx-pok span{animation:cx-n .45s var(--out) .3s both}}
@media (max-width:899px){.cx-prw{justify-content:flex-start;gap:20px;height:600px}}`;

/* a phone slide plays when it is the open app and on screen; it plays again each time it opens; the video timer counts */
export const PHONE_JS = String.raw`(function(d,W){var IO=W.IntersectionObserver;
[].forEach.call(d.querySelectorAll('.cx-ps'),function(p){var sc=[].slice.call(p.querySelectorAll('.cx-psc')),vis=!IO,tm=0;
function sync(){var on=vis&&p.classList.contains('cur');if(on===sc[0].classList.contains('on'))return;
sc.forEach(function(x){x.classList.toggle('on',on)});clearInterval(tm);
var cd=p.querySelector('.js-cd');if(on&&cd){var s=134;cd.textContent='02:14';tm=setInterval(function(){s++;cd.textContent=('0'+(s/60|0)).slice(-2)+':'+('0'+s%60).slice(-2)},1000)}}
if(IO)new IO(function(e){vis=e[0].isIntersecting;p.classList.toggle('vis',vis);sync()},{threshold:.2}).observe(p);else p.classList.add('vis');
new MutationObserver(sync).observe(p,{attributes:true,attributeFilter:['class']});sync()})})(document,window);`;
