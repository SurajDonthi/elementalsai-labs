// Voice lead capture (T-1, T-5): free slots for the agent to read out. Pure functions, India time.
// T-5: check_slots returns every free slot in the next 7 days, 80 at most (the first 80 in time order).
import { TZ } from './voice-config.js';

export const SLOT_CAP = 80;
export const DAYS_AHEAD = 7;
const DAY_MS = 864e5;

export function slotWindow(nowMs, days = DAYS_AHEAD) {
  return { startIso: new Date(nowMs).toISOString(), endIso: new Date(nowMs + days * DAY_MS).toISOString(), timeZone: TZ };
}

const partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
const parts = (ms) => Object.fromEntries(partsFmt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));

export function dayLabel(ms) {
  const p = parts(ms);
  return `${p.weekday} ${p.day} ${p.month}`;
}

// "Sunday 22 Nov, 4 pm" / "Sunday 22 Nov, 4:30 pm"
export function slotLabel(ms) {
  const p = parts(ms);
  const period = String(p.dayPeriod).toLowerCase();
  const time = p.minute === '00' ? `${p.hour} ${period}` : `${p.hour}:${p.minute} ${period}`;
  return `${p.weekday} ${p.day} ${p.month}, ${time}`;
}

// Cal.com v2 slots data { 'YYYY-MM-DD': [{ start }] } -> slots after now and up to endMs, sorted, one per instant.
export function flattenSlots(data, nowMs, endMs = Infinity) {
  const out = [];
  for (const list of Object.values(data || {})) {
    for (const s of Array.isArray(list) ? list : []) {
      const start = typeof s === 'string' ? s : s && s.start;
      const ms = typeof start === 'string' ? Date.parse(start) : NaN;
      if (Number.isFinite(ms) && ms > nowMs && ms <= endMs) out.push({ start, ms });
    }
  }
  out.sort((a, b) => a.ms - b.ms);
  return out.filter((s, i) => i === 0 || s.ms !== out[i - 1].ms);
}

// all: every free slot in the 7-day window (book_call checks against it). shown: the first `cap` of them, label plus exact start.
export function buildSlotList(data, nowMs, cap = SLOT_CAP) {
  const all = flattenSlots(data, nowMs, nowMs + DAYS_AHEAD * DAY_MS);
  const shown = all.slice(0, cap).map((s) => ({ label: slotLabel(s.ms), start: s.start }));
  return { all, shown };
}
