/* Building blocks for the product consoles in "See what we can build" (src/cx.mjs). Every console file (cx-*.mjs) uses these.
   All words and numbers in the consoles are Bolt's draft mock data. */

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* outline icons, Lucide style */
const P = {
  orders: 'M9 5h10M9 12h10M9 19h10M4 5h.01M4 12h.01M4 19h.01',
  box: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  plug: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4',
  truck: 'M14 18V6H2v12h2M14 9h4l4 4v5h-2M9 18h6M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  card: 'M2 5h20v14H2zM2 10h20M6 15h4',
  mega: 'M3 11v3l12 5V6L3 11zM15 9a4 4 0 0 1 0 6M6 14l1 6h3l-1-5',
  flask: 'M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10',
  gavel: 'm14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M9 7l8 8',
  gift: 'M3 8h18v4H3zM12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chart: 'M3 3v18h18M7 15l4-4 3 3 6-7',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
  store: 'M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6',
  check: 'M20 6 9 17l-5-5',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  scan: 'M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4M3 12h18',
  plus: 'M12 5v14M5 12h14',
  home: 'M3 11 12 3l9 8v10h-6v-6H9v6H3z',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  lab: 'M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3M7 15h10',
  bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  cam: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  pos: 'M4 3h16v8H4zM2 11h20l-1 10H3zM8 7h8M8 15h2M14 15h2',
  clip: 'M9 3h6v3H9zM6 5H5v16h14V5h-1M8 12h8M8 16h5',
  tag: 'M12 2H3v9l10 10 9-9zM7.5 7.5h.01',
  pct: 'M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  help: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  cal: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  steth: 'M5 3v6a5 5 0 0 0 10 0V3M10 14v2a5 5 0 0 0 10 0v-3M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  video: 'M15 10l5-3v10l-5-3zM3 6h12v12H3z',
  bed: 'M2 4v16M22 20v-8a3 3 0 0 0-3-3h-9v8M2 17h20M6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  pill: 'M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM8.5 8.5l7 7',
  phone: 'M7 2h10v20H7zM11 18h2',
  bank: 'M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-7 10 7z',
  id: 'M3 5h18v14H3zM8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 16c.7-1.5 1.8-2 3-2s2.3.5 3 2M14 9h4M14 13h4',
  scale: 'M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z',
  coins: 'M8 8a6 3 0 1 0 0-.01M2 8v4c0 1.7 2.7 3 6 3M2 12v4c0 1.7 2.7 3 6 3M16 11a6 3 0 1 0 0-.01M10 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4',
  swap: 'M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  alert: 'M12 3 2 21h20zM12 10v4M12 17h.01',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  bot: 'M12 8V4M8 4h8M5 8h14v12H5zM9 13h.01M15 13h.01M9 17h6M2 13v3M22 13v3',
  db: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  doc: 'M14 2H6v20h12V6zM14 2v4h4M8 13h8M8 17h6',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
  layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  rocket: 'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5',
  pulse: 'M22 12h-4l-3 9L9 3l-3 9H2',
  wallet: 'M20 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15v12H5a2 2 0 0 1-2-2V6M16 14h.01',
  flow: 'M6 3h4v4H6zM14 17h4v4h-4zM8 7v4a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v2',
  play: 'M6 4l14 8-14 8z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13L22 12v7H2v-7z',
  brief: 'M3 7h18v13H3zM8 7V4h8v3M3 13h18',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  down: 'm6 9 6 6 6-6',
};
export const ic = (n, c = '') => `<svg class="cx-i${c ? ' ' + c : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.grid}"/></svg>`;

/* numbers: printed at their end value (no script, reduced motion); the player counts them from a to b */
export const FM = {
  n: (v) => Math.round(v).toLocaleString('en-IN'),
  inr: (v) => '₹' + Math.round(v).toLocaleString('en-IN'),
  l: (v) => '₹' + v.toFixed(1) + 'L',
  cr: (v) => '₹' + v.toFixed(1) + ' Cr',
  p: (v) => v.toFixed(1) + '%',
  x: (v) => v.toFixed(1) + 'x',
  ms: (v) => Math.round(v) + ' ms',
  d1: (v) => v.toFixed(1),
};
export const N = (a, b, f = 'n', at = 0, ms = 1200) => `<b class="cx-n" data-n="${a},${b},${ms},${f}" data-at="${at}">${FM[f](b)}</b>`;

/* status chips: ok (green), w (amber, waiting), m (grey), bad (red), a (product colour); sw() changes one status to another at t seconds */
export const chip = (c, t) => `<em class="cx-c ${c}">${t}</em>`;
export const sw = (c1, t1, c2, t2, t) => `<span class="cx-sw" style="--t:${t}s"><em class="cx-c ${c1} o">${t1}</em><em class="cx-c ${c2} n">${t2}</em></span>`;
export const spin = '<i class="cx-spin"></i>';
export const tog = (t) => `<i class="cx-tg" style="--t:${t}s"></i>`;
export const bar = (w, d, c = '') => `<i class="cx-bar${c ? ' ' + c : ''}"><i style="--w:${w};--d:${d}s"></i></i>`;
export const late = (html, d) => `<span class="cx-lt" style="--d:${d}s">${html}</span>`;

/* a dense table: cols = [label, width, hideOnPhone]; rows = arrays of cell html; opt.at = delay of the first row; opt.hl = highlighted row; opt.nw = rows that stream in late */
export const table = (cols, rows, opt = {}) => {
  const tpl = cols.map(([, w]) => w).join(' ');
  const cell = (c, j) => `<span${cols[j][2] ? ' class="cx-hm"' : ''}>${c}</span>`;
  return `<div class="cx-tb" style="--g:${tpl}"><div class="cx-tr th">${cols.map(([l], j) => cell(l, j)).join('')}</div>${rows.map((r, i) => {
    const lt = opt.nw && opt.nw[i] != null;
    return `<div class="cx-tr r${lt ? ' nw' : ''}${opt.hl === i ? ' hl' : ''}" style="--d:${lt ? opt.nw[i] : (opt.at || 0.15) + i * 0.08}s">${r.map((c, j) => cell(c, j)).join('')}</div>`;
  }).join('')}</div>`;
};
export const kpis = (list, at = 0) => `<div class="cx-kp">${list.map(([l, v, s], i) => `<div class="cx-k r" style="--d:${at + i * 0.06}s"><span>${l}</span>${v}${s ? `<small>${s}</small>` : ''}</div>`).join('')}</div>`;
export const card = (title, body, d = 0.4, extra = '') => `<div class="cx-cd r${extra ? ' ' + extra : ''}" style="--d:${d}s"><p class="cx-ct">${title}</p>${body}</div>`;
export const two = (...cards) => `<div class="cx-2">${cards.join('')}</div>`;
export const three = (...cards) => `<div class="cx-3">${cards.join('')}</div>`;
export const rowkv = (k, v) => `<p class="cx-kv"><span>${k}</span>${v}</p>`;
export const rules = (list, at = 0.8) => list.map((t, i) => `<p class="cx-rl">${t}${tog(at + i * 0.3)}</p>`).join('');
export const tl = (list, at = 1.2) => `<ul class="cx-tl">${list.map((t, i) => `<li style="--d:${at + i * 0.4}s">${t}</li>`).join('')}</ul>`;
export const steps = (list, at = 0.9) => `<ol class="cx-flow">${list.map((t, i) => `<li style="--d:${at + i * 0.4}s">${t}</li>`).join('')}</ol>`;
export const bars = (list, at = 0.6, lw = 110) => `<div class="cx-bs" style="--lw:${lw}px">${list.map(([t, w, v], i) => `<div class="cx-ab wide"><span>${t}</span>${bar(w, at + i * 0.12)}${v ? `<b>${v}</b>` : '<b></b>'}</div>`).join('')}</div>`;
export const split = (list, d = 0.4) => `<div class="cx-split r" style="--d:${d}s">${list.map(([, w]) => `<i style="--w:${w}"></i>`).join('')}</div><p class="cx-lg r" style="--d:${d + 0.1}s">${list.map(([t, w]) => `<span>${t} ${w}%</span>`).join('')}</p>`;

/* a line chart from a list of values (0..100, higher is up) */
export const chart = (title, vals, d = 0.3, h = 110) => {
  const step = 300 / (vals.length - 1);
  const pts = vals.map((v, i) => `${Math.round(i * step)} ${Math.round(88 - v * 0.8)}`).join(' ');
  return `<div class="cx-cd r cx-chart" style="--d:${d}s"><p class="cx-ct">${title}</p><svg viewBox="0 0 300 90" preserveAspectRatio="none" style="height:${h}px" aria-hidden="true">
<path class="gr" d="M0 22H300M0 45H300M0 68H300"/><path class="ar" d="M${pts}V90H0z"/><path class="ln" pathLength="1" d="M${pts}"/></svg></div>`;
};

/* an automation chain: list of [icon, app, step, doneAt] — each step lights up in turn */
export const chain = (list, at = 0.6) => `<div class="cx-ch">${list.map(([i, app, t, s], k) => `<div class="cx-nd r" style="--d:${at + k * 0.15}s"><span class="cx-ni2">${ic(i)}</span><div><small>${app}</small><p>${t}</p></div>${sw('m', 'Waiting', 'ok', 'Done', s)}</div>`).join('')}</div>`;

/* a camera frame with detection boxes: list of [left%, top%, w%, h%, label, at] */
export const cv = (title, boxes, extra = '') => `<div class="cx-cv"><span class="cx-cvl"><i class="cx-live"></i>${title}</span><i class="cx-part"></i>${boxes.map(([l, t, w, h, lb, d]) => `<i class="cx-bx" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%;--d:${d}s"><em>${lb}</em></i>`).join('')}${extra}<i class="cx-scan"></i></div>`;
