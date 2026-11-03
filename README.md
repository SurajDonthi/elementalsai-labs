# ElementalsAI Labs website

Status: Live on elementalsai-labs.com since 1 Nov 2026 (D-97). A push to main deploys to production. Every lead is kept in the private Vercel Blob store "elementalsai-labs-leads" (Mumbai); email notices wait for a mailbox and a sender (D-99).
Last change: 1 Nov 2026.

The website for the Google Ads campaign: the home page, 5 service landing pages and 6 site pages, on the D-91 design. The older agentic GTM page and its blog are in [archive/agentic-gtm-v1/](archive/agentic-gtm-v1/README.md). The words, decisions and review notes live in `ai-services-gtm` (campaign docs, decision log, `labs-site/landing-pages-v2/pages.json`).

## Pages (the addresses match the ads' final URLs and sitelinks)

- `/mobile-app-development`, `/app-development`, `/ai-development`, `/ai-agents-and-automation`, `/custom-software`: the service pages.
- `/quote`, `/how-it-works`, `/work`, `/contact`: the sitelink pages.
- `/privacy`, `/terms`: drafts. A lawyer must read them, and they miss facts (pages.json lists them).
- `/`: the home page. The same sections as a service page, with "What we build" (all 5 services) in place of "Try it".
- Every page uses the same header (`header()`) and footer (`footer()`) from `src/build.mjs`. On pages with the quote form, "Get a free quote" jumps to the form; on the others, it opens /quote.

## Commands

- `npm run build`: builds the live site into `public/`. Styles, scripts and images become cached files in `public/assets/`; each page gets its clean address, a canonical link and share tags; `robots.txt`, `sitemap.xml` and `404.html` are made.
- `npm run dev`: serves `public/` at http://localhost:4173, the way Vercel does. Without `RESEND_API_KEY`, a sent lead is only saved to `leads.local.jsonl`.
- `npm run review`: writes the review copies (one file per page, with draft notes) to `ai-services-gtm/labs-site/landing-pages-v2/`.

## Folders

- `src/`: the source. `build.mjs` (the home page, the service pages and their words, and the shared header and footer), `site.mjs` (the site pages), `styles.css`, `app.js` (every interaction, the form and the voice agent), `devices/` (the "Try it" demos), `assets/`.
- `api/lead.js`: the Vercel function that keeps each lead in the private Blob store, and also emails it when RESEND_API_KEY is set.
- `api/leads.js`: the password page that lists every lead (https://elementalsai-labs.com/api/leads). Set LEADS_KEY in Vercel to open it; any user name works.
- `src/assets/brand/`: the official icons (from the company OneDrive folder Elementals.ai-icons), the one-line white logo built from the official 2000 px artwork, and the sharing image.
- `agent/`: the ElevenLabs voice agent. `update-prompt.mjs` holds its instructions; `tests.mjs` runs its 8 visitor tests in ElevenLabs.
- `scripts/`: `release.mjs` (the live build), `serve.mjs` (the local server), `review.mjs` (the review copies).

## The voice agent

ElevenLabs agent "Diya" (ID in `src/build.mjs`). With no tap, she asks for the microphone when the quote card is in view; once it is allowed, the browser lets her speak, so she plays her opening ("Hello? Hi… anybody there?", three knocks on the glass, "Oh, hi! I'm Diya. What should I call you?") from clips in her voice (`src/assets/diya-*.mp3`, `knock.wav`) and starts the live call by herself. If the microphone is blocked, the opening plays without sound and the visitor types. It says Suraj's script, reads the phone number and email back, fills the form, sends it through `/api/lead`, and waits for the result before it says thank you. The API key stays in the credentials folder; the pages hold only the public agent ID. Details: `ai-services-gtm/lead-capture/voice-lead-form-v1.md`.

## Settings for Vercel (at deploy)

- `RESEND_API_KEY`, `LEAD_TO` (hello@elementalsai-labs.com), `LEAD_FROM` (a sender on a domain verified in Resend).
- Tracking: production pages load Google Tag Manager (GTM-T9SDG58F). Tag Manager holds Analytics (G-C7M17NZPNQ), Microsoft Clarity (z6ygwy0jmz) and the Google Ads conversion tags. The page only pushes 4 events to `dataLayer`: `generate_lead` (a lead was saved, with `lead_source` form or voice), `phone_click`, `email_click` and `voice_call_start`. Production pages also load Vercel Web Analytics (`/_vercel/insights/script.js`; turned on in the Vercel project, free Hobby plan): pages, where visitors come from, countries, devices.
- Service page order: hero + quote form · try it · what we build (only pages with `types`: mobile app development and custom software, the 2 live ad groups; 28 kinds, a tap puts the kind in the quote form) · track record · worries · how it works · what founders say · impact · questions · next step.
- Quote form budget: the typed form asks "Your budget" with 4 ranges, highest first (`BUDGETS` in `src/build.mjs`): ₹8 lakh+, ₹3–8 lakh, ₹1.5–3 lakh, ₹50,000–1.5 lakh. The voice agent does not ask it, so only the typed form needs it. `api/lead.js` keeps it and puts it in the lead email.

## Still to do

- Set up Resend (or another email sender) and verify the domain.
- Fill the legal facts in the privacy and terms pages, and have a lawyer read them.
- On the ElevenLabs agent: decide how long call audio and text are kept. (Done: it accepts calls only from elementalsai-labs.com, www and localhost.)
- Add the Google tag IDs when the Google Ads conversion actions exist.
