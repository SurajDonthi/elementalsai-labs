// POST /api/voice/book-call: ElevenLabs server tool book_call (T-1). A TEST- conversation is a dry run that books nothing.
import { bookCall, liveDeps } from '../_lib/voice-handlers.js';

export async function POST(request) {
  return bookCall(request, liveDeps());
}
