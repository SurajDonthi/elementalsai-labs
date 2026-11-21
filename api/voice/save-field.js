// POST /api/voice/save-field: ElevenLabs server tool save_field (T-1). Secret header; test agent only.
import { saveField, liveDeps } from '../_lib/voice-handlers.js';

export async function POST(request) {
  return saveField(request, liveDeps());
}
