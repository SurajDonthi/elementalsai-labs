// Voice lead capture (T-1): request handlers. Each takes a Web Request and deps and returns a Response.
// deps = { cfg, store, cal, sendEmail, now, log, limits: { ip, conv } }. The routes in api/voice/ pass liveDeps().
// Tool refusals the agent should hear about are HTTP 200 with ok:false (ElevenLabs hides webhook tool errors).
import { voiceConfig, TZ } from './voice-config.js';
import { NO_STORE, json, readBody, parseObject, clientIp, log as logLine, createLimiter } from './voice-http.js';
import { hasToolSecret, hasBasic } from './voice-auth.js';
import { verifyElevenLabs } from './voice-hmac.js';
import {
  clip, normEmail, normPhone, captured, newLead, applySave, applyCallEnd, applyBooking, alertDecision, leadRow, leadStats,
  validConversationId, isTestConversation, leadIdFor,
} from './voice-fields.js';
import { slotWindow, buildSlotList, slotLabel, dayLabel } from './voice-slots.js';
import { createCal, bookingRequest, CAL_REASONS } from './voice-cal.js';
import { blobStore, upsertLead } from './voice-store.js';
import { alertEmail, resendSender } from './voice-alert.js';

const TOOL_MAX_BYTES = 8 * 1024;
const HOOK_MAX_BYTES = 2 * 1024 * 1024;
const PENDING_MS = 90 * 1000;
const LIST_MAX = 50;

const LIVE_LIMITS = Object.freeze({
  ip: createLimiter({ limit: 300, windowMs: 60_000 }),
  conv: createLimiter({ limit: 60, windowMs: 60_000 }),
});
let live = null;
export function liveDeps() {
  if (live) return live;
  const cfg = voiceConfig();
  live = Object.freeze({
    cfg,
    store: blobStore(),
    cal: createCal({ apiKey: cfg.calKey, eventTypeId: cfg.calEventTypeId }),
    sendEmail: cfg.resendKey ? resendSender({ apiKey: cfg.resendKey, from: cfg.leadFrom, to: cfg.leadTo }) : null,
    now: () => Date.now(),
    log: logLine,
    limits: LIVE_LIMITS,
  });
  return live;
}

const isoAt = (ms) => new Date(ms).toISOString();

function serverError(deps, route, conv, e) {
  deps.log('voice.error', { route, conv, error: (e && e.name) || 'Error', message: clip(e && e.message, 200) });
  return json(500, { ok: false, code: 'server_error', reason: 'Something went wrong on our side.' });
}

// Lock order: IP burst limit, shared secret, body size, JSON, this agent only, conversation id, per-call limit.
async function toolGuard(request, deps, route) {
  const now = deps.now();
  const deny = (status, code) => {
    deps.log('voice.tool.denied', { route, status, code });
    return { res: json(status, { ok: false, code }) };
  };
  if (!deps.limits.ip(clientIp(request), now)) return deny(429, 'rate_limited');
  if (!hasToolSecret(request, deps.cfg.toolSecret)) return deny(401, 'unauthorized');
  const body = await readBody(request, TOOL_MAX_BYTES);
  if (!body.ok) return deny(413, 'too_large');
  const args = parseObject(body.text);
  if (!args) return deny(400, 'bad_json');
  if (!deps.cfg.agentId || args.agent_id !== deps.cfg.agentId) return deny(403, 'wrong_agent');
  if (!validConversationId(args.conversation_id)) return deny(400, 'bad_conversation_id');
  if (!deps.limits.conv(args.conversation_id, now)) return deny(429, 'rate_limited');
  return { args, now, at: isoAt(now) };
}

// ---------- save_field ----------
const SAVE_REASONS = Object.freeze({
  bad_key: 'The key is not valid. Use a short word such as name, phone or email.',
  empty_value: 'The value is empty.',
  too_many_keys: 'This call has too many different keys.',
  too_many_saves: 'This call has too many saves.',
});

export async function saveField(request, deps) {
  const g = await toolGuard(request, deps, 'save_field');
  if (g.res) return g.res;
  const { args, at } = g;
  const id = args.conversation_id;
  const value = typeof args.value === 'string' || typeof args.value === 'number' ? String(args.value) : '';
  try {
    const out = await upsertLead(deps.store, id, (cur) => applySave(cur || newLead({ conversationId: id, agentId: deps.cfg.agentId, at }), args.key, value, at));
    if (out.error) {
      deps.log('voice.save.refused', { conv: id, code: out.error });
      return json(200, { ok: false, code: out.error, reason: SAVE_REASONS[out.error] });
    }
    const unconfirmed = out.field.confirmed === false;
    deps.log('voice.save', { lead_id: out.lead.lead_id, key: out.key, unconfirmed, status: out.lead.status, saves: out.lead.saves });
    const res = { ok: true, key: out.key };
    if (unconfirmed) Object.assign(res, { confirmed: false, note: `The ${out.key} looks incomplete. It is saved as heard.` });
    return json(200, res);
  } catch (e) {
    return serverError(deps, 'save_field', id, e);
  }
}

// ---------- check_slots ----------
export async function checkSlots(request, deps) {
  const g = await toolGuard(request, deps, 'check_slots');
  if (g.res) return g.res;
  const { args, now } = g;
  const unreachable = CAL_REASONS.cal_unavailable;
  try {
    const r = await deps.cal.freeSlots({ ...slotWindow(now), retry: true });
    if (!r.ok) {
      deps.log('voice.slots.failed', { conv: args.conversation_id, code: r.code, status: r.status });
      return json(200, { ok: false, slots: [], reason: r.reason || unreachable });
    }
    const { all, shown } = buildSlotList(r.data, now);
    deps.log('voice.slots', { conv: args.conversation_id, free: all.length, shown: shown.length });
    const res = { ok: true, today: dayLabel(now), time_zone: TZ, slots: shown };
    if (!shown.length) res.note = 'No free times in the next 7 days.';
    return json(200, res);
  } catch (e) {
    deps.log('voice.slots.failed', { conv: args.conversation_id, code: 'exception', error: (e && e.name) || 'Error' });
    return json(200, { ok: false, slots: [], reason: unreachable });
  }
}

// ---------- book_call ----------
const BOOK_REASONS = Object.freeze({
  name_missing: 'A name is needed to book.',
  email_missing: 'An email is needed to book.',
  email_invalid: 'The email does not look right. Confirm it again.',
  slot_invalid: 'The start is not valid. Use an exact start from check_slots.',
  slot_not_free: 'That time is not free now. Offer another time from check_slots.',
  booking_in_progress: 'A booking for this call is still being made.',
  booking_unknown: 'An earlier booking try has no clear result. Do not book again. The team will confirm the time.',
});

const blockingBooking = (b, now) => {
  if (!b) return null;
  if (b.status === 'booked') return 'already_booked';
  if (b.status === 'unknown') return 'booking_unknown';
  if (b.status === 'pending' && now - Date.parse(b.at) < PENDING_MS) return 'booking_in_progress';
  return null;
};

export async function bookCall(request, deps) {
  const g = await toolGuard(request, deps, 'book_call');
  if (g.res) return g.res;
  const { args, now, at } = g;
  const id = args.conversation_id;
  const refuse = (code) => {
    deps.log('voice.book.refused', { conv: id, code });
    return json(200, { ok: false, code, reason: BOOK_REASONS[code] });
  };
  const alreadyBooked = (b) => json(200, { ok: true, booked: true, already_booked: true, label: slotLabel(Date.parse(b.start)), start: b.start });
  try {
    const cur = await deps.store.read(id);
    const lead = cur ? cur.lead : null;
    const block = blockingBooking(lead && lead.booking, now);
    if (block === 'already_booked') return alreadyBooked(lead.booking);
    if (block) return refuse(block);

    // The fields: what the agent passed, else what it saved earlier.
    const saved = (k) => (lead && captured(lead.fields[k]) ? lead.fields[k].value : '');
    let email = saved('email');
    if (args.email) {
      const e = normEmail(args.email);
      if (!e.ok) return refuse('email_invalid');
      email = e.value;
    }
    if (!email) return refuse('email_missing');
    const name = clip(args.name, 80) || saved('name');
    if (!name) return refuse('name_missing');
    const p = args.phone ? normPhone(args.phone) : { ok: false };
    const phone = p.ok ? p.value : saved('phone');

    // The slot must be on a fresh free list from Cal.com.
    const startMs = typeof args.start === 'string' ? Date.parse(args.start) : NaN;
    if (!Number.isFinite(startMs)) return refuse('slot_invalid');
    if (startMs <= now) return refuse('slot_not_free');
    const fresh = await deps.cal.freeSlots(slotWindow(now));
    if (!fresh.ok) {
      deps.log('voice.book.failed', { conv: id, step: 'slots', code: fresh.code, status: fresh.status });
      return json(200, { ok: false, code: fresh.code, reason: fresh.reason });
    }
    const slot = buildSlotList(fresh.data, now).all.find((s) => s.ms === startMs);
    if (!slot) return refuse('slot_not_free');

    const label = slotLabel(startMs);
    const req = bookingRequest({
      eventTypeId: deps.cfg.calEventTypeId, startMs, name, email, phone,
      notes: clip(args.summary, 1000), leadId: leadIdFor(id), conversationId: id,
    });
    if (isTestConversation(id)) {
      deps.log('voice.book.dry_run', { conv: id, start: slot.start });
      return json(200, { ok: true, dry_run: true, booked: false, label, start: slot.start, would_send: req });
    }

    // Claim the booking on the lead first, so a repeated call cannot book twice.
    const claim = await upsertLead(deps.store, id, (c) => {
      const base = c || newLead({ conversationId: id, agentId: deps.cfg.agentId, at });
      const b = blockingBooking(base.booking, now);
      if (b) return { error: b, booking: base.booking };
      return { lead: { ...base, booking: { status: 'pending', start: slot.start, at }, last_seen: at } };
    });
    if (claim.error === 'already_booked') return alreadyBooked(claim.booking);
    if (claim.error) return refuse(claim.error);

    const r = await deps.cal.book(req.body);
    const doneAt = isoAt(deps.now());
    if (r.ok) {
      try {
        await upsertLead(deps.store, id, (c) => ({
          lead: applyBooking(c || claim.lead, { uid: r.uid, start: slot.start, end: r.end, at: doneAt, given: { name, email, phone } }),
        }));
      } catch (e) {
        deps.log('voice.book.link_failed', { conv: id, uid: r.uid, error: (e && e.name) || 'Error' });
      }
      deps.log('voice.book', { conv: id, lead_id: leadIdFor(id), uid: r.uid, start: slot.start });
      return json(200, { ok: true, booked: true, label, start: slot.start });
    }

    // Not booked. A timeout may still have booked, so that case blocks further tries.
    deps.log('voice.book.failed', { conv: id, step: 'book', code: r.code, status: r.status, unknown: !!r.unknown });
    try {
      await upsertLead(deps.store, id, (c) => (c ? {
        lead: { ...c, booking: r.unknown ? { status: 'unknown', start: slot.start, at: doneAt } : null, last_seen: doneAt },
      } : { noWrite: true }));
    } catch (e) {
      deps.log('voice.book.release_failed', { conv: id, error: (e && e.name) || 'Error' });
    }
    return json(200, { ok: false, code: r.code, reason: r.unknown ? BOOK_REASONS.booking_unknown : r.reason });
  } catch (e) {
    return serverError(deps, 'book_call', id, e);
  }
}

// ---------- post-call webhook ----------
export async function callEnd(request, deps) {
  const body = await readBody(request, HOOK_MAX_BYTES);
  if (!body.ok) return json(413, { ok: false, code: 'too_large' });
  const v = verifyElevenLabs(request.headers.get('elevenlabs-signature'), body.text, deps.cfg.webhookSecret, Math.floor(deps.now() / 1000));
  if (!v.ok) {
    deps.log('voice.call_end.denied', { code: v.code });
    return json(401, { ok: false, code: 'unauthorized' });
  }
  const p = parseObject(body.text);
  if (!p) return json(400, { ok: false, code: 'bad_json' });
  if (p.type !== 'post_call_transcription') {
    deps.log('voice.call_end.ignored', { why: 'type', type: clip(p.type, 40) });
    return json(200, { ok: true, ignored: 'type' });
  }
  const data = p.data && typeof p.data === 'object' ? p.data : {};
  if (!deps.cfg.agentId || data.agent_id !== deps.cfg.agentId) {
    deps.log('voice.call_end.ignored', { why: 'agent' });
    return json(200, { ok: true, ignored: 'agent' });
  }
  const id = data.conversation_id;
  if (!validConversationId(id)) return json(400, { ok: false, code: 'bad_conversation_id' });
  const at = isoAt(deps.now());
  try {
    const out = await upsertLead(deps.store, id, (cur) => {
      let lead = applyCallEnd(cur || newLead({ conversationId: id, agentId: data.agent_id, at }), { data, at });
      const d = alertDecision(lead, deps.cfg);
      if (d.action === 'skip') lead = { ...lead, alert: { status: 'skipped', reason: d.reason, at } };
      if (d.action === 'send') lead = { ...lead, alert: { status: 'sending', at } };
      return { lead, alert: d.action };
    });
    let lead = out.lead;
    if (out.alert === 'send') {
      const sent = deps.sendEmail ? await deps.sendEmail(alertEmail(lead)) : { ok: false, status: 0, code: 'no_sender' };
      const alert = sent.ok ? { status: 'sent', at: isoAt(deps.now()) } : { status: 'failed', code: sent.code || `http_${sent.status}`, at: isoAt(deps.now()) };
      lead = (await upsertLead(deps.store, id, (c) => ({ lead: { ...(c || lead), alert } }))).lead;
      deps.log(sent.ok ? 'voice.alert.sent' : 'voice.alert.failed', { lead_id: lead.lead_id, code: alert.code });
    }
    deps.log('voice.call_end', {
      lead_id: lead.lead_id, status: lead.status, filled: lead.analysis ? lead.analysis.filled : [],
      reason: lead.call ? lead.call.termination_reason : null, booked: !!(lead.booking && lead.booking.status === 'booked'),
      alert: lead.alert ? lead.alert.status : null,
      visitor_responded: lead.call ? lead.call.visitor_responded : null, visitor_turns: lead.call ? lead.call.visitor_turns : null,
    });
    return json(200, { ok: true, lead_id: lead.lead_id, status: lead.status, alert: lead.alert ? lead.alert.status : null });
  } catch (e) {
    return serverError(deps, 'call_end', id, e);
  }
}

// ---------- read view (same password style as api/leads.js) ----------
function needPassword() {
  return new Response('Password needed.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="ElementalsAI Labs voice leads"', 'Content-Type': 'text/plain; charset=utf-8', ...NO_STORE },
  });
}

// Reads every listed lead, 8 at a time. A lead removed between list and read is skipped.
async function readAll(store, items, batch = 8) {
  const out = [];
  for (let i = 0; i < items.length; i += batch) {
    const got = await Promise.all(items.slice(i, i + batch).map((it) => store.read(it.id)));
    for (const r of got) if (r) out.push(r.lead);
  }
  return out;
}

// GET ?id=<conversation id> one lead · ?count=1 count only · ?stats=1[&since=<date>] counts only (T-5)
// · ?test=1 TEST- leads only (with the list, count or stats) · else the newest 50.
export async function leadsGet(request, deps) {
  if (!hasBasic(request, deps.cfg.leadsKey)) return needPassword();
  const q = new URL(request.url).searchParams;
  try {
    if (q.has('id')) {
      const id = q.get('id');
      if (!validConversationId(id)) return json(400, { ok: false, code: 'bad_id' });
      const r = await deps.store.read(id);
      return r ? json(200, { ok: true, lead: r.lead }) : json(404, { ok: false, code: 'not_found' });
    }
    if (q.get('stats') === '1') {
      const since = q.get('since');
      const sinceMs = since == null || since === '' ? null : Date.parse(since);
      if (Number.isNaN(sinceMs)) return json(400, { ok: false, code: 'bad_since', reason: 'since must be an ISO date or date-time.' });
      const leads = await readAll(deps.store, await deps.store.list(q.get('test') === '1' ? 'TEST-' : ''));
      return json(200, { ok: true, since: sinceMs == null ? null : isoAt(sinceMs), ...leadStats(leads, sinceMs) });
    }
    const items = await deps.store.list(q.get('test') === '1' ? 'TEST-' : '');
    if (q.get('count') === '1') return json(200, { ok: true, count: items.length });
    items.sort((a, b) => (a.uploaded_at < b.uploaded_at ? 1 : a.uploaded_at > b.uploaded_at ? -1 : 0));
    const rows = await Promise.all(items.slice(0, LIST_MAX).map(async (it) => {
      const r = await deps.store.read(it.id);
      return r ? leadRow(r.lead) : null;
    }));
    return json(200, { ok: true, count: items.length, leads: rows.filter(Boolean) });
  } catch (e) {
    return serverError(deps, 'leads_get', null, e);
  }
}

// DELETE ?id=TEST-… one test lead · ?test=1 every test lead. Real leads cannot be deleted here.
export async function leadsDelete(request, deps) {
  if (!hasBasic(request, deps.cfg.leadsKey)) return needPassword();
  const q = new URL(request.url).searchParams;
  try {
    if (!q.has('id') && q.get('test') === '1') {
      const items = await deps.store.list('TEST-');
      for (const it of items) await deps.store.remove(it.id);
      deps.log('voice.lead.deleted', { count: items.length, test: true });
      return json(200, { ok: true, deleted: items.length });
    }
    const id = q.get('id');
    if (!validConversationId(id)) return json(400, { ok: false, code: 'bad_id' });
    if (!isTestConversation(id)) return json(403, { ok: false, code: 'test_leads_only', reason: 'Only TEST- leads can be deleted here.' });
    if (!(await deps.store.read(id))) return json(404, { ok: false, code: 'not_found' });
    await deps.store.remove(id);
    deps.log('voice.lead.deleted', { conv: id, count: 1 });
    return json(200, { ok: true, deleted: 1 });
  } catch (e) {
    return serverError(deps, 'leads_delete', null, e);
  }
}
