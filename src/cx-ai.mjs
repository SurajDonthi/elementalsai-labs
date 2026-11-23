/* AI console ("See what we can build", ?s=build-with-ai): AI inside a business product, from assistants and vision to models in production.
   No client proof photos (Suraj: not AgShift, ToothLens or PilarsAI). Module list and every word and number are Bolt's draft mock data. */
import { N, chip, sw, spin, bar, table, kpis, card, two, rowkv, rules, tl, steps, bars, split, chart, late, cv } from './cx-kit.mjs';

export default {
  top: { mark: 'spark', name: 'AI Studio', url: 'ai.yourcompany.in', scope: 'Production', search: 'Search models, datasets, runs', sync: 'All models healthy', bell: 2, av: 'S' },
  mods: [
    { n: 'Overview', i: 'grid', sub: 'All AI features · today', btn: 'Export', v: () =>
      kpis([['AI requests', N(118000, 126400, 'n', 0.2)], ['Answered without a person', N(78, 81, 'p', 0.2)], ['p95 response', N(1900, 1420, 'ms', 0.2)], ['Cost today', N(3800, 4120, 'inr', 0.2)]]) +
      chart('AI requests per day', [20, 24, 27, 26, 33, 38, 36, 44, 48, 52, 55, 61, 66, 70, 78]) +
      table([['Feature', '1.4fr'], ['Model', '1fr', 1], ['Requests', '.8fr'], ['Quality', '.9fr']], [
        ['Support assistant', 'LLM + RAG', '64,200', chip('ok', '94% helpful')],
        ['Invoice reader', 'Document AI', '18,900', chip('ok', '99.1% exact')],
        ['Defect check · line 2', 'Vision model', '41,600', chip('ok', '98.4% recall')],
        ['Demand forecast', 'Time series', '1,700', chip('ok', '7.8% error')],
      ], { at: 0.7 }) },
    { n: 'Assistants', i: 'bot', sub: 'Chat on website, app and WhatsApp', btn: 'New assistant', v: () =>
      two(card('Live chat · customer on WhatsApp', `<ul class="cx-tl"><li style="--d:.5s">“Can I return shoes after 10 days?”</li><li style="--d:1.2s">Searching return policy…</li><li style="--d:1.9s">“Yes, within 30 days. I booked a pickup for tomorrow.”</li></ul>${rowkv('Sources', late(chip('a', 'Returns policy v4'), 2.1))}${rowkv('Action', sw('w', spin + 'Booking', 'ok', 'Pickup booked', 2.6))}`, 0.2),
        card('Today', `${rowkv('Chats', N(5800, 6240, 'n', 0.4))}${rowkv('Solved by AI', N(76, 79, 'p', 0.4))}${rowkv('Handed to a person', '<b>1,310</b>')}${rowkv('Rating', '<b>4.6 / 5</b>')}`, 0.3)) +
      table([['Assistant', '1.2fr'], ['Where', '1fr', 1], ['Languages', '1fr', 1], ['Status', '.8fr']], [
        ['Support assistant', 'Web, app, WhatsApp', 'English, Hindi, Tamil', chip('ok', 'Live')],
        ['Sales assistant', 'Website', 'English, Hindi', chip('ok', 'Live')],
        ['HR helpdesk', 'Slack', 'English', sw('m', 'Testing', 'ok', 'Live', 3)],
      ], { at: 0.8 }) },
    { n: 'Knowledge base', i: 'db', sub: 'Documents the assistants read', btn: 'Add source', v: () =>
      table([['Source', '1.4fr'], ['Type', '.8fr', 1], ['Docs', '.6fr'], ['Updated', '.8fr', 1], ['Status', '1fr']], [
        ['Help centre', 'Website', '412', '2 h ago', chip('ok', 'Indexed')],
        ['Policies folder', 'Google Drive', '86', 'Today', sw('w', spin + 'Indexing', 'ok', 'Indexed', 2)],
        ['Product catalogue', 'Database', '2,340', 'Live', chip('ok', 'Synced')],
        ['Past tickets', 'Zendesk', '48,200', 'Nightly', chip('ok', 'Indexed')],
        ['Price list Nov', 'PDF upload', '1', 'Now', sw('w', spin + 'Reading', 'ok', 'Indexed', 2.8)],
      ]) +
      two(card('Answer check', `${rowkv('Answers with a source', N(96, 98, 'p', 0.6))}${rowkv('Out-of-date docs found', '<b>3</b>')}`, 0.6),
        card('Access rules', rules(['HR docs only for staff', 'Prices only after login', 'Hide personal data'], 1), 0.7)) },
    { n: 'Vision inspection', i: 'eye', sub: 'Cameras on the line · defects in real time', btn: 'Add camera', v: () =>
      two(card('Line 2 · camera 3', cv('Live', [[30, 34, 16, 18, 'Scratch 0.94', 1.2], [58, 56, 12, 14, 'Dent 0.88', 2.2]]), 0.2),
        card('This shift', `${rowkv('Parts checked', N(10800, 11420, 'n', 0.4))}${rowkv('Defects', N(160, 182, 'n', 0.4))}${rowkv('Rejected by robot arm', sw('w', 'Signal sent', 'ok', 'Part removed', 2.6))}${bar(0.984, 0.6)}${rowkv('Recall', '<b>98.4%</b>')}`, 0.3)) +
      table([['Station', '1fr'], ['Defect type', '1fr'], ['Count', '.6fr'], ['Trend', '1fr', 1]], [
        ['Line 2 · cam 3', 'Scratch', '74', chip('w', 'Up 12%')],
        ['Line 2 · cam 1', 'Dent', '51', chip('ok', 'Down 8%')],
        ['Line 1 · cam 2', 'Missing label', '38', chip('ok', 'Down 20%')],
      ], { at: 0.8 }) },
    { n: 'Document AI', i: 'doc', sub: 'Invoices · KYC · forms read into your system', btn: 'Upload', v: () =>
      two(card('Invoice INV-2291 · Sole Craft', `${rowkv('Supplier GSTIN', late('<b>09AAACS1234F1Z5</b>', 0.8))}${rowkv('Invoice total', late('<b>₹4,82,000</b>', 1.1))}${rowkv('Line items', late('<b>12 of 12</b>', 1.4))}${rowkv('Matched to PO', sw('w', spin + 'Matching', 'ok', 'PO-3307 · exact', 2.2))}`, 0.2),
        card('Confidence', bars([['Supplier', 0.99, '0.99'], ['Dates', 0.98, '0.98'], ['Amounts', 0.97, '0.97'], ['HSN codes', 0.91, '0.91']], 0.6, 70), 0.3)) +
      table([['Document', '1.2fr'], ['Type', '.8fr'], ['Fields', '.6fr', 1], ['Status', '1.1fr']], [
        ['INV-2291.pdf', 'Invoice', '38', sw('w', 'Reading', 'ok', 'Posted to ERP', 2.8)],
        ['PAN_Rahul.jpg', 'KYC', '6', chip('ok', 'Verified')],
        ['Claim_form_77.pdf', 'Claim', '24', chip('w', 'Needs a person')],
      ], { at: 0.8 }) },
    { n: 'Voice agents', i: 'mic', sub: 'Calls in and out · Indian languages', btn: 'New agent', v: () =>
      kpis([['Calls today', N(2900, 3140, 'n', 0.2)], ['Handled fully', N(68, 71, 'p', 0.2)], ['Meetings booked', N(120, 138, 'n', 0.2)], ['Avg call', '<b>2 min 40 s</b>']]) +
      table([['Call', '.8fr'], ['Agent', '1fr'], ['Language', '.8fr', 1], ['Length', '.6fr', 1], ['Outcome', '1.1fr']], [
        ['C-80412', 'Sales follow-up', 'Hindi', '3:12', sw('w', spin + 'On call', 'ok', 'Demo booked', 2.6)],
        ['C-80411', 'Payment reminder', 'Tamil', '1:48', chip('ok', 'Promised today')],
        ['C-80410', 'Order status', 'English', '0:54', chip('ok', 'Solved')],
        ['C-80409', 'Sales follow-up', 'English', '2:30', chip('m', 'Call back Fri')],
      ], { nw: [0.6, null, null, null], at: 0.4 }) },
    { n: 'Forecasting', i: 'chart', sub: 'Demand · cash · staffing', btn: 'New forecast', v: () =>
      chart('Demand forecast · next 30 days', [40, 42, 45, 43, 48, 52, 55, 53, 58, 62, 66, 64, 70, 74, 79]) +
      two(card('Suggested actions', tl(['Order 1,200 more units of SKU TR-08', 'Add 2 packers for 12 to 15 Dec', 'Move 300 units to Bengaluru'], 1), 0.5),
        card('Accuracy', `${rowkv('Error last month', N(11.2, 7.8, 'p', 0.6))}${rowkv('Signals used', '<b>sales, prices, festivals, weather</b>')}`, 0.6)) },
    { n: 'Datasets and labelling', i: 'layers', sub: 'Data for training · label queues', btn: 'New dataset', v: () =>
      table([['Dataset', '1.3fr'], ['Items', '.7fr'], ['Labelled', '1.3fr'], ['Status', '1fr']], [
        ['Line 2 defects v6', '24,800', bar(0.92, 0.5), sw('w', 'Labelling', 'ok', 'Ready', 2.6)],
        ['Support chats Nov', '61,200', bar(1, 0.6), chip('ok', 'Ready')],
        ['Invoices · new suppliers', '3,410', bar(0.48, 0.7), chip('w', 'Labelling')],
        ['Call recordings · Tamil', '1,880', bar(0.2, 0.8), chip('m', 'Queued')],
      ]) +
      two(card('Label queue', `${rowkv('Items done today', N(2600, 2940, 'n', 0.6))}${rowkv('AI pre-labels kept', N(81, 84, 'p', 0.6))}${rowkv('Second check', chip('ok', 'On'))}`, 0.6),
        card('Data rules', rules(['Faces blurred', 'Phone numbers masked', 'Kept in India'], 1), 0.7)) },
    { n: 'Training runs', i: 'play', sub: 'Train · tune · compare', btn: 'New run', v: () =>
      table([['Run', '.8fr'], ['Model', '1.2fr'], ['Data', '1fr', 1], ['Progress', '1.2fr'], ['Score', '.6fr']], [
        ['R-212', 'Defect detector v7', 'Line 2 defects v6', bar(0.7, 0.5), N(0.9, 0.962, 'd1', 0.5, 2400)],
        ['R-211', 'Support model tune', 'Chats Nov', bar(1, 0.6), '<b>0.94</b>'],
        ['R-210', 'Invoice reader v3', 'New suppliers', bar(1, 0.7), '<b>0.97</b>'],
      ]) +
      two(card('Run R-212', `${rowkv('Epoch', N(14, 21, 'n', 0.6, 2600) + '<b>&nbsp;of 30</b>')}${rowkv('GPU', '<b>1 × L4</b>')}${rowkv('Status', sw('w', spin + 'Training', 'ok', 'Beat current model', 3.2))}`, 0.6),
        card('Cost so far', `${rowkv('This run', N(210, 386, 'inr', 0.6, 2400))}${rowkv('This month', '<b>₹14,200</b>')}`, 0.7)) },
    { n: 'Evaluations', i: 'check', sub: 'Test every model before it ships', btn: 'Run tests', v: () =>
      table([['Test set', '1.3fr'], ['Current', '.7fr'], ['New', '.7fr'], ['Result', '1fr']], [
        ['Defects · hard cases', '0.94', '0.962', sw('w', spin + 'Running', 'ok', 'Better', 1.4)],
        ['Defects · night shift', '0.91', '0.935', sw('w', spin + 'Running', 'ok', 'Better', 2)],
        ['False alarms', '2.1%', '1.6%', sw('w', spin + 'Running', 'ok', 'Better', 2.6)],
        ['Speed per part', '41 ms', '44 ms', sw('w', spin + 'Running', 'w', 'Slightly slower', 3.2)],
      ]) +
      card('Assistant answer tests', `${rowkv('Questions', '<b>600</b>')}${rowkv('Correct with source', N(88, 93, 'p', 0.8))}${rowkv('Unsafe answers', '<b>0</b>')}`, 0.7) },
    { n: 'Deployments', i: 'rocket', sub: 'Versions · rollout · rollback', btn: 'Deploy', v: () =>
      table([['Model', '1.2fr'], ['Version', '.6fr'], ['Traffic', '1.3fr'], ['Status', '1fr']], [
        ['Defect detector', 'v7', bar(0.1, 0.5), sw('w', 'Canary 10%', 'a', 'Rolling 50%', 3)],
        ['Defect detector', 'v6', bar(0.9, 0.6), chip('ok', 'Live')],
        ['Support assistant', 'v12', bar(1, 0.7), chip('ok', 'Live')],
        ['Invoice reader', 'v3', bar(1, 0.8), chip('ok', 'Live')],
      ]) +
      two(card('Rollout rules', rules(['Stop if errors go up 1%', 'Auto rollback on alarm', 'Approve before 100%'], 0.9), 0.6),
        card('Where it runs', `${rowkv('Factory edge box', '<b>2 × Jetson</b>')}${rowkv('Cloud', '<b>AWS Mumbai</b>')}`, 0.7)) },
    { n: 'Monitoring', i: 'pulse', sub: 'Quality · drift · speed', btn: 'Alerts', v: () =>
      kpis([['Uptime', '<b>99.97%</b>'], ['p95 speed', N(1900, 1420, 'ms', 0.2)], ['Drift', '<b>Low</b>'], ['Open alerts', N(3, 1, 'n', 0.2)]]) +
      chart('Assistant helpful answers %', [88, 89, 90, 89, 91, 92, 91, 93, 92, 94, 93, 94, 95, 94, 95]) +
      table([['Alert', '1.6fr'], ['Model', '1fr', 1], ['Status', '1fr']], [
        ['Lighting changed on line 1', 'Defect detector', sw('w', 'Open', 'ok', 'Retrain queued', 2.4)],
        ['Slow replies 2 to 3 pm', 'Support assistant', chip('ok', 'Fixed')],
      ], { at: 0.7 }) },
    { n: 'Guardrails', i: 'shield', sub: 'Safety · privacy · limits', btn: 'New rule', v: () =>
      kpis([['Checked today', N(118000, 126400, 'n', 0.2)], ['Personal data hidden', N(2800, 3120, 'n', 0.2)], ['Blocked prompts', '<b>41</b>'], ['Handed to a person', '<b>1,310</b>']]) +
      card('Rules', rules(['Hide phone, PAN and Aadhaar numbers', 'No medical or legal advice', 'Only answer from our documents', 'Hand over if the customer is upset', 'Daily spend limit ₹6,000'], 0.6), 0.3) +
      table([['Event', '1.6fr'], ['Rule', '1fr', 1], ['Action', '1fr']], [
        ['Card number typed in chat', 'Personal data', sw('w', 'Checking', 'ok', 'Masked', 1.8)],
        ['“Ignore your rules…”', 'Prompt attack', chip('bad', 'Blocked')],
      ], { at: 0.9 }) },
    { n: 'Costs and usage', i: 'coins', sub: 'Spend by feature and model', btn: 'Set budget', v: () =>
      kpis([['Spend · Nov', N(98000, 104200, 'inr', 0.2)], ['Budget', '<b>₹1,40,000</b>'], ['Cost per chat', '<b>₹0.66</b>'], ['Saved by caching', N(18, 22, 'p', 0.2)]]) +
      card('Spend by feature', bars([['Support assistant', 0.86, '₹46k'], ['Voice agents', 0.6, '₹31k'], ['Document AI', 0.32, '₹14k'], ['Vision (own GPU)', 0.22, '₹9k'], ['Forecasting', 0.08, '₹4k']], 0.5, 120), 0.3) },
    { n: 'Integrations', i: 'plug', sub: 'Where the AI reads and writes', btn: 'Connect', v: () =>
      table([['App', '1.2fr'], ['Used for', '1.4fr', 1], ['Sync', '1fr']], [
        ['WhatsApp Business', 'Chats and voice notes', sw('w', spin + 'Syncing', 'ok', 'Synced', 1)],
        ['Zoho CRM', 'Leads and deals', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.4)],
        ['Tally / SAP', 'Invoices and POs', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.8)],
        ['Google Drive', 'Documents', chip('ok', 'Synced')],
        ['Slack', 'Alerts and HR helpdesk', chip('ok', 'Synced')],
        ['Factory PLC', 'Reject signal', chip('ok', 'Connected')],
      ]) },
    { n: 'Access and audit', i: 'id', sub: 'Roles · approvals · logs', btn: 'Invite', v: () =>
      table([['Name', '.8fr'], ['Role', '1fr'], ['Can do', '1.4fr', 1], ['2FA', '.5fr']], [
        ['Sana', 'Admin', 'Everything', chip('ok', 'On')],
        ['Varun', 'ML engineer', 'Train, test, deploy to 10%', chip('ok', 'On')],
        ['Leena', 'Support lead', 'Edit answers, see chats', chip('ok', 'On')],
        ['Omar', 'Viewer', 'Reports', sw('w', 'Pending', 'ok', 'On', 2.2)],
      ]) +
      card('Audit log', tl(['Varun started rollout of Defect detector v7', 'Leena edited 4 answers', 'Budget alert at 75%'], 1), 0.6) },
  ],
};
