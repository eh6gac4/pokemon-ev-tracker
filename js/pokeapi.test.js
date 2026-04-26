import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fresh module per test to reset memCache / inFlight
async function freshImport() {
  vi.resetModules();
  return import('./pokeapi.js');
}

function makeLs(initial = {}) {
  const store = { ...initial };
  return {
    getItem:    vi.fn(k => store[k] ?? null),
    setItem:    vi.fn((k, v) => { store[k] = String(v); }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear:      vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    _store:     store,
  };
}

// ─── saveProcessed / loadProcessed ───────────────────────────────────────────

describe('saveProcessed / loadProcessed', () => {
  let ls;

  beforeEach(() => {
    ls = makeLs();
    vi.stubGlobal('localStorage', ls);
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('保存したデータをそのまま読み込める', async () => {
    const { saveProcessed, loadProcessed } = await freshImport();
    const data = { pokemon: [1, 'フシギダネ', 45, 49, 49, 65, 65, 45] };
    saveProcessed('pokemon', data);
    expect(loadProcessed('pokemon')).toEqual(data);
  });

  it('存在しないキーは null を返す', async () => {
    const { loadProcessed } = await freshImport();
    expect(loadProcessed('missing')).toBeNull();
  });

  it('有効期限切れのデータは null を返す', async () => {
    const { loadProcessed } = await freshImport();
    ls.getItem.mockReturnValue(JSON.stringify({
      expires: Date.now() - 1,
      data: { stale: true },
    }));
    expect(loadProcessed('test')).toBeNull();
  });

  it('TTL 内のデータは正常に読み込める', async () => {
    const { saveProcessed, loadProcessed } = await freshImport();
    saveProcessed('test', { fresh: true });
    expect(loadProcessed('test')).toEqual({ fresh: true });
  });

  it('saveProcessed は pokemon / moves を別キーで保存する', async () => {
    const { saveProcessed, loadProcessed } = await freshImport();
    saveProcessed('pokemon', { a: 1 });
    saveProcessed('moves',   { b: 2 });
    expect(loadProcessed('pokemon')).toEqual({ a: 1 });
    expect(loadProcessed('moves')).toEqual({ b: 2 });
  });

  it('localStorage が満杯でも例外を投げない', async () => {
    ls.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    const { saveProcessed } = await freshImport();
    expect(() => saveProcessed('test', { big: 'data' })).not.toThrow();
  });

  it('localStorage の値が不正な JSON でも例外を投げない', async () => {
    ls.getItem.mockReturnValue('{broken json');
    const { loadProcessed } = await freshImport();
    expect(() => loadProcessed('test')).not.toThrow();
    expect(loadProcessed('test')).toBeNull();
  });

  it('expires フィールドが存在しないデータは null を返す', async () => {
    ls.getItem.mockReturnValue(JSON.stringify({ data: { value: 1 } }));
    const { loadProcessed } = await freshImport();
    expect(loadProcessed('test')).toBeNull();
  });
});

// ─── batchFetch ───────────────────────────────────────────────────────────────

describe('batchFetch', () => {
  let ls;

  beforeEach(() => {
    ls = makeLs();
    vi.stubGlobal('localStorage', ls);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('複数パスを取得して fulfilled 結果を返す', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'bulbasaur' }),
    }));
    const { batchFetch } = await freshImport();
    const results = await batchFetch(['/pokemon/1', '/pokemon/2']);

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('fulfilled');
    expect(results[0].value).toEqual({ name: 'bulbasaur' });
    expect(results[1].status).toBe('fulfilled');
  });

  it('HTTP エラーは rejected で返し他のリクエストに影響しない', async () => {
    let call = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      call++;
      if (call === 2) return Promise.resolve({ ok: false, status: 404 });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ n: call }) });
    }));
    const { batchFetch } = await freshImport();
    const results = await batchFetch(['/a', '/b', '/c']);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toMatch('404');
    expect(results[2].status).toBe('fulfilled');
  });

  it('同一パスへの並行リクエストは 1 回だけ fetch する（in-flight dedup）', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 25 }),
    });
    vi.stubGlobal('fetch', mockFetch);
    const { batchFetch } = await freshImport();

    const [r1, r2] = await Promise.all([
      batchFetch(['/pokemon/25']),
      batchFetch(['/pokemon/25']),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(r1[0].value).toEqual({ id: 25 });
    expect(r2[0].value).toEqual({ id: 25 });
  });

  it('同じパスへの 2 回目の呼び出しはメモリキャッシュを使い再 fetch しない', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 6 }),
    });
    vi.stubGlobal('fetch', mockFetch);
    const { batchFetch } = await freshImport();

    await batchFetch(['/pokemon/6']);
    await batchFetch(['/pokemon/6']); // should hit memCache

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('concurrency パラメータが同時リクエスト数を制限する', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    vi.stubGlobal('fetch', vi.fn().mockImplementation(
      () => new Promise(resolve => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        setTimeout(() => {
          concurrent--;
          resolve({ ok: true, json: () => Promise.resolve({}) });
        }, 5);
      })
    ));
    const { batchFetch } = await freshImport();

    const paths = Array.from({ length: 25 }, (_, i) => `/pokemon/${i + 1}`);
    await batchFetch(paths, 5);

    expect(maxConcurrent).toBeLessThanOrEqual(5);
  });

  it('空配列を渡すと空の結果を返す', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { batchFetch } = await freshImport();
    const results = await batchFetch([]);
    expect(results).toEqual([]);
  });
});
