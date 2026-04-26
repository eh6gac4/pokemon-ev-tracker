/**
 * loadPokemonFromAPI / loadMovesFromAPI のキャッシュ統合テスト
 *
 * 正規化済みデータ（saveProcessed で書いた内容）が
 * loadProcessed 経由で正しく読み出され、API へのリクエストが
 * 発生しないことを確認する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const CACHE_PREFIX = 'pokeapi_processed_v1_';
const TTL_VALID = 6 * 24 * 60 * 60 * 1000; // 6 days (well within 7-day TTL)

function makeLs(initial = {}) {
  const store = { ...initial };
  return {
    getItem:    vi.fn(k => store[k] ?? null),
    setItem:    vi.fn((k, v) => { store[k] = String(v); }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear:      vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  };
}

function cached(key, data) {
  return { [CACHE_PREFIX + key]: JSON.stringify({ expires: Date.now() + TTL_VALID, data }) };
}

// ─── loadPokemonFromAPI ───────────────────────────────────────────────────────

describe('loadPokemonFromAPI - キャッシュ統合', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('有効なキャッシュがある場合 fetch を一切呼ばない', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('localStorage', makeLs(cached('pokemon', {
      pokemonData:   [[1, 'フシギダネ', 45, 49, 49, 65, 65, 45]],
      evYield:       [[0, 0, 0, 1, 0, 0]],
      abilityData:   [['しんりょく']],
      evolutionData: { 1: { next: [{ id: 2, cond: 'Lv.16' }] } },
    })));

    vi.resetModules();
    const mod = await import('./data-pokemon.js');
    await mod.loadPokemonFromAPI();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('キャッシュの POKEMON_DATA が正しく復元される', async () => {
    const pokemonData = [
      [1, 'フシギダネ', 45, 49, 49, 65, 65, 45],
      [4, 'ヒトカゲ',   39, 52, 43, 60, 50, 65],
    ];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('pokemon', {
      pokemonData,
      evYield:       [[0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1]],
      abilityData:   [['しんりょく'], ['もうか']],
      evolutionData: {},
    })));

    vi.resetModules();
    const mod = await import('./data-pokemon.js');
    await mod.loadPokemonFromAPI();

    expect(mod.POKEMON_DATA).toEqual(pokemonData);
  });

  it('キャッシュの EV_YIELD が正しく復元される', async () => {
    const evYield = [[0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 1, 0], [0, 2, 0, 1, 0, 0]];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('pokemon', {
      pokemonData:   [[1, 'a', 1, 2, 3, 4, 5, 6]],
      evYield,
      abilityData:   [[]],
      evolutionData: {},
    })));

    vi.resetModules();
    const mod = await import('./data-pokemon.js');
    await mod.loadPokemonFromAPI();

    expect(mod.EV_YIELD).toEqual(evYield);
  });

  it('キャッシュの ABILITY_DATA が正しく復元される', async () => {
    const abilityData = [['しんりょく'], ['もうか', 'たいねつ'], ['げきりゅう']];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('pokemon', {
      pokemonData:   [[1, 'a', 1, 2, 3, 4, 5, 6]],
      evYield:       [[0, 0, 0, 0, 0, 0]],
      abilityData,
      evolutionData: {},
    })));

    vi.resetModules();
    const mod = await import('./data-pokemon.js');
    await mod.loadPokemonFromAPI();

    expect(mod.ABILITY_DATA).toEqual(abilityData);
  });

  it('キャッシュの EVOLUTION_DATA が正しく復元される', async () => {
    const evolutionData = {
      1:  { next: [{ id: 2, cond: 'Lv.16' }] },
      2:  { pre: [{ id: 1, cond: 'Lv.16' }], next: [{ id: 3, cond: 'Lv.32' }] },
      3:  { pre: [{ id: 2, cond: 'Lv.32' }] },
      25: { next: [{ id: 26, cond: 'かみなりのいし' }] },
      26: { pre: [{ id: 25, cond: 'かみなりのいし' }] },
    };
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('pokemon', {
      pokemonData:   [[1, 'a', 1, 2, 3, 4, 5, 6]],
      evYield:       [[0, 0, 0, 0, 0, 0]],
      abilityData:   [[]],
      evolutionData,
    })));

    vi.resetModules();
    const mod = await import('./data-pokemon.js');
    await mod.loadPokemonFromAPI();

    expect(mod.EVOLUTION_DATA).toEqual(evolutionData);
  });

  it('キャッシュ期限切れのときは API を呼ぶ（fetch が呼ばれる）', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('localStorage', makeLs({
      [CACHE_PREFIX + 'pokemon']: JSON.stringify({
        expires: Date.now() - 1, // expired
        data: { pokemonData: [], evYield: [], abilityData: [], evolutionData: {} },
      }),
    }));

    vi.resetModules();
    const { loadPokemonFromAPI } = await import('./data-pokemon.js');
    await loadPokemonFromAPI(); // fetch fails, but we only care it was called

    expect(mockFetch).toHaveBeenCalled();
  });
});

// ─── loadMovesFromAPI ─────────────────────────────────────────────────────────

describe('loadMovesFromAPI - キャッシュ統合', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('有効なキャッシュがある場合 fetch を一切呼ばない', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('localStorage', makeLs(cached('moves', {
      moveData:   { 'たいあたり': ['ノーマル', 40, 100, 35] },
      learnset:   [null, [[1, 'たいあたり']]],
      tmMoves:    [null, []],
      eggMoves:   [null, []],
      tutorMoves: [null, []],
      allMoves:   ['たいあたり'],
    })));

    vi.resetModules();
    const mod = await import('./data-moves.js');
    await mod.loadMovesFromAPI();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('キャッシュの MOVE_DATA が正しく復元される', async () => {
    const moveData = {
      'たいあたり':     ['ノーマル', 40, 100, 35],
      'かえんほうしゃ': ['ほのお',   95, 100, 15],
    };
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('moves', {
      moveData,
      learnset: [null], tmMoves: [null], eggMoves: [null], tutorMoves: [null],
      allMoves: Object.keys(moveData),
    })));

    vi.resetModules();
    const mod = await import('./data-moves.js');
    await mod.loadMovesFromAPI();

    expect(mod.MOVE_DATA).toEqual(moveData);
  });

  it('キャッシュの LEARNSET が正しく復元される', async () => {
    const learnset = [
      null,
      [[1, 'たいあたり'], [7, 'やどりぎのタネ'], [46, 'ソーラービーム']],
      [[1, 'たいあたり']],
    ];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('moves', {
      moveData: {}, learnset,
      tmMoves: [null], eggMoves: [null], tutorMoves: [null], allMoves: [],
    })));

    vi.resetModules();
    const mod = await import('./data-moves.js');
    await mod.loadMovesFromAPI();

    expect(mod.LEARNSET).toEqual(learnset);
  });

  it('キャッシュの TM_MOVES / EGG_MOVES / TUTOR_MOVES が正しく復元される', async () => {
    const tmMoves    = [null, ['TM06', 'TM09', 'HM01'], []];
    const eggMoves   = [null, ['あまえる', 'のろい'],   []];
    const tutorMoves = [null, ['のしかかり', 'みがわり'], []];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('moves', {
      moveData: {}, learnset: [null],
      tmMoves, eggMoves, tutorMoves, allMoves: [],
    })));

    vi.resetModules();
    const mod = await import('./data-moves.js');
    await mod.loadMovesFromAPI();

    expect(mod.TM_MOVES).toEqual(tmMoves);
    expect(mod.EGG_MOVES).toEqual(eggMoves);
    expect(mod.TUTOR_MOVES).toEqual(tutorMoves);
  });

  it('キャッシュの ALL_MOVES が正しく復元される', async () => {
    const allMoves = ['あまごい', 'かえんほうしゃ', 'たいあたり'];
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeLs(cached('moves', {
      moveData: {}, learnset: [null], tmMoves: [null],
      eggMoves: [null], tutorMoves: [null], allMoves,
    })));

    vi.resetModules();
    const mod = await import('./data-moves.js');
    await mod.loadMovesFromAPI();

    expect(mod.ALL_MOVES).toEqual(allMoves);
  });

  it('キャッシュ期限切れのときは API を呼ぶ（fetch が呼ばれる）', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('localStorage', makeLs({
      [CACHE_PREFIX + 'moves']: JSON.stringify({
        expires: Date.now() - 1, // expired
        data: { moveData: {}, learnset: [], tmMoves: [], eggMoves: [], tutorMoves: [], allMoves: [] },
      }),
    }));

    vi.resetModules();
    const { loadMovesFromAPI } = await import('./data-moves.js');
    await loadMovesFromAPI();

    expect(mockFetch).toHaveBeenCalled();
  });
});
