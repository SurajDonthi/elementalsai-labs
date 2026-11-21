// Voice lead capture (T-1): the lead store. One private JSON blob per ElevenLabs conversation,
// voice-leads/<conversation_id>.json, in the site's existing Blob store. It sits apart from leads/,
// so the live form (api/lead.js) and its list (api/leads.js) never see voice leads.
// The only file that talks to Vercel Blob for voice leads.
import { put, get, list, del, BlobPreconditionFailedError } from '@vercel/blob';

const realBlob = { put, get, list, del };

export const PREFIX = 'voice-leads/';
export const pathFor = (id) => `${PREFIX}${id}.json`;

export class Conflict extends Error {
  constructor() { super('The lead changed while it was being saved.'); this.name = 'Conflict'; }
}

// blob: the Vercel Blob client (tests pass a fake with the same four calls).
export function blobStore(blob = realBlob) {
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false };
  // Read with "accept-encoding: identity": a compressed read (bodies of about 1 KB or more) gets a weak ETag,
  // and a put with ifMatch set to a weak ETag always fails (seen live, 21 Nov 2026).
  async function read(id) {
    const r = await blob.get(pathFor(id), { access: 'private', useCache: false, headers: { 'accept-encoding': 'identity' } });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return { lead: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
  }
  return {
    read,
    // First write for a conversation. Fails if the blob already exists.
    async create(id, lead) {
      try {
        await blob.put(pathFor(id), JSON.stringify(lead), { ...opts, allowOverwrite: false });
      } catch (e) {
        if (await read(id).catch(() => null)) throw new Conflict();
        throw e;
      }
    },
    // Later writes: only if nobody wrote since we read (ETag).
    async replace(id, lead, etag) {
      if (String(etag).startsWith('W/')) throw new Error('The lead store read gave a weak ETag, so a safe write is not possible.');
      try {
        await blob.put(pathFor(id), JSON.stringify(lead), { ...opts, ifMatch: etag });
      } catch (e) {
        if (e instanceof BlobPreconditionFailedError) throw new Conflict();
        throw e;
      }
    },
    async list(idPrefix = '') {
      const out = [];
      let cursor;
      do {
        const r = await blob.list({ prefix: PREFIX + idPrefix, cursor, limit: 1000 });
        for (const b of r.blobs) {
          if (!b.pathname.endsWith('.json')) continue;
          out.push({ id: b.pathname.slice(PREFIX.length, -'.json'.length), uploaded_at: new Date(b.uploadedAt).toISOString(), size: b.size });
        }
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor && out.length < 5000);
      return out;
    },
    async remove(id) {
      await blob.del(pathFor(id));
    },
  };
}

// Same contract as blobStore, in memory, for tests. `m` holds id -> { body, etag, at }.
export function memoryStore() {
  const m = new Map();
  let n = 0;
  const entry = (lead) => ({ body: JSON.stringify(lead), etag: `m${++n}`, at: new Date() });
  return {
    m,
    async read(id) {
      const e = m.get(id);
      return e ? { lead: JSON.parse(e.body), etag: e.etag } : null;
    },
    async create(id, lead) {
      if (m.has(id)) throw new Conflict();
      m.set(id, entry(lead));
    },
    async replace(id, lead, etag) {
      const e = m.get(id);
      if (!e || e.etag !== etag) throw new Conflict();
      m.set(id, entry(lead));
    },
    async list(idPrefix = '') {
      return [...m.entries()].filter(([id]) => id.startsWith(idPrefix)).map(([id, e]) => ({ id, uploaded_at: e.at.toISOString(), size: e.body.length }));
    },
    async remove(id) {
      m.delete(id);
    },
  };
}

// Read, change, write with an ETag guard; on a conflict read again and retry.
// mutate(current lead or null) returns { lead, ...extra } to write, { error } to refuse, or { noWrite: true, ...extra }.
export async function upsertLead(store, id, mutate, tries = 4) {
  for (let i = 0; ; i++) {
    const cur = await store.read(id);
    const out = mutate(cur ? cur.lead : null) || { noWrite: true };
    if (out.error || out.noWrite || !out.lead) return { ...out, lead: cur ? cur.lead : null, written: false };
    try {
      if (cur) await store.replace(id, out.lead, cur.etag);
      else await store.create(id, out.lead);
      return { ...out, written: true };
    } catch (e) {
      if (e instanceof Conflict && i < tries - 1) continue;
      throw e;
    }
  }
}
