// Voice lead capture (T-1): small HTTP helpers for Web-style (Request -> Response) handlers.
export const NO_STORE = Object.freeze({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });

export function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE, ...extra },
  });
}

// Reads the raw body once (needed as-is for the webhook signature), with a size cap.
export async function readBody(request, maxBytes) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) return { ok: false };
  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) return { ok: false };
  return { ok: true, text };
}

export function parseObject(text) {
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function clientIp(request) {
  const xf = request.headers.get('x-forwarded-for') || '';
  return (xf.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
}

// One JSON line per event. Callers pass ids, codes and counts only, never field values or secrets.
export function log(event, data = {}) {
  console.log(JSON.stringify({ at: new Date().toISOString(), event, ...data }));
}

// Sliding-window limiter, in memory per function instance (a burst guard, not a quota).
export function createLimiter({ limit, windowMs }) {
  const hits = new Map();
  return function allow(key, now = Date.now()) {
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) for (const k of hits.keys()) { hits.delete(k); if (hits.size <= 4000) break; }
    return true;
  };
}
