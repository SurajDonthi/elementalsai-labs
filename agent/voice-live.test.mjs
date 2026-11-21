// T-1, T-5 voice lead capture: live checks a–i against the voice TEST address (a Vercel preview, never production).
// Marked test data only: every conversation id starts with "TEST-", every test lead is deleted in i.
// Secrets come from the environment only and are never printed. Start it through the work harness, not by hand.
// Env: VOICE_TEST_BASE, VOICE_AGENT_ID, VOICE_TOOL_SECRET, ELEVENLABS_WEBHOOK_SECRET, VOICE_LEADS_KEY, VERCEL_BYPASS,
//      CAL_API_KEY (optional, read-only cross-check of the free slots).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { signElevenLabs } from '../api/_lib/voice-hmac.js';
import { slotLabel } from '../api/_lib/voice-slots.js';

const E = process.env;
for (const k of ['VOICE_TEST_BASE', 'VOICE_AGENT_ID', 'VOICE_TOOL_SECRET', 'ELEVENLABS_WEBHOOK_SECRET', 'VOICE_LEADS_KEY', 'VERCEL_BYPASS']) {
  if (!E[k]) throw new Error(`${k} is not set`);
}
const BASE = E.VOICE_TEST_BASE.replace(/\/$/, '');
if (/elementalsai-labs\.com/i.test(BASE)) throw new Error('The live tests never run against production.');
const AGENT = E.VOICE_AGENT_ID;
const SECRETS = [E.VOICE_TOOL_SECRET, E.ELEVENLABS_WEBHOOK_SECRET, E.VOICE_LEADS_KEY, E.VERCEL_BYPASS, E.CAL_API_KEY].filter((s) => s && s.length >= 8);
const RUN = Date.now().toString(36);
const conv = (s) => `TEST-t1-${RUN}-${s}`;
const DAY = 864e5;
const nowSecs = () => Math.floor(Date.now() / 1000);

// Output guard: a line that holds a secret is never printed.
function say(...parts) {
  const line = parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ');
  if (SECRETS.some((s) => line.includes(s))) throw new Error('A secret was about to be printed.');
  console.log(`    > ${line}`);
}

async function req(method, path, { headers = {}, body, bypass = true } = {}) {
  const h = { ...headers };
  if (bypass) h['x-vercel-protection-bypass'] = E.VERCEL_BYPASS;
  const r = await fetch(BASE + path, { method, headers: h, body, redirect: 'manual', signal: AbortSignal.timeout(30000) });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: r.status, json, text: text.slice(0, 400), headers: r.headers };
}

// A server tool call the way ElevenLabs sends it: JSON body, secret header, system variables in the body.
function tool(name, args, { secret = E.VOICE_TOOL_SECRET, agent = AGENT } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (secret != null) headers['x-voice-tool-secret'] = secret;
  const body = { ...args };
  if (agent != null) body.agent_id = agent;
  return req('POST', `/api/voice/${name}`, { headers, body: JSON.stringify(body) });
}
const save = (id, key, value) => tool('save-field', { conversation_id: id, key, value });

// A post-call webhook body like ElevenLabs post_call_transcription. transcript: [{ role: 'agent' | 'user', message }].
function hookBody(id, { analysis = {}, metadata = {}, agent = AGENT, transcript = [] } = {}) {
  return JSON.stringify({
    type: 'post_call_transcription',
    event_timestamp: nowSecs(),
    data: {
      agent_id: agent,
      conversation_id: id,
      status: 'done',
      ...(transcript === null ? {} : { transcript }),
      metadata: { start_time_unix_secs: nowSecs() - 180, call_duration_secs: 95, termination_reason: 'Client disconnected', ...metadata },
      analysis: {
        call_successful: 'success',
        transcript_summary: 'TEST summary.',
        call_summary_title: 'TEST call',
        data_collection_results: {},
        evaluation_criteria_results: {},
        ...analysis,
      },
    },
  });
}
function hook(raw, { sig = signElevenLabs(E.ELEVENLABS_WEBHOOK_SECRET, raw, nowSecs()) } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (sig) headers['ElevenLabs-Signature'] = sig;
  return req('POST', '/api/voice/call-end', { headers, body: raw });
}
const dc = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { data_collection_id: k, value: v, rationale: 'TEST' }]));
// Transcript turns. Each call's words carry an upper-case marker word (never in a run id), so the check can prove no words are stored.
const agentSays = (message, at) => ({ role: 'agent', message, time_in_call_secs: at });
const visitorSays = (message, at) => ({ role: 'user', message, time_in_call_secs: at });
const toolTurn = (name, at) => ({ role: 'agent', message: null, tool_calls: [{ tool_name: name }], time_in_call_secs: at });

const basic = (pw) => `Basic ${Buffer.from(`t1:${pw}`).toString('base64')}`;
const leads = (q, { method = 'GET', pw = E.VOICE_LEADS_KEY } = {}) => req(method, `/api/voice/leads${q}`, { headers: pw == null ? {} : { authorization: basic(pw) } });
async function readLead(id) {
  const r = await leads(`?id=${encodeURIComponent(id)}`);
  if (r.status === 404) return null;
  assert.equal(r.status, 200, r.text);
  return r.json.lead;
}
// Blob list can lag a write by a moment: ask again for up to about 6 seconds.
async function testList(check) {
  let r;
  for (let i = 0; i < 6; i++) {
    r = await leads('?test=1');
    assert.equal(r.status, 200, r.text);
    if (check(r.json)) return r.json;
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  return r.json;
}

const S = {};

test('a. check_slots: every free slot in the next 7 days (80 at most), India time, sorted, no doubles, none in the past', async () => {
  const t0 = Date.now();
  const r = await tool('check-slots', { conversation_id: conv('a') });
  const t1 = Date.now();
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.ok, true, r.text);
  assert.equal(r.json.time_zone, 'Asia/Kolkata');
  const slots = r.json.slots;
  assert.ok(Array.isArray(slots) && slots.length > 0 && slots.length <= 80, `slot count ${slots && slots.length}`);
  const ms = slots.map((s) => Date.parse(s.start));
  ms.forEach((m, i) => {
    assert.ok(Number.isFinite(m), `bad start ${slots[i].start}`);
    assert.ok(m > t0, `past slot ${slots[i].start}`);
    assert.ok(m <= t1 + 7 * DAY, `slot after 7 days ${slots[i].start}`);
    if (i) assert.ok(m > ms[i - 1], 'not sorted, or a double');
    assert.equal(slots[i].label, slotLabel(m), 'label is not India time');
    assert.match(slots[i].label, /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec), \d{1,2}(:\d{2})? (am|pm)$/);
  });
  const shownDays = new Set(slots.map((s) => s.label.split(',')[0]));
  if (E.CAL_API_KEY) {
    // Read-only cross-check: the list is exactly the Cal.com free slots in the 7 days, the first 80 in time order when there are more.
    // The server's "now" lies between t0 and t1, so a slot inside that gap, at either end of the window, may go either way.
    const q = new URLSearchParams({ eventTypeId: '8002444', start: new Date(t0).toISOString(), end: new Date(t1 + 7 * DAY + 60e3).toISOString(), timeZone: 'Asia/Kolkata' });
    const c = await fetch(`https://api.cal.com/v2/slots?${q}`, { headers: { Authorization: `Bearer ${E.CAL_API_KEY}`, 'cal-api-version': '2024-09-04' }, signal: AbortSignal.timeout(15000) });
    assert.equal(c.status, 200, 'Cal.com read failed');
    const data = (await c.json()).data || {};
    const free = [...new Set(Object.values(data).flat().map((s) => Date.parse(s.start)))].filter((m) => m > t0 && m <= t1 + 7 * DAY).sort((x, y) => x - y);
    const edge = free.filter((m) => m <= t1 || m > t0 + 7 * DAY);
    for (const m of ms) assert.ok(free.includes(m), `shown slot not free in Cal.com: ${new Date(m).toISOString()}`);
    for (const m of free) {
      if (edge.includes(m) || (ms.length === 80 && m > ms[79])) continue;
      assert.ok(ms.includes(m), `free slot missing from the list: ${new Date(m).toISOString()}`);
    }
    if (!edge.length) assert.deepEqual(ms, free.slice(0, 80), 'not every free slot, or not the first 80 in time order');
    const freeDays = new Set(free.map((m) => slotLabel(m).split(',')[0])).size;
    say(`Cal.com now: ${free.length} free slots on ${freeDays} days (${edge.length} at the window edge). Shown: ${slots.length} on ${shownDays.size} days, ${free.length > 80 ? 'the first 80' : 'all of them'}, all free in Cal.com.`);
  }
  S.slots = slots;
  const rows = [slots[0], slots[Math.floor(slots.length / 2)], slots[slots.length - 1]];
  say(`today ${r.json.today}, time zone ${r.json.time_zone}, ${slots.length} slots, days: ${[...shownDays].join(' | ')}`);
  for (const s of rows) say(`row: "${s.label}"  start ${s.start}`);
});

// A long need (about 600 characters) makes the record pass 1 KB at save 4, so saves 5 and 6 prove the large-record path
// (a compressed Blob read gives a weak ETag; the store must read uncompressed).
const NEED_B = `TEST need: ${'a booking app for a clinic with reminders, a waiting list and payments, '.repeat(8)}`.trim();

test('b. save_field 6 times for one conversation: one record with all fields', async () => {
  const id = conv('b');
  const saves = [
    ['name', 'TEST Lead B'],
    ['phone', '+91 90000 00002'],
    ['email', 'test.t1.b@example.com'],
    ['need', NEED_B],
    ['timeline', 'TEST: in 4 weeks'],
    ['team_size', '5 people'],
  ];
  for (const [key, value] of saves) {
    const r = await save(id, key, value);
    assert.equal(r.status, 200, r.text);
    assert.equal(r.json.ok, true, r.text);
    assert.equal(r.json.key, key);
    assert.equal(r.json.confirmed, undefined, `${key} should be confirmed`);
  }
  const lead = await readLead(id);
  assert.ok(lead, 'no record');
  assert.deepEqual(Object.keys(lead.fields).sort(), saves.map((s) => s[0]).sort());
  assert.equal(lead.fields.name.value, 'TEST Lead B');
  assert.equal(lead.fields.phone.value, '+919000000002');
  assert.equal(lead.fields.phone.confirmed, true);
  assert.equal(lead.fields.email.value, 'test.t1.b@example.com');
  assert.equal(lead.fields.email.confirmed, true);
  assert.equal(lead.fields.team_size.value, '5 people');
  assert.equal(lead.fields.need.value, NEED_B);
  const bytes = Buffer.byteLength(JSON.stringify(lead));
  assert.ok(bytes > 1200, `the record should pass 1 KB (is ${bytes} bytes)`);
  assert.equal(lead.conversation_id, id);
  assert.equal(lead.source, 'voice');
  assert.equal(lead.test, true);
  assert.equal(lead.saves, 6);
  assert.equal(lead.status, 'full');
  assert.equal(lead.booking, null);
  assert.match(lead.lead_id, /^vl_[0-9a-f]{16}$/);
  const list = await testList((j) => j.leads.some((l) => l.conversation_id === id));
  assert.equal(list.leads.filter((l) => l.conversation_id === id).length, 1, 'not exactly one record');
  say(`one record ${lead.lead_id}: keys ${Object.keys(lead.fields).join(', ')}; phone ${lead.fields.phone.value} (heard "${lead.fields.phone.raw}"); need ${lead.fields.need.value.length} chars; record ${bytes} bytes; status ${lead.status}; saves ${lead.saves}`);
});

test('c. PARTIAL lead: name and need only, finalized by a signed post-call payload (hang-up)', async () => {
  const id = conv('c');
  for (const [key, value] of [['name', 'TEST Lead C'], ['need', 'TEST need: a new website']]) {
    const r = await save(id, key, value);
    assert.equal(r.json.ok, true, r.text);
  }
  const raw = hookBody(id, {
    metadata: { termination_reason: 'Client disconnected', call_duration_secs: 48 },
    transcript: [
      agentSays('TEST: Hi! What should I call you? (KIWI)', 0),
      visitorSays('TEST KIWI: call me Lead C', 4),
      toolTurn('save_field', 6),
      agentSays('TEST: And what do you need? (KIWI)', 7),
      visitorSays('TEST KIWI: a new website', 12),
      toolTurn('save_field', 14),
      visitorSays('...', 30),
    ],
    analysis: {
      transcript_summary: 'TEST: the caller gave a name and a need, then hung up.',
      data_collection_results: dc({ name: 'TEST Lead C', need: 'TEST need: a new website', email: null, phone: null }),
    },
  });
  const r = await hook(raw);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.ok, true, r.text);
  assert.equal(r.json.status, 'partial');
  assert.equal(r.json.alert, 'skipped');
  const lead = await readLead(id);
  assert.equal(lead.status, 'partial');
  assert.deepEqual(lead.completeness.missing, ['email', 'phone']);
  assert.equal(lead.call.termination_reason, 'Client disconnected');
  assert.equal(lead.call.duration_secs, 48);
  assert.equal(lead.analysis.summary, 'TEST: the caller gave a name and a need, then hung up.');
  assert.deepEqual(lead.analysis.filled, []);
  assert.equal(lead.alert.status, 'skipped');
  assert.equal(lead.alert.reason, 'test lead');
  assert.ok(lead.finalized_at);
  assert.equal(lead.booking, null);
  assert.equal(lead.call.visitor_responded, true, 'the visitor spoke');
  assert.equal(lead.call.visitor_turns, 2, 'two turns with words; "..." does not count');
  assert.equal(JSON.stringify(lead).includes('KIWI'), false, 'no transcript words are stored');
  say(`read back: status ${lead.status}, missing ${lead.completeness.missing.join(' + ')}, ended "${lead.call.termination_reason}", visitor_responded ${lead.call.visitor_responded} (${lead.call.visitor_turns} turns), alert ${lead.alert.status} (${lead.alert.reason}), no booking, no words stored`);
});

test('d. FULL lead: all four, finalized (silence); a repeat delivery changes nothing', async () => {
  const id = conv('d');
  for (const [key, value] of [['name', 'TEST Lead D'], ['email', 'test.t1.d@example.com'], ['phone', '9000000004'], ['need', 'TEST need: an AI voice agent']]) {
    const r = await save(id, key, value);
    assert.equal(r.json.ok, true, r.text);
  }
  const raw = hookBody(id, {
    metadata: { termination_reason: 'Silence timeout', call_duration_secs: 210 },
    transcript: [
      agentSays('TEST: Hi! What should I call you? (MANGO)', 0),
      visitorSays('TEST MANGO: Lead D', 3),
      visitorSays('TEST MANGO: my email is test dot t1 dot d at example dot com', 20),
      visitorSays('TEST MANGO: 9000000004', 35),
      visitorSays('TEST MANGO: an AI voice agent for my clinic', 50),
      agentSays('TEST: Are you still there? (MANGO)', 120),
      visitorSays('...', 140),
      visitorSays('...', 200),
    ],
    analysis: {
      transcript_summary: 'TEST: the caller gave all details, then went silent.',
      data_collection_results: dc({ name: 'TEST Lead D', email: 'test.t1.d@example.com', phone: '9000000004', need: 'TEST need: an AI voice agent', business: 'TEST Clinic' }),
    },
  });
  const r = await hook(raw);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.status, 'full');
  assert.equal(r.json.alert, 'skipped');
  const lead = await readLead(id);
  assert.equal(lead.status, 'full');
  assert.equal(lead.completeness.pct, 100);
  assert.deepEqual(lead.completeness.missing, []);
  assert.equal(lead.fields.phone.value, '+919000000004');
  assert.deepEqual(lead.analysis.filled, ['business'], 'only the field the agent never saved is filled');
  assert.equal(lead.fields.business.by, 'analysis');
  assert.equal(lead.call.termination_reason, 'Silence timeout');
  assert.equal(lead.alert.status, 'skipped');
  assert.equal(lead.call.visitor_responded, true, 'the visitor spoke');
  assert.equal(lead.call.visitor_turns, 4);
  assert.equal(JSON.stringify(lead).includes('MANGO'), false, 'no transcript words are stored');
  const again = await hook(raw, { sig: signElevenLabs(E.ELEVENLABS_WEBHOOK_SECRET, raw, nowSecs()) });
  assert.equal(again.status, 200, again.text);
  const lead2 = await readLead(id);
  assert.equal(lead2.finalized_at, lead.finalized_at);
  assert.equal(lead2.status, 'full');
  assert.equal(lead2.saves, 4);
  assert.equal(lead2.alert.status, 'skipped');
  assert.equal(lead2.call.visitor_responded, true);
  assert.equal(lead2.call.visitor_turns, 4);
  say(`read back: status ${lead.status} (${lead.completeness.pct}%), filled by analysis: ${lead.analysis.filled.join(', ')}, ended "${lead.call.termination_reason}", visitor_responded ${lead.call.visitor_responded} (${lead.call.visitor_turns} turns), repeat delivery: same finalized_at`);
});

test('d2. post-call only (the agent saved nothing, hang-up, no booking): the lead is made from the analysis', async () => {
  const id = conv('d2');
  const raw = hookBody(id, {
    metadata: { termination_reason: 'Client disconnected', call_duration_secs: 30 },
    transcript: [
      agentSays('TEST: Hi! What should I call you? (PLUM)', 0),
      visitorSays('TEST PLUM: Lead D2, test dot t1 dot d2 at example dot com', 5),
      visitorSays('TEST PLUM: plus 91 90000 00006', 12),
      visitorSays('TEST PLUM: a CRM. Got to go, bye', 20),
    ],
    analysis: {
      call_successful: 'failure',
      transcript_summary: 'TEST: short call, the caller left early.',
      data_collection_results: dc({ name: 'TEST Lead D2', email: 'test.t1.d2@example.com', phone: '+91 90000 00006', need: 'TEST need: a CRM', timeline: 'not mentioned' }),
    },
  });
  const r = await hook(raw);
  assert.equal(r.status, 200, r.text);
  const lead = await readLead(id);
  assert.ok(lead, 'no record');
  assert.equal(lead.status, 'full');
  assert.deepEqual(lead.analysis.filled, ['name', 'phone', 'email', 'need']);
  assert.equal(lead.fields.timeline, undefined, '"not mentioned" must not become a value');
  assert.equal(lead.saves, 0);
  assert.equal(lead.booking, null);
  assert.equal(lead.alert.status, 'skipped');
  assert.equal(lead.call.visitor_responded, true);
  assert.equal(lead.call.visitor_turns, 3);
  assert.equal(JSON.stringify(lead).includes('PLUM'), false, 'no transcript words are stored');
  say(`read back: status ${lead.status}, filled ${lead.analysis.filled.join(', ')}, timeline "not mentioned" left out, saves ${lead.saves}, visitor_responded ${lead.call.visitor_responded} (${lead.call.visitor_turns} turns)`);
});

// T-5: a call where the visitor never says a word still gets a record, tagged visitor_responded false.
// d3 started 3 days ago, so the stats check can prove that ?since= counts from the call start.
const D3_START = nowSecs() - 3 * 86400;
test('d3. SILENT call (T-5): no saves, silence timeout, only "..." from the visitor: visitor_responded false, 0 turns', async () => {
  const id = conv('d3');
  const raw = hookBody(id, {
    metadata: { termination_reason: 'Silence timeout', call_duration_secs: 150, start_time_unix_secs: D3_START },
    transcript: [
      agentSays('TEST: Hi! I am Diya. What should I call you? (FIG)', 0),
      visitorSays('...', 20),
      agentSays('TEST: Are you still there? (FIG)', 21),
      visitorSays('...', 60),
      agentSays('TEST: I will end the call now. Bye! (FIG)', 140),
    ],
    analysis: {
      call_successful: 'failure',
      transcript_summary: 'TEST: the caller never spoke.',
      data_collection_results: dc({ name: null, email: null, phone: null, need: null }),
    },
  });
  const r = await hook(raw);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.ok, true, r.text);
  assert.equal(r.json.status, 'partial');
  const lead = await readLead(id);
  assert.ok(lead, 'no record');
  assert.equal(lead.saves, 0);
  assert.deepEqual(lead.fields, {});
  assert.equal(lead.call.termination_reason, 'Silence timeout');
  assert.equal(lead.call.duration_secs, 150);
  assert.equal(lead.call.started_at, new Date(D3_START * 1000).toISOString());
  assert.equal(lead.call.visitor_responded, false);
  assert.equal(lead.call.visitor_turns, 0);
  assert.equal(lead.alert.status, 'skipped');
  assert.equal(JSON.stringify(lead).includes('FIG'), false, 'no transcript words are stored');
  say(`read back: status ${lead.status}, saves ${lead.saves}, no fields, ended "${lead.call.termination_reason}" after ${lead.call.duration_secs} s, visitor_responded ${lead.call.visitor_responded} (${lead.call.visitor_turns} turns), started ${lead.call.started_at}`);
});

test('d4. HANG-UP before a word (T-5): no saves, no visitor turn: visitor_responded false, 0 turns', async () => {
  const id = conv('d4');
  const raw = hookBody(id, {
    metadata: { termination_reason: 'Client disconnected', call_duration_secs: 6 },
    transcript: [agentSays('TEST: Hi! I am Diya. What should I call you? (LIME)', 0)],
    analysis: { call_successful: 'failure', transcript_summary: 'TEST: the caller left at once.', data_collection_results: {} },
  });
  const r = await hook(raw);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.status, 'partial');
  const lead = await readLead(id);
  assert.ok(lead, 'no record');
  assert.equal(lead.saves, 0);
  assert.equal(lead.call.termination_reason, 'Client disconnected');
  assert.equal(lead.call.visitor_responded, false);
  assert.equal(lead.call.visitor_turns, 0);
  assert.equal(JSON.stringify(lead).includes('LIME'), false, 'no transcript words are stored');
  say(`read back: status ${lead.status}, saves ${lead.saves}, ended "${lead.call.termination_reason}", visitor_responded ${lead.call.visitor_responded} (${lead.call.visitor_turns} turns)`);
});

test('e. book_call dry run: the would-be request only; off-list slot, missing and bad email refused', async () => {
  assert.ok(S.slots && S.slots.length, 'needs the slots from a');
  const pick = S.slots[Math.min(1, S.slots.length - 1)];
  const id = conv('e');
  const args = { conversation_id: id, start: pick.start, name: 'TEST Lead E', email: 'test.t1.e@example.com', phone: '+91 90000 00005', summary: 'TEST: dry run, books nothing.' };
  const r = await tool('book-call', args);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.ok, true, r.text);
  assert.equal(r.json.dry_run, true);
  assert.equal(r.json.booked, false);
  assert.equal(r.json.label, pick.label);
  const w = r.json.would_send;
  assert.equal(w.method, 'POST');
  assert.equal(w.url, 'https://api.cal.com/v2/bookings');
  assert.equal(w.headers['cal-api-version'], '2024-08-13');
  assert.ok(!/authorization|bearer/i.test(JSON.stringify(w)), 'the dry run shows no key');
  assert.equal(w.body.eventTypeId, 8002444);
  assert.equal(Date.parse(w.body.start), Date.parse(pick.start));
  assert.equal(w.body.attendee.name, 'TEST Lead E');
  assert.equal(w.body.attendee.email, 'test.t1.e@example.com');
  assert.equal(w.body.attendee.timeZone, 'Asia/Kolkata');
  assert.equal(w.body.bookingFieldsResponses.attendeePhoneNumber, '+919000000005');
  assert.equal(w.body.bookingFieldsResponses.notes, 'TEST: dry run, books nothing.');
  assert.equal(w.body.metadata.conversation_id, id);
  assert.match(w.body.metadata.lead_id, /^vl_[0-9a-f]{16}$/);
  assert.equal(await readLead(id), null, 'a dry run writes nothing');
  // Nothing was booked: the same slot is still on the fresh Cal.com free list.
  const again = await tool('book-call', args);
  assert.equal(again.json.ok, true, again.text);
  assert.equal(again.json.dry_run, true);
  say(`dry run: "${r.json.label}" -> would POST ${w.url}, body ${JSON.stringify(w.body)}`);
  say('slot still free after the dry run (second dry run passed the fresh free list); no lead written');

  const off = await tool('book-call', { ...args, start: new Date(Date.parse(pick.start) + 7 * 60e3).toISOString() });
  assert.equal(off.json.ok, false);
  assert.equal(off.json.code, 'slot_not_free');
  const past = await tool('book-call', { ...args, start: new Date(Date.now() - 3600e3).toISOString() });
  assert.equal(past.json.code, 'slot_not_free');
  const words = await tool('book-call', { ...args, start: 'Sunday at 4 pm' });
  assert.equal(words.json.code, 'slot_invalid');
  const noEmail = await tool('book-call', { conversation_id: conv('e2'), start: pick.start, name: 'TEST Lead E2', summary: 'TEST' });
  assert.equal(noEmail.json.ok, false);
  assert.equal(noEmail.json.code, 'email_missing');
  const badEmail = await tool('book-call', { ...args, email: 'test at example' });
  assert.equal(badEmail.json.code, 'email_invalid');
  const noName = await tool('book-call', { conversation_id: conv('e2'), start: pick.start, email: 'test.t1.e2@example.com', summary: 'TEST' });
  assert.equal(noName.json.code, 'name_missing');
  // An unclear email is saved as heard, marked unconfirmed, and never used to book.
  const heard = await save(conv('e3'), 'email', 'test dot t1 at example');
  assert.equal(heard.json.ok, true, heard.text);
  assert.equal(heard.json.confirmed, false);
  const e3 = await readLead(conv('e3'));
  assert.equal(e3.fields.email.confirmed, false);
  assert.equal(e3.fields.email.value, 'test dot t1 at example');
  const unconfirmed = await tool('book-call', { conversation_id: conv('e3'), start: pick.start, name: 'TEST Lead E3', summary: 'TEST' });
  assert.equal(unconfirmed.json.code, 'email_missing');
  say(`refused: +7 min slot -> ${off.json.code}; past -> ${past.json.code}; "Sunday at 4 pm" -> ${words.json.code}; no email -> ${noEmail.json.code}; bad email -> ${badEmail.json.code}; no name -> ${noName.json.code}; unconfirmed saved email -> ${unconfirmed.json.code}`);
});

test('f. wrong secret, no secret, bad signature: 401 and nothing stored', async () => {
  const id = conv('f');
  const results = [];
  const expect = async (label, p, status, code) => {
    const r = await p;
    assert.equal(r.status, status, `${label}: ${r.status} ${r.text}`);
    if (code) assert.equal(r.json && r.json.code, code, `${label}: ${r.text}`);
    results.push(`${label} ${r.status}`);
    return r;
  };
  await expect('save_field, no secret:', tool('save-field', { conversation_id: id, key: 'name', value: 'TEST F' }, { secret: null }), 401, 'unauthorized');
  await expect('save_field, wrong secret:', tool('save-field', { conversation_id: id, key: 'name', value: 'TEST F' }, { secret: 'wrong-secret-0123456789' }), 401, 'unauthorized');
  await expect('check_slots, no secret:', tool('check-slots', { conversation_id: id }, { secret: null }), 401, 'unauthorized');
  await expect('book_call, wrong secret:', tool('book-call', { conversation_id: id, start: S.slots[0].start, name: 'TEST F', email: 'test.t1.f@example.com' }, { secret: 'wrong-secret-0123456789' }), 401, 'unauthorized');
  await expect('save_field, other agent id:', tool('save-field', { conversation_id: id, key: 'name', value: 'TEST F' }, { agent: 'agent_not_this_one_0000' }), 403, 'wrong_agent');
  const raw = hookBody(id, { analysis: { data_collection_results: dc({ name: 'TEST F', email: 'test.t1.f@example.com', phone: '9000000007', need: 'TEST' }) } });
  await expect('call-end, wrong key signature:', hook(raw, { sig: signElevenLabs('whsec_wrong_0123456789', raw, nowSecs()) }), 401, 'unauthorized');
  await expect('call-end, no signature:', hook(raw, { sig: null }), 401, 'unauthorized');
  await expect('call-end, 2 h old signature:', hook(raw, { sig: signElevenLabs(E.ELEVENLABS_WEBHOOK_SECRET, raw, nowSecs() - 7200) }), 401, 'unauthorized');
  const tampered = raw.replace('TEST F', 'TEST X');
  await expect('call-end, body changed after signing:', hook(tampered, { sig: signElevenLabs(E.ELEVENLABS_WEBHOOK_SECRET, raw, nowSecs()) }), 401, 'unauthorized');
  const other = await expect('call-end, signed but other agent:', hook(hookBody(id, { agent: 'agent_not_this_one_0000' })), 200);
  assert.equal(other.json.ignored, 'agent');
  const noPw = await expect('read view, no password:', leads(`?id=${id}`, { pw: null }), 401);
  assert.match(noPw.headers.get('www-authenticate') || '', /^Basic /);
  await expect('read view, wrong password:', leads(`?id=${id}`, { pw: 'wrong-password-0123' }), 401);
  const gate = await req('POST', '/api/voice/save-field', { headers: { 'content-type': 'application/json', 'x-voice-tool-secret': E.VOICE_TOOL_SECRET }, body: '{}', bypass: false });
  assert.ok([301, 302, 303, 307, 308, 401, 403].includes(gate.status), `no bypass header: ${gate.status}`);
  assert.ok(!(gate.json && 'ok' in gate.json), 'the request reached the function without the bypass');
  results.push(`no Vercel bypass header ${gate.status} (stopped by Vercel)`);
  const wrongMethod = await req('GET', '/api/voice/save-field');
  assert.equal(wrongMethod.status, 405);
  results.push(`GET on a tool ${wrongMethod.status}`);
  assert.equal(await readLead(id), null, 'something was stored');
  say(results.join('; '));
  say(`lead ${id}: not found (nothing stored)`);
});

test('g. spam guard: rate limit per conversation', async () => {
  const id = conv('g');
  let convLimitedAt = 0;
  for (let i = 1; i <= 70; i++) {
    const r = await save(id, '!!!', 'x');
    if (r.status === 429) {
      assert.equal(r.json.code, 'rate_limited');
      convLimitedAt = i;
      break;
    }
    assert.equal(r.status, 200, r.text);
    assert.equal(r.json.code, 'bad_key');
  }
  assert.equal(convLimitedAt, 61, `per-conversation limit hit at ${convLimitedAt}`);
  assert.equal(await readLead(id), null);
  say(`per conversation: calls 1-60 answered, call ${convLimitedAt} -> 429 rate_limited; nothing stored`);
});

// TODO, not a pass: the IP limiter is in memory per function instance, and Vercel spreads a burst over instances.
// The burst still runs, so the report shows what really happens. Fix needs a shared counter (Archie decides).
test('g2. spam guard: rate limit per IP', { todo: 'per-IP limit is per function instance; not proven live (gap for Archie)' }, async () => {
  // Per IP: the IP limit is checked before anything else, so unsigned calls are enough (they cost no reads).
  // Sent 10 at a time so the burst fits inside the 1-minute window (the function runs in the US, about 0.3 s a call).
  let ipLimitedAt = 0;
  let sent = 0;
  let limited = 0;
  const t1 = Date.now();
  while (sent < 400 && !ipLimitedAt) {
    const batch = await Promise.all(Array.from({ length: 10 }, () => tool('save-field', { conversation_id: conv('g2'), key: 'name', value: 'x' }, { secret: null })));
    for (const r of batch) {
      sent++;
      if (r.status === 429) {
        assert.equal(r.json.code, 'rate_limited');
        limited++;
        if (!ipLimitedAt) ipLimitedAt = sent;
      } else {
        assert.equal(r.status, 401, r.text);
      }
    }
  }
  say(`per IP: ${sent} unsigned calls in ${Math.round((Date.now() - t1) / 1000)} s (after the 61 above); first 429 at ${ipLimitedAt ? 61 + ipLimitedAt : 'none'}; ${limited} refused (limit 300/min per instance)`);
  assert.ok(ipLimitedAt > 0, `per-IP limit never hit in ${sent} calls`);
  assert.ok(61 + ipLimitedAt <= 320, `per-IP limit hit late: call ${61 + ipLimitedAt} in the minute`);
});

// T-5: this run's test leads: b full (no call end), c partial + spoke, d full + spoke, d2 full + spoke,
// d3 partial + silent (started 3 days ago), d4 partial + silent, e3 partial (no call end). No live booking (book_call is a dry run).
const MINE = ['b', 'c', 'd', 'd2', 'd3', 'd4', 'e3'];
const STATS_KEYS = ['ok', 'since', 'calls', 'visitor_responded', 'full', 'partial', 'booked'];
test('h. stats (T-5): counts only, same password; ?since= and ?test=1 filters', async () => {
  const list = await testList((j) => j.count >= MINE.length);
  assert.deepEqual(list.leads.map((l) => l.conversation_id).sort(), MINE.map(conv).sort(), 'the test leads are exactly the ones this run made');
  const r = await leads('?stats=1&test=1');
  assert.equal(r.status, 200, r.text);
  assert.deepEqual(Object.keys(r.json), STATS_KEYS);
  assert.deepEqual(r.json, { ok: true, since: null, calls: 7, visitor_responded: 3, full: 3, partial: 4, booked: 0 });
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow');
  const since = new Date(Date.now() - DAY).toISOString();
  const r2 = await leads(`?stats=1&test=1&since=${encodeURIComponent(since)}`);
  assert.equal(r2.status, 200, r2.text);
  assert.deepEqual(r2.json, { ok: true, since, calls: 6, visitor_responded: 3, full: 3, partial: 3, booked: 0 }, 'd3 (started 3 days ago) is left out');
  const day = await leads('?stats=1&test=1&since=2026-01-01');
  assert.equal(day.status, 200, day.text);
  assert.equal(day.json.since, '2026-01-01T00:00:00.000Z');
  assert.equal(day.json.calls, 7);
  for (const t of [r.text, r2.text, day.text]) {
    assert.ok(!/TEST|Lead|@|\+91|vl_|conversation|name|email|phone/i.test(t), `personal data or ids in the stats: ${t}`);
  }
  const all = await leads('?stats=1');
  assert.equal(all.status, 200, all.text);
  assert.deepEqual(Object.keys(all.json), STATS_KEYS);
  assert.ok(all.json.calls >= 7, 'all voice leads include the test leads');
  const bad = await leads('?stats=1&since=yesterday');
  assert.equal(bad.status, 400);
  assert.equal(bad.json.code, 'bad_since');
  const noPw = await leads('?stats=1&test=1', { pw: null });
  assert.equal(noPw.status, 401);
  assert.match(noPw.headers.get('www-authenticate') || '', /^Basic /);
  assert.equal(noPw.json, undefined, 'no counts without the password');
  const wrongPw = await leads('?stats=1', { pw: 'wrong-password-0123' });
  assert.equal(wrongPw.status, 401);
  say(`?stats=1&test=1 -> ${JSON.stringify(r.json)}`);
  say(`&since=${since} -> ${JSON.stringify(r2.json)}`);
  say(`?stats=1 (all voice leads) -> calls ${all.json.calls}; since=2026-01-01 -> since ${day.json.since}, calls ${day.json.calls}; since=yesterday -> ${bad.status} ${bad.json.code}; no password -> ${noPw.status}; wrong password -> ${wrongPw.status}`);
});

test('i. delete every test lead; the list shows none left', async () => {
  const before = await testList((j) => j.count >= MINE.length);
  assert.ok(before.leads.every((l) => l.test === true && l.conversation_id.startsWith('TEST-')));
  say(`test leads before: ${before.count} (${before.leads.map((l) => `${l.conversation_id.split('-').pop()}=${l.status}`).join(', ')})`);
  const del = await leads('?test=1', { method: 'DELETE' });
  assert.equal(del.status, 200, del.text);
  assert.equal(del.json.deleted, before.count);
  const left = await leads('?test=1&count=1');
  assert.equal(left.json.count, 0);
  const all = await leads('?count=1');
  assert.equal(all.status, 200);
  const real = await leads('?id=conv_not_a_test_lead', { method: 'DELETE' });
  assert.equal(real.status, 403);
  assert.equal(real.json.code, 'test_leads_only');
  say(`deleted ${del.json.deleted}; test leads left ${left.json.count}; all voice leads now ${all.json.count} (count only); deleting a non-TEST id -> ${real.status} ${real.json.code}`);
});

// Safety net: whatever failed above, no test lead is left behind.
after(async () => {
  const del = await leads('?test=1', { method: 'DELETE' });
  const left = await leads('?test=1&count=1');
  console.log(`    > cleanup: deleted ${del.json ? del.json.deleted : del.status}, test leads left ${left.json ? left.json.count : left.status}`);
});
