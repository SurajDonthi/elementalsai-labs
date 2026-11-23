/* "See what we can build" as an animated feature showcase (Suraj, 23 Nov 2026): one chip per feature, a tap plays a short motion scene.
   Light on purpose: no images, no libraries; plain HTML, CSS keyframes and about 1 KB of script. Only the version that has a showcase gets its markup.
   The words on the chips are Suraj's own feature names; the small words inside a scene are interface labels of the mock-up, not page copy. */

import { hasConsole, consoleSection, CONSOLE_CSS, CONSOLE_JS } from './cx.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* each scene: [chip, aria label, markup]; "--d" is the delay of a step, "sx-pop" fades a part in, "sx-swap" shows its spans one after another */
const SCENES = {
  'ecommerce-apps': [
    ['Conversion (CRO)', 'A cart is recovered and the conversion rate rises', `
<div class="sx-card"><i class="sx-img"></i><b>Running shoes</b><span class="sx-pr">₹2,499</span><u class="sx-btn">Add to cart</u></div>
<p class="sx-toast sx-pop" style="--d:1.1s">Finish your order in one tap</p>
<div class="sx-meter"><span>Conversion</span><i><em></em></i><b class="sx-swap"><s style="--d:0s;--e:1.2s">2.1%</s><s style="--d:1.2s;--e:2.4s">3.4%</s><s style="--d:2.4s">4.6%</s></b></div>`],
    ['Personalization', 'The store re-sorts its products for each shopper', `
<p class="sx-cap">Homepage for Asha</p>
<div class="sx-row3"><div class="sx-t sx-fwd"><i class="sx-img"></i><span class="sx-tag">For you</span></div><div class="sx-t sx-back"><i class="sx-img"></i></div><div class="sx-t sx-back"><i class="sx-img"></i></div></div>
<p class="sx-cap sx-pop" style="--d:1.4s">Sorted by what she browses</p>`],
    ['Quick delivery and shipping', 'An order moves from packed to delivered with live tracking', `
<div class="sx-track"><i class="sx-line"><em></em></i><span class="sx-truck"></span>
<ol><li style="--d:.2s">Packed</li><li style="--d:1s">Picked up</li><li style="--d:1.9s">In transit</li><li style="--d:2.8s">Delivered</li></ol></div>
<p class="sx-cap">Live tracking, courier connected</p>`],
    ['Trust: photos before dispatch', 'The buyer sees item photos before the order is dispatched', `
<div class="sx-row3"><div class="sx-t sx-pop" style="--d:.2s"><i class="sx-img"></i><u class="sx-ok"></u></div><div class="sx-t sx-pop" style="--d:.8s"><i class="sx-img"></i><u class="sx-ok"></u></div><div class="sx-t sx-pop" style="--d:1.4s"><i class="sx-img"></i><u class="sx-ok"></u></div></div>
<p class="sx-btn2 sx-pop" style="--d:2.1s">Looks good, dispatch it</p>`],
    ['Urgency', 'A low-stock badge and a countdown push the buyer to decide', `
<div class="sx-card"><i class="sx-img"></i><b>Limited drop</b><span class="sx-badge sx-pulse">Only 3 left</span></div>
<div class="sx-meter"><span>Stock</span><i class="sx-down"><em></em></i></div>
<div class="sx-meter"><span>Ends in</span><i class="sx-down sx-slow"><em></em></i></div>`],
    ['Auctions', 'Bids stack up and the leading bidder changes live', `
<p class="sx-bigp sx-swap"><s style="--d:0s;--e:.9s">₹4,200</s><s style="--d:.9s;--e:1.8s">₹4,600</s><s style="--d:1.8s">₹5,100</s></p>
<ul class="sx-bids"><li class="sx-pop" style="--d:0s"><span>Bidder A</span><b>₹4,200</b></li><li class="sx-pop" style="--d:.9s"><span>Bidder B</span><b>₹4,600</b></li><li class="sx-pop sx-lead" style="--d:1.8s"><span>Bidder C</span><b>₹5,100</b><em>Leading</em></li></ul>`],
    ['Loyalty and returns', 'Points add up and a return is approved', `
<div class="sx-meter"><span>Points</span><i><em></em></i><b class="sx-swap"><s style="--d:0s;--e:.8s">0</s><s style="--d:.8s;--e:1.6s">40</s><s style="--d:1.6s;--e:2.4s">80</s><s style="--d:2.4s">120</s></b></div>
<ul class="sx-bids"><li class="sx-pop" style="--d:.4s"><span>Order placed</span><b class="sx-g">+120</b></li><li class="sx-pop" style="--d:1.6s"><span>Return requested</span><b>1 item</b></li><li class="sx-pop sx-lead" style="--d:2.6s"><span>Return approved</span><b class="sx-g">Refund sent</b></li></ul>`],
  ],
  'healthcare-apps': [
    ['Patient CRM', 'A patient record gets a follow-up reminder', `
<div class="sx-card"><i class="sx-img"></i><b>Patient: Ravi K.</b><span class="sx-pr">Visit 3</span></div>
<ul class="sx-bids"><li class="sx-pop" style="--d:.3s"><span>Last visit</span><b>12 Nov</b></li><li class="sx-pop" style="--d:1s"><span>Follow-up due</span><b>26 Nov</b></li><li class="sx-pop sx-lead" style="--d:1.7s"><span>Reminder sent</span><b class="sx-g">SMS</b></li></ul>`],
    ['Appointments', 'A slot is booked and the calendar fills', `
<div class="sx-row3"><div class="sx-t"><span class="sx-cap">9:00</span></div><div class="sx-t sx-pop" style="--d:.5s"><span class="sx-cap">10:00</span><u class="sx-ok"></u></div><div class="sx-t sx-pop" style="--d:1.2s"><span class="sx-cap">11:00</span><u class="sx-ok"></u></div></div>
<p class="sx-toast sx-pop" style="--d:1.9s">Booked. Reminder set</p>`],
    ['Billing and claims', 'A bill is created and a claim moves to paid', `
<div class="sx-track"><i class="sx-line"><em></em></i><span class="sx-truck"></span><ol><li style="--d:.2s">Bill</li><li style="--d:1s">Claim sent</li><li style="--d:1.9s">Approved</li><li style="--d:2.8s">Paid</li></ol></div>
<p class="sx-cap">Insurance claims tracked end to end</p>`],
    ['Pharmacy and inventory', 'Stock falls and a reorder is raised', `
<div class="sx-meter"><span>Stock</span><i class="sx-down"><em></em></i></div>
<p class="sx-badge sx-pulse" style="align-self:flex-start">Low stock</p>
<p class="sx-toast sx-pop" style="--d:1.6s">Reorder sent to supplier</p>`],
    ['Records (EHR)', 'Reports and prescriptions appear in one patient record', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>Lab report</span><b>Added</b></li><li class="sx-pop" style="--d:.9s"><span>Prescription</span><b>Added</b></li><li class="sx-pop sx-lead" style="--d:1.6s"><span>Doctor notes</span><b class="sx-g">Synced</b></li></ul>`],
    ['Reports and dashboards', 'A dashboard shows visits and revenue growing', `
<div class="sx-meter"><span>Visits</span><i><em></em></i><b class="sx-swap"><s style="--d:0s;--e:1.2s">120</s><s style="--d:1.2s;--e:2.4s">210</s><s style="--d:2.4s">340</s></b></div>
<div class="sx-meter"><span>Revenue</span><i><em></em></i></div>`],
  ],
  'fintech-apps': [
    ['Digital lending', 'A loan moves from application to disbursed', `
<div class="sx-track"><i class="sx-line"><em></em></i><span class="sx-truck"></span><ol><li style="--d:.2s">Apply</li><li style="--d:1s">KYC</li><li style="--d:1.9s">Approved</li><li style="--d:2.8s">Disbursed</li></ol></div>
<p class="sx-cap">Decision in minutes</p>`],
    ['P2P lending', 'A borrower request is funded by several lenders', `
<p class="sx-bigp">Loan ask: ₹50,000</p>
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>Lender A</span><b>₹20,000</b></li><li class="sx-pop" style="--d:.9s"><span>Lender B</span><b>₹15,000</b></li><li class="sx-pop sx-lead" style="--d:1.6s"><span>Lender C</span><b>₹15,000</b><em>Funded</em></li></ul>`],
    ['Crowdfunding', 'Backers fund a campaign until the goal is met', `
<div class="sx-card"><i class="sx-img"></i><b>New product campaign</b></div>
<div class="sx-meter"><span>Raised</span><i><em></em></i><b class="sx-swap"><s style="--d:0s;--e:1.2s">32%</s><s style="--d:1.2s;--e:2.4s">71%</s><s style="--d:2.4s">100%</s></b></div>
<p class="sx-toast sx-pop" style="--d:2.5s">Goal reached</p>`],
    ['Payments and wallet', 'A payment is sent and the wallet balance updates', `
<p class="sx-bigp sx-swap"><s style="--d:0s;--e:1.2s">₹8,000</s><s style="--d:1.2s">₹6,500</s></p>
<ul class="sx-bids"><li class="sx-pop" style="--d:.6s"><span>Sent to Meera</span><b>₹1,500</b></li><li class="sx-pop sx-lead" style="--d:1.4s"><span>Payment</span><b class="sx-g">Done</b></li></ul>`],
    ['Collections', 'A due date passes and a reminder recovers the payment', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>EMI due</span><b>5 Dec</b></li><li class="sx-pop" style="--d:1s"><span>Reminder sent</span><b>WhatsApp</b></li><li class="sx-pop sx-lead" style="--d:1.8s"><span>Payment received</span><b class="sx-g">Paid</b></li></ul>`],
    ['Compliance reports', 'KYC checks pass and a report is generated', `
<div class="sx-row3"><div class="sx-t sx-pop" style="--d:.2s"><span class="sx-cap">ID</span><u class="sx-ok"></u></div><div class="sx-t sx-pop" style="--d:.8s"><span class="sx-cap">Address</span><u class="sx-ok"></u></div><div class="sx-t sx-pop" style="--d:1.4s"><span class="sx-cap">PAN</span><u class="sx-ok"></u></div></div>
<p class="sx-btn2 sx-pop" style="--d:2.1s">Report ready</p>`],
    ['Investing', 'A portfolio value grows', `
<p class="sx-bigp sx-swap"><s style="--d:0s;--e:1s">₹1,00,000</s><s style="--d:1s;--e:2s">₹1,08,000</s><s style="--d:2s">₹1,17,500</s></p>
<div class="sx-meter"><span>Growth</span><i><em></em></i></div>`],
  ],
  'build-with-ai': [
    ['Retail video analytics', 'A camera counts shoppers in a store', `
<div class="sx-frame"><i class="sx-scanl"></i><span class="sx-box sx-pop" style="--d:.3s;left:12%;top:30%;width:18%;height:50%"><em>Person 1</em></span><span class="sx-box sx-pop" style="--d:.9s;left:42%;top:22%;width:18%;height:58%"><em>Person 2</em></span><span class="sx-box sx-pop" style="--d:1.5s;left:72%;top:34%;width:18%;height:46%"><em>Person 3</em></span></div>
<p class="sx-cap">Footfall: 3</p>`],
    ['Facial recognition', 'A face is matched against a list', `
<div class="sx-frame"><i class="sx-scanl"></i><span class="sx-box sx-pop" style="--d:.5s;left:38%;top:18%;width:24%;height:64%"><em>Match 96%</em></span></div>
<p class="sx-toast sx-pop" style="--d:1.4s">Access allowed</p>`],
    ['Defect inspection', 'A part on a line is checked and a defect is flagged', `
<div class="sx-frame"><i class="sx-scanl"></i><span class="sx-box sx-bad sx-pop" style="--d:.8s;left:55%;top:40%;width:16%;height:30%"><em>Defect</em></span></div>
<p class="sx-badge sx-pop" style="--d:1.5s;align-self:flex-start">Rejected</p>`],
    ['ADAS', 'A vehicle camera detects a car and a pedestrian', `
<div class="sx-frame"><i class="sx-scanl"></i><span class="sx-box sx-pop" style="--d:.4s;left:10%;top:45%;width:30%;height:35%"><em>Car</em></span><span class="sx-box sx-bad sx-pop" style="--d:1s;left:62%;top:25%;width:14%;height:55%"><em>Pedestrian</em></span></div>
<p class="sx-badge sx-pulse sx-pop" style="--d:1.6s;align-self:flex-start">Brake warning</p>`],
    ['Document intelligence', 'Fields are read from a scanned document', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>Name</span><b>Asha Rao</b></li><li class="sx-pop" style="--d:.8s"><span>Invoice no.</span><b>INV-2041</b></li><li class="sx-pop sx-lead" style="--d:1.4s"><span>Total</span><b class="sx-g">₹18,400</b></li></ul>`],
    ['Medical imaging', 'A scan is checked and a region is marked', `
<div class="sx-frame"><i class="sx-scanl"></i><span class="sx-box sx-bad sx-pop" style="--d:.9s;left:48%;top:32%;width:20%;height:34%"><em>Review</em></span></div>
<p class="sx-cap sx-pop" style="--d:1.6s">Flagged for the doctor</p>`],
  ],
  'automate-work': [
    ['GST filing', 'An agent reconciles invoices, asks for approval, then files returns', `
<div class="sx-track"><i class="sx-line"><em></em></i><span class="sx-truck"></span><ol><li style="--d:.2s">Pull data</li><li style="--d:1s">Reconcile</li><li style="--d:1.9s">You approve</li><li style="--d:2.8s">Filed</li></ol></div>
<p class="sx-cap sx-pop" style="--d:1.9s">236 checked, 233 matched, 3 held back</p>`],
    ['Expense audit', 'An agent checks claims and flags the risky ones for a person', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>Claims read</span><b>64</b></li><li class="sx-pop" style="--d:.9s"><span>Clean</span><b class="sx-g">61</b></li><li class="sx-pop sx-lead" style="--d:1.6s"><span>Need a person</span><b>3</b><em>Flagged</em></li></ul>`],
    ['Lead follow-up', 'An agent replies to new leads and books a call', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>New lead</span><b>Form</b></li><li class="sx-pop" style="--d:.9s"><span>Reply sent</span><b>2 min</b></li><li class="sx-pop sx-lead" style="--d:1.6s"><span>Call booked</span><b class="sx-g">Thu 4 pm</b></li></ul>`],
    ['Payment chasing', 'An agent reminds customers and records payments', `
<div class="sx-meter"><span>Overdue</span><i class="sx-down"><em></em></i><b class="sx-swap"><s style="--d:0s;--e:1.2s">₹4.2L</s><s style="--d:1.2s;--e:2.4s">₹2.6L</s><s style="--d:2.4s">₹1.1L</s></b></div>
<p class="sx-toast sx-pop" style="--d:.5s">Reminders sent on WhatsApp</p>`],
    ['Support triage', 'An agent sorts tickets and answers the easy ones', `
<ul class="sx-bids"><li class="sx-pop" style="--d:.2s"><span>Tickets in</span><b>40</b></li><li class="sx-pop" style="--d:.9s"><span>Answered by agent</span><b class="sx-g">28</b></li><li class="sx-pop sx-lead" style="--d:1.6s"><span>Sent to a person</span><b>12</b></li></ul>`],
    ['Weekly reports', 'An agent builds a report and sends it on schedule', `
<div class="sx-meter"><span>Data</span><i><em></em></i></div>
<p class="sx-toast sx-pop" style="--d:1.6s">Report sent: Monday, 9:00 am</p>`],
  ],
};

export const hasShowcase = (slug) => hasConsole(slug) || Object.hasOwn(SCENES, slug);

/* the section; same id and h2 as the app library it replaces, so the page's checks still hold */
export const showcase = (slug, heading) => {
  if (hasConsole(slug)) return consoleSection(slug, heading);
  const sc = SCENES[slug];
  return `<section class="sec" id="types" aria-labelledby="ty-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="ty-t">${esc(heading)}</h2></div>
 <div class="sx" data-sx><div class="sx-chips" role="group" aria-label="${esc(heading)}">${sc.map(([c], i) => `<button type="button" class="sx-chip" aria-pressed="${i === 0}">${esc(c)}</button>`).join('')}</div>
 <div class="sx-st">${sc.map(([, l, m], i) => `<div class="sx-sc${i === 0 ? ' on' : ''}" role="img" aria-label="${esc(l)}">${m}</div>`).join('')}</div></div>
</div></section>`;
};

export const SHOWCASE_CSS = CONSOLE_CSS + String.raw`
.sx{display:grid;gap:16px;margin-top:24px}
.sx-chips{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x proximity;padding-bottom:4px;scrollbar-width:thin}
.sx-chip{flex:none;scroll-snap-align:start;font:600 14px var(--font-s);color:var(--ink-2);background:var(--field);border:1px solid var(--line);border-radius:999px;padding:10px 16px;cursor:pointer;transition:background var(--t1),color var(--t1),border-color var(--t1)}
.sx-chip:hover{border-color:var(--accent)}
.sx-chip[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.sx-st{position:relative;min-height:300px;background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.sx-sc{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;gap:14px;padding:clamp(16px,3vw,32px);max-width:520px;margin:0 auto}
.sx-sc.on{display:flex}
.sx-img{display:block;width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));opacity:.85}
.sx-card{display:flex;align-items:center;gap:12px;background:var(--field);border:1px solid var(--line);border-radius:12px;padding:12px}
.sx-card b{flex:1;font:600 15px var(--font-s);color:var(--ink)}
.sx-pr{font:600 14px var(--font-m);color:var(--ink-2)}
.sx-btn,.sx-btn2{text-decoration:none;font:700 13px var(--font-s);background:var(--accent);color:var(--accent-ink);border-radius:8px;padding:8px 12px}
.sx-btn2{align-self:flex-start;margin:0}
.sx-toast{margin:0;background:var(--field-hi);border:1px solid var(--accent);color:var(--ink);border-radius:10px;padding:10px 12px;font:500 13px var(--font-s)}
.sx-cap{margin:0;font:500 13px var(--font-s);color:var(--muted)}
.sx-meter{display:flex;align-items:center;gap:10px;font:500 13px var(--font-s);color:var(--ink-2)}
.sx-meter>span{width:84px;flex:none}
.sx-meter>i{flex:1;height:8px;border-radius:99px;background:var(--field-hi);overflow:hidden}
.sx-meter em{display:block;height:100%;width:100%;border-radius:99px;background:var(--go)}
.sx-meter b,.sx-bigp{position:relative;display:inline-block;min-width:52px;font:700 14px var(--font-m);color:var(--ink);text-align:right}
.sx-bigp{display:block;min-height:40px;font-size:32px;text-align:left}
.sx-swap{position:relative}
.sx-swap s{position:absolute;right:0;top:0;text-decoration:none;opacity:0}
.sx-bigp.sx-swap s{left:0;right:auto}
.sx-swap s:last-child{opacity:1;position:relative}
.sx-row3{--g:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:var(--g)}
.sx-t{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;background:var(--field);border:1px solid var(--line);border-radius:12px}
.sx-t .sx-img{width:60%;height:60%}
.sx-tag{position:absolute;top:6px;left:6px;font:700 11px var(--font-s);background:var(--accent);color:var(--accent-ink);border-radius:6px;padding:3px 6px}
.sx-ok{position:absolute;right:6px;bottom:6px;width:20px;height:20px;border-radius:50%;background:var(--go);text-decoration:none}
.sx-ok:after{content:"";position:absolute;left:6px;top:3px;width:5px;height:9px;border:solid #05140B;border-width:0 2px 2px 0;transform:rotate(45deg)}
.sx-track{position:relative;padding-top:34px}
.sx-line{display:block;height:6px;border-radius:99px;background:var(--field-hi);overflow:hidden}
.sx-line em{display:block;height:100%;width:100%;background:var(--accent)}
.sx-truck{position:absolute;top:2px;left:calc(100% - 38px);width:38px;height:22px;border-radius:5px 8px 5px 5px;background:var(--accent);box-shadow:inset -10px 0 0 var(--accent-2)}
.sx-track ol{display:flex;justify-content:space-between;margin:12px 0 0;padding:0;list-style:none;font:500 12px var(--font-s);color:var(--ink-2)}
.sx-track li:before{content:"";display:block;width:10px;height:10px;margin:0 auto 6px;border-radius:50%;background:var(--go)}
.sx-badge{background:var(--go-red,#F85149);color:#fff;font:700 12px var(--font-s);border-radius:6px;padding:4px 8px}
.sx-down em{width:30%}
.sx-slow em{width:55%}
.sx-bids{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.sx-bids li{display:flex;align-items:center;gap:10px;background:var(--field);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:500 14px var(--font-s);color:var(--ink-2)}
.sx-bids li span{flex:1}
.sx-bids b{font:700 14px var(--font-m);color:var(--ink)}
.sx-bids .sx-g{color:var(--go)}
.sx-bids em{font:700 11px var(--font-s);font-style:normal;background:var(--go);color:#05140B;border-radius:6px;padding:3px 6px}
.sx-lead{border-color:var(--accent)!important}
.sx-frame{position:relative;height:150px;background:var(--field);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.sx-scanl{position:absolute;left:0;right:0;top:0;height:2px;background:var(--accent);opacity:.8}
.sx-box{position:absolute;border:2px solid var(--go);border-radius:6px}
.sx-box em{position:absolute;left:-2px;top:-20px;font:700 11px var(--font-s);font-style:normal;background:var(--go);color:#05140B;border-radius:4px;padding:2px 6px;white-space:nowrap}
.sx-bad{border-color:#F85149}
.sx-bad em{background:#F85149;color:#fff}
@media (min-width:760px){.sx{grid-template-columns:230px 1fr;align-items:start}.sx-chips{flex-direction:column;overflow:visible}.sx-chip{text-align:left;border-radius:12px}.sx-st{min-height:340px}}
@media (prefers-reduced-motion:no-preference){
.sx-sc.on .sx-pop{animation:sx-pop .5s var(--out) var(--d,0s) both}
.sx-sc.on .sx-swap s{animation:sx-in .01s linear var(--d) both}
.sx-sc.on .sx-swap s:not(:last-child){animation:sx-in .01s linear var(--d) both,sx-out .01s linear var(--e) forwards}
.sx-sc.on .sx-btn{animation:sx-pulse 1s ease-in-out .3s 2}
.sx-sc.on .sx-meter>i:not(.sx-down) em{animation:sx-grow 3s var(--out) both}
.sx-sc.on .sx-down em{animation:sx-shrink 3s linear both}
.sx-sc.on .sx-pulse{animation:sx-pulse 1s ease-in-out infinite}
.sx-sc.on .sx-scanl{animation:sx-scan 2.4s linear infinite}
.sx-sc.on .sx-fwd{animation:sx-fwd 1.2s var(--out) .5s both}
.sx-sc.on .sx-back{animation:sx-back 1.2s var(--out) .5s both}
.sx-sc.on .sx-line em{animation:sx-grow 3.2s ease-in-out .2s both}
.sx-sc.on .sx-truck{animation:sx-drive 3.2s ease-in-out .2s both}
.sx-sc.on .sx-track li{animation:sx-pop .4s var(--out) var(--d) both}
@keyframes sx-scan{from{top:0}to{top:calc(100% - 2px)}}
@keyframes sx-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes sx-in{from{opacity:0}to{opacity:1}}
@keyframes sx-out{from{opacity:1}to{opacity:0}}
@keyframes sx-grow{from{transform:scaleX(.2)}to{transform:scaleX(1)}}
@keyframes sx-shrink{from{transform:scaleX(2.4)}to{transform:scaleX(1)}}
@keyframes sx-pulse{50%{transform:scale(1.08)}}
@keyframes sx-fwd{from{transform:translateX(calc(200% + 2*var(--g)))}to{transform:none}}
@keyframes sx-back{from{transform:translateX(calc(-100% - var(--g)))}to{transform:none}}
@keyframes sx-drive{from{left:0}to{left:calc(100% - 38px)}}
.sx-meter em,.sx-line em{transform-origin:left}}`;

export const SHOWCASE_JS = CONSOLE_JS + String.raw`
(function(d,W){var rm=W.matchMedia('(prefers-reduced-motion: reduce)').matches;[].forEach.call(d.querySelectorAll('[data-sx]'),function(r){var b=[].slice.call(r.querySelectorAll('.sx-chip')),s=[].slice.call(r.querySelectorAll('.sx-sc')),i=0,t=0,seen=false;
function show(n){i=n;b.forEach(function(x,k){x.setAttribute('aria-pressed',String(k===n))});s.forEach(function(x,k){x.classList.toggle('on',k===n)})}
function stop(){clearInterval(t);t=0}
function run(){if(rm||t||!seen)return;t=setInterval(function(){show((i+1)%s.length)},5000)}
b.forEach(function(x,k){x.addEventListener('click',function(){stop();show(k)})});
if(W.IntersectionObserver)new IntersectionObserver(function(e){seen=e[0].isIntersecting;if(seen)run();else stop()},{threshold:.3}).observe(r)})})(document,window);`;
