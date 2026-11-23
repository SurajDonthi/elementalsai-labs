/* Fintech console ("See what we can build", ?s=fintech-apps): lending, payments, P2P lending and crowdfunding on one platform.
   Module list and every word and number are Bolt's draft mock data. */
import { N, chip, sw, spin, bar, table, kpis, card, two, rowkv, rules, tl, steps, bars, split, chart, late } from './cx-kit.mjs';

export default {
  top: { mark: 'bank', name: 'Finance console', url: 'ops.yourfinance.in', scope: 'Production', search: 'Search users, loans, transaction IDs', sync: 'All payment rails up', bell: 4, av: 'A' },
  mods: [
    { n: 'Overview', i: 'grid', sub: 'Today · all products', btn: 'Export', v: () =>
      kpis([['Loan book', N(212.4, 214.8, 'cr', 0.2)], ['Disbursed today', N(2.6, 3.1, 'cr', 0.2)], ['Collected today', N(4.1, 4.6, 'cr', 0.2)], ['Gross NPA', '<b>1.9%</b>']]) +
      chart('Disbursals, last 15 days', [28, 33, 30, 38, 36, 44, 41, 47, 45, 52, 50, 58, 61, 63, 70]) +
      two(card('Payments today', `${rowkv('Transactions', N(182000, 196400, 'n', 0.5))}${rowkv('Success rate', N(98.9, 99.3, 'p', 0.5))}`, 0.5),
        card('Users', `${rowkv('Active', '<b>3,84,200</b>')}${rowkv('New today', N(1100, 1264, 'n', 0.6))}`, 0.6)) },
    { n: 'Onboarding and KYC', i: 'id', sub: 'PAN · Aadhaar eKYC · video KYC · CKYC', btn: 'Settings', v: () =>
      kpis([['Started today', N(1490, 1612, 'n', 0.2)], ['KYC done', N(1120, 1204, 'n', 0.2)], ['Pass rate', N(73, 75, 'p', 0.2)], ['Avg time', '<b>3 min 40 s</b>']]) +
      table([['Applicant', '1fr'], ['PAN', '.8fr', 1], ['Aadhaar', '.8fr', 1], ['Video KYC', '.9fr'], ['Status', '1.1fr']], [
        ['Rahul M.', chip('ok', 'Verified'), chip('ok', 'Verified'), sw('w', spin + 'In call', 'ok', 'Passed', 2.2), sw('w', 'In review', 'ok', 'Approved', 2.6)],
        ['Sneha K.', chip('ok', 'Verified'), chip('ok', 'Verified'), chip('ok', 'Passed'), chip('ok', 'Approved')],
        ['Ajay T.', chip('ok', 'Verified'), chip('bad', 'Name mismatch'), chip('m', '—'), chip('w', 'Manual check')],
        ['Pooja L.', sw('w', spin + 'Checking', 'ok', 'Verified', 1.4), chip('m', '—'), chip('m', '—'), chip('m', 'Started')],
      ], { at: 0.4 }) },
    { n: 'Credit decisioning', i: 'scale', sub: 'Bureau · bank statements · rules · model', btn: 'Edit policy', v: () =>
      two(card('Application LA-77104 · Rahul M.', `${rowkv('Asked', '<b>₹2,00,000 · 24 months</b>')}${rowkv('Bureau score', N(600, 762, 'n', 0.4, 1600))}${rowkv('Monthly income', '<b>₹68,000</b> (bank statement)')}${rowkv('Existing EMIs', '<b>₹9,400</b>')}${rowkv('Risk model', N(0, 0.18, 'd1', 0.8) + '<b>&nbsp;risk</b>')}`, 0.2),
        card('Policy checks', `${rules(['Age 21 to 58', 'Score over 700', 'EMI under 50% of income', 'No default in 12 months', 'Not on fraud list'], 0.9)}`, 0.3)) +
      `<div class="cx-ask r" style="--d:1.2s"><p><b>Decision</b>Approved ₹2,00,000 at 14% for 24 months · EMI ₹9,603</p>${sw('w', spin + 'Deciding', 'ok', 'Auto-approved', 2.8)}</div>` },
    { n: 'Loans', i: 'coins', sub: 'Loan management · EMIs · statements', btn: 'New loan', v: () =>
      table([['Loan', '.9fr'], ['Borrower', '1fr'], ['Amount', '.9fr'], ['EMI', '.8fr', 1], ['Next due', '.8fr', 1], ['Status', '1fr']], [
        ['LN-55120', 'Rahul M.', '₹2,00,000', '₹9,603', '5 Dec', sw('w', 'Disbursing', 'ok', 'Active', 2.2)],
        ['LN-55119', 'Sneha K.', '₹75,000', '₹6,740', '5 Dec', chip('ok', 'Active')],
        ['LN-55118', 'Kiran B.', '₹5,00,000', '₹17,080', '10 Dec', chip('ok', 'Active')],
        ['LN-55117', 'Divya R.', '₹1,20,000', '₹10,780', '—', chip('m', 'Closed')],
        ['LN-55116', 'Manoj P.', '₹3,00,000', '₹14,390', '1 Dec', chip('bad', '12 days late')],
      ]) +
      two(card('Disbursal · LN-55120', `${steps(['Agreement e-signed', 'e-NACH set', 'Money sent by IMPS'], 0.8)}${rowkv('UTR', late('<b>IMPS 4471 0293</b>', 2.2))}`, 0.6),
        card('Book by product', split([['Personal', 46], ['Business', 28], ['Gold', 16], ['BNPL', 10]], 0.8), 0.7)) },
    { n: 'Collections', i: 'refresh', sub: 'Auto-debit · reminders · recovery', btn: 'New campaign', v: () =>
      kpis([['Due today', N(4.4, 4.6, 'cr', 0.2)], ['Auto-debit success', N(91, 93.4, 'p', 0.2)], ['Overdue loans', '<b>1,284</b>'], ['Promises to pay', N(160, 214, 'n', 0.2)]]) +
      card('Overdue by days', bars([['1 to 30 days', 0.72, '842'], ['31 to 60', 0.33, '291'], ['61 to 90', 0.14, '108'], ['Over 90', 0.06, '43']], 0.5), 0.3) +
      table([['Loan', '.9fr'], ['Borrower', '1fr'], ['Late', '.6fr'], ['Next step', '1.2fr', 1], ['Status', '1.1fr']], [
        ['LN-55116', 'Manoj P.', '12 d', 'Voice bot call', sw('w', spin + 'Calling', 'ok', 'Promised 3 Dec', 2.4)],
        ['LN-54980', 'Teja S.', '4 d', 'WhatsApp + UPI link', sw('w', 'Sent', 'ok', 'Paid', 3.2)],
        ['LN-54871', 'Arif K.', '38 d', 'Field visit', chip('m', 'Assigned')],
      ], { at: 0.7 }) },
    { n: 'Payments', i: 'swap', sub: 'UPI · IMPS · NEFT · cards', btn: 'Payment link', v: () =>
      kpis([['Volume today', N(38.2, 41.9, 'cr', 0.2)], ['Transactions', N(182000, 196400, 'n', 0.2)], ['Success rate', N(98.9, 99.3, 'p', 0.2)], ['Avg time', N(1600, 1240, 'ms', 0.2)]]) +
      split([['UPI', 71], ['IMPS', 12], ['Cards', 9], ['NEFT', 6], ['Wallet', 2]], 0.4) +
      table([['Txn ID', '1fr'], ['Type', '.6fr'], ['Amount', '.8fr'], ['Bank', '.8fr', 1], ['Status', '1fr']], [
        ['TX9F31A2', 'UPI', '₹1,250', 'HDFC', sw('w', spin + 'Pending', 'ok', 'Success', 1.2)],
        ['TX9F31A1', 'IMPS', '₹2,00,000', 'ICICI', chip('ok', 'Success')],
        ['TX9F31A0', 'Card', '₹4,999', 'Axis', chip('ok', 'Success')],
        ['TX9F319F', 'UPI', '₹640', 'SBI', sw('w', spin + 'Pending', 'bad', 'Failed · refunded', 2.4)],
      ], { nw: [0.8, null, null, null], at: 0.5 }) },
    { n: 'Wallet and ledger', i: 'wallet', sub: 'Double-entry ledger · balances', btn: 'Journal entry', v: () =>
      table([['Entry', '.8fr'], ['Account', '1.4fr'], ['Debit', '.8fr'], ['Credit', '.8fr'], ['Balance', '.9fr', 1]], [
        ['JE-90311', 'Loan disbursal · LN-55120', '₹2,00,000', '—', '₹212.4 Cr'],
        ['JE-90311', 'Nodal account', '—', '₹2,00,000', '₹18.6 Cr'],
        ['JE-90312', 'Processing fee', '—', '₹2,360', '₹1.2 Cr'],
        ['JE-90313', 'GST on fee', '—', '₹360', '₹18.4L'],
      ], { nw: [null, null, 1.4, 1.6] }) +
      two(card('Ledger check', `${rowkv('Debits = credits', sw('w', spin + 'Checking', 'ok', 'Balanced', 2))}${rowkv('Entries today', N(48000, 52310, 'n', 0.6))}`, 0.6),
        card('Wallets', `${rowkv('User wallets', '<b>₹9.4 Cr</b>')}${rowkv('Escrow', '<b>₹3.1 Cr</b>')}`, 0.7)) },
    { n: 'P2P lending', i: 'users', sub: 'Lenders · borrowers · matching', btn: 'New pool', v: () =>
      kpis([['Lender money', N(46.2, 47.0, 'cr', 0.2)], ['Lenders', '<b>12,840</b>'], ['Avg return', '<b>12.6%</b>'], ['Matched today', N(1.2, 1.5, 'cr', 0.2)]]) +
      two(card('Matching · loan LN-55121 · ₹1,50,000', `${bar(1, 0.6)}${rowkv('Split across', N(0, 214, 'n', 0.6, 2200) + '<b>&nbsp;lenders</b>')}${rowkv('Max per lender', '<b>₹2,000</b>')}${rowkv('Status', sw('w', spin + 'Matching', 'ok', 'Fully funded', 2.8))}`, 0.3),
        card('Lender payouts today', `${rowkv('EMIs received', '<b>₹82.4L</b>')}${rowkv('Sent to lenders', sw('w', spin + 'Sending', 'ok', '₹81.9L sent', 2.4))}${rowkv('Platform fee', '<b>₹0.5L</b>')}`, 0.4)) +
      table([['Pool', '1.2fr'], ['Risk', '.6fr'], ['Return', '.6fr'], ['Filled', '1.2fr']], [
        ['Salaried · 12 months', chip('ok', 'Low'), '11%', bar(0.86, 0.8)],
        ['Small business · 24 months', chip('w', 'Medium'), '14%', bar(0.64, 0.9)],
        ['Invoice discounting', chip('ok', 'Low'), '12%', bar(0.92, 1.0)],
      ], { at: 0.8 }) },
    { n: 'Crowdfunding', i: 'rocket', sub: 'Campaigns · backers · payouts', btn: 'New campaign', v: () =>
      table([['Campaign', '1.4fr'], ['Goal', '.8fr', 1], ['Raised', '1.4fr'], ['Backers', '.6fr'], ['Status', '.9fr']], [
        ['Solar for 40 village schools', '₹50L', bar(0.84, 0.5), N(1800, 1932, 'n', 0.5), chip('a', 'Live')],
        ['Electric autos for women drivers', '₹1.2 Cr', bar(0.61, 0.6), '2,410', chip('a', 'Live')],
        ['Organic farmers co-op', '₹25L', bar(1, 0.7), '1,108', sw('a', 'Live', 'ok', 'Funded', 2.6)],
        ['Clean water plant · Nashik', '₹40L', bar(0.33, 0.8), '612', chip('a', 'Live')],
      ]) +
      two(card('Backer checks', `${rowkv('KYC on all backers', chip('ok', 'On'))}${rowkv('Per-person limit', '<b>₹10L a year</b>')}${rowkv('Refund if goal missed', chip('ok', 'On'))}`, 0.6),
        card('Payout · Organic farmers co-op', `${steps(['Goal reached', 'Docs checked', 'Paid out'], 2.8)}`, 0.7)) },
    { n: 'Fraud and risk', i: 'alert', sub: 'Real-time rules · device · patterns', btn: 'New rule', v: () =>
      kpis([['Checked today', N(190000, 196400, 'n', 0.2)], ['Blocked', N(31, 38, 'n', 0.2)], ['Under review', '<b>12</b>'], ['Saved', N(9.4, 11.2, 'l', 0.2)]]) +
      table([['Alert', '1.3fr'], ['User', '.9fr'], ['Risk', '.7fr', 1], ['Action', '1.1fr']], [
        ['5 failed PINs, new device', 'U-88213', '0.91', sw('w', 'Checking', 'bad', 'Blocked', 1.6)],
        ['Same PAN, 3 accounts', 'U-88190', '0.84', chip('w', 'In review')],
        ['Loan asked from abroad IP', 'U-88177', '0.66', sw('w', 'Checking', 'w', 'OTP step-up', 2.6)],
        ['Big UPI at 3 am, first time', 'U-88102', '0.42', chip('ok', 'Allowed')],
      ], { nw: [0.8, null, null, null], at: 0.4 }) +
      card('Rules', rules(['Block on 5 wrong PINs', 'Step-up OTP on new device', 'Hold payouts over ₹5L for review'], 1.2), 0.7) },
    { n: 'Reconciliation', i: 'check', sub: 'Bank · gateway · ledger', btn: 'Upload statement', v: () =>
      table([['Source', '1.2fr'], ['Records', '.8fr'], ['Matched', '1.4fr'], ['Status', '1fr']], [
        ['HDFC nodal account', '48,210', bar(0.998, 0.5), sw('w', spin + 'Matching', 'ok', '99.8%', 1.8)],
        ['Razorpay settlements', '31,420', bar(1, 0.6), chip('ok', '100%')],
        ['NPCI UPI file', '1,12,400', bar(0.996, 0.7), sw('w', spin + 'Matching', 'ok', '99.6%', 2.6)],
        ['NACH returns', '2,140', bar(0.97, 0.8), chip('w', '62 to check')],
      ]) +
      card('Breaks', table([['Item', '1fr'], ['Reason', '1.4fr'], ['Fix', '1fr']], [
        ['TX9F2210', 'Bank posted twice', sw('w', 'Open', 'ok', 'Reversed', 2.8)],
        ['TX9F1987', 'Amount differs by ₹1', chip('ok', 'Auto-fixed')],
      ], { at: 0.9 }), 0.7) },
    { n: 'Compliance and reports', i: 'shield', sub: 'RBI returns · AML · CKYC · audit', btn: 'New report', v: () =>
      table([['Report', '1.5fr'], ['To', '.8fr', 1], ['Due', '.7fr'], ['Status', '1.1fr']], [
        ['CIC data upload', 'Bureaus', '7 Dec', sw('w', spin + 'Preparing', 'ok', 'Ready', 1.8)],
        ['Suspicious transaction report', 'FIU-IND', '3 Dec', chip('w', '2 to file')],
        ['CKYC uploads', 'CERSAI', 'Daily', chip('ok', 'Up to date')],
        ['NBFC monthly return', 'RBI', '15 Dec', chip('m', 'Not started')],
        ['Fair practice code check', 'Internal', '—', chip('ok', 'Passed')],
      ]) +
      two(card('Data rules', rules(['Data kept in India', 'Loan key fact statement sent', 'Cooling-off period on'], 0.9), 0.6),
        card('Audit trail', tl(['Policy v12 approved by credit head', 'LN-55116 write-off asked', 'KYC rule changed by Arun'], 1.2), 0.7)) },
    { n: 'Customers', i: 'user', sub: '3,84,200 users · 360° view', btn: 'Export', v: () =>
      two(card('Sneha K. · since 2023', `${rowkv('Products', '<b>Loan · wallet · P2P lender</b>')}${rowkv('Credit limit', '<b>₹1,50,000</b>')}${rowkv('Repayment', chip('ok', '18 of 18 on time'))}${rowkv('Risk', chip('ok', 'Low'))}`, 0.2),
        card('Offer for Sneha', `${rowkv('Pre-approved top-up', '<b>₹50,000</b>')}${rowkv('Sent on', '<b>App + WhatsApp</b>')}${rowkv('Status', sw('m', 'Queued', 'ok', 'Accepted', 2.6))}`, 0.3)) +
      table([['Ticket', '.8fr'], ['Topic', '1.4fr'], ['Channel', '.8fr', 1], ['Status', '1fr']], [
        ['T-3310', 'UPI money debited, not credited', 'Chat', sw('w', 'Open', 'ok', 'Refunded', 2.2)],
        ['T-3309', 'Foreclosure letter', 'Email', chip('ok', 'Solved')],
        ['T-3308', 'Change EMI date', 'App', chip('ok', 'Solved')],
      ], { at: 0.6 }) },
    { n: 'Partners and APIs', i: 'code', sub: 'Banks · co-lenders · merchants · webhooks', btn: 'New API key', v: () =>
      kpis([['API calls today', N(2.1, 2.4, 'd1', 0.2) + '<b> M</b>'], ['Uptime', '<b>99.98%</b>'], ['p95 latency', N(240, 182, 'ms', 0.2)], ['Partners', '<b>46</b>']]) +
      table([['Partner', '1.2fr'], ['Type', '1fr', 1], ['Calls today', '.8fr'], ['Health', '1fr']], [
        ['Co-lender · NBFC A', 'Loan sharing 80:20', '18,400', chip('ok', 'Healthy')],
        ['Bureau · CIBIL', 'Credit pulls', '6,120', chip('ok', 'Healthy')],
        ['Account aggregator', 'Bank statements', '4,880', sw('w', 'Slow', 'ok', 'Healthy', 2.4)],
        ['Merchant · BNPL checkout', 'Payments', '92,300', chip('ok', 'Healthy')],
      ], { at: 0.4 }) },
    { n: 'Analytics', i: 'chart', sub: 'Last 30 days', btn: 'Download report', v: () =>
      kpis([['Loans given', N(8200, 9140, 'n', 0.2)], ['Approval rate', N(32, 34, 'p', 0.2)], ['Avg ticket', '<b>₹1.18L</b>'], ['Yield', '<b>16.4%</b>']]) +
      chart('Collections efficiency', [62, 64, 63, 66, 68, 67, 70, 71, 73, 72, 75, 76, 78, 79, 81]) +
      card('Where good borrowers come from', bars([['App', 0.82, '41%'], ['Partners', 0.6, '30%'], ['Google Ads', 0.38, '19%'], ['Referrals', 0.2, '10%']], 0.6), 0.5) },
    { n: 'Roles and approvals', i: 'users', sub: 'Maker-checker · limits · 2FA', btn: 'Invite', v: () =>
      table([['Name', '.8fr'], ['Role', '1fr'], ['Approve up to', '1fr', 1], ['2FA', '.5fr']], [
        ['Arun', 'Credit head', '₹25,00,000', chip('ok', 'On')],
        ['Meghna', 'Credit officer', '₹5,00,000', chip('ok', 'On')],
        ['Vivek', 'Ops', 'Disbursals only', chip('ok', 'On')],
        ['Tara', 'Support', 'View only', sw('w', 'Pending', 'ok', 'On', 2.2)],
      ]) +
      card('Waiting for a checker', table([['Item', '1.2fr'], ['Maker', '.8fr'], ['Checker', '.8fr'], ['Status', '1fr']], [
        ['Write-off LN-54012 · ₹1.4L', 'Meghna', 'Arun', sw('w', 'Waiting', 'ok', 'Approved', 2.8)],
        ['Rate change · gold loans', 'Vivek', 'Arun', chip('w', 'Waiting')],
      ], { at: 0.8 }), 0.6) },
  ],
};
