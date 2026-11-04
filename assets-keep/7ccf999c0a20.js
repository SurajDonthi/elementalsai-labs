/* Try it device "webpro" (D-91): a browser window with a live web app.
   The demo plays a short story with a cursor: a new item comes in, it is opened, one click moves it on,
   and the customer's phone gets the note. sketch(text) draws the visitor's own app: the old one dissolves,
   the new layout assembles, its colour washes in, and then it comes alive with the same story. */
(function () {
  'use strict';
  var W = window, D = document;
  W.LABS_DEVICES = W.LABS_DEVICES || {};

  /* the apps it can draw. view: list | cal | board. kpi: [label, value, note, rise?]. kb: KPI moved on arrival / on the action.
     flow: the statuses in order. rows: [col 1, col 2, col 3, status]; pc: the column with the person. feed: items that come in. */
  var TPL = [
    { k: 'stock', re: /\b(warehouses?|inventory|stocks?|godowns?|sku|supplies|suppliers?|distribut\w*|wholesale|dealers?|spare parts)\b/i,
      suf: 'Stock', def: 'Stock Manager', ic: 'box', c: '#0891B2', view: 'list', page: 'Orders', one: 'Order',
      nav: ['grid', 'box', 'bag', 'users', 'trend'], kpi: [['Orders today', 64, '+9%', 1], ['Packed today', 48, '7 low on stock']], chart: 'Orders by hour',
      tabs: ['All', 'New', 'Picking', 'Packed'], add: 'New order', cols: ['Order', 'Dealer', 'Items', 'Status'], pc: 1,
      rows: [['#318', 'Ravi K.', '6 items', 1], ['#317', 'Meena S.', '12 items', 2], ['#316', 'Arun P.', '4 items', 3], ['#315', 'Divya R.', '9 items', 3], ['#314', 'Sunil T.', '2 items', 3]],
      idn: 319, feed: [['#', 'Kiran J.', '8 items'], ['#', 'Lata M.', '3 items'], ['#', 'Farah N.', '5 items']],
      flow: [['New', 'b'], ['Picking', 'a'], ['Packed', 'v'], ['Dispatched', 'g']], act: 'Mark as packed',
      det: [['Steel bolts', '40'], ['Paper rolls', '12'], ['Racks', 'A2, C4']],
      toast: 'New order', done: ['Order packed', 'Stock counts updated'], push: ['Your order is packed', 'It leaves the warehouse today.'] },
    { k: 'staff', re: /\b(attendance|leaves?|staff|employees?|hr|payroll|shifts?|check[- ]?ins?|rosters?)\b/i,
      suf: 'Attendance', def: 'Staff Attendance', ic: 'users', c: '#4F46E5', view: 'list', page: 'Today', one: 'Leave request',
      nav: ['grid', 'check', 'calendar', 'users', 'doc'], kpi: [['Present today', 42, 'of 45'], ['Leave requests', 5, 'open']], chart: 'Check-ins by hour', kb: [[1, 1], [1, -1]],
      tabs: ['All', 'Present', 'Late', 'On leave'], add: 'Add person', cols: ['Person', 'Team', 'Today', 'Status'], pc: 0,
      rows: [['Ravi K.', 'Sales', 'In 9:02 am', ['Present', 'g']], ['Meena S.', 'Stores', 'Leave', ['On leave', 'k']], ['Arun P.', 'Delivery', 'In 9:15 am', ['Late', 'a']], ['Divya R.', 'Accounts', 'In 8:55 am', ['Present', 'g']], ['Sunil T.', 'Sales', 'In 9:01 am', ['Present', 'g']]],
      feed: [['Lata M.', 'Stores', 'Leave, Fri'], ['Kiran J.', 'Delivery', 'Leave, Mon'], ['Asha P.', 'Accounts', 'Leave, Tue']],
      flow: [['Requested', 'b'], ['Seen', 'a'], ['Approved', 'g'], ['Team told', 'k']], act: 'Approve leave',
      det: [['Dates', 'Friday, 1 day'], ['Cover', 'Arun P.'], ['Leave left', '8 days']],
      toast: 'New leave request', done: ['Leave approved', 'The team is told'], push: ['Your leave is approved', 'Friday, 1 day.'] },
    { k: 'booking', re: /\b(salons?|spa|parlou?r|barber\w*|clinics?|doctors?|dentists?|dental|physio\w*|appointments?|slots?|consult\w*|gym|studio|tutors?|yoga|massage|vet|groom\w*|book\w*|reservations?|hospital|therap\w*)\b/i,
      suf: 'Bookings', def: 'Bookings', ic: 'calendar', c: '#E2563B', view: 'cal', page: 'Schedule', one: 'Booking',
      nav: ['grid', 'calendar', 'users', 'bell', 'trend'], kpi: [['Visits today', 18, '+3', 1], ['Reminders sent', 24, 'this week']], chart: 'Visits by day',
      add: 'New booking', staff: ['Anita K.', 'Ravi M.', 'Sara P.'],
      ev: [[0, 0, 1, 'Priya S.', 'First visit', 1], [0, 1.5, 1, 'Rahul M.', 'Follow-up', 1], [1, 0.5, 1.5, 'Ananya K.', 'Consultation', 2], [1, 2.5, 1, 'Vikram T.', 'Follow-up', 0], [2, 0, 1, 'Kabir D.', 'Session', 1], [2, 1.5, 1, 'Isha P.', 'First visit', 2]],
      free: [[0, 3], [2, 3], [1, 4]], feed: [['', 'Meera J.', 'First visit'], ['', 'Arjun P.', 'Follow-up'], ['', 'Sneha R.', 'Session']],
      flow: [['Requested', 'b'], ['Confirmed', 'g'], ['Reminder sent', 'v'], ['Visited', 'k']], act: 'Send reminder',
      toast: 'New booking', done: ['Reminder sent', 'One hour before the visit'], push: ['Your visit is today', 'At {t}. Reply to change it.'] },
    { k: 'food', re: /\b(food|restaurants?|deliver\w*|kitchens?|caf[eé]s?|tiffin|meals?|pizza\w*|biryani|bakery|bakeries|bakes?|cakes?|grocer\w*|kirana|vegetables?|fruits?|milk|dairy|ordering|canteen|catering|caterers?|dhaba|juice)\b/i,
      suf: 'Orders', def: 'Food Orders', dn: 'Kitchen Orders', ic: 'bag', c: '#16A34A', view: 'list', page: 'Orders', one: 'Order',
      nav: ['grid', 'bag', 'book', 'users', 'trend'], kpi: [['Orders today', 86, '+12%', 1], ['On the way', 7, '24 min avg.']], chart: 'Orders by hour',
      tabs: ['All', 'New', 'Preparing', 'On the way'], add: 'New order', cols: ['Order', 'Customer', 'Items', 'Status'], pc: 1,
      rows: [['#2047', 'Rahul M.', '3 items', 1], ['#2046', 'Ananya K.', '1 item', 2], ['#2045', 'Vikram T.', '4 items', 3], ['#2044', 'Sneha R.', '2 items', 3], ['#2043', 'Arjun P.', '2 items', 3]],
      idn: 2048, feed: [['#', 'Priya S.', '2 items'], ['#', 'Meera J.', '3 items'], ['#', 'Kabir D.', '1 item'], ['#', 'Isha P.', '4 items']],
      flow: [['Placed', 'b'], ['Preparing', 'a'], ['On the way', 'v'], ['Delivered', 'g']], act: 'Mark out for delivery',
      det: [['Chocolate cake', '1'], ['Garlic bread', '2'], ['Distance', '2.4 km']],
      toast: 'New order', done: ['Rider on the way', 'The customer is told'], push: ['Your order is on the way', 'Track it live in the app.'],
      beats: ['Live demo · a new order', 'Live demo · out for delivery', 'Live demo · the customer is told'] },
    { k: 'store', re: /\b(shops?|stores?|sell\w*|products?|catalog\w*|fashion|cloth\w*|jewel\w*|boutiques?|cart|handmade|sarees?|shoes?|furniture|electronics|retail|e-?commerce|merch\w*)\b/i,
      suf: 'Store', def: 'Online Store', ic: 'bag', c: '#7C3AED', view: 'list', page: 'Orders', one: 'Order',
      nav: ['grid', 'bag', 'box', 'users', 'trend'], kpi: [['Orders today', 42, '+8%', 1], ['Shipped today', 18, 'all on time']], chart: 'Orders by hour',
      tabs: ['All', 'New', 'Packed', 'Shipped'], add: 'Add product', cols: ['Order', 'Customer', 'Product', 'Status'], pc: 1,
      rows: [['#5121', 'Rhea S.', 'Handloom saree', 1], ['#5120', 'Dev K.', 'Silver earrings', 2], ['#5119', 'Tara M.', 'Gift box', 3], ['#5118', 'Nikhil J.', 'Cotton kurta', 3], ['#5117', 'Asha P.', 'Silk stole', 3]],
      idn: 5122, feed: [['#', 'Zoya R.', 'Brass lamp'], ['#', 'Varun K.', 'Silk stole'], ['#', 'Isha P.', 'Gift box']],
      flow: [['New', 'b'], ['Packed', 'a'], ['Shipped', 'v'], ['Delivered', 'g']], act: 'Mark as shipped',
      det: [['Brass lamp', '1'], ['Gift wrap', 'Yes'], ['Arrives in', '2 days']],
      toast: 'New order', done: ['Order shipped', 'Tracking link sent'], push: ['Your order has shipped', 'It reaches you in 2 days.'] },
    { k: 'learn', re: /\b(learn\w*|courses?|schools?|students?|teach\w*|exams?|academy|coaching|lessons?|colleges?|classes|tuitions?|kids|batch(es)?|training)\b/i,
      suf: 'Portal', def: 'Class Portal', ic: 'book', c: '#2563EB', view: 'list', page: 'Students', one: 'New student',
      nav: ['grid', 'book', 'users', 'calendar', 'trend'], kpi: [['Students', 248, '+12', 1], ['Welcome kits sent', 31, 'this month']], chart: 'Joins by day',
      tabs: ['All', 'New', 'Batch set', 'Active'], add: 'Add student', cols: ['Batch', 'Student', 'Classes', 'Status'], pc: 1,
      rows: [['Maths A', 'Aarav K.', '12 of 12', 3], ['Science B', 'Diya S.', '9 of 10', 3], ['English A', 'Kabir M.', '2 of 10', 2], ['Maths B', 'Isha P.', '0 of 10', 1], ['Science A', 'Anika T.', '8 of 8', 3]],
      feed: [['Maths A', 'Rohan D.', '0 of 12'], ['Science B', 'Myra G.', '0 of 10'], ['English A', 'Yash G.', '0 of 10']],
      flow: [['Joined', 'b'], ['Batch set', 'a'], ['Kit sent', 'v'], ['Active', 'g']], act: 'Send welcome kit',
      det: [['Batch', 'Maths A, 5 pm'], ['Parent', 'Phone added'], ['First class', 'Today']],
      toast: 'New student', done: ['Welcome kit sent', 'Timetable and notes'], push: ['Welcome to your batch', 'Your first class is today at 5 pm.'] },
    { k: 'health', re: /\b(health|fitness|fit|workouts?|diet|patients?|steps|wellness|nutrition|weight|habits?|medicines?|pharmacy)\b/i,
      suf: 'Care', def: 'Health Tracker', ic: 'heart', c: '#0D9488', view: 'list', page: 'Members', one: 'New member',
      nav: ['grid', 'heart', 'users', 'calendar', 'trend'], kpi: [['Members', 310, '+9', 1], ['Plans shared', 57, 'this week']], chart: 'Check-ins by hour',
      tabs: ['All', 'New', 'On track', 'Due'], add: 'Add member', cols: ['Plan', 'Member', 'Week', 'Status'], pc: 1,
      rows: [['Weight loss', 'Neha G.', 'Week 6', 3], ['Strength', 'Amit V.', 'Week 2', 2], ['Yoga', 'Pooja L.', 'Week 9', 3], ['Diet plan', 'Sanjay R.', 'Week 1', 1], ['Strength', 'Farah N.', 'Week 4', 3]],
      feed: [['Strength', 'Kiran B.', 'Week 1'], ['Yoga', 'Ajay S.', 'Week 1'], ['Diet plan', 'Riya M.', 'Week 1']],
      flow: [['Signed up', 'b'], ['Plan made', 'a'], ['Plan shared', 'v'], ['On track', 'g']], act: 'Share the plan',
      det: [['Plan', 'Strength, 12 weeks'], ['Coach', 'Amit V.'], ['Check-ins', '3 a week']],
      toast: 'New member', done: ['Plan shared', 'In the member app'], push: ['Your plan is ready', 'Week 1 starts today.'] },
    { k: 'jobs', re: /\b(field|technicians?|repairs?|services?|servicing|jobs?|drivers?|visits?|sites?|workers?|crm|leads?|enquir\w*|inquir\w*|quotes?|quotations?|invoic\w*|billing|process\w*|track\w*|operations?|projects?|contractors?|maintenance|installations?)\b/i,
      suf: 'Jobs', def: 'Job Tracker', dn: 'Service Jobs', ic: 'tool', c: '#EA580C', view: 'board', page: 'Jobs', one: 'Invoice',
      nav: ['grid', 'tool', 'users', 'pin', 'doc'], kpi: [['Open jobs', 14, '+3', 1], ['Invoices sent', 9, 'this week']], chart: 'Enquiries by day',
      tabs: ['All jobs', 'Mine', 'This week'], add: 'New job',
      st: [['Enquiry', '#A1A1AA'], ['Quote', '#3B82F6'], ['Job', '#F59E0B'], ['Invoice', '#8B5CF6'], ['Paid', '#22C55E']],
      cards: [[0, 'Leak repair', 'Site 7', 'Meera J.', 'New', 'b'], [0, 'CCTV setup', 'Site 16', 'Arjun P.', 'New', 'b'], [1, 'Geyser fix', 'Site 4', 'Sneha R.', 'Sent', 'b'], [1, 'Wiring', 'Site 9', 'Kiran B.', 'Draft', 'k'], [2, 'Pump fix', 'Site 14', 'Rahul M.', 'Done', 'g'], [2, 'AC service', 'Site 12', 'Ravi K.', 'Today', 'a'], [3, 'Lift service', 'Site 3', 'Vikram T.', 'Sent', 'v'], [4, 'Fan install', 'Site 2', 'Divya R.', 'Paid', 'g'], [4, 'Door lock', 'Site 8', 'Asha P.', 'Paid', 'g']],
      feed: [['Roof leak', 'Site 21', 'Farah N.'], ['Generator', 'Site 18', 'Yash G.'], ['Water tank', 'Site 5', 'Lata M.'], ['Gate motor', 'Site 11', 'Dev K.']], idn: 1043,
      flow: [['Enquiry', 'k'], ['Quote', 'b'], ['Job done', 'g'], ['Invoice sent', 'v'], ['Paid', 'g']], times: ['Mon', 'Tue', 'Today'], act: 'Send invoice',
      det: [['Work done', '1 job'], ['Spare parts', '2'], ['Site visits', '1']],
      toast: 'New enquiry', done: ['Invoice sent', 'By email and text message'], push: ['Invoice {id} is here', 'Tap to see the work and pay.'],
      beats: ['Live demo · a new enquiry', 'Live demo · drag to invoice', 'Live demo · invoice sent', 'Live demo · payment received'] },
    { k: 'members', re: /\b(members?|membership|loyalty|rewards?|points|clubs?|community|events?|society|association|temples?|church(es)?|fans?|volunteers?|ngo|alumni)\b/i,
      suf: 'Members', def: 'Members Club', ic: 'star', c: '#DB2777', view: 'list', page: 'Members', one: 'New member',
      nav: ['grid', 'star', 'calendar', 'users', 'trend'], kpi: [['Members', 1240, '+38', 1], ['Points given', 18400, 'this month']], chart: 'Joins by day', kb: [[0, 1], [1, 100]],
      tabs: ['All', 'New', 'Gold', 'Silver'], add: 'Add member', cols: ['Member', 'Tier', 'Points', 'Status'], pc: 0,
      rows: [['Rhea S.', 'Gold', '2,340', ['Active', 'g']], ['Dev K.', 'Silver', '860', ['Active', 'g']], ['Tara M.', 'Gold', '1,920', ['Event booked', 'v']], ['Nikhil J.', 'Silver', '410', ['Reward used', 'a']], ['Asha P.', 'Gold', '3,050', ['Active', 'g']]],
      feed: [['Zoya R.', 'Silver', 'New'], ['Varun K.', 'Silver', 'New'], ['Myra G.', 'Silver', 'New']],
      flow: [['Joined', 'b'], ['Welcome sent', 'a'], ['Points added', 'v'], ['First event', 'g']], act: 'Add 100 welcome points',
      det: [['Tier', 'Silver'], ['Welcome points', '100'], ['Next event', 'Sat, 6 pm']],
      toast: 'New member', done: ['Points added', 'The member is told'], push: ['You have 100 points', 'Welcome to the club.'] }
  ];
  var GENERIC = { k: 'app', suf: 'App', def: 'Your App', ic: 'spark', c: '#0EA5E9', view: 'list', page: 'Requests', one: 'Request',
    nav: ['grid', 'doc', 'users', 'bell', 'trend'], kpi: [['Requests', 124, '+6', 1], ['Approved', 86, 'this week']], chart: 'Requests by day',
    tabs: ['All', 'New', 'In review', 'Approved'], add: 'New request', cols: ['Request', 'Owner', 'Due', 'Status'], pc: 1,
    rows: [['#412', 'Priya S.', 'Today', 1], ['#411', 'Rahul M.', 'Today', 2], ['#410', 'Ananya K.', 'Tomorrow', 3], ['#409', 'Vikram T.', 'Friday', 3], ['#408', 'Sneha R.', 'Friday', 3]],
    idn: 413, feed: [['#', 'Meera J.', 'Today'], ['#', 'Arjun P.', 'Tomorrow'], ['#', 'Kabir D.', 'Today']],
    flow: [['New', 'b'], ['In review', 'a'], ['Approved', 'g'], ['Done', 'k']], act: 'Approve',
    det: [['Type', 'New request'], ['Due', 'Today'], ['Files', '2']],
    toast: 'New request', done: ['Approved', 'The owner is told'], push: ['Your request is approved', 'You can go ahead.'] };

  /* ---------- the name of the visitor's app, from their own words ---------- */
  var NOUNS = /\b(pet|dog|cat|car|bike|truck|tailor|wedding|tour|property|plumbing|plumber|electrician|interior|printing|photo\w*|travel|salon|spa|clinic|gym|studio|restaurant|caf[eé]|bakery|kitchen|boutique|school|academy|college|coaching|tuition|pharmacy|hotel|hostel|garage|workshop|showroom|society|club|temple|church|ngo|farm|dairy|kirana|parlou?r|tiffin|warehouse|godown|factory|hospital|lab|staff|laundry|florist|resort|homestay|dental|physio|yoga|fleet|plant|mill|canteen|store|shop|business|company|brand|team|office|firm|agency)s?(?![a-z])/gi;
  var SKIP = /^(store|shop|business|company|brand|team|office|firm|agency)$/;
  var STOP = /^(app|apps|application|system|systems|portal|software|tool|tools|platform|website|site|web|online|for|the|and|our|with|that|this|from|into|want|wants|need|needs|build|make|create|simple|small|new|all|every|just|like|some|them|their|your|you|can|will|would|should|also|using|use|way|help|helps|manage|managing|management|idea|ideas|mobile|custom|smart|easy|better|where|what|which|who|how|when|has|have|get|gets|let|lets|people|its|are|was|were|one|two|any|more|less|very|really)$/i;
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
  function plan(text) {
    var t = null, i, name, noun = '', m;
    NOUNS.lastIndex = 0;
    while (!noun && (m = NOUNS.exec(text))) if (!SKIP.test(m[1])) noun = m[1].toLowerCase();
    for (i = 0; i < TPL.length; i++) if (TPL[i].re.test(text)) { t = TPL[i]; break; }
    if (t) name = noun ? cap(noun) + ' ' + t.suf : t.def;
    else {
      t = GENERIC;
      var ws = (text.match(/[A-Za-z]{3,}/g) || []).filter(function (w) { return !STOP.test(w); }).slice(0, 2);
      name = ws.length ? ws.map(cap).join(' ') : noun ? cap(noun) + ' App' : t.def;
    }
    if (name.length > 22) name = name.slice(0, 22).replace(/\s+\S*$/, '');
    return { t: t, name: name };
  }
  function slug(name) {
    var s = name.toLowerCase();
    try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* old browsers */ }
    return (s.replace(/[^a-z0-9]+/g, '') || 'yourapp').slice(0, 22) + '.app';
  }
  function byKey(k) { for (var i = 0; i < TPL.length; i++) if (TPL[i].k === k) return TPL[i]; return TPL[3]; }

  /* ---------- small helpers ---------- */
  function rnd(seed) { var s = 7; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  function smooth(p) {
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += 'C' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + ' ' + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return d;
  }
  var AVC = ['#FDE2C8', '#D7E6FD', '#E3DCFD', '#FBD9E8', '#CDEFD9', '#FCE7B2', '#D3F0F5', '#EDE4D8'];
  var SV = {
    x: '<svg class="i" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
    plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13"/></svg>',
    up: '<svg class="i" viewBox="0 0 24 24"><path d="M12 18.5v-13M6.5 11L12 5.5 17.5 11"/></svg>',
    l: '<svg class="i" viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>',
    r: '<svg class="i" viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg>',
    re: '<svg class="i" viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cur: '<svg viewBox="0 0 17 23"><path d="M1.6 1.6v16.6l4.3-4.1 2.9 6.7 2.9-1.2-2.9-6.6h6z"/></svg>'
  };
  var HRS = ['10 am', '11 am', 'Noon', '1 pm', '2 pm'];
  function hl(s) { var h = 10 + Math.floor(s), m = Math.round((s % 1) * 60); return (h > 12 ? h - 12 : h) + ':' + (m < 10 ? '0' : '') + m + (h >= 12 ? ' pm' : ' am'); }

  W.LABS_DEVICES.webpro = function (mount, cfg) {
    cfg = cfg || {};
    var RM = !!cfg.RM;
    var esc = cfg.esc || function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var IC = function (id) { return cfg.icon ? cfg.icon(id) : ''; };
    var root = mount;
    root.classList.add('dv-webpro');
    if (RM) root.classList.add('wp-rm');
    root.innerHTML = '<div class="wp-win"><div class="wp-bar"><span class="wp-dots"><i></i><i></i><i></i></span><span class="wp-nv">' + SV.l + SV.r + '</span>' +
      '<span class="wp-url">' + IC('lock') + '<span class="wp-host"></span><i class="wp-caret"></i></span><span class="wp-nv wp-nv2">' + SV.re + '</span><i class="wp-prog"></i></div>' +
      '<div class="wp-app"></div><i class="wp-wash"></i><div class="wp-cur">' + SV.cur + '<i class="wp-rip"></i></div></div>' +
      '<div class="wp-ph"><div class="wp-ph-s"><i class="wp-ph-i"></i><b class="wp-ph-t">9:41</b><small>Friday</small><div class="wp-ph-n"></div></div></div>';
    function q(s) { return root.querySelector(s); }
    function qa(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }
    var win = q('.wp-win'), appEl = q('.wp-app'), hostEl = q('.wp-host'), urlEl = q('.wp-url'), prog = q('.wp-prog'), cur = q('.wp-cur'), ph = q('.wp-ph');

    var S = null, dd = 0, gid = 0;
    function ds(extra) { return ' data-s style="--d:' + (dd++ * 30) + 'ms' + (extra || '') + '"'; }
    function av(name, cls) { var n = 0; for (var i = 0; i < name.length; i++) n = (n * 31 + name.charCodeAt(i)) % 997; return '<i class="wp-av' + (cls ? ' ' + cls : '') + '" style="background:' + AVC[n % AVC.length] + '">' + esc(name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase()) + '</i>'; }
    function pill(s) { return '<em class="wp-pill t-' + s[1] + '">' + esc(s[0]) + '</em>'; }
    function stOf(t, s) { return typeof s === 'number' ? t.flow[s] : s; }
    function mk(html) { var w = D.createElement('div'); w.innerHTML = html; return w.firstChild; }
    function pop(e) { if (!e) return; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }

    /* ---------- drawing an app ---------- */
    function spark(seed, up) {
      var r = rnd(seed), p = [], y = 15 + r() * 4, id = 'wpg' + (++gid) + Math.floor(Math.random() * 1e4);
      for (var i = 0; i < 12; i++) { y = Math.max(3, Math.min(21, y - (up ? 0.9 : 0.25) + (r() - 0.5) * 6)); p.push([i * 100 / 11, y]); }
      var d = smooth(p);
      return '<span class="wp-spk"><svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".2"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="f" d="' + d + 'L100 24L0 24Z" fill="url(#' + id + ')"/><path class="l" d="' + d + '"/></svg><i style="top:' + (p[11][1] / 24 * 100).toFixed(1) + '%"></i></span>';
    }
    function kpiHTML(k, i, seed) {
      return '<div class="wp-kpi"' + ds() + '><small>' + esc(k[0]) + '</small><div class="wp-kr"><b class="wp-num" data-v="' + k[1] + '"><span>' + fmt(k[1]) + '</span></b>' +
        (k[3] ? '<em class="wp-up">' + SV.up + esc(k[2]) + '</em>' : '<em class="wp-sub">' + esc(k[2]) + '</em>') + '</div>' + spark(seed + i, k[3]) + '</div>';
    }
    function chartHTML(label, seed) {
      var r = rnd(seed + 'bars'), s = '';
      for (var i = 0; i < 12; i++) s += '<i style="--h:' + Math.round(i === 11 ? 58 : 20 + r() * 46 + i * 2) + '%;--i:' + i + '"></i>';
      return '<div class="wp-kpi wp-chart"' + ds() + '><small>' + esc(label) + '<span class="wp-lg">Now</span></small><div class="wp-bars">' + s + '<em class="wp-plus">+1</em></div></div>';
    }
    function rowHTML(t, r, cls, s) {
      var h = '';
      for (var j = 0; j < 3; j++) {
        if (j === t.pc) h += '<span class="wp-pp">' + av(r[j]) + '<span>' + esc(r[j]) + '</span></span>';
        else if (j === 0) h += '<b' + (r[0].charAt(0) === '#' ? ' class="m"' : '') + '>' + esc(r[0]) + '</b>';
        else h += '<span class="wp-mu">' + esc(r[j]) + '</span>';
      }
      return '<div class="wp-tr' + (cls ? ' ' + cls : '') + '"' + (s || '') + '>' + h + pill(stOf(t, r[3])) + '</div>';
    }
    function evHTML(t, e, cls) { return '<div class="wp-ev s' + e[5] + (cls ? ' ' + cls : '') + '" style="--s:' + e[1] + ';--l:' + e[2] + '"><b>' + esc(e[3]) + '</b><small>' + esc(e[4]) + ' · ' + hl(e[1]) + '</small><i class="wp-evd"></i></div>'; }
    function cardHTML(c) { return '<div class="wp-card"><b>' + esc(c[1]) + '</b><small>' + esc(c[2]) + '</small><footer>' + av(c[3]) + '<em class="wp-tag t-' + c[5] + '">' + esc(c[4]) + '</em></footer></div>'; }
    function viewHTML(t) {
      var h;
      if (t.view === 'board') {
        h = '<div class="wp-tbar"' + ds() + '><div class="wp-seg">' + t.tabs.map(function (x, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(x) + '</span>'; }).join('') + '</div><span class="wp-add">' + SV.plus + '<span>' + esc(t.add) + '</span></span></div>';
        return h + '<div class="wp-board"><div class="wp-bin">' + t.st.map(function (s, i) {
          var cs = t.cards.filter(function (c) { return c[0] === i; });
          return '<section class="wp-col"' + ds() + '><header><i style="color:' + s[1] + '"></i><span>' + s[0] + '</span><b>' + cs.length + '</b></header><div class="wp-cards">' + cs.map(cardHTML).join('') + '</div></section>';
        }).join('') + '</div></div>';
      }
      if (t.view === 'cal') {
        h = '<div class="wp-tbar"' + ds() + '><div class="wp-seg"><span class="on">Day</span><span>Week</span><span>Month</span></div><span class="wp-date">' + SV.l + '<span>Today</span>' + SV.r + '</span><span class="wp-add">' + SV.plus + '<span>' + esc(t.add) + '</span></span></div>';
        h += '<div class="wp-cal"' + ds() + '><div class="wp-ch"><span></span>' + t.staff.map(function (n) { return '<span>' + av(n) + '<span>' + esc(n) + '</span></span>'; }).join('') + '</div><div class="wp-cb"><div class="wp-hrs">' + HRS.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>';
        for (var c = 0; c < 3; c++) h += '<div class="wp-cc">' + t.ev.filter(function (e) { return e[0] === c; }).map(function (e) { return evHTML(t, e); }).join('') + '</div>';
        return h + '<i class="wp-nowl"></i></div></div>';
      }
      h = '<div class="wp-tbar"' + ds() + '><div class="wp-seg">' + t.tabs.map(function (x, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(x) + '</span>'; }).join('') + '</div><span class="wp-add">' + SV.plus + '<span>' + esc(t.add) + '</span></span></div>';
      h += '<div class="wp-tbl' + (t.pc === 0 ? ' pc0' : '') + '"' + ds() + '><div class="wp-th">' + t.cols.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div><div class="wp-rows">';
      return h + t.rows.map(function (r) { return rowHTML(t, r, '', ds()); }).join('') + '</div></div>';
    }
    function render(p, building) {
      var t = p.t;
      dd = 0;
      S = { p: p, t: t, n: 0, id: t.idn || 0, inv: t.idn || 0, badge: 2, demo: false };
      root.style.setProperty('--c', t.c);
      appEl.innerHTML =
        '<aside class="wp-rail"><span class="wp-logo"' + ds() + '>' + IC(t.ic) + '</span><nav class="wp-rn"' + ds() + '>' +
        t.nav.map(function (n, i) { return '<span' + (i === 1 ? ' class="on"' : '') + '>' + IC(n) + (i === 1 ? '<b class="wp-badge">' + S.badge + '</b>' : '') + '</span>'; }).join('') +
        '</nav><span class="wp-help"' + ds() + '>' + IC('chat') + '</span></aside>' +
        '<div class="wp-main"><header class="wp-hd"' + ds() + '><span class="wp-logo sm">' + IC(t.ic) + '</span><div class="wp-tt"><strong class="wp-name' + (building ? ' typing' : '') + '">' + (building ? '' : esc(p.name)) + '</strong><small><span>' + esc(t.page) + '</span><span class="wp-live"><i></i>Live</span></small></div>' +
        '<span class="wp-srch">' + IC('search') + '<span>Search</span><kbd>/</kbd></span><span class="wp-bell">' + IC('bell') + '<i></i></span><span class="wp-me">' + IC('user') + '</span></header>' +
        '<div class="wp-body"><div class="wp-kpis">' + kpiHTML(t.kpi[0], 0, t.k) + kpiHTML(t.kpi[1], 1, t.k) + chartHTML(t.chart, t.k) + '</div>' + viewHTML(t) + '</div>' +
        '<div class="wp-toast"><span class="wp-ti">' + IC('bell') + '</span><div><b></b><small></small></div><em></em></div><div class="wp-scrim"></div><div class="wp-dr"></div></div>';
      if (t.view === 'list') qa('.wp-tr').forEach(function (el, i) { el._r = t.rows[i].slice(); });
      if (t.view === 'cal') { var evs = t.ev.slice().sort(function (a, b) { return a[0] - b[0]; }); qa('.wp-ev').forEach(function (el, i) { el._r = evs[i].slice(); }); }
      if (t.view === 'board') { var cs = t.cards.slice().sort(function (a, b) { return a[0] - b[0]; }); qa('.wp-card').forEach(function (el, i) { el._c = cs[i].slice(); }); }
      if (!building) hostEl.textContent = slug(p.name);
    }

    /* ---------- timers: the story (cancelled on stop) and the build (only cancelled by a new sketch) ---------- */
    var QT = [], BT = [], raf = 0, braf = 0, playing = false, wanted = false, building = false, vis = true, drag = null;
    function at(ms, fn) { QT.push(setTimeout(fn, ms)); }
    function bt(ms, fn) { BT.push(setTimeout(fn, ms)); }
    function clearQ() { QT.forEach(clearTimeout); QT = []; cancelAnimationFrame(raf); }
    function clearB() { BT.forEach(clearTimeout); BT = []; cancelAnimationFrame(braf); }

    /* ---------- the cursor ---------- */
    var cx = 0, cy = 0;
    function place(x, y) { cx = x; cy = y; cur.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
    function wpos(el, fx, fy) { var r = el.getBoundingClientRect(), w = win.getBoundingClientRect(); return [r.left - w.left + r.width * fx, r.top - w.top + r.height * fy]; }
    function glide(x, y, ms, onF) {
      cancelAnimationFrame(raf);
      var x0 = cx, y0 = cy, dx = x - x0, dy = y - y0, L = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(42, L * 0.14), mx = x0 + dx / 2 + dy / L * k, my = y0 + dy / 2 - dx / L * k, t0 = 0;
      function f(now) {
        if (!t0) t0 = now;
        var t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, u = 1 - e;
        place(u * u * x0 + 2 * u * e * mx + e * e * x, u * u * y0 + 2 * u * e * my + e * e * y);
        if (onF) onF();
        if (t < 1) raf = requestAnimationFrame(f);
      }
      raf = requestAnimationFrame(f);
    }
    function to(el, ms, fx, fy, onF) { if (!el) return; var p = wpos(el, fx == null ? 0.5 : fx, fy == null ? 0.5 : fy); glide(p[0], p[1], ms, onF); }
    function showCur() { if (cur.classList.contains('on')) return; place(win.clientWidth * 0.66, win.clientHeight + 26); void cur.offsetWidth; cur.classList.add('on'); }
    function rest() { glide(win.clientWidth * 0.8, win.clientHeight + 30, 900); at(700, function () { cur.classList.remove('on'); }); }
    function press() { cur.classList.add('dn'); at(150, function () { cur.classList.remove('dn'); }); }
    function click() { press(); cur.classList.remove('clk'); void cur.offsetWidth; cur.classList.add('clk'); }

    /* ---------- the living parts: numbers, chart, toast, bell, phone ---------- */
    function roll(el, v) {
      var old = el.lastChild, n = D.createElement('span');
      n.textContent = fmt(v); n.className = 'in'; el.setAttribute('data-v', v); el.appendChild(n);
      if (old) old.className = 'out';
      void n.offsetWidth; n.className = '';
      setTimeout(function () { if (old && old.parentNode) old.parentNode.removeChild(old); }, 600);
    }
    function bumpK(which) {
      var kb = (S.t.kb || [[0, 1], [1, 1]])[which], el = qa('.wp-num')[kb[0]];
      if (!el) return;
      roll(el, +el.getAttribute('data-v') + kb[1]);
      pop(el.parentNode.parentNode);
    }
    function barsBump() {
      var box = q('.wp-bars'); if (!box) return;
      var bs = box.querySelectorAll('i'), l = bs[bs.length - 1], h = parseFloat(l.style.getPropertyValue('--h')) + 8;
      if (h > 94) { box.removeChild(bs[0]); var n = D.createElement('i'); n.style.setProperty('--h', '30%'); box.insertBefore(n, box.querySelector('.wp-plus')); }
      else l.style.setProperty('--h', h + '%');
      box.style.setProperty('--lh', (h > 94 ? 30 : h) + '%');
      pop(q('.wp-plus'));
    }
    function badge(d) { var b = q('.wp-badge'); if (!b) return; S.badge = Math.max(0, S.badge + d); b.textContent = S.badge; pop(b); }
    function bell() { var b = q('.wp-bell'); if (!b) return; b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring'); }
    function toast(title, sub, ic) {
      var el = q('.wp-toast'); if (!el) return;
      el.querySelector('.wp-ti').innerHTML = IC(ic || 'bell');
      el.querySelector('b').textContent = title; el.querySelector('small').textContent = sub;
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      at(2600, function () { el.classList.remove('on'); });
    }
    function phone(text) {
      ph.querySelector('.wp-ph-n').innerHTML = '<span class="wp-ph-a">' + IC(S.t.ic) + '</span><div><small><span>' + esc(S.p.name) + '</span><em>now</em></small><b>' + esc(text[0]) + '</b><span>' + esc(text[1]) + '</span></div>';
      ph.classList.remove('on'); void ph.offsetWidth; ph.classList.add('on');
      at(2400, function () { ph.classList.remove('on'); });
    }
    function beat(i) { if (S.demo && S.t.beats && cfg.tag) cfg.tag(S.t.beats[i]); }

    /* ---------- the drawer: one item, its steps, one action ---------- */
    var DR = null;
    function openDrawer(d) {
      DR = d;
      var dr = q('.wp-dr');
      dr.innerHTML = '<div class="wp-dh"><div><small>' + esc(d.label) + '</small><strong>' + esc(d.title) + '</strong></div>' + pill(d.st) + '<span class="wp-x">' + SV.x + '</span></div>' +
        '<div class="wp-who">' + av(d.who, 'lg') + '<div><b>' + esc(d.who) + '</b><small>' + esc(d.sub) + '</small></div></div>' +
        '<div class="wp-sec"><small class="wp-lab">Details</small><ul class="wp-kvl">' + d.det.map(function (x) { return '<li><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></li>'; }).join('') + '</ul></div>' +
        '<div class="wp-sec"><small class="wp-lab">Progress</small><ol class="wp-tl">' + d.steps.map(function (s) { return '<li><i>' + SV.ok + '</i><b>' + esc(s) + '</b><small></small></li>'; }).join('') + '</ol></div>' +
        '<div class="wp-ft"><span class="wp-btn"><span class="a">' + esc(d.act) + '</span><span class="b"><i class="wp-spin"></i></span><span class="c">' + SV.ok + esc(d.actd) + '</span></span></div>';
      steps(d.done);
      void dr.offsetWidth;
      q('.wp-main').classList.add('open');
    }
    function steps(n) {
      qa('.wp-tl li').forEach(function (li, i) {
        li.className = i < n ? 'ok' : i === n ? 'cur' : '';
        li.querySelector('small').textContent = i < n ? (DR.times && i < DR.done ? DR.times[i] : (n - 1 - i) ? (n - 1 - i) + ' min ago' : 'Just now') : i === n ? 'Next' : '';
      });
    }
    function closeDrawer() { var m = q('.wp-main'); if (m) m.classList.remove('open'); }
    function swapPill(p, st) { if (!p) return; p.className = 'wp-pill t-' + st[1]; p.textContent = st[0]; pop(p); }
    function btn() { return q('.wp-btn'); }

    /* ---------- the list and the schedule: an item comes in, and moves on ---------- */
    function arrive() {
      var t = S.t, f = t.feed[S.n % t.feed.length], el, sub;
      if (t.view === 'cal') {
        var slot = t.free[S.n % t.free.length], cc = qa('.wp-cc')[slot[0]], r = [slot[0], slot[1], 1, f[1], f[2], 0];
        qa('.wp-ev').forEach(function (e) { if (e._r[0] === slot[0] && e._r[1] === slot[1]) e.parentNode.removeChild(e); });
        el = mk(evHTML(t, r, 'wp-in')); el._r = r; cc.appendChild(el);
        sub = f[1] + ' · ' + hl(slot[1]);
      } else {
        var row = [f[0] === '#' ? '#' + S.id++ : f[0], f[1], f[2], 0], rows = q('.wp-rows'), olds = qa('.wp-tr').filter(function (e) { return e._r && e._r[3] === 2; });
        if (olds.length > 1) { var o = olds[olds.length - 1]; o._r[3] = 3; swapPill(o.querySelector('.wp-pill'), t.flow[3]); }
        while (rows.children.length > 5) rows.removeChild(rows.lastChild);
        el = mk(rowHTML(t, row, 'wp-in')); el._r = row; rows.insertBefore(el, rows.firstChild);
        sub = row[0].charAt(0) === '#' ? row[0] + ' · ' + row[t.pc] : row[t.pc] + ' · ' + (t.pc ? row[0] : row[2]);
      }
      S.n++;
      bumpK(0); barsBump(); badge(1); bell(); toast(t.toast, sub);
      return el;
    }
    function itemData(el) {
      var t = S.t, r = el._r, steps = t.flow.map(function (x) { return x[0]; });
      if (t.view === 'cal') return { label: 'Today, ' + hl(r[1]), title: t.one, who: r[3], sub: r[4] + ' with ' + t.staff[r[0]], det: [['Service', r[4]], ['With', t.staff[r[0]]], ['Time', 'Today, ' + hl(r[1])]], steps: steps, st: t.flow[0], done: 1, act: t.act, actd: t.flow[2][0] };
      var idl = r[0].charAt(0) === '#', other = [];
      for (var j = 0; j < 3; j++) if (j !== t.pc && !(j === 0 && idl)) other.push(r[j]);
      return { label: idl ? t.one : 'Today', title: idl ? r[0] : t.one, who: r[t.pc], sub: other.join(' · '), det: t.det, steps: steps, st: t.flow[0], done: 1, act: t.act, actd: t.flow[2][0] };
    }
    function adv(el, i) {
      var t = S.t, st = t.flow[i];
      if (t.view === 'cal') { el._r[5] = i; el.className = el.className.replace(/\bs\d\b/, 's' + i); pop(el); }
      else { el._r[3] = i; swapPill(el.querySelector('.wp-pill'), st); }
      swapPill(q('.wp-dh .wp-pill'), st);
      steps(i + 1);
    }
    function storyItem() {
      var el, t = S.t;
      return [
        [0, function () { el = arrive(); beat(0); }],
        [1200, function () { showCur(); to(el, 900, t.view === 'cal' ? 0.5 : 0.42, 0.55); }],
        [2150, function () { el.classList.add('hov'); }],
        [2350, function () { click(); el.classList.add('sel'); q('.wp-bell').classList.remove('ring'); openDrawer(itemData(el)); }],
        [3250, function () { adv(el, 1); }],
        [3800, function () { to(btn(), 750, 0.5, 0.55); }],
        [4600, function () { btn().classList.add('hov'); }],
        [4750, function () { click(); btn().classList.add('busy'); beat(1); }],
        [5350, function () { btn().classList.add('done'); adv(el, 2); bumpK(1); badge(-1); toast(t.done[0], t.done[1], 'check'); }],
        [5950, function () { phone([t.push[0], t.view === 'cal' ? t.push[1].replace('{t}', hl(el._r[1])) : t.push[1]]); beat(2); }],
        [7000, function () { to(q('.wp-x'), 700); }],
        [7800, function () { click(); closeDrawer(); el.classList.remove('sel', 'hov'); }],
        [8200, rest],
        [10200, null]
      ];
    }

    /* ---------- the board: drag a finished job to invoice, send it, get paid ---------- */
    function cols() { return qa('.wp-cards'); }
    function counts() { qa('.wp-col').forEach(function (c) { var b = c.querySelector('header b'), n = String(c.querySelectorAll('.wp-card:not(.wp-gone)').length); if (b.textContent !== n) { b.textContent = n; pop(b); } }); }
    function tag(card, tg) { var e = card.querySelector('.wp-tag'); e.className = 'wp-tag t-' + tg[1]; e.textContent = tg[0]; pop(e); }
    function flip(mut, skip) {
      var cs = qa('.wp-card'), r0 = cs.map(function (c) { return c.getBoundingClientRect(); });
      mut();
      cs.forEach(function (c, i) {
        if (c === skip || !c.animate) return;
        var r = c.getBoundingClientRect(), dx = r0[i].left - r.left, dy = r0[i].top - r.top;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.9,.25,1)' });
      });
    }
    function gone(c) { c.classList.add('wp-gone'); at(420, function () { if (c.parentNode) c.parentNode.removeChild(c); counts(); }); }
    function pan(i) {
      var b = q('.wp-board'), inner = q('.wp-bin'); if (!b) return;
      var max = Math.max(0, inner.scrollWidth - inner.clientWidth), c = qa('.wp-col')[i];
      inner.style.transform = max ? 'translateX(' + -Math.min(max, Math.max(0, c.offsetLeft - 2)) + 'px)' : '';
    }
    function boardArrive() {
      var t = S.t, f = t.feed[S.n++ % t.feed.length], c = mk(cardHTML([0, f[0], f[1], f[2], 'New', 'b'])), col = cols()[0];
      c._c = [0, f[0], f[1], f[2]];
      flip(function () { col.insertBefore(c, col.firstChild); }, c);
      c.classList.add('wp-in');
      counts(); bumpK(0); barsBump(); badge(1); bell(); toast(t.toast, f[0] + ' · ' + f[1]);
    }
    function jobCard() { var c = cols()[2].querySelector('.wp-card'); if (c && c.querySelector('.wp-tag').textContent !== 'Done') tag(c, ['Done', 'g']); return c; }
    function grab(c) {
      var r = c.getBoundingClientRect();
      drag = { c: c, x: cx, y: cy, l: r.left, t: r.top };
      c.classList.add('lift');
      c.style.transform = 'rotate(-1.5deg) scale(1.04)';
      if (c.animate) c.animate([{ transform: 'none' }, { transform: 'rotate(-1.5deg) scale(1.04)' }], { duration: 180, easing: 'ease-out' });
    }
    function dragTo(i, ms) {
      if (!drag) return;
      var c = drag.c, col = qa('.wp-col')[i], w = win.getBoundingClientRect();
      col.style.setProperty('--ph', c.offsetHeight + 'px'); col.classList.add('drop');
      var d = drag, r = col.querySelector('.wp-cards').getBoundingClientRect(), ox = d.x - (d.l - w.left), oy = d.y - (d.t - w.top);
      glide(r.left - w.left + ox, r.top - w.top + oy, ms, function () { if (drag === d) c.style.transform = 'translate(' + (cx - d.x).toFixed(1) + 'px,' + (cy - d.y).toFixed(1) + 'px) rotate(-1.5deg) scale(1.04)'; });
    }
    function drop(i) {
      if (!drag) return;
      cancelAnimationFrame(raf);
      var c = drag.c, col = qa('.wp-col')[i], box = col.querySelector('.wp-cards'), vx = drag.l + cx - drag.x, vy = drag.t + cy - drag.y;
      flip(function () { col.classList.remove('drop'); c.classList.remove('lift'); c.style.transform = ''; box.insertBefore(c, box.firstChild); }, c);
      var r = c.getBoundingClientRect();
      if (c.animate) c.animate([{ transform: 'translate(' + (vx - r.left) + 'px,' + (vy - r.top) + 'px) rotate(-1.5deg) scale(1.04)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1)' });
      drag = null; counts();
    }
    function shift() {
      var C = cols(), inv = C[3].querySelectorAll('.wp-card'), old = inv.length > 1 ? inv[inv.length - 1] : null,
        qs = C[1].querySelectorAll('.wp-card'), q0 = qs[0], ql = qs[qs.length - 1], es = C[0].querySelectorAll('.wp-card'), el = es.length > 2 ? es[es.length - 1] : null, j0 = C[2].querySelector('.wp-card');
      flip(function () {
        if (old) C[4].insertBefore(old, C[4].firstChild);
        if (q0) C[2].appendChild(q0);
        if (el) C[1].appendChild(el);
      });
      if (old) { tag(old, ['Paid', 'g']); toast('Payment received', old._c[1] + ' · ' + old._c[2], 'check'); }
      if (j0) tag(j0, ['Done', 'g']);
      if (q0) tag(q0, ['Today', 'a']);
      if (ql && ql !== q0) tag(ql, ['Sent', 'b']);
      if (el) tag(el, ['Draft', 'k']);
      var paid = C[4].querySelectorAll('.wp-card'); for (var i = 2; i < paid.length; i++) gone(paid[i]);
      counts();
    }
    function storyBoard() {
      var c, t = S.t, id;
      return [
        [0, function () { pan(0); }],
        [300, function () { boardArrive(); beat(0); }],
        [1400, function () { pan(2); }],
        [2200, function () { c = jobCard(); if (!c) return; showCur(); to(c, 850, 0.5, 0.42); }],
        [3100, function () { if (c) c.classList.add('hov'); }],
        [3300, function () { if (!c) return; press(); grab(c); }],
        [3550, function () { dragTo(3, 1000); beat(1); }],
        [4650, function () { drop(3); if (c) { c.classList.remove('hov'); tag(c, ['Draft', 'k']); c.classList.add('gen'); } }],
        [5500, function () { if (!c) return; id = '#' + S.inv++; c.classList.remove('gen'); tag(c, [id, 'v']); }],
        [5800, function () { if (!c) return; click(); c.classList.add('sel'); q('.wp-bell').classList.remove('ring');
          openDrawer({ label: 'Invoice', title: id, who: c._c[3], sub: c._c[1] + ' · ' + c._c[2], det: t.det, steps: t.flow.map(function (x) { return x[0]; }), times: t.times, st: ['Draft', 'k'], done: 3, act: t.act, actd: 'Sent' }); }],
        [6700, function () { to(btn(), 750, 0.5, 0.55); }],
        [7500, function () { if (btn()) btn().classList.add('hov'); }],
        [7650, function () { if (!btn()) return; click(); btn().classList.add('busy'); beat(2); }],
        [8250, function () { if (!btn()) return; btn().classList.add('done'); steps(4); swapPill(q('.wp-dh .wp-pill'), ['Sent', 'v']); if (c) tag(c, ['Sent', 'v']); bumpK(1); badge(-1); toast(t.done[0], t.done[1], 'check'); }],
        [8850, function () { phone([t.push[0].replace('{id}', id || ''), t.push[1]]); }],
        [9900, function () { to(q('.wp-x'), 700); }],
        [10700, function () { click(); closeDrawer(); if (c) c.classList.remove('sel', 'hov'); }],
        [11100, rest],
        [11900, function () { pan(4); }],
        [12700, function () { shift(); beat(3); }],
        [15200, null]
      ];
    }

    /* ---------- play, pause, and clean up ---------- */
    function loop(delay) {
      var st = S.t.view === 'board' ? storyBoard() : storyItem(), end = 0;
      st.forEach(function (s) { end = Math.max(end, s[0]); if (s[1]) at(delay + s[0], s[1]); });
      at(delay + end, function () { loop(0); });
    }
    function play(delay) {
      if (RM || building || playing || !wanted) return;
      playing = true; root.classList.add('wp-on');
      loop(delay == null ? 700 : delay);
    }
    function settle() {
      cancelAnimationFrame(raf);
      qa('.wp-toast.on').forEach(function (e) { e.classList.remove('on'); });
      ph.classList.remove('on');
      closeDrawer();
      cur.classList.remove('on', 'dn', 'clk');
      if (drag) { drag.c.classList.remove('lift'); drag.c.style.transform = ''; drag = null; }
      qa('.sel,.hov,.gen,.drop').forEach(function (e) { e.classList.remove('sel', 'hov', 'gen', 'drop'); });
      qa('.wp-gone').forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
      if (q('.wp-board')) counts();
    }
    function pause() { playing = false; clearQ(); settle(); root.classList.remove('wp-on'); }

    /* ---------- the sketch: dissolve, assemble, wash in the colour, type the name ---------- */
    function typeInto(el, s, ms, after) {
      var i = 0;
      el.textContent = '';
      (function f() { el.textContent = s.slice(0, ++i); if (i < s.length) bt(ms, f); else if (after) bt(420, after); })();
    }
    function countUp() {
      var els = qa('.wp-num'), t0 = 0;
      function f(now) {
        if (!t0) t0 = now;
        var k = Math.min(1, (now - t0) / 750);
        els.forEach(function (el) { el.firstChild.textContent = fmt(+el.getAttribute('data-v') * ease(k)); });
        if (k < 1) braf = requestAnimationFrame(f);
      }
      braf = requestAnimationFrame(f);
    }
    function wash() {
      var w = q('.wp-wash'), lg = qa('.wp-logo').filter(function (e) { return e.offsetWidth; })[0], wr = w.getBoundingClientRect(), r = lg ? lg.getBoundingClientRect() : wr;
      w.style.setProperty('--x', (r.left - wr.left + r.width / 2) + 'px'); w.style.setProperty('--y', (r.top - wr.top + r.height / 2) + 'px');
      w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
    }
    function sketch(text, done) {
      var p = plan(String(text || ''));
      clearB(); pause();
      done = done || function () {};
      if (RM) { render(p); done(); return; }
      building = true;
      appEl.classList.remove('wp-s0', 'wp-s1', 'wp-s2');
      appEl.classList.add('wp-out'); hostEl.classList.add('sel');
      prog.className = 'wp-prog'; void prog.offsetWidth; prog.classList.add('p1');
      bt(300, function () {
        render(p, true);
        appEl.classList.add('wp-s0'); appEl.classList.remove('wp-out');
        hostEl.classList.remove('sel'); urlEl.classList.add('typing');
        typeInto(hostEl, slug(p.name), 24, function () { urlEl.classList.remove('typing'); });
        wash();
        void appEl.offsetWidth;
        bt(30, function () { appEl.classList.remove('wp-s0'); appEl.classList.add('wp-s1'); });
        bt(400, function () {
          appEl.classList.remove('wp-s1'); appEl.classList.add('wp-s2'); countUp();
          var nm = q('.wp-name'); typeInto(nm, p.name, 32, function () { nm.classList.remove('typing'); });
        });
        bt(880, function () { prog.classList.add('p2'); done(); });
        bt(1500, function () {
          appEl.classList.remove('wp-s2'); prog.className = 'wp-prog'; building = false;
          if (vis && !D.hidden) wanted = true;
          play(1500);
        });
      });
    }

    /* ---------- start ---------- */
    var t0 = byKey(cfg.demo);
    render({ t: t0, name: t0.dn || t0.def });
    S.demo = true;
    if (cfg.hasIO && W.IntersectionObserver) { vis = false; new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0.25 }).observe(root); }
    return {
      start: function () { wanted = true; play(); },
      stop: function () { wanted = false; pause(); },
      sketch: sketch
    };
  };
})();
