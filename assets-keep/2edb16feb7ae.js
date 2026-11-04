/* Agentflow (D-91): the "Try it" device on the AI agents page. One agent run, shown like mission control:
   header (agent, task, status, time), a workflow graph that plans itself, thoughts and tool calls, the work it
   produces, a human approval, a finished summary. Contract: devices/README.md. No libraries, no network. */
(function () {
'use strict';
var W = window, D = document;
W.LABS_DEVICES = W.LABS_DEVICES || {};

/* The plans. n name, t default task, s scope, g trigger, a artifact panes.
   c graph: nodes "id:label:icon:human:badge", "," same column (parallel helpers), "/" next column.
   r run: ['plan', thought] | ['go', ids, thought, "tool|result;…", ms, op] | ['ask', thought, title, body, button] | ['fin', title, line, "n|label;…", waits]
   Lists inside strings: ";" between items, "|" between fields, ">" between the phases of one status. */
var T = {
  gst: { n: 'GST filing agent', t: 'File our monthly GST returns', s: 'Reads only: accounts, GST portal, email', g: 'month closed',
    c: 'sa:Sales:doc,pu:Purchases:bag,po:Portal data:grid/rc:Reconcile:repeat/mm:Mismatches:search::3,tc:Tax credit:card/dr:Draft returns:book/ok:You approve:user:1/fi:File:shield/se:Summary:mail',
    a: [{ k: 'tbl', tab: 'Reconcile', src: 'Sales invoices|412;Purchase invoices|236;Portal filings|233', cols: 'Invoice|Supplier|Status', g: '58px 1fr 1.9fr', st0: '~Queued', cnt: 'Matched|233|236', focus: '<b>3</b> held back', foot: 'Tax credit counts 233 invoices. 3 wait for the suppliers.',
      rows: 'INV-1042|Supplier A|Matched;INV-1043|Supplier B|!Supplier has not filed;INV-1047|Supplier C|Matched;INV-1051|Supplier D|!Amount differs;INV-1055|Supplier E|!Tax rate differs;INV-1058|Supplier F|Matched;INV-1060|Supplier G|Matched;INV-1064|Supplier H|Matched' },
      { k: 'docs', tab: 'Returns', docs: 'Sales return|doc|Invoices:412,Sections:6 of 6,Checks:All passed;Summary return|book|Credit:233 invoices,Held back:3 invoices,Checks:All passed' }],
    r: [['plan', 'Month closed. I plan the run before I touch the books.'],
      ['go', 'sa,pu,po', 'Three helpers pull the data at the same time.', 'accounts.read|412 sales invoices;accounts.read|236 purchase invoices;portal.fetch|233 supplier filings', 2600, 'fetch'],
      ['go', 'rc', 'I match each purchase invoice with what the supplier filed.', 'match.run|233 of 236 matched', 3200, 'reveal'],
      ['go', 'mm,tc', '3 invoices do not match. I keep them out of the credit.', 'flag.add|3 held, with reasons;credit.calc|233 invoices count', 2300, 'focus'],
      ['go', 'dr', 'I draft both returns from the matched data.', 'returns.draft|2 returns ready', 2500, 'draft'],
      ['ask', 'Filing needs a person. I ask before I file.', 'Ready to file', '2 returns drafted. 3 invoices held back until the suppliers fix them.', 'Approve and file'],
      ['go', 'fi', 'Approved. I file both returns and save the receipts.', 'portal.file|2 returns filed', 2100, 'file'],
      ['go', 'se', 'Last step: a short summary for your accountant.', 'email.send|summary to accountant', 1500],
      ['fin', 'Filed', 'Both returns filed. Receipts saved.', '236|invoices checked;233|matched;3|held back', '3 supplier follow-ups wait for a person']] },

  audit: { n: 'Expense audit agent', s: 'Reads only: expense claims, policy, email', g: 'Monday, 9:00 am',
    c: 'in:Claims:mail/rd:Receipts:doc,pl:Policy:book,du:Duplicates:search/rk:Risk score:shield::3/ok:You review:user:1/pa:Pass clean:check/rp:Report:trend',
    a: [{ k: 'tbl', tab: 'Claims', src: 'Claims|64;Receipts|63;Policy rules|18', cols: 'Claim|Person|Status', g: '58px 1fr 1.7fr', st0: '~Queued', cnt: 'Clean|61|64', focus: '<b>3</b> need a person', ph: 'Passed', m2: 'Passed <b>61</b> of 64', foot: '61 claims are clean. 3 wait for a person, each with a reason.',
      rows: 'CL-0412|Priya S.|Clean;CL-0413|Arjun M.|!Receipt missing;CL-0415|Neha K.|Clean;CL-0418|Rahul D.|!Over policy limit;CL-0421|Vikram P.|!Same as CL-0412;CL-0424|Fatima Z.|Clean;CL-0426|Meera J.|Clean;CL-0429|Sanjay T.|Clean' }],
    r: [['plan', 'New claims came in this week. I plan the checks.'],
      ['go', 'in', 'I collect every claim sent this week.', 'claims.read|64 claims', 1800, 'fetch'],
      ['go', 'rd,pl,du', 'Three helpers check receipts, policy and duplicates at once.', 'receipt.read|63 receipts read;policy.check|18 rules applied;dupes.find|1 duplicate', 3200, 'reveal'],
      ['go', 'rk', 'I score each claim. 3 claims need a closer look.', 'risk.score|3 claims flagged', 2100, 'focus'],
      ['ask', 'A person decides on flagged claims. I ask you.', 'Pass the clean claims?', '61 claims are clean. 3 flagged claims stay with you, each with a reason.', 'Pass 61 claims'],
      ['go', 'pa', 'Approved. I pass the clean claims for payment.', 'claims.pass|61 passed', 1900, 'st2'],
      ['go', 'rp', 'I send the weekly report to finance.', 'report.send|to finance', 1500],
      ['fin', 'Audited', 'Every claim checked against your policy.', '64|claims checked;61|passed;3|flagged', '3 flagged claims wait for a person']] },

  ugc: { n: 'UGC video agent', s: 'Uses: product photos, brand guide, your OK', g: '12 new photos',
    c: 'ph:Photos:grid/sc:Scripts:doc/vo:Voice-over:mic,cl:Clips:spark,ca:Captions:chat/ed:Edit:tool/ok:You review:user:1/pu:Publish:calendar',
    a: [{ k: 'story', tab: 'Storyboard', fr: 'Hook|This changed my mornings.|36;Problem|I tried five of these.|18;Product|Then I found this one.|44;Try it|Try it this week.|28' }],
    r: [['plan', 'I plan three short videos from your product photos.'],
      ['go', 'ph', 'I study 12 photos and pick the four best angles.', 'photos.read|12 photos, 4 picked', 2000, 'pick'],
      ['go', 'sc', 'I write 3 short scripts in your brand voice.', 'script.write|3 scripts, 15 s each', 2400, 'script'],
      ['go', 'vo,cl,ca', 'Three helpers make voice, clips and captions at once.', 'voice.make|3 voice-overs;clips.make|12 clips;captions.make|English and Kannada', 3000, 'make'],
      ['go', 'ed', 'I cut each video to 15 seconds.', 'video.edit|3 videos ready', 2500, 'edit'],
      ['ask', 'Nothing goes live without you. I ask first.', 'Review 3 videos', '3 videos, 15 seconds each, with captions. Post them this week?', 'Approve all 3'],
      ['go', 'pu', 'Approved. I schedule the posts for this week.', 'post.schedule|6 posts this week', 1900, 'pub'],
      ['fin', 'Scheduled', '3 videos made from 12 product photos.', '3|videos;2|languages;6|posts', 'Replies to comments wait for a person']] },

  mkt: { n: 'Marketing agent', s: 'Uses: brand guide, content calendar, analytics', g: 'Friday, 4:00 pm',
    c: 'pl:Plan week:calendar/bl:Blog:doc,so:Social posts:chat,nl:Newsletter:mail/br:Brand check:shield/ok:You approve:user:1/sh:Schedule:clock/rp:Report:trend',
    a: [{ k: 'cal', tab: 'Next week', fix: 5, it: '0|Blog|Guide|10:00;0|Post|Tip|18:30;1|Post|Story|12:00;2|Mail|Newsletter|09:00;2|Post|Team|19:00;3|Post|Demo|11:30;4|Blog|Case study|10:30;4|Post|Poll|17:00;5|Post|Picks|11:00;6|Post|Recap|20:00' }],
    r: [['plan', 'I plan next week from your content calendar.'],
      ['go', 'pl', 'I pick a theme for each day of the week.', 'calendar.read|7 days, 3 channels', 1900, 'plan'],
      ['go', 'bl,so,nl', 'Three helpers draft the blog, posts and newsletter.', 'blog.draft|2 posts;social.draft|7 posts;mail.draft|1 newsletter', 3000, 'draft'],
      ['go', 'br', 'I check every piece against your brand guide.', 'brand.check|1 fixed, all pass', 2100, 'check'],
      ['ask', 'Nothing goes out without your OK.', 'Approve next week', '10 pieces drafted. All pass the brand check. Schedule them?', 'Approve and schedule'],
      ['go', 'sh', 'Approved. I schedule each piece at its best time.', 'post.schedule|10 scheduled', 2100, 'sched'],
      ['go', 'rp', 'I set up the weekly report for Monday.', 'report.build|every Monday', 1500, 'rep'],
      ['fin', 'Scheduled', 'Next week is planned, drafted and booked.', '10|pieces;3|channels;7|days covered', 'Replies and comments wait for a person']] },

  sales: { n: 'Sales pipeline agent', s: 'Uses: CRM, email, WhatsApp, calendar', g: '24 new leads',
    c: 'nw:New leads:users/en:Enrich:search,sc:Score:star/wr:Follow-ups:mail/ok:You approve:user:1/se:Send:chat,bk:Book:calendar/cr:Update CRM:grid',
    a: [{ k: 'tbl', tab: 'Pipeline', src: 'New leads|24;From forms|15;From WhatsApp|9', cols: 'Lead|Role|Fit|Next step', g: '1fr 56px 50px 1.6fr', gs: '1fr 50px 1.6fr', hide: [1], late: [1, 2], st0: '~New', cnt: 'Scored|24|24', m2: '<b>18</b> follow-ups written', m3: '<b>4</b> calls booked',
      rows: 'Ananya R.|Founder|%92|^Hot>~Draft ready>Call Tue 11 am;Karthik V.|Ops head|%78|~Warm>~Draft ready>Follow-up sent;Divya N.|Owner|%86|^Hot>~Draft ready>Call Wed 4 pm;Rohan S.|Buyer|%38|~Cold>~Nurture list;Imran K.|Director|%89|^Hot>~Draft ready>Call Thu 10 am;Sneha P.|Finance|%71|~Warm>~Draft ready>Follow-up sent;Lakshmi B.|Owner|%64|~Warm>~Draft ready>Follow-up sent' }],
    r: [['plan', 'New leads came in. I plan the follow-ups.'],
      ['go', 'nw', 'I pull the new leads from the CRM.', 'crm.read|24 new leads', 1800, 'fetch'],
      ['go', 'en,sc', 'Two helpers enrich and score every lead at once.', 'lead.enrich|role, company, size;lead.score|9 hot, 11 warm', 2900, 'reveal'],
      ['go', 'wr', 'I write a personal follow-up for each lead.', 'mail.write|18 follow-ups', 2300, 'st2'],
      ['ask', 'Messages go out in your name. I ask first.', 'Send 18 follow-ups?', 'Each one is personal. Hot leads get two call times.', 'Approve and send'],
      ['go', 'se,bk', 'Approved. I send the follow-ups and book the calls.', 'message.send|email and WhatsApp;calendar.book|4 calls booked', 2500, 'st3'],
      ['go', 'cr', 'I update every lead in the CRM.', 'crm.update|24 leads updated', 1500],
      ['fin', 'Pipeline updated', 'Every new lead has a next step.', '24|new leads;18|follow-ups;4|calls booked', '2 hot leads wait for a call from you']] },

  office: { n: 'Vendor onboarding agent', s: 'Uses: email, documents, accounts', g: 'new vendor request',
    c: 'rq:Request:mail/dc:Papers:doc,tx:Tax ID:shield,bk:Bank details:card/rk:Risk check:search/ok:You approve:user:1/su:Set up:grid/wl:Welcome:mail',
    a: [{ k: 'chk', tab: 'Checklist', who: 'SF|Supplier F|New vendor', it: 'Request form|Filled by the buyer;Registration papers|Read and checked;Tax ID|Valid, name matches;Bank details|Name matches the letter;Signed agreement|Received on email|Missing, asked on email;Risk check|Low risk;Vendor record|Created in accounts;Welcome email|Sent to Supplier F' }],
    r: [['plan', 'A new vendor request came in. I plan the checks.'],
      ['go', 'rq', 'I read the request and the papers sent with it.', 'mail.read|1 request, 4 files', 1700, 'c0'],
      ['go', 'dc,tx,bk', 'Three helpers check papers, tax ID and bank details.', 'doc.read|1 paper missing;taxid.check|valid;bank.check|name matches;email.send|asked for the agreement', 3100, 'c1234'],
      ['go', 'rk', 'The signed agreement came back. I run the risk check.', 'risk.check|low risk', 2000, 'c5'],
      ['ask', 'A person approves every new vendor.', 'Add Supplier F?', 'All checks passed. The signed agreement came in on email.', 'Approve vendor'],
      ['go', 'su', 'Approved. I create the vendor record.', 'accounts.add|vendor created', 1700, 'c6'],
      ['go', 'wl', 'I send Supplier F a welcome email.', 'email.send|welcome sent', 1500, 'c7'],
      ['fin', 'Vendor added', 'Supplier F can now get purchase orders.', '6|checks passed;1|paper chased;1|vendor added', 'The first purchase order waits for a person']] },

  gen: { n: 'Your agent', s: 'Uses: only what the task needs', g: 'new task',
    c: 'in:Read task:doc/ga:Gather:search,ru:Rules:book,pr:Prepare:tool/qa:Check:shield::2/ok:You approve:user:1/do:Do the work:spark/rp:Report:mail',
    a: [{ k: 'tbl', tab: 'Work items', src: 'Items|40;Sources|3;Rules|12', cols: 'Item|Source|Status', g: '46px 1fr 1.7fr', st0: '~Queued', cnt: 'Ready|38|40', focus: '<b>2</b> need a person', ph: 'Done', m2: 'Done <b>38</b> of 40', foot: '38 items are ready. 2 unusual items wait for a person.',
      rows: '#01|Email|Ready;#02|Sheet|!Unusual case;#03|Form|Ready;#04|Email|!Data missing;#05|Portal|Ready;#06|Sheet|Ready;#07|Email|Ready;#08|Form|Ready' }],
    r: [['plan', 'I read your task and plan the steps.'],
      ['go', 'in', 'I read the task and find what it needs.', 'task.read|40 items', 1700, 'fetch'],
      ['go', 'ga,ru,pr', 'Three helpers gather data, check rules and prepare.', 'data.gather|3 sources;rules.check|12 rules;work.prepare|40 items', 3000, 'reveal'],
      ['go', 'qa', 'I check the work. 2 items look unusual.', 'quality.check|2 items held', 1900, 'focus'],
      ['ask', 'Unusual cases go to a person.', 'Go ahead with 38 items?', '38 items are ready. 2 unusual items stay with you, with reasons.', 'Approve'],
      ['go', 'do', 'Approved. I do the work in your tools.', 'tools.update|38 items done', 2000, 'st2'],
      ['go', 'rp', 'I send you a short report.', 'report.send|to you', 1400],
      ['fin', 'Done', 'Every step is logged. Nothing ran twice.', '40|items;38|done;2|for you', '2 unusual items wait for a person']] }
};

/* which plan fits the visitor's words: most keyword hits wins, a tie goes to the earlier plan */
var KW = [
  ['ugc', /\b(ugc|videos?|reels?|clips?|shorts|films?|movies?|trailers?|voice[- ]?overs?|creatives?|photos?|footage)\b/gi],
  ['gst', /\b(gst\w*|tax(es)?|tds|vat|itc|returns?|filings?|file|compliance|reconcil\w*|e-?invoic\w*|e-?way)\b/gi],
  ['audit', /\b(audit\w*|expenses?|claims?|reimburs\w*|receipts?|invoices?|bills?|spend\w*|fraud|duplicates?|polic(y|ies))\b/gi],
  ['mkt', /\b(marketing|campaigns?|social|posts?|content|newsletters?|blogs?|seo|brand\w*|ads?|calendar)\b/gi],
  ['sales', /\b(sales|leads?|pipelines?|prospects?|follow[- ]?ups?|crm|deals?|outreach|meetings?|enquir\w*|inquir\w*)\b/gi],
  ['office', /\b(vendors?|suppliers?|onboard\w*|kyc)\b/gi],
  ['gen', /\b(unpaid|overdue|dues|chas\w*|payments?|collect\w*|remind\w*)\b/gi] /* chasing money is not an audit */
];
function pick(s) { var best = 'gen', bs = 0; KW.forEach(function (k) { var m = s.match(k[1]), n = m ? m.length : 0; if (n > bs) { bs = n; best = k[0]; } }); return best; }
function L(s) { return s ? s.split(';').map(function (x) { return x.split('|'); }) : []; }
function mk(tag, cls, html) { var e = D.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
function sv(tag, cls) { var e = D.createElementNS('http://www.w3.org/2000/svg', tag); e.setAttribute('class', cls); return e; }
function all(s, c) { return [].slice.call(c.querySelectorAll(s)); }
function mmss(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; }
function fr(g) { return g.replace(/([\d.]+fr)/g, 'minmax(0,$1)'); }

/* ---------- the work the agent produces: one renderer per kind; each returns its operations ---------- */
var ART = {
  /* a table that fills: rows arrive, statuses resolve, flagged rows stand out */
  tbl: function (c, el, E) {
    var R = L(c.rows), n = R.length, late = c.late || [], hide = c.hide || [], cnt = c.cnt.split('|'), src = L(c.src);
    function cl(i) { return (hide.indexOf(i) > -1 ? 'hc' : '') + (late.indexOf(i) > -1 ? ' lt' : ''); }
    function cell(v, i) { return '<span class="' + cl(i) + '">' + (v.charAt(0) === '%' ? '<span class="af-bar"><i style="transform:scaleX(' + v.slice(1) / 100 + ')"></i></span><em>' + v.slice(1) + '</em>' : E.esc(v)) + '</span>'; }
    el.innerHTML = '<div class="af-src">' + src.map(function (s) { return '<div><small>' + E.esc(s[0]) + '</small><b>0</b></div>'; }).join('') + '</div>' +
      '<div style="--g:' + fr(c.g) + ';--gs:' + fr(c.gs || c.g) + '"><div class="af-tr af-th0">' + c.cols.split('|').map(function (h, i) { return '<span class="' + cl(i).replace(' lt', '') + '">' + E.esc(h) + '</span>'; }).join('') + '</div><div class="af-rows">' +
      R.map(function (r) { return '<div class="af-tr">' + r.slice(0, -1).map(cell).join('') + '<span class="af-s">' + E.pill(c.st0) + '</span></div>'; }).join('') + '</div></div>' +
      (c.foot ? '<p class="af-tf">' + E.I('spark') + '<span>' + E.esc(c.foot) + '</span></p>' : '');
    var rows = all('.af-rows .af-tr', el), sb = all('.af-src b', el);
    function st(i, p) {
      var s = R[i][R[i].length - 1].split('>'), v = !p ? c.st0 : s.length > 1 ? s[Math.min(p, s.length) - 1] : p > 1 && c.ph && !/^[!~^]/.test(s[0]) ? c.ph : s[0];
      rows[i].querySelector('.af-s').innerHTML = E.pill(v); rows[i].classList.toggle('fl', v.charAt(0) === '!');
    }
    function phase(p) { return function (d) { el.classList.remove('fx', 'ft'); if (c['m' + p]) E.meta(c['m' + p]); rows.forEach(function (r, i) { E.at(d * .6 * i / n, function () { st(i, p); }); }); }; }
    return {
      fetch: function (d) {
        E.meta('Reading sources');
        sb.forEach(function (b, i) { var to = +src[i][1]; E.tween(d * .75, function (k) { b.textContent = Math.round(to * k); }); });
        rows.forEach(function (r, i) { E.at(d * (.15 + .7 * i / n), function () { r.classList.add('in'); }); });
      },
      reveal: function (d) { E.count(cnt[0], +cnt[1], cnt[2], d * .9); rows.forEach(function (r, i) { E.at(d * (.06 + .84 * i / n), function () { r.classList.add('rv'); st(i, 1); }); }); },
      focus: function (d) { el.classList.add('fx'); E.meta(c.focus); E.at(d * .45, function () { el.classList.add('ft'); }); },
      st2: phase(2), st3: phase(3)
    };
  },
  /* documents whose fields fill in, then get filed */
  docs: function (c, el, E) {
    el.innerHTML = '<div class="af-dcs">' + L(c.docs).map(function (x) {
      return '<div class="af-doc"><div class="af-dh"><span class="af-di">' + E.I(x[1]) + '</span><div><b>' + E.esc(x[0]) + '</b><small>Last month</small></div></div><div class="af-dl">' +
        x[2].split(',').map(function (r) { r = r.split(':'); return '<p><span>' + E.esc(r[0]) + '</span><b>' + E.esc(r[1]) + '</b></p>'; }).join('') +
        '</div><div class="af-df"><span class="af-pb"><i></i></span><span class="af-s">' + E.pill('~Waiting') + '</span></div><span class="af-stamp">' + E.I('check') + 'Filed</span></div>';
    }).join('') + '</div>';
    var ds = all('.af-doc', el);
    function ps(dc, v) { dc.querySelector('.af-s').innerHTML = E.pill(v); }
    return {
      draft: function (d) {
        E.tab(1); E.meta('Drafting <b>2</b> returns');
        ds.forEach(function (dc, j) {
          E.at(d * .28 * j, function () { dc.style.setProperty('--d', Math.round(d * .55) + 'ms'); dc.classList.add('go'); ps(dc, '^Drafting'); });
          all('.af-dl p', dc).forEach(function (r, k) { E.at(d * (.28 * j + .14 + .14 * k), function () { r.classList.add('f'); }); });
          E.at(d * (.6 + .28 * j), function () { ps(dc, 'Draft ready'); });
        });
        E.at(d * .92, function () { E.meta('Drafts ready <b>2</b> of 2'); });
      },
      file: function (d) {
        E.meta('Filing on the portal');
        ds.forEach(function (dc, j) { E.at(d * (.3 + .3 * j), function () { dc.classList.add('filed'); ps(dc, 'Receipt saved'); }); });
        E.at(d * .95, function () { E.meta('Filed <b>2</b> of 2'); });
      }
    };
  },
  /* a storyboard and a timeline: frames, scripts, voice, captions, the cut */
  story: function (c, el, E) {
    var F = L(c.fr), bars = '', i;
    for (i = 0; i < 60; i++) bars += '<i style="height:' + Math.round(16 + 80 * Math.abs(Math.sin(i * .9) * Math.cos(i * .31 + 1))) + '%;transition-delay:' + i * 13 + 'ms"></i>';
    el.innerHTML = '<div class="af-stw"><div class="af-sb">' + F.map(function (f, j) { return '<div class="af-fr"><div class="af-fv" style="--h:' + f[2] + '"><span class="af-fl">0' + (j + 1) + ' ' + E.esc(f[0]) + '</span><i class="af-prd"></i><span class="af-fcb"><i></i><i></i></span><b class="af-fk">' + E.I('check') + '</b></div><p class="af-fs"></p></div>'; }).join('') + '</div>' +
      '<div class="af-trk">' + E.I('mic') + '<div class="af-wv">' + bars + '</div></div><div class="af-trk">' + E.I('chat') + '<div class="af-cpt">' + F.map(function () { return '<i>EN + KN</i>'; }).join('') + '</div></div><i class="af-ph"></i></div>';
    var fv = all('.af-fr', el), fs = all('.af-fs', el), ph = el.querySelector('.af-ph');
    return {
      pick: function (d) { E.count('Photos picked', 4, 12, d * .8); fv.forEach(function (f, j) { E.at(d * (.12 + .18 * j), function () { f.classList.add('on'); }); }); },
      script: function (d) {
        E.meta('Writing <b>3</b> scripts');
        fs.forEach(function (p, j) { var s = '“' + F[j][1] + '”'; E.at(d * .18 * j, function () { E.tween(d * .42, function (k) { p.textContent = s.slice(0, Math.round(s.length * k)); }, 1); }); });
      },
      make: function (d) { E.meta('Voice, clips and captions'); el.classList.add('mk'); fv.forEach(function (f, j) { E.at(d * (.25 + .15 * j), function () { f.classList.add('cp'); }); }); },
      edit: function (d) {
        E.meta('Cutting to <b>15 s</b>'); el.classList.add('edt');
        E.tween(d * .88, function (k) { ph.style.left = (k * 100).toFixed(2) + '%'; fv.forEach(function (f, j) { f.classList.toggle('cut', k >= (j + .5) / fv.length); }); }, 1);
        E.at(d * .94, function () { el.classList.remove('edt'); fv.forEach(function (f) { f.classList.remove('cut'); }); E.meta('<b>3</b> videos, 15 s each'); });
      },
      pub: function (d) { fv.forEach(function (f, j) { E.at(d * (.15 + .15 * j), function () { f.classList.add('ok'); }); }); E.at(d * .8, function () { E.meta('Posts on Tue, Thu, Sat'); }); }
    };
  },
  /* next week's content calendar */
  cal: function (c, el, E) {
    var IT = L(c.it);
    el.innerHTML = '<div class="af-cal">' + 'Mon Tue Wed Thu Fri Sat Sun'.split(' ').map(function (dn, i) {
      return '<div class="af-day"><small>' + dn + '</small>' + IT.map(function (x) { return +x[0] === i ? '<div class="af-chp t' + x[1].charAt(0) + '"><small>' + x[1] + '</small><span>' + E.esc(x[2]) + '</span><em>' + E.I('clock') + x[3] + '</em><b class="af-cb">' + E.I('check') + '</b></div>' : ''; }).join('') + '</div>';
    }).join('') + '</div><div class="af-rep"><span class="af-rb"><i></i><i></i><i></i><i></i><i></i><i></i></span><div><b>Weekly report</b><small>Every Monday, sent to you</small></div>' + E.pill('Set') + '</div>';
    var ch = all('.af-chp', el), N = ch.length;
    function each(d, cl, a) { ch.forEach(function (x, i) { E.at(d * (a + .75 * i / N), function () { x.classList.add(cl); }); }); }
    return {
      plan: function (d) { E.meta('7 days, 3 channels'); each(d, 'pl', .05); },
      draft: function (d) { E.count('Drafted', N, N, d * .85); each(d, 'dr', .08); },
      check: function (d) {
        E.count('Brand check', N, N, d * .85);
        ch.forEach(function (x, i) { E.at(d * .8 * i / N, function () { x.classList.add(i === c.fix ? 'fx' : 'ok'); }); });
        E.at(d * .9, function () { ch[c.fix].classList.remove('fx'); ch[c.fix].classList.add('ok'); });
      },
      sched: function (d) { E.count('Scheduled', N, N, d * .85); each(d, 'sc', .05); },
      rep: function (d) { E.meta('Report every Monday'); E.at(d * .3, function () { el.classList.add('rp'); }); }
    };
  },
  /* a checklist with a progress ring; op "c134" works on items 1, 3 and 4 */
  chk: function (c, el, E) {
    var IT = L(c.it), who = c.who.split('|'), okN = 0;
    el.innerHTML = '<div class="af-ckh"><span class="af-ini">' + who[0] + '</span><div><b>' + E.esc(who[1]) + '</b><small>' + E.esc(who[2]) + '</small></div><span class="af-rg"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="af-rgp" cx="18" cy="18" r="15"/></svg><b>0%</b></span></div>' +
      IT.map(function (x) { return '<div class="af-ck"><i class="af-cs">' + E.I('check') + '</i><b>' + E.esc(x[0]) + '</b><span>Waiting</span></div>'; }).join('');
    var its = all('.af-ck', el), rg = el.querySelector('.af-rgp'), rb = el.querySelector('.af-rg b');
    function set(i, s) {
      var r = its[i], x = IT[i]; r.classList.remove('run', 'ok', 'wn'); r.classList.add(s);
      r.querySelector('span').textContent = s === 'run' ? 'Checking' : s === 'wn' ? x[2] : x[1];
      if (s === 'ok') { okN++; var p = okN / its.length; rg.style.strokeDashoffset = (94.25 * (1 - p)).toFixed(2); rb.textContent = Math.round(p * 100) + '%'; E.meta('Done <b>' + okN + '</b> of ' + its.length); }
    }
    return {
      c: function (d, ix) {
        its.forEach(function (r, i) { if (r.classList.contains('wn')) set(i, 'ok'); });
        ix.forEach(function (i, k) { var t = d * .7 * k / ix.length; E.at(t, function () { set(i, 'run'); }); E.at(t + d * .28, function () { set(i, IT[i][2] ? 'wn' : 'ok'); }); });
      }
    };
  }
};

var STW = { idle: 'Ready', plan: 'Planning', run: 'Running', wait: 'Waiting for you', done: 'Done' };

W.LABS_DEVICES.agentflow = function (mount, cfg) {
  cfg = cfg || {};
  var RM = !!cfg.RM, I = cfg.icon || function () { return ''; };
  var esc = cfg.esc || function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  mount.innerHTML = '<div class="af' + (RM ? ' af-rm' : '') + '">' +
    '<div class="af-hd"><span class="af-av">' + I('spark') + '</span><div class="af-id"><b class="af-nm"></b><small class="af-tk"></small></div><span class="af-st"><i></i><em></em></span><span class="af-tm">0:00</span></div>' +
    '<div class="af-gr"><svg class="af-sv"><g></g><g></g></svg><div class="af-ns"></div><p class="af-cap"><span>Now</span><em></em></p></div>' +
    '<div class="af-bd"><div class="af-co"><div class="af-th"><p class="af-thl">' + I('spark') + '<em></em></p><p class="af-tt"><span></span><i></i></p></div><div class="af-lgw"><p class="af-lgh">Tool calls<b>0</b></p><div class="af-lg"></div></div></div>' +
    '<div class="af-ar"><div class="af-arh"><div class="af-tabs"></div><span class="af-meta"></span></div><div class="af-arb"></div>' +
    '<div class="af-ask"><div class="af-ak"><p class="af-akl"><i></i>Needs your OK</p><b class="af-akt"></b><p class="af-akb"></p><div class="af-akr"><span class="af-bt">Review</span><span class="af-bt af-bp"><em></em><s></s></span></div><p class="af-akd">' + I('check') + 'Approved by you</p></div></div>' +
    '<div class="af-sum"><div class="af-sm"><span class="af-md"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.5"/><path d="M12.5 20.5l5 5 10-10.5"/></svg></span><b class="af-smt"></b><p class="af-sms"></p><div class="af-sst"></div><p class="af-smw">' + I('user') + '<span></span></p></div></div>' +
    '</div></div>' +
    '<div class="af-ft"><span class="af-sc">' + I('lock') + '<span></span></span><span class="af-pg">Step <b>0</b> of <i>0</i><s><u></u></s></span></div>' +
    '<span class="af-cur"><svg viewBox="0 0 20 22" width="20" height="22"><path d="M3 2v15.6l4.2-3.9 2.8 6.4 3-1.3-2.8-6.3H16z"/></svg></span></div>';
  var root = mount.firstChild;
  function q(s) { return root.querySelector(s); }
  var hName = q('.af-nm'), hTask = q('.af-tk'), hSt = q('.af-st'), hStT = q('.af-st em'), hTm = q('.af-tm'), gr = q('.af-gr'), svg = q('.af-sv'), gE = svg.firstChild, gP = svg.lastChild, gN = q('.af-ns'), capE = q('.af-cap em'),
    th = q('.af-th'), thL = q('.af-thl em'), thT = q('.af-tt span'), lg = q('.af-lg'), lgC = q('.af-lgh b'), arP = q('.af-ar'), arT = q('.af-tabs'), arM = q('.af-meta'), arB = q('.af-arb'),
    ask = q('.af-ask'), akT = q('.af-akt'), akB = q('.af-akb'), akP = q('.af-bp'), sum = q('.af-sum'), smT = q('.af-smt'), smS = q('.af-sms'), smG = q('.af-sst'), smW = q('.af-smw span'),
    scope = q('.af-sc span'), pgB = q('.af-pg b'), pgI = q('.af-pg i'), pgU = q('.af-pg u'), cur = q('.af-cur');

  /* ---------- the clock: one rAF loop that runs only while the device is started; every timer uses it ---------- */
  var want = false, raf = 0, last = 0, clock = 0, gen = 0, Q = [], TW = [], inst = false, loop = true;
  var P = null, COLS = [], task = '', A = [], ix = 0, N = [], nodes = {}, TG = null, edges = [], panes = [], art = {}, done = 0, t0 = -1, tEnd = -1, lastS = -1, lgN = 0, thW = null, built = false, lastW = 0, outT = 0, cbT = 0;
  function wake() { if (want && !raf && !RM) { last = 0; raf = requestAnimationFrame(frame); } }
  function at(ms, fn) { Q.push({ t: clock + ms, f: fn, g: gen }); if (!inst) wake(); }
  function tween(ms, fn, lin) { if (inst) { fn(1); return {}; } var w = { s: clock, d: Math.max(1, ms), f: fn, l: lin }; TW.push(w); fn(0); wake(); return w; }
  function frame(now) {
    raf = 0; if (!want) return;
    clock += last ? Math.min(50, now - last) : 16; last = now;
    var g = gen, due = Q.filter(function (x) { return x.t <= clock; });
    if (due.length) { Q = Q.filter(function (x) { return x.t > clock; }); due.forEach(function (x) { if (x.g === g && g === gen) x.f(); }); }
    TW = TW.filter(function (w) { if (w.x) return false; var k = Math.min(1, (clock - w.s) / w.d); w.f(w.l ? k : 1 - Math.pow(1 - k, 3)); return k < 1; });
    var live = packets();
    if (t0 >= 0 && tEnd < 0) { var s = Math.floor((clock - t0) / 1000); if (s !== lastS) { lastS = s; hTm.textContent = mmss(s); } }
    if (want && (Q.length || TW.length || live)) raf = requestAnimationFrame(frame);
  }
  /* reduced motion: run the whole plan as a quick simulation, in time order, and show the end state */
  function finishNow() { inst = true; next(); while (Q.length) { Q.sort(function (a, b) { return a.t - b.t; }); var x = Q.shift(); clock = Math.max(clock, x.t); if (x.g === gen) x.f(); } inst = false; }

  var E = {
    at: at, tween: tween, I: I, esc: esc,
    pill: function (s) {
      var k = s.charAt(0), t = { '!': 'w', '~': 'n', '^': 'h' }[k] || 'k';
      return '<em class="af-p ' + t + '">' + (t === 'k' ? I('check') + esc(s) : (t === 'w' ? '<i>!</i>' : '') + esc(s.slice(1))) + '</em>';
    },
    meta: function (h) { arM.innerHTML = h; if (!inst) { arM.classList.remove('pop'); void arM.offsetWidth; arM.classList.add('pop'); } },
    count: function (lab, to, of, d) { E.meta(esc(lab) + ' <b>0</b> of ' + of); var b = arM.querySelector('b'); tween(d, function (k) { b.textContent = Math.round(to * k); }); },
    tab: function (i) { all('span', arT).forEach(function (t, j) { t.classList.toggle('on', i === j); }); panes.forEach(function (p, j) { p.classList.toggle('on', i === j); }); }
  };

  /* ---------- header, thinking, tool calls, footer ---------- */
  function status(s, n) { hSt.setAttribute('data-s', s); hStT.textContent = s === 'run' && n > 1 ? n + (lastW < 520 ? ' helpers' : ' helpers running') : STW[s]; }
  function think(s, lab) {
    thL.textContent = lab || 'Thinking'; if (thW) thW.x = 1; th.classList.add('go');
    thW = tween(Math.max(400, s.length * 19), function (k) { thT.textContent = s.slice(0, Math.round(s.length * k)); if (k >= 1) th.classList.remove('go'); }, 1);
  }
  function log(tool, res, now) {
    var e = mk('div', 'af-le' + (now ? ' ok' : ''), '<span class="af-lt">' + mmss(t0 < 0 ? 0 : (clock - t0) / 1000) + '</span><span class="af-lk"><i></i>' + I('check') + '</span><b>' + esc(tool) + '</b><em>' + esc(now ? res : 'working') + '</em>');
    lg.appendChild(e); lgC.textContent = ++lgN; while (lg.children.length > 14) lg.removeChild(lg.firstChild);
    var em = e.lastChild;
    return { ok: function (r) { e.classList.remove('wt'); e.classList.add('ok'); em.textContent = r || res; }, wt: function () { e.classList.add('wt'); em.textContent = res; } };
  }
  function prog() { pgB.textContent = done; pgI.textContent = N.length; pgU.style.transform = 'scaleX(' + (N.length ? done / N.length : 0) + ')'; }
  function capNow(ids, txt) { capE.textContent = txt || ids.map(function (id) { return nodes[id].lab; }).join(' · '); }

  /* ---------- the graph: HTML nodes over one SVG of curved edges; packets travel the edges into busy nodes ---------- */
  function buildGraph() {
    gN.innerHTML = gE.innerHTML = gP.innerHTML = ''; N = []; nodes = {}; edges = []; built = false;
    TG = { el: mk('div', 'af-n af-tg', '<i class="af-d"></i>'), c: -1, j: 0 }; gN.appendChild(TG.el);
    COLS.forEach(function (col, c) {
      col.forEach(function (d, j) {
        var n = { id: d[0], lab: d[1], h: !!d[3], c: c, j: j, st: '' };
        n.el = mk('div', 'af-n' + (d[3] ? ' hu' : '') + (d[4] ? ' bd' : ''), '<i class="af-d">' + I(d[2]) + '<b class="af-k">' + (d[4] ? esc(d[4]) : I('check')) + '</b></i><span class="af-l">' + esc(d[1]) + '</span>');
        gN.appendChild(n.el); N.push(n); nodes[n.id] = n;
      });
    });
    N.forEach(function (b) {
      (b.c ? N.filter(function (a) { return a.c === b.c - 1; }) : [TG]).forEach(function (a) {
        var e = { a: a, b: b, c: b.c, p0: sv('path', 'af-e'), p1: sv('path', 'af-e2'), k: [sv('circle', 'af-pk'), sv('circle', 'af-pk')], on: false, lit: false, L: 0 };
        gE.appendChild(e.p0); gE.appendChild(e.p1); e.k.forEach(function (k) { k.setAttribute('r', '2.4'); k.style.display = 'none'; gP.appendChild(k); }); edges.push(e);
      });
    });
  }
  function layout(force) {
    var w = root.clientWidth; if (!w || !P || (w === lastW && !force)) return; lastW = w;
    var sm = w < 520; root.classList.toggle('is-sm', sm);
    var GW = gr.clientWidth, GH = gr.clientHeight, r = sm ? 13 : 15, nc = COLS.length;
    svg.setAttribute('width', GW); svg.setAttribute('height', GH); svg.setAttribute('viewBox', '0 0 ' + GW + ' ' + GH);
    var x0 = sm ? 46 : 80, gx = (GW - (sm ? 20 : 46) - x0) / Math.max(1, nc - 1), gy = sm ? 31 : 58, cy = sm ? 54 : Math.round(GH / 2 - 10);
    root.style.setProperty('--lw', 2 * Math.floor(gx * .56) + 'px');
    N.forEach(function (n) { n.x = Math.round(x0 + gx * n.c); n.y = Math.round(cy + (n.j - (COLS[n.c].length - 1) / 2) * gy); n.r = r; });
    TG.x = sm ? 14 : 20; TG.y = cy; TG.r = 6;
    N.concat(TG).forEach(function (n) { n.el.style.left = n.x + 'px'; n.el.style.top = n.y + 'px'; });
    root.classList.add('af-nt');
    edges.forEach(function (e) {
      var a = e.a, b = e.b, ax = a.x + a.r + 3, bx = b.x - b.r - 3, m = (bx - ax) / 2, d = 'M' + ax + ' ' + a.y + 'C' + (ax + m) + ' ' + a.y + ' ' + (bx - m) + ' ' + b.y + ' ' + bx + ' ' + b.y;
      e.p0.setAttribute('d', d); e.p1.setAttribute('d', d); e.L = e.p0.getTotalLength();
      e.p0.style.strokeDasharray = e.p1.style.strokeDasharray = e.L.toFixed(1);
      e.p0.style.strokeDashoffset = built ? '0' : e.L.toFixed(1); e.p1.style.strokeDashoffset = e.lit ? '0' : e.L.toFixed(1);
    });
    void root.offsetWidth; root.classList.remove('af-nt');
  }
  function buildIn() {
    N.concat(TG).forEach(function (n) { n.el.style.transitionDelay = Math.max(0, n.c * 95 + n.j * 45) + 'ms'; n.el.classList.add('in'); });
    edges.forEach(function (e) { e.p0.style.transitionDelay = (e.c * 95 + 140) + 'ms'; e.p0.style.strokeDashoffset = '0'; });
    built = true;
  }
  function nodeSt(id, st) {
    var n = nodes[id]; if (!n) return;
    n.el.classList.remove('run', 'ok', 'wait'); if (st) n.el.classList.add(st);
    if (st === 'ok' && n.st !== 'ok') { done++; prog(); }
    n.st = st; if (!n.c) TG.el.classList.add('ok');
    edges.forEach(function (e) {
      if (e.b !== n) return; e.on = st === 'run' || st === 'wait'; e.lit = !!st;
      e.p1.style.strokeDashoffset = e.lit ? '0' : e.L.toFixed(1); e.p1.classList.toggle('on', e.on);
      e.k.forEach(function (k) { k.style.display = e.on && !RM ? '' : 'none'; });
    });
  }
  function packets() {
    var t = clock / 1000, live = false;
    edges.forEach(function (e) {
      if (!e.on || !e.L) return; live = true;
      for (var k = 0; k < 2; k++) {
        var f = (t * .85 + k * .5 + e.c * .17) % 1, p = e.p0.getPointAtLength(e.L * f);
        e.k[k].setAttribute('cx', p.x.toFixed(1)); e.k[k].setAttribute('cy', p.y.toFixed(1)); e.k[k].style.opacity = Math.min(1, Math.sin(f * Math.PI) * 1.8).toFixed(2);
      }
    });
    return live;
  }

  /* ---------- the run: each step is [action, ms until the next step] ---------- */
  function goStep(s) {
    var ids = s[1].split(','), d = s[4], n = ids.length, Lg = L(s[3]).map(function (l) { return log(l[0], l[1]); });
    status('run', n); think(s[2]); capNow(ids);
    ids.forEach(function (id, j) {
      nodeSt(id, 'run');
      at(n > 1 ? d * (.6 + .4 * (j + 1) / n) : d, function () { nodeSt(id, 'ok'); if (Lg[j]) Lg[j].ok(); if (j === n - 1) { Lg.slice(n).forEach(function (x) { x.ok(); }); status('run', 1); } });
    });
    var o = s[5] || '';
    if (/^c\d+$/.test(o)) art.c(d, o.slice(1).split('').map(Number)); else if (art[o]) art[o](d);
  }
  function askStep(s) {
    var h = N.filter(function (n) { return n.h; })[0];
    status('wait'); nodeSt(h.id, 'wait'); capNow([h.id]); think(s[1]);
    var Lg = log('approval.ask', 'waiting for you'); Lg.wt();
    akT.textContent = s[2]; akB.textContent = s[3]; akP.firstChild.textContent = s[4];
    ask.classList.remove('ok'); akP.classList.remove('press'); arP.classList.add('asking');
    at(450, function () { ask.classList.add('on'); });
    if (!inst) {
      at(1250, function () {
        var r = root.getBoundingClientRect(), b = akP.getBoundingClientRect();
        cur.style.transition = 'none'; cur.style.transform = 'translate(' + Math.round(r.width - 34) + 'px,' + Math.round(r.height - 26) + 'px)'; void cur.offsetWidth;
        cur.style.transition = ''; cur.classList.add('on');
        cur.style.transform = 'translate(' + Math.round(b.left - r.left + b.width * .6) + 'px,' + Math.round(b.top - r.top + b.height * .55) + 'px)';
      });
      at(2450, function () { cur.classList.add('dn'); akP.classList.add('press'); });
      at(2650, function () { cur.classList.remove('dn'); });
    }
    at(2700, function () { ask.classList.add('ok'); nodeSt(h.id, 'ok'); status('run', 1); Lg.ok('approved by you'); });
    at(3200, function () { cur.classList.remove('on'); });
    at(3900, function () { ask.classList.remove('on'); arP.classList.remove('asking'); });
  }
  function finStep(s) {
    status('done'); tEnd = clock; hTm.textContent = mmss((tEnd - t0) / 1000); root.classList.add('fin');
    think(s[2], 'Finished'); log('run.done', N.length + ' steps in ' + mmss((tEnd - t0) / 1000), 1); capNow(0, 'All ' + N.length + ' steps done');
    var S = L(s[3]); smT.textContent = s[1]; smS.textContent = s[2]; smW.textContent = s[4];
    smG.innerHTML = S.map(function (x) { return '<div><b>0</b><small>' + esc(x[1]) + '</small></div>'; }).join('');
    var bs = all('b', smG);
    at(300, function () { sum.classList.add('on'); tween(1100, function (k) { S.forEach(function (x, i) { bs[i].textContent = Math.round(x[0] * k); }); }); });
  }
  function compile(p) {
    var out = [];
    p.r.forEach(function (s) {
      if (s[0] === 'plan') out.push([function () { t0 = clock; status('plan'); think(s[1]); buildIn(); log('trigger', p.g, 1); log('plan.build', N.length + ' steps, ' + COLS.filter(function (c) { return c.length > 1; }).length + ' in parallel', 1); capNow(0, 'Planning ' + N.length + ' steps'); }, 1800]);
      else if (s[0] === 'go') out.push([function () { goStep(s); }, s[4] + 500]);
      else if (s[0] === 'ask') out.push([function () { askStep(s); }, 4300]);
      else {
        out.push([function () { finStep(s); }, 6500]);
        if (loop) out.push([function () { root.classList.add('af-out'); at(420, function () { load(P, task); kick(); }); }, 0]);
      }
    });
    return out;
  }
  function next() { if (ix < A.length) { var a = A[ix++]; a[0](); at(a[1], next); } }
  function kick() { at(350, next); }

  function load(p, tk) {
    gen++; Q = []; TW = []; thW = null; P = p; task = tk; ix = done = lgN = 0; t0 = tEnd = lastS = -1;
    COLS = p.c.split('/').map(function (c) { return c.split(',').map(function (n) { return n.split(':'); }); });
    root.classList.remove('fin', 'af-out'); status('idle'); hName.textContent = p.n; hTask.textContent = 'Task: ' + tk; hTm.textContent = '0:00';
    thL.textContent = 'Thinking'; thT.textContent = lg.innerHTML = ''; th.classList.remove('go'); lgC.textContent = '0'; scope.textContent = p.s;
    ask.classList.remove('on', 'ok'); sum.classList.remove('on'); arP.classList.remove('asking'); cur.classList.remove('on', 'dn');
    buildGraph();
    arT.innerHTML = p.a.map(function (a, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(a.tab) + '</span>'; }).join('');
    arB.innerHTML = ''; arM.textContent = 'Waiting for the agent'; art = {};
    panes = p.a.map(function (a, i) { var e = mk('div', 'af-pn' + (i ? '' : ' on')); arB.appendChild(e); var ops = ART[a.k](a, e, E); for (var k in ops) art[k] = ops[k]; return e; });
    prog(); capNow(0, 'Ready to plan'); A = compile(p); layout(true);
  }

  /* ---------- mount: the default demo loops; reduced motion shows the finished run at once ---------- */
  var def = T[cfg.demo] || T.gst;
  loop = !RM; load(def, def.t);
  if (RM) finishNow(); else kick();
  if (cfg.tag) cfg.tag('Live demo · a GST filing agent');
  if (W.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(root); else W.addEventListener('resize', function () { layout(); });

  /* the visitor's own task: re-plan, play once, report back when the plan is on screen */
  function sketch(text, cb) {
    text = String(text || '').trim().replace(/\s+/g, ' ');
    var p = T[pick(text)], tk = text ? text.charAt(0).toUpperCase() + text.slice(1) : p.n;
    clearTimeout(outT); clearTimeout(cbT); root.classList.add('af-out');
    outT = setTimeout(function () {
      loop = false; load(p, tk);
      if (RM) { finishNow(); if (cb) cb(); return; }
      var g = gen; outT = setTimeout(function () { if (g === gen) next(); }, 40);
      cbT = setTimeout(function () { if (cb) cb(); }, 900);
    }, RM ? 0 : 300);
  }
  return { start: function () { want = true; wake(); }, stop: function () { want = false; if (raf) cancelAnimationFrame(raf); raf = 0; }, sketch: sketch };
};
})();
