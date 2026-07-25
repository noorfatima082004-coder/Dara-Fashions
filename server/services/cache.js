/**
 * Cache abstraction.
 *
 * Ships with a simple in-memory implementation so the code runs out of the
 * box. THIS DOES NOT PERSIST ACROSS SERVER RESTARTS AND DOES NOT SCALE
 * ACROSS MULTIPLE SERVER INSTANCES — swap it for Redis or your DB before
 * real production traffic. The interface (get/set) is deliberately tiny so
 * that swap is a one-file change; nothing else in the codebase needs to
 * know which backend is behind it.
 *
 * Why caching matters here specifically: it's what keeps Gemini costs near
 * zero. A user's skin-tone profile is analyzed ONCE and reused forever.
 *
 * MAX_ENTRIES exists because this cache has no auth in front of it yet —
 * without a cap, anyone spraying random userIds could grow this Map
 * without bound and exhaust server memory. Eviction is oldest-insertion-
 * first (a Map preserves insertion order), which is a fine approximation
 * for an MVP; swap for real LRU/TTL semantics in the Redis version.
 */

const MAX_ENTRIES = 5000;
const store = new Map();

async function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

async function set(key, value, ttlSeconds = null) {
  if (!store.has(key) && store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    store.delete(oldestKey);
  }
  store.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

/**
 * Example production swap (Redis, using `ioredis`):
 *
 *   const Redis = require("ioredis");
 *   const redis = new Redis(process.env.REDIS_URL);
 *   async function get(key) {
 *     const raw = await redis.get(key);
 *     return raw ? JSON.parse(raw) : null;
 *   }
 *   async function set(key, value, ttlSeconds = null) {
 *     const raw = JSON.stringify(value);
 *     if (ttlSeconds) await redis.set(key, raw, "EX", ttlSeconds);
 *     else await redis.set(key, raw);
 *   }
 *
 * Or store user profiles directly on the User row in your main DB (Postgres/
 * Mongo) instead of a separate cache — often simpler, since a user's
 * skin-tone profile is really part of their persistent profile, not a
 * throwaway cache entry.
 */

module.exports = { get, set };
