/* Healthcare console ("See what we can build", ?s=healthcare-apps): a hospital and clinic system (HMS, EMR, CRM, ERP).
   Module list and every word and number are Bolt's draft mock data. */
import { N, chip, sw, spin, bar, table, kpis, card, two, rowkv, rules, tl, steps, bars, split, chart, late } from './cx-kit.mjs';

export default {
  top: { mark: 'heart', name: 'Care console', url: 'care.yourhospital.in', scope: 'All branches · 3', search: 'Search patients, UHID, doctors', sync: 'ABDM linked', bell: 5, av: 'D' },
  mods: [
    { n: 'Front desk', i: 'cal', sub: 'Appointments and queue · today', btn: 'Book visit', v: () =>
      kpis([['Appointments', N(286, 312, 'n', 0.2)], ['Checked in', N(171, 188, 'n', 0.2)], ['Avg wait', '<b>14 min</b>'], ['No-shows', N(6.1, 4.8, 'p', 0.2)]]) +
      table([['Token', '.6fr'], ['Patient', '1.1fr'], ['Doctor', '1.2fr', 1], ['Dept', '.9fr', 1], ['Time', '.6fr'], ['Status', '1.1fr']], [
        ['A-42', 'Kavya N.', 'Dr. Mehta', 'Cardiology', '10:40', chip('w', 'Booked')],
        ['A-41', 'Suresh P.', 'Dr. Rao', 'Orthopaedics', '10:30', sw('w', 'Checked in', 'a', 'With doctor', 2.2)],
        ['A-40', 'Fatima Z.', 'Dr. Iyer', 'Paediatrics', '10:20', chip('a', 'With doctor')],
        ['A-39', 'Rohit K.', 'Dr. Mehta', 'Cardiology', '10:10', sw('a', 'With doctor', 'ok', 'Done', 3.2)],
        ['A-38', 'Lakshmi V.', 'Dr. Sen', 'General', '10:00', chip('ok', 'Done')],
        ['A-43', 'Imran S.', 'Dr. Rao', 'Orthopaedics', '10:50', chip('m', 'Walk-in')],
      ], { nw: [null, null, null, null, null, 1.6], at: 0.35 }) },
    { n: 'Patient records', i: 'user', sub: 'EMR · one record across branches', btn: 'New patient', v: () =>
      two(card('Kavya N. · 34 F · UHID 20481', `${rowkv('Blood group', '<b>B+</b>')}${rowkv('Allergies', chip('bad', 'Penicillin'))}${rowkv('Conditions', '<b>Hypertension</b>')}${rowkv('ABHA ID', chip('ok', 'Linked'))}`, 0.2),
        card('Vitals today', `${rowkv('BP', N(150, 138, 'n', 0.5) + '<b>/88</b>')}${rowkv('Pulse', '<b>82 bpm</b>')}${rowkv('SpO₂', '<b>98%</b>')}${rowkv('Weight', '<b>64 kg</b>')}`, 0.3)) +
      card('Visit history', table([['Date', '.8fr'], ['Doctor', '1fr'], ['Notes', '1.6fr', 1], ['Rx', '.6fr']], [
        ['18 Nov', 'Dr. Mehta', 'BP review, dose changed', '2'],
        ['02 Oct', 'Dr. Sen', 'Fever, CBC ordered', '3'],
        ['11 Aug', 'Dr. Mehta', 'First visit, ECG normal', '1'],
      ], { at: 0.6 }), 0.5) +
      card('Prescription · today', `${tl(['Telmisartan 40 mg · once a day · 30 days', 'Lipid profile in 4 weeks', 'Sent to patient on WhatsApp'], 1.1)}`, 0.7) },
    { n: 'Doctors and schedules', i: 'steth', sub: '42 doctors · 11 departments', btn: 'Add slot', v: () =>
      table([['Doctor', '1.2fr'], ['Department', '1fr', 1], ['Today', '1.6fr'], ['Booked', '.6fr'], ['Status', '.9fr']], [
        ['Dr. Mehta', 'Cardiology', bar(0.9, 0.5), '27/30', chip('ok', 'In OPD')],
        ['Dr. Rao', 'Orthopaedics', bar(0.75, 0.6), '18/24', chip('ok', 'In OPD')],
        ['Dr. Iyer', 'Paediatrics', bar(0.95, 0.7), '38/40', chip('w', 'Almost full')],
        ['Dr. Sen', 'General', bar(0.6, 0.8), '21/35', chip('a', 'Teleconsult')],
        ['Dr. Kapoor', 'Gynaecology', bar(0.4, 0.9), '10/25', sw('m', 'In surgery', 'ok', 'In OPD', 3)],
      ]) +
      card('Leave and cover', `${rowkv('Dr. Bose · on leave Fri', '<b>16 patients</b>')}${rowkv('Moved to', '<b>Dr. Sen</b>')}${rowkv('Patients told', sw('w', spin + 'Sending SMS', 'ok', '16 of 16', 2.4))}`, 0.6) },
    { n: 'Teleconsult', i: 'video', sub: 'Video visits · e-prescriptions', btn: 'Start call', v: () =>
      two(card('<i class="cx-live"></i>Live · Dr. Sen with Arjun P.', `${rowkv('Call time', '<b class="js-cd">02:14</b>')}${rowkv('Connection', chip('ok', 'Good'))}${rowkv('Notes', late('<b>Viral fever, rest 3 days</b>', 1.8))}${rowkv('e-Prescription', sw('w', 'Drafting', 'ok', 'Signed and sent', 3))}`, 0.2),
        card('Waiting room', table([['Patient', '1fr'], ['Doctor', '1fr'], ['Wait', '.6fr']], [['Neha G.', 'Dr. Sen', '3 min'], ['Ravi T.', 'Dr. Iyer', '6 min'], ['Asha M.', 'Dr. Sen', '9 min']], { nw: [1.2, null, null] }), 0.3)) +
      kpis([['Video visits today', N(54, 61, 'n', 0.6)], ['Avg call', '<b>9 min</b>'], ['Paid online', N(96, 100, 'p', 0.6)], ['Rating', '<b>4.8 / 5</b>']], 0.5) },
    { n: 'Billing', i: 'card', sub: 'OPD and IPD bills · packages', btn: 'New bill', v: () =>
      two(card('Bill · Suresh P. · OPD', `${rowkv('Consultation', '<b>₹800</b>')}${rowkv('X-ray knee', '<b>₹650</b>')}${rowkv('Physio session', '<b>₹500</b>')}${rowkv('Total', '<b>₹1,950</b>')}${rowkv('Payment', sw('w', spin + 'Waiting for UPI', 'ok', 'Paid · receipt sent', 2.2))}`, 0.2),
        card('Collections today', `${split([['UPI', 54], ['Cards', 22], ['Cash', 12], ['Insurance', 12]], 0.4)}${rowkv('Total', N(8.4, 9.6, 'l', 0.4))}`, 0.3)) +
      table([['Bill', '.8fr'], ['Patient', '1fr'], ['Type', '.8fr', 1], ['Amount', '.9fr'], ['Status', '1fr']], [
        ['B-77120', 'Lakshmi V.', 'OPD', '₹1,200', chip('ok', 'Paid')],
        ['B-77119', 'Ward 3 · Bed 12', 'IPD', '₹84,500', chip('w', 'Interim')],
        ['B-77118', 'Gopal R.', 'Package', '₹1,45,000', sw('w', 'Insurance', 'ok', 'Settled', 3)],
      ], { at: 0.6 }) },
    { n: 'Wards and beds', i: 'bed', sub: '220 beds · 3 branches', btn: 'Admit', v: () =>
      kpis([['Occupied', N(168, 176, 'n', 0.2)], ['Free now', N(52, 44, 'n', 0.2)], ['Discharges today', '<b>23</b>'], ['ICU free', '<b>3 of 24</b>']]) +
      card('Occupancy by ward', bars([['General', 0.82, '82%'], ['ICU', 0.88, '88%'], ['Maternity', 0.64, '64%'], ['Paediatrics', 0.71, '71%'], ['Private rooms', 0.9, '90%']], 0.5), 0.3) +
      table([['Bed', '.7fr'], ['Patient', '1fr'], ['Doctor', '1fr', 1], ['Day', '.5fr'], ['Status', '1.1fr']], [
        ['ICU-04', 'Gopal R.', 'Dr. Mehta', '3', chip('bad', 'Critical')],
        ['W3-12', 'Asha M.', 'Dr. Kapoor', '2', sw('w', 'Discharge planned', 'ok', 'Discharged', 2.8)],
        ['W3-14', '—', '—', '—', sw('m', 'Cleaning', 'ok', 'Ready', 3.4)],
      ], { at: 0.7 }) },
    { n: 'Lab', i: 'flask', sub: 'Samples · machines · reports', btn: 'New order', v: () =>
      table([['Sample', '.8fr'], ['Patient', '1fr'], ['Test', '1.1fr'], ['Machine', '.9fr', 1], ['Status', '1.2fr']], [
        ['S-9031', 'Kavya N.', 'Lipid profile', 'Cobas c311', sw('w', 'Processing', 'ok', 'Report ready', 2.2)],
        ['S-9030', 'Rohit K.', 'Troponin I', 'Cobas e411', sw('w', 'Collected', 'w', 'Processing', 1.4)],
        ['S-9029', 'Fatima Z.', 'CBC', 'Sysmex XN', chip('ok', 'Report ready')],
        ['S-9028', 'Gopal R.', 'Blood culture', 'BacT/Alert', chip('m', 'Day 2 of 5')],
        ['S-9027', 'Suresh P.', 'Vitamin D', 'Cobas e411', chip('ok', 'Sent to patient')],
      ]) +
      two(card('Critical value', `${rowkv('Rohit K. · Troponin I', late(chip('bad', 'High'), 2.6))}${rowkv('Doctor told', sw('m', 'Waiting', 'ok', 'Dr. Mehta paged', 3.2))}`, 0.6),
        card('Turnaround', `${rowkv('Routine', '<b>3.2 h</b>')}${rowkv('Urgent', '<b>48 min</b>')}${bar(0.92, 0.9)}${rowkv('On time', N(88, 92, 'p', 0.9))}`, 0.7)) },
    { n: 'Pharmacy', i: 'pill', sub: 'Dispensing · stock · expiry', btn: 'Dispense', v: () =>
      table([['Rx', '.7fr'], ['Patient', '1fr'], ['Items', '.5fr', 1], ['Amount', '.8fr'], ['Status', '1.1fr']], [
        ['RX-5512', 'Kavya N.', '2', '₹612', sw('w', 'Picking', 'ok', 'Dispensed', 2)],
        ['RX-5511', 'Fatima Z.', '3', '₹438', chip('ok', 'Dispensed')],
        ['RX-5510', 'Ward 3', '14', '₹6,240', chip('w', 'Sent to ward')],
      ]) +
      two(card('Expiry alerts', table([['Medicine', '1.3fr'], ['Batch', '.8fr', 1], ['Expires', '.8fr']], [['Amoxicillin 500', 'B2231', '30 days'], ['Insulin glargine', 'G118', '45 days'], ['Ondansetron 4', 'O907', '60 days']], { at: 0.7 }), 0.5),
        card('Low stock · auto reorder', `${rowkv('Paracetamol 650 · 120 left', '<b>Reorder at 500</b>')}${rowkv('Purchase order', sw('m', 'Preparing', 'ok', 'PO-881 sent', 2.6))}`, 0.6)) },
    { n: 'Insurance and TPA', i: 'shield', sub: 'Pre-auth · claims · settlements', btn: 'New claim', v: () =>
      kpis([['Claims open', '<b>64</b>'], ['Pre-auth pending', N(11, 8, 'n', 0.2)], ['Settled this month', N(38.2, 41.6, 'l', 0.2)], ['Avg settlement', '<b>9 days</b>']]) +
      table([['Claim', '.8fr'], ['Patient', '1fr'], ['Insurer', '1.1fr', 1], ['Amount', '.9fr'], ['Status', '1.2fr']], [
        ['CL-2210', 'Gopal R.', 'Star Health', '₹1,45,000', sw('w', 'Pre-auth sent', 'ok', 'Approved', 2.2)],
        ['CL-2209', 'Asha M.', 'HDFC Ergo', '₹62,000', chip('w', 'Query raised')],
        ['CL-2208', 'Vinod S.', 'PM-JAY', '₹40,000', chip('ok', 'Settled')],
        ['CL-2207', 'Nisha D.', 'ICICI Lombard', '₹88,500', sw('m', 'Docs pending', 'w', 'Submitted', 3)],
      ], { at: 0.4 }) },
    { n: 'Patient CRM', i: 'heart', sub: 'Reminders · follow-ups · campaigns', btn: 'New journey', v: () =>
      table([['Journey', '1.5fr'], ['Channel', '.9fr', 1], ['Sent today', '.8fr'], ['Booked', '.7fr']], [
        ['Follow-up visit due', 'WhatsApp', N(120, 148, 'n', 0.5), '<b>61</b>'],
        ['Vaccination reminder', 'SMS', '86', '<b>34</b>'],
        ['Annual health check', 'Email', '420', '<b>27</b>'],
        ['Missed appointment', 'WhatsApp', '18', '<b>9</b>'],
      ]) +
      two(card('Journey · after surgery', steps(['Discharge', 'Day 2 call', 'Day 7 review', 'Day 30 check'], 0.9), 0.5),
        card('Feedback', `${rowkv('Rating this month', '<b>4.6 / 5</b>')}${rowkv('Google reviews asked', N(140, 162, 'n', 0.8))}${rowkv('Bad rating', sw('w', 'New', 'ok', 'Called back', 2.6))}`, 0.6)) },
    { n: 'Patient app', i: 'phone', sub: 'Bookings · reports · payments', btn: 'Publish', v: () =>
      kpis([['App users', N(41200, 42870, 'n', 0.2)], ['Booked in app', N(38, 41, 'p', 0.2)], ['Reports opened', '<b>1,206</b>'], ['App rating', '<b>4.7</b>']]) +
      two(card('What patients did today', tl(['Booked 128 visits', 'Downloaded 1,206 lab reports', 'Paid ₹3.1L in bills', 'Joined 61 video visits'], 0.6), 0.3),
        card('Features', rules(['Family profiles', 'Pay bills in app', 'Reports with doctor notes', 'Medicine reminders'], 0.8), 0.4)) },
    { n: 'Inventory and purchase', i: 'box', sub: 'Stores · consumables · vendors', btn: 'New PO', v: () =>
      table([['Item', '1.3fr'], ['Store', '.9fr', 1], ['Stock', '.7fr'], ['Status', '1.1fr']], [
        ['Gloves, nitrile M', 'Main store', '3,400', chip('ok', 'OK')],
        ['IV cannula 20G', 'OT store', '180', chip('w', 'Low')],
        ['Oxygen cylinders', 'ICU', '22', sw('w', 'Low', 'ok', 'Refill ordered', 2.4)],
        ['Surgical masks', 'Main store', '9,800', chip('ok', 'OK')],
      ]) +
      card('Purchase orders', table([['PO', '.7fr'], ['Vendor', '1.2fr'], ['Value', '.9fr'], ['Status', '1fr']], [
        ['PO-881', 'MedSupply Co.', '₹48,000', sw('m', 'Sent', 'ok', 'Confirmed', 2.8)],
        ['PO-880', 'Linde India', '₹62,500', chip('ok', 'Received')],
      ], { at: 0.8 }), 0.6) },
    { n: 'Staff and rosters', i: 'users', sub: '612 staff · 3 shifts', btn: 'Edit roster', v: () =>
      table([['Ward', '1fr'], ['Shift', '.8fr'], ['Nurses', '.7fr'], ['Needed', '.7fr', 1], ['Status', '1.1fr']], [
        ['ICU', 'Night', '9', '10', sw('bad', 'Short 1', 'ok', 'Covered', 2.4)],
        ['General', 'Night', '14', '14', chip('ok', 'Full')],
        ['Maternity', 'Night', '6', '6', chip('ok', 'Full')],
        ['Emergency', 'Night', '8', '8', chip('ok', 'Full')],
      ]) +
      two(card('Attendance today', `${bar(0.96, 0.6)}${rowkv('Present', N(570, 588, 'n', 0.6))}${rowkv('On leave', '<b>24</b>')}`, 0.5),
        card('Payroll · November', `${rowkv('Run', sw('w', spin + 'Calculating', 'ok', 'Ready for approval', 2.6))}${rowkv('Doctor payouts', '<b>₹42.8L</b>')}`, 0.6)) },
    { n: 'Finance', i: 'book', sub: 'Revenue · payouts · books', btn: 'Export', v: () =>
      kpis([['Revenue · Nov', N(3.8, 4.2, 'cr', 0.2)], ['Receivables', '<b>₹68.4L</b>', 'mostly insurers'], ['Doctor payouts due', '<b>₹42.8L</b>'], ['Cash in bank', '<b>₹1.9 Cr</b>']]) +
      card('Revenue by department', bars([['Cardiology', 0.92, '₹96L'], ['Orthopaedics', 0.74, '₹78L'], ['Maternity', 0.61, '₹64L'], ['Lab', 0.52, '₹55L'], ['Pharmacy', 0.47, '₹49L']], 0.5), 0.3) +
      card('Books', `${rowkv('Tally sync', sw('w', spin + 'Syncing', 'ok', 'Synced', 1.8))}${rowkv('TDS on doctor fees', chip('ok', 'Filed'))}`, 0.5) },
    { n: 'Analytics', i: 'chart', sub: 'Last 30 days', btn: 'Download report', v: () =>
      kpis([['Patients seen', N(8100, 8940, 'n', 0.2)], ['New patients', N(1880, 2110, 'n', 0.2)], ['Bed use', N(76, 80, 'p', 0.2)], ['Revenue per bed', '<b>₹19.1k</b>']]) +
      chart('Patients per day', [30, 34, 31, 40, 38, 45, 42, 50, 47, 55, 52, 60, 58, 66, 70]) +
      card('Where new patients come from', split([['Google', 38], ['Referrals', 27], ['App', 18], ['Camps', 10], ['Walk-in', 7]], 0.6), 0.5) },
    { n: 'Compliance and access', i: 'id', sub: 'ABDM · consent · audit log', btn: 'Invite', v: () =>
      table([['Name', '.9fr'], ['Role', '1fr'], ['Can see', '1.4fr', 1], ['2FA', '.6fr']], [
        ['Dr. Mehta', 'Doctor', 'Own patients, lab, Rx', chip('ok', 'On')],
        ['Priya', 'Front desk', 'Bookings, billing', chip('ok', 'On')],
        ['Anil', 'Pharmacist', 'Rx, stock', chip('ok', 'On')],
        ['Ritu', 'Nurse', 'Ward patients, vitals', sw('w', 'Pending', 'ok', 'On', 2.2)],
      ]) +
      two(card('ABDM', `${rowkv('Health records shared', N(380, 412, 'n', 0.6))}${rowkv('Consent requests', sw('w', spin + '3 waiting', 'ok', 'All answered', 2.4))}`, 0.5),
        card('Audit log', tl(['Dr. Rao opened UHID 20481', 'Report S-9029 sent to patient', 'Bill B-77118 edited by Priya'], 1.2), 0.6)) },
  ],
};
