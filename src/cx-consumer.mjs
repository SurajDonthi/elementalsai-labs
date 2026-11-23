/* Consumer phone apps for the fintech and healthcare carousels (Suraj, 24 Nov 2026: "A lot of people want fintech consumer apps!" ... "Likewise with the healthcare thing!!").
   Each app shows three screens of one user journey. Every name, word and number is Bolt's draft mock data. */
import { P, chip, sw, spin } from './cx-phone.mjs';

const up = (t) => `<b class="up">${t}</b>`;
const dn = (t) => `<b class="dn">${t}</b>`;
const b = (t) => `<b>${t}</b>`;

export const FINTECH_PHONES = [
  { tab: 'UPI payments app', accent: '#7C3AED',
    top: { mark: 'wallet', name: 'Pay app', line: 'Scan, pay and send money in one tap' },
    phones: [
      { cap: 'Home', body: P.head('Hi, Ananya', 'UPI ID ananya@yourpay', 'A') + P.hero('Bank balance', '₹48,230', 'HDFC ••4821 · shown after PIN') +
        P.acts([['qr', 'Scan & pay'], ['send', 'To contact'], ['bank', 'To bank'], ['doc', 'Pay bills']]) + P.sec('Recent') +
        P.rows([['RK', 'Ravi Kumar', 'Today, 9:12 am', dn('− ₹450')], ['UB', 'Urban Brew Café', 'Yesterday', dn('− ₹220')], ['MS', 'Mom', 'Yesterday', up('+ ₹5,000')]], 0.45) },
      { cap: 'Scan and pay', body: P.head('Pay Urban Brew Café', 'urbanbrew@yourbank', 'U') + P.card(`<p class="cx-pkv"><span>Amount</span><b style="font-size:22px">₹220</b></p><p class="cx-pkv"><span>Note</span><b>2 coffees</b></p>`, 0.15) +
        P.kv('From', b('HDFC ••4821'), 0.3) + P.kv('Merchant', chip('ok', 'Verified'), 0.4) + P.kv('Status', sw('w', spin + 'Paying', 'ok', 'Paid', 1.8), 0.5) + P.btn('Pay ₹220', 0.7) },
      { cap: 'Paid', body: P.tick('₹220', 'Paid to Urban Brew Café · 9:41 am') + P.kv('UPI ref', b('4102 8873 2291'), 0.5) + P.kv('Cashback', up('₹12 won'), 0.6) +
        P.kv('Split', chip('a', 'Ask Ravi for ₹110'), 0.7) + P.btn('Share receipt', 0.9) },
    ] },

  { tab: 'Instant loan app', accent: '#2563EB',
    top: { mark: 'bank', name: 'Loan app', line: 'Personal loan in 10 minutes, fully on the phone' },
    phones: [
      { cap: 'Check limit', body: P.head('Your loan limit', 'No impact on credit score', 'V') + P.hero('Pre-approved up to', '₹3,00,000', 'Rate from 13% a year') +
        P.kv('PAN', chip('ok', 'Verified'), 0.35) + P.kv('Aadhaar e-KYC', chip('ok', 'Done'), 0.45) + P.kv('Bank statement', sw('w', spin + 'Reading', 'ok', 'Checked', 1.6), 0.55) +
        P.kv('Credit check', sw('w', spin + 'Checking', 'ok', 'Score 768', 2.4), 0.65) + P.btn('See my offer', 0.9) },
      { cap: 'Pick amount and EMI', body: P.head('Choose your loan', 'Move the slider', 'V') + P.card(`<p class="cx-pkv"><span>Amount</span><b style="font-size:20px">₹1,50,000</b></p>`, 0.15) +
        P.bar(0.5, 0.25) + P.chips(['6 m', '12 m', '18 m', '24 m'], 1, 0.4) + P.kv('Monthly EMI', b('₹13,400'), 0.5) + P.kv('Processing fee', b('₹1,500'), 0.6) +
        P.kv('First EMI', b('5 Jan'), 0.7) + P.btn('Sign with Aadhaar OTP', 0.9) },
      { cap: 'Money sent', body: P.tick('₹1,48,500', 'Sent to HDFC ••4821 in 4 min') + P.kv('Loan ID', b('PL-24-88213'), 0.5) + P.kv('EMI auto-pay', chip('ok', 'Set up'), 0.6) +
        P.kv('Agreement', chip('ok', 'Emailed'), 0.7) + P.btn('View repayment plan', 0.9) },
    ] },

  { tab: 'Investing app', accent: '#059669',
    top: { mark: 'chart', name: 'Invest app', line: 'Mutual funds, SIPs and stocks for first-time investors' },
    phones: [
      { cap: 'Portfolio', body: P.head('My money', 'Updated 9:40 am', 'S') + P.hero('Current value', '₹6,82,400', '+ ₹84,120 · 14.1% overall') + P.line([5.1, 5.3, 5.2, 5.6, 5.5, 5.9, 6.1, 6.0, 6.4, 6.3, 6.6, 6.8]) +
        P.chips(['1M', '6M', '1Y', 'All'], 2, 0.5) + P.rows([['NI', 'Nifty 50 index fund', 'SIP ₹5,000 · 5th', up('+12.4%')], ['FC', 'Flexi cap fund', 'SIP ₹3,000 · 10th', up('+16.8%')]], 0.6) },
      { cap: 'Start a SIP', body: P.head('Flexi cap fund', 'Very high risk · 5 star', 'S') + P.line([10, 11, 10.6, 12, 12.8, 12.4, 13.6, 14.2, 14, 15.1, 15.8, 16.4], 0.15) +
        P.kv('3 year return', up('18.2% a year'), 0.4) + P.chips(['₹1,000', '₹3,000', '₹5,000'], 1, 0.5) + P.kv('Date', b('10th every month'), 0.6) + P.kv('Auto-pay', sw('w', spin + 'Setting', 'ok', 'Mandate live', 2), 0.7) + P.btn('Start SIP', 0.9) },
      { cap: 'Goals', body: P.head('My goals', '2 on track', 'S') + P.card(`<p class="cx-pkv"><span>House down payment</span><b>₹10L by 2029</b></p>`, 0.15) + P.bar(0.42, 0.25) +
        P.card(`<p class="cx-pkv"><span>Emergency fund</span><b>₹3L</b></p>`, 0.4) + P.bar(0.86, 0.5) + P.rows([['TX', 'Tax saving', '₹46,000 of ₹1.5L used', chip('w', 'Act by Mar')]], 0.7) + P.btn('Add a goal', 0.9) },
    ] },

  { tab: 'Trading app', accent: '#F97316',
    top: { mark: 'trend', name: 'Trading app', line: 'Stocks, F&O and live prices in one tap' },
    phones: [
      { cap: 'Watchlist', body: P.head('Watchlist', 'NSE · market open', 'R') + P.chips(['Nifty 50 ▲ 0.8%', 'Sensex ▲ 0.7%'], 0, 0.1) +
        P.rows([['RL', 'RELIANCE', 'NSE · 1,412 shares traded', up('₹2,948.20')], ['TC', 'TCS', 'NSE', up('₹4,102.55')], ['HB', 'HDFCBANK', 'NSE', dn('₹1,632.10')], ['IN', 'INFY', 'NSE', up('₹1,874.90')], ['TM', 'TATAMOTORS', 'NSE', dn('₹962.35')]], 0.25) +
        P.kv('Price alert', sw('w', 'Waiting', 'ok', 'TCS crossed ₹4,100', 2.4), 0.9) },
      { cap: 'Buy', body: P.head('RELIANCE', 'NSE · ₹2,948.20 ▲ 1.2%', 'R') + P.line([2890, 2902, 2896, 2915, 2908, 2926, 2921, 2934, 2930, 2941, 2948], 0.15) +
        P.chips(['1D', '1W', '1M', '1Y'], 0, 0.4) + P.chips(['Delivery', 'Intraday'], 0, 0.5) + P.kv('Quantity', b('10'), 0.6) + P.kv('Order type', b('Limit ₹2,945'), 0.7) +
        P.kv('Margin needed', b('₹29,450'), 0.8) + P.btn('Buy 10 shares', 1) },
      { cap: 'Order filled', body: P.tick('Bought 10', 'RELIANCE at ₹2,945.00 · 9:41 am') + P.kv('Order', sw('w', spin + 'Sent to NSE', 'ok', 'Filled', 1.4), 0.5) +
        P.sec('Positions today') + P.rows([['RL', 'RELIANCE · 10', 'Avg ₹2,945', up('+ ₹32')], ['NF', 'NIFTY 24500 CE · 75', 'Avg ₹112', up('+ ₹1,240')]], 0.7) + P.btn('View portfolio', 1) },
    ] },

  { tab: 'P2P lender app', accent: '#0D9488',
    top: { mark: 'users', name: 'P2P lender app', line: 'Lend small amounts to checked borrowers' },
    phones: [
      { cap: 'My lending', body: P.head('Hi, Meera', 'RBI-registered NBFC-P2P', 'M') + P.hero('Lent out', '₹2,10,000', 'Expected return 12.4% a year') +
        P.kv('Loans', b('105 borrowers'), 0.35) + P.kv('Repaid this month', up('₹18,240'), 0.45) + P.kv('Late', chip('w', '2 loans'), 0.55) + P.sec('Auto-invest') + P.kv('Status', chip('ok', 'On · ₹500 per loan'), 0.7) },
      { cap: 'Pick borrowers', body: P.head('New loans', 'Checked today', 'M') + P.chips(['Grade A', 'Under 12 m', 'Salaried'], 0, 0.15) +
        P.rows([['SP', 'Salaried · Pune', '₹1.5L · 12 m · A', P.bar(0.9, 0.5)], ['TK', 'Teacher · Kochi', '₹80k · 9 m · A', P.bar(0.62, 0.6)], ['SO', 'Shop owner · Indore', '₹3L · 24 m · B', P.bar(0.35, 0.7)]], 0.3) +
        P.kv('You lend', b('₹500 each'), 0.8) + P.btn('Lend ₹1,500', 1) },
      { cap: 'Repayments', body: P.head('Money back', 'This month', 'M') + P.line([4, 6, 9, 11, 13, 14, 16, 18], 0.15) +
        P.rows([['SP', 'Salaried · Pune', 'EMI 4 of 12', up('+ ₹46')], ['TK', 'Teacher · Kochi', 'EMI 2 of 9', up('+ ₹59')], ['DJ', 'Driver · Jaipur', '6 days late', sw('w', 'Reminder sent', 'ok', 'Paid', 2.6)]], 0.4) + P.btn('Withdraw ₹18,240', 0.9) },
    ] },

  { tab: 'Crowdfunding app', accent: '#DB2777',
    top: { mark: 'heart', name: 'Crowdfunding app', line: 'Back causes and get tax receipts' },
    phones: [
      { cap: 'Discover', body: P.head('Causes near you', 'Mumbai', 'P') + P.chips(['Education', 'Health', 'Climate'], 0, 0.1) +
        P.card(`<b>Library vans for 12 villages</b><small style="display:block;color:var(--xm)">₹7.2L of ₹10L · 18 days left</small>`, 0.2) + P.bar(0.72, 0.3) +
        P.card(`<b>Solar for 40 village schools</b><small style="display:block;color:var(--xm)">₹21L of ₹25L · 6 days left</small>`, 0.45) + P.bar(0.84, 0.55) + P.btn('Back a cause', 0.8) },
      { cap: 'Give', body: P.head('Library vans', 'By Read India Trust', 'P') + P.kv('Owner', chip('ok', 'KYC verified'), 0.15) + P.kv('80G receipt', chip('ok', 'Yes'), 0.25) +
        P.chips(['₹500', '₹1,000', '₹2,000', '₹5,000'], 2, 0.35) + P.kv('Status', sw('w', spin + 'Paying', 'ok', 'Paid by UPI', 1.8), 0.5) + P.btn('Give ₹2,000', 0.8) },
      { cap: 'Thank you', body: P.tick('₹2,000', 'You are backer number 1,402') + P.kv('80G receipt', sw('w', spin + 'Making', 'ok', 'Emailed', 1.6), 0.5) + P.kv('Tax saved', up('about ₹600'), 0.6) +
        P.kv('Updates', chip('a', 'Van 1 on the road'), 0.7) + P.btn('Share with friends', 0.9) },
    ] },
];

export const HEALTH_PHONES = [
  { tab: 'Patient app', accent: '#E11D48',
    top: { mark: 'heart', name: 'Patient app', line: 'Book visits, get reports and pay bills from the phone' },
    phones: [
      { cap: 'Home', body: P.head('Hi, Neha', 'City Care Hospital', 'N') + P.hero('Next visit', 'Today, 4:30 pm', 'Dr. Iyer · Skin · Room 204') +
        P.acts([['steth', 'Book doctor'], ['lab', 'Lab test'], ['pill', 'Medicines'], ['doc', 'Reports']]) + P.sec('For you') +
        P.rows([['LB', 'Blood test report', 'Ready · 8:10 am', chip('ok', 'New')], ['BL', 'Bill · 12 Nov', '₹1,850', chip('w', 'Pay')]], 0.5) },
      { cap: 'Book a doctor', body: P.head('Dr. Iyer', 'Skin · 12 years · ★ 4.8', 'N') + P.chips(['Today', 'Tomorrow', 'Sat'], 0, 0.15) +
        P.chips(['11:00', '12:30', '4:30 pm', '6:00'], 2, 0.3) + P.chips(['In clinic', 'Video'], 0, 0.45) + P.kv('Fee', b('₹600'), 0.55) +
        P.kv('Insurance', chip('ok', 'Cashless OK'), 0.65) + P.kv('Status', sw('w', spin + 'Booking', 'ok', 'Booked', 2), 0.75) + P.btn('Book 4:30 pm', 0.95) },
      { cap: 'Reports', body: P.head('Blood test', '23 Nov · Lab 2', 'N') + P.rows([['HB', 'Haemoglobin', '13.2 g/dL', chip('ok', 'Normal')], ['SG', 'Sugar, fasting', '112 mg/dL', chip('w', 'A bit high')], ['VD', 'Vitamin D', '18 ng/mL', chip('bad', 'Low')]], 0.15) +
        P.sec('Sugar, last 4 tests') + P.line([128, 121, 118, 112], 0.6) + P.btn('Ask Dr. Sen about this', 0.9) },
    ] },

  { tab: 'Video visit app', accent: '#2563EB',
    top: { mark: 'video', name: 'Video visit app', line: 'See a doctor on video in 10 minutes' },
    phones: [
      { cap: 'Find a doctor', body: P.head('What is the problem?', 'Pick one', 'K') + P.chips(['Fever', 'Skin', 'Child', 'Stomach', 'Mind'], 0, 0.1) +
        P.rows([['DS', 'Dr. Sen', 'General · ★ 4.9 · Hindi, English', chip('ok', '₹399')], ['DK', 'Dr. Khan', 'Child care · ★ 4.8', chip('ok', '₹499')], ['DR', 'Dr. Rao', 'General · ★ 4.7', chip('m', 'In 20 min')]], 0.3) +
        P.kv('Wait', sw('w', spin + 'Finding', 'ok', 'Dr. Sen ready', 2), 0.8) + P.btn('Start video visit', 1) },
      { cap: 'Video call', body: P.head('Dr. Sen', 'General physician', 'K') + P.video('DS', 'You') + P.kv('Shared', chip('a', '2 photos, 1 report'), 0.5) },
      { cap: 'Prescription', body: P.head('Your prescription', 'Signed by Dr. Sen', 'K') + P.rows([['P6', 'Paracetamol 650', '1-0-1 · 3 days', b('10')], ['OR', 'ORS', 'As needed', b('4')]], 0.15) +
        P.kv('Allergy check', chip('ok', 'Clear'), 0.5) + P.kv('Lab test', chip('a', 'CBC suggested'), 0.6) + P.kv('Medicines', sw('w', spin + 'Ordering', 'ok', 'At home by 7 pm', 2.2), 0.7) + P.btn('Order medicines ₹186', 0.9) },
    ] },

  { tab: 'Doctor app', accent: '#0F766E',
    top: { mark: 'steth', name: 'Doctor app', line: 'The day, the patients and the notes in one place' },
    phones: [
      { cap: 'My day', body: P.head('Good morning, Dr. Iyer', 'Tue · OPD and 2 video slots', 'I') + P.hero('Today', '18 patients', '6 done · next at 11:00') +
        P.rows([['NG', 'Neha G. · 11:00', 'Follow-up · acne', chip('ok', 'Arrived')], ['AM', 'Asha M. · 11:15', 'New · rash', chip('m', 'On the way')], ['KV', 'Karan V. · 11:30', 'Video', sw('w', 'Waiting', 'a', 'In call', 2.6)]], 0.4) },
      { cap: 'Patient notes', body: P.head('Neha G., 29', 'Visit 3 · allergy: sulfa', 'I') + P.card(`<small style="color:var(--xm)">Notes from voice</small><p style="margin:4px 0 0">Acne better by half. Keep gel. Stop the tablet after 2 weeks.</p>`, 0.15) +
        P.kv('Voice to notes', sw('w', spin + 'Writing', 'ok', 'Done', 1.6), 0.4) + P.kv('Past visits', b('2'), 0.5) + P.kv('Photos', b('Before and after'), 0.6) + P.btn('Write prescription', 0.85) },
      { cap: 'Earnings', body: P.head('This week', '84 visits', 'I') + P.hero('Earned', '₹62,400', 'Payout on Friday') + P.line([6, 9, 8, 12, 11, 14, 13], 0.3) +
        P.kv('Clinic', b('₹41,200'), 0.6) + P.kv('Video visits', b('₹21,200'), 0.7) + P.kv('Rating', up('★ 4.8'), 0.8) },
    ] },

  { tab: 'Pharmacy app', accent: '#EA580C',
    top: { mark: 'pill', name: 'Pharmacy app', line: 'Upload a prescription and get medicines at home' },
    phones: [
      { cap: 'Upload', body: P.head('Order medicines', 'Delivery in 2 hours', 'R') + P.card(`<p class="cx-pkv"><span>Prescription</span><b>Dr. Sen · 23 Nov</b></p>`, 0.15) +
        P.kv('Reading', sw('w', spin + 'Reading', 'ok', '2 medicines found', 1.8), 0.3) + P.rows([['P6', 'Paracetamol 650', 'Strip of 10', b('₹32')], ['OR', 'ORS sachets', 'Pack of 4', b('₹88')]], 0.6) + P.btn('Add to cart', 0.95) },
      { cap: 'Cart', body: P.head('Cart', '2 items', 'R') + P.kv('Medicines', b('₹120'), 0.15) + P.kv('Generic saved', up('− ₹34'), 0.25) + P.kv('Delivery', b('Free'), 0.35) +
        P.kv('Pharmacist check', sw('w', spin + 'Checking', 'ok', 'Approved', 1.8), 0.45) + P.kv('Pay', b('UPI'), 0.55) + P.btn('Pay ₹86', 0.8) },
      { cap: 'On the way', body: P.tick('On the way', 'Arjun is 12 min away') + P.kv('Order', b('#RX-40211'), 0.5) + P.kv('Packed', chip('ok', 'Cold chain not needed'), 0.6) +
        P.kv('Refill', chip('a', 'Remind me in 30 days'), 0.7) + P.btn('Call the rider', 0.9) },
    ] },
];
