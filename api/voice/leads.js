// GET, DELETE /api/voice/leads: read voice leads (T-1); GET ?stats=1 gives counts only (T-5).
// Password like api/leads.js; DELETE only for TEST- leads.
import { leadsGet, leadsDelete, liveDeps } from '../_lib/voice-handlers.js';

export async function GET(request) {
  return leadsGet(request, liveDeps());
}

export async function DELETE(request) {
  return leadsDelete(request, liveDeps());
}
