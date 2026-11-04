/* ElementalsAI Labs landing pages v2 (D-91). One script for every page; each part looks for its own markup. */
(function () {
'use strict';
var d = document, root = d.documentElement, W = window;
var RM = !!(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var FINE = !!(W.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
var hasIO = 'IntersectionObserver' in W;
function $(s, c) { return (c || d).querySelector(s); }
function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function rnd(a, b) { return a + Math.random() * (b - a); }
var fontsReady = Promise.race([(d.fonts && d.fonts.ready) || Promise.resolve(), sleep(1600)]);
function onView(el, fn, th) {
  if (!el) return;
  if (!hasIO) { fn(); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: th == null ? 0.35 : th });
  io.observe(el);
}
var PAGE = W.LABS || {};
/* events for Tag Manager (Analytics, Google Ads conversions): generate_lead, phone_click, email_click, voice_call_start.
   Funnel steps, Analytics only: scroll_50, scroll_90, try_it_used, library_click, quote_button_click, internal_link_click, form_start, budget_chosen, form_send_click, form_send_blocked. `detail` carries no personal data. */
function track(event, data) { (W.dataLayer = W.dataLayer || []).push(Object.assign({ event: event }, data || {})); }
var once = {};
function trackOnce(event, data) { if (!once[event]) { once[event] = 1; track(event, data); } }
d.addEventListener('click', function (e) {
  if (!e.target.closest) return;
  var a = e.target.closest('a[href^="tel:"],a[href^="mailto:"]');
  if (a) { track(a.protocol === 'tel:' ? 'phone_click' : 'email_click', { lead_source: a.protocol === 'tel:' ? 'phone' : 'email' }); return; }
  var lib = e.target.closest('[data-quote-idea]');
  if (lib) { track('library_click', { detail: lib.getAttribute('data-quote-idea') }); return; }
  if (e.target.closest('#try .chip, #try .go')) { trackOnce('try_it_used'); return; }
  var l = e.target.closest('a[href]');
  if (!l) return;
  if (l.getAttribute('href') === '#quote' || l.pathname === '/quote') track('quote_button_click', { detail: location.pathname });
  else if (l.host === location.host && l.pathname !== location.pathname) track('internal_link_click', { detail: l.pathname });
});
W.addEventListener('scroll', function () {
  var max = d.documentElement.scrollHeight - W.innerHeight, p = max > 0 ? W.scrollY / max : 0;
  if (p >= .5) trackOnce('scroll_50');
  if (p >= .9) trackOnce('scroll_90');
}, { passive: true });

/* ---------- speech: words arrive one at a time, as on surajdonthi.com (lib/speech.ts) ---------- */
function wrapWords(el) {
  var walker = d.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (n) {
    var parts = n.nodeValue.split(/(\s+)/);
    if (!n.nodeValue.trim()) return;
    var f = d.createDocumentFragment();
    parts.forEach(function (p) {
      if (!p) return;
      if (/^\s+$/.test(p)) { f.appendChild(d.createTextNode(p)); return; }
      var s = d.createElement('span'); s.className = 'w'; s.textContent = p; f.appendChild(s);
    });
    n.parentNode.replaceChild(f, n);
  });
  return $$('.w', el);
}
function beat(w) {
  var n = (w.textContent || '').replace(/[^A-Za-z0-9]/g, '').length;
  var ms = 46 + Math.min(n, 10) * 9;
  if (w.closest('b,mark')) ms *= 1.5;
  if (w.hasAttribute('data-pause')) ms += 820;
  return ms;
}
function speak(words, o) {
  o = o || {};
  return new Promise(function (done) {
    if (RM || !words.length) { words.forEach(function (w) { w.classList.add('on'); }); done(); return; }
    var caret = d.createElement('span'); caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true');
    var i = 0, rate = o.rate || 1;
    function next() {
      var w = words[i++]; w.classList.add('on');
      var at = o.after ? o.after(w) : w; at.parentNode.insertBefore(caret, at.nextSibling);
      if (i < words.length) setTimeout(next, beat(w) * rate);
      else setTimeout(function () { caret.remove(); done(); }, o.tail == null ? 840 : o.tail);
    }
    setTimeout(next, o.lead || 0);
  });
}

/* ---------- the hero line: in the page and shown at first paint (the false start waits in data-false); the last word rolls ---------- */
(function hero() {
  var h = $('.title[data-talk]'); if (!h) return;
  var rot = $('.rot', h), pad = $('.pad', h);
  var verbs = []; try { verbs = JSON.parse(h.getAttribute('data-verbs') || '[]'); } catch (e) {}
  var widths = [], widest = 0, vi = 0, timer = 0, seen = true, armed = false;
  function setW(k) { if (!rot || !pad || !widths.length) return; rot.style.width = widths[k] + 'px'; pad.style.width = Math.max(0, widest - widths[k]) + 'px'; }
  function measure() {
    if (!rot || verbs.length < 2) return;
    var m = d.createElement('span'); m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; rot.appendChild(m);
    widths = verbs.map(function (v) { m.textContent = v; return m.getBoundingClientRect().width; });
    widest = Math.max.apply(null, widths); m.remove(); setW(vi);
  }
  function tick() {
    vi = (vi + 1) % verbs.length;
    var old = rot.firstElementChild, nw = d.createElement('span');
    nw.textContent = verbs[vi]; nw.style.transform = 'translateY(100%)'; nw.style.opacity = '0'; rot.appendChild(nw);
    /* a forced layout instead of animation frames: frames pause in a hidden or covered window, and the band would stay empty */
    void nw.offsetWidth;
    old.style.transform = 'translateY(-100%)'; old.style.opacity = '0'; nw.style.transform = 'none'; nw.style.opacity = '1'; setW(vi);
    setTimeout(function () { if (old.parentNode) old.remove(); }, 650);
  }
  function start() { if (armed && seen && !d.hidden && !timer && verbs.length > 1) timer = setInterval(tick, 2800); }
  function stop() { clearInterval(timer); timer = 0; }
  if (RM || !rot || verbs.length < 2) return;
  fontsReady.then(function () { measure(); setTimeout(function () { armed = true; start(); }, 1400); });
  W.addEventListener('resize', measure, { passive: true });
  if (hasIO) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; seen ? start() : stop(); }).observe(h);
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
})();

/* ---------- the particle stream behind the hero: amber near the cursor, grey elsewhere (HeroField) ---------- */
(function field() {
  var cv = $('.hero .field'); if (!cv) return;
  var hero = cv.parentElement, ctx = cv.getContext('2d'); if (!ctx) return;
  var AMB = '255,189,89', GREY = '244,242,236', ANG = -Math.atan2(1, 1.9), DX = Math.cos(ANG), DY = Math.sin(ANG), NX = -DY, NY = DX;
  var Wd = 0, Ht = 0, P = [], m = { x: -1e3, y: -1e3 }, raf = 0, inView = false;
  function spawn(p) { p.x = rnd(-40, Wd + 20); p.y = rnd(-20, Ht + 40); p.life = 0; p.ph = rnd(0, 6.28); p.amp = rnd(.2, .6); p.sp = rnd(.18, .34); p.len = rnd(.7, 1.3); return p; }
  function seed() { var n = W.innerWidth < 900 ? 320 : 820; P = []; for (var i = 0; i < n; i++) { var p = spawn({}); p.life = rnd(0, 1); P.push(p); } }
  function frame(now) {
    var t = now / 1000;
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(10,10,11,.2)'; ctx.fillRect(0, 0, Wd, Ht); ctx.globalCompositeOperation = 'source-over';
    for (var i = 0; i < P.length; i++) {
      var p = P[i], along = p.x * DX + p.y * DY;
      var wave = Math.sin(along * .012 + p.ph + t * .35) * p.amp + Math.sin(along * .0035 - t * .12) * .35;
      p.x += DX * p.sp + NX * wave * .45; p.y += DY * p.sp + NY * wave * .45; p.life += .0012 / p.len;
      if (p.life > 1) { spawn(p); continue; }
      if (p.x > Wd + 20 || p.y < -20) { p.x -= DX * (Wd + 60); p.y -= DY * (Wd + 60); }
      var dm = Math.hypot(p.x - m.x, p.y - m.y), near = dm < 150 ? 1 - dm / 150 : 0, fade = Math.sin(p.life * Math.PI);
      ctx.fillStyle = near ? 'rgba(' + AMB + ',' + (.12 + near * .55) + ')' : 'rgba(' + GREY + ',' + (.03 + fade * .075) + ')';
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    }
  }
  function size() {
    var dpr = Math.min(W.devicePixelRatio || 1, 2); Wd = hero.clientWidth; Ht = hero.clientHeight;
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); seed();
    if (RM) for (var k = 0; k < 40; k++) frame(performance.now() + k * 16);
  }
  function loop(now) { raf = requestAnimationFrame(loop); frame(now); }
  function sync() { var run = !RM && inView && !d.hidden; if (run && !raf) raf = requestAnimationFrame(loop); if (!run && raf) { cancelAnimationFrame(raf); raf = 0; } }
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { m.x = m.y = -1e3; });
  var lw = 0; W.addEventListener('resize', function () { if (W.innerWidth !== lw) { lw = W.innerWidth; size(); } }, { passive: true });
  lw = W.innerWidth; size();
  if (hasIO) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }).observe(hero); else { inView = true; sync(); }
  d.addEventListener('visibilitychange', sync);
})();

/* ---------- the header: solid once you scroll, and a thin amber line for how far down you are ---------- */
(function header() {
  var top = $('.top'), prog = $('.top .prog'); if (!top) return;
  var q = 0;
  function upd() { q = 0; var y = W.scrollY, max = root.scrollHeight - W.innerHeight; top.classList.toggle('solid', y > 8); if (prog) prog.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0); }
  W.addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(upd); }, { passive: true }); upd();
})();

/* ---------- magnetic pull on the primary buttons (desktop pointer only) ---------- */
(function magnet() {
  if (!FINE || RM) return;
  var btns = $$('.primary'), near = [], x = -1, y = -1, q = false;
  function rest(b) { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); }
  function frame() {
    q = false;
    btns.forEach(function (b) {
      var r = b.getBoundingClientRect(); if (!r.width) return;
      var gx = Math.max(r.left - x, 0, x - r.right), gy = Math.max(r.top - y, 0, y - r.bottom);
      if (Math.hypot(gx, gy) > 110) { rest(b); return; }
      b.style.setProperty('--mx', ((x - (r.left + r.width / 2)) * .16).toFixed(1) + 'px');
      b.style.setProperty('--my', ((y - (r.top + r.height / 2)) * .16).toFixed(1) + 'px');
    });
  }
  d.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!q) { q = true; requestAnimationFrame(frame); } }, { passive: true });
  d.addEventListener('scroll', function () { btns.forEach(rest); }, { passive: true });
})();

/* ---------- reveal on scroll: a short rise, once ---------- */
(function reveal() {
  var els = $$('.reveal'); if (!els.length) return;
  if (RM || !hasIO) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

/* ---------- the quote form ---------- */
var card = $('.card'), form = $('#quote-form');
function toQuote(idea) {
  if (!form) return;
  if (idea) { var t = $('#f-idea'); if (t) { t.value = idea; t.dispatchEvent(new Event('input')); } }
  var hh = parseFloat(getComputedStyle(root).getPropertyValue('--hh')) || 72, r = card.getBoundingClientRect();
  var fully = r.top >= hh && r.bottom <= W.innerHeight;
  if (!fully) W.scrollTo({ top: W.scrollY + r.top - hh - 24, behavior: RM ? 'auto' : 'smooth' });
  setTimeout(function () { var n = $('#f-name'); if (n) n.focus({ preventScroll: true }); card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash'); }, fully || RM ? 0 : 560);
}
$$('a[href="#quote"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); toQuote(); }); });
d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-quote-idea]'); if (b) toQuote(b.getAttribute('data-quote-idea')); });
/* the library rows: each row is a normal swipeable strip that also drifts slowly, in turns left and right; it stops on hover, touch or keyboard focus, and off screen */
$$('[data-lib]').forEach(function (lib) {
  var rows = $$('.lib-row', lib); if (RM) return;
  var items = rows.map(function (row, i) {
    var track = $('.lib-track', row), half = 0;
    $$('li', track).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('button', c).forEach(function (b) { b.tabIndex = -1; }); track.appendChild(c); });
    var it = { row: row, dir: i % 2 ? -1 : 1, pos: 0, held: false, half: function () { return half || (half = track.scrollWidth / 2); } };
    ['pointerenter', 'touchstart', 'focusin'].forEach(function (ev) { row.addEventListener(ev, function () { it.held = true; }, { passive: true }); });
    ['pointerleave', 'touchend', 'focusout'].forEach(function (ev) { row.addEventListener(ev, function () { it.pos = row.scrollLeft; it.held = false; }, { passive: true }); });
    return it;
  });
  var raf = 0, last = 0;
  function step(t) {
    var dt = Math.min(50, t - last || 16); last = t;
    items.forEach(function (it) {
      if (it.held) return;
      var h = it.half(); if (!h) return;
      it.pos += it.dir * dt * .025;
      if (it.pos >= h) it.pos -= h; else if (it.pos <= 0) it.pos += h;
      it.row.scrollLeft = it.pos;
    });
    raf = requestAnimationFrame(step);
  }
  new IntersectionObserver(function (es) { if (es[0].isIntersecting) { if (!raf) { last = 0; raf = requestAnimationFrame(step); } } else { cancelAnimationFrame(raf); raf = 0; } }).observe(lib);
});
/* where the visitor came from (ad click IDs and UTM tags), kept for the lead */
var ORIGIN = (function () {
  var keep = {}, q = {}; try { keep = JSON.parse(sessionStorage.getItem('labs-origin') || '{}'); } catch (e) {}
  try { new URLSearchParams(location.search).forEach(function (v, k) { if (/^(utm_\w+|gclid|gbraid|wbraid)$/.test(k)) q[k] = v.slice(0, 200); }); } catch (e) {}
  if (Object.keys(q).length) { keep = q; keep.landing = location.pathname; try { sessionStorage.setItem('labs-origin', JSON.stringify(keep)); } catch (e) {} }
  return keep;
})();
var valid = { name: function (v) { return v.trim().length > 1; }, idea: function (v) { return v.trim().length > 5; }, phone: function (v) { return v.replace(/\D/g, '').length >= 10; }, email: function (v) { return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v.trim()); }, budget: function (v) { return v !== ''; } };
/* sends the quote form; the voice agent uses it too. Resolves { ok, why } and never rejects */
var sendLead = function () { return Promise.resolve({ ok: false, why: 'no form' }); };
if (form) {
  form.addEventListener('focusin', function (e) { if (e.target.name && e.target.name !== 'website') trackOnce('form_start'); });
  form.addEventListener('change', function (e) { if (e.target.name === 'budget') track('budget_chosen', { detail: e.target.value }); });
  $$('input,textarea', form).forEach(function (f) {
    var fld = f.closest('.fld'), chk = valid[f.name];
    f.addEventListener('input', function () { if (fld && chk) fld.classList.toggle('ok', chk(f.value)); });
  });
  var st = $('.status', form), btn = $('button[type="submit"]', form), busy = false;
  var say = function (t, bad) { st.classList.remove('on', 'bad'); void st.offsetWidth; st.textContent = t; st.classList.add('on'); if (bad) st.classList.add('bad'); };
  var val = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };
  sendLead = function (source, conv) {
    var name = val('name'), idea = val('idea'), phone = val('phone'), email = val('email'), budget = val('budget');
    /* the voice agent does not ask the budget, so only the typed form needs it */
    var miss = [!valid.name(name) && 'your name', !valid.idea(idea) && 'your idea', source !== 'voice' && !valid.budget(budget) && 'your budget', !(valid.phone(phone) || valid.email(email)) && 'a phone number or an email'].filter(Boolean);
    if (source !== 'voice') { track('form_send_click'); if (miss.length) track('form_send_blocked', { detail: miss.join(', ') }); }
    if (miss.length) { say('Please add ' + miss.join(', ') + '.', true); return Promise.resolve({ ok: false, why: 'missing ' + miss.join(', ') }); }
    if (!PAGE.lead) { say('Thank you. This is a draft page, so the form is not connected yet.'); return Promise.resolve({ ok: true, why: 'draft page' }); }
    if (busy) return Promise.resolve({ ok: false, why: 'already sending' });
    busy = true; btn.disabled = true; say('Sending…');
    var body = { name: name, idea: idea, budget: budget, phone: phone, email: email, website: val('website'), page: location.pathname, source: source || 'form', conversation: conv || '', origin: ORIGIN };
    return fetch(PAGE.lead, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); })
      .then(function () {
        say('Thank you, ' + name.split(' ')[0] + '. We reply within 1 hour. Your free quote comes in 12 hours.');
        /* user_data feeds enhanced conversions; Google hashes it in the browser before it is sent */
        var digits = phone.replace(/\D/g, ''), e164 = digits.length === 10 ? '+91' + digits : digits.length > 10 ? '+' + digits : '';
        track('generate_lead', { lead_source: source || 'form', user_data: { email: valid.email(email) ? email.toLowerCase() : undefined, phone_number: e164 || undefined } });
        return { ok: true, why: 'sent' };
      })
      .catch(function () {
        btn.disabled = false;
        say('Sorry, it did not send. Please call ' + (PAGE.phone || '') + ' or email ' + (PAGE.email || '') + '.', true);
        return { ok: false, why: 'the network failed' };
      })
      .then(function (r) { busy = false; return r; });
  };
  form.addEventListener('submit', function (e) { e.preventDefault(); sendLead('form'); });
}

/* ---------- the voice orb (WebGL, with a CSS fallback), in the logo's amber ---------- */
var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS = ['precision highp float;',
'uniform vec2 uR;uniform float uT,uP,uL;uniform vec3 cA,cB,cC,cD,cE;',
'vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}',
'vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}',
'float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);',
'vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
'i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));',
'float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);',
'vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);',
'vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
'vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);',
'vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;',
'vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}',
'void main(){float s=min(uR.x,uR.y);vec2 p=(gl_FragCoord.xy-.5*uR)/(.5*s);',
' float an=atan(p.y,p.x);float R=.72+.06*uL+.012*uL*sin(an*5.+uT*7.)+.008*uL*sin(an*3.-uT*4.3);',
' float dd=length(p)/R;float px=2.4/(s*R);float ins=1.-smoothstep(1.-px,1.+px,dd);',
' float gd=max(dd-1.,0.);float glow=exp(-gd*gd*22.)*(.16+.5*uL)*(1.-ins);',
' vec3 col=vec3(0.);',
' if(dd<1.+px*2.){vec2 q=p/R;float z=sqrt(max(1.-dot(q,q),0.));vec3 n=vec3(q,z);',
'  vec2 uv=q/(.62+.38*z);float a=uP*.9+length(uv)*.55;mat2 ro=mat2(cos(a),-sin(a),sin(a),cos(a));vec2 w=ro*uv;',
'  vec3 P=vec3(w*.75,uP*.7);w+=vec2(sn(P),sn(P+vec3(4.1,-2.3,1.7)))*(.32+.34*uL);',
'  float f1=sn(vec3(w*.72,uP*.9+1.));float f2=sn(vec3(w*1.05+2.7,uP*1.1-3.));float f3=sn(vec3(w*.55-1.9,uP*.6+5.));',
'  float b1=sin(2.6*dot(w,vec2(.8,.6))+f1*2.4+uP*1.3);float b2=sin(2.2*dot(w,vec2(-.4,.9))+f2*2.1-uP*1.05);',
'  vec3 c=mix(cB,cC,smoothstep(-.95,1.,b1));c=mix(c,cD,smoothstep(-.25,1.,b2)*.75);',
'  c=mix(c,cA,smoothstep(.15,1.,b1*b2)*.62);c=mix(c,cE,smoothstep(.35,1.,f3)*.3);c=mix(c,cA,.08+.1*z*z);',
'  vec3 Lg=normalize(vec3(-.45,.6,.66));float df=clamp(dot(n,Lg),0.,1.);c*=.8+.3*df;',
'  c=mix(c,c*.7,smoothstep(.15,1.,-q.y)*.3);',
'  vec3 H=normalize(Lg+vec3(0.,0.,1.));float hs=max(dot(n,H),0.);c+=vec3(1.,.97,.93)*(pow(hs,60.)*.34+pow(hs,8.)*.08);',
'  c=mix(c,cA,pow(1.-z,3.)*.32);c*=1.+.1*uL;col=c;}',
' vec3 gc=mix(cB,cC,.4);gl_FragColor=vec4(col*ins+gc*glow,clamp(ins+glow,0.,1.));}'].join('\n');
function hex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
function makeOrb(btn) {
  var cv = $('canvas', btn), gl = null, prog = null, U = {}, phase = 7.3, last = 0, level = 0, lfn = null, raf = 0, on = false;
  function fallback() { btn.classList.add('no-gl'); gl = null; }
  try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
  if (gl) {
    var sh = function (t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (v && f) { prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null; }
    if (!prog) fallback();
    else {
      gl.useProgram(prog); var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uR', 'uT', 'uP', 'uL', 'cA', 'cB', 'cC', 'cD', 'cE'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
      /* cream, honey, the mark's orange, the mark's amber, burnt umber for depth */
      gl.uniform3fv(U.cA, hex('#FFF6E6')); gl.uniform3fv(U.cB, hex('#FFD08A')); gl.uniform3fv(U.cC, hex('#FF9A00')); gl.uniform3fv(U.cD, hex('#FFBD59')); gl.uniform3fv(U.cE, hex('#6B2A08'));
      gl.clearColor(0, 0, 0, 0);
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); cancelAnimationFrame(raf); fallback(); });
    }
  } else fallback();
  function size() { var r = cv.getBoundingClientRect(), dpr = Math.min(W.devicePixelRatio || 1, 2), w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } if (gl) gl.viewport(0, 0, w, h); }
  function draw(now) { if (!gl) return; size(); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(U.uR, cv.width, cv.height); gl.uniform1f(U.uT, now / 1000); gl.uniform1f(U.uP, phase); gl.uniform1f(U.uL, level); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  function frame(now) { raf = requestAnimationFrame(frame); var dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; var tg = lfn ? lfn(now / 1000) : .04 + .03 * Math.sin(now / 1000 * 1.3); level += (tg - level) * (tg > level ? .3 : .1); phase += dt * (.16 + .55 * level); draw(now); }
  return {
    setLevel: function (fn) { lfn = fn; },
    start: function () { if (RM) { level = .05; draw(4000); return; } if (on) return; on = true; last = 0; raf = requestAnimationFrame(frame); },
    stop: function () { on = false; cancelAnimationFrame(raf); },
    redraw: function () { if (!on) draw(4000); }
  };
}
function speechLv(gate) { return function (t) { if (gate && !gate()) return .06; var syl = Math.abs(Math.sin(t * 8.1 + Math.sin(t * 2.3) * 2.1)), env = .55 + .45 * Math.sin(t * 1.7 + 1.1); return .22 + .66 * syl * env * (.75 + .25 * Math.random()); }; }
function listenLv(t) { var a = Math.abs(Math.sin(t * 5.3 + Math.sin(t * 1.1) * 3)), b = .5 + .5 * Math.sin(t * .9); return b < .28 ? .05 + .03 * Math.random() : .1 + .45 * a * b * (.7 + .3 * Math.random()); }
(function voice() {
  var va = $('[data-va]'); if (!va) return;
  var orbBtn = $('.orb', va), orb = makeOrb(orbBtn), cap = $('[data-cap]', va), stT = $('[data-st]', va), tBtn = $('[data-talk-btn]', va), live = $('[data-va-live]', va);
  /* Suraj's script (29 Oct 2026) lives in the ElevenLabs agent "Diya". Her opening (D-98) plays here from recorded clips in her voice:
     "Hello? Hi… anybody there? Hello?", three taps on the glass, then "Oh, hi! I'm Diya. What should I call you?".
     No tap is needed: when the card is in view, she asks for the microphone. Once the visitor allows it, the browser lets the page play sound,
     so she knocks, says her opening and starts the live call by herself, then waits for the visitor's name. */
  var NAME = 'Diya', hr = new Date().getHours(), TOD = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
  var GREET = 'Oh, hi! I’m Diya. What should I call you?', TAP = 'Tap me to talk.';
  var INTRO = {
    hello: { d: 4.24, w: [['Hello?', .16], ['Hi…', 1.36], ['anybody', 2.24], ['there?', 2.74], ['Hello?', 3.58]] },
    knock: { d: 1.1, hits: [.04, .38, .72] }, /* three taps on the glass */
    name: { d: 3.76, w: [['Oh,', .16], ['hi!', .52], ['I’m', 1.28], ['Diya.', 1.54], ['What', 2.5], ['should', 2.64], ['I', 2.86], ['call', 2.96], ['you?', 3.22]] }
  };
  var SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.28.0/dist/lib.iife.js';
  var state = 'idle', greeted = false, conv = null, sent = false, ending = false, lastAi = GREET;
  var run = 0, stops = [], heard = false, kick = 0, talking = false, gate = true, micStream = null;
  /* the call ends by itself: Diya calls end_call when she is done; as a backstop, the page ends it after 3 of her turns with no answer, or 60 s without the visitor speaking */
  var aiRun = 0, winding = false, idleT = 0;
  function idleWatch() { clearTimeout(idleT); idleT = setTimeout(function () { if (conv) stop(); }, 60000); }
  /* once a tab: 'met' after her opening, 'done' after the lead is sent or the visitor stops her (then she waits for a tap) */
  var MEM = 'labs-diya', mem = ''; try { mem = sessionStorage.getItem(MEM) || ''; } catch (e) {}
  function remember(v) { mem = v; try { sessionStorage.setItem(MEM, v); } catch (e) {} }
  function fit() { var keep = cap.innerHTML; cap.style.minHeight = ''; cap.textContent = 'Okay, great. I have captured this information. Can you tell me how our team can get back to you?'; cap.style.minHeight = cap.offsetHeight + 'px'; cap.innerHTML = keep; }
  cap.textContent = RM ? GREET : ''; fit();
  var fz = 0; W.addEventListener('resize', function () { clearTimeout(fz); fz = setTimeout(fit, 150); }, { passive: true });
  fontsReady.then(fit);
  function setState(s, label) { state = s; va.setAttribute('data-state', s); if (label) stT.textContent = label; }
  function show(text, extra) { cap.textContent = text; if (extra) { var sm = d.createElement('small'); sm.textContent = extra; cap.appendChild(sm); } }

  /* ---- the opening ---- */
  var talkLv = speechLv(function () { return gate; });
  function introLv(t) { var k = kick; kick *= .84; return Math.max(k, talking ? talkLv(t) : .05); }
  function knockFx() {
    kick = 1;
    orbBtn.classList.remove('knk'); void orbBtn.offsetWidth; orbBtn.classList.add('knk');
    var rp = d.createElement('span'); rp.className = 'rip'; orbBtn.appendChild(rp); setTimeout(function () { rp.remove(); }, 900);
  }
  function clip(k) { return $('audio[data-snd="' + k + '"]', va); }
  /* the clips have preload="none"; the first hover, focus or tap of the orb loads them (play() loads one too, if it comes first) */
  var warm = function () {
    warm = function () {};
    $$('audio[data-snd]', va).forEach(function (a) { if (a.readyState === 0 && a.networkState !== 2) { a.preload = 'auto'; try { a.load(); } catch (e) {} } });
  };
  ['pointerenter', 'pointerdown', 'focus'].forEach(function (t) { orbBtn.addEventListener(t, function () { warm(); }, { passive: true }); });
  /* plays one part (its sound, if allowed) and runs its words or knocks on the clip's own clock */
  function part(k, sound) {
    return new Promise(function (res) {
      var p = INTRO[k], el = sound ? clip(k) : null, timers = [];
      stops.push(function () { timers.forEach(clearTimeout); if (el) { try { el.pause(); } catch (e) {} } });
      function go() {
        talking = k !== 'knock';
        if (k === 'knock') p.hits.forEach(function (t) { timers.push(setTimeout(knockFx, t * 1000)); });
        else { cap.textContent = ''; p.w.forEach(function (w) { timers.push(setTimeout(function () { gate = true; cap.textContent += (cap.textContent ? ' ' : '') + w[0]; live.textContent = cap.textContent; }, w[1] * 1000)); }); }
        timers.push(setTimeout(function () { talking = false; res(); }, p.d * 1000 + 160));
      }
      if (!el) { go(); return; }
      var pr; try { el.currentTime = 0; pr = el.play(); } catch (e) { heard = false; go(); return; }
      if (pr && pr.then) pr.then(go, function () { heard = false; go(); }); else go();
    });
  }
  function stopIntro() { run++; stops.splice(0).forEach(function (f) { f(); }); talking = false; }
  /* resolves true when the whole opening was heard with sound */
  function intro(sound) {
    stopIntro(); var my = run; heard = !!sound;
    setState('greet', NAME); orb.setLevel(RM ? null : introLv);
    var alive = function () { if (my !== run) throw 0; };
    return part('hello', sound).then(function () { alive(); return part('knock', sound); })
      .then(function () { alive(); return part('name', sound); })
      .then(function () { alive(); stops = []; orb.setLevel(null); return heard; });
  }
  function dropMic() { if (micStream) { micStream.getTracks().forEach(function (t) { t.stop(); }); micStream = null; } }
  function askMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('no microphone'));
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) { micStream = st; return st; });
  }
  function greet() {
    if (greeted || state !== 'idle') return; greeted = true;
    if (mem === 'done') { setState('ready', NAME); show(GREET, TAP); return; }
    setState('greet', NAME); show('Hello? Anybody there?', 'Allow the microphone, and I will talk to you.');
    orb.setLevel(RM ? null : introLv); if (!RM) INTRO.knock.hits.forEach(function (t) { setTimeout(knockFx, 400 + t * 1000); });
    askMic().then(function () {
      if (state !== 'greet') { dropMic(); return; }
      if (mem === 'met') { start(false, 'Hi again! What should I call you?'); return; }
      intro(true).then(function (ok) { remember('met'); start(ok); }, function () {});
    }, function () {
      if (state !== 'greet') return;
      intro(false).then(function () { setState('ready', NAME); show(GREET, 'Type your details below, or allow the microphone and tap me.'); }, function () {});
    });
  }

  /* ---- the live call ---- */
  function loadSdk() {
    if (W.ElevenLabsClient) return Promise.resolve(W.ElevenLabsClient);
    return new Promise(function (res, rej) { var s = d.createElement('script'); s.src = SDK; s.async = true; s.onload = function () { if (W.ElevenLabsClient) res(W.ElevenLabsClient); else rej(new Error('sdk')); }; s.onerror = function () { rej(new Error('sdk')); }; d.head.appendChild(s); });
  }
  function level(get, k) { return function () { var v = 0; try { v = get() || 0; } catch (e) {} return Math.min(1, .05 + v * k); }; }
  function fill(field, value) {
    var f = /^(name|idea|phone|email)$/.test(field || '') && $('#f-' + field); if (!f || value == null) return;
    f.value = String(value); f.dispatchEvent(new Event('input', { bubbles: true }));
    var fl = f.closest('.fld'); if (fl) { fl.classList.remove('filled'); void fl.offsetWidth; fl.classList.add('filled'); }
  }
  function idle(text, extra) { conv = null; ending = false; orb.setLevel(null); setState('ready', NAME); show(text || GREET, extra === undefined ? TAP : extra); }
  function stop() { clearTimeout(idleT); var c = conv; conv = null; if (c) { try { c.endSession(); } catch (e) {} } idle(sent ? 'Thank you. Our team will get back to you in the next hour.' : lastAi, sent ? '' : 'Tap me to talk again.'); live.textContent = 'The call ended.'; }
  /* quiet: she has just asked for the name in her opening, so she listens first instead of greeting again */
  function start(quiet, firstMessage) {
    if (!PAGE.agent) { idle('The voice agent is not set up on this page. Please type your details below.', ''); return; }
    stopIntro(); sent = false; ending = false; aiRun = 0; winding = false; setState('connecting', 'Connecting');
    show(quiet ? GREET : 'Connecting…', quiet ? 'Allow the microphone, then tell me your name.' : 'Allow the microphone when your browser asks.'); orb.setLevel(RM ? null : listenLv);
    loadSdk().then(function (EL) {
      if (state !== 'connecting') return null;
      return EL.Conversation.startSession({
        agentId: PAGE.agent,
        overrides: quiet ? { agent: { firstMessage: '' } } : firstMessage ? { agent: { firstMessage: firstMessage } } : undefined,
        dynamicVariables: { time_of_day: TOD, service: PAGE.service || 'apps, software and AI' },
        clientTools: {
          fill_field: function (p) { fill(p && p.field, p && p.value); },
          submit_quote: function () { return sendLead('voice', conv && conv.getId ? conv.getId() : '').then(function (r) { if (r.ok) { sent = true; remember('done'); } return r.ok ? 'Sent.' : 'Not sent: ' + r.why + '.'; }); }
        },
        onConnect: function () { track('voice_call_start', { lead_source: 'voice' }); setTimeout(dropMic, 1500); idleWatch(); if (quiet && state === 'connecting') { setState('listening', 'Listening'); show(GREET, 'I’m listening.'); } },
        onModeChange: function (m) {
          if (state === 'ready') return;
          var sp = m && m.mode === 'speaking'; setState(sp ? 'speaking' : 'listening', sp ? 'Speaking' : 'Listening');
          orb.setLevel(RM ? null : sp ? level(function () { return conv && conv.getOutputVolume(); }, 1.5) : level(function () { return conv && conv.getInputVolume(); }, 1.2));
          if (!sp && (sent || winding) && !ending) { ending = true; setTimeout(stop, 700); }
        },
        onMessage: function (m) {
          var t = m && m.message ? String(m.message).replace(/\[[^\]]*\]\s*/g, '').trim() : ''; if (!t) return; /* drop the voice's mood tags, e.g. [warm] */
          if (m.source === 'ai') { lastAi = t; show(t); live.textContent = t; if (++aiRun >= 3) winding = true; }
          else if (t !== '...') { aiRun = 0; idleWatch(); show(lastAi, 'You: ' + t); }
        },
        onDisconnect: function () { if (conv) stop(); },
        onError: function (msg) { if (W.console) console.warn('Voice agent:', msg); }
      });
    }).then(function (c) {
      if (!c) return;
      if (state === 'ready' || state === 'idle') { try { c.endSession(); } catch (e) {} return; }
      conv = c;
    }).catch(function (e) {
      dropMic(); var why = String(e && (e.name + ' ' + e.message));
      idle(/NotAllowed|Permission|denied/i.test(why) ? 'The microphone is blocked. Please type your details below, or allow the microphone and tap me.' : 'The voice agent could not start. Please type your details below.', '');
    });
  }
  /* the orb: stops a call (then she waits for a tap), or starts one */
  function talk() {
    if (state === 'connecting' || conv) { remember('done'); stop(); return; }
    if (state === 'greet') return;
    remember(''); start(false);
  }
  tBtn.addEventListener('click', talk); orbBtn.addEventListener('click', talk);
  /* typed details go to the agent, so it does not ask for them again; typing stops the opening */
  if (form) form.addEventListener('change', function (e) { var f = e.target; if (conv && f && f.name && f.value) { try { conv.sendContextualUpdate('The visitor typed their ' + f.name + ' in the form: ' + f.value); } catch (x) {} } });
  if (form) form.addEventListener('focusin', function (e) { if (/INPUT|TEXTAREA/.test(e.target.tagName) && state === 'greet') { stopIntro(); orb.setLevel(null); setState('ready', NAME); show(GREET, TAP); } });
  var vis = false, gT = 0;
  function sync() { if (vis && !d.hidden) orb.start(); else orb.stop(); }
  if (hasIO) new IntersectionObserver(function (es) {
    vis = es[0].isIntersecting; sync();
    if (vis && !greeted) { clearTimeout(gT); gT = setTimeout(greet, 900); }
    else if (!vis) clearTimeout(gT);
  }, { threshold: .5 }).observe(orbBtn);
  else { vis = true; sync(); setTimeout(greet, 900); }
  d.addEventListener('visibilitychange', sync);
  W.addEventListener('pagehide', function () { dropMic(); if (conv) { try { conv.endSession(); } catch (e) {} } });
  W.addEventListener('resize', function () { orb.redraw(); }, { passive: true });
})();

/* ---------- try it: the device plays a demo, then draws a sketch of the visitor's own idea ----------
   Three devices, one engine: a phone (mobile apps), a browser with a web app (apps, custom software)
   and an agent at work (AI pages). The section says which one with data-device. */
var ICON = function (id) { return '<svg class="i" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var TPL = [
  { k: 'stock', re: /\b(warehouse|inventory|stock|godown|sku|supplies|distribut\w*|wholesale|dealers?)\b/i, suf: 'Stock', name: 'Stock', ic: 'box', app: '#0891B2', soft: '#DDF1F6',
    hc: ['Today', '64 orders to pack', 'On time', '7 low on stock'], tiles: [['box', 'Stock'], ['bag', 'Orders'], ['trend', 'Reports'], ['users', 'Team']],
    rows: [['check', 'Order packed', '#318 · 6 items', 'now', 'g'], ['box', 'Stock received', '120 units · Rack A2', '20m', 'a'], ['bell', 'Low stock', 'Steel bolts · Rack C4', '', 'k']], tabs: ['home', 'box', 'bag', 'user'],
    web: { nav: ['box', 'bag', 'users', 'trend'], stats: [['Items in stock', '2,418'], ['Orders today', '64'], ['Low stock', '7']], cols: ['Item', 'Rack', 'Status'],
      rows: [['Cotton bags', 'Rack A2', 'In stock', 'g'], ['Steel bolts', 'Rack C4', 'Low', 'a'], ['Paper rolls', 'Rack B1', 'In stock', 'g'], ['Glue tubes', 'Rack D3', 'Reorder', 'k']],
      feed: [['Order #319', 'Rack A2', 'Packed', 'a'], ['Order #320', 'Rack B1', 'Packed', 'a'], ['Order #321', 'Rack C4', 'Packed', 'a']], toast: 'New order, ready to pack' } },
  { k: 'staff', re: /\b(attendance|leave|staff|employees?|hr|payroll|shifts?|check[- ]?ins?)\b/i, suf: 'Attendance', name: 'Attendance', ic: 'users', app: '#4F46E5', soft: '#E7E6FD',
    hc: ['Today', '42 of 45 present', 'On time', '3 on leave'], tiles: [['check', 'Check in'], ['calendar', 'Leave'], ['users', 'Team'], ['doc', 'Payslips']],
    rows: [['check', 'Checked in', '9:02 am · Site 12', 'now', 'g'], ['calendar', 'Leave approved', 'Friday', '1h', 'a'], ['doc', 'Payslip ready', 'For October', '', 'k']], tabs: ['home', 'check', 'calendar', 'user'],
    web: { nav: ['users', 'check', 'calendar', 'doc'], stats: [['Present today', '42'], ['On leave', '3'], ['Requests', '5']], cols: ['Person', 'Today', 'Status'],
      rows: [['Ravi K.', 'In at 9:02 am', 'Present', 'g'], ['Meena S.', 'On leave', 'Leave', 'k'], ['Arun P.', 'In at 9:15 am', 'Late', 'a'], ['Divya R.', 'In at 8:55 am', 'Present', 'g']],
      feed: [['Sunil T.', 'In at 9:20 am', 'Present', 'g'], ['Lata M.', 'Leave request', 'Pending', 'a'], ['Kiran J.', 'In at 9:24 am', 'Present', 'g']], toast: 'New check-in, from the app' } },
  { k: 'booking', re: /\b(salon|spa|parlou?r|barber|clinic|doctor|dentist|dental|physio|appointment|slot|consult\w*|gym|studio|tutor|yoga|massage|vet|groom\w*|book\w*)\b/i, suf: 'Bookings', name: 'Bookings', ic: 'calendar', app: '#E2563B', soft: '#FCE9E4',
    hc: ['Next visit', 'Today, 6:30 pm', 'Confirmed', 'Reminder on'], tiles: [['calendar', 'Book'], ['card', 'Pay'], ['clock', 'History'], ['chat', 'Help']],
    rows: [['check', 'Visit booked', 'Today, 6:30 pm', 'now', 'g'], ['card', 'Paid with UPI', 'Receipt sent', '2m', 'a'], ['bell', 'Reminder set', '1 hour before', '', 'k']], tabs: ['home', 'calendar', 'bell', 'user'],
    web: { nav: ['calendar', 'users', 'card', 'trend'], stats: [['Visits today', '18'], ['This week', '124'], ['Paid online', '92%']], cols: ['Customer', 'Time', 'Status'],
      rows: [['Priya S.', 'Today, 6:30 pm', 'Confirmed', 'g'], ['Rahul M.', 'Today, 7:00 pm', 'Paid', 'a'], ['Ananya K.', 'Tomorrow, 11 am', 'Reminder sent', 'k'], ['Vikram T.', 'Tomorrow, 4:30 pm', 'Confirmed', 'g']],
      feed: [['Meera J.', 'Today, 8:00 pm', 'New', 'a'], ['Arjun P.', 'Fri, 10:00 am', 'New', 'a'], ['Sneha R.', 'Sat, 12:30 pm', 'New', 'a']], toast: 'New booking, from the app' } },
  { k: 'food', re: /\b(food|restaurant|deliver\w*|kitchen|caf[eé]|tiffin|meals?|pizza|biryani|bakery|bakes?|grocer\w*|kirana|vegetables?|fruits?|milk|dairy|cloud kitchen|ordering)\b/i, suf: 'Orders', name: 'Orders', ic: 'bag', app: '#16A34A', soft: '#E3F5E8',
    hc: ['Order #2047', 'Arriving in 12 min', 'On the way', 'Live tracking'], tiles: [['bag', 'Order'], ['repeat', 'Reorder'], ['pin', 'Track'], ['chat', 'Help']],
    rows: [['check', 'Order placed', '2 items', 'now', 'g'], ['pin', 'Picked up', 'Rider on the way', '4m', 'a'], ['card', 'Paid with UPI', 'Receipt sent', '6m', 'k']], tabs: ['home', 'bag', 'pin', 'user'],
    web: { nav: ['bag', 'pin', 'users', 'trend'], stats: [['Orders today', '86'], ['Avg. delivery', '24 min'], ['Rating', '4.8']], cols: ['Order', 'Items', 'Status'],
      rows: [['#2047', '2 items', 'On the way', 'a'], ['#2046', '4 items', 'Delivered', 'g'], ['#2045', '1 item', 'Preparing', 'k'], ['#2044', '3 items', 'Delivered', 'g']],
      feed: [['#2048', '2 items', 'New', 'a'], ['#2049', '5 items', 'New', 'a'], ['#2050', '1 item', 'New', 'a']], toast: 'New order, from the app' } },
  { k: 'store', re: /\b(shop|store|sell\w*|products?|catalog\w*|fashion|cloth\w*|jewel\w*|boutique|cart|handmade|sarees?|shoes?|furniture|electronics|retail|brand)\b/i, suf: 'Store', name: 'Store', ic: 'bag', app: '#7C3AED', soft: '#EEE7FD',
    hc: ['New arrivals', '24 picks for you', 'In stock', 'Free delivery'], tiles: [['grid', 'Shop'], ['heart', 'Saved'], ['bag', 'Cart'], ['box', 'Orders']],
    rows: [['box', 'Order shipped', 'Arrives tomorrow', 'now', 'a'], ['heart', 'Back in stock', 'An item you saved', '1h', 'k'], ['check', 'Payment done', 'UPI · today', '2h', 'g']], tabs: ['home', 'grid', 'bag', 'user'],
    web: { nav: ['grid', 'box', 'users', 'trend'], stats: [['Orders today', '42'], ['Visitors today', '1,280'], ['In stock', '312']], cols: ['Order', 'Product', 'Status'],
      rows: [['#5121', 'Handloom saree', 'Shipped', 'a'], ['#5120', 'Silver earrings', 'Delivered', 'g'], ['#5119', 'Gift box', 'Packing', 'k'], ['#5118', 'Cotton kurta', 'Delivered', 'g']],
      feed: [['#5122', 'Brass lamp', 'New', 'a'], ['#5123', 'Silk stole', 'New', 'a'], ['#5124', 'Gift box', 'New', 'a']], toast: 'New order, from the store' } },
  { k: 'learn', re: /\b(learn\w*|course|school|students?|teach\w*|exams?|academy|coaching|lessons?|college|classes|tuition|kids)\b/i, suf: 'Classes', name: 'Classes', ic: 'book', app: '#2563EB', soft: '#E4ECFD',
    hc: ['Next class', 'Maths · 5:00 pm', 'Live today', 'Notes ready'], tiles: [['book', 'Lessons'], ['check', 'Tests'], ['trend', 'Progress'], ['chat', 'Doubts']],
    rows: [['check', 'Test submitted', 'Score: 18 of 20', 'now', 'g'], ['book', 'New lesson', 'Fractions, part 2', '1h', 'a'], ['bell', 'Class reminder', 'Starts at 5 pm', '', 'k']], tabs: ['home', 'book', 'trend', 'user'],
    web: { nav: ['book', 'users', 'check', 'trend'], stats: [['Students', '248'], ['Classes today', '6'], ['Attendance', '92%']], cols: ['Student', 'Class', 'Status'],
      rows: [['Aarav K.', 'Maths, 5 pm', 'Joined', 'g'], ['Diya S.', 'Science, 6 pm', 'Booked', 'a'], ['Kabir M.', 'English, 4 pm', 'Test done', 'g'], ['Isha P.', 'Maths, 5 pm', 'Booked', 'a']],
      feed: [['Rohan D.', 'Maths, 5 pm', 'New', 'a'], ['Anika T.', 'Science, 6 pm', 'New', 'a'], ['Yash G.', 'English, 4 pm', 'New', 'a']], toast: 'New student, from the app' } },
  { k: 'health', re: /\b(health|fitness|fit|workout|diet|patients?|steps|wellness|nutrition|weight|habit|medicine|pharmacy)\b/i, suf: 'Health', name: 'Health', ic: 'heart', app: '#0D9488', soft: '#DDF3F1',
    hc: ['Today', '6,240 steps', 'On track', 'Goal: 8,000'], tiles: [['trend', 'Progress'], ['heart', 'Vitals'], ['calendar', 'Plan'], ['chat', 'Coach']],
    rows: [['check', 'Workout done', '30 min · 220 kcal', 'now', 'g'], ['heart', 'Water goal', '6 of 8 glasses', '1h', 'a'], ['bell', 'Medicine reminder', '9:00 pm', '', 'k']], tabs: ['home', 'trend', 'heart', 'user'],
    web: { nav: ['heart', 'users', 'calendar', 'trend'], stats: [['Members', '310'], ['Check-ins today', '64'], ['Goals met', '71%']], cols: ['Member', 'Plan', 'Status'],
      rows: [['Neha G.', 'Weight loss', 'On track', 'g'], ['Amit V.', 'Strength', 'Check-in', 'a'], ['Pooja L.', 'Yoga', 'On track', 'g'], ['Sanjay R.', 'Diet plan', 'Due today', 'k']],
      feed: [['Kiran B.', 'Yoga', 'New', 'a'], ['Farah N.', 'Strength', 'New', 'a'], ['Ajay S.', 'Diet plan', 'New', 'a']], toast: 'New check-in, from the app' } },
  { k: 'jobs', re: /\b(field|technicians?|repairs?|service|jobs?|drivers?|sales|visits?|site|workers?|crm|leads?|enquir\w*|process|track\w*|operations?|projects?|team)\b/i, suf: 'Jobs', name: 'Jobs', ic: 'tool', app: '#EA580C', soft: '#FDEBDD',
    hc: ['Today', '5 jobs · 2 done', 'On schedule', 'Team of 8'], tiles: [['tool', 'Jobs'], ['users', 'Team'], ['pin', 'Map'], ['doc', 'Reports']],
    rows: [['check', 'Job closed', 'AC service · Site 12', 'now', 'g'], ['pin', 'Ravi checked in', 'Site 14', '8m', 'a'], ['doc', 'Invoice sent', 'To the customer', '1h', 'k']], tabs: ['home', 'tool', 'pin', 'user'],
    web: { nav: ['tool', 'users', 'pin', 'doc'], stats: [['Open jobs', '14'], ['Done today', '9'], ['On site now', '6']], cols: ['Job', 'Site', 'Status'],
      rows: [['AC service', 'Site 12', 'Done', 'g'], ['Pump repair', 'Site 14', 'On site', 'a'], ['Wiring check', 'Site 9', 'Scheduled', 'k'], ['Lift service', 'Site 3', 'Done', 'g']],
      feed: [['Generator check', 'Site 21', 'New', 'a'], ['Leak repair', 'Site 7', 'New', 'a'], ['CCTV install', 'Site 16', 'New', 'a']], toast: 'New job, from the field app' } },
  { k: 'members', re: /\b(members?|loyalty|rewards?|points|club|community|events?|tickets?|society|association|temple|church|fans?|volunteers?|ngo)\b/i, suf: 'Club', name: 'Club', ic: 'star', app: '#DB2777', soft: '#FCE4F0',
    hc: ['Your points', '1,240 points', 'Gold member', 'Next reward'], tiles: [['star', 'Rewards'], ['calendar', 'Events'], ['users', 'People'], ['chat', 'Chat']],
    rows: [['star', 'Points added', '+120 points', 'now', 'g'], ['calendar', 'Event booked', 'Sat, 6:00 pm', '1h', 'a'], ['bell', 'New offer', 'For Gold members', '', 'k']], tabs: ['home', 'star', 'calendar', 'user'],
    web: { nav: ['star', 'calendar', 'users', 'trend'], stats: [['Members', '1,240'], ['Events this month', '8'], ['Points given', '18,400']], cols: ['Member', 'Activity', 'Status'],
      rows: [['Rhea S.', 'Event booked', 'Gold', 'a'], ['Dev K.', 'Points added', 'Silver', 'k'], ['Tara M.', 'Reward used', 'Gold', 'a'], ['Nikhil J.', 'Joined', 'New', 'g']],
      feed: [['Asha P.', 'Joined', 'New', 'g'], ['Varun K.', 'Event booked', 'Silver', 'k'], ['Zoya R.', 'Reward used', 'Gold', 'a']], toast: 'New member, from the app' } }
];
var GENERIC = { k: 'app', suf: '', name: 'Your app', ic: 'spark', app: '#E2563B', soft: '#FCE9E4', hc: ['Today', 'Everything in one place', 'Live', 'Synced'], tiles: [['home', 'Home'], ['calendar', 'Plan'], ['card', 'Pay'], ['chat', 'Help']],
  rows: [['check', 'Signed in', 'With your phone', 'now', 'g'], ['bell', 'Notifications on', 'You will not miss a thing', '', 'a'], ['spark', 'Ready', 'Your idea, as an app', '', 'k']], tabs: ['home', 'grid', 'bell', 'user'],
  web: { nav: ['home', 'grid', 'users', 'trend'], stats: [['Users', '1,024'], ['Active today', '312'], ['Tasks done', '86']], cols: ['Item', 'Owner', 'Status'],
    rows: [['Onboarding', 'Team A', 'Done', 'g'], ['Approvals', 'Team B', 'In review', 'a'], ['Reports', 'Team C', 'Scheduled', 'k'], ['Payments', 'Team A', 'Done', 'g']],
    feed: [['New request', 'Team B', 'New', 'a'], ['New request', 'Team C', 'New', 'a'], ['New request', 'Team A', 'New', 'a']], toast: 'New item, from the app' } };
var NOUNS = /\b(salon|spa|clinic|gym|studio|restaurant|caf[eé]|bakery|kitchen|store|shop|boutique|school|academy|college|pharmacy|hotel|garage|society|club|temple|ngo|farm|dairy|kirana|parlou?r|tiffin|warehouse|factory|hospital|lab|business|company|brand|team)\b/i;
function byKey(k) { return TPL.filter(function (x) { return x.k === k; })[0] || GENERIC; }
function plan(idea) {
  var t = TPL.filter(function (x) { return x.re.test(idea); })[0] || GENERIC, m = idea.match(NOUNS), noun = m ? m[1].toLowerCase() : '';
  if (/^(business|company|brand|team)$/.test(noun)) noun = '';
  var name = noun ? (noun.charAt(0).toUpperCase() + noun.slice(1) + (t.suf ? ' ' + t.suf : '')) : t.name;
  return { t: t, name: name };
}
function hello() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function K(n) { return ' data-k style="transition-delay:' + (n * 90) + 'ms"'; }
function appHTML(p) {
  var t = p.t;
  return '<div class="a-hd"' + K(0) + '><div><small>' + hello() + '</small><strong>' + esc(p.name) + '</strong></div><span class="a-ic">' + ICON(t.ic) + '</span></div>' +
    '<div class="hc"' + K(1) + '><div class="hc-t"><small>' + t.hc[0] + '</small>' + ICON(t.ic) + '</div><strong>' + t.hc[1] + '</strong><div class="hc-r"><span class="okp">' + ICON('check') + t.hc[2] + '</span><span class="rem">' + ICON('bell') + t.hc[3] + '</span></div></div>' +
    '<div class="tiles"' + K(2) + '>' + t.tiles.map(function (x) { return '<span><i>' + ICON(x[0]) + '</i>' + x[1] + '</span>'; }).join('') + '</div>' +
    '<div class="lh"' + K(3) + '><b>Recent</b><small>See all</small></div>' +
    '<div class="rows"' + K(4) + '>' + t.rows.map(function (r) { return '<div class="rw"><div class="rw-in"><div class="rw-c"><span class="ri ' + r[4] + '">' + ICON(r[0]) + '</span><div><b>' + r[1] + '</b><small>' + r[2] + '</small></div><em>' + r[3] + '</em></div></div></div>'; }).join('') + '</div>';
}
var SPARK = ['M0 14 L12 12 L24 13 L36 8 L48 9 L60 5 L72 6 L84 2', 'M0 10 L12 12 L24 8 L36 9 L48 6 L60 7 L72 4 L84 5', 'M0 13 L12 9 L24 11 L36 7 L48 8 L60 6 L72 3 L84 4'];
function rowHTML(r, cls) { return '<div class="wb-tr' + (cls ? ' ' + cls : '') + '"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span><em class="st-p ' + r[3] + '">' + esc(r[2]) + '</em></div>'; }
function webHTML(p) {
  var t = p.t, w = t.web;
  return '<aside class="wb-side"><span class="wb-lg">' + ICON(t.ic) + '</span>' + w.nav.map(function (n, i) { return '<span' + (i ? '' : ' class="on"') + '>' + ICON(n) + '</span>'; }).join('') + '</aside>' +
    '<div class="wb-main"><div class="wb-hd"' + K(0) + '><div><small>' + hello() + '</small><strong>' + esc(p.name) + '</strong></div><span class="wb-new">+ New</span></div>' +
    '<div class="wb-stats"' + K(1) + '>' + w.stats.map(function (s, i) { return '<div class="wb-st"><small>' + esc(s[0]) + '</small><b>' + esc(s[1]) + '</b><svg viewBox="0 0 84 18" preserveAspectRatio="none"><path d="' + SPARK[i % 3] + '"/></svg></div>'; }).join('') + '</div>' +
    '<div class="wb-tbl"' + K(2) + '><div class="wb-th"><span>' + w.cols[0] + '</span><span>' + w.cols[1] + '</span><span>' + w.cols[2] + '</span></div><div class="wb-rows">' + w.rows.map(function (r) { return rowHTML(r); }).join('') + '</div></div></div>';
}
function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.app'; }

/* the agent's plans: what it reads, decides and does, in order */
var PLANS = {
  invoices: { title: 'Accounts desk AI', task: 'Match new invoices to orders', scope: 'Invoices, Orders', nodes: [['mail', 'Email'], ['spark', 'AI'], ['box', 'Orders'], ['user', 'You'], ['doc', 'Books']],
    seq: [['ev', '3 new invoices in the inbox', 0], ['think', 'Three invoices came in. I read each one and find its order.'], ['step', 'Read the 3 invoices', 'Suppliers A, B and C', 0, 'doc'], ['step', 'Match each one to its order', 'A and B match. C bills 2 cartons more.', 2, 'box'], ['think', 'C does not match its order. A person must decide this one.'], ['msg', 'Invoices A and B match their orders. Invoice C bills 2 cartons more than the order.'], ['ask', 'Enter A and B, and hold C for you?', 3], ['step', 'Update the books', 'A and B entered. C on hold.', 4, 'doc'], ['fin', 'Done. 2 invoices entered, 1 held for you. Nothing paid twice.']] },
  orders: { title: 'Order desk agent', task: 'A new order comes in by email', scope: 'Orders, Stock', nodes: [['mail', 'Email'], ['spark', 'Agent'], ['grid', 'Stock'], ['doc', 'Invoice'], ['chat', 'WhatsApp']],
    seq: [['ev', 'New email: an order from Customer A', 0], ['think', 'A new order came in. First, I read what the customer wants.'], ['step', 'Read the order email', '12 cartons, delivery by Friday', 0, 'mail'], ['think', 'Do we have 12 cartons? I check the stock sheet.'], ['step', 'Check the stock sheet', '40 cartons in stock', 2, 'grid'], ['msg', 'Order from Customer A: 12 cartons, all in stock. I am making the invoice now.'], ['step', 'Make the invoice', 'Invoice 2047 is ready', 3, 'doc'], ['think', 'Customer A is a new customer. I ask you before I send anything.'], ['ask', 'Invoice 2047 goes to a new customer. Send it?', -1], ['step', 'Send the invoice and the confirmation', 'By email and WhatsApp. Sent once.', 4, 'chat'], ['fin', 'Done. Customer A has the invoice, and dispatch has the order.']] },
  leads: { title: 'Lead desk agent', task: 'Reply to every new enquiry', scope: 'Enquiries, CRM', nodes: [['doc', 'Form'], ['spark', 'Agent'], ['users', 'CRM'], ['chat', 'WhatsApp'], ['calendar', 'Calendar']],
    seq: [['ev', 'New enquiry from your website', 0], ['think', 'A new enquiry. I check what they need and if it fits your rules.'], ['step', 'Read the enquiry', 'Wants a quote this week', 0, 'doc'], ['step', 'Check it against your rules', 'A good fit', 2, 'users'], ['step', 'Reply on WhatsApp', 'Sent in under a minute', 3, 'chat'], ['msg', 'New lead: wants a quote this week. I replied and offered two call times.'], ['step', 'Book the call', 'Tomorrow, 11 am', 4, 'calendar'], ['fin', 'Done. The lead has a reply and a call, and the CRM is up to date.']] },
  support: { title: 'Support agent', task: 'Answer new support tickets', scope: 'Tickets, Orders', nodes: [['mail', 'Inbox'], ['spark', 'Agent'], ['box', 'Orders'], ['user', 'You'], ['chat', 'Reply']],
    seq: [['ev', 'New ticket: “Where is my order?”', 0], ['think', 'The customer asks about an order. I look it up first.'], ['step', 'Find the order', '#2047, shipped yesterday', 2, 'box'], ['step', 'Write the reply', 'With the tracking link', 4, 'chat'], ['think', 'The answer is clear. This one does not need a person.'], ['step', 'Send the reply', 'The ticket is closed', 4, 'check'], ['msg', '2 other tickets ask for a refund. I kept those for you.'], ['fin', 'Done. The customer has the answer. The refunds wait for you.']] },
  reports: { title: 'Report agent', task: 'Build the weekly sales report', scope: 'Sales sheets', nodes: [['grid', 'Sheets'], ['spark', 'Agent'], ['trend', 'Report'], ['user', 'You'], ['mail', 'Email']],
    seq: [['ev', 'Monday, 9:00 am', 0], ['think', 'Time for the weekly sales report. I collect the numbers first.'], ['step', 'Collect sales from 4 sheets', '312 rows', 0, 'grid'], ['step', 'Check the numbers', '2 duplicate rows removed', 1, 'check'], ['step', 'Build the report', 'Sales up in 3 of 4 regions', 2, 'trend'], ['msg', 'The report is ready. One region is down. I marked it for you.'], ['step', 'Email it to the team', '8 people', 4, 'mail'], ['fin', 'Done. The team has the report, and it matches the sheets.']] },
  collections: { title: 'Payments agent', task: 'Chase unpaid invoices', scope: 'Invoices, Payments', nodes: [['doc', 'Books'], ['spark', 'Agent'], ['chat', 'WhatsApp'], ['user', 'You'], ['check', 'Paid']],
    seq: [['ev', 'Monday, 10:00 am', 0], ['think', 'I check which invoices are past their due date.'], ['step', 'Find the unpaid invoices', '6 are past due', 0, 'doc'], ['step', 'Send polite reminders', 'On WhatsApp and email', 2, 'chat'], ['msg', '2 customers promised to pay this week. 1 customer asks for a call.'], ['ask', 'Book the call that the customer asked for?', 3], ['step', 'Mark the payments that came in', '3 paid today', 4, 'check'], ['fin', 'Done. 3 invoices paid, and every reminder is logged.']] },
  generic: { title: 'Your agent', task: 'Your task', scope: 'Only what the task needs', nodes: [['doc', 'Input'], ['spark', 'Agent'], ['grid', 'Tools'], ['user', 'You'], ['check', 'Done']],
    seq: [['ev', 'New work comes in', 0], ['think', 'I read the work and decide the next step.'], ['step', 'Read the input', 'The details are clear', 0, 'doc'], ['step', 'Act in your tools', 'Records updated', 2, 'grid'], ['ask', 'This case is unusual. Go ahead?', 3], ['step', 'Finish the task', 'Logged, step by step', 4, 'check'], ['fin', 'Done. Every step is logged, and nothing ran twice.']] }
};
function pickPlan(text) {
  if (/\b(support|tickets?|complaints?|helpdesk|refunds?|returns?|customer service|queries)\b/i.test(text)) return PLANS.support;
  if (/\b(leads?|enquir\w*|inquir\w*|prospects?|follow[- ]?ups?|crm)\b/i.test(text)) return PLANS.leads;
  if (/\b(unpaid|overdue|chase|collect\w*|dues|reminders?|outstanding|receivables?)\b/i.test(text)) return PLANS.collections;
  if (/\b(match\w*|reconcil\w*|vendors?|suppliers?|payables?|ledger|books|tally|bills?)\b/i.test(text)) return PLANS.invoices;
  if (/\b(orders?|dispatch|shipments?|stock|inventory|warehouse)\b/i.test(text)) return PLANS.orders;
  if (/\binvoices?\b/i.test(text)) return PLANS.invoices;
  if (/\b(reports?|sheets?|excel|data|dashboards?|mis|numbers|sales)\b/i.test(text)) return PLANS.reports;
  return PLANS.generic;
}
function agentRun(root) {
  var hd = $('.ag-hd strong', root), tk = $('.ag-hd small', root), flow = $('.flow', root), box = $('.log', root), lg = $('.lg', root), scope = $('.ag-scope', root), cnt = $('.cnt b', root), tot = $('.cnt i', root);
  var A = [], i = 0, t = 0, on = false, loop = true, done = 0, nds = [], eds = [], cur = null;
  function node(k, st) {
    if (k < 0 || !nds[k]) return; var n = nds[k]; n.classList.remove('act', 'ok'); if (st) n.classList.add(st);
    for (var j = 0; j < eds.length; j++) { var c = nds[j + 1].classList; eds[j].classList.toggle('on', c.contains('act') || c.contains('ok')); }
  }
  function slide() { var off = Math.max(0, lg.offsetHeight - box.clientHeight); box.classList.toggle('ov', off > 0); lg.style.transform = off ? 'translateY(' + (-off) + 'px)' : 'none'; }
  function add(html) { $$('.th.go', lg).forEach(function (x) { x.classList.remove('go'); }); var w = d.createElement('div'); w.innerHTML = html; var e = w.firstChild; lg.appendChild(e); slide(); return e; }
  function reset() { lg.innerHTML = ''; lg.style.opacity = ''; slide(); root.classList.remove('fin'); nds.forEach(function (_, k) { node(k, null); }); done = 0; cnt.textContent = 0; }
  function build(P) {
    A = []; var steps = 0;
    P.seq.forEach(function (e) {
      var ty = e[0];
      if (ty === 'ev') A.push([function () { node(e[2], 'act'); add('<div class="ev">' + ICON('bell') + esc(e[1]) + '</div>'); }, 1200]);
      else if (ty === 'think') A.push([function () { node(1, 'act'); cur = add('<div class="th go"><span class="ic">' + ICON('spark') + '</span><div><span class="lb">Thinking</span><em>' + esc(e[1]) + '</em></div></div>'); }, 900], [function () { cur.classList.add('say'); }, 1700]);
      else if (ty === 'step') { steps++; A.push([function () { node(e[3], 'act'); cur = add('<div class="sp"><span class="ri a">' + ICON(e[4]) + '</span><div><b>' + esc(e[1]) + '</b><span class="ss"><span class="w">Working…</span><span class="y">' + esc(e[2]) + '</span></span></div><span class="st"><span class="pill b w"><span class="spin"></span>Working</span><span class="pill g y">' + ICON('check') + 'Done</span></span></div>'); }, 1350], [function () { cur.classList.add('dn'); node(e[3], 'ok'); done++; cnt.textContent = done; }, 800]); }
      else if (ty === 'msg') A.push([function () { add('<div class="ms"><span class="av">' + ICON('spark') + '</span><div class="bb"><small>To you</small>' + esc(e[1]) + '</div></div>'); }, 2100]);
      else if (ty === 'ask') A.push([function () { node(e[2], 'act'); cur = add('<div class="ak"><p><small>Needs your OK</small>' + esc(e[1]) + '</p><span class="rw2"><span class="bt"><span class="yes">Approve</span><span class="no">Not now</span></span><span class="okp2"><span class="pill g">' + ICON('check') + 'Approved by you</span></span></span></div>'); }, 1500], [function () { cur.classList.add('press'); }, 260], [function () { cur.classList.remove('press'); cur.classList.add('ok'); node(e[2], 'ok'); }, 1000]);
      else if (ty === 'fin') A.push([function () { node(1, 'ok'); add('<div class="dn2"><span class="ci">' + ICON('check') + '</span><span>' + esc(e[1]) + '</span></div>'); root.classList.add('fin'); }, 5200]);
    });
    tot.textContent = steps;
    if (loop) A.push([function () { lg.style.opacity = '0'; }, 450], [reset, 700]);
  }
  function setPlan(P, task) {
    hd.textContent = P.title; tk.textContent = 'Task: ' + (task || P.task); scope.textContent = 'Agent sees only: ' + P.scope;
    flow.innerHTML = P.nodes.map(function (n, j) { return (j ? '<i class="ed"></i>' : '') + '<div class="nd"><span class="ni">' + ICON(n[0]) + '</span><small>' + n[1] + '</small></div>'; }).join('');
    nds = $$('.nd', flow); eds = $$('.ed', flow); build(P); reset(); i = 0;
  }
  function tick() { if (!on) return; if (i >= A.length) { if (!loop) { on = false; return; } i = 0; } var a = A[i++]; a[0](); t = setTimeout(tick, a[1]); }
  return {
    load: function (P, task, lp) { clearTimeout(t); on = false; loop = lp; setPlan(P, task); if (RM) { A.forEach(function (a) { a[0](); }); $$('.th', lg).forEach(function (x) { x.classList.remove('go'); }); i = A.length; } },
    start: function () { if (on || RM || i >= A.length && !loop) return; on = true; t = setTimeout(tick, 400); },
    stop: function () { on = false; clearTimeout(t); }
  };
}

(function tryIt() {
  var sec = $('[data-try]'); if (!sec) return;
  var dev = sec.getAttribute('data-device') || 'phone', demoKey = sec.getAttribute('data-demo') || '';
  var stage = $('.stage', sec), tag = $('.sketch-tag span:last-child', sec), input = $('#idea', sec), chips = $$('.chip', sec), cta = $('.try-cta', sec), go = $('.go', sec);
  var mode = 'demo', current = '', buildT = 0, ctl = null;
  /* a device from src/devices registers itself; it gets its mount and returns start/stop/sketch */
  var REG = W.LABS_DEVICES || {}, mount = $('.dv-mount', sec);
  if (mount && REG[dev]) { try { ctl = REG[dev](mount, { demo: demoKey, RM: RM, hasIO: hasIO, icon: ICON, esc: esc, tag: function (s) { if (tag) tag.textContent = s; } }); } catch (e) { ctl = null; } }

  /* each device: start/stop its demo, and draw a sketch */
  if (!ctl && dev === 'phone') ctl = (function () {
    var scr = $('.scr', sec), app = $('.app', scr), tb = $('.tb', scr), tp = $('.tp', scr), newRow = $('.rw.new', scr), step = 0, t = 0, on = false;
    var DEMO = [
      function () { scr.classList.add('lockon'); scr.classList.remove('pushon', 'paidon'); if (tp) tp.classList.remove('tp-on'); if (newRow) newRow.classList.add('hid'); return 1500; },
      function () { scr.classList.remove('lockon'); return 1700; },
      function () { scr.classList.add('pushon'); return 2000; },
      function () { scr.classList.remove('pushon'); if (tp) tp.classList.add('tp-on'); return 700; },
      function () { scr.classList.add('paidon'); return 2000; },
      function () { scr.classList.remove('paidon'); if (tp) tp.classList.remove('tp-on'); if (newRow) newRow.classList.remove('hid'); return 3200; }
    ];
    function tick() { if (!on || mode !== 'demo') return; var ms = DEMO[step](); step = (step + 1) % DEMO.length; t = setTimeout(tick, ms); }
    if (RM) DEMO[5]();
    return {
      start: function () { if (on || mode !== 'demo' || RM) return; on = true; t = setTimeout(tick, 500); },
      stop: function () { on = false; clearTimeout(t); },
      sketch: function (idea, done) {
        var p = plan(idea); scr.classList.remove('lockon', 'pushon', 'paidon'); scr.classList.add('fade-out');
        buildT = setTimeout(function () {
          scr.style.setProperty('--app', p.t.app); scr.style.setProperty('--app-soft', p.t.soft);
          app.innerHTML = appHTML(p); tb.innerHTML = p.t.tabs.map(function (x, i) { return '<span' + (i ? '' : ' class="on"') + '>' + ICON(x) + '</span>'; }).join('');
          scr.classList.remove('fade-out'); scr.classList.add('building'); void app.offsetWidth;
          buildT = setTimeout(function () { scr.classList.remove('building'); done(); }, RM ? 0 : 650);
        }, RM ? 0 : 260);
      }
    };
  })();

  if (!ctl && dev === 'web') ctl = (function () {
    var web = $('.web', sec), appEl = $('.wb-app', web), url = $('.wb-bar .u', web), toast = $('.wb-toast span', web), toastBox = $('.wb-toast', web), t = 0, on = false, fi = 0, cur = null;
    function paint(p) { cur = p; web.style.setProperty('--app', p.t.app); web.style.setProperty('--app-soft', p.t.soft); appEl.innerHTML = webHTML(p); url.textContent = slug(p.name); }
    function feed() {
      if (!on || mode !== 'demo') return;
      var w = cur.t.web, r = w.feed[fi++ % w.feed.length], rows = $('.wb-rows', appEl);
      var e = d.createElement('div'); e.innerHTML = rowHTML(r, 'in'); rows.insertBefore(e.firstChild, rows.firstChild);
      while (rows.children.length > 4) rows.removeChild(rows.lastChild);
      var b = $('.wb-st b', appEl), n = parseInt((b.textContent || '').replace(/,/g, ''), 10); if (!isNaN(n) && /^\d[\d,]*$/.test(b.textContent)) { b.textContent = (n + 1).toLocaleString('en-US'); b.parentNode.classList.remove('bump'); void b.offsetWidth; b.parentNode.classList.add('bump'); }
      toast.textContent = w.toast; toastBox.classList.add('on'); setTimeout(function () { toastBox.classList.remove('on'); }, 1700);
      t = setTimeout(feed, 2600);
    }
    paint({ t: byKey(demoKey), name: byKey(demoKey).name });
    return {
      start: function () { if (on || mode !== 'demo' || RM) return; on = true; t = setTimeout(feed, 900); },
      stop: function () { on = false; clearTimeout(t); toastBox.classList.remove('on'); },
      sketch: function (idea, done) {
        var p = plan(idea); web.classList.add('fade-out');
        buildT = setTimeout(function () {
          paint(p); web.classList.remove('fade-out'); web.classList.add('building'); void appEl.offsetWidth;
          buildT = setTimeout(function () { web.classList.remove('building'); done(); }, RM ? 0 : 650);
        }, RM ? 0 : 260);
      }
    };
  })();

  if (!ctl && dev === 'agent') ctl = (function () {
    var root = $('.agentf', sec), run = agentRun(root), def = PLANS[demoKey] || PLANS.orders;
    run.load(def, '', true);
    return {
      start: function () { run.start(); }, stop: function () { run.stop(); },
      sketch: function (idea, done) {
        run.stop(); root.classList.add('fade-out');
        buildT = setTimeout(function () {
          var P = pickPlan(idea), task = idea.charAt(0).toUpperCase() + idea.slice(1);
          run.load(P, task, false); root.classList.remove('fade-out'); run.start(); done();
        }, RM ? 0 : 300);
      }
    };
  })();
  if (!ctl) return;
  if (hasIO) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !d.hidden) ctl.start(); else ctl.stop(); }, { threshold: .25 }).observe(stage);
  else ctl.start();
  d.addEventListener('visibilitychange', function () { if (d.hidden) ctl.stop(); });

  function show() { var r = stage.getBoundingClientRect(); if (r.top < 60 || r.bottom > W.innerHeight) W.scrollTo({ top: W.scrollY + r.top + r.height / 2 - W.innerHeight / 2, behavior: RM ? 'auto' : 'smooth' }); }
  function sketch(idea, reveal) {
    idea = idea.trim(); if (reveal) show(); if (idea.length < 3 || idea === current) return; current = idea;
    if (mode === 'demo' && !/agent|ai/.test(dev)) ctl.stop();
    mode = 'sketch'; clearTimeout(buildT);
    stage.classList.add('building'); tag.textContent = /agent|ai/.test(dev) ? 'Planning the steps…' : 'Drawing your sketch…';
    ctl.sketch(idea, function () {
      stage.classList.remove('building');
      tag.textContent = dev === 'aiwork' ? 'Your AI task · working demo in 3 days' : /agent|ai/.test(dev) ? 'Your agent · working demo in 3 days' : 'Your sketch · working demo in 3 days';
      if (cta && !cta.classList.contains('on')) cta.classList.add('on');
    });
  }
  var deb = 0;
  if (input) {
    input.addEventListener('input', function () { clearTimeout(deb); chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); }); deb = setTimeout(function () { sketch(input.value); }, /agent|ai/.test(dev) ? 1100 : 650); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(deb); input.blur(); sketch(input.value, true); } });
  }
  if (go) go.addEventListener('click', function () { clearTimeout(deb); sketch(input.value || input.placeholder.replace(/^e\.g\.\s*/i, ''), true); });
  chips.forEach(function (c) { c.addEventListener('click', function () {
    chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
    var text = c.getAttribute('data-idea'); input.value = text; clearTimeout(deb); sketch(text, true);
  }); });
  var cb = cta && $('a', cta);
  if (cb) cb.addEventListener('click', function (e) { e.preventDefault(); toQuote(current || (input && input.value)); });
})();

/* ---------- impact: each screenshot pans as if scrolled, each number counts up (ImpactShots) ---------- */
(function impact() {
  var cards = $$('.shot'); if (!cards.length) return;
  function fmt(n, el) { var dec = +(el.getAttribute('data-dec') || 0); return el.hasAttribute('data-grp') ? n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : n.toFixed(dec); }
  function count(c) { var ns = $$('.num', c), t0 = performance.now(); (function f(now) { var k = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - k, 3); ns.forEach(function (el) { el.textContent = fmt(+el.getAttribute('data-to') * e, el); }); if (k < 1) requestAnimationFrame(f); })(t0); }
  if (RM || !hasIO) { cards.forEach(function (c) { c.setAttribute('data-in', ''); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; e.target.setAttribute('data-in', ''); count(e.target); io.unobserve(e.target); }); }, { threshold: .4 });
  cards.forEach(function (c) { io.observe(c); });
})();

/* ---------- numbers that assemble out of amber particles (ParticleNumber) ---------- */
(function particles() {
  var els = $$('[data-pn]');
  if (!els.length || RM || !hasIO || !d.createElement('canvas').getContext) return;
  var insts = [], mouse = { x: -1e9, y: -1e9 }, looping = false, DUR = 2400, SZ = 1.8;
  els.forEach(function (el) { var text = $('.pn-text', el), cv = $('.pn-canvas', el), ctx = cv && cv.getContext('2d'); if (text && ctx) insts.push({ el: el, text: text, cv: cv, ctx: ctx, P: [], started: false, rgb: '255,189,89' }); });
  function sample(i) {
    var cs = getComputedStyle(i.text), r = i.el.getBoundingClientRect(), fs = parseFloat(cs.fontSize);
    i.W = Math.ceil(r.width); i.H = Math.ceil(r.height); i.pad = Math.round(1.2 * i.H); i.CW = i.W + i.pad * 2; i.CH = i.H + i.pad * 2;
    var m = cs.color.match(/\d+(\.\d+)?/g); if (m && m.length >= 3) i.rgb = m[0] + ',' + m[1] + ',' + m[2];
    i.cv.style.left = -i.pad + 'px'; i.cv.style.top = -i.pad + 'px'; i.cv.style.width = i.CW + 'px'; i.cv.style.height = i.CH + 'px';
    var dpr = Math.min(W.devicePixelRatio || 1, 2); i.cv.width = Math.round(i.CW * dpr); i.cv.height = Math.round(i.CH * dpr); i.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var off = d.createElement('canvas'); off.width = i.CW; off.height = i.CH; var ox = off.getContext('2d');
    ox.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily; if ('letterSpacing' in ox) ox.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    ox.fillStyle = '#fff'; ox.textBaseline = 'alphabetic';
    var val = i.text.textContent, tm = ox.measureText(val), asc = tm.fontBoundingBoxAscent || fs * .8, desc = tm.fontBoundingBoxDescent || fs * .2;
    ox.fillText(val, i.pad + (i.W - tm.width) / 2, i.pad + (i.H - (asc + desc)) / 2 + asc);
    var step = fs >= 44 ? 3 : 2, img = ox.getImageData(0, 0, i.CW, i.CH).data, out = [];
    for (var y = 0; y < i.CH; y += step) for (var x = 0; x < i.CW; x += step) if (img[(y * i.CW + x) * 4 + 3] > 128) out.push([x, y]);
    return out;
  }
  function frame(now) {
    requestAnimationFrame(frame);
    insts.forEach(function (i) {
      if (!i.started) return; var rect = i.cv.getBoundingClientRect(); if (rect.bottom < -100 || rect.top > W.innerHeight + 100) return;
      var k = Math.min(1, (now - i.t0) / DUR), e = 1 - Math.pow(1 - k, 3), mx = mouse.x - rect.left, my = mouse.y - rect.top, x = i.ctx;
      x.clearRect(0, 0, i.CW, i.CH); x.fillStyle = 'rgba(' + i.rgb + ',' + (.35 + e * .55) + ')';
      i.P.forEach(function (p) {
        p.vx += (p.tx - p.x) * .05 * e; p.vy += (p.ty - p.y) * .05 * e; p.vx *= .8; p.vy *= .8;
        if (k > .95) { var dx = p.x - mx, dy = p.y - my, dd = Math.hypot(dx, dy); if (dd < 80 && dd > 0) { p.vx += dx / dd * (1 - dd / 80) * .8; p.vy += dy / dd * (1 - dd / 80) * .8; } }
        p.x += p.vx; p.y += p.vy; x.fillRect(p.x, p.y, SZ, SZ);
      });
    });
  }
  insts.forEach(function (i) { i.el.setAttribute('data-live', ''); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (en) {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    var i = insts.filter(function (x) { return x.el === en.target; })[0]; if (!i) return;
    fontsReady.then(function () { try { var tg = sample(i); i.P = tg.map(function (p) { return { x: rnd(0, i.CW), y: rnd(0, i.CH), vx: 0, vy: 0, tx: p[0], ty: p[1] }; }); i.t0 = performance.now(); i.started = true; if (!looping) { looping = true; requestAnimationFrame(frame); } } catch (e) { i.el.removeAttribute('data-live'); } });
  }); }, { threshold: .5 });
  insts.forEach(function (i) { io.observe(i.el); });
  d.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  var lw = W.innerWidth, rt = 0;
  W.addEventListener('resize', function () { if (W.innerWidth === lw) return; lw = W.innerWidth; clearTimeout(rt); rt = setTimeout(function () { insts.forEach(function (i) { if (!i.started) return; var tg = sample(i); i.P = tg.map(function (p, j) { var o = i.P[j]; return o ? { x: o.x, y: o.y, vx: o.vx, vy: o.vy, tx: p[0], ty: p[1] } : { x: p[0], y: p[1], vx: 0, vy: 0, tx: p[0], ty: p[1] }; }); }); }, 150); });
})();

/* ---------- the worries: each one is struck, then answered, one after the other ---------- */
(function worries() {
  var rows = $$('.wr'); if (!rows.length) return;
  if (RM || !hasIO) { rows.forEach(function (r) { r.classList.add('struck', 'answered'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; io.unobserve(e.target); var r = e.target;
    setTimeout(function () { r.classList.add('struck'); setTimeout(function () { r.classList.add('answered'); }, 520); }, 700);
  }); }, { threshold: .6 });
  rows.forEach(function (r) { io.observe(r); });
})();

/* ---------- how it works: the rail draws as you scroll, and each step lights when the line reaches it ---------- */
(function rail() {
  var list = $('.tl'); if (!list) return;
  var nodes = $$('.node', list), first = nodes[0], last = nodes[nodes.length - 1], wide = W.matchMedia('(min-width: 1000px)'), start = 0, track = 0, q = false;
  function centre(n) { var l = list.getBoundingClientRect(), r = n.getBoundingClientRect(); return wide.matches ? r.left - l.left + r.width / 2 : r.top - l.top + r.height / 2; }
  function measure() { start = centre(first); track = Math.max(0, centre(last) - start); list.style.setProperty('--track', track + 'px'); }
  function draw() {
    q = false; var box = list.getBoundingClientRect(), anchor = W.innerHeight * .75, p;
    if (wide.matches) { p = (anchor - box.top) / (W.innerHeight * .3); } else { p = (anchor - (box.top + start)) / Math.max(1, track); }
    p = Math.max(0, Math.min(1, p)); list.style.setProperty('--rail', p.toFixed(4));
    nodes.forEach(function (n) { var at = track ? (centre(n) - start) / track : 0; if (p + .001 >= at) n.removeAttribute('data-dim'); else n.setAttribute('data-dim', ''); });
  }
  if (RM) { measure(); list.style.setProperty('--rail', 1); return; }
  function req() { if (!q) { q = true; requestAnimationFrame(draw); } }
  fontsReady.then(function () { measure(); draw(); });
  W.addEventListener('scroll', req, { passive: true }); W.addEventListener('resize', function () { measure(); req(); }, { passive: true });
})();

/* ---------- what founders say: the review is said, word by word, when it comes into view ---------- */
(function review() {
  $$('.quote').forEach(function (q) {
    var bq = $('blockquote', q); if (!bq) return;
    if (RM) { q.classList.add('done'); return; }
    var words = wrapWords(bq);
    $$('p', bq).forEach(function (p, i, all) { if (i < all.length - 1) { var ws = $$('.w', p); if (ws.length) ws[ws.length - 1].setAttribute('data-pause', ''); } });
    onView(q, function () { speak(words, { lead: 300, tail: 1200, rate: .62 }).then(function () { q.classList.add('done'); }); }, .35);
  });
})();

/* ---------- questions: open and close with an eased height ---------- */
(function faq() {
  $$('.qa details').forEach(function (dt) {
    var sm = $('summary', dt), ans = $('.ans', dt), anim = null;
    sm.addEventListener('click', function (e) {
      if (RM || !ans.animate) return; e.preventDefault(); if (anim) anim.cancel();
      if (dt.open) { var h = ans.offsetHeight; anim = ans.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.3,0,.1,1)' }); anim.onfinish = function () { dt.open = false; anim = null; }; }
      else { dt.open = true; var h2 = ans.offsetHeight; anim = ans.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' }); anim.onfinish = function () { anim = null; }; }
    });
  });
})();
})();
