/* "See what we can build" for the AI funnel page (?s=build-with-ai). No console, no carousel: scan tiles in the funnel theme.
   Suraj, 24 Nov 2026: real construction documents from the PilrsAI repo, anonymized (symbols, segmentation, perimeter, multiview),
   plus QA and inspection: "should look like realistic items being analyzed", "Item being scanned" (pharma, precision metals,
   food commodities, retail store video heatmaps).
   Suraj, 24 Nov 2026: "I mean any other PDF." "I don't want doors and all that. Just focus on that electrical thing."
   Plan sheets: crops of a real residential electrical set (E101 and E102, 1/4" = 1'-0"), title block cut off. Light boxes are the
   ceiling-light crosshairs read from the PDF vectors; fan boxes come from a template match on the fan symbol. Pendants, outlets,
   switches and the exhaust fan were placed by hand on the drawing. Counts per floor are the boxes inside each crop or sheet.
   QA photos: Wikimedia Commons, public domain or CC0 (coffee beans: MarkSweep; blister pack: Tmeers91; bearing: US National Archives;
   store aisle: Bdx). Brand text is cropped out or blurred.
   Every title, label, chip and every number not read from a drawing is Bolt's draft.
   Speed: images lazy-load; only transform and opacity animate; a tile plays when it is on screen and resets when it leaves. */
import { readFileSync } from 'node:fs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const img = (f) => 'data:image/webp;base64,' + readFileSync(new URL('assets/' + f, import.meta.url)).toString('base64');
const r1 = (n) => Math.round(n * 10) / 10;
const S = 2.6; // scan time, seconds
const AM = '#FFBD59', GR = '#2FD574', BL = '#7AA2F7', PK = '#F7768E', RD = '#F85149';

/* a box in % of the image; it pops when the scan line reaches its middle */
const box = ([x1, y1, x2, y2], c, l, f) => {
  const d = r1((0.1 + ((y1 + y2) / 200) * S) * 100) / 100;
  return `<i class="ai-b${f ? ' f' : ''}${y1 < 7 ? ' lb' : ''}" style="left:${r1(x1)}%;top:${r1(y1)}%;width:${r1(x2 - x1)}%;height:${r1(y2 - y1)}%;--c:${c};--d:${d}s"${l ? ` data-l="${esc(l)}"` : ''}></i>`;
};
const counter = (n, w) => `<b class="ai-n" data-n="${n}">0</b>${esc(w)}`;
const chips = (a) => `<div class="ai-out">${a.map((c, i) => `<span${c[0] === '!' ? ' class="x"' : ''} style="--i:${i}">${esc(c.replace(/^!/, ''))}</span>`).join('')}</div>`;
const tile = ({ ix, t, n, src, w, h, dk, wide, sl, ov, after = '', out }) => `<figure class="ai-t${wide ? ' w' : ''}${sl ? ' ai-sl' : ''}"${sl ? ` data-t="${esc(t)}"` : ''}>
 <figcaption class="ai-h"><span class="ix">${ix}</span><h3>${esc(t)}</h3><span class="ai-c">${n}</span></figcaption>
 <div class="ai-st${dk ? ' dk' : ''}" style="aspect-ratio:${w}/${h}"><img src="${img(src)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">${ov}<div class="ai-sc" aria-hidden="true"></div></div>
 ${after}${chips(out)}
</figure>`;

/* ---------- 01 electrical plan, floor 1: ceiling lights, fans, pendants (found on the drawing) ---------- */
const E1 = { L: [[14.0,82.8,15.4,84.8],[6.1,83.8,7.6,85.9],[25.2,86.4,26.6,88.4],[13.2,11.0,14.6,13.0],[71.3,71.2,72.8,73.3],[75.6,40.6,77.0,42.7],[85.9,40.6,87.4,42.7],[85.9,57.6,87.4,59.7],[75.6,57.6,77.0,59.7],[34.8,27.0,36.2,29.0],[77.8,89.1,79.2,91.2],[77.9,70.6,79.4,72.6],[13.2,31.0,14.6,33.1],[36.6,84.5,38.0,86.5],[41.1,71.2,42.5,73.3],[41.1,57.4,42.5,59.5],[41.1,43.6,42.5,45.7],[30.9,71.2,32.3,73.3],[30.9,57.4,32.3,59.5],[30.9,43.6,32.3,45.7],[21.4,71.2,22.8,73.3],[21.4,57.4,22.8,59.5],[21.4,43.6,22.8,45.7],[9.4,71.2,10.9,73.3],[9.4,57.4,10.9,59.5],[9.4,43.6,10.9,45.7],[22.0,11.0,23.5,13.0],[22.0,31.0,23.5,33.1],[49.4,84.5,50.9,86.5],[61.6,84.5,63.1,86.5],[51.0,71.2,52.4,73.3],[51.0,43.6,52.4,45.7],[61.3,71.2,62.7,73.3],[61.3,57.4,62.7,59.5],[61.3,43.6,62.7,45.7],[71.3,89.0,72.8,91.0],[86.3,69.7,87.8,71.7],[85.9,90.0,87.4,92.1],[51.6,27.0,53.1,29.0],[68.5,27.0,69.9,29.0],[85.3,27.0,86.8,29.0],[34.8,8.8,36.2,10.9],[51.6,8.8,53.1,10.9],[68.5,8.8,69.9,10.9],[85.3,8.8,86.8,10.9]], F: [[41.9,16.2,46.2,22.5],[79.2,46.7,83.5,53.0],[73.6,16.2,78.0,22.5],[49.5,55.3,53.8,61.6]], P: [[15.0,48.0,16.4,50.1],[15.0,62.0,16.4,64.1],[71.3,64.0,72.7,66.0],[71.3,96.8,72.7,98.8]] };
const elec1 = tile({
  ix: '01', t: 'Lights and fans, floor 1', sl: 1, src: 'plans/elec-f1.webp', w: 1600, h: 1121,
  n: `${counter(59, ' lights')} · ${counter(6, ' fans')} · ${counter(4, ' pendants')}`,
  ov: E1.L.map((b) => box(b, AM)).join('') + E1.F.map((b) => box(b, GR, 'FAN')).join('') + E1.P.map((b) => box(b, BL, 'PENDANT')).join(''),
  out: ['59 ceiling lights', '6 fan / light combos', '4 pendants', 'Count per sheet → takeoff'],
});

/* ---------- 02 outlets and switches (zoom on kitchen and family room) ---------- */
const REC = [[3.0,12.8,5.5,16.6],[3.0,21.1,5.5,24.9],[3.0,40.9,5.5,44.7],[3.0,57.7,5.5,61.5],[88.2,7.5,90.7,11.3],[94.4,16.7,96.9,20.5],[89.9,32.9,92.4,36.7],[94.4,55.7,96.9,59.5],[3.0,75.8,5.5,79.6],[36.2,68.5,38.7,72.3]];
const GFI = [[29.4,76.1,31.9,79.9],[34.6,95.1,37.1,98.9]];
const SW1 = [[5.7,67.2,7.5,70.0],[41.5,68.0,43.3,70.8],[15.5,95.4,17.3,98.2],[78.2,94.1,80.0,96.8]];
const SW2 = [[38.0,7.1,40.2,10.9],[38.0,67.7,40.2,71.5],[38.0,84.9,40.2,88.7],[24.2,95.1,26.4,98.9],[92.2,67.7,94.4,71.5]];
const outlets = tile({
  ix: '02', t: 'Outlets and switches', sl: 1, src: 'plans/elec-outlets.webp', w: 1200, h: 790,
  n: `${counter(12, ' outlets')} · ${counter(14, ' switches')}`,
  ov: REC.map((b) => box(b, GR)).join('') + GFI.map((b) => box(b, PK, 'GFI')).join('') + SW1.map((b) => box(b, AM)).join('') + SW2.map((b) => box(b, AM, 'SS')).join('') + box([32.5,85.1,34.8,88.6], BL, 'EXH'),
  out: ['10 outlets · 2 GFCI', '14 switches', '1 exhaust fan', 'GFCI rule checked'],
});

/* ---------- 03 legend read into a symbol list ---------- */
const LEG = [[0.9,0.5,48.4,9.4],[0.9,10.4,48.4,19.5],[0.9,20.5,48.4,29.2],[0.9,30.2,48.4,39.6],[0.9,40.6,48.4,49.5],[0.9,50.5,48.4,58.9],[0.9,59.9,48.4,69.3],[0.9,70.4,48.4,78.9],[0.9,79.9,48.4,88.6],[52.3,0.9,99.7,10.1],[52.3,11.1,99.7,20.0],[52.3,21.0,99.7,30.2],[52.3,31.3,99.7,40.1],[52.3,41.2,99.7,49.5],[52.3,50.6,99.7,60.1],[52.3,61.1,99.7,69.9],[52.3,70.9,99.7,79.4],[52.3,80.4,99.7,99.6]];
const LEGL = { 0: '106 found', 1: '7 found', 17: '11 found' };
const legend = tile({
  ix: '03', t: 'Legend read into a symbol list', sl: 1, src: 'plans/elec-legend.webp', w: 1200, h: 684,
  n: counter(18, ' symbol types'),
  ov: LEG.map((b, i) => box(b, i in LEGL ? GR : AM, LEGL[i]).replace('class="ai-b', 'class="ai-b rw')).join(''),
  out: ['18 symbols learned from the sheet', 'Same names in the takeoff', 'No manual setup'],
});

/* ---------- 04 electrical plan, floor 2: same symbols, second sheet + takeoff table ---------- */
const E2 = { L: [[12.4,66.7,13.9,68.9],[17.8,96.5,19.4,98.8],[12.5,83.1,14.0,85.3],[16.9,51.7,18.4,53.9],[9.0,16.4,10.5,18.6],[9.0,34.7,10.5,36.9],[27.5,34.7,29.0,36.9],[27.5,16.4,29.0,18.6],[25.3,71.4,26.8,73.6],[27.7,92.4,29.2,94.6],[40.5,77.0,42.0,79.2],[40.0,93.4,41.5,95.6],[51.4,94.1,53.0,96.3],[51.4,77.0,53.0,79.2],[43.9,31.7,45.4,33.9],[77.1,76.3,78.7,78.5],[77.1,90.9,78.7,93.1],[89.0,90.9,90.5,93.1],[89.0,76.3,90.5,78.5],[79.0,10.9,80.5,13.1],[90.9,10.9,92.5,13.1],[90.9,25.9,92.5,28.1],[79.0,25.9,80.5,28.1],[83.6,43.8,85.1,46.0],[31.3,53.6,32.8,55.8],[83.7,58.1,85.2,60.3],[60.7,31.7,62.3,33.9],[43.9,15.9,45.4,18.1],[52.3,15.9,53.8,18.1],[60.7,15.9,62.3,18.1],[91.3,42.5,92.8,44.8],[91.3,63.3,92.8,65.5],[75.2,54.1,76.8,56.3],[49.7,53.6,51.2,55.8],[65.0,68.2,66.5,70.5],[65.0,53.6,66.5,55.8],[65.0,87.8,66.5,90.0],[31.2,71.4,32.7,73.6]], F: [[43.9,80.9,48.6,87.6],[81.5,81.0,86.2,87.7],[83.3,15.9,88.0,22.6],[51.1,21.9,55.8,28.5],[16.6,24.7,21.3,31.3]], P: [[75.5,38.0,77.0,40.2],[75.5,64.3,77.0,66.5],[3.8,70.3,5.4,72.5]] };
const TAKE = [['Ceiling light', '59', '47', '106'], ['Fan / light combo', '6', '5', '11'], ['Pendant light', '4', '3', '7']];
const elec2 = tile({
  ix: '04', t: 'Floor 2, same symbols', sl: 1, src: 'plans/elec-f2.webp', w: 1600, h: 1104,
  n: `${counter(47, ' lights')} · ${counter(5, ' fans')} · ${counter(3, ' pendants')}`,
  ov: E2.L.map((b) => box(b, AM)).join('') + E2.F.map((b) => box(b, GR, 'FAN')).join('') + E2.P.map((b) => box(b, BL, 'PENDANT')).join(''),
  after: `<div class="ai-tb c4" role="table"><div class="r h" role="row"><span>Fixture</span><span>Floor 1</span><span>Floor 2</span><span>Total</span></div>${TAKE.map((r) => `<div class="r" role="row">${r.map((c) => `<span>${esc(c)}</span>`).join('')}</div>`).join('')}</div>`,
  out: ['2 sheets → 1 takeoff', '124 light fixtures', 'Export: CSV · Excel'],
});

/* ---------- 05 pharma: blister pockets ---------- */
const blister = tile({
  ix: '05', t: 'Blister strip, pocket check', src: 'qa/qa-blister.webp', w: 1200, h: 618, dk: 1,
  n: `${counter(6, ' / 8 filled')}`,
  ov: [[6.3,26.2,20,55],[27.3,20.7,42.1,50.2],[74.3,8.9,91.3,40.5],[6.5,66.7,20.4,95.5],[74.8,53.4,92.1,85]].map((b) => box(b, GR, 'OK')).join('')
    + box([50, 14.9, 65.8, 45.3], AM, 'DENT', 1) + box([24.2, 55.8, 45.8, 97], RD, 'EMPTY', 1) + box([46.5, 54.2, 70, 97], RD, 'EMPTY', 1),
  out: ['8 pockets', '6 tablets', '1 dent → review', '!2 empty → reject strip'],
});

/* ---------- 06 precision metals: bearing parts measured from the photo ---------- */
const bearing = tile({
  ix: '06', t: 'Bearing parts, measured', src: 'qa/qa-bearing.webp', w: 840, h: 610,
  n: counter(4, ' parts'),
  ov: box([61.3, 2.8, 97, 58.2], AM, 'OUTER RING ≈ 9.1 cm') + box([30, 19.7, 62.1, 69.7], BL, 'CAGE ≈ 8.2 cm') + box([3.3, 39.7, 33.3, 77.9], GR, 'INNER RING ≈ 6.8 cm')
    + box([53.3, 76.7, 76.2, 98.7], GR, '11 BALLS ≈ 1.3 cm') + box([11, 83.9, 23.6, 92.8], PK, 'SCALE 2.5 cm') + box([8.3, 59.8, 14.3, 68.9], RD, 'MARK', 1),
  out: ['Scale read from the ruler', 'Sizes within tolerance', '!1 surface mark → review'],
});

/* ---------- 07 food commodities: roasted beans graded ---------- */
const BEANS = [[35,68,262,180],[312,90,535,185],[126,215,305,385],[378,185,570,330],[555,262,770,400],[692,195,865,355],[0,290,152,450],[276,298,445,430],[428,332,580,450],[528,365,728,530],[830,375,1005,520],[1002,328,1155,505],[0,432,150,630],[215,410,385,570],[388,450,565,650],[270,505,465,700],[528,630,705,860],[720,560,910,770],[960,588,1185,808],[60,525,220,720],[650,760,875,900],[1085,40,1200,195],[1050,188,1200,305],[782,118,965,300],[405,8,592,95]];
const pc = ([a, b, c, d]) => [a / 12, b / 9, c / 12, d / 9];
const beans = tile({
  ix: '07', t: 'Roasted beans, graded', src: 'qa/qa-beans.webp', w: 1200, h: 900,
  n: counter(28, ' beans'),
  ov: BEANS.map((b) => box(pc(b), GR)).join('') + box(pc([700, 468, 845, 545]), RD, 'BROKEN', 1) + box(pc([562, 572, 660, 628]), RD, 'CHIP', 1) + box(pc([905, 48, 1068, 168]), AM, 'LIGHT ROAST', 1),
  out: ['25 sound', '3 defects · 10.7%', 'Lot grade → A'],
});

/* ---------- 08 retail: store camera, footfall heatmap ---------- */
const HEAT = [[50, 62, 46, RD, 1.2], [27, 78, 30, RD, 1.5], [50, 36, 30, AM, 1.0], [9, 62, 22, AM, 1.7], [65, 78, 26, AM, 1.9], [53, 24, 18, BL, 0.7], [40, 46, 18, BL, 1.4]];
const aisle = tile({
  ix: '08', t: 'Store camera, footfall heatmap', src: 'qa/qa-aisle.webp', w: 960, h: 502, dk: 1,
  n: counter(1240, ' visits today'),
  ov: HEAT.map(([x, y, s, c, d]) => `<i class="ai-ht" style="left:${x}%;top:${y}%;--s:${s}%;--c:${c};--d:${d}s"></i>`).join('')
    + box([40.4, 14.3, 42.2, 18.9], GR) + `<span class="ai-hud" aria-hidden="true"><i></i>CAM 03 · AISLE 4 · <b class="ai-clk">10:42:07</b></span>`
    + `<span class="ai-rl hl" style="left:27%;top:66%;--d:2s">Promo table · dwell 38 s</span>`,
  out: ['Hot spot: promo table', 'Avg dwell 38 s', 'Faces and brands blurred'],
});

const cards = (a) => `<div class="ai-g">${a.join('')}</div>`;
/* the four drawing tiles share one frame and play one after another */
const reel = (a) => `<div class="ai-g"><div class="ai-cr" data-cr><div class="ai-cr-v">${a.join('')}</div><div class="ai-cr-n" role="tablist">${a.map((s, i) => `<button type="button" role="tab" aria-selected="${i ? 'false' : 'true'}"><span>0${i + 1}</span><em>${s.match(/data-t="([^"]*)"/)[1]}</em></button>`).join('')}</div></div></div>`;
export const aiSection = (heading) => `<section class="sec" id="types" aria-labelledby="ty-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="ty-t">${esc(heading)}</h2></div>
 <div class="ai" data-ai>
  <p class="ai-k"><b>Electrical drawings</b><span>Real plan sheets · names removed</span></p>
  ${reel([elec1, outlets, legend, elec2])}
  <p class="ai-k"><b>Quality inspection</b><span>Item being scanned</span></p>
  ${cards([blister, bearing, beans, aisle])}
 </div>
</div></section>`;

export const AI_CSS = String.raw`.ai{--rd:#F85149;--bl:#7AA2F7;margin-top:24px}
.ai-k{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:44px 0 18px;font:500 12px/1.4 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ai-k:first-child{margin-top:8px}.ai-k b{color:var(--accent);font-weight:600}
.ai-g{display:grid;grid-template-columns:1fr 1fr;gap:34px 30px;padding-right:11px}
.ai-t{margin:0;min-width:0;display:flex;flex-direction:column;background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset)}
.ai-t.w{grid-column:1/-1}
.ai-cr{grid-column:1/-1;min-width:0;background:var(--panel);border:var(--heavy);box-shadow:var(--heavy-offset)}
.ai-cr-v{display:grid}
.ai-sl{grid-area:1/1;border:0;box-shadow:none;background:none;opacity:0;visibility:hidden;transform:translateX(16px);transition:opacity .45s,transform .45s,visibility 0s .45s}
.ai-sl.cur{opacity:1;visibility:visible;transform:none;transition:opacity .45s,transform .45s}
.ai-cr-n{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line)}
.ai-cr-n button{position:relative;min-width:0;display:flex;gap:8px;padding:13px 16px;font:500 12px/1.3 var(--font-m);text-align:left;color:var(--muted);background:none;border:0;border-left:1px solid var(--line);cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ai-cr-n em{font-style:normal;overflow:hidden;text-overflow:ellipsis}.ai-cr-n button:first-child{border-left:0}.ai-cr-n button span{color:var(--muted)}
.ai-cr-n button[aria-selected=true]{color:var(--ink)}.ai-cr-n button[aria-selected=true] span{color:var(--accent)}
.ai-cr-n button::after{content:"";position:absolute;left:0;right:0;top:-1px;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left}
.ai-cr-n button[aria-selected=true]::after{transform:scaleX(1)}
.ai-cr.run .ai-cr-n button[aria-selected=true]::after{transform:scaleX(0);animation:aiPg var(--hold) linear forwards}
@keyframes aiPg{to{transform:scaleX(1)}}
.ai-h{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}
.ai-h .ix{font:500 12px var(--font-m);color:var(--muted)}
.ai-h h3{flex:1;min-width:0;font:600 19px/1.2 var(--font-d);letter-spacing:-.01em;color:var(--ink)}
.ai-c{font:500 12px var(--font-m);color:var(--muted);white-space:nowrap}.ai-c b{margin-right:3px;font-size:15px;font-weight:600;color:var(--accent);font-variant-numeric:tabular-nums}
.ai-st{position:relative;overflow:hidden;background:#fff}.ai-st.dk{background:#000}
.ai-st img{position:absolute;inset:0;width:100%;height:100%;display:block}
.ai-b{position:absolute;border:1.5px solid var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);opacity:0;transform:scale(1.3)}
.ai-b[data-l]::after{content:attr(data-l);position:absolute;left:-1.5px;bottom:100%;padding:2px 3px;font:600 9px/1 var(--font-m);letter-spacing:.02em;white-space:nowrap;background:var(--c);color:#0A0A0B}
.ai-b.lb::after{bottom:auto;top:100%}
.ai-b.f{border-width:2px}
.ai-b.rw{border:0;border-left:3px solid var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}
.on .ai-b{animation:aiPop .35s var(--d) cubic-bezier(.2,.8,.3,1) forwards}
.on .ai-b.f{animation:aiPop .35s var(--d) cubic-bezier(.2,.8,.3,1) forwards,aiFl 1s calc(var(--d) + .4s) 3}
@keyframes aiPop{to{opacity:1;transform:none}}
@keyframes aiFl{50%{box-shadow:0 0 0 5px color-mix(in srgb,var(--c) 45%,transparent)}}
.ai-sc{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.ai-sc::before{content:"";position:absolute;inset:0;transform:translateY(-101%);background:linear-gradient(to bottom,transparent 72%,color-mix(in srgb,var(--accent) 24%,transparent));border-bottom:2px solid var(--accent);box-shadow:0 3px 14px var(--accent)}
.on .ai-sc::before{animation:aiScan ${S}s linear forwards}
@keyframes aiScan{0%{transform:translateY(-101%);opacity:1}94%{opacity:1}100%{transform:translateY(0);opacity:0}}
.ai-sv{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ai-sv rect{fill:var(--c);fill-opacity:.3;stroke:var(--c);stroke-width:1.5;vector-effect:non-scaling-stroke;opacity:0}
.on .ai-sv rect{animation:aiIn .5s var(--d) forwards}
.ai-pm{fill:none;stroke:var(--accent);stroke-width:3;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1}
.on .ai-pm{animation:aiDraw 1.8s ${S}s ease-in-out forwards}
@keyframes aiDraw{to{stroke-dashoffset:0}}
@keyframes aiIn{to{opacity:1}}
.ai-rl{position:absolute;transform:translate(-50%,-50%);padding:3px 6px;font:600 10px/1.2 var(--font-m);white-space:nowrap;background:rgba(10,10,11,.86);color:#fff;opacity:0}
.ai-rl.hl{border:1px solid var(--accent);color:var(--accent)}
.on .ai-rl{animation:aiIn .4s var(--d) forwards}
.ai-ht{position:absolute;width:var(--s);aspect-ratio:2.3;border-radius:50%;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(closest-side,var(--c),color-mix(in srgb,var(--c) 55%,transparent) 50%,transparent);opacity:0}
.on .ai-ht{animation:aiHeat 1.2s var(--d) cubic-bezier(.2,.8,.3,1) forwards}
@keyframes aiHeat{to{opacity:.72;transform:translate(-50%,-50%) scale(1)}}
.ai-hud{position:absolute;left:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 8px;font:600 10px/1.2 var(--font-m);letter-spacing:.04em;background:rgba(10,10,11,.8);color:#fff}
.ai-hud i{width:7px;height:7px;border-radius:50%;background:var(--rd);animation:aiBl 1.2s steps(2) infinite}.ai-hud b{font-weight:600;font-variant-numeric:tabular-nums}
@keyframes aiBl{50%{opacity:.2}}
.ai-tb{display:grid;padding:10px 18px 0;font:500 11px/1.35 var(--font-m);color:var(--ink);opacity:0;transform:translateY(4px);transition:opacity .5s,transform .5s}
.ai-tb .r{display:grid;grid-template-columns:.6fr 1.1fr .5fr 1.1fr 1.5fr .7fr;gap:8px;padding:5px 0;border-bottom:1px solid var(--line)}
.ai-tb.c4 .r{grid-template-columns:1.8fr .6fr .6fr .6fr}
.ai-tb .h{color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-size:10px}.ai-tb .m{display:block;color:var(--muted);border:0}
.ai-tb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ai-out{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding:14px 18px}
.ai-out span{padding:6px 9px;font:500 12px/1.3 var(--font-m);border:1px solid var(--line);color:var(--ink);opacity:0;transform:translateY(4px);transition:opacity .4s calc(var(--i) * .12s),transform .4s calc(var(--i) * .12s)}
.ai-out span.x{border-color:var(--rd);color:var(--rd)}
.done .ai-out span,.done .ai-tb{opacity:1;transform:none}
@media (max-width:860px){.ai-g{grid-template-columns:1fr;gap:28px}.ai-h{padding:12px 14px}.ai-h h3{font-size:16px}.ai-b[data-l]::after{font-size:7px;padding:1px 2px}.ai-t.w .ai-b[data-l]::after,.ai-sl .ai-b[data-l]::after{display:none}.ai-cr-n button{padding:11px 10px;font-size:11px}.ai-cr-n em{display:none}.ai-tb .r{grid-template-columns:.7fr 1.2fr .5fr 1.2fr}.ai-tb .r span:nth-child(n+5){display:none}.ai-tb.c4 .r{grid-template-columns:1.8fr .6fr .6fr .6fr}.ai-tb .m span{display:block}}
@media (prefers-reduced-motion:reduce){.ai *,.ai *::before{animation:none!important;transition:none!important}.ai-b,.ai-sv rect,.ai-rl,.ai-out span,.ai-tb{opacity:1;transform:none}.ai-ht{opacity:.72;transform:translate(-50%,-50%)}.ai-pm{stroke-dashoffset:0}.ai-sc{display:none}}`;

export const AI_JS = String.raw`(function(d,W){var T=d.querySelectorAll('[data-ai] .ai-t:not(.ai-sl)'),R=d.querySelectorAll('[data-ai] [data-cr]');if(!T.length&&!R.length)return;
var D=${S * 1000},rm=W.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmt(n){return n.toLocaleString('en-US')}
function set(t,p){t.querySelectorAll('.ai-n').forEach(function(n){n.textContent=fmt(Math.round(+n.dataset.n*p))})}
var H=D+3600,IO=!rm&&W.IntersectionObserver;
R.forEach(function(c){var s=c.querySelectorAll('.ai-sl'),b=c.querySelectorAll('.ai-cr-n button'),k=0,tm,vis=0;c.style.setProperty('--hold',H+'ms');
function go(i){if(IO)stop(s[k]);s[k].classList.remove('cur');b[k].setAttribute('aria-selected','false');k=(i+s.length)%s.length;s[k].classList.add('cur');b[k].setAttribute('aria-selected','true');clearTimeout(tm);
if(!IO){s[k].classList.add('on','done');set(s[k],1);return}if(vis){c.classList.remove('run');void c.offsetWidth;c.classList.add('run');play(s[k]);tm=setTimeout(function(){go(k+1)},H)}}
b.forEach(function(x,i){x.addEventListener('click',function(){go(i)})});s[0].classList.add('cur');
if(!IO){go(0);return}
new IntersectionObserver(function(es){es.forEach(function(e){if(e.intersectionRatio>=.35){if(!vis){vis=1;go(k)}}else if(!e.isIntersecting&&vis){vis=0;clearTimeout(tm);c.classList.remove('run');stop(s[k])}})},{threshold:[0,.35]}).observe(c)});
if(!IO){T.forEach(function(t){t.classList.add('on','done');set(t,1)});return}
function play(t){var s=performance.now();t.classList.add('on');(function f(now){var p=Math.min(1,(now-s)/D);set(t,p);if(!t.classList.contains('on'))return;if(p<1)t._r=requestAnimationFrame(f);else t.classList.add('done')})(s)}
function stop(t){cancelAnimationFrame(t._r);t.classList.remove('on','done');set(t,0)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target;if(e.intersectionRatio>=.35){if(!t.classList.contains('on'))play(t)}else if(!e.isIntersecting&&t.classList.contains('on'))stop(t)})},{threshold:[0,.35]});
T.forEach(function(t){io.observe(t)});
var C=d.querySelectorAll('.ai-clk');if(C.length)setInterval(function(){var n=new Date(),z=function(v){return(v<10?'0':'')+v};C.forEach(function(c){if(c.closest('.on'))c.textContent=z(n.getHours())+':'+z(n.getMinutes())+':'+z(n.getSeconds())})},1000);
})(document,window);`;
