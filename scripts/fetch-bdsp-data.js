#!/usr/bin/env node
/**
 * PokéAPI から Gen I-IV（493匹）のデータを取得して
 * js/data-pokemon-bdsp.js を生成するスクリプト。
 *
 * 使用方法:
 *   node scripts/fetch-bdsp-data.js
 *
 * 必要なもの: Node.js 18+ (fetch 標準搭載)
 * 所要時間: 数分（APIレート制限のため並列数を制限）
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../js/data-pokemon-bdsp.js");

const TOTAL = 493;
const CONCURRENCY = 10; // 同時リクエスト数
const RETRY = 3;

async function fetchWithRetry(url, retries = RETRY) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 配列をchunkサイズで分割 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

async function fetchPokemon(id) {
  const [poke, species] = await Promise.all([
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  // 日本語名（ja=漢字混じり）
  const jaName = species.names.find((n) => n.language.name === "ja")?.name
    ?? species.names.find((n) => n.language.name === "ja-hrkt")?.name
    ?? species.name;

  // 種族値
  const statMap = {};
  for (const s of poke.stats) statMap[s.stat.name] = s.base_stat;
  const baseStats = [
    statMap["hp"],
    statMap["attack"],
    statMap["defense"],
    statMap["special-attack"],
    statMap["special-defense"],
    statMap["speed"],
  ];

  // EV実数値（effort値）
  const evMap = {};
  for (const s of poke.stats) evMap[s.stat.name] = s.effort;
  const evYield = [
    evMap["hp"] ?? 0,
    evMap["attack"] ?? 0,
    evMap["defense"] ?? 0,
    evMap["special-attack"] ?? 0,
    evMap["special-defense"] ?? 0,
    evMap["speed"] ?? 0,
  ];

  // 特性（日本語名）- APIから直接取得するのが重いため英語名を一時使用し後で差し替え
  const abilities = poke.abilities.map((a) => a.ability.name);

  return { id, jaName, baseStats, evYield, abilities };
}

async function fetchAbilityName(slug) {
  const data = await fetchWithRetry(`https://pokeapi.co/api/v2/ability/${slug}`);
  return (
    data.names.find((n) => n.language.name === "ja")?.name ??
    data.names.find((n) => n.language.name === "ja-hrkt")?.name ??
    slug
  );
}

async function main() {
  console.log(`BDSPポケモンデータ取得開始 (1〜${TOTAL}番)`);

  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  const results = new Array(TOTAL);

  // 並列数を制限して取得
  for (const batch of chunk(ids, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (id) => {
        try {
          results[id - 1] = await fetchPokemon(id);
          process.stdout.write(`\r  ${id}/${TOTAL} 完了`);
        } catch (e) {
          console.error(`\nERROR id=${id}:`, e.message);
          results[id - 1] = null;
        }
      })
    );
  }
  console.log("\n\n特性名（日本語）を取得中...");

  // 全ユニークな特性スラッグを収集
  const allSlugs = new Set();
  for (const r of results) {
    if (r) r.abilities.forEach((a) => allSlugs.add(a));
  }
  const slugList = [...allSlugs];
  const abilityJa = {};
  for (const batch of chunk(slugList, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (slug) => {
        try {
          abilityJa[slug] = await fetchAbilityName(slug);
        } catch {
          abilityJa[slug] = slug;
        }
      })
    );
    process.stdout.write(`\r  ${Object.keys(abilityJa).length}/${slugList.length} 完了`);
  }
  console.log("\n");

  // -------- JS ファイル生成 --------

  // POKEMON_DATA_BDSP: [id, ja名, HP, こうげき, ぼうぎょ, とくこう, とくぼう, すばやさ]
  const pokemonLines = results
    .filter(Boolean)
    .map((r) => `  [${r.id},"${r.jaName}",${r.baseStats.join(",")}]`)
    .join(",\n");

  // EV_YIELD_BDSP: [hp,atk,def,spa,spd,spe]
  const evLines = results
    .filter(Boolean)
    .map((r) => `  [${r.evYield.join(",")}]`)
    .join(",\n");

  // ABILITY_DATA_BDSP: [[特性1, 特性2?, ...], ...]
  const abilityLines = results
    .filter(Boolean)
    .map((r) => {
      const names = r.abilities.map((a) => `"${abilityJa[a] ?? a}"`).join(",");
      return `  [${names}]`;
    })
    .join(",\n");

  // DEFAULT_PARTY_BDSP: シンオウスターター3匹 + 代表的な強ポケ3匹
  const defaultParty = [
    { id: 387, name: "ナエトル",   icon: "🌿", color: "#7DBE8A" },
    { id: 390, name: "ヒコザル",   icon: "🔥", color: "#FF6B35" },
    { id: 393, name: "ポッチャマ", icon: "💧", color: "#4A90D9" },
    { id: 448, name: "ルカリオ",   icon: "⚡", color: "#4A90D9" },
    { id: 445, name: "ガブリアス", icon: "🐉", color: "#4488CC" },
    { id: 484, name: "パルキア",   icon: "🌊", color: "#C97AE0" },
  ];
  const defaultPartyLines = defaultParty
    .map((p) => `  { name: "${p.name}", icon: "${p.icon}", color: "${p.color}", memo: "", nature: "", dexId: ${p.id} }`)
    .join(",\n");

  const output = `// このファイルは scripts/fetch-bdsp-data.js によって自動生成されました。
// 手動で編集しないでください。

// Gen I-IV 全493匹の種族値 [id, 日本語名, HP, こうげき, ぼうぎょ, とくこう, とくぼう, すばやさ]
export const POKEMON_DATA_BDSP = [
${pokemonLines}
];

// 倒した時に得られるEV [hp,atk,def,spa,spd,spe]（PokéAPI / Gen IV）
export const EV_YIELD_BDSP = [
${evLines}
];

// 特性リスト（各ポケモンの特性、複数あり）
export const ABILITY_DATA_BDSP = [
${abilityLines}
];

export const DEFAULT_PARTY_BDSP = [
${defaultPartyLines}
];
`;

  writeFileSync(OUT_PATH, output, "utf8");
  console.log(`✅ 出力完了: ${OUT_PATH}`);
  console.log(`   ポケモン数: ${results.filter(Boolean).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
