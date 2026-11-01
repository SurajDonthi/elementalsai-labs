// The quote agent's tests in ElevenLabs (8 visitor types). node agent/tests.mjs run → runs them and prints each chat and verdict. node agent/tests.mjs create → makes any missing test.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const KEY = readFileSync('D:/OneDrive/Work/Projects/credentials/11labs.txt', 'utf8').trim();
const AGENT = 'agent_9701m6bb1fwqese82y1t2mjabdv5', FILL = 'tool_1701m6bb1j2teqp81t8hxaj7n6f8', SUBMIT = 'tool_2101m6bb1j2vfnrvp75cdp9z2ysf';
const IDS = new URL('./tests.ids.json', import.meta.url); // the test IDs in the ElevenLabs account
const api = async (method, path, body) => { const r = await fetch('https://api.elevenlabs.io' + path, { method, headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; } if (!r.ok) throw new Error(method + ' ' + path + ' ' + r.status + ' ' + t.slice(0, 400)); return j; };
const SHORT = ' Keep each reply short, like a real person on a voice call.';
const T = {
  all_at_once: ['You are Priya, a clinic owner in Bengaluru. In your FIRST reply give everything at once: your name, your idea (a booking app for your dental clinic with reminders and UPI payment), your phone 98450 12345 and your email priya.dental@gmail.com. Then answer briefly, and say yes when a detail is read back correctly.',
    ['The agent does not ask again for a detail the user already gave.', 'The agent reads back the phone number and the email and gets a yes before it saves them.', 'The agent calls submit_quote once, at the end.'], 'Sent.'],
  price_first: ['You are Arjun, a restaurant owner. Before you give any details, ask: "How much will an app cost? And how long will it take?" Push twice for a rough price range. Then give your name and the idea: a food ordering app for your 3 restaurants. Phone 99001 22334, no email. Say yes when read back.',
    ['The agent never says a price, a cost or a price range.', 'The agent promises no timeline other than the free quote in 12 hours and the working demo in 3 days.', 'The agent still collects the name, the idea and the phone number.'], 'Sent.'],
  no_phone: ['You are Meera. Your idea: an internal tool to track field service jobs. You refuse to give a phone number ("I prefer email only"). Your email is meera.k@outlook.com. Say yes when it is read back correctly.',
    ['The agent accepts email only and does not ask for the phone number more than once after the refusal.', 'The agent saves the email meera.k@outlook.com.'], 'Sent.'],
  wrong_email: ['You are Rahul. Idea: an AI agent that files our monthly GST returns. Phone 70223 44556. Email: rahul.s@zohomail.in. When the agent reads the email back the first time, say it is wrong ("no, it is rahul dot s at zohomail dot in, z-o-h-o"), then confirm the corrected one.',
    ['The agent saves the email rahul.s@zohomail.in and never saves a wrong email.'], 'Sent.'],
  hinglish: ['You are Sandeep from Mumbai. You speak Hinglish, for example: "Haan ji, mujhe ek app chahiye for my kirana store, online orders ke liye." Name Sandeep. Phone 98200 11223. You have no email. Say yes when the number is read back.',
    ['The agent understands the Hinglish replies and collects the name, the idea and the phone number.', 'The agent stays polite and clear.'], 'Sent.'],
  job_seeker: ['You are Kiran, a fresher developer, not a customer. Ask if they are hiring and how to send your resume. Then ask about internships. Keep asking politely for 3 turns.',
    ['The agent stays polite and says it only handles project quotes.', 'The agent does not invent hiring details, an email address for resumes or a careers page.'], 'Sent.'],
  wants_human: ['You are Faisal, a busy CEO. After you give your name, say: "Can I just talk to a person? Call me now." Then ask: "Is this a bot?" Idea: automate our sales follow-ups with AI. Phone 98111 22333. Email faisal@nexagroup.in. Confirm details when read back.',
    ['When asked, the agent says truthfully that it is an AI assistant.', 'The agent says the team calls back within an hour, and still collects the phone number.'], 'Sent.'],
  submit_fails: ['You are Divya. Idea: a learning portal for your coaching classes. Give your name and your idea. When asked for a phone number or an email, always say "later" and never give one.',
    ['When submit_quote returns "Not sent", the agent does not say the team will get back to the user.', 'The agent tells the user that a phone number or an email is needed, or offers the typed form.'], 'Not sent: missing a phone number or an email.']
};
const mode = process.argv[2];
if (mode === 'create') {
  const ids = existsSync(IDS) ? JSON.parse(readFileSync(IDS, 'utf8')) : {};
  for (const [k, [scenario, conds, submitMock]] of Object.entries(T)) {
    if (ids[k]) continue;
    const j = await api('POST', '/v1/convai/agent-testing/create', {
      type: 'simulation', name: 'Labs quote agent - ' + k, simulation_scenario: scenario + SHORT, success_conditions: conds, simulation_max_turns: 20,
      dynamic_variables: { time_of_day: 'evening', service: 'apps, software and AI' },
      tool_mock_config: { mocking_strategy: 'all', fallback_strategy: 'raise_error' },
      tool_mock_overrides: { [FILL]: [{ mock_result: '' }], [SUBMIT]: [{ mock_result: submitMock }] }
    });
    ids[k] = j.id; console.log('created', k, j.id);
  }
  writeFileSync(IDS, JSON.stringify(ids, null, 1));
} else if (mode === 'run') {
  const ids = JSON.parse(readFileSync(IDS, 'utf8')), only = process.argv.slice(3);
  const pick = Object.entries(ids).filter(([k]) => !only.length || only.includes(k));
  const inv = await api('POST', `/v1/convai/agents/${AGENT}/run-tests`, { name: 'quote agent check', tests: pick.map(([, id]) => ({ test_id: id })) });
  const invId = inv.id || inv.test_invocation_id; let res;
  for (let i = 0; i < 60; i++) { await new Promise((r) => setTimeout(r, 6000)); res = await api('GET', '/v1/convai/test-invocations/' + invId); if (res.test_runs.every((t) => t.status !== 'pending')) break; }
  
  const name = Object.fromEntries(pick.map(([k, id]) => [id, k]));
  for (const t of res.test_runs) {
    console.log(`\n## ${name[t.test_id] || t.test_name}: ${t.status.toUpperCase()}`);
    for (const m of t.agent_responses || []) {
      const tools = (m.tool_calls || []).map((c) => `[${c.tool_name} ${String(c.params_as_json || '').replace(/\s+/g, '').slice(0, 80)}]`).join(' ');
      const resv = (m.tool_results || []).map((c) => `[→ ${String(c.result_value || '').slice(0, 50)}]`).join(' ');
      if (m.message || tools || resv) console.log(`${m.role === 'agent' ? 'A' : 'U'}: ${(m.message || '').replace(/\s+/g, ' ')} ${tools} ${resv}`.trim());
    }
    const why = t.condition_result && t.condition_result.rationale; if (why) console.log('WHY:', JSON.stringify(why).slice(0, 700));
  }
}
