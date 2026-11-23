/* Fintech as separate applications in a carousel (Suraj, 24 Nov 2026: "many of these are different applications... make it like a carousel").
   App 1 is the lending ERP; then payments, P2P lending and crowdfunding, each its own product. Every word and number is Bolt's draft mock data. */
import { N, chip, sw, spin, bar, table, kpis, card, two, rowkv, rules, tl, steps, chart } from './cx-kit.mjs';
import base from './cx-fintech.mjs';
import { FINTECH_PHONES } from './cx-consumer.mjs';

const pick = (...names) => names.map((n) => base.mods.find((m) => m.n === n));
const as = (n, name, extra = {}) => ({ ...pick(n)[0], n: name, ...extra });

export default [
  { tab: 'Lending ERP', accent: '#2563EB',
    top: { ...base.top, name: 'Lending console', sync: 'Bureau and bank links up' },
    mods: [as('Overview', 'Overview', { v: () =>
      kpis([['Loan book', N(212.4, 214.8, 'cr', 0.2)], ['Disbursed today', N(2.6, 3.1, 'cr', 0.2)], ['Collected today', N(4.1, 4.6, 'cr', 0.2)], ['Gross NPA', '<b>1.9%</b>']]) +
      chart('Disbursals, last 15 days', [28, 33, 30, 38, 36, 44, 41, 47, 45, 52, 50, 58, 61, 63, 70]) +
      two(card('Applications today', `${rowkv('Received', N(1100, 1264, 'n', 0.5))}${rowkv('Auto-approved', N(48, 52, 'p', 0.5))}`, 0.5),
        card('Borrowers', `${rowkv('Active loans', '<b>84,200</b>')}${rowkv('On time this month', N(96.1, 96.8, 'p', 0.6))}`, 0.6)) }),
    ...pick('Onboarding and KYC', 'Credit decisioning', 'Loans', 'Collections', 'Customers', 'Compliance and reports', 'Analytics', 'Roles and approvals')] },

  ...FINTECH_PHONES,
];
