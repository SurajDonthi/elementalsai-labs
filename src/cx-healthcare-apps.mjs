/* Healthcare as separate applications in a carousel (Suraj, 24 Nov 2026: "The first one is, of course, the ERP... other use cases... a carousel").
   App 1 is the hospital ERP; then the teleconsult platform and the patient app. Every word and number is Bolt's draft mock data. */
import { N, chip, sw, spin, table, kpis, card, two, rowkv, rules, tl, steps, chart } from './cx-kit.mjs';
import base from './cx-healthcare.mjs';
import { HEALTH_PHONES } from './cx-consumer.mjs';

const pick = (...names) => names.map((n) => base.mods.find((m) => m.n === n));
const as = (n, name, extra = {}) => ({ ...pick(n)[0], n: name, ...extra });

export default [
  { tab: 'Hospital ERP', accent: '#0F766E',
    top: { ...base.top, name: 'Hospital console' },
    mods: pick('Front desk', 'Patient records', 'Doctors and schedules', 'Billing', 'Wards and beds', 'Lab', 'Pharmacy', 'Insurance and TPA', 'Inventory and purchase', 'Staff and rosters', 'Finance', 'Analytics', 'Compliance and access') },

  ...HEALTH_PHONES,
];
