/* Ecommerce console ("See what we can build", ?s=ecommerce-apps). Modules: Suraj's 12 (23 Nov 2026), plus POS, Accounting, Discounts and
   the Recommendation engine (his asks, 23 Nov), plus Purchasing, Catalogue and Support (Bolt drafts). All words and numbers are Bolt's draft mock data. */
import { N, chip, sw, spin, tog, bar, table, kpis, card, two, rowkv, rules, bars, late, ic } from './cx-kit.mjs';

export default {
  top: { mark: 'store', name: 'Store console', url: 'admin.yourstore.in', scope: 'All stores · 4', search: 'Search orders, SKUs, customers', sync: 'All channels synced', bell: 3, av: 'N' },
  mods: [
  { n: 'Orders', i: 'orders', sub: 'All channels · today', btn: 'Create order', v: () =>
    kpis([['Orders today', N(1180, 1284, 'n', 0.2)], ['Pending dispatch', N(97, 86, 'n', 0.2)], ['Shipped', N(964, 1021, 'n', 0.2)], ['RTO rate', N(2.3, 1.8, 'p', 0.2)]]) +
    table([['Order', '.8fr'], ['Customer', '1fr'], ['Channel', '.9fr', 1], ['Items', '.5fr', 1], ['Total', '.8fr'], ['Status', '1fr']], [
      ['#48217', 'Priya S.', 'Website', '2', '₹3,148', chip('w', 'New')],
      ['#48216', 'Rahul M.', 'Amazon', '1', '₹1,299', sw('w', 'Packing', 'ok', 'Packed', 2.4)],
      ['#48215', 'Ananya R.', 'Instagram', '3', '₹4,870', chip('ok', 'Shipped')],
      ['#48214', 'Vikram J.', 'Flipkart', '1', '₹899', sw('m', 'Packed', 'ok', 'Shipped', 3.4)],
      ['#48213', 'Meera K.', 'App', '2', '₹2,450', chip('ok', 'Delivered')],
      ['#48212', 'Arjun P.', 'WhatsApp', '1', '₹1,099', chip('m', 'Cancelled')],
    ], { nw: [1.5], at: 0.35 }) },
  { n: 'POS', i: 'pos', sub: 'Store counters · works offline', btn: 'Open register', v: () =>
    kpis([['Store sales today', N(3.6, 4.1, 'l', 0.2)], ['Bills', N(388, 412, 'n', 0.2)], ['Avg bill', N(980, 1004, 'inr', 0.2)], ['Counters online', '<b>3 of 3</b>']]) + `<div class="cx-2">` +
    card('Counter 2 · Kolkata store', `${rowkv('Trail runner UK 9', '<b>₹2,499</b>')}${rowkv('Sports cap', '<b>₹599</b>')}${rowkv('Loyalty points used', '<b>−₹150</b>')}${rowkv('Total', '<b>₹2,948</b>')}${rowkv('Payment', sw('w', spin + 'Waiting for UPI', 'ok', 'UPI paid · bill on WhatsApp', 2.2))}`, 0.4) +
    card('Not in this store', `${rowkv('Trail runner UK 10 · Kolkata', '<b>0 left</b>')}${rowkv('Nearest stock', '<b>Bengaluru WH</b>')}${rowkv('Action', sw('m', 'Checking', 'ok', 'Ship to customer home', 2.8))}`, 0.5) + '</div>' +
    table([['Store', '1.3fr'], ['Counter', '.8fr', 1], ['Cashier', '.9fr', 1], ['Sales today', '1fr']], [
      ['Kolkata store', 'Counter 1', 'Ravi', N(118000, 131400, 'inr', 0.6)],
      ['Kolkata store', 'Counter 2', 'Sana', N(102000, 112600, 'inr', 0.6)],
      ['Kolkata store', 'Counter 3', 'Joy', '₹96,800'],
    ], { at: 0.7 }) },
  { n: 'Inventory', i: 'box', sub: '4 locations · 2,340 SKUs', btn: 'New transfer', v: () =>
    table([['Location', '1.3fr'], ['Type', '.8fr', 1], ['SKUs', '.7fr'], ['Units', '.8fr'], ['Low stock', '.7fr']], [
      ['Bhiwandi, MH', 'Warehouse', '2,104', N(48450, 48210, 'n', 1.2), chip('w', '12')],
      ['Bengaluru, KA', 'Warehouse', '1,876', N(31300, 31540, 'n', 4.2), sw('w', '8', 'ok', '0', 4.4)],
      ['Gurugram, HR', 'Warehouse', '1,652', '22,980', chip('w', '21')],
      ['Kolkata store', 'Store', '640', '3,210', chip('m', '4')],
    ]) + `<div class="cx-2">` +
    card('Transfer TR-221', `${rowkv('Bhiwandi → Bengaluru', '<b>240 units</b>')}${bar(1, 0.8)}${rowkv('Status', sw('w', 'In transit', 'ok', 'Received', 4.2))}`, 0.5) +
    card('Smart routing', `${rowkv('Order #48217 · 560034', '')}${rowkv('Nearest stock', '<b>Bengaluru WH · 6 km</b>')}${rowkv('Decision', sw('m', 'Checking', 'ok', 'Auto-routed', 1.8))}`, 0.6) + '</div>' },
  { n: 'Purchasing', i: 'clip', sub: 'Suppliers · purchase orders · reorder', btn: 'New PO', v: () =>
    table([['PO', '.8fr'], ['Supplier', '1.3fr'], ['Items', '.6fr', 1], ['Value', '.9fr'], ['Status', '1.1fr']], [
      ['PO-3307', 'Sole Craft, Agra', '12', '₹4,82,000', sw('w', 'Sent', 'ok', 'Confirmed', 2)],
      ['PO-3306', 'Tiruppur Knits', '8', '₹2,10,500', chip('w', 'Partly received')],
      ['PO-3305', 'Gear Hub, Delhi', '5', '₹96,400', chip('ok', 'Received')],
      ['PO-3304', 'Sole Craft, Agra', '10', '₹3,95,000', chip('ok', 'Paid')],
    ]) +
    card('Auto reorder', `${rowkv('Cotton tee M · 14 left', '<b>Reorder at 40</b>')}${rowkv('Suggested', '<b>300 units · Tiruppur Knits</b>')}${rowkv('Purchase order', sw('m', 'Preparing', 'ok', 'PO-3308 created', 2.6))}`, 0.6) },
  { n: 'Catalogue', i: 'tag', sub: '2,340 products · 6,812 variants', btn: 'Add product', v: () =>
    table([['Product', '1.3fr'], ['Variants', '1fr', 1], ['Price', '.7fr'], ['Channels', '.7fr', 1], ['Status', '.9fr']], [
      ['Trail runner', '8 sizes', '₹2,499', '7', chip('ok', 'Live')],
      ['Cotton tee', '5 sizes · 6 colours', '₹699', '6', chip('ok', 'Live')],
      ['Smart watch', '2 colours', '₹4,999', '5', sw('w', 'Draft', 'ok', 'Live', 2.4)],
      ['Sports cap', '1', '₹599', '7', chip('ok', 'Live')],
    ]) +
    card('Bulk edit · 120 products', `${bar(1, 0.8)}${rowkv('Updated', N(0, 120, 'n', 0.8, 1800))}${rowkv('HSN codes and GST rates', sw('w', spin + 'Checking', 'ok', 'Checked', 2.6))}`, 0.6) },
  { n: 'Channels', i: 'plug', sub: '7 channels · one catalogue', btn: 'Add channel', v: () =>
    table([['Channel', '1.3fr'], ['Listings', '.8fr'], ['Orders today', '.9fr', 1], ['Sync', '1.1fr']], [
      ['Website', '2,340', '412', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.0)],
      ['Mobile app', '2,340', '286', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.3)],
      ['Amazon', '1,980', '241', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.6)],
      ['Flipkart', '1,912', '198', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.9)],
      ['Meesho', '1,204', '87', sw('w', spin + 'Syncing', 'ok', 'Synced', 2.2)],
      ['Instagram Shop', '640', '41', sw('w', spin + 'Syncing', 'ok', 'Synced', 2.5)],
      ['WhatsApp catalogue', '320', '19', sw('w', spin + 'Syncing', 'ok', 'Synced', 2.8)],
    ]) + card('Price update · SKU TR-08 · ₹2,499', `${bar(1, 0.6)}${rowkv('Pushed to', N(0, 7, 'n', 0.6, 2200) + '<b>&nbsp;of 7 channels</b>')}`, 0.6) },
  { n: 'Shipping', i: 'truck', sub: 'Rate shopping · photo check · tracking', btn: 'Print labels', v: () =>
    `<p class="cx-cap r" style="--d:.1s">Order #48217 · 1.2 kg · to 560034</p>` +
    table([['Courier', '1.2fr'], ['Price', '.7fr'], ['Delivery', '.8fr'], ['', '.9fr']], [
      ['Delhivery', '₹62', '2 days', ''],
      ['Blue Dart', '₹88', 'Next day', ''],
      ['Xpressbees', '₹58', '2 days', `<span class="cx-lt" style="--d:1.6s">${chip('ok', 'Selected')}</span>`],
      ['Ekart', '₹55', '4 days', ''],
    ], { hl: 2 }) + `<div class="cx-2">` +
    card(`${ic('cam', 'sm')} Photos before dispatch`, `<div class="cx-ph"><i style="--d:1.9s"></i><i style="--d:2.2s"></i><i style="--d:2.5s"></i></div>${rowkv('QC', sw('w', 'Checking', 'ok', 'Passed · sent to buyer', 3))}`, 0.5) +
    card('Tracking · #48209', `<ol class="cx-trk"><li class="d">Packed</li><li class="d">Picked up</li><li class="a">In transit</li><li>Delivered</li></ol>${bar(0.66, 0.9)}`, 0.6) + '</div>' },
  { n: 'Payments', i: 'card', sub: 'Collections · settlements · reconciliation', btn: 'Export', v: () =>
    kpis([['Collected today', N(29.6, 31.8, 'l', 0.2)], ['Settled', N(25.9, 27.4, 'l', 0.2)], ['COD due', '<b>₹4.2L</b>', 'Friday'], ['Mismatches', N(3, 0, 'n', 1.8, 1600)]]) +
    `<div class="cx-split r" style="--d:.4s"><i style="--w:62"></i><i style="--w:21"></i><i style="--w:14"></i><i style="--w:3"></i></div><p class="cx-lg r" style="--d:.5s"><span>UPI 62%</span><span>Cards 21%</span><span>COD 14%</span><span>Wallets 3%</span></p>` +
    table([['Settlement', '1.3fr'], ['Amount', '1fr'], ['Orders', '.6fr', 1], ['Status', '1.1fr']], [
      ['Razorpay', '₹12,40,500', '486', sw('w', spin + 'Matching', 'ok', 'Matched', 1.6)],
      ['PhonePe PG', '₹8,92,300', '352', sw('w', spin + 'Matching', 'ok', 'Matched', 2.2)],
      ['Amazon payout', '₹6,07,400', '241', chip('ok', 'Matched')],
      ['COD · Delhivery', '₹4,21,800', '198', chip('w', 'Due Friday')],
    ], { at: 0.6 }) },
  { n: 'Accounting', i: 'book', sub: 'Books · GST · invoices · bank', btn: 'New invoice', v: () =>
    kpis([['Revenue · Nov', N(78.4, 84.2, 'l', 0.2)], ['GST payable', '<b>₹3.9L</b>', 'due 20 Dec'], ['Receivables', N(9.8, 8.6, 'l', 0.2)], ['Payables', '<b>₹6.1L</b>']]) +
    table([['Entry', '.9fr'], ['Account', '1.4fr'], ['Debit', '.9fr'], ['Credit', '.9fr']], [
      ['INV-9921', 'Sales · Website', '—', '₹2,668'],
      ['INV-9921', 'Output GST 18%', '—', '₹480'],
      ['SET-771', 'Bank · Razorpay settlement', '₹12,40,500', '—'],
      ['PO-3305', 'Purchases · Gear Hub', '₹96,400', '—'],
    ], { nw: [1.4], at: 0.4 }) + `<div class="cx-2">` +
    card('GST', `${rowkv('GSTR-1 · November', sw('w', spin + 'Preparing', 'ok', 'Ready to file', 2))}${rowkv('E-invoices today', N(380, 412, 'n', 0.8))}`, 0.6) +
    card('Bank reconciliation', `${bar(0.96, 0.9)}${rowkv('Matched', N(80, 96, 'p', 0.9))}`, 0.7) + '</div>' },
  { n: 'Marketing', i: 'mega', sub: 'Google Ads · Meta · WhatsApp · email · SMS', btn: 'New campaign', v: () =>
    table([['Campaign', '1.5fr'], ['Spend', '.8fr', 1], ['Revenue', '.9fr'], ['ROAS', '.6fr']], [
      ['Performance Max · Google Ads', '₹42,000', N(198000, 231000, 'inr', 0.5), '<b>5.5x</b>'],
      ['Advantage+ · Meta', '₹38,500', N(150000, 173250, 'inr', 0.5), '<b>4.5x</b>'],
      ['Abandoned cart · WhatsApp', '₹2,100', N(81000, 96400, 'inr', 0.5), '<b>45.9x</b>'],
      ['Win-back · Email', '₹900', '₹41,200', '<b>45.8x</b>'],
      ['Festive sale · SMS', '₹3,400', '₹58,900', '<b>17.3x</b>'],
    ]) +
    card('Abandoned cart flow', `<ol class="cx-flow"><li style="--d:.9s">Cart left</li><li style="--d:1.3s">WhatsApp · 30 min</li><li style="--d:1.7s">Email · 6 h</li><li style="--d:2.1s">Coupon · 24 h</li></ol>${rowkv('Recovered today', N(31, 38, 'n', 2.3, 1800) + '<b>&nbsp;carts</b>')}`, 0.6) },
  { n: 'Discounts', i: 'pct', sub: 'Coupons · automatic offers · flash sales', btn: 'New discount', v: () =>
    kpis([['Live campaigns', '<b>9</b>'], ['Orders with a discount', N(36.2, 38.4, 'p', 0.2)], ['Discount given today', N(41000, 46820, 'inr', 0.2)], ['Revenue from offers', N(5.2, 6.1, 'l', 0.2)]]) +
    table([['Campaign', '1.4fr'], ['Type', '1.1fr', 1], ['Code', '.9fr'], ['Used', '.6fr', 1], ['Status', '.9fr']], [
      ['Welcome 10%', 'Coupon · first order', 'WELCOME10', N(120, 146, 'n', 0.8), chip('ok', 'Live')],
      ['Buy 2 get 1 free · tees', 'BOGO', 'Automatic', '312', chip('ok', 'Live')],
      ['₹300 off over ₹2,999', 'Cart value tier', 'SAVE300', '208', chip('ok', 'Live')],
      ['Shoe + socks bundle', 'Bundle price', 'Automatic', '94', chip('ok', 'Live')],
      ['Midnight flash sale', 'Flash sale · 2 h', 'Automatic', '—', sw('m', 'Scheduled', 'ok', 'Live', 2.6)],
      ['HDFC cards 10% back', 'Bank offer', 'Automatic', '77', chip('ok', 'Live')],
      ['Gold members free shipping', 'Loyalty tier', 'Automatic', '165', chip('ok', 'Live')],
    ], { at: 0.35 }) +
    two(card('Checkout · cart ₹3,148', `${rowkv('Code entered', '<b>WELCOME10</b>')}${rowkv('Check', sw('w', spin + 'Checking rules', 'ok', 'Valid · first order', 1.6))}${rowkv('Discount', late('<b>−₹315</b>', 1.9))}`, 0.8),
      card('Stacking and limits', rules(['Bank offer stacks with coupons', 'One coupon per order', 'Max ₹500 off per order'], 1.2), 0.9)) },
  { n: 'CRO', i: 'flask', sub: 'Experiments · A/B tests', btn: 'New test', v: () =>
    card('Test: checkout in 3 steps (A) vs one page (B)', `${rowkv('Visitors', N(16200, 18420, 'n', 0.3))}
<div class="cx-ab"><span>A</span>${bar(0.58, 0.5, 'g')}<b>2.9%</b></div><div class="cx-ab"><span>B</span>${bar(0.76, 0.7)}<b>3.8%</b></div>
<p class="cx-lt" style="--d:2s">${chip('ok', 'B wins · 97% confidence')}</p>`, 0.15) +
    card('Running experiments', table([['Test', '1.6fr'], ['Page', '.9fr', 1], ['Lift', '.6fr'], ['Status', '1fr']], [
      ['Sticky add-to-cart on mobile', 'Product', '+6.1%', chip('ok', 'Winner')],
      ['Delivery date on product page', 'Product', '+4.3%', sw('w', 'Running', 'ok', 'Winner', 2.6)],
      ['COD fee shown early', 'Checkout', '−1.2%', chip('m', 'Stopped')],
    ], { at: 0.9 }), 0.4) },
  { n: 'Recommendation engine', i: 'spark', sub: 'Product picks for every shopper', btn: 'New placement', v: () =>
    kpis([['Clicks on picks', N(8.6, 9.4, 'p', 0.2)], ['Revenue from picks', N(10.8, 12.6, 'l', 0.2)], ['Order value lift', N(11, 14, 'p', 0.2)], ['Model updated', '<b>2 h ago</b>']]) +
    table([['Placement', '1.5fr'], ['Where', '1fr', 1], ['Click rate', '.8fr'], ['Revenue', '.9fr']], [
      ['Frequently bought together', 'Cart', '12.4%', N(410000, 468000, 'inr', 0.6)],
      ['Picked for you', 'Home page', '9.1%', N(330000, 372000, 'inr', 0.6)],
      ['Similar items', 'Product page', '7.8%', '₹2,41,000'],
      ['Recently viewed', 'Email and WhatsApp', '6.2%', '₹1,78,000'],
    ], { at: 0.35 }) +
    two(card('Picks for Priya S.', bars([['Trail runner UK 9', 0.94, '0.94'], ['Running socks 3-pack', 0.88, '0.88'], ['Sports cap', 0.71, '0.71'], ['Water bottle', 0.62, '0.62']], 0.9, 130), 0.6),
      card('Rules', rules(['Returning buyer → last viewed category first', 'Pincode 5600xx → 1-day delivery items first', 'Cart over ₹2,000 → free shipping nudge', 'Out of stock → never recommend'], 1.1), 0.7)) },
  { n: 'Urgency and auctions', i: 'gavel', sub: 'Live auctions · urgency rules', btn: 'New auction', v: () =>
    `<div class="cx-2">` +
    card('<i class="cx-live"></i>Lot 18 · Signed jersey', `<p class="cx-big">${N(4200, 5100, 'inr', 0.4, 3200)}</p>${rowkv('Ends in', '<b class="js-cd">02:14</b>')}` +
      table([['Bidder', '1fr'], ['Bid', '1fr'], ['', '.9fr']], [['B-33', '₹5,100', chip('ok', 'Leading')], ['B-07', '₹4,600', ''], ['B-21', '₹4,200', '']], { nw: [3.4, 2.0, 0.6] }), 0.15) +
    card('Urgency rules', [
      ['Low-stock badge · under 5 units', 0.8], ['Sale countdown timer', 1.1], ['“12 people viewing” note', 1.4], ['Back-in-stock alerts', 1.7],
    ].map(([t, d]) => `<p class="cx-rl">${t}${tog(d)}</p>`).join('') + rowkv('Sell-through this week', N(54, 71, 'p', 1.8)), 0.3) + '</div>' },
  { n: 'Loyalty and returns', i: 'gift', sub: 'Points · tiers · returns queue', btn: 'Settings', v: () =>
    kpis([['Silver', N(8300, 8420, 'n', 0.2)], ['Gold', N(2090, 2115, 'n', 0.2)], ['Platinum', '<b>386</b>'], ['Points today', N(12400, 18960, 'n', 0.2)]]) +
    table([['Return', '.8fr'], ['Item', '1.2fr'], ['Reason', '1fr', 1], ['Status', '1.2fr']], [
      ['RT-1182', 'Trail runner UK 8', 'Size issue', sw('w', 'Pickup booked', 'ok', 'QC passed', 1.8)],
      ['RT-1181', 'Cotton tee M', 'Colour', chip('ok', 'Refunded')],
      ['RT-1180', 'Smart watch', 'Damaged', chip('ok', 'Replaced')],
      ['RT-1179', 'Sports cap', 'Changed mind', sw('w', 'QC passed', 'ok', 'Refunded', 2.8)],
    ], { at: 0.4 }) + `<p class="cx-cap r" style="--d:.9s">Return rate ${N(4.6, 4.1, 'p', 1)} · refunds to source in 24 h</p>` },
  { n: 'Customers', i: 'users', sub: '48,210 customers · 6 segments', btn: 'Export segment', v: () =>
    `<div class="cx-seg">${[
      ['VIP · LTV over ₹25k', 1150, 1204], ['Repeat buyers', 9720, 9880], ['At risk · 90 days', 3600, 3412],
      ['New this month', 2410, 2640], ['COD only', 5160, 5108], ['Wishlist, no order', 7020, 7310],
    ].map(([l, a, b], i) => `<div class="cx-k r" style="--d:${0.1 + i * 0.06}s"><span>${l}</span>${N(a, b, 'n', 0.4)}</div>`).join('')}</div>` +
    card('Priya S. · Gold', `${rowkv('Orders', '<b>14</b>')}${rowkv('Lifetime value', '<b>₹38,400</b>')}${rowkv('Prefers', '<b>UPI · Bengaluru</b>')}
<ul class="cx-tl"><li style="--d:1.2s">Placed order #48217 · ₹3,148</li><li style="--d:1.6s">Opened WhatsApp offer</li><li style="--d:2s">Earned 315 points</li></ul>`, 0.5) },
  { n: 'Support', i: 'help', sub: 'WhatsApp · email · chat · one inbox', btn: 'New ticket', v: () =>
    kpis([['Open tickets', N(42, 37, 'n', 0.2)], ['First reply', '<b>4 min</b>'], ['Solved today', N(110, 126, 'n', 0.2)], ['Rating', '<b>4.7 / 5</b>']]) +
    table([['Ticket', '.8fr'], ['Customer', '1fr'], ['Channel', '.8fr', 1], ['Topic', '1.3fr', 1], ['Status', '1.1fr']], [
      ['T-5520', 'Rahul M.', 'WhatsApp', 'Where is my order?', sw('w', 'Open', 'ok', 'Auto-answered', 1.8)],
      ['T-5519', 'Ananya R.', 'Email', 'Exchange size', chip('w', 'Waiting')],
      ['T-5518', 'Vikram J.', 'Chat', 'Coupon not working', chip('ok', 'Solved')],
      ['T-5517', 'Meera K.', 'WhatsApp', 'Invoice copy', chip('ok', 'Solved')],
    ], { at: 0.4 }) },
  { n: 'Analytics', i: 'chart', sub: 'Last 30 days', btn: 'Download report', v: () =>
    kpis([['Revenue', N(71.2, 84.2, 'l', 0.2)], ['Orders', N(28900, 32140, 'n', 0.2)], ['Avg order', N(2480, 2620, 'inr', 0.2)], ['Conversion', N(3.1, 3.6, 'p', 0.2)]]) +
    `<div class="cx-cd r cx-chart" style="--d:.3s"><p class="cx-ct">Revenue by day</p><svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
<path class="gr" d="M0 22H300M0 45H300M0 68H300"/><path class="ar" d="M0 78 20 74 40 76 60 66 80 69 100 58 120 61 140 52 160 55 180 44 200 47 220 36 240 38 260 27 280 24 300 14V90H0z"/>
<path class="ln" pathLength="1" d="M0 78 20 74 40 76 60 66 80 69 100 58 120 61 140 52 160 55 180 44 200 47 220 36 240 38 260 27 280 24 300 14"/></svg></div>` +
    card('Top products', [['Trail runner', 0.92], ['Cotton tee', 0.71], ['Smart watch', 0.55], ['Sports cap', 0.38]].map(([t, w], i) => `<div class="cx-ab wide"><span>${t}</span>${bar(w, 0.6 + i * 0.12)}</div>`).join(''), 0.45) },
  { n: 'Staff and ERP', i: 'shield', sub: 'Roles · access · accounting sync', btn: 'Invite', v: () =>
    table([['Name', '.9fr'], ['Role', '1fr'], ['Access', '1.4fr', 1], ['2FA', '.6fr']], [
      ['Neha', 'Owner', 'Everything', chip('ok', 'On')],
      ['Imran', 'Ops manager', 'Orders, inventory, shipping', chip('ok', 'On')],
      ['Kiran', 'Warehouse', 'Packing, photo check', chip('ok', 'On')],
      ['Divya', 'Support', 'Orders, returns', sw('w', 'Pending', 'ok', 'On', 2.2)],
    ]) + `<div class="cx-2">` +
    card('Accounting and ERP', `${rowkv('Tally Prime', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.2))}${rowkv('Zoho Books', chip('ok', 'Synced'))}${rowkv('GST e-invoice', sw('w', spin + 'Sending', 'ok', 'Filed', 2))}`, 0.5) +
    card('Sync log', `<ul class="cx-tl"><li style="--d:1.3s">INV-9921 pushed to Tally</li><li style="--d:1.8s">Stock levels sent to ERP</li><li style="--d:2.3s">GSTR-1 data ready</li></ul>`, 0.6) + '</div>' },
],
};
