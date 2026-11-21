// Voice lead capture (T-1): secret header and Basic auth checks. Deny by default: an unset secret never matches.
import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (s) => createHash('sha256').update(String(s)).digest();

export function safeEqual(a, b) {
  if (!a || !b) return false;
  return timingSafeEqual(digest(a), digest(b));
}

export function hasToolSecret(request, secret) {
  return safeEqual(request.headers.get('x-voice-tool-secret') || '', secret);
}

// Same style as api/leads.js: any user name, the password after ':' must match.
export function basicPassword(request) {
  const h = request.headers.get('authorization') || '';
  if (!h.startsWith('Basic ')) return '';
  const decoded = Buffer.from(h.slice(6), 'base64').toString('utf8');
  const i = decoded.indexOf(':');
  return i >= 0 ? decoded.slice(i + 1) : '';
}

export function hasBasic(request, key) {
  return safeEqual(basicPassword(request), key);
}
