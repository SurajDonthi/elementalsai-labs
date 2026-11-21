// POST /api/voice/check-slots: ElevenLabs server tool check_slots (T-1). Live Cal.com free slots, India time, read only.
import { checkSlots, liveDeps } from '../_lib/voice-handlers.js';

export async function POST(request) {
  return checkSlots(request, liveDeps());
}
