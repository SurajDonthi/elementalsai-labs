// POST /api/voice/call-end: ElevenLabs post-call webhook (T-1). HMAC signed; finalizes the lead for this conversation.
import { callEnd, liveDeps } from '../_lib/voice-handlers.js';

export async function POST(request) {
  return callEnd(request, liveDeps());
}
