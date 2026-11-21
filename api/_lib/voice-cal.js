// Voice lead capture (T-1): the Cal.com v2 adapter. The only file that talks to Cal.com.
// The API key is added only when a request is sent; bookingRequest() never holds it, so a dry run can show it safely.
import { TZ } from './voice-config.js';

const BASE = 'https://api.cal.com/v2';
const SLOTS_VERSION = '2024-09-04';
const BOOKINGS_VERSION = '2024-08-13';

export const CAL_REASONS = Object.freeze({
  not_configured: 'The calendar is not set up.',
  cal_timeout: 'The calendar did not answer in time.',
  cal_auth: 'The calendar is not reachable right now.',
  cal_busy: 'The calendar is busy right now.',
  cal_refused: 'That time could not be booked.',
  cal_unavailable: 'The calendar is not reachable right now.',
});
const fail = (code, status = 0) => ({ ok: false, code, status, reason: CAL_REASONS[code] });

function codeFor(status) {
  if (status === 401 || status === 403) return 'cal_auth';
  if (status === 429) return 'cal_busy';
  if (status >= 500) return 'cal_unavailable';
  return 'cal_refused';
}

export function bookingRequest({ eventTypeId, startMs, name, email, phone, notes, leadId, conversationId }) {
  const attendee = { name, email, timeZone: TZ, language: 'en' };
  if (phone) attendee.phoneNumber = phone;
  const bookingFieldsResponses = {};
  if (notes) bookingFieldsResponses.notes = notes;
  if (phone) bookingFieldsResponses.attendeePhoneNumber = phone;
  return {
    url: `${BASE}/bookings`,
    method: 'POST',
    headers: { 'cal-api-version': BOOKINGS_VERSION, 'content-type': 'application/json' },
    body: {
      start: new Date(startMs).toISOString(),
      eventTypeId,
      attendee,
      bookingFieldsResponses,
      metadata: { lead_id: leadId, conversation_id: conversationId, source: 'voice' },
    },
  };
}

export function createCal({ apiKey, eventTypeId, fetchImpl = fetch, timeoutMs = 5000, bookTimeoutMs = 8000 }) {
  async function call(url, init, ms) {
    try {
      const r = await fetchImpl(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(ms) });
      const text = await r.text();
      let body = null;
      try { body = JSON.parse(text); } catch { body = null; }
      return { status: r.status, ok: r.ok, body };
    } catch (e) {
      return { status: 0, ok: false, body: null, timeout: !!e && (e.name === 'TimeoutError' || e.name === 'AbortError') };
    }
  }

  // Free slots, India time. One retry on a timeout, a network error or a 5xx.
  async function freeSlots({ startIso, endIso, timeZone = TZ, retry = false }) {
    if (!apiKey || !eventTypeId) return fail('not_configured');
    const q = new URLSearchParams({ eventTypeId: String(eventTypeId), start: startIso, end: endIso, timeZone });
    let r;
    for (let i = 0; i < (retry ? 2 : 1); i++) {
      r = await call(`${BASE}/slots?${q}`, { method: 'GET', headers: { 'cal-api-version': SLOTS_VERSION } }, timeoutMs);
      if (r.ok || (r.status > 0 && r.status < 500)) break;
    }
    if (r.ok && r.body && r.body.data && typeof r.body.data === 'object') return { ok: true, data: r.body.data };
    if (r.ok) return fail('cal_unavailable', r.status);
    return fail(r.status === 0 ? (r.timeout ? 'cal_timeout' : 'cal_unavailable') : codeFor(r.status), r.status);
  }

  // One booking. Never retried: a lost answer must not become a second booking.
  // unknown:true means the outcome is not known (timeout or network error after sending).
  async function book(body) {
    if (!apiKey || !eventTypeId) return fail('not_configured');
    const req = { method: 'POST', headers: { 'cal-api-version': BOOKINGS_VERSION, 'content-type': 'application/json' }, body: JSON.stringify(body) };
    const r = await call(`${BASE}/bookings`, req, bookTimeoutMs);
    const d = r.body && r.body.data;
    if (r.ok && d && d.uid) return { ok: true, uid: d.uid, start: d.start || body.start, end: d.end || null };
    if (r.status === 0) return { ...fail(r.timeout ? 'cal_timeout' : 'cal_unavailable'), unknown: true };
    return fail(r.ok ? 'cal_unavailable' : codeFor(r.status), r.status);
  }

  return { freeSlots, book };
}
