const BASE = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'pokeapi_cache_v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const memCache = new Map();
const inFlight = new Map();

// Load from localStorage on module init
try {
  const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (stored && stored.expires > Date.now()) {
    for (const [k, v] of Object.entries(stored.data)) memCache.set(k, v);
  }
} catch (e) {}

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

export function persistCache() {
  try {
    const data = Object.fromEntries(memCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ expires: Date.now() + TTL_MS, data }));
  } catch (e) {
    console.warn('PokeAPI cache write failed:', e);
  }
}
