// T-1 voice lead capture: unit and handler tests (no network, in-memory store, fake Cal.com).
// Run: node --test agent/voice-unit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normKey, normEmail, normPhone, applySave, applyCallEnd, applyBooking, completeness, newLead, MAX_SAVES, MAX_KEYS } from '../api/_lib/voice-fields.js';
import { flattenSlots, slotLabel, dayLabel, buildSlotList, slotWindow, SLOT_CAP } from '../api/_lib/voice-slots.js';
import { signElevenLabs, verifyElevenLabs } from '../api/_lib/voice-hmac.js';
import { safeEqual, hasBasic } from '../api/_lib/voice-auth.js';
import { createLimiter } from '../api/_lib/voice-http.js';
import { BlobPreconditionFailedError } from '@vercel/blob';
import { memoryStore, blobStore, upsertLead } from '../api/_lib/voice-store.js';
import { bookingRequest } from '../api/_lib/voice-cal.js';
import { saveField, checkSlots, bookCall, callEnd, leadsGet, leadsDelete } from '../api/_lib/voice-handlers.js';

// Saturday 21 Nov 2026, 10:00 India time.
const NOW = Date.parse('2026-11-21T10:00:00+05:30');
const CFG = Object.freeze({
  toolSecret: 'tool-secret-for-unit-tests-0123456789',
  webhookSecret: 'whsec_unit_tests_0123456789abcdef',
  calKey: 'cal_unit', calEventTypeId: 8002444,
  leadsKey: 'leads-key-unit-tests', agentId: 'agent_unit_1',
  resendKey: '', leadTo: 'team@example.test', leadFrom: 'Labs <leads@example.test>',
});

// Cal.com v2 slots shape: { 'YYYY-MM-DD': [{ start }] }, India time offsets.
function calSlots() {
  const data = { '2026-11-21': ['09:00', '09:30', '15:00', '15:30'].map((t) => ({ start: `2026-11-21T${t}:00.000+05:30` })) };
  for (let d = 22; d <= 28; d++) {
    const day = `2026-11-${d}`;
    data[day] = [];
    for (let h = 10; h < 18; h++) for (const m of ['00', '30']) data[day].push({ start: `${day}T${String(h).padStart(2, '0')}:${m}:00.000+05:30` });
  }
  return data;
}

function fakeCal({ fail = false, bookFail = false, data = null } = {}) {
  const calls = [];
  return {
    calls,
    async freeSlots(q) { calls.push(['slots', q]); return fail ? { ok: false, code: 'cal_unavailable', reason: 'The calendar is not reachable right now.' } : { ok: true, data: data || calSlots() }; },
    async book(body) { calls.push(['book', body]); return bookFail ? { ok: false, code: 'cal_refused', reason: 'That time could not be booked.' } : { ok: true, uid: 'bk_unit_1', start: body.start, end: null }; },
  };
}

function deps(over = {}) {
  return {
    cfg: CFG, store: memoryStore(), cal: fakeCal(), sendEmail: null, now: () => NOW, log: () => {},
    limits: { ip: createLimiter({ limit: 1000, windowMs: 60000 }), conv: createLimiter({ limit: 1000, windowMs: 60000 }) },
    ...over,
  };
}

const conv = (s) => `TEST-unit-${s}`;
function toolReq(path, body, { secret = CFG.toolSecret, ip = '203.0.113.9' } = {}) {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': ip };
  if (secret) headers['x-voice-tool-secret'] = secret;
  return new Request(`https://voice.test${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
}
const save = (d, id, key, value, opts) => saveField(toolReq('/api/voice/save-field', { conversation_id: id, agent_id: CFG.agentId, key, value }, opts), d);

const HELLO = [{ role: 'agent', message: 'Hi' }, { role: 'user', message: 'Hello' }];
function postCall(id, { agentId = CFG.agentId, dc = {}, summary = 'Caller wants a booking bot.', reason = 'Client disconnected', type = 'post_call_transcription', transcript = HELLO, start = Math.floor(NOW / 1000) - 120 } = {}) {
  return {
    type, event_timestamp: Math.floor(NOW / 1000),
    data: {
      agent_id: agentId, conversation_id: id, status: 'done',
      transcript,
      metadata: { start_time_unix_secs: start, call_duration_secs: 118, termination_reason: reason },
      analysis: {
        call_successful: 'success', transcript_summary: summary,
        data_collection_results: Object.fromEntries(Object.entries(dc).map(([k, v]) => [k, { data_collection_id: k, value: v, rationale: 'said' }])),
        evaluation_criteria_results: {},
      },
    },
  };
}
function hookReq(payload, { secret = CFG.webhookSecret, ts = Math.floor(NOW / 1000), sig } = {}) {
  const raw = JSON.stringify(payload);
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.7' };
  const s = sig === undefined ? signElevenLabs(secret, raw, ts) : sig;
  if (s) headers['elevenlabs-signature'] = s;
  return new Request('https://voice.test/api/voice/call-end', { method: 'POST', headers, body: raw });
}
const basic = (pw) => 'Basic ' + Buffer.from(`team:${pw}`).toString('base64');
const viewReq = (qs, { pw = CFG.leadsKey, method = 'GET' } = {}) => new Request(`https://voice.test/api/voice/leads${qs}`, { method, headers: pw ? { authorization: basic(pw) } : {} });

// ---------- pure: fields ----------
test('normKey: snake_case, safe characters, 40 max', () => {
  assert.equal(normKey('Team Size'), 'team_size');
  assert.equal(normKey(' preferred-time '), 'preferred_time');
  assert.equal(normKey('!!!'), '');
  assert.equal(normKey('x'.repeat(60)).length, 40);
});

test('normPhone: India default, E.164, invalid kept raw', () => {
  assert.deepEqual(normPhone('98765 43210'), { value: '+919876543210', ok: true });
  assert.deepEqual(normPhone('098765-43210'), { value: '+919876543210', ok: true });
  assert.deepEqual(normPhone('91 98765 43210'), { value: '+919876543210', ok: true });
  assert.deepEqual(normPhone('+1 (415) 555-0100'), { value: '+14155550100', ok: true });
  assert.deepEqual(normPhone('0044 20 7946 0958'), { value: '+442079460958', ok: true });
  assert.deepEqual(normPhone('98765'), { value: '98765', ok: false });
});

test('normEmail: shape check like api/lead.js, spaces removed, invalid kept raw', () => {
  assert.deepEqual(normEmail(' Asha.R@Example.co.in '), { value: 'asha.r@example.co.in', ok: true });
  assert.deepEqual(normEmail('asha at example dot com'), { value: 'asha at example dot com', ok: false });
});

test('applySave: one lead, canonical and other keys, unconfirmed phone stays raw', () => {
  let lead = newLead({ conversationId: conv('a'), agentId: CFG.agentId, at: '2026-11-21T04:30:00.000Z' });
  for (const [k, v] of [['name', 'Asha'], ['phone', '98765'], ['need', 'A booking bot'], ['team_size', '12 people']]) lead = applySave(lead, k, v, '2026-11-21T04:31:00.000Z').lead;
  assert.equal(lead.fields.phone.value, '98765');
  assert.equal(lead.fields.phone.confirmed, false);
  assert.equal(lead.fields.team_size.value, '12 people');
  assert.equal(lead.status, 'partial');
  assert.deepEqual(lead.completeness.missing, ['email', 'phone']);
  lead = applySave(lead, 'phone', '+91 98765 43210', 'x').lead;
  lead = applySave(lead, 'email', 'asha@example.com', 'x').lead;
  assert.equal(lead.fields.phone.confirmed, true);
  assert.equal(lead.status, 'full');
  assert.equal(lead.saves, 6);
  assert.equal(lead.test, true);
});

test('applySave: empty value, bad key, key cap and save cap are refused', () => {
  let lead = newLead({ conversationId: conv('caps'), agentId: CFG.agentId, at: 'x' });
  assert.equal(applySave(lead, 'name', '   ', 'x').error, 'empty_value');
  assert.equal(applySave(lead, '???', 'v', 'x').error, 'bad_key');
  for (let i = 0; i < MAX_KEYS; i++) lead = applySave(lead, `k${i}`, 'v', 'x').lead;
  assert.equal(applySave(lead, 'one_more', 'v', 'x').error, 'too_many_keys');
  assert.ok(applySave(lead, 'k0', 'changed', 'x').lead, 'an existing key can still be updated');
  lead = { ...lead, saves: MAX_SAVES };
  assert.equal(applySave(lead, 'k1', 'v', 'x').error, 'too_many_saves');
});

test('applyCallEnd: fills only fields the agent never saved, keeps summary, no transcript', () => {
  let lead = newLead({ conversationId: conv('ce'), agentId: CFG.agentId, at: 'x' });
  lead = applySave(lead, 'name', 'Asha', 'x').lead;
  const p = postCall(conv('ce'), { dc: { name: 'Other Name', email: 'asha@example.com', phone: '9876543210', need: 'Lead capture', business: null, timeline: 'None' } });
  const out = applyCallEnd(lead, { data: p.data, at: 'y' });
  assert.equal(out.fields.name.value, 'Asha');
  assert.equal(out.fields.email.by, 'analysis');
  assert.equal(out.fields.phone.value, '+919876543210');
  assert.equal(out.fields.timeline, undefined, '"None" is treated as empty');
  assert.equal(out.status, 'full');
  assert.equal(out.analysis.summary, 'Caller wants a booking bot.');
  assert.deepEqual(out.analysis.filled.sort(), ['email', 'need', 'phone']);
  assert.equal(out.call.termination_reason, 'Client disconnected');
  assert.equal(JSON.stringify(out).includes('"transcript"'), false);
  assert.ok(out.finalized_at);
});

test('applyCallEnd: visitor_responded and visitor_turns count visitor turns with real text; no text is kept', () => {
  const lead = newLead({ conversationId: conv('vr'), agentId: CFG.agentId, at: 'x' });
  const end = (transcript) => applyCallEnd(lead, { data: { ...postCall(conv('vr'), { transcript }).data }, at: 'y' }).call;
  const talk = [
    { role: 'agent', message: 'Oh, hi! What should I call you?' }, { role: 'user', message: 'Hi, this is Ravi Kumar' },
    { role: 'user', message: '...' }, { role: 'user', message: '   ' }, { role: 'user', message: null }, { role: 'user', message: '…' },
    { role: 'agent', message: 'Nice to meet you.' }, { role: 'user', message: 'मुझे एक ऐप चाहिए' }, { role: 'agent', message: 'Bye' },
  ];
  assert.deepEqual([end(talk).visitor_responded, end(talk).visitor_turns], [true, 2]);
  const silent = [{ role: 'agent', message: 'Hello?' }, { role: 'user', message: '...' }, { role: 'agent', message: 'I will stop now.' }];
  assert.deepEqual([end(silent).visitor_responded, end(silent).visitor_turns], [false, 0]);
  assert.deepEqual([end([]).visitor_responded, end([]).visitor_turns], [false, 0]);
  assert.deepEqual([end(null).visitor_responded, end(null).visitor_turns], [null, null], 'no transcript in the payload: unknown');
  const out = applyCallEnd(lead, { data: postCall(conv('vr'), { transcript: talk }).data, at: 'y' });
  const s = JSON.stringify(out);
  assert.equal(s.includes('Ravi'), false, 'visitor words are not stored');
  assert.equal(s.includes('What should I call you'), false, 'agent words are not stored');
  assert.equal(s.includes('"transcript"'), false);
});

test('completeness: needs name, email, phone and need', () => {
  assert.deepEqual(completeness({}).missing, ['name', 'email', 'phone', 'need']);
});

// ---------- pure: slots ----------
test('slotLabel: India time, spoken style', () => {
  assert.equal(slotLabel(Date.parse('2026-11-22T16:00:00.000+05:30')), 'Sunday 22 Nov, 4 pm');
  assert.equal(slotLabel(Date.parse('2026-11-22T16:30:00.000+05:30')), 'Sunday 22 Nov, 4:30 pm');
  assert.equal(slotLabel(Date.parse('2026-11-22T10:30:00Z')), 'Sunday 22 Nov, 4 pm');
  assert.equal(slotLabel(Date.parse('2026-11-23T00:00:00+05:30')), 'Monday 23 Nov, 12 am');
  assert.equal(dayLabel(NOW), 'Saturday 21 Nov');
});

test('flattenSlots: drops past slots and slots after the 7 days, sorted, no duplicates', () => {
  const data = calSlots();
  data['2026-11-22'].push({ start: '2026-11-22T04:30:00.000Z' }); // same instant as 10:00 IST
  data['2026-11-28'].push({ start: '2026-11-28T10:00:00.000+05:30' }); // a double, written the same way
  data['2026-11-29'] = [{ start: '2026-11-29T10:00:00.000+05:30' }]; // after the 7-day window
  const end = NOW + 7 * 864e5; // Saturday 28 Nov, 10:00 India time
  const all = flattenSlots(data, NOW, end);
  assert.ok(all.every((s) => s.ms > NOW && s.ms <= end));
  assert.ok(all.every((s, i) => i === 0 || s.ms > all[i - 1].ms));
  assert.equal(all[0].start, '2026-11-21T15:00:00.000+05:30');
  assert.equal(all.at(-1).start, '2026-11-28T10:00:00.000+05:30');
  assert.equal(all.length, 2 + 6 * 16 + 1);
  assert.equal(flattenSlots(data, NOW).length, 2 + 7 * 16 + 1, 'no end given: the later slots stay');
});

test('buildSlotList: every free slot, label plus the exact Cal.com start; over 80, the first 80 in time order', () => {
  assert.equal(SLOT_CAP, 80);
  const { all, shown } = buildSlotList(calSlots(), NOW);
  assert.equal(all.length, 99, 'the 7 days end on 28 Nov at 10:00');
  assert.equal(shown.length, 80);
  assert.deepEqual(shown[0], { label: 'Saturday 21 Nov, 3 pm', start: '2026-11-21T15:00:00.000+05:30' });
  assert.deepEqual(shown[79], { label: 'Thursday 26 Nov, 4:30 pm', start: '2026-11-26T16:30:00.000+05:30' });
  assert.deepEqual(shown, all.slice(0, 80).map((s) => ({ label: slotLabel(s.ms), start: s.start })));
  // Under the cap: every free slot, nothing left out (the real calendar had 59 on 21 Nov).
  const few = calSlots();
  for (const d of ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28']) delete few[d];
  const f = buildSlotList(few, NOW);
  assert.equal(f.shown.length, 2 + 3 * 16);
  assert.deepEqual(f.shown.map((s) => s.start), f.all.map((s) => s.start));
  assert.equal(new Set(f.shown.map((s) => s.start)).size, f.shown.length);
  // A slot after the 7 days is never offered.
  const late = calSlots();
  late['2026-11-29'] = [{ start: '2026-11-29T10:00:00.000+05:30' }];
  assert.equal(buildSlotList(late, NOW).all.some((s) => s.start.startsWith('2026-11-29')), false);
  const w = slotWindow(NOW);
  assert.equal(Date.parse(w.endIso) - Date.parse(w.startIso), 7 * 864e5);
});

// ---------- pure: signature, auth, limits ----------
test('verifyElevenLabs: good, tampered, stale, missing', () => {
  const raw = '{"a":1}';
  const ts = 1763700000;
  const h = signElevenLabs('sec', raw, ts);
  assert.equal(verifyElevenLabs(h, raw, 'sec', ts + 10).ok, true);
  assert.equal(verifyElevenLabs(h, '{"a":2}', 'sec', ts + 10).code, 'bad_signature');
  assert.equal(verifyElevenLabs(h, raw, 'other', ts + 10).code, 'bad_signature');
  assert.equal(verifyElevenLabs(h, raw, 'sec', ts + 31 * 60).code, 'stale_signature');
  assert.equal(verifyElevenLabs('', raw, 'sec', ts).code, 'missing_signature');
  assert.equal(verifyElevenLabs('garbage', raw, 'sec', ts).code, 'bad_signature_header');
  assert.equal(verifyElevenLabs(h, raw, '', ts).code, 'not_configured');
});

test('safeEqual and Basic auth deny by default', () => {
  assert.equal(safeEqual('a', 'a'), true);
  assert.equal(safeEqual('a', 'b'), false);
  assert.equal(safeEqual('', ''), false);
  const r = new Request('https://x.test', { headers: { authorization: basic('pw') } });
  assert.equal(hasBasic(r, 'pw'), true);
  assert.equal(hasBasic(r, ''), false);
});

test('createLimiter: blocks over the limit, frees after the window', () => {
  const allow = createLimiter({ limit: 3, windowMs: 1000 });
  assert.deepEqual([1, 2, 3, 4].map(() => allow('ip', 0)), [true, true, true, false]);
  assert.equal(allow('other', 0), true);
  assert.equal(allow('ip', 1001), true);
});

test('upsertLead: retries on an ETag conflict', async () => {
  const store = memoryStore();
  let raced = false;
  const out = await upsertLead(store, 'TEST-race', (cur) => {
    if (!raced) { raced = true; store.m.set('TEST-race', { body: JSON.stringify({ n: 1 }), etag: 'other', at: new Date() }); }
    return { lead: { n: (cur ? cur.n : 0) + 1 } };
  });
  assert.equal(out.written, true);
  assert.equal((await store.read('TEST-race')).lead.n, 2);
});

// A fake Vercel Blob client that acts like the real one (seen live on 21 Nov 2026): a private read of a body
// of about 1 KB or more comes back compressed with a weak ETag, unless the read asks for "accept-encoding: identity".
// A put with ifMatch fails unless it matches the stored (strong) ETag.
function fakeBlob({ honourIdentity = true } = {}) {
  const m = new Map();
  let n = 0;
  return {
    m,
    async put(path, body, o) {
      const cur = m.get(path);
      if (o.allowOverwrite === false && cur) throw new Error('This blob already exists');
      if (o.ifMatch !== undefined && (!cur || o.ifMatch !== cur.etag)) throw new BlobPreconditionFailedError();
      const etag = `"e${++n}"`;
      m.set(path, { body, etag, at: new Date() });
      return { pathname: path, etag };
    },
    async get(path, o) {
      const cur = m.get(path);
      if (!cur) return null;
      const identity = honourIdentity && !!o.headers && o.headers['accept-encoding'] === 'identity';
      const etag = cur.body.length >= 1024 && !identity ? `W/${cur.etag}` : cur.etag;
      return { statusCode: 200, stream: new Response(cur.body).body, blob: { etag } };
    },
    async list({ prefix }) {
      const blobs = [...m.entries()].filter(([p]) => p.startsWith(prefix)).map(([p, e]) => ({ pathname: p, uploadedAt: e.at, size: e.body.length }));
      return { blobs, hasMore: false };
    },
    async del(path) { m.delete(path); },
  };
}

test('blobStore: a lead over 1 KB is saved again and again (compressed read, weak ETag)', async () => {
  const blob = fakeBlob();
  const store = blobStore(blob);
  const need = 'x'.repeat(1500);
  assert.equal((await upsertLead(store, 'TEST-big', () => ({ lead: { need, n: 1 } }))).written, true);
  for (let i = 2; i <= 5; i++) {
    const out = await upsertLead(store, 'TEST-big', (cur) => ({ lead: { ...cur, n: cur.n + 1 } }));
    assert.equal(out.written, true);
  }
  assert.equal((await store.read('TEST-big')).lead.n, 5);
  assert.deepEqual((await store.list('TEST-')).map((r) => r.id), ['TEST-big']);
  await store.remove('TEST-big');
  assert.equal(await store.read('TEST-big'), null);
});

test('blobStore: a weak ETag is a clear error, not a retry loop', async () => {
  const store = blobStore(fakeBlob({ honourIdentity: false }));
  await upsertLead(store, 'TEST-big', () => ({ lead: { need: 'x'.repeat(1500), n: 1 } }));
  await assert.rejects(upsertLead(store, 'TEST-big', (cur) => ({ lead: { ...cur, n: 2 } })), /weak ETag/);
});

test('bookingRequest: Cal.com v2 shape with phone and lead link', () => {
  const r = bookingRequest({ eventTypeId: 8002444, startMs: Date.parse('2026-11-22T16:00:00.000+05:30'), name: 'Asha', email: 'asha@example.com', phone: '+919876543210', notes: 'Needs a bot.', leadId: 'vl_1', conversationId: 'conv_1' });
  assert.equal(r.url, 'https://api.cal.com/v2/bookings');
  assert.equal(r.headers['cal-api-version'], '2024-08-13');
  assert.equal(r.body.start, '2026-11-22T10:30:00.000Z');
  assert.deepEqual(r.body.attendee, { name: 'Asha', email: 'asha@example.com', timeZone: 'Asia/Kolkata', language: 'en', phoneNumber: '+919876543210' });
  assert.deepEqual(r.body.bookingFieldsResponses, { notes: 'Needs a bot.', attendeePhoneNumber: '+919876543210' });
  assert.deepEqual(r.body.metadata, { lead_id: 'vl_1', conversation_id: 'conv_1', source: 'voice' });
});

// ---------- handlers ----------
test('save_field x6: one record with all fields (check b)', async () => {
  const d = deps();
  const id = conv('b');
  for (const [k, v] of [['name', 'Asha'], ['phone', '9876543210'], ['email', 'asha@example.com'], ['need', 'Booking bot'], ['timeline', 'Next month'], ['team_size', '12']]) {
    const j = await (await save(d, id, k, v)).json();
    assert.equal(j.ok, true, k);
  }
  assert.equal(d.store.m.size, 1);
  const lead = (await d.store.read(id)).lead;
  assert.deepEqual(Object.keys(lead.fields).sort(), ['email', 'name', 'need', 'phone', 'team_size', 'timeline']);
  assert.equal(lead.source, 'voice');
  assert.equal(lead.status, 'full');
  assert.equal(lead.conversation_id, id);
});

test('save_field: wrong secret, no secret, wrong agent, bad id: refused, nothing stored (check f)', async () => {
  const d = deps();
  assert.equal((await save(d, conv('f'), 'name', 'X', { secret: 'wrong' })).status, 401);
  assert.equal((await save(d, conv('f'), 'name', 'X', { secret: '' })).status, 401);
  const wa = await saveField(toolReq('/api/voice/save-field', { conversation_id: conv('f'), agent_id: 'agent_other', key: 'name', value: 'X' }), d);
  assert.equal(wa.status, 403);
  const bad = await saveField(toolReq('/api/voice/save-field', { conversation_id: '../../x', agent_id: CFG.agentId, key: 'name', value: 'X' }), d);
  assert.equal(bad.status, 400);
  const notJson = await saveField(new Request('https://voice.test/x', { method: 'POST', headers: { 'x-voice-tool-secret': CFG.toolSecret }, body: '{' }), d);
  assert.equal(notJson.status, 400);
  assert.equal(d.store.m.size, 0);
});

test('save_field: per conversation cap and per IP rate limit (check g)', async () => {
  const d = deps();
  const id = conv('g');
  for (let i = 0; i < MAX_SAVES; i++) assert.equal((await (await save(d, id, 'need', `v${i}`)).json()).ok, true);
  const capped = await (await save(d, id, 'need', 'one more')).json();
  assert.equal(capped.ok, false);
  assert.equal(capped.code, 'too_many_saves');
  assert.equal((await d.store.read(id)).lead.fields.need.value, `v${MAX_SAVES - 1}`);
  const d2 = deps({ limits: { ip: createLimiter({ limit: 2, windowMs: 60000 }), conv: createLimiter({ limit: 1000, windowMs: 60000 }) } });
  await save(d2, conv('g2'), 'name', 'A');
  await save(d2, conv('g2'), 'name', 'B');
  assert.equal((await save(d2, conv('g2'), 'name', 'C')).status, 429);
  assert.equal((await d2.store.read(conv('g2'))).lead.fields.name.value, 'B');
});

test('check_slots: every free slot (80 max) in India time, sorted; empty and Cal.com error answers kept (check a)', async () => {
  const d = deps();
  const ask = (dd) => checkSlots(toolReq('/api/voice/check-slots', { conversation_id: conv('a'), agent_id: CFG.agentId }), dd);
  const j = await (await ask(d)).json();
  assert.equal(j.ok, true);
  assert.equal(j.today, 'Saturday 21 Nov');
  assert.equal(j.time_zone, 'Asia/Kolkata');
  assert.equal(j.slots.length, 80);
  assert.equal(j.slots[1].label, 'Saturday 21 Nov, 3:30 pm');
  assert.deepEqual(j.slots[2], { label: 'Sunday 22 Nov, 10 am', start: '2026-11-22T10:00:00.000+05:30' });
  assert.deepEqual(j.slots[3], { label: 'Sunday 22 Nov, 10:30 am', start: '2026-11-22T10:30:00.000+05:30' });
  assert.ok(j.slots.every((s, i) => i === 0 || Date.parse(s.start) > Date.parse(j.slots[i - 1].start)));
  assert.equal(j.note, undefined);
  assert.equal(d.cal.calls[0][1].timeZone, 'Asia/Kolkata');
  const few = calSlots();
  for (const day of ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28']) delete few[day];
  const all = await (await ask(deps({ cal: fakeCal({ data: few }) }))).json();
  assert.equal(all.slots.length, 2 + 16, 'every free slot when under the cap');
  const none = await (await ask(deps({ cal: fakeCal({ data: { '2026-11-21': [{ start: '2026-11-21T09:00:00.000+05:30' }] } }) }))).json();
  assert.deepEqual(none, { ok: true, today: 'Saturday 21 Nov', time_zone: 'Asia/Kolkata', slots: [], note: 'No free times in the next 7 days.' });
  const bad = await (await checkSlots(toolReq('/api/voice/check-slots', { conversation_id: conv('a'), agent_id: CFG.agentId }), deps({ cal: fakeCal({ fail: true }) }))).json();
  assert.deepEqual(bad, { ok: false, slots: [], reason: 'The calendar is not reachable right now.' });
  assert.equal((await checkSlots(toolReq('/api/voice/check-slots', { conversation_id: conv('a'), agent_id: CFG.agentId }, { secret: 'nope' }), d)).status, 401);
});

test('book_call TEST- dry run: returns the would-be request, books and stores nothing (check e)', async () => {
  const d = deps();
  const id = conv('e');
  await save(d, id, 'phone', '9876543210');
  const before = JSON.stringify((await d.store.read(id)).lead);
  const start = '2026-11-22T16:00:00.000+05:30';
  const j = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: id, agent_id: CFG.agentId, start, name: 'Asha', email: 'asha@example.com', summary: 'Wants a booking bot.' }), d)).json();
  assert.equal(j.ok, true);
  assert.equal(j.dry_run, true);
  assert.equal(j.label, 'Sunday 22 Nov, 4 pm');
  assert.equal(j.would_send.body.start, '2026-11-22T10:30:00.000Z');
  assert.equal(j.would_send.body.attendee.phoneNumber, '+919876543210', 'phone filled from the saved lead');
  assert.equal(j.would_send.body.bookingFieldsResponses.notes, 'Wants a booking bot.');
  assert.equal(j.would_send.body.metadata.conversation_id, id);
  assert.equal(d.cal.calls.filter((c) => c[0] === 'book').length, 0);
  assert.equal(JSON.stringify((await d.store.read(id)).lead), before);
});

test('book_call: slot not on the fresh list and missing email are refused (check e)', async () => {
  const d = deps();
  const off = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: conv('e2'), agent_id: CFG.agentId, start: '2026-11-22T16:15:00+05:30', name: 'A', email: 'a@example.com', summary: 's' }), d)).json();
  assert.equal(off.ok, false);
  assert.equal(off.code, 'slot_not_free');
  const noMail = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: conv('e2'), agent_id: CFG.agentId, start: '2026-11-22T16:00:00.000+05:30', name: 'A', summary: 's' }), d)).json();
  assert.equal(noMail.code, 'email_missing');
  const badMail = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: conv('e2'), agent_id: CFG.agentId, start: '2026-11-22T16:00:00.000+05:30', name: 'A', email: 'a at b', summary: 's' }), d)).json();
  assert.equal(badMail.code, 'email_invalid');
  const past = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: conv('e2'), agent_id: CFG.agentId, start: '2026-11-21T09:00:00.000+05:30', name: 'A', email: 'a@example.com', summary: 's' }), d)).json();
  assert.equal(past.code, 'slot_not_free');
  assert.equal(d.store.m.size, 0);
});

test('book_call real path (fake Cal.com): books once, links uid to the lead, second call returns the same', async () => {
  const d = deps();
  const id = 'conv_unit_real_1';
  await save(d, id, 'name', 'Asha');
  const body = { conversation_id: id, agent_id: CFG.agentId, start: '2026-11-23T11:00:00.000+05:30', email: 'asha@example.com', phone: '98765 43210', summary: 'Bot.' };
  const j = await (await bookCall(toolReq('/api/voice/book-call', body), d)).json();
  assert.equal(j.ok, true);
  assert.equal(j.booked, true);
  const sent = d.cal.calls.find((c) => c[0] === 'book')[1];
  assert.equal(sent.attendee.name, 'Asha', 'name filled from the saved lead');
  assert.equal(sent.metadata.lead_id, (await d.store.read(id)).lead.lead_id);
  const lead = (await d.store.read(id)).lead;
  assert.deepEqual({ uid: lead.booking.uid, start: lead.booking.start }, { uid: 'bk_unit_1', start: '2026-11-23T11:00:00.000+05:30' });
  assert.equal(lead.fields.email.value, 'asha@example.com');
  const again = await (await bookCall(toolReq('/api/voice/book-call', body), d)).json();
  assert.equal(again.already_booked, true);
  assert.equal(d.cal.calls.filter((c) => c[0] === 'book').length, 1);
});

test('call_end: partial lead finalized; hang-up with no saves still makes a lead (check c)', async () => {
  const d = deps();
  const id = conv('c');
  await save(d, id, 'name', 'Asha');
  await save(d, id, 'need', 'Booking bot');
  const r = await callEnd(hookReq(postCall(id, { reason: 'Client disconnected' })), d);
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.status, 'partial');
  const lead = (await d.store.read(id)).lead;
  assert.equal(lead.status, 'partial');
  assert.ok(lead.finalized_at);
  assert.equal(lead.alert.status, 'skipped');
  assert.equal(lead.alert.reason, 'test lead');
  const silent = conv('c-silence');
  await callEnd(hookReq(postCall(silent, { reason: 'Silence timeout', summary: '' })), d);
  assert.equal((await d.store.read(silent)).lead.status, 'partial');
});

test('call_end: visitor flag on a responded call, a silent call and a hang-up with partial fields, saves or not (check c2)', async () => {
  const d = deps();
  const logs = [];
  d.log = (event, data) => logs.push([event, data]);
  const answered = conv('c2-answered');
  await callEnd(hookReq(postCall(answered, { reason: 'Client disconnected', transcript: [{ role: 'agent', message: 'Hi' }, { role: 'user', message: 'Just looking, thanks' }] })), d);
  const a = (await d.store.read(answered)).lead;
  assert.deepEqual([a.call.visitor_responded, a.call.visitor_turns, a.saves, a.status], [true, 1, 0, 'partial']);
  const silent = conv('c2-silent');
  await callEnd(hookReq(postCall(silent, { reason: 'Silence timeout', summary: '', transcript: [{ role: 'agent', message: 'Hello?' }, { role: 'user', message: '...' }, { role: 'agent', message: 'Bye' }] })), d);
  const s = (await d.store.read(silent)).lead;
  assert.deepEqual([s.call.visitor_responded, s.call.visitor_turns, s.saves, s.status], [false, 0, 0, 'partial']);
  const hang = conv('c2-hangup');
  await save(d, hang, 'name', 'Asha');
  await save(d, hang, 'need', 'Booking bot');
  await callEnd(hookReq(postCall(hang, { reason: 'Client disconnected', transcript: [{ role: 'agent', message: 'Hi' }, { role: 'user', message: 'I am Asha' }, { role: 'user', message: 'A booking bot' }] })), d);
  const h = (await d.store.read(hang)).lead;
  assert.deepEqual([h.call.visitor_responded, h.call.visitor_turns, h.saves, h.status], [true, 2, 2, 'partial']);
  const line = logs.filter(([e]) => e === 'voice.call_end').map(([, x]) => [x.visitor_responded, x.visitor_turns]);
  assert.deepEqual(line, [[true, 1], [false, 0], [true, 2]], 'the call_end log line carries the flag and the count');
});

test('call_end: analysis fills the missing two, lead becomes full (check d)', async () => {
  const d = deps();
  const id = conv('d');
  await save(d, id, 'name', 'Asha');
  await save(d, id, 'need', 'Booking bot');
  const j = await (await callEnd(hookReq(postCall(id, { dc: { email: 'asha@example.com', phone: '+91 98765 43210' } })), d)).json();
  assert.equal(j.status, 'full');
  const lead = (await d.store.read(id)).lead;
  assert.equal(lead.fields.email.by, 'analysis');
  assert.equal(lead.completeness.pct, 100);
});

test('call_end: bad or missing signature is 401; other agent and other type are ignored; nothing stored (check f)', async () => {
  const d = deps();
  assert.equal((await callEnd(hookReq(postCall(conv('f1')), { secret: 'wrong-secret-xyz' }), d)).status, 401);
  assert.equal((await callEnd(hookReq(postCall(conv('f1')), { sig: '' }), d)).status, 401);
  assert.equal((await callEnd(hookReq(postCall(conv('f1')), { ts: Math.floor(NOW / 1000) - 3600 }), d)).status, 401);
  const other = await (await callEnd(hookReq(postCall(conv('f1'), { agentId: 'agent_other' })), d)).json();
  assert.equal(other.ignored, 'agent');
  const type = await (await callEnd(hookReq(postCall(conv('f1'), { type: 'post_call_audio' })), d)).json();
  assert.equal(type.ignored, 'type');
  assert.equal(d.store.m.size, 0);
});

test('call_end alert: one email per real lead, never for a test lead, skipped without a key', async () => {
  const sent = [];
  const sendEmail = async (msg) => { sent.push(msg); return { ok: true, status: 200 }; };
  const withKey = deps({ cfg: { ...CFG, resendKey: 're_unit' }, sendEmail });
  await callEnd(hookReq(postCall('conv_unit_alert_1', { dc: { name: 'Asha', email: 'asha@example.com' } })), withKey);
  await callEnd(hookReq(postCall('conv_unit_alert_1')), withKey);
  assert.equal(sent.length, 1, 'a repeat delivery sends nothing');
  assert.match(sent[0].subject, /Voice lead/);
  assert.equal(sent[0].replyTo, 'asha@example.com');
  assert.equal((await withKey.store.read('conv_unit_alert_1')).lead.alert.status, 'sent');
  await callEnd(hookReq(postCall(conv('alert'))), withKey);
  assert.equal(sent.length, 1, 'a test lead sends nothing');
  const noKey = deps();
  await callEnd(hookReq(postCall('conv_unit_alert_2')), noKey);
  assert.deepEqual(pick((await noKey.store.read('conv_unit_alert_2')).lead.alert, ['status', 'reason']), { status: 'skipped', reason: 'RESEND_API_KEY not set' });
});
const pick = (o, ks) => Object.fromEntries(ks.map((k) => [k, o[k]]));

test('leads view: password, list test leads only, read one, delete only TEST- leads (checks c, d, h)', async () => {
  const d = deps();
  await save(d, conv('v1'), 'name', 'A');
  await save(d, 'conv_unit_real_view', 'name', 'B');
  const no = await leadsGet(viewReq('?test=1', { pw: '' }), d);
  assert.equal(no.status, 401);
  assert.match(no.headers.get('www-authenticate') || '', /^Basic realm=/);
  assert.equal((await leadsGet(viewReq('?test=1', { pw: 'wrong' }), d)).status, 401);
  const list = await (await leadsGet(viewReq('?test=1'), d)).json();
  assert.deepEqual(list.leads.map((l) => l.conversation_id), [conv('v1')]);
  const count = await (await leadsGet(viewReq('?count=1'), d)).json();
  assert.deepEqual(count, { ok: true, count: 2 });
  const one = await (await leadsGet(viewReq(`?id=${conv('v1')}`), d)).json();
  assert.equal(one.lead.fields.name.value, 'A');
  assert.equal((await leadsGet(viewReq('?id=TEST-missing'), d)).status, 404);
  assert.equal((await leadsDelete(viewReq('?id=conv_unit_real_view', { method: 'DELETE' }), d)).status, 403);
  assert.equal((await leadsDelete(viewReq(`?id=${conv('v1')}`, { method: 'DELETE' }), d)).status, 200);
  assert.deepEqual((await (await leadsGet(viewReq('?test=1'), d)).json()).leads, []);
  assert.equal((await leadsGet(viewReq('?test=1'), d)).headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('leads stats: counts only, same password, ?since= and ?test=1 filters (2b)', async () => {
  const d = deps();
  const at = new Date(NOW).toISOString();
  const DAY_S = 86400;
  // s1: full, booked, the visitor spoke. Built with the pure rules (a TEST- booking is a dry run in book_call).
  let l = newLead({ conversationId: conv('s1'), agentId: CFG.agentId, at });
  for (const [k, v] of [['name', 'Asha'], ['email', 'asha@example.com'], ['phone', '9876543210'], ['need', 'Booking bot']]) l = applySave(l, k, v, at).lead;
  l = applyBooking(l, { uid: 'bk_s1', start: '2026-11-22T10:00:00.000+05:30', end: null, at });
  l = applyCallEnd(l, { data: postCall(conv('s1')).data, at });
  await d.store.create(conv('s1'), l);
  // s2: partial hang-up, the visitor spoke. s3: silent call 3 days ago. s4: saves only, no post-call yet. s5: a real (non-TEST) call.
  await save(d, conv('s2'), 'name', 'Ravi');
  await save(d, conv('s2'), 'need', 'CRM');
  await callEnd(hookReq(postCall(conv('s2'))), d);
  await callEnd(hookReq(postCall(conv('s3'), { reason: 'Silence timeout', transcript: [{ role: 'agent', message: 'Hello?' }], start: Math.floor(NOW / 1000) - 3 * DAY_S })), d);
  await save(d, conv('s4'), 'name', 'Meena');
  await callEnd(hookReq(postCall('conv_unit_real_s5')), d);
  const stats = async (qs, opts) => {
    const r = await leadsGet(viewReq(qs, opts), d);
    return { status: r.status, j: await r.json().catch(() => null), r };
  };
  assert.equal((await stats('?stats=1', { pw: '' })).status, 401);
  assert.equal((await stats('?stats=1', { pw: 'wrong' })).status, 401);
  const all = await stats('?stats=1');
  assert.equal(all.status, 200);
  assert.deepEqual(all.j, { ok: true, since: null, calls: 5, visitor_responded: 3, full: 1, partial: 4, booked: 1 });
  assert.equal(all.r.headers.get('x-robots-tag'), 'noindex, nofollow');
  const text = JSON.stringify(all.j);
  for (const pii of ['Asha', 'Ravi', 'Meena', '@', '+91', 'TEST-', 'conv_']) assert.equal(text.includes(pii), false, `no personal data or ids: ${pii}`);
  assert.deepEqual((await stats('?stats=1&test=1')).j, { ok: true, since: null, calls: 4, visitor_responded: 2, full: 1, partial: 3, booked: 1 });
  const since = new Date(NOW - 864e5).toISOString();
  assert.deepEqual((await stats(`?stats=1&since=${encodeURIComponent(since)}`)).j, { ok: true, since, calls: 4, visitor_responded: 3, full: 1, partial: 3, booked: 1 });
  assert.deepEqual((await stats('?stats=1&test=1&since=2026-11-21')).j, { ok: true, since: '2026-11-21T00:00:00.000Z', calls: 3, visitor_responded: 2, full: 1, partial: 2, booked: 1 });
  const bad = await stats('?stats=1&since=yesterday');
  assert.equal(bad.status, 400);
  assert.equal(bad.j.code, 'bad_since');
});

// ---------- Cal.com adapter and booking failure paths ----------
import { createCal } from '../api/_lib/voice-cal.js';

function fakeFetch(steps) {
  const seen = [];
  const f = async (url, init) => {
    seen.push({ url, init });
    const s = steps[Math.min(seen.length - 1, steps.length - 1)];
    if (s === 'timeout') { const e = new Error('t'); e.name = 'TimeoutError'; throw e; }
    return new Response(JSON.stringify(s.body || {}), { status: s.status });
  };
  f.seen = seen;
  return f;
}

test('createCal: key only on the wire, one retry on 5xx, short error codes', async () => {
  const ok = fakeFetch([{ status: 503 }, { status: 200, body: { status: 'success', data: { '2026-11-22': [{ start: '2026-11-22T16:00:00.000+05:30' }] } } }]);
  const r = await createCal({ apiKey: 'cal_secret_unit', eventTypeId: 8002444, fetchImpl: ok }).freeSlots({ ...slotWindow(NOW), retry: true });
  assert.equal(r.ok, true);
  assert.equal(ok.seen.length, 2);
  assert.equal(ok.seen[0].init.headers.Authorization, 'Bearer cal_secret_unit');
  assert.match(ok.seen[0].url, /eventTypeId=8002444/);
  assert.match(ok.seen[0].url, /timeZone=Asia%2FKolkata/);
  const auth = await createCal({ apiKey: 'k', eventTypeId: 1, fetchImpl: fakeFetch([{ status: 401 }]) }).freeSlots(slotWindow(NOW));
  assert.deepEqual([auth.ok, auth.code], [false, 'cal_auth']);
  assert.equal(JSON.stringify(auth).includes('stack'), false);
  const none = await createCal({ apiKey: '', eventTypeId: 1, fetchImpl: fakeFetch([{ status: 200 }]) }).freeSlots(slotWindow(NOW));
  assert.equal(none.code, 'not_configured');
  const req = bookingRequest({ eventTypeId: 1, startMs: NOW + 864e5, name: 'A', email: 'a@example.com', phone: '', notes: '', leadId: 'l', conversationId: 'c' });
  assert.equal(JSON.stringify(req).includes('Bearer'), false);
  assert.equal('phoneNumber' in req.body.attendee, false);
  const tout = await createCal({ apiKey: 'k', eventTypeId: 1, fetchImpl: fakeFetch(['timeout']) }).book(req.body);
  assert.deepEqual([tout.ok, tout.code, tout.unknown], [false, 'cal_timeout', true]);
  const refused = await createCal({ apiKey: 'k', eventTypeId: 1, fetchImpl: fakeFetch([{ status: 400, body: { error: 'x' } }]) }).book(req.body);
  assert.deepEqual([refused.ok, refused.code, refused.unknown], [false, 'cal_refused', undefined]);
});

test('book_call real path: a refused booking frees the claim; an unknown result blocks a second try', async () => {
  const body = (id) => ({ conversation_id: id, agent_id: CFG.agentId, start: '2026-11-23T11:00:00.000+05:30', name: 'Asha', email: 'asha@example.com', summary: 'Bot.' });
  const d = deps({ cal: fakeCal({ bookFail: true }) });
  const j = await (await bookCall(toolReq('/api/voice/book-call', body('conv_unit_refused')), d)).json();
  assert.deepEqual([j.ok, j.code], [false, 'cal_refused']);
  assert.equal((await d.store.read('conv_unit_refused')).lead.booking, null, 'claim released, another slot can be tried');
  const timeoutCal = { ...fakeCal(), async book() { return { ok: false, code: 'cal_timeout', reason: 'x', unknown: true }; } };
  const d2 = deps({ cal: timeoutCal });
  await bookCall(toolReq('/api/voice/book-call', body('conv_unit_unknown')), d2);
  assert.equal((await d2.store.read('conv_unit_unknown')).lead.booking.status, 'unknown');
  const again = await (await bookCall(toolReq('/api/voice/book-call', body('conv_unit_unknown')), d2)).json();
  assert.deepEqual([again.ok, again.code], [false, 'booking_unknown']);
});

test('book_call: a fresh pending claim blocks a parallel second booking', async () => {
  const d = deps();
  const id = 'conv_unit_pending';
  await d.store.create(id, { ...newLead({ conversationId: id, agentId: CFG.agentId, at: 'x' }), booking: { status: 'pending', start: '2026-11-23T11:00:00.000+05:30', at: new Date(NOW - 10_000).toISOString() } });
  const j = await (await bookCall(toolReq('/api/voice/book-call', { conversation_id: id, agent_id: CFG.agentId, start: '2026-11-23T11:00:00.000+05:30', name: 'A', email: 'a@example.com', summary: 's' }), d)).json();
  assert.deepEqual([j.ok, j.code], [false, 'booking_in_progress']);
  assert.equal(d.cal.calls.filter((c) => c[0] === 'book').length, 0);
});
