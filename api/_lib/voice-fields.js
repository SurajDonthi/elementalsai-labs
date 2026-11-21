// Voice lead capture (T-1): the lead record and its rules. Pure functions, plain data, no I/O.
import { createHash } from 'node:crypto';

export const CANONICAL = ['name', 'phone', 'email', 'need', 'business', 'timeline'];
export const REQUIRED_FOR_FULL = ['name', 'email', 'phone', 'need'];
export const LIMITS = Object.freeze({ name: 80, phone: 30, email: 120, need: 1000, business: 200, timeline: 120 });
export const OTHER_LIMIT = 500;
export const KEY_MAX = 40;
export const MAX_KEYS = 20;   // distinct keys per lead
export const MAX_SAVES = 40;  // save_field writes per conversation

const CTRL = /[\u0000-\u001f\u007f]+/g;
export const clip = (v, n) => String(v == null ? '' : v).replace(CTRL, ' ').trim().slice(0, n);

export function normKey(raw) {
  return String(raw == null ? '' : raw).trim().toLowerCase()
    .replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_+|_+$/g, '')
    .slice(0, KEY_MAX);
}

// Same shape check as api/lead.js.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
export function normEmail(raw) {
  const v = clip(raw, LIMITS.email);
  const c = v.replace(/\s+/g, '').toLowerCase();
  return EMAIL_RE.test(c) ? { value: c, ok: true } : { value: v, ok: false };
}

// E.164. A number without a country code is taken as India (+91).
export function normPhone(raw) {
  const v = clip(raw, LIMITS.phone);
  const plus = v.startsWith('+');
  const d = v.replace(/\D/g, '');
  let e164 = '';
  if (plus) { if (d.length >= 8 && d.length <= 15) e164 = `+${d}`; }
  else if (d.startsWith('00') && d.length - 2 >= 8 && d.length - 2 <= 15) e164 = `+${d.slice(2)}`;
  else if (d.length === 10) e164 = `+91${d}`;
  else if (d.length === 11 && d.startsWith('0')) e164 = `+91${d.slice(1)}`;
  else if (d.length === 12 && d.startsWith('91')) e164 = `+${d}`;
  return e164 ? { value: e164, ok: true } : { value: v, ok: false };
}

// Words an analysis LLM uses for "not found".
const EMPTY_WORDS = /^(none|null|nil|n\/?a|unknown|not (provided|given|mentioned|available|specified|stated))\.?$/i;

export function makeField(key, raw, by, at) {
  const isEmpty = (s) => !s || EMPTY_WORDS.test(s);
  if (key === 'phone' || key === 'email') {
    const n = key === 'phone' ? normPhone(raw) : normEmail(raw);
    if (isEmpty(n.value)) return null;
    const f = { value: n.value, confirmed: n.ok, by, at };
    const heard = clip(raw, LIMITS[key]);
    if (heard !== n.value) f.raw = heard;
    return f;
  }
  const value = clip(raw, LIMITS[key] || OTHER_LIMIT);
  return isEmpty(value) ? null : { value, by, at };
}

// Captured = present and, for phone and email, the right shape.
export const captured = (f) => !!(f && f.value && f.confirmed !== false);

export function completeness(fields) {
  const have = REQUIRED_FOR_FULL.filter((k) => captured(fields[k]));
  const missing = REQUIRED_FOR_FULL.filter((k) => !captured(fields[k]));
  return { have, missing, pct: Math.round((have.length / REQUIRED_FOR_FULL.length) * 100) };
}

const recompute = (lead) => {
  const c = completeness(lead.fields);
  return { ...lead, completeness: c, status: c.missing.length ? 'partial' : 'full' };
};

export const isTestConversation = (id) => String(id).startsWith('TEST-');
export const validConversationId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{6,100}$/.test(id);
export const leadIdFor = (conversationId) => `vl_${createHash('sha256').update(conversationId).digest('hex').slice(0, 16)}`;

export function newLead({ conversationId, agentId, at }) {
  return recompute({
    lead_id: leadIdFor(conversationId),
    conversation_id: conversationId,
    agent_id: agentId,
    source: 'voice',
    status: 'partial',
    test: isTestConversation(conversationId),
    fields: {},
    booking: null,
    completeness: null,
    first_seen: at,
    last_seen: at,
    saves: 0,
    call: null,
    analysis: null,
    finalized_at: null,
    alert: null,
    v: 1,
  });
}

// save_field: the latest value the agent heard wins. Returns { lead } or { error }.
export function applySave(lead, keyRaw, raw, at) {
  const key = normKey(keyRaw);
  if (!key) return { error: 'bad_key' };
  if (lead.saves >= MAX_SAVES) return { error: 'too_many_saves' };
  if (!lead.fields[key] && Object.keys(lead.fields).length >= MAX_KEYS) return { error: 'too_many_keys' };
  const field = makeField(key, raw, 'agent', at);
  if (!field) return { error: 'empty_value' };
  return { key, field, lead: recompute({ ...lead, fields: { ...lead.fields, [key]: field }, saves: lead.saves + 1, last_seen: at }) };
}

// Fills only canonical fields that are absent. Never overwrites what the agent saved.
function fillMissing(fields, values, by, at) {
  const out = { ...fields };
  const filled = [];
  for (const key of CANONICAL) {
    if (out[key] || values[key] == null) continue;
    const f = makeField(key, values[key], by, at);
    if (f) { out[key] = f; filled.push(key); }
  }
  return { fields: out, filled };
}

const finiteOrNull = (n) => (Number.isFinite(n) ? n : null);

// T-5: a visitor turn with real text = role "user" and at least one letter or digit in any script.
// "..." is the silence marker ElevenLabs writes. Only the count is kept, never the words.
// No transcript array in the payload = unknown (null), not "silent".
const REAL_TEXT = /[\p{L}\p{N}]/u;
export function visitorTurns(transcript) {
  if (!Array.isArray(transcript)) return null;
  return transcript.filter((t) => t && t.role === 'user' && typeof t.message === 'string' && REAL_TEXT.test(t.message)).length;
}

// Post-call webhook: status, analysis values and summary. The turn-by-turn transcript is not kept.
export function applyCallEnd(lead, { data, at }) {
  const an = (data && data.analysis) || {};
  const md = (data && data.metadata) || {};
  const turns = visitorTurns(data && data.transcript);
  const dc = {};
  for (const [k, r] of Object.entries(an.data_collection_results || {})) {
    const v = r && typeof r === 'object' ? r.value : r;
    const key = normKey(k);
    if (key && v != null && v !== '') dc[key] = clip(v, OTHER_LIMIT);
  }
  const { fields, filled } = fillMissing(lead.fields, dc, 'analysis', at);
  const evaluation = {};
  for (const [k, r] of Object.entries(an.evaluation_criteria_results || {})) evaluation[normKey(k)] = clip(r && r.result, 40);
  return recompute({
    ...lead,
    fields,
    call: {
      status: clip(data && data.status, 40) || null,
      duration_secs: finiteOrNull(md.call_duration_secs),
      termination_reason: clip(md.termination_reason, 200) || null,
      started_at: Number.isFinite(md.start_time_unix_secs) ? new Date(md.start_time_unix_secs * 1000).toISOString() : null,
      visitor_turns: turns,
      visitor_responded: turns == null ? null : turns > 0,
    },
    analysis: {
      call_successful: clip(an.call_successful, 20) || null,
      summary: clip(an.transcript_summary, 2000) || null,
      title: clip(an.call_summary_title, 200) || null,
      data_collection: dc,
      evaluation,
      filled,
    },
    finalized_at: lead.finalized_at || at,
    last_seen: at,
  });
}

// book_call success: link the Cal.com booking; values given to book_call fill absent fields only.
export function applyBooking(lead, { uid, start, end, at, given = {} }) {
  const { fields } = fillMissing(lead.fields, given, 'book_call', at);
  return recompute({ ...lead, fields, booking: { uid, start, end: end || null, status: 'booked', at }, last_seen: at });
}

// One email per lead at finalize: never for a test lead, never twice.
export function alertDecision(lead, cfg) {
  if (lead.alert && (lead.alert.status === 'sent' || lead.alert.status === 'sending')) return { action: 'none' };
  if (lead.test) return { action: 'skip', reason: 'test lead' };
  if (!cfg.resendKey) return { action: 'skip', reason: 'RESEND_API_KEY not set' };
  return { action: 'send' };
}

// T-5: counts for GET /api/voice/leads?stats=1. Counts only, no personal data.
// A lead counts from its call start, else from its first save. sinceMs null = all leads.
export function leadStats(leads, sinceMs = null) {
  const out = { calls: 0, visitor_responded: 0, full: 0, partial: 0, booked: 0 };
  for (const l of leads) {
    if (!l) continue;
    if (sinceMs != null && !(Date.parse((l.call && l.call.started_at) || l.first_seen) >= sinceMs)) continue;
    out.calls++;
    if (l.call && l.call.visitor_responded === true) out.visitor_responded++;
    if (l.status === 'full') out.full++;
    else if (l.status === 'partial') out.partial++;
    if (l.booking && l.booking.status === 'booked') out.booked++;
  }
  return out;
}

// Short summary row for the read view list.
export function leadRow(lead) {
  return {
    lead_id: lead.lead_id,
    conversation_id: lead.conversation_id,
    status: lead.status,
    test: lead.test,
    name: lead.fields.name ? lead.fields.name.value : null,
    missing: lead.completeness ? lead.completeness.missing : null,
    booking_start: lead.booking ? lead.booking.start : null,
    finalized: !!lead.finalized_at,
    first_seen: lead.first_seen,
    last_seen: lead.last_seen,
  };
}
