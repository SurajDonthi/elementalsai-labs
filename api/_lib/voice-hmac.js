// Voice lead capture (T-1): ElevenLabs webhook signature.
// Header "ElevenLabs-Signature: t=<unix secs>,v0=<hex HMAC-SHA256(secret, `${t}.${rawBody}`)>", 30 minute tolerance.
import { createHmac } from 'node:crypto';
import { safeEqual } from './voice-auth.js';

export const TOLERANCE_SECS = 30 * 60;

const mac = (secret, t, rawBody) => createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');

export function signElevenLabs(secret, rawBody, ts) {
  return `t=${ts},v0=${mac(secret, ts, rawBody)}`;
}

export function verifyElevenLabs(header, rawBody, secret, nowSecs = Math.floor(Date.now() / 1000), tolerance = TOLERANCE_SECS) {
  if (!secret) return { ok: false, code: 'not_configured' };
  if (!header) return { ok: false, code: 'missing_signature' };
  const parts = String(header).split(',').map((p) => p.trim());
  const t = (parts.find((p) => p.startsWith('t=')) || '').slice(2);
  const sigs = parts.filter((p) => p.startsWith('v0=')).map((p) => p.slice(3));
  if (!/^\d{1,12}$/.test(t) || !sigs.length) return { ok: false, code: 'bad_signature_header' };
  if (Math.abs(nowSecs - Number(t)) > tolerance) return { ok: false, code: 'stale_signature' };
  const want = mac(secret, t, rawBody);
  return sigs.some((s) => safeEqual(s, want)) ? { ok: true } : { ok: false, code: 'bad_signature' };
}
