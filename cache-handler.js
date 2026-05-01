'use strict';

// Next.js custom cache handler — Upstash Redis via REST API
// Uses the same UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN as the rest of the app.
// Falls back to cache miss (null) if env vars are missing — app stays functional.

const DEFAULT_TTL_SECONDS = 3600;

async function upstashCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command]),
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? (json[0]?.result ?? null) : null;
}

module.exports = class CacheHandler {
  constructor(_options) {}

  async get(key) {
    try {
      const raw = await upstashCommand(['GET', key]);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl =
        typeof ctx?.revalidate === 'number' && ctx.revalidate > 0
          ? ctx.revalidate
          : DEFAULT_TTL_SECONDS;

      const entry = JSON.stringify({ lastModified: Date.now(), value: data });
      await upstashCommand(['SETEX', key, ttl, entry]);
    } catch (err) {
      console.error('[CacheHandler] set error:', err.message);
    }
  }

  async revalidateTag(tags) {
    // Tag-based revalidation requires a tag→keys index.
    // Time-based TTL (revalidate: 3600) handles expiry instead.
    const tagList = Array.isArray(tags) ? tags : [tags];
    console.log('[CacheHandler] revalidateTag (no-op):', tagList.join(', '));
  }
};
