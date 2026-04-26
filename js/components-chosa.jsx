import React, { useState, useEffect, useMemo } from 'react';
import { POKEMON_DATA, EV_YIELD, NATURES, ABILITY_DATA, STAT_JP, STAT_COL, MAX_STAT, MAX_TOTAL, getEvoPaths, STATS, PD, EVOLUTION_DATA } from './data-pokemon.js';
import { ALL_MOVES, getLearnset, getLearnableMoves, TM_LIST, MOVE_DATA, TYPE_COLORS, TUTOR_LOCATIONS } from './data-moves.js';
import { HOLD_ITEMS, LOCATION_DATA } from './data-items.js';
import { Panel, PokemonSearch, MoveRow, VerBadge, tmItemName } from './components-base.jsx';
import { natLabel } from './components-ikusei.jsx';

export const IVChecker = React.memo(function IVChecker({ color, ivs, onSave, party, onAddToParty }) {
  const [open,   setOpen]   = useState(false);
  const [mon,    setMon]    = useState(0);
  const [lvStr,  setLvStr]  = useState("50");
  const [nat,    setNat]    = useState(0);
  const [actual, setActual] = useState({hp:"",atk:"",def:"",spa:"",spd:"",spe:""});
  const [ev,     setEV]     = useState({hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

  const lv     = Math.max(1, Math.min(100, parseInt(lvStr) || 1));
  const nature = NATURES[nat];
  const pmon   = POKEMON_DATA[mon];

  const calcIV = (statKey) => {
    const a = parseInt(actual[statKey]);
    if (isNaN(a) || a <= 0) return null;
    const base  = pmon[PD[statKey]];
    const evVal = Math.max(0, Math.min(255, parseInt(ev[statKey]) || 0));
    const res   = [];
    for (let iv = 0; iv <= 31; iv++) {
      const inner = Math.floor((2 * base + iv + Math.floor(evVal / 4)) * lv / 100);
      const s5    = inner + 5;
      const stat  = statKey === "hp" ? inner + lv + 10
        : nature.up === statKey ? Math.floor(s5 * 11 / 10)
        : nature.dn === statKey ? Math.floor(s5 *  9 / 10)
        : s5;
      if (stat === a) res.push(iv);
    }
    return res;
  };

  const ivDisp = (k) => {
    const r = calcIV(k);
    if (r === null)    return "—";
    if (r.length === 0) return "？";
    if (r.length === 1) return `${r[0]}`;
    return `${r[0]}〜${r[r.length - 1]}`;
  };

  const ivColor = (k) => {
    const r = calcIV(k);
    if (!r || r.length === 0)    return "#555";
    if (r[0] >= 28)              return "#7fff7f";
    if (r[r.length - 1] <= 10)  return "#ff6b6b";
    return "#f5d020";
  };

  return (
    <Panel title="🔬 個体値チェッカー（Gen III）" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ marginBottom: "8px" }}>
        <PokemonSearch value={mon} onSelect={setMon} color={color} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "8px", color: "#555" }}>レベル</div>
          <input
            type="number" min="1" max="100" value={lvStr}
            onChange={e => setLvStr(e.target.value)}
            onBlur={() => setLvStr(String(lv))}
            className="input-dark"
            style={{ width: "56px", fontSize: "12px", padding: "4px 8px", textAlign: "center" }}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "8px", color: "#555" }}>性格</div>
          <select value={nat} onChange={e => setNat(Number(e.target.value))} className="input-dark" style={{ width: "100%", fontSize: "12px", padding: "4px 8px" }}>
            {NATURES.map((n, i) => <option key={i} value={i}>{natLabel(n)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "62px 52px 1fr 44px", gap: "4px 8px", alignItems: "center", marginBottom: "4px" }}>
        {["ステータス","努力値","実数値","個体値"].map((h, i) => (
          <div key={h} style={{ fontSize: "8px", color: "#444", textAlign: i > 0 ? "center" : undefined }}>{h}</div>
        ))}
      </div>
      {STATS.map(stat => {
        const isUp = nature.up === stat.key;
        const isDn = nature.dn === stat.key;
        const calcResult = calcIV(stat.key);
        const isSingle = calcResult && calcResult.length === 1;
        return (
          <div key={stat.key} style={{ display: "grid", gridTemplateColumns: "62px 52px 1fr 44px", gap: "4px 8px", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "12px", color: isUp ? "#f5d020" : isDn ? "#ff6b6b" : "#888" }}>
              {stat.jp}{isUp ? "↑" : isDn ? "↓" : ""}
            </div>
            <input
              type="number" min="0" max="255" value={ev[stat.key]}
              onChange={e => setEV(prev => ({ ...prev, [stat.key]: Math.max(0, Math.min(255, parseInt(e.target.value) || 0)) }))}
              className="input-dark"
              style={{ fontSize: "12px", padding: "4px", textAlign: "center", width: "100%", color: "#aaa" }}
            />
            <input
              type="number" min="1" value={actual[stat.key]}
              onChange={e => setActual(prev => ({ ...prev, [stat.key]: e.target.value }))}
              placeholder="実数値"
              className="input-dark"
              style={{ fontSize: "12px", padding: "4px", textAlign: "center", width: "100%" }}
            />
            <div
              title={isSingle && onSave ? "クリックで登録" : undefined}
              onClick={() => {
                if (!isSingle || !onSave) return;
                onSave({ ...(ivs || {}), [stat.key]: calcResult[0] });
              }}
              style={{
                fontSize: "12px", fontWeight: "bold", color: ivColor(stat.key), textAlign: "center",
                cursor: isSingle && onSave ? "pointer" : "default",
                background: isSingle && onSave ? "#ffffff11" : "transparent",
                borderRadius: "4px", padding: "2px 0",
              }}
            >
              {ivDisp(stat.key)}
            </div>
          </div>
        );
      })}
      {onSave && (() => {
        const canSaveAll = STATS.every(s => { const r = calcIV(s.key); return r && r.length === 1; });
        return canSaveAll ? (
          <button
            onClick={() => {
              const newIVs = Object.fromEntries(STATS.map(s => [s.key, calcIV(s.key)[0]]));
              onSave(newIVs);
            }}
            style={{
              width: "100%", marginTop: "8px", background: "#1a3a1a", border: "1px solid #7fff7f55",
              borderRadius: "8px", color: "#7fff7f", fontSize: "12px", padding: "8px", cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "1px",
            }}
          >✅ 全ステータスの個体値を登録</button>
        ) : null;
      })()}
      {onAddToParty && (() => {
        const name = POKEMON_DATA[mon][1];
        const alreadyIn = party && party.find(p => p.name === name);
        if (alreadyIn) return (
          <div style={{ fontSize: "8px", color: "#555", textAlign: "center", marginTop: "8px" }}>
            ✅ {name} は育成パーティに登録済み
          </div>
        );
        const ivsToRegister = Object.fromEntries(
          STATS.map(s => {
            const r = calcIV(s.key);
            if (r && r.length === 1) return [s.key, r[0]];
            if (r && r.length > 1)  return [s.key, Math.round((r[0] + r[r.length - 1]) / 2)];
            return [s.key, 15];
          })
        );
        return (
          <button
            onClick={() => onAddToParty(name, mon, ivsToRegister, NATURES[nat].name)}
            style={{
              width: "100%", marginTop: "8px", background: "#1a1a3a",
              border: `1px solid ${color}55`, borderRadius: "8px",
              color: color, fontSize: "12px", padding: "8px", cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "1px",
            }}
          >＋ 育成パーティに追加</button>
        );
      })()}
      <div style={{ fontSize: "8px", color: "#333", marginTop: "8px" }}>「？」は実数値・努力値・レベルを確認　各値クリックで個別登録</div>
    </Panel>
  );
});

export const IVCompare = React.memo(function IVCompare({ party, allIVs, color }) {
  const [open, setOpen] = useState(false);

  const ivDispColor = (val) => {
    if (val === null || val === undefined) return "#333";
    if (val >= 30) return "#7fff7f";
    if (val <= 5)  return "#ff6b6b";
    return "#f5d020";
  };

  const hasAny = party.some(p => STATS.some(s => {
    const v = (allIVs[p.name] || {})[s.key];
    return v !== null && v !== undefined;
  }));

  return (
    <Panel title="🧬 個体値比較" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      {!hasAny && (
        <div style={{ fontSize: "12px", color: "#444", textAlign: "center", padding: "8px 0" }}>
          育成タブで個体値を登録するとここに表示されます
        </div>
      )}
      {hasAny && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ fontSize: "8px", color: "#444", padding: "4px 8px 2px 0", textAlign: "left" }} />
                {party.map(p => (
                  <th key={p.name} style={{ fontSize: "16px", color: p.color, padding: "4px 8px 2px", textAlign: "center" }}>
                    {p.icon}
                  </th>
                ))}
              </tr>
              <tr>
                <th style={{ padding: "0 8px 8px 0" }} />
                {party.map(p => (
                  <th key={p.name} style={{ fontSize: "8px", color: "#555", padding: "0 4px 8px", textAlign: "center" }}>
                    {p.name.length > 5 ? p.name.slice(0, 4) + "…" : p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATS.map(stat => (
                <tr key={stat.key} style={{ borderTop: "1px solid #1a1a2e" }}>
                  <td style={{ fontSize: "12px", color: "#666", padding: "4px 8px 4px 0", whiteSpace: "nowrap" }}>{stat.jp}</td>
                  {party.map(p => {
                    const val = (allIVs[p.name] || {})[stat.key];
                    return (
                      <td key={p.name} style={{ textAlign: "center", padding: "4px 4px", fontWeight: "bold", color: ivDispColor(val) }}>
                        {val !== null && val !== undefined ? val : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
});

export const EVSearch = React.memo(function EVSearch({ macho, color }) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState(null);

  const STAT_KEYS = STATS.map(s => s.key);

  const results = POKEMON_DATA.filter((p, i) => {
    const y = EV_YIELD[i];
    return (!query || p[1].includes(query))
      && (!filter || y[STAT_KEYS.indexOf(filter)] > 0)
      && y.some(v => v > 0);
  });

  return (
    <Panel title="🔍 もらえるEVを調べる" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px", flexWrap: "wrap" }}>
        <button onClick={() => setFilter(null)} style={{ background: filter === null ? "#2a2a4a" : "transparent", border: "1px solid #3a3a5a", borderRadius: "4px", color: filter === null ? "#e8e8e8" : "#555", fontSize: "8px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>すべて</button>
        {STAT_KEYS.map(k => (
          <button key={k} onClick={() => setFilter(filter === k ? null : k)} style={{ background: filter === k ? STAT_COL[k]+"44" : "transparent", border: `1px solid ${filter === k ? STAT_COL[k] : "#3a3a5a"}`, borderRadius: "4px", color: filter === k ? STAT_COL[k] : "#555", fontSize: "8px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>
            {STAT_JP[k]}
          </button>
        ))}
      </div>

      <input
        value={query} onChange={e => setQuery(e.target.value)}
        placeholder="ポケモン名で検索…"
        className="input-dark"
        style={{ width: "100%", marginBottom: "8px" }}
      />

      <div style={{ maxHeight: "260px", overflowY: "auto" }}>
        {results.length === 0 && <div style={{ color: "#444", fontSize: "12px", textAlign: "center", padding: "12px 0" }}>該当なし</div>}
        {results.map(p => {
          const y     = EV_YIELD[p[0] - 1];
          const parts = STAT_KEYS.map((k, ki) => y[ki] > 0 ? { key: k, val: y[ki] } : null).filter(Boolean);
          return (
            <div key={p[0]} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 2px", borderBottom: "1px solid #1a1a2e" }}>
              <span style={{ fontSize: "8px", color: "#444", minWidth: "24px" }}>{String(p[0]).padStart(3,"0")}</span>
              <span style={{ fontSize: "12px", color: "#ccc", minWidth: "80px" }}>{p[1]}</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {parts.map(({ key, val }) => (
                  <span key={key} style={{ fontSize: "8px", background: STAT_COL[key]+"22", color: STAT_COL[key], border: `1px solid ${STAT_COL[key]}44`, borderRadius: "4px", padding: "1px 4px" }}>
                    {STAT_JP[key]} +{macho ? val * 2 : val}{macho && <span style={{ fontSize: "8px", opacity: 0.7 }}>（×2）</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {macho && <div style={{ fontSize: "8px", color: "#ff6b35", marginTop: "8px" }}>🥊 強制ギプス装備中：EV×2表示</div>}
    </Panel>
  );
});

// わざ一行表示（PokedexPanel の各タブで共用）

export const PokedexPanel = React.memo(function PokedexPanel({ color, dexTarget, onDexTargetConsumed }) {
  const [open, setOpen]       = useState(false);
  const [mon,  setMon]        = useState(0);
  const [moveTab, setMoveTab]     = useState("lv");

  useEffect(() => {
    if (dexTarget == null) return;
    setMon(dexTarget);
    setOpen(true);
    onDexTargetConsumed?.();
  }, [dexTarget]);

  const p        = POKEMON_DATA[mon];
  const { lv: learnset, tm: tmMoves, egg: eggMoves, tutor: tutorMoves } = getLearnset(p[0]);
  const total    = STATS.reduce((a, s) => a + p[PD[s.key]], 0);

  const MOVE_TABS = [
    { key: "lv",    label: "レベル" },
    { key: "tm",    label: "TM/HM" },
    { key: "egg",   label: "遺伝技" },
    { key: "tutor", label: "教え技" },
  ];

  return (
    <Panel title="📖 ポケモン図鑑" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      {/* 検索 */}
      <div style={{ marginBottom: "12px" }}>
        <PokemonSearch value={mon} onSelect={setMon} color={color} />
      </div>

      {/* 種族値 */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "8px", color: "#555", marginBottom: "4px", letterSpacing: "1px" }}>種族値</div>
        {STATS.map(stat => {
          const val = p[PD[stat.key]];
          return (
            <div key={stat.key} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "8px", color: "#666", minWidth: "56px" }}>{stat.jp}</span>
              <div style={{ flex: 1, background: "#0d0d1a", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${val/255*100}%`, height: "100%", background: STAT_COL[stat.key], borderRadius: "4px" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "bold", minWidth: "28px", textAlign: "right",
                color: val >= 120 ? "#7fff7f" : val >= 80 ? "#ccc" : "#555" }}>{val}</span>
            </div>
          );
        })}
        <div style={{ textAlign: "right", fontSize: "8px", color: "#444", marginTop: "4px" }}>合計 {total}</div>
      </div>

      {/* 進化 */}
      {(() => {
        const paths = getEvoPaths(p[0]);
        const hasEvo = EVOLUTION_DATA[p[0]] !== undefined;
        return (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "8px", color: "#555", marginBottom: "4px", letterSpacing: "1px" }}>進化</div>
            {!hasEvo
              ? <div style={{ fontSize: "8px", color: "#333" }}>進化なし</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {paths.map((path, pi) => (
                    <div key={pi} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px" }}>
                      {path.map((step, si) =>
                        step.type === "cond"
                          ? <span key={si} style={{ fontSize: "8px", color: "#444", padding: "0 1px" }}>→ {step.cond} →</span>
                          : <span key={si}
                              onClick={() => step.id !== p[0] && setMon(step.id - 1)}
                              style={{
                                fontSize: "12px", padding: "1px 4px", borderRadius: "4px",
                                background: step.id === p[0] ? "#ffffff22" : "transparent",
                                color: step.id === p[0] ? "#fff" : "#666",
                                border: step.id === p[0] ? "1px solid #ffffff33" : "1px solid transparent",
                                cursor: step.id !== p[0] ? "pointer" : "default",
                              }}>
                              {step.name}
                            </span>
                      )}
                    </div>
                  ))}
                </div>
            }
          </div>
        );
      })()}

      {/* 出現場所 */}
      {(() => {
        const locations = LOCATION_DATA.flatMap(loc =>
          loc.pokemon
            .filter(pk => pk.name === p[1])
            .map(pk => ({ locName: loc.name, locVer: loc.ver, pkVer: pk.ver || "", rate: pk.rate }))
        );
        return (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "8px", color: "#555", marginBottom: "4px", letterSpacing: "1px" }}>出現場所（FR/LG）</div>
            {locations.length === 0
              ? <div style={{ fontSize: "8px", color: "#333" }}>出現しない（FR/LG）</div>
              : locations.map((loc, i) => {
                  const ver = loc.pkVer || loc.locVer;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 0", borderBottom: "1px solid #14142a" }}>
                      <div style={{ fontSize: "12px", color: "#bbb", flex: 1 }}>{loc.locName}</div>
                      {ver && <div style={{ fontSize: "8px", color: "#fff", background: ver === "FR" ? "#883030cc" : "#303088cc", borderRadius: "4px", padding: "1px 4px", flexShrink: 0 }}>{ver}</div>}
                      <div style={{ fontSize: "8px", color: "#666", flexShrink: 0 }}>{loc.rate}</div>
                    </div>
                  );
                })
            }
          </div>
        );
      })()}

      {/* わざ タブ */}
      <div>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {MOVE_TABS.map(t => (
            <button key={t.key} onClick={() => setMoveTab(t.key)}
              style={{ flex: 1, fontSize: "8px", padding: "4px 0", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit",
                background: moveTab === t.key ? color + "33" : "transparent",
                border: `1px solid ${moveTab === t.key ? color + "88" : "#3a3a5a"}`,
                color: moveTab === t.key ? color : "#555" }}>
              {t.label}
            </button>
          ))}
        </div>

        {moveTab === "lv" && (
          learnset.length === 0
            ? <div style={{ fontSize: "8px", color: "#333" }}>データなし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {learnset.map(([lv, move], i) => (
                  <MoveRow key={i} move={move} prefix={{ text: `Lv${lv}`, minWidth: "28px" }} />
                ))}
              </div>
        )}

        {moveTab === "tm" && (
          tmMoves.length === 0
            ? <div style={{ fontSize: "8px", color: "#333" }}>データなし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {tmMoves.map((id, i) => (
                  <MoveRow key={i} move={TM_LIST[id] || id} prefix={{ text: id, minWidth: "36px" }} />
                ))}
              </div>
        )}

        {moveTab === "egg" && (
          eggMoves.length === 0
            ? <div style={{ fontSize: "8px", color: "#333" }}>遺伝技なし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {eggMoves.map((move, i) => <MoveRow key={i} move={move} />)}
              </div>
        )}

        {moveTab === "tutor" && (
          tutorMoves.length === 0
            ? <div style={{ fontSize: "8px", color: "#333" }}>教え技なし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {tutorMoves.map((move, i) => <MoveRow key={i} move={move} />)}
              </div>
        )}

        <div style={{ fontSize: "8px", color: "#333", marginTop: "4px" }}>※わざデータはFR/LG準拠（PokéAPI確認済み）</div>
      </div>
    </Panel>
  );
});


export const TypeChart = React.memo(function TypeChart({ color }) {
  const [open, setOpen] = useState(false);

  const TYPES = ["ノーマル","ほのお","みず","でんき","くさ","こおり","かくとう","どく","じめん","ひこう","エスパー","むし","いわ","ゴースト","りゅう","あく","はがね"];

  // [攻撃タイプ][防御タイプ] の倍率（Gen III準拠）
  const CHART = [
    [1,1,1,1,1,1,1,1,1,1,1,1,.5,0,1,1,.5],     // ノーマル
    [1,.5,.5,1,2,2,1,1,1,1,1,2,.5,1,.5,1,2],    // ほのお
    [1,2,.5,1,.5,1,1,1,2,1,1,1,2,1,.5,1,1],     // みず
    [1,1,2,.5,.5,1,1,1,0,2,1,1,1,1,.5,1,1],     // でんき
    [1,.5,2,1,.5,1,1,.5,2,.5,1,.5,2,1,.5,1,.5], // くさ
    [1,.5,.5,1,2,.5,1,1,2,2,1,1,1,1,2,1,.5],    // こおり
    [2,1,1,1,1,2,1,.5,1,.5,.5,.5,2,0,1,2,2],    // かくとう
    [1,1,1,1,2,1,1,.5,1,1,1,1,.5,.5,1,1,0],     // どく
    [1,2,1,2,.5,1,1,2,1,0,1,.5,2,1,1,1,2],      // じめん
    [1,1,1,.5,2,1,2,1,1,1,1,2,.5,1,1,1,.5],     // ひこう
    [1,1,1,1,1,1,2,2,1,1,.5,1,1,1,1,0,.5],      // エスパー
    [1,.5,1,1,2,1,.5,.5,1,.5,2,1,1,.5,1,2,.5],  // むし
    [1,2,1,1,1,2,.5,1,.5,2,1,2,1,1,1,1,.5],     // いわ
    [0,1,1,1,1,1,1,1,1,1,2,1,1,2,1,.5,.5],      // ゴースト
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,.5],       // りゅう
    [1,1,1,1,1,1,.5,1,1,1,2,1,1,2,1,.5,1],      // あく
    [1,.5,.5,.5,.5,2,1,0,1,1,1,1,2,1,1,1,.5],   // はがね
  ];

  const cellStyle = (val) => {
    if (val === 0)   return { bg: "#111",    fg: "#333",    text: "✕" };
    if (val === 2)   return { bg: "#1a3a1a", fg: "#7fff7f", text: "2" };
    if (val === 0.5) return { bg: "#3a1a1a", fg: "#ff8888", text: "½" };
    return { bg: "transparent", fg: "#222", text: "·" };
  };

  return (
    <Panel title="⚔ タイプ相性表（Gen III）" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ fontSize: "8px", color: "#555", marginBottom: "8px" }}>縦＝攻撃タイプ　横＝防御タイプ</div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "8px", width: "max-content", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <td style={{ width: "44px" }} />
              {TYPES.map(t => (
                <th key={t} style={{ width: "16px", padding: "1px", textAlign: "center",
                  color: TYPE_COLORS[t] || "#888", fontWeight: "normal",
                  writingMode: "vertical-rl", height: "48px", verticalAlign: "bottom" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHART.map((row, ri) => (
              <tr key={TYPES[ri]}>
                <td style={{ padding: "1px 4px 1px 0", color: TYPE_COLORS[TYPES[ri]] || "#888",
                  textAlign: "right", whiteSpace: "nowrap", fontSize: "8px" }}>
                  {TYPES[ri]}
                </td>
                {row.map((val, ci) => {
                  const s = cellStyle(val);
                  return (
                    <td key={ci} style={{ textAlign: "center", padding: "1px 0",
                      background: s.bg, color: s.fg, border: "1px solid #111" }}>
                      {s.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "8px" }}>
        <span style={{ color: "#7fff7f" }}>2 ばつぐん</span>
        <span style={{ color: "#ff8888" }}>½ いまひとつ</span>
        <span style={{ color: "#444" }}>✕ こうかなし</span>
      </div>
    </Panel>
  );
});

export const LocationGuide = React.memo(function LocationGuide({ color }) {
  const [open, setOpen] = useState(false);
  const [ver, setVer] = useState("all");

  const filterPokemon = (plist) => {
    if (ver === "fr") return plist.filter(p => p.ver !== "LG");
    if (ver === "lg") return plist.filter(p => p.ver !== "FR");
    return plist;
  };

  const list = LOCATION_DATA
    .filter(loc => ver === "fr" ? loc.ver !== "LG" : ver === "lg" ? loc.ver !== "FR" : true)
    .map(loc => ({ ...loc, pokemon: filterPokemon(loc.pokemon) }))
    .filter(loc => loc.pokemon.length > 0);

  return (
    <Panel title="🗺 場所別出現ポケモン（FR/LG）" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[["all","すべて"],["fr","FR"],["lg","LG"]].map(([v, label]) => (
          <button key={v} onClick={() => setVer(v)}
            style={{ fontSize: "8px", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", border: "1px solid", fontFamily: "inherit",
              background: ver === v ? "#1a1a3e" : "transparent",
              borderColor: ver === v ? "#5555cc" : "#333",
              color: ver === v ? "#aaaaff" : "#555" }}>
            {label}
          </button>
        ))}
      </div>
      {list.map(loc => (
        <div key={loc.name + loc.ver} style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <span style={{ fontSize: "8px", color: "#bbb" }}>{loc.name}</span>
            <VerBadge v={loc.ver} />
            {loc.note && <span style={{ fontSize: "8px", color: "#555" }}>{loc.note}</span>}
          </div>
          {loc.pokemon.map(p => (
            <div key={p.name + (p.ver||"")} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "8px", marginBottom: "4px", paddingLeft: "8px" }}>
              <span style={{ color: "#ccc", minWidth: "72px" }}>{p.name}</span>
              {ver === "all" && <VerBadge v={p.ver} />}
              {Object.entries(p.evs).map(([st, val]) => (
                <span key={st} style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "4px",
                  background: STAT_COL[st] + "22", color: STAT_COL[st], border: `1px solid ${STAT_COL[st]}44` }}>
                  {STAT_JP[st]} +{val}
                </span>
              ))}
              <span style={{ fontSize: "8px", color: p.best ? "#7fff7f" : "#555", marginLeft: "auto" }}>{p.rate}{p.best ? "★" : ""}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ fontSize: "8px", color: "#333", marginTop: "4px" }}>強制ギプス装備で獲得EV×2</div>
    </Panel>
  );
});

// ─── nature picker ───────────────────────────────────────────────────────────

export const MoveTutorPanel = React.memo(function MoveTutorPanel({ color }) {
  const [open, setOpen] = useState(false);

  return (
    <Panel title="📖 教え技の場所" open={open} onToggle={() => setOpen(o => !o)} color={color}>
      {TUTOR_LOCATIONS.map((t, i) => {
        const md = MOVE_DATA[t.move];
        const tc = md ? (TYPE_COLORS[md[0]] || "#555") : "#555";
        return (
          <div key={t.move} style={{
            padding: "4px 2px",
            borderBottom: i < TUTOR_LOCATIONS.length - 1 ? "1px solid #1a2a3a" : "none",
          }}>
            <span style={{
              fontSize: "8px", padding: "1px 4px", borderRadius: "4px",
              background: tc + "22", color: tc, border: `1px solid ${tc}44`,
              whiteSpace: "nowrap",
            }}>{md ? md[0] : "？"}</span>
            <div style={{ fontSize: "12px", color: "#e8e8e8", marginTop: "4px" }}>{t.move}</div>
            <div style={{ fontSize: "8px", color: color + "cc", marginTop: "1px" }}>{t.location}</div>
            <div style={{ fontSize: "8px", color: "#555", marginTop: "1px" }}>{t.note}</div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", marginTop: "8px", letterSpacing: "1px" }}>
        FR/LG · すべて1回限り
      </div>
    </Panel>
  );
});

export const MoveReversePanel = React.memo(function MoveReversePanel({ color }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState("");
  const [showSug, setShowSug] = useState(false);

  const suggestions = query.length >= 1
    ? ALL_MOVES.filter(m => m.includes(query)).slice(0, 10)
    : [];

  const results = React.useMemo(() => {
    if (!chosen) return null;
    const list = [];
    for (const p of POKEMON_DATA) {
      const dexId = p[0];
      const name  = p[1];
      const { lv, tm, egg, tutor } = getLearnset(dexId);
      const methods = [];
      for (const [lvNum, moveName] of lv) {
        if (moveName === chosen) { methods.push(`Lv${lvNum}`); break; }
      }
      for (const tmId of tm) {
        if (TM_LIST[tmId] === chosen) { methods.push(tmId); break; }
      }
      if (egg.includes(chosen))   methods.push("遺伝");
      if (tutor.includes(chosen)) methods.push("教え");
      if (methods.length > 0) list.push({ dexId, name, methods });
    }
    return list;
  }, [chosen]);

  const select = (move) => {
    setChosen(move);
    setQuery(move);
    setShowSug(false);
  };

  return (
    <Panel title="🔍 わざ逆引き" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setChosen(""); setShowSug(true); }}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder="わざ名を入力…"
          style={{ width: "100%", background: "#0e0e1e", border: "1px solid #2a2a4a",
            borderRadius: showSug && suggestions.length > 0 ? "8px 8px 0 0" : "8px",
            color: "#ddd", fontSize: "12px", padding: "8px",
            fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        />
        {showSug && suggestions.length > 0 && (
          <div style={{ position: "absolute", zIndex: 10, width: "100%", background: "#0d1a2e",
            border: "1px solid #2a2a4a", borderTop: "none", borderRadius: "0 0 8px 8px", maxHeight: "160px", overflowY: "auto" }}>
            {suggestions.map(m => (
              <div key={m} onMouseDown={() => select(m)}
                style={{ padding: "8px", cursor: "pointer", fontSize: "12px", color: "#ccc", borderBottom: "1px solid #1a2a3a" }}
                onMouseEnter={e => e.currentTarget.style.background = color + "22"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >{m}</div>
            ))}
          </div>
        )}
      </div>

      {chosen && results !== null && (
        results.length === 0
          ? <div style={{ fontSize: "8px", color: "#444", textAlign: "center", padding: "8px 0" }}>覚えるポケモンなし</div>
          : <div>
              <div style={{ fontSize: "8px", color: "#444", marginBottom: "8px" }}>{results.length}匹が習得</div>
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {results.map(({ dexId, name, methods }) => (
                  <div key={dexId} style={{ display: "flex", alignItems: "center", gap: "8px",
                    padding: "4px 2px", borderBottom: "1px solid #111" }}>
                    <span style={{ fontSize: "8px", color: "#333", minWidth: "24px" }}>#{dexId}</span>
                    <span style={{ fontSize: "12px", color: "#ccc", flex: 1 }}>{name}</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {methods.map(m => (
                        <span key={m} style={{
                          fontSize: "8px", padding: "1px 4px", borderRadius: "4px",
                          background: m.startsWith("Lv") ? color + "22" : m.startsWith("TM") || m.startsWith("HM") ? "#1a2a3a" : m === "遺伝" ? "#1a1a3a" : "#2a1a2a",
                          color: m.startsWith("Lv") ? color : m.startsWith("TM") || m.startsWith("HM") ? "#7bb8e8" : m === "遺伝" ? "#a87ee8" : "#e87eb8",
                          border: `1px solid ${m.startsWith("Lv") ? color + "44" : "#2a2a4a"}`,
                        }}>{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
      )}
      {!chosen && (
        <div style={{ fontSize: "8px", color: "#2a2a4a", textAlign: "center", padding: "8px 0" }}>
          わざ名を入力して検索
        </div>
      )}
    </Panel>
  );
});

// ─────────────────────────────────────────
// EV稼ぎ効率ランキング
// ─────────────────────────────────────────

export const EVRankPanel = React.memo(function EVRankPanel({ color }) {
  const [open, setOpen] = useState(false);
  const [stat, setStat] = useState("hp");

  const statIdx = { hp:0, atk:1, def:2, spa:3, spd:4, spe:5 };

  const ranked = React.useMemo(() => {
    const si = statIdx[stat];
    return POKEMON_DATA
      .map(p => ({ dexId: p[0], name: p[1], ev: EV_YIELD[p[0] - 1][si] }))
      .filter(e => e.ev > 0)
      .sort((a, b) => b.ev - a.ev || a.dexId - b.dexId);
  }, [stat]);

  return (
    <Panel title="📊 EV獲得ランキング" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
        {STATS.map(s => (
          <button key={s.key} onClick={() => setStat(s.key)} style={{
            fontSize: "8px", padding: "4px 8px", borderRadius: "4px", cursor: "pointer",
            fontFamily: "inherit", border: `1px solid ${stat === s.key ? STAT_COL[s.key] : "#2a2a4a"}`,
            background: stat === s.key ? STAT_COL[s.key] + "22" : "transparent",
            color: stat === s.key ? STAT_COL[s.key] : "#555",
          }}>{s.jp}</button>
        ))}
      </div>
      <div style={{ fontSize: "8px", color: "#333", marginBottom: "8px" }}>{ranked.length}匹が{STATS.find(s=>s.key===stat).jp}EV付与</div>
      <div style={{ maxHeight: "280px", overflowY: "auto" }}>
        {ranked.map(({ dexId, name, ev }) => (
          <div key={dexId} style={{ display: "flex", alignItems: "center", gap: "8px",
            padding: "4px 2px", borderBottom: "1px solid #111" }}>
            <span style={{ fontSize: "8px", color: "#333", minWidth: "24px" }}>#{dexId}</span>
            <span style={{ fontSize: "12px", color: "#ccc", flex: 1 }}>{name}</span>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: STAT_COL[stat], minWidth: "20px", textAlign: "right" }}>+{ev}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "8px", color: "#333", marginTop: "4px" }}>強制ギプス装備で×2</div>
    </Panel>
  );
});

// ─────────────────────────────────────────
// 種族値ランキング
// ─────────────────────────────────────────

export const StatRankPanel = React.memo(function StatRankPanel({ color }) {
  const [open, setOpen] = useState(false);
  const [stat, setStat] = useState("hp");

  const ALL_STATS = [{ key: "total", jp: "合計" }, ...STATS];

  const ranked = React.useMemo(() => {
    return POKEMON_DATA.map(p => {
      const total = STATS.reduce((a, s) => a + p[PD[s.key]], 0);
      return { dexId: p[0], name: p[1], val: stat === "total" ? total : p[PD[stat]], total };
    }).sort((a, b) => b.val - a.val || a.dexId - b.dexId);
  }, [stat]);

  const maxVal = ranked[0]?.val || 1;
  const statColor = stat === "total" ? "#aaaaff" : STAT_COL[stat];

  return (
    <Panel title="🏆 種族値ランキング" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
        {ALL_STATS.map(s => (
          <button key={s.key} onClick={() => setStat(s.key)} style={{
            fontSize: "8px", padding: "4px 8px", borderRadius: "4px", cursor: "pointer",
            fontFamily: "inherit", border: `1px solid ${stat === s.key ? (s.key === "total" ? "#aaaaff" : STAT_COL[s.key]) : "#2a2a4a"}`,
            background: stat === s.key ? (s.key === "total" ? "#aaaaff22" : STAT_COL[s.key] + "22") : "transparent",
            color: stat === s.key ? (s.key === "total" ? "#aaaaff" : STAT_COL[s.key]) : "#555",
          }}>{s.jp}</button>
        ))}
      </div>
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {ranked.map(({ dexId, name, val }, rank) => (
          <div key={dexId} style={{ display: "flex", alignItems: "center", gap: "4px",
            padding: "4px 2px", borderBottom: "1px solid #0d0d1a" }}>
            <span style={{ fontSize: "8px", color: rank < 3 ? statColor : "#2a2a4a", minWidth: "16px", textAlign: "right" }}>
              {rank + 1}
            </span>
            <span style={{ fontSize: "8px", color: "#999", minWidth: "24px" }}>#{dexId}</span>
            <span style={{ fontSize: "12px", color: "#ccc", minWidth: "72px" }}>{name}</span>
            <div style={{ flex: 1, background: "#0d0d1a", borderRadius: "2px", height: "4px", overflow: "hidden" }}>
              <div style={{ width: `${val / maxVal * 100}%`, height: "100%", background: statColor, borderRadius: "2px" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "bold", minWidth: "28px", textAlign: "right",
              color: rank === 0 ? statColor : val >= maxVal * 0.85 ? "#ccc" : "#555" }}>{val}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
});


// ===== パーティ管理 =====

export const AbilitySearch = React.memo(function AbilitySearch({ color }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");

  // 特性名 → ポケモン一覧のマップを作成
  const abilityMap = React.useMemo(() => {
    const map = {};
    ABILITY_DATA.forEach((abs, i) => {
      abs.forEach(ab => {
        if (!map[ab]) map[ab] = [];
        map[ab].push(POKEMON_DATA[i]);
      });
    });
    return map;
  }, []);

  const allAbilities = Object.keys(abilityMap).sort();

  const filtered = query.trim()
    ? allAbilities.filter(ab => ab.includes(query.trim()))
    : allAbilities;

  return (
    <Panel title="🔎 特性の逆引き" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      <input
        value={query} onChange={e => setQuery(e.target.value)}
        placeholder="特性名で検索…"
        className="input-dark"
        style={{ width: "100%", marginBottom: "8px" }}
      />
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {filtered.length === 0 && (
          <div style={{ color: "#444", fontSize: "12px", textAlign: "center", padding: "12px 0" }}>該当なし</div>
        )}
        {filtered.map(ab => (
          <div key={ab} style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "12px", color: color, fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid #1a1a2e", paddingBottom: "2px" }}>
              {ab}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {abilityMap[ab].map(p => (
                <span key={p[0]} style={{ fontSize: "8px", color: "#aaa", background: "#1a1a2e", borderRadius: "4px", padding: "1px 4px" }}>
                  {p[1]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
});


export default function ChosaTab({ color, party, allIVs, dexTarget, onDexTargetConsumed, macho, ivs, onSave, onAddToParty }) {
  return (
    <>
      <IVCompare party={party} allIVs={allIVs} color={color} />
      <PokedexPanel color={color} dexTarget={dexTarget} onDexTargetConsumed={onDexTargetConsumed} />
      <TypeChart color={color} />
      <LocationGuide color={color} />
      <IVChecker color={color} ivs={ivs} onSave={onSave} party={party} onAddToParty={onAddToParty} />
      <AbilitySearch color={color} />
      <EVSearch macho={macho} color={color} />
      <MoveTutorPanel color={color} />
      <MoveReversePanel color={color} />
      <EVRankPanel color={color} />
      <StatRankPanel color={color} />
    </>
  );
}
