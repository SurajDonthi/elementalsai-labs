// GET /api/voice/start-session: issues a one-time ElevenLabs call token to our own pages only.
import { startSession, linkSession, liveDeps } from '../_lib/voice-handlers.js';

export async function GET(request) {
  return startSession(request, liveDeps());
}

export async function POST(request) {
  return linkSession(request, liveDeps());
}
