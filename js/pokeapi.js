const BASE = 'https://pokeapi.co/api/v2';
const CACHE_PREFIX = 'pokeapi_processed_v1_';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

// In-session deduplication: same path → same Promise, no duplicate network requests
const memCache = new Map();
const inFlight = new Map();

async function apiFetch(path) {
  if (memCache.has(path)) return memCache.get(path);
  if (inFlight.has(path)) return inFlight.get(path);
  const p = fetch(BASE + path)
    .then(r => { if (!r.ok) throw new Error(`PokeAPI ${r.status}: ${path}`); return r.json(); })
    .then(data => { memCache.set(path, data); return data; })
    .finally(() => inFlight.delete(path));
  inFlight.set(path, p);
  return p;
}

export async function batchFetch(paths, concurrency = 20) {
  const results = [];
  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(p => apiFetch(p)));
    results.push(...settled);
  }
  return results;
}

// Save normalized (post-processed) data to localStorage. Much smaller than raw API responses.
export function saveProcessed(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ expires: Date.now() + TTL_MS, data })
    );
  } catch (e) {
    console.warn('PokeAPI processed cache write failed:', e);
  }
}

// Load normalized data. Returns null if missing or expired.
export function loadProcessed(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (!stored || typeof stored.expires !== 'number' || stored.expires <= Date.now()) return null;
    return stored.data;
  } catch (e) {
    return null;
  }
}
