// =======================================================
// 📦 SHARED LESSON CACHE (cross-student, single-flight)
// =======================================================
// The per-session lessonCache in learningPathService only helps the SAME
// student revisiting the SAME concept. When a batch of students hits the same
// guided concept at once, each session generates from scratch — 4-5 Groq calls
// per student for identical content.
//
// This cache is keyed by the *content* of a lesson (technology + concept +
// level), not by student, so 20 learners on "React useState" share ONE
// generation. It is single-flight: concurrent misses for the same key await the
// SAME in-flight promise, so a simultaneous burst fires exactly one Groq job
// instead of twenty (cache-stampede protection).
//
// In-memory only. A process restart simply re-warms the cache — safe by design.

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// 6h default: guided lessons are stable curriculum content, not personalized.
const DEFAULT_TTL_MS = positiveInt(process.env.LESSON_CACHE_TTL_MS, 6 * 60 * 60 * 1000);
const MAX_ENTRIES = positiveInt(process.env.LESSON_CACHE_MAX_ENTRIES, 500);

// key -> { value, expiresAt }. Map iteration order is insertion order, which we
// exploit for LRU: a cache hit re-inserts the key so the oldest stays at front.
const resolved = new Map();
// key -> Promise. Tracks generations currently in flight for single-flight.
const inflight = new Map();

const stats = { hits: 0, misses: 0, coalesced: 0, stores: 0, evictions: 0 };

// Deep copy so a caller mutating its lesson (e.g. quiz key locking) can never
// corrupt the shared cached copy handed to the next student.
function clone(value) {
  if (value == null) return value;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function evictIfNeeded() {
  while (resolved.size > MAX_ENTRIES) {
    const oldestKey = resolved.keys().next().value;
    if (oldestKey === undefined) break;
    resolved.delete(oldestKey);
    stats.evictions += 1;
  }
}

/**
 * Return a cached value for `key`, or run `generator()` once to produce it.
 *
 * @param {string} key            Stable content key (must not include studentId).
 * @param {() => Promise<any>} generator  Produces the value on a miss.
 * @param {object} [options]
 * @param {number} [options.ttlMs]              Override the default TTL.
 * @param {(value:any) => boolean} [options.shouldCache]
 *        Called with the freshly generated value; return false to serve it once
 *        but NOT persist it (e.g. a degraded fallback we don't want to pin).
 * @returns {Promise<any>} A deep clone of the value (safe for the caller to mutate).
 */
async function getOrGenerate(key, generator, options = {}) {
  const { ttlMs = DEFAULT_TTL_MS, shouldCache } = options;
  const now = Date.now();

  const hit = resolved.get(key);
  if (hit) {
    if (hit.expiresAt > now) {
      resolved.delete(key);
      resolved.set(key, hit); // refresh LRU recency
      stats.hits += 1;
      return clone(hit.value);
    }
    resolved.delete(key); // expired
  }

  const pending = inflight.get(key);
  if (pending) {
    stats.coalesced += 1;
    return clone(await pending); // ride the in-flight generation
  }

  stats.misses += 1;
  const promise = Promise.resolve().then(generator);
  inflight.set(key, promise);
  try {
    const value = await promise;
    if (!shouldCache || shouldCache(value)) {
      resolved.set(key, { value, expiresAt: Date.now() + ttlMs });
      stats.stores += 1;
      evictIfNeeded();
    }
    return clone(value);
  } finally {
    // Always clear in-flight — failures are never cached, so the next caller
    // gets a fresh attempt instead of a pinned error.
    inflight.delete(key);
  }
}

function getStats() {
  return { ...stats, size: resolved.size, inflight: inflight.size };
}

// Testing / operational escape hatch.
function clear() {
  resolved.clear();
  inflight.clear();
}

module.exports = {
  getOrGenerate,
  getStats,
  clear,
  DEFAULT_TTL_MS,
  MAX_ENTRIES,
};
