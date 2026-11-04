/* "Try it" device "aiwork" (D-91), AI development page.
 One business app window. The AI reads real work, shows what it found (boxes, confidence, reasons),
 checks it against the records it may see, and hands unsure work to a person. No libraries, no network. */
(function () {
 'use strict';
 var W = window, D = document, NS = 'http://www.w3.org/2000/svg';

 W.LABS_DEVICES = W.LABS_DEVICES || {};
 W.LABS_DEVICES.aiwork = function (mount, cfg) {
  cfg = cfg || {};
  var RM = !!cfg.RM;
  var I = function (id) { try { return cfg.icon ? cfg.icon(id) : ''; } catch (e) { return ''; } };
  var E = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var XS = '<svg class="i" viewBox="0 0 24 24"><path d="M7.5 7.5l9 9M16.5 7.5l-9 9"/></svg>', BANG = '<b class="aw-bang">!</b>';

  /* ---------- the window ---------- */
  mount.innerHTML = '<div class="aw-win' + (RM ? ' aw-rm' : '') + '">' +
   '<div class="aw-hd"><span class="aw-mk">' + I('spark') + '</span><div class="aw-ti"><small></small><b></b></div>' +
   '<span class="aw-st" data-s="idle"><i></i><span></span></span><i class="aw-pg"></i></div>' +
   '<div class="aw-kp"></div><div class="aw-main"></div><div class="aw-ft"></div>' +
   '<svg class="aw-th" aria-hidden="true"></svg>' +
   '<span class="aw-cur"><svg viewBox="0 0 20 20"><path d="M4 2.5v14l3.6-3.4 2.5 5.4 2.3-1-2.5-5.3h5.1z"/></svg></span></div>';
  var win = mount.firstChild;
  function $(s, r) { return (r || win).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || win).querySelectorAll(s)); }
  var main = $('.aw-main'), kp = $('.aw-kp'), ft = $('.aw-ft'), th = $('.aw-th'), cur = $('.aw-cur'), st = $('.aw-st'), pg = $('.aw-pg'), lastP = 0;

  /* ---------- small parts every scene uses ---------- */
  function status(s, txt) { st.setAttribute('data-s', s); st.lastChild.innerHTML = '<em>' + E(txt) + '</em>'; }
  function prog(p) {
   if (p < lastP) { pg.style.transition = 'none'; pg.style.transform = 'scaleX(0)'; void pg.offsetWidth; pg.style.transition = ''; }
   lastP = p; pg.style.transform = 'scaleX(' + p + ')'; pg.classList.toggle('is-ok', p >= 1);
  }
  var vals = [];
  function num(v) { return v.toLocaleString('en-US'); }
  function kpis(list) { vals = list.map(function (k) { return k[1]; }); kp.innerHTML = list.map(function (k) { return '<div class="aw-k"><small>' + E(k[0]) + '</small><b>' + num(k[1]) + '</b></div>'; }).join(''); }
  function bump(i, by) {
   var c = kp.children[i]; if (!c) return; by = by || 1; vals[i] += by;
   c.lastChild.innerHTML = '<span>' + num(vals[i]) + '</span>'; c.setAttribute('data-up', '+' + num(by));
   c.classList.remove('is-up'); void c.offsetWidth; c.classList.add('is-up');
  }
  function foot(t) {
   ft.innerHTML = '<span class="aw-sc">' + I('lock') + '<span>The AI sees only</span></span>' +
    t.scope.map(function (s) { return '<em>' + I('check') + E(s) + '</em>'; }).join('') + (t.deny ? '<s>' + I('lock') + E(t.deny) + '</s>' : '');
  }
  function rel(el) { var w = win.getBoundingClientRect(), r = el.getBoundingClientRect(); return { l: r.left - w.left, t: r.top - w.top, r: r.right - w.left, b: r.bottom - w.top, w: r.width, h: r.height }; }
  /* a thread of light from what the AI looked at to where it put it */
  function thread(a, b, tone) {
   if (RM || !a || !b) return;
   var A = rel(a), B = rel(b), d, x1, y1, x2, y2, m, cd = a.tagName === 'MARK' && a.closest ? a.closest('.aw-cd') : null;
   if (cd && A.r <= B.l + 2) A.r = rel(cd).r; /* a phrase in a message: start at the card's edge, not across the text */
   if (A.r <= B.l + 2) { x1 = A.r; y1 = A.t + A.h / 2; x2 = B.l; y2 = B.t + Math.min(B.h / 2, 18); m = (x2 - x1) / 2; d = 'M' + x1 + ' ' + y1 + 'C' + (x1 + m) + ' ' + y1 + ' ' + (x2 - m) + ' ' + y2 + ' ' + x2 + ' ' + y2; }
   else if (A.b <= B.t + 2) { x1 = A.l + Math.min(A.w / 2, 60); y1 = A.b; x2 = B.l + Math.min(B.w / 2, 40); y2 = B.t; m = (y2 - y1) / 2; d = 'M' + x1 + ' ' + y1 + 'C' + x1 + ' ' + (y1 + m) + ' ' + x2 + ' ' + (y2 - m) + ' ' + x2 + ' ' + y2; }
   else return;
   var g = D.createElementNS(NS, 'g'); g.setAttribute('class', 'aw-tl' + (tone ? ' ' + tone : ''));
   g.innerHTML = '<path d="' + d + '"/><circle cx="' + x1 + '" cy="' + y1 + '" r="2.6"/><circle cx="' + x2 + '" cy="' + y2 + '" r="2.6"/>';
   th.appendChild(g);
   var p = g.firstChild, L = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 400;
   p.style.strokeDasharray = L; p.style.strokeDashoffset = L; void p.getBoundingClientRect();
   g.classList.add('is-on'); p.style.strokeDashoffset = 0;
   while (th.childNodes.length > 3) th.removeChild(th.firstChild);
  }
  /* the person's cursor */
  function curTo(el) {
   if (RM || !el) return;
   var r = rel(el), x = Math.round(r.l + r.w * .58), y = Math.round(r.t + r.h * .6);
   if (!cur.classList.contains('is-on')) {
    cur.style.transition = 'none'; cur.style.transform = 'translate(' + (win.clientWidth - 24) + 'px,' + (win.clientHeight - 6) + 'px)';
    void cur.offsetWidth; cur.style.transition = ''; cur.classList.add('is-on');
   }
   cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function click(el) { if (el) el.classList.add('is-press'); if (RM) return; cur.classList.remove('is-click'); void cur.offsetWidth; cur.classList.add('is-click'); }
  function curOff() { cur.classList.remove('is-on', 'is-click'); }
  /* rows: label · value · confidence · result */
  function val(v) { return v === 0 ? '<i class="aw-ab"></i>' : E(v); }
  function rowsHTML(f) {
   return f.map(function (x) { return '<div class="aw-r"><span class="aw-rl">' + E(x[0]) + '</span><span class="aw-rv"><b>' + val(x[1]) + '</b></span><span class="aw-rp' + (parseInt(x[2], 10) < 80 ? ' aw-lo' : '') + '">' + (x[2] || '') + '</span><span class="aw-rs"></span></div>'; }).join('');
  }
  function rowState(r, s) { r.classList.add('is-' + s); r.lastChild.innerHTML = s === 'ok' ? I('check') : s === 'no' ? XS : BANG; }
  /* the verdict card */
  var VD = '<div class="aw-vd"><span class="aw-vi"></span><span class="aw-vt"><b></b><small></small></span><span class="aw-va"></span></div>';
  function verdict(v, kind, t, s, acts) {
   v.className = 'aw-vd is-in is-' + kind;
   v.children[0].innerHTML = kind === 'ok' ? I('check') : kind === 'no' ? XS : BANG;
   v.children[1].innerHTML = '<b>' + E(t) + '</b><small>' + E(s) + '</small>';
   v.children[2].innerHTML = (acts || []).map(function (a, i) { return '<span class="aw-bt' + (i ? '' : ' aw-pri') + '">' + E(a) + '</span>'; }).join('');
  }
  function settle(v, t, pill, sub) {
   v.className = 'aw-vd is-in is-ok'; v.children[0].innerHTML = I('check');
   v.children[1].firstChild.textContent = t; if (sub) v.children[1].lastChild.textContent = sub; v.children[2].innerHTML = '<span class="aw-bt is-done">' + I('check') + E(pill || 'Done') + '</span>';
  }
  function stream(html, start) { /* words appear one by one, like the AI writing */
   var k = start || 0;
   return html.map(function (s) {
    var fact = typeof s !== 'string', txt = fact ? s[0] : s;
    var out = txt.split(/(\s+)/).map(function (w) { return !w || /^\s+$/.test(w) ? w : '<span style="--d:' + (k++ * 34) + 'ms">' + E(w) + '</span>'; }).join('');
    return fact ? '<mark' + (s[1] ? ' data-c="' + s[1] + '"' : '') + '>' + out + '</mark>' + (s[1] ? '<sup data-c="' + s[1] + '">' + s[1] + '</sup>' : '') : out;
   }).join('');
  }

  /* ================= scene 1: documents (the default: invoices) ================= */
  var DOCS = {
   inv: [{
    title: 'Invoice', brand: 'Supplier B', sub: 'Plot 7, Industrial Area',
    meta: [['Invoice no.', 'INV-20418'], ['Date', '29 Oct 2026'], ['Tax no.', 'TX-29-5521'], ['Bill to', 'Your company']],
    th: ['Item', 'Qty', 'Amount'], rows: [['Steel brackets', '400', 34], ['Door hinges', '1,200', 26], ['Packing', '1', 14]], total: 'Total', ref: 'Order ref. PO-7731',
    f: [['Supplier', 'Supplier B', '99%', 'brand'], ['Invoice no.', 'INV-20418', '99%', 'm0'], ['Date', '29 Oct 2026', '98%', 'm1'], ['Tax no.', 'TX-29-5521', '96%', 'm2'], ['Items', '3 lines · 1,601 units', '97%', 'tb'], ['Total', 0, '99%', 'tt']],
    chk: 'order PO-7731',
    bad: { f: 4, row: 1, tag: 'Order says 1,000', t: 'Needs a person', s: 'Hinges: 1,200 billed, 1,000 ordered.', acts: ['Approve', 'Ask supplier'], done: 'Approved by a person', stamp: 'Approved' }
   }, {
    title: 'Invoice', brand: 'Supplier A', sub: '12 Market Road',
    meta: [['Invoice no.', 'INV-20417'], ['Date', '28 Oct 2026'], ['Tax no.', 'TX-29-4417'], ['Bill to', 'Your company']],
    th: ['Item', 'Qty', 'Amount'], rows: [['Copper wire', '250', 30], ['Cable ties', '2,000', 22], ['Delivery', '1', 12]], total: 'Total', ref: 'Order ref. PO-7729',
    f: [['Supplier', 'Supplier A', '99%', 'brand'], ['Invoice no.', 'INV-20417', '99%', 'm0'], ['Date', '28 Oct 2026', '99%', 'm1'], ['Tax no.', 'TX-29-4417', '98%', 'm2'], ['Items', '3 lines · 2,251 units', '97%', 'tb'], ['Total', 0, '99%', 'tt']],
    chk: 'order PO-7729',
    ok: { t: 'Matched to PO-7729', s: 'All 6 checks passed. Ready to pay.', stamp: 'Matched' }
   }],
   ord: [{
    title: 'Order', brand: 'Customer C', sub: 'Sent by email',
    meta: [['Order no.', 'SO-5530'], ['Date', '29 Oct 2026'], ['Deliver to', 'Warehouse 2'], ['Deliver by', '5 Nov 2026']],
    th: ['Item', 'Qty', 'Unit'], rows: [['Item A', '240', 'Box'], ['Item C', '100', 'Box']], ref: 'Customer ref. C-118',
    f: [['Customer', 'Customer C', '99%', 'brand'], ['Order no.', 'SO-5530', '99%', 'm0'], ['Date', '29 Oct 2026', '98%', 'm1'], ['Deliver to', 'Warehouse 2', '96%', 'm2'], ['Deliver by', '5 Nov 2026', '95%', 'm3'], ['Items', '2 lines · 340 boxes', '97%', 'tb']],
    chk: 'stock and customers',
    bad: { f: 5, row: 1, tag: '60 in stock', t: 'Needs a person', s: 'Item C: 100 ordered, 60 in stock.', acts: ['Split order', 'Call'], done: 'Split by a person', stamp: 'Approved' }
   }],
   frm: [{
    title: 'Application', brand: 'Applicant A', sub: 'Online form',
    meta: [['Form no.', 'APP-3307'], ['Date', '30 Oct 2026'], ['ID no.', 'XXXX-XX-4417'], ['Type', 'New account']],
    th: ['Document', 'Pages', 'Status'], rows: [['ID proof', '2', 'Attached'], ['Address proof', '1', 'Attached'], ['Photo', '0', 'Missing']], ref: 'Signed: yes',
    f: [['Name', 'Applicant A', '99%', 'brand'], ['Form no.', 'APP-3307', '99%', 'm0'], ['Date', '30 Oct 2026', '98%', 'm1'], ['ID no.', 'XXXX-XX-4417', '94%', 'm2'], ['Type', 'New account', '97%', 'm3'], ['Documents', '3 listed · 2 attached', '96%', 'tb']],
    chk: 'your rules',
    bad: { f: 5, row: 2, tag: 'Photo missing', t: 'Needs a person', s: 'The photo is missing. Ask the applicant?', acts: ['Ask for it', 'Open'], done: 'Request sent by a person', stamp: 'On hold' }
   }],
   cv: [{
    title: 'Resume', brand: 'Candidate A', sub: 'Applied for Sales lead',
    meta: [['Role', 'Sales lead'], ['Experience', '6 years'], ['Location', 'Bengaluru'], ['Notice', '30 days']],
    th: ['Skill', 'Years', ''], rows: [['Field sales', '6', ''], ['Key accounts', '4', ''], ['Team lead', '2', '']], ref: 'Languages: English, Kannada',
    f: [['Name', 'Candidate A', '99%', 'brand'], ['Role', 'Sales lead', '99%', 'm0'], ['Experience', '6 years', '97%', 'm1'], ['Location', 'Bengaluru', '98%', 'm2'], ['Notice', '30 days', '95%', 'm3'], ['Skills', '3 match the job', '93%', 'tb']],
    chk: 'the job post',
    ok: { t: 'Shortlisted · 92% fit', s: 'Meets all 5 must-haves. A person books the call.', stamp: 'Shortlist' }
   }],
   gen: [{
    title: 'Request', brand: 'Team A', sub: 'Sent by email',
    meta: [['Request no.', 'REQ-1182'], ['Date', '30 Oct 2026'], ['Subject', ''], ['Needed by', '1 Nov 2026']], ref: 'Priority: not given',
    f: [['From', 'Team A', '99%', 'brand'], ['Request no.', 'REQ-1182', '99%', 'm0'], ['Date', '30 Oct 2026', '98%', 'm1'], ['Subject', '', '95%', 'm2'], ['Details', '3 points, summed up', '92%', 'tb'], ['Needed by', '1 Nov 2026', '96%', 'm3']],
    chk: 'your rules',
    bad: { f: 5, row: -1, tag: 'Rule: 5 days', t: 'Needs a person', s: 'Needed in 2 days. Your rule says 5.', acts: ['Approve', 'Reply'], done: 'Approved by a person', stamp: 'Approved' }
   }]
  };

  function paper(d) {
   var h = '<div class="aw-pp"><div class="aw-ph" data-b="brand"><span class="aw-lg">' + E(d.brand.slice(-1)) + '</span><span><b>' + E(d.brand) + '</b><small>' + E(d.sub) + '</small></span></div><span class="aw-pt">' + E(d.title) + '</span><div class="aw-pm">';
   d.meta.forEach(function (m, i) { h += '<div data-b="m' + i + '"><span>' + E(m[0]) + '</span><b>' + E(m[1]) + '</b></div>'; });
   h += '</div>';
   if (d.rows) {
    h += '<div class="aw-tb"><div class="aw-tr aw-thd">' + d.th.map(function (x) { return '<span>' + E(x) + '</span>'; }).join('') + '</div><div data-b="tb">' +
     d.rows.map(function (r, i) { return '<div class="aw-tr" data-r="' + i + '"><span>' + E(r[0]) + '</span><span>' + E(r[1]) + '</span>' + (typeof r[2] === 'number' ? '<span><i style="width:' + r[2] + 'px"></i></span>' : '<span>' + E(r[2]) + '</span>') + '</div>'; }).join('') + '</div></div>';
   } else h += '<div class="aw-lines" data-b="tb"><i></i><i></i><i></i></div>';
   if (d.total) h += '<div class="aw-tt"><span data-b="tt"><span>' + E(d.total) + '</span><i></i></span></div>';
   return h + '<div class="aw-rf"><span data-b="rf">' + E(d.ref) + '</span></div><i class="aw-scan"></i><span class="aw-stp"></span></div>';
  }
  function docView(d) {
   return '<div class="aw-doc"><div class="aw-dp"><span class="aw-dl">' + I('mail') + 'New ' + E(d.title.toLowerCase()) + '</span><div class="aw-pw">' + paper(d) + '</div></div>' +
    '<div class="aw-fm"><div class="aw-fh"><span>Read by AI</span><em>0/' + d.f.length + '</em></div><div class="aw-rows">' + rowsHTML(d.f) + '</div>' + VD + '</div></div>';
  }
  function box(pp, el, label, cls) {
   var b = D.createElement('span'); b.className = 'aw-bx ' + (cls || '');
   b.style.cssText = 'left:' + (el.offsetLeft - 4) + 'px;top:' + (el.offsetTop - 3) + 'px;width:' + (el.offsetWidth + 8) + 'px;height:' + (el.offsetHeight + 6) + 'px';
   if (label) b.innerHTML = '<em>' + E(label) + '</em>';
  if (cls === 'is-act' && el.offsetLeft + el.offsetWidth + 90 < pp.clientWidth) b.className += ' is-r'; /* room on the right: the label sits beside, not on the line above */
   pp.appendChild(b); void b.offsetWidth; b.classList.add('is-in'); return b;
  }
  function docSteps(d) {
   var pp = $('.aw-pp', main), pw = $('.aw-pw', main), dp = $('.aw-dp', main), fm = $('.aw-fm', main), fh = $('.aw-fh', main), rows = $$('.aw-r', main), vd = $('.aw-vd', main), n = d.f.length, bx = [], bad = d.bad, sub = null;
   function at(k) { return $('[data-b="' + k + '"]', pp); }
   function pan(el, slow) { /* on a small screen the page moves so the part being read stays in view */
    var V = dp.clientHeight - pw.offsetTop, max = Math.max(0, pw.offsetHeight - V + 14), y = el === 1 ? max : el ? el.offsetTop + el.offsetHeight / 2 - V / 2 : 0;
    y = Math.round(Math.min(max, Math.max(0, y)));
    if (y === (pw._y || 0)) return 0;
    pw._y = y; pw.style.transitionDuration = slow ? '1.7s' : ''; pw.style.transform = 'translateY(' + -y + 'px)';
    return 1;
   }
   q(function () { status('work', 'Reading'); prog(.04); pp.classList.add('is-in'); }, 800);
   q(function () { pp.classList.add('is-scan'); fm.classList.add('is-scan'); pan(1, 1); }, 1800);
   d.f.forEach(function (f, i) {
    q(function () { if (!i) pp.classList.remove('is-scan'); return pan(at(f[3])) ? 520 : 40; });
    q(function () {
     if (i) { bx[i - 1].classList.remove('is-act'); rows[i - 1].classList.remove('is-on'); }
     bx[i] = box(pp, at(f[3]), f[0], 'is-act');
     rows[i].classList.add('is-on', 'is-v');
     thread(bx[i], rows[i]);
     fh.lastChild.textContent = (i + 1) + '/' + n;
     prog(.06 + .52 * (i + 1) / n);
    }, 640);
   });
   q(function () { bx[n - 1].classList.remove('is-act'); rows[n - 1].classList.remove('is-on'); fm.classList.remove('is-scan'); fh.firstChild.textContent = 'Checking ' + d.chk; status('work', 'Checking'); bump(0); }, 650);
   d.f.forEach(function (f, i) {
    var b = bad && bad.f === i, tgt = b && bad.row >= 0 ? function () { return $('[data-r="' + bad.row + '"]', pp); } : function () { return at(f[3]); };
    if (b) q(function () { return pan(tgt()) ? 500 : 30; });
    q(function () {
     rowState(rows[i], b ? 'bad' : 'ok'); bx[i].classList.add(b ? 'is-bad' : 'is-ok');
     if (b) { sub = bad.row >= 0 ? box(pp, tgt(), bad.tag, 'is-sub') : bx[i]; if (bad.row < 0) { sub.innerHTML = '<em>' + E(bad.tag) + '</em>'; sub.classList.add('is-sub'); } thread(sub, rows[i], 'is-warn'); }
     prog(.6 + .3 * (i + 1) / n);
    }, b ? 900 : 300);
   });
   if (bad) {
    q(function () { fh.firstChild.textContent = 'Checked against ' + d.chk; status('ask', 'Needs a person'); verdict(vd, 'bad', bad.t, bad.s, bad.acts); bump(2); }, 1300);
    q(function () { curTo($('.aw-pri', vd)); }, 1100);
    q(function () { click($('.aw-pri', vd)); }, 420);
    q(function () { settle(vd, bad.done, 'Done'); stamp(pp, bad.stamp); if (sub) sub.classList.add('is-calm'); status('ok', 'Done'); prog(1); }, 1300);
    q(function () { curOff(); }, 2000);
   } else {
    q(function () { fh.firstChild.textContent = 'Checked against ' + d.chk; verdict(vd, 'ok', d.ok.t, d.ok.s); stamp(pp, d.ok.stamp); status('ok', 'Done'); bump(1); prog(1); }, 3400);
   }
   if (loop) q(function () { pp.classList.add('is-out'); }, 420);
  }
  function stamp(pp, t) { var s = $('.aw-stp', pp); s.textContent = t; s.classList.add('is-on'); }

  /* ================= scene 2: customer messages ================= */
  var MSG = {
   sub: 'When will my order arrive?', who: 'Customer · by email · 09:41',
   body: ['Hi, I ordered ', ['2 office chairs', 3], ' last week, ', ['order 4471', 3], '. ', ['When will they arrive?', 0], ' I need them ', ['before Friday', 1], '.'],
   tags: [['Intent', 'Delivery date', '97%'], ['Urgency', 'High · by Friday', '93%', 1], ['Mood', 'Calm', '88%']],
   rec: 'Order 4471 · 2 office chairs', tl: [['Ordered', 'Mon'], ['Shipped', 'Tue'], ['Arrives', 'Thu']],
   reply: ['Hi, thanks for writing. Your ', ['2 office chairs'], ' (', ['order 4471'], ') ', ['left our warehouse on Tuesday.'], ' They ', ['arrive on Thursday,'], ' a day before you need them. The tracking link is below.']
  };
  function msgView() {
   var m = MSG, body = m.body.map(function (s) { return typeof s === 'string' ? E(s) : '<mark data-h="' + s[1] + '">' + E(s[0]) + '</mark>'; }).join('');
   return '<div class="aw-ms"><div class="aw-c1">' +
    '<div class="aw-cd aw-e aw-inm"><div class="aw-cdh"><span class="aw-av">' + I('mail') + '</span><span class="aw-who"><b>' + E(m.sub) + '</b><small>' + E(m.who) + '</small></span><em class="aw-nw">New</em></div><p class="aw-tx">' + body + '</p></div>' +
    '<div class="aw-cd aw-e aw-dr"><div class="aw-cdh"><span class="aw-av aw-ai">' + I('spark') + '</span><span class="aw-who"><b>Draft reply</b><small>Written by AI · facts from Orders</small></span></div><p class="aw-tx aw-ty">' + stream(m.reply) + '</p><div class="aw-act"><span class="aw-bt aw-pri">Approve and send</span><span class="aw-bt">Edit</span></div></div>' +
    '</div><div class="aw-c2"><div class="aw-lb">What the AI understood</div><div class="aw-tgs">' +
    m.tags.map(function (t, i) { return '<div class="aw-e aw-tg' + (t[3] ? ' aw-hot' : '') + '" data-t="' + i + '"><small>' + E(t[0]) + '</small><b>' + E(t[1]) + '</b><i>' + t[2] + '</i></div>'; }).join('') +
    '</div><div class="aw-lb">Found in Orders</div><div class="aw-e aw-rec"><b>' + E(m.rec) + '</b><ol>' + m.tl.map(function (s) { return '<li><i>' + I('check') + '</i><span>' + E(s[0]) + '</span><small>' + E(s[1]) + '</small></li>'; }).join('') + '</ol></div></div></div>';
  }
  function msgSteps() {
   var inm = $('.aw-inm', main), dr = $('.aw-dr', main), marks = $$('.aw-inm mark', main), tgs = $$('.aw-tg', main), rec = $('.aw-rec', main), pri = $('.aw-pri', dr);
   function hl(h) { var f = null; marks.forEach(function (m) { if (m.getAttribute('data-h') === String(h)) { m.classList.add('is-on'); f = f || m; } }); return f; }
   q(function () { status('work', 'Reading'); prog(.06); inm.classList.add('is-in'); bump(0); }, 1000);
   [0, 1].forEach(function (h) { q(function () { var m = hl(h); tgs[h].classList.add('is-in'); thread(m, tgs[h]); prog(.16 + h * .12); }, 820); });
   q(function () { tgs[2].classList.add('is-in'); prog(.4); }, 560);
   q(function () { status('work', 'Looking up'); var m = hl(3); rec.classList.add('is-in'); thread(m, rec); prog(.5); }, 900);
   q(function () { rec.classList.add('is-done'); }, 900);
   q(function () { status('work', 'Writing'); dr.classList.add('is-in'); prog(.62); }, 450);
   q(function () { dr.classList.add('is-w'); prog(.86); }, 2400);
   q(function () { status('ask', 'Ready for you'); curTo(pri); }, 1150);
   q(function () { click(pri); }, 420);
   q(function () { pri.className = 'aw-bt is-done'; pri.innerHTML = I('check') + 'Sent'; dr.classList.add('is-sent'); status('ok', 'Sent'); bump(1); prog(1); }, 1600);
   q(function () { curOff(); }, 1800);
  }

  /* ================= scene 3: support tickets ================= */
  var TK = [
   { s: 'Where is my parcel?', w: 'Customer B · 2 min ago', b: 'Order 5120 says shipped, but nothing came yet.', tg: [['Topic', 'Delivery', '98%'], ['Urgency', 'Normal']], why: 'Tracking says it arrives today. The AI sent the answer.', l: 0 },
   { s: 'I was charged twice', w: 'Customer C · 3 min ago', b: 'I see two payments for one order. Please fix this.', tg: [['Topic', 'Billing', '97%'], ['Urgency', 'Urgent', '', 1]], why: 'A payment problem. Only the refunds team can act on it.', l: 1 },
   { s: 'Error after the update', w: 'Customer D · 5 min ago', b: 'The app shows an error each time I sign in.', tg: [['Topic', 'Sign-in', '95%'], ['Urgency', 'High', '', 1]], why: 'The same error is in 6 tickets today. Grouped for the tech team.', l: 2 },
   { s: 'Third wrong order this month', w: 'Customer E · 6 min ago', b: 'Again the wrong size came. I want to talk to someone.', tg: [['Topic', 'Complaint', '61%'], ['Mood', 'Upset', '', 1]], why: 'The customer is upset and asks for a call. A person should reply.', l: 3 }
  ];
  var LANES = [['Solved by AI', 152, 'check', 'g'], ['Refunds team', 21, 'card'], ['Tech team', 38, 'tool'], ['Needs a person', 3, 'user', 'a']];
  function tkView() {
   return '<div class="aw-tk"><div class="aw-c1"><div class="aw-lb">Inbox <em>4 new</em></div><div class="aw-tq"><div class="aw-cd aw-tc"></div></div></div><div class="aw-c2 aw-lns">' +
    LANES.map(function (l, i) { return '<div class="aw-ln' + (l[3] ? ' aw-' + l[3] : '') + '" data-l="' + i + '"><span class="aw-li">' + I(l[2]) + '</span><span class="aw-lt"><b>' + E(l[0]) + '</b><small>Waiting</small></span><em>' + num(l[1]) + '</em></div>'; }).join('') + '</div></div>';
  }
  function tcHTML(t) {
   return '<div class="aw-cdh"><span class="aw-av">' + I('chat') + '</span><span class="aw-who"><b>' + E(t.s) + '</b><small>' + E(t.w) + '</small></span></div><p class="aw-tx">' + E(t.b) + '</p>' +
    '<div class="aw-chs">' + t.tg.map(function (g) { return '<span class="aw-ch' + (g[3] ? ' aw-hot' : '') + '">' + E(g[0]) + ' <b>' + E(g[1]) + '</b>' + (g[2] ? ' <i>' + g[2] + '</i>' : '') + '</span>'; }).join('') + '</div>' +
    '<p class="aw-why">' + I('spark') + '<span>' + E(t.why) + '</span></p>';
  }
  function tkSteps() {
   var tc = $('.aw-tc', main), lanes = $$('.aw-ln', main), cnt = $('.aw-c1 .aw-lb em', main), lv = LANES.map(function (l) { return l[1]; });
   TK.forEach(function (t, k) {
    q(function () { tc.style.transition = 'none'; tc.className = 'aw-cd aw-tc'; tc.style.transform = ''; tc.innerHTML = tcHTML(t); void tc.offsetWidth; tc.style.transition = ''; tc.classList.add('is-in'); status('work', 'Reading'); bump(0); prog(k / 4 + .04); cnt.textContent = (4 - k) + ' new'; }, 900);
    q(function () { tc.classList.add('is-t1'); }, 480);
    q(function () { tc.classList.add('is-t2'); status('work', 'Deciding'); }, 520);
    q(function () { tc.classList.add('is-why'); }, 1250);
    q(function () { var ln = lanes[t.l]; ln.classList.add('is-hit'); thread(tc, ln, t.l === 3 ? 'is-warn' : ''); fly(tc, ln); prog((k + 1) / 4 - .02); }, 640);
    q(function () {
     var ln = lanes[t.l]; ln.classList.remove('is-hit'); lv[t.l]++;
     ln.lastChild.innerHTML = '<span>' + num(lv[t.l]) + '</span>'; ln.children[1].lastChild.textContent = t.s;
     ln.classList.remove('is-up'); void ln.offsetWidth; ln.classList.add('is-up');
     bump(t.l ? 2 : 1); if (t.l === 3) status('ask', 'Needs a person');
     if (k === 3) { ln.children[1].insertAdjacentHTML('beforeend', '<span class="aw-bt aw-pri aw-take">Take it</span>'); tc.style.transition = 'none'; tc.className = 'aw-cd aw-tc aw-clear is-in'; tc.style.transform = ''; void tc.offsetWidth; tc.style.transition = ''; tc.innerHTML = '<p>' + I('check') + 'Inbox clear</p><small>All 4 sorted. 1 solved by AI, 3 sent to the right people.</small>'; cnt.textContent = '0 new'; }
    }, k === 3 ? 900 : 700);
   });
   q(function () { curTo($('.aw-take', main)); }, 1100);
   q(function () { click($('.aw-take', main)); }, 420);
   q(function () { var b = $('.aw-take', main); b.className = 'aw-bt is-done'; b.innerHTML = I('check') + 'Taken by a person'; status('ok', 'All sorted'); prog(1); }, 1500);
   q(function () { curOff(); }, 1800);
  }
  function fly(from, to) {
   if (RM) return;
   var A = rel(from), B = rel(to), s = Math.min(B.w / A.w, B.h / A.h, 1);
   from.classList.add('is-fly');
   from.style.transform = 'translate(' + Math.round(B.l - A.l + (B.w - A.w * s) / 2) + 'px,' + Math.round(B.t - A.t + (B.h - A.h * s) / 2) + 'px) scale(' + s.toFixed(3) + ')';
  }

  /* ================= scene 4: quality checks from photos ================= */
  var BODY = 'M88 52h24v6c18 6 28 18 28 34v96c0 7-5 12-12 12H72c-7 0-12-5-12-12V92c0-16 10-28 28-34z';
  var QD = [['Cap', 78, 8, 44, 32], ['Fill', 56, 78, 88, 16], ['Label', 54, 110, 92, 62], ['Body', 58, 174, 84, 28]];
  var QI = [
   { id: 'Item 2041', f: [['Cap', 'Sealed', '99%'], ['Fill level', 'Full', '98%'], ['Label', 'Straight', '97%'], ['Body', 'Clean', '99%']], tg: ['Cap 99%', 'Fill 98%', 'Label 97%', 'Body 99%'], v: 'ok' },
   { id: 'Item 2042', tilt: 1, f: [['Cap', 'Sealed', '99%'], ['Fill level', 'Full', '97%'], ['Label', 'Tilted 8°', '96%'], ['Body', 'Clean', '98%']], tg: ['Cap 99%', 'Fill 97%', 'Label tilted 8°', 'Body 98%'], bad: 2, v: 'no' },
   { id: 'Item 2043', mark: 1, f: [['Cap', 'Sealed', '99%'], ['Fill level', 'Full', '98%'], ['Label', 'Straight', '97%'], ['Body', 'Mark found?', '58%']], tg: ['Cap 99%', 'Fill 98%', 'Label 97%', 'Mark? 58%'], bad: 3, v: 'bad' }
  ];
  function bottle(it) {
   var h = '<svg class="aw-btl" viewBox="0 0 200 212" aria-hidden="true"><defs><clipPath id="awcl"><path d="' + BODY + '"/></clipPath></defs><g class="q-obj">' +
    '<path class="q-body" d="' + BODY + '"/><rect class="q-liq" clip-path="url(#awcl)" x="40" y="84" width="120" height="130"/><path class="q-shine" d="M68 100v80"/>' +
    '<rect class="q-neck" x="88" y="34" width="24" height="20" rx="2"/><rect class="q-cap" x="82" y="12" width="36" height="24" rx="4"/><path class="q-rib" d="M88 17v14M94 17v14M100 17v14M106 17v14M112 17v14"/>' +
    '<g class="q-lab"' + (it.tilt ? ' transform="rotate(8 100 141)"' : '') + '><rect x="62" y="116" width="76" height="50" rx="3"/><rect class="q-lg" x="70" y="124" width="14" height="14" rx="3"/><path d="M90 127h38M90 134h26M70 148h60M70 155h42"/></g>' +
    (it.mark ? '<path class="q-mark" d="M114 182l9-5 5 3"/>' : '') + '</g>';
   QD.forEach(function (b, i) {
    var bb = it.mark && i === 3 ? [108, 172, 26, 16] : b.slice(1), t = it.tg[i], w = t.length * 6.5 + 9, hot = it.bad === i;
    h += '<g class="q-d' + (hot ? (it.v === 'no' ? ' is-no' : ' is-bad') : '') + '" data-d="' + i + '"><rect class="q-bx" x="' + bb[0] + '" y="' + bb[1] + '" width="' + bb[2] + '" height="' + bb[3] + '" rx="2"/>' +
     '<rect class="q-tb" x="' + bb[0] + '" y="' + (bb[1] - 14) + '" width="' + w + '" height="14" rx="2"/><text x="' + (bb[0] + 4.5) + '" y="' + (bb[1] - 3.6) + '">' + E(t) + '</text></g>';
   });
   return h + '</svg>';
  }
  function qcView() {
   var hist = ''; for (var i = 0; i < 12; i++) hist += '<i' + (i === 4 ? ' class="is-no"' : '') + '></i>';
   return '<div class="aw-qc"><div class="aw-c1"><div class="aw-cam"><span class="aw-cl"><i></i>Line 1 · Camera 2</span><span class="aw-cid"></span><div class="aw-ob"></div><span class="aw-belt"></span><i class="aw-scan"></i><span class="aw-qst"></span></div><div class="aw-hist"><small>Last 12</small><span>' + hist + '</span></div></div>' +
    '<div class="aw-c2"><div class="aw-fh"><span>Checks</span><em></em></div><div class="aw-rows"></div>' + VD + '</div></div>';
  }
  function qcSteps() {
   var cam = $('.aw-cam', main), ob = $('.aw-ob', main), rw = $('.aw-rows', main), vd = $('.aw-vd', main), cid = $('.aw-cid', main), fe = $('.aw-c2 .aw-fh em', main), hs = $('.aw-hist span', main), qst = $('.aw-qst', main);
   QI.forEach(function (it, k) {
    var svg, rows;
    q(function () {
     ob.innerHTML = bottle(it); svg = ob.firstChild; rw.innerHTML = rowsHTML(it.f); rows = $$('.aw-r', rw); vd.className = 'aw-vd'; qst.className = 'aw-qst';
     cid.textContent = fe.textContent = it.id; cam.classList.add('is-move'); void svg.getBoundingClientRect(); svg.classList.add('is-in');
     status('work', 'Inspecting'); prog(k / 3 + .04);
    }, 1000);
    q(function () { cam.classList.remove('is-move'); cam.classList.add('is-scan'); }, 1100);
    it.f.forEach(function (f, i) {
     q(function () {
      cam.classList.remove('is-scan'); $('[data-d="' + i + '"]', svg).classList.add('is-on');
      rows[i].classList.add('is-v'); rowState(rows[i], it.bad === i ? (it.v === 'no' ? 'no' : 'bad') : 'ok');
      prog(k / 3 + .06 + .2 * (i + 1) / 4);
     }, it.bad === i ? 800 : 420);
    });
    if (it.v === 'ok') q(function () { verdict(vd, 'ok', 'Passed', 'All 4 checks passed.'); qs('Pass', 'ok'); status('ok', 'Passed'); bump(0); bump(1); }, 2000);
    if (it.v === 'no') q(function () { verdict(vd, 'no', 'Rejected', 'The label is tilted 8°. Taken off the line.'); qs('Reject', 'no'); status('ok', 'Rejected'); bump(0); bump(2); }, 2300);
    if (it.v === 'bad') {
     q(function () { verdict(vd, 'bad', 'Needs a person', 'A mark on the body? Only 58% sure.', ['Pass', 'Reject']); status('ask', 'Needs a person'); bump(0); }, 1300);
     q(function () { curTo($('.aw-pri', vd)); }, 1100);
     q(function () { click($('.aw-pri', vd)); }, 420);
     q(function () { settle(vd, 'Passed by a person', 'Passed', 'A person looked: it was dust.'); qs('Pass', 'ok'); status('ok', 'Done'); bump(1); prog(1); }, 1500);
     q(function () { curOff(); }, 1600);
    }
    q(function () {
     var c = D.createElement('i'); if (it.v === 'no') c.className = 'is-no'; hs.appendChild(c); if (hs.children.length > 12) hs.removeChild(hs.firstChild);
     if (k < 2) { svg.classList.add('is-out'); cam.classList.add('is-move'); }
    }, k < 2 ? 700 : 0);
   });
   function qs(t, c) { qst.textContent = t; qst.className = 'aw-qst is-on is-' + c; }
  }

  /* ================= scene 5: the weekly report ================= */
  var HIST = [1620, 1700, 1680, 1760, 1810, 1450, 1790, 1850, 1900, 1880, 1960, 2010], FC = [2060, 2110, 2150, 2190];
  function cx(i) { return 14 + i * 19.4; }
  function cy(v) { return Math.round((122 - (v - 1300) / 1100 * 104) * 10) / 10; }
  function chart() {
   var line = HIST.map(function (v, i) { return (i ? 'L' : 'M') + cx(i) + ' ' + cy(v); }).join(''), li = HIST.length - 1;
   var area = line + 'L' + cx(li) + ' 122L' + cx(0) + ' 122Z';
   var fl = 'M' + cx(li) + ' ' + cy(HIST[li]) + FC.map(function (v, i) { return 'L' + cx(li + 1 + i) + ' ' + cy(v); }).join('');
   var up = FC.map(function (v, i) { return cx(li + 1 + i) + ' ' + cy(v + 50 + i * 40); }), dn = FC.map(function (v, i) { return cx(li + 1 + i) + ' ' + cy(v - 50 - i * 40); }).reverse();
   var band = 'M' + cx(li) + ' ' + cy(HIST[li]) + 'L' + up.join('L') + 'L' + dn.join('L') + 'Z';
   return '<svg class="aw-chart" viewBox="0 0 320 140" aria-hidden="true"><path class="c-gr" d="M14 18H306M14 53H306M14 87H306M14 122H306"/>' +
    '<path class="c-ar" d="' + area + '"/><path class="c-ln" d="' + line + '"/>' +
    '<path class="c-bd" d="' + band + '"/><path class="c-fc" d="' + fl + '"/>' +
    '<path class="c-td" d="M' + cx(li) + ' 10V122"/><text class="c-tx" x="' + (cx(li) - 3) + '" y="135" text-anchor="end">This week</text><text class="c-tx c-fx" x="306" y="135" text-anchor="end">Forecast</text><text class="c-tx" x="14" y="135">Week 33</text>' +
    '<g class="c-dip"><path d="M' + cx(5) + ' ' + (cy(1450) - 5) + 'V44"/><circle cx="' + cx(5) + '" cy="' + cy(1450) + '" r="4"/><rect x="' + (cx(5) - 61) + '" y="28" width="122" height="16" rx="3"/><text x="' + cx(5) + '" y="39.5" text-anchor="middle">Out of stock for 3 days</text></g></svg>';
  }
  var INS = [['Units sold ', ['up 14%'], ' on last week, mostly repeat buyers.'], ['Week 38 dip: ', ['Item B was out of stock'], ' for 3 days.'], ['Next week: about ', ['2,060 units.'], ' Item B lasts 9 days.']];
  function rpView() {
   return '<div class="aw-rep"><div class="aw-c1"><div class="aw-rh"><b>Weekly sales · Week 44</b><small>Units sold, all stores</small></div>' + chart() +
    '<ol class="aw-ins">' + INS.map(function (x) { return '<li>' + stream(x) + '</li>'; }).join('') + '</ol></div>' +
    '<div class="aw-c2"><div class="aw-fh"><span>Data the AI read</span></div><div class="aw-rows">' + rowsHTML([['Orders', '48,210 rows', ''], ['Stock', '1,920 rows', ''], ['Returns', '640 rows', ''], ['Duplicates', '2 removed', ''], ['Store 7', 'No data this week', '']]) + '</div>' + VD + '</div></div>';
  }
  function rpSteps() {
   var rows = $$('.aw-r', main), ch = $('.aw-chart', main), lis = $$('.aw-ins li', main), vd = $('.aw-vd', main), adds = [48210, 1920, 640];
   q(function () { status('work', 'Reading data'); prog(.05); }, 500);
   rows.forEach(function (r, i) { q(function () { r.classList.add('is-v'); rowState(r, i === 4 ? 'bad' : 'ok'); if (i < 3) bump(0, adds[i]); prog(.06 + .3 * (i + 1) / 5); }, i === 4 ? 900 : 480); });
   q(function () { status('work', 'Building'); ch.classList.add('is-l'); prog(.45); }, 1500);
   q(function () { ch.classList.add('is-d'); thread($('.c-dip rect', ch), lis[1]); }, 900);
   q(function () { ch.classList.add('is-f'); status('work', 'Forecasting'); prog(.6); }, 1300);
   lis.forEach(function (li, i) { q(function () { li.classList.add('is-w'); bump(1); prog(.65 + .1 * (i + 1)); }, 1250); });
   q(function () { status('ask', 'Needs a person'); verdict(vd, 'bad', 'Needs a person', 'Store 7 sent no data. Send the report anyway?', ['Send to team', 'Wait']); bump(2); thread(rows[4], vd, 'is-warn'); }, 1400);
   q(function () { curTo($('.aw-pri', vd)); }, 1100);
   q(function () { click($('.aw-pri', vd)); }, 420);
   q(function () { settle(vd, 'Sent to the team', 'Sent', 'Sent without Store 7. The report says so.'); status('ok', 'Sent'); prog(1); }, 1500);
   q(function () { curOff(); }, 1800);
  }

  /* ================= scene 6: answers from your documents ================= */
  var SRC = [['Returns policy', 'Page 4', 94, 'Opened items can be returned within 30 days, with the bill.'], ['Store handbook', 'Page 12', 71, 'The refund goes back the same way the customer paid.'], ['Warranty terms', 'Page 2', 22, '']];
  var ANS = ['Yes. ', ['Opened items can be returned within 30 days, with the bill.', 1], ' ', ['The refund goes back the way they paid.', 2]];
  function knView() {
   return '<div class="aw-kn"><div class="aw-c1">' +
    '<div class="aw-cd aw-e aw-qq"><div class="aw-cdh"><span class="aw-av">' + I('user') + '</span><span class="aw-who"><b>Can a customer return an opened item after 20 days?</b><small>Store team · 10:12</small></span></div></div>' +
    '<div class="aw-cd aw-e aw-an"><div class="aw-cdh"><span class="aw-av aw-ai">' + I('spark') + '</span><span class="aw-who"><b>Answer</b><small>94% sure · 2 sources</small></span></div><p class="aw-tx aw-ty">' + stream(ANS) + '</p></div>' +
    '<div class="aw-e aw-q2"><span class="aw-av">' + I('user') + '</span><span class="aw-who"><b>Do we deliver on Sundays?</b><small class="aw-q2a"><span class="aw-sp"></span>Searching</small></span></div>' +
    '</div><div class="aw-c2"><div class="aw-lb">Searching your documents</div><div class="aw-srcs">' +
    SRC.map(function (s, i) { return '<div class="aw-e aw-src" data-c="' + (i + 1) + '" style="--v:' + s[2] / 100 + '"><div class="aw-sh"><span class="aw-di">' + I('doc') + '</span><b>' + E(s[0]) + '</b><small>' + E(s[1]) + '</small><em>' + s[2] + '%</em></div><i class="aw-rel"><i></i></i>' + (s[3] ? '<p><mark>' + E(s[3]) + '</mark></p>' : '') + '</div>'; }).join('') +
    '</div></div></div>';
  }
  function knSteps() {
   var qq = $('.aw-qq', main), an = $('.aw-an', main), srcs = $$('.aw-src', main), q2 = $('.aw-q2', main), sup = $$('.aw-an sup', main);
   q(function () { qq.classList.add('is-in'); status('work', 'Searching'); bump(0); prog(.06); }, 900);
   q(function () { srcs.forEach(function (s) { s.classList.add('is-in'); }); prog(.25); }, 1300);
   q(function () { srcs[0].classList.add('is-open'); prog(.38); }, 1000);
   q(function () { srcs[1].classList.add('is-open'); prog(.48); }, 900);
   q(function () { status('work', 'Writing'); an.classList.add('is-in'); prog(.56); }, 450);
   q(function () { an.classList.add('is-w'); prog(.72); }, 1700);
   q(function () { thread(sup[0], srcs[0]); srcs[0].classList.add('is-hit'); curTo(sup[0]); }, 1100);
   q(function () { srcs[0].classList.remove('is-hit'); thread(sup[1], srcs[1]); srcs[1].classList.add('is-hit'); curTo(sup[1]); }, 1100);
   q(function () { srcs[1].classList.remove('is-hit'); curOff(); status('ok', 'Answered'); bump(1); prog(.86); }, 1300);
   q(function () { q2.classList.add('is-in'); status('work', 'Searching'); bump(0); }, 1300);
   q(function () { var a = $('.aw-q2a', q2); a.innerHTML = BANG + 'Not in your documents. The AI does not guess. Sent to a person.'; q2.classList.add('is-ask'); status('ask', 'Needs a person'); bump(2); prog(1); }, 2600);
  }

  /* ================= the scenes and how a task picks one ================= */
  var T_ = {
   inv: { app: 'Accounts payable', title: 'Match invoices to purchase orders', kp: [['Read today', 126], ['Matched', 117], ['Sent to a person', 9]], scope: ['Invoices', 'Orders'], deny: 'Salaries', docs: DOCS.inv },
   ord: { app: 'Order desk', title: 'Enter customer orders', kp: [['Orders today', 58], ['Entered', 52], ['Sent to a person', 6]], scope: ['Orders', 'Stock'], deny: 'Payments', docs: DOCS.ord },
   frm: { app: 'Applications', title: 'Check application forms', kp: [['Forms today', 41], ['Cleared', 35], ['Sent to a person', 6]], scope: ['Forms', 'Rules'], deny: 'Other customers', docs: DOCS.frm },
   cv: { app: 'Hiring', title: 'Screen resumes', kp: [['Resumes today', 96], ['Shortlisted', 14], ['Sent to a person', 3]], scope: ['Resumes', 'Job posts'], deny: 'Salaries', docs: DOCS.cv },
   gen: { app: 'Work inbox', title: 'Handle incoming requests', kp: [['Read today', 73], ['Done by AI', 66], ['Sent to a person', 7]], scope: ['Requests', 'Your rules'], deny: 'Salaries', docs: DOCS.gen },
   msg: { app: 'Customer inbox', title: 'Reply to every customer enquiry', kp: [['Messages today', 84], ['Answered', 79], ['Sent to a person', 5]], scope: ['Messages', 'Orders'], deny: 'Payments', view: msgView, steps: msgSteps },
   tk: { app: 'Support desk', title: 'Answer support tickets', kp: [['Tickets today', 214], ['Solved by AI', 152], ['Sent to people', 62]], scope: ['Tickets', 'Help guide'], deny: 'Card details', view: tkView, steps: tkSteps },
   qc: { app: 'Quality control', title: 'Check product photos for defects', kp: [['Checked today', 1240], ['Passed', 1226], ['Rejected', 14]], scope: ['Line camera'], deny: 'Staff data', view: qcView, steps: qcSteps },
   rp: { app: 'Sales reports', title: 'Build the weekly sales report', kp: [['Rows read', 0], ['Insights', 0], ['Sent to a person', 0]], scope: ['Orders', 'Stock', 'Returns'], deny: 'Salaries', view: rpView, steps: rpSteps },
   kn: { app: 'Company knowledge', title: 'Answer questions from our documents', kp: [['Questions today', 63], ['Answered with sources', 58], ['Sent to a person', 5]], scope: ['Policies', 'Handbook'], deny: 'HR files', view: knView, steps: knSteps }
  };
  var ROUTES = [
   ['qc', /photo|image|picture|camera|defect|inspect|quality|damage|visual|scratch|crack|cctv|video/g],
   ['tk', /ticket|support|complain|help ?desk|issue|bug|refund/g],
   ['msg', /enquir|inquir|message|e-?mail|whats ?app|chat|repl|lead|review|comment|dms?\b/g],
   ['inv', /invoice|bill|purchase order|\bpo\b|vendor|supplier|payable|receipt|expense|reconcil|match|ledger|books|accounts?\b|gst|tax/g],
   ['ord', /order|dispatch|shipment|deliver|stock|inventory|warehouse|logistic/g],
   ['frm', /form|application|claim|kyc|loan|insurance|registration|verif|id proof|data entry/g],
   ['cv', /resume|\bcv|candidate|hiring|recruit|applicant|\bjobs?\b|interview|talent/g],
   ['rp', /report|forecast|dashboard|sales|demand|trend|numbers|excel|sheet|\bmis\b|analy|kpi|metric|predict|insight|revenue/g],
   ['kn', /question|answer|polic|document|knowledge|handbook|manual|\bsops?\b|faq|search|contract|guide|train|onboard|\bhr\b|\bask/g]
  ];
  function pick(text) {
   var s = ' ' + String(text || '').toLowerCase() + ' ', best = 'gen', bs = 0;
   ROUTES.forEach(function (r) { var m = s.match(r[1]), c = m ? m.length : 0; if (c > bs) { bs = c; best = r[0]; } });
   return T_[best];
  }
  function clean(text) { var s = String(text || '').replace(/\s+/g, ' ').trim().replace(/[.!]+$/, ''); if (s.length > 80) s = s.slice(0, 78).trim() + '…'; return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  /* ================= the player ================= */
  var Q = [], qi = 0, T = 0, on = false, vis = false, loop = false, cyc = 0, tpl = null, swT = 0, wasOn = false, subj = '';
  function q(fn, ms) { Q.push([fn, ms || 0]); }
  function build() {
   Q = []; qi = 0; th.innerHTML = ''; curOff(); prog(0);
   main.classList.remove('is-out');
   status('idle', 'Waiting');
   if (tpl.docs) {
    var d = tpl.docs[cyc % tpl.docs.length];
    if (tpl === T_.gen) { d.meta[2][1] = subj; d.f[3][1] = subj; }
    main.innerHTML = docView(d); docSteps(d);
   } else { main.innerHTML = tpl.view(); tpl.steps(); }
   if (loop) q(function () { main.classList.add('is-out'); status('idle', 'Next item'); }, 700);
  }
  function run() {
   if (!on) return;
   if (qi >= Q.length) { if (!loop) { on = false; return; } cyc++; build(); }
   var s = Q[qi++], r;
   try { r = s[0](); } catch (e) { /* a missed frame never stops the demo */ }
   T = setTimeout(run, typeof r === 'number' ? r : s[1]);
  }
  function cast(t, title, lp) {
   tpl = t; loop = !!lp && !RM; cyc = 0;
   subj = title.length > 26 ? title.slice(0, 25).trim() + '…' : title;
   $('.aw-ti small').textContent = t.app; $('.aw-ti b').textContent = title;
   kpis(t.kp); foot(t); build();
   if (RM) { Q.forEach(function (s) { try { s[0](); } catch (e) { } }); qi = Q.length; }
  }
  function start() {
   vis = true; wasOn = false;
   if (RM || on || !tpl || qi >= Q.length && !loop) return;
   on = true; clearTimeout(T); T = setTimeout(run, qi ? 250 : 500);
  }
  function stop() { if (D.hidden && vis) wasOn = true; vis = false; on = false; clearTimeout(T); }
  D.addEventListener('visibilitychange', function () { if (!D.hidden && wasOn) start(); });
  function sketch(text, done) {
   var t = pick(text), title = clean(text) || t.title, fired = false;
   function fin() { if (!fired) { fired = true; if (typeof done === 'function') done(); } }
   on = false; clearTimeout(T); clearTimeout(swT);
   if (RM) { cast(t, title, false); fin(); return; }
   win.classList.add('is-swap');
   swT = setTimeout(function () {
    cast(t, title, false); win.classList.remove('is-swap'); fin();
    if (vis) { on = true; T = setTimeout(run, 450); }
   }, 320);
  }

  cast(T_.inv, T_.inv.title, true);
  if (cfg.tag) cfg.tag('Live demo · AI reading invoices');
  return { start: start, stop: stop, sketch: sketch };
 };
})();
