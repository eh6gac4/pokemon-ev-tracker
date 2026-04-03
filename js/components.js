const { useState, useEffect, useRef } = React;

function AutoTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="input-dark"
      style={{ width: "100%", lineHeight: "1.5", fontSize: "11px", padding: "7px 10px", background: "#0d0d1a", border: "1px solid #2a2a4a" }}
    />
  );
}

function Panel({ title, open, onToggle, color, children }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <button
        onClick={onToggle}
        className="panel-toggle"
        style={{
          background: open ? "#0d1a2e" : "#16213e",
          borderColor: open ? color + "88" : "#2a2a4a",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          color: open ? color : "#555",
        }}
      >
        {title}{open ? "　▲" : "　▼"}
      </button>
      {open && (
        <div className="panel-body" style={{ borderColor: color + "44" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function StatRow({ stat, val, color, macho, onChange }) {
  const isMaxed = val >= MAX_STAT;
  const vLeft   = vitaminLeft(val);
  const steps = macho ? [[-1,"－"],[1,"＋2"],[2,"＋4"],[3,"＋6"]] : [[-1,"－"],[1,"＋1"],[2,"＋2"],[3,"＋3"]];
  return (
    <div className="card" style={{ padding: "9px 12px", borderColor: isMaxed ? "#7fff7f44" : "#2a2a4a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
        <span style={{ fontSize: "11px", minWidth: "62px", color: isMaxed ? "#7fff7f" : "#888" }}>{stat.jp}</span>
        <span style={{ fontSize: "15px", minWidth: "36px", textAlign: "right", fontWeight: "bold" }}>{val}</span>
        {isMaxed
          ? <span className="badge-max">MAX</span>
          : vLeft > 0 && <span style={{ fontSize: "8px", color: "#aaa" }}>💊×{vLeft}</span>
        }
        <div style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>
          {steps.map(([d, label], i) => (
            <button
              key={d}
              className="step-btn"
              onClick={() => onChange(d)}
              style={{
                background: d > 0 ? `${color}33` : "#1e1e3a",
                border: `1px solid ${d > 0 ? color + "55" : "#3a3a5a"}`,
                color: d > 0 ? color : "#777",
                marginLeft: i === 1 ? "10px" : undefined,
              }}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="bar-bg" style={{ height: "4px" }}>
        <div className="bar-fill" style={{ height: "100%", width: `${(val / MAX_STAT) * 100}%`, background: isMaxed ? "#7fff7f" : color, borderRadius: "3px" }} />
      </div>
    </div>
  );
}

// ─── feature components ──────────────────────────────────────────────────────

// 共通ポケモン検索コンポーネント（AddMonModal・IVChecker・PokedexPanel で共用）
function PokemonSearch({ value, onSelect, color, placeholder = "ポケモン名・番号で検索…", maxHeight = "200px" }) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);

  const p = value != null ? POKEMON_DATA[value] : null;
  const displayValue = p ? `${String(p[0]).padStart(3,"0")} ${p[1]}` : "";
  const results = open
    ? (query
        ? POKEMON_DATA.filter(r => r[1].includes(query) || String(r[0]).padStart(3,"0").includes(query))
        : POKEMON_DATA)
    : [];

  return (
    <div style={{ position: "relative" }}>
      <input
        value={open ? query : displayValue}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="input-dark"
        style={{ width: "100%" }}
      />
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#16213e", border: "1px solid #3a3a5a", borderTop: "none", borderRadius: "0 0 6px 6px", maxHeight, overflowY: "auto", zIndex: 50 }}>
          {results.length === 0
            ? <div style={{ padding: "8px", fontSize: "11px", color: "#444" }}>該当なし</div>
            : results.map(r => (
                <div
                  key={r[0]}
                  className="search-item"
                  onMouseDown={() => { onSelect(r[0] - 1); setQuery(""); setOpen(false); }}
                  style={{ padding: "5px 8px", cursor: "pointer", fontSize: "12px", color: value === r[0] - 1 ? color : "#ccc", background: value === r[0] - 1 ? color + "22" : "transparent" }}
                >
                  {String(r[0]).padStart(3,"0")} {r[1]}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

function AddMonModal({ newName, newIcon, newColor, newDexId, setNewName, setNewIcon, setNewColor, setNewDexId, onAdd, onCancel, borderColor }) {

  return (
    <div className="card" style={{ padding: "14px", marginBottom: "14px", borderColor: borderColor + "55", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", letterSpacing: "2px" }}>ポケモンを追加</div>

      {/* 図鑑検索 */}
      <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>図鑑から選択</div>
      <div style={{ marginBottom: "8px" }}>
        <PokemonSearch
          value={newDexId}
          onSelect={idx => { setNewDexId(idx); setNewName(POKEMON_DATA[idx][1]); }}
          color={borderColor}
          placeholder="なまえ・番号で検索…"
          maxHeight="160px"
        />
      </div>

      {/* 表示名（図鑑選択後に自動入力、変更可） */}
      <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>表示名</div>
      <input
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !e.isComposing && onAdd()}
        placeholder="なまえ（例：ゲンガー）"
        className="input-dark"
        style={{ width: "100%", fontSize: "13px", padding: "8px 10px", marginBottom: "8px" }}
      />
      <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>アイコン</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        {ICONS.map(ic => (
          <button key={ic} onClick={() => setNewIcon(ic)} style={{ background: newIcon === ic ? "#2a2a4a" : "transparent", border: newIcon === ic ? "1px solid #888" : "1px solid transparent", borderRadius: "6px", padding: "3px 5px", cursor: "pointer", fontSize: "16px" }}>{ic}</button>
        ))}
      </div>
      <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>カラー</div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setNewColor(c)} style={{ width: "24px", height: "24px", background: c, border: newColor === c ? "2px solid #fff" : "2px solid transparent", borderRadius: "50%", cursor: "pointer" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onAdd} style={{ flex: 1, background: `${newColor}33`, border: `1px solid ${newColor}88`, borderRadius: "7px", color: newColor, fontSize: "12px", padding: "8px", cursor: "pointer", fontFamily: "inherit" }}>追加する</button>
        <button onClick={onCancel} style={{ flex: 1, background: "transparent", border: "1px solid #3a3a5a", borderRadius: "7px", color: "#666", fontSize: "12px", padding: "8px", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
      </div>
    </div>
  );
}

function IVChecker({ color }) {
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

      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ fontSize: "9px", color: "#555" }}>レベル</div>
          <input
            type="number" min="1" max="100" value={lvStr}
            onChange={e => setLvStr(e.target.value)}
            onBlur={() => setLvStr(String(lv))}
            className="input-dark"
            style={{ width: "54px", fontSize: "13px", padding: "5px 6px", textAlign: "center" }}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ fontSize: "9px", color: "#555" }}>性格</div>
          <select value={nat} onChange={e => setNat(Number(e.target.value))} className="input-dark" style={{ width: "100%", fontSize: "11px", padding: "5px 6px" }}>
            {NATURES.map((n, i) => <option key={i} value={i}>{natLabel(n)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "62px 52px 1fr 44px", gap: "3px 6px", alignItems: "center", marginBottom: "4px" }}>
        {["ステータス","努力値","実数値","個体値"].map((h, i) => (
          <div key={h} style={{ fontSize: "9px", color: "#444", textAlign: i > 0 ? "center" : undefined }}>{h}</div>
        ))}
      </div>
      {STATS.map(stat => {
        const isUp = nature.up === stat.key;
        const isDn = nature.dn === stat.key;
        return (
          <div key={stat.key} style={{ display: "grid", gridTemplateColumns: "62px 52px 1fr 44px", gap: "3px 6px", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "11px", color: isUp ? "#f5d020" : isDn ? "#ff6b6b" : "#888" }}>
              {stat.jp}{isUp ? "↑" : isDn ? "↓" : ""}
            </div>
            <input
              type="number" min="0" max="255" value={ev[stat.key]}
              onChange={e => setEV(prev => ({ ...prev, [stat.key]: Math.max(0, Math.min(255, parseInt(e.target.value) || 0)) }))}
              className="input-dark"
              style={{ fontSize: "11px", padding: "4px 5px", textAlign: "center", width: "100%", color: "#aaa" }}
            />
            <input
              type="number" min="1" value={actual[stat.key]}
              onChange={e => setActual(prev => ({ ...prev, [stat.key]: e.target.value }))}
              placeholder="実数値"
              className="input-dark"
              style={{ fontSize: "11px", padding: "4px 5px", textAlign: "center", width: "100%" }}
            />
            <div style={{ fontSize: "13px", fontWeight: "bold", color: ivColor(stat.key), textAlign: "center" }}>{ivDisp(stat.key)}</div>
          </div>
        );
      })}
      <div style={{ fontSize: "8px", color: "#333", marginTop: "6px" }}>「？」は実数値・努力値・レベルを確認してください</div>
    </Panel>
  );
}

function EVSearch({ macho, color }) {
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
        <button onClick={() => setFilter(null)} style={{ background: filter === null ? "#2a2a4a" : "transparent", border: "1px solid #3a3a5a", borderRadius: "4px", color: filter === null ? "#e8e8e8" : "#555", fontSize: "9px", padding: "3px 7px", cursor: "pointer", fontFamily: "inherit" }}>すべて</button>
        {STAT_KEYS.map(k => (
          <button key={k} onClick={() => setFilter(filter === k ? null : k)} style={{ background: filter === k ? STAT_COL[k]+"44" : "transparent", border: `1px solid ${filter === k ? STAT_COL[k] : "#3a3a5a"}`, borderRadius: "4px", color: filter === k ? STAT_COL[k] : "#555", fontSize: "9px", padding: "3px 7px", cursor: "pointer", fontFamily: "inherit" }}>
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
        {results.length === 0 && <div style={{ color: "#444", fontSize: "11px", textAlign: "center", padding: "12px 0" }}>該当なし</div>}
        {results.map(p => {
          const y     = EV_YIELD[p[0] - 1];
          const parts = STAT_KEYS.map((k, ki) => y[ki] > 0 ? { key: k, val: y[ki] } : null).filter(Boolean);
          return (
            <div key={p[0]} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 2px", borderBottom: "1px solid #1a1a2e" }}>
              <span style={{ fontSize: "9px", color: "#444", minWidth: "24px" }}>{String(p[0]).padStart(3,"0")}</span>
              <span style={{ fontSize: "11px", color: "#ccc", minWidth: "80px" }}>{p[1]}</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {parts.map(({ key, val }) => (
                  <span key={key} style={{ fontSize: "10px", background: STAT_COL[key]+"22", color: STAT_COL[key], border: `1px solid ${STAT_COL[key]}44`, borderRadius: "3px", padding: "1px 5px" }}>
                    {STAT_JP[key]} +{macho ? val * 2 : val}{macho && <span style={{ fontSize: "8px", opacity: 0.7 }}>（×2）</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {macho && <div style={{ fontSize: "8px", color: "#ff6b35", marginTop: "6px" }}>🥊 強制ギプス装備中：EV×2表示</div>}
    </Panel>
  );
}

// わざ一行表示（PokedexPanel の各タブで共用）
function MoveRow({ move, prefix = null }) {
  const md = MOVE_DATA[move];
  const tc = md ? (TYPE_COLORS[md[0]] || "#555") : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 2px", borderBottom: "1px solid #14142a" }}>
      {prefix != null && (
        <div style={{ fontSize: "9px", color: "#666", background: "#1a1a2e", borderRadius: "3px", padding: "1px 4px", minWidth: prefix.minWidth, textAlign: "center", flexShrink: 0 }}>
          {prefix.text}
        </div>
      )}
      {tc
        ? <div style={{ fontSize: "8px", color: "#fff", background: tc + "cc", borderRadius: "3px", padding: "1px 3px", whiteSpace: "nowrap", flexShrink: 0 }}>{md[0]}</div>
        : <div style={{ fontSize: "8px", color: "#333", background: "#1a1a2e", borderRadius: "3px", padding: "1px 3px", flexShrink: 0 }}>?</div>
      }
      <div style={{ fontSize: "11px", color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{move}</div>
      {md && (
        <div style={{ fontSize: "8px", color: "#555", whiteSpace: "nowrap", display: "flex", gap: "3px", flexShrink: 0 }}>
          <span style={{ color: md[1] !== null ? "#b0a0d8" : "#383848" }}>P:{md[1] !== null ? md[1] : "---"}</span>
          <span style={{ color: md[2] !== null ? "#6898b8" : "#383848" }}>A:{md[2] !== null ? md[2] : "---"}</span>
          <span style={{ color: "#484858" }}>PP:{md[3]}</span>
        </div>
      )}
    </div>
  );
}

function PokedexPanel({ color }) {
  const [open, setOpen]       = useState(false);
  const [mon,  setMon]        = useState(0);
  const [moveTab, setMoveTab]     = useState("lv");

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
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "5px", letterSpacing: "1px" }}>種族値</div>
        {STATS.map(stat => {
          const val = p[PD[stat.key]];
          return (
            <div key={stat.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", color: "#666", minWidth: "54px" }}>{stat.jp}</span>
              <div style={{ flex: 1, background: "#0d0d1a", borderRadius: "3px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${val/255*100}%`, height: "100%", background: STAT_COL[stat.key], borderRadius: "3px" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "bold", minWidth: "28px", textAlign: "right",
                color: val >= 120 ? "#7fff7f" : val >= 80 ? "#ccc" : "#555" }}>{val}</span>
            </div>
          );
        })}
        <div style={{ textAlign: "right", fontSize: "9px", color: "#444", marginTop: "2px" }}>合計 {total}</div>
      </div>

      {/* 進化 */}
      {(() => {
        const paths = getEvoPaths(p[0]);
        const hasEvo = EVOLUTION_DATA[p[0]] !== undefined;
        return (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", color: "#555", marginBottom: "5px", letterSpacing: "1px" }}>進化</div>
            {!hasEvo
              ? <div style={{ fontSize: "10px", color: "#333" }}>進化なし</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {paths.map((path, pi) => (
                    <div key={pi} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px" }}>
                      {path.map((step, si) =>
                        step.type === "cond"
                          ? <span key={si} style={{ fontSize: "9px", color: "#444", padding: "0 1px" }}>→ {step.cond} →</span>
                          : <span key={si}
                              onClick={() => step.id !== p[0] && setMon(step.id - 1)}
                              style={{
                                fontSize: "11px", padding: "1px 5px", borderRadius: "4px",
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
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", color: "#555", marginBottom: "5px", letterSpacing: "1px" }}>出現場所（FR/LG）</div>
            {locations.length === 0
              ? <div style={{ fontSize: "10px", color: "#333" }}>出現しない（FR/LG）</div>
              : locations.map((loc, i) => {
                  const ver = loc.pkVer || loc.locVer;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 0", borderBottom: "1px solid #14142a" }}>
                      <div style={{ fontSize: "11px", color: "#bbb", flex: 1 }}>{loc.locName}</div>
                      {ver && <div style={{ fontSize: "8px", color: "#fff", background: ver === "FR" ? "#883030cc" : "#303088cc", borderRadius: "3px", padding: "1px 4px", flexShrink: 0 }}>{ver}</div>}
                      <div style={{ fontSize: "9px", color: "#666", flexShrink: 0 }}>{loc.rate}</div>
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
              style={{ flex: 1, fontSize: "10px", padding: "4px 0", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit",
                background: moveTab === t.key ? color + "33" : "transparent",
                border: `1px solid ${moveTab === t.key ? color + "88" : "#3a3a5a"}`,
                color: moveTab === t.key ? color : "#555" }}>
              {t.label}
            </button>
          ))}
        </div>

        {moveTab === "lv" && (
          learnset.length === 0
            ? <div style={{ fontSize: "10px", color: "#333" }}>データなし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {learnset.map(([lv, move], i) => (
                  <MoveRow key={i} move={move} prefix={{ text: `Lv${lv}`, minWidth: "28px" }} />
                ))}
              </div>
        )}

        {moveTab === "tm" && (
          tmMoves.length === 0
            ? <div style={{ fontSize: "10px", color: "#333" }}>データなし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {tmMoves.map((entry, i) => {
                  const tmLabel = (entry.match(/（([TH]M\d+)）/) || [])[1] || "";
                  const move    = entry.replace(/（[TH]M\d+）/, "").trim();
                  return <MoveRow key={i} move={move} prefix={{ text: tmLabel, minWidth: "36px" }} />;
                })}
              </div>
        )}

        {moveTab === "egg" && (
          eggMoves.length === 0
            ? <div style={{ fontSize: "10px", color: "#333" }}>遺伝技なし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {eggMoves.map((move, i) => <MoveRow key={i} move={move} />)}
              </div>
        )}

        {moveTab === "tutor" && (
          tutorMoves.length === 0
            ? <div style={{ fontSize: "10px", color: "#333" }}>教え技なし</div>
            : <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {tutorMoves.map((move, i) => <MoveRow key={i} move={move} />)}
              </div>
        )}

        <div style={{ fontSize: "8px", color: "#333", marginTop: "5px" }}>※わざデータはFR/LG準拠（PokéAPI確認済み）</div>
      </div>
    </Panel>
  );
}

function EVGuide({ color }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel title="📖 EV稼ぎガイド（FR/LG）" open={open} onToggle={() => setOpen(v => !v)} color={color}>
      {EV_GUIDE.map(({ stat, jp, spots }) => (
        <div key={stat} style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px", letterSpacing: "1px" }}>{jp}</div>
          {spots.map(s => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", marginBottom: "3px", paddingLeft: "4px" }}>
              <span style={{ color: "#ccc", minWidth: "72px" }}>{s.name}</span>
              <span style={{ color: "#7fff7f", minWidth: "24px", textAlign: "right" }}>+{s.ev}</span>
              <span style={{ color: "#444" }}>{s.note}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ fontSize: "8px", color: "#333", marginTop: "4px" }}>強制ギプス装備で獲得EV×2</div>
    </Panel>
  );
}

function TypeChart({ color }) {
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
      <div style={{ fontSize: "8px", color: "#555", marginBottom: "6px" }}>縦＝攻撃タイプ　横＝防御タイプ</div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "8px", width: "max-content", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <td style={{ width: "44px" }} />
              {TYPES.map(t => (
                <th key={t} style={{ width: "14px", padding: "1px", textAlign: "center",
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
}

function VerBadge({ v }) {
  if (!v) return null;
  const isFR = v === "FR";
  return (
    <span style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", flexShrink: 0,
      background: isFR ? "#cc222233" : "#2244cc33",
      color:      isFR ? "#ff8888"   : "#8888ff",
      border: `1px solid ${isFR ? "#cc222255" : "#2244cc55"}` }}>{v}</span>
  );
}

function LocationGuide({ color }) {
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
      <div style={{ display: "flex", gap: "5px", marginBottom: "12px" }}>
        {[["all","すべて"],["fr","FR"],["lg","LG"]].map(([v, label]) => (
          <button key={v} onClick={() => setVer(v)}
            style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", cursor: "pointer", border: "1px solid", fontFamily: "inherit",
              background: ver === v ? "#1a1a3e" : "transparent",
              borderColor: ver === v ? "#5555cc" : "#333",
              color: ver === v ? "#aaaaff" : "#555" }}>
            {label}
          </button>
        ))}
      </div>
      {list.map(loc => (
        <div key={loc.name + loc.ver} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#bbb" }}>{loc.name}</span>
            <VerBadge v={loc.ver} />
            {loc.note && <span style={{ fontSize: "8px", color: "#555" }}>{loc.note}</span>}
          </div>
          {loc.pokemon.map(p => (
            <div key={p.name + (p.ver||"")} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", marginBottom: "3px", paddingLeft: "8px" }}>
              <span style={{ color: "#ccc", minWidth: "72px" }}>{p.name}</span>
              {ver === "all" && <VerBadge v={p.ver} />}
              {Object.entries(p.evs).map(([st, val]) => (
                <span key={st} style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px",
                  background: STAT_COL[st] + "22", color: STAT_COL[st], border: `1px solid ${STAT_COL[st]}44` }}>
                  {STAT_JP[st]} +{val}
                </span>
              ))}
              <span style={{ fontSize: "9px", color: p.best ? "#7fff7f" : "#555", marginLeft: "auto" }}>{p.rate}{p.best ? "★" : ""}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ fontSize: "8px", color: "#333", marginTop: "4px" }}>強制ギプス装備で獲得EV×2</div>
    </Panel>
  );
}

// ─── nature picker ───────────────────────────────────────────────────────────

const natLabel = (n) => n.up
  ? `${n.name}（↑${STAT_JP[n.up]} / ↓${STAT_JP[n.dn]}）`
  : `${n.name}（補正なし）`;

function NaturePicker({ value, color, onChange }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? NATURES.filter(n => n.name.includes(query.trim()))
    : NATURES;

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  const current = NATURES.find(n => n.name === value) || null;

  return (
    <div className="card" style={{ padding: "10px 12px", marginBottom: "10px", borderColor: color + "22" }}>
      <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", letterSpacing: "1px" }}>性格</div>
      <button
        onClick={() => { setOpen(v => !v); if (!open) setTimeout(() => inputRef.current?.focus(), 30); setQuery(""); }}
        style={{
          width: "100%", textAlign: "left", fontFamily: "inherit",
          background: open ? color + "22" : "#16213e",
          border: `1px solid ${open ? color : "#2a2a4a"}`,
          borderRadius: open ? "6px 6px 0 0" : "6px",
          padding: "7px 10px", cursor: "pointer",
          color: current ? "#e8e8e8" : "#444", fontSize: "12px",
        }}
      >
        {current ? (
          <>
            <span style={{ color: color, marginRight: "6px" }}>{current.name}</span>
            {current.up
              ? <span style={{ fontSize: "10px", color: "#888" }}>↑{STAT_JP[current.up]} / ↓{STAT_JP[current.dn]}</span>
              : <span style={{ fontSize: "10px", color: "#888" }}>補正なし</span>}
          </>
        ) : "── 未設定 ──"}
      </button>
      {open && (
        <div style={{ background: "#0d1b2a", border: `1px solid ${color}44`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: "6px" }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="性格名で検索…"
              style={{ flex: 1, background: "#16213e", border: `1px solid ${color}44`, borderRadius: "4px", padding: "5px 8px", color: "#e8e8e8", fontFamily: "inherit", fontSize: "11px", outline: "none" }}
            />
            {value && (
              <button onClick={() => select("")} style={{ background: "transparent", border: "1px solid #ff444466", borderRadius: "4px", color: "#ff6666", fontSize: "10px", padding: "5px 8px", cursor: "pointer", fontFamily: "inherit" }}>
                クリア
              </button>
            )}
          </div>
          <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {filtered.map(n => (
              <button key={n.name} onClick={() => select(n.name)}
                style={{
                  textAlign: "left", background: n.name === value ? color + "33" : "transparent",
                  border: "none", borderRadius: "3px", padding: "4px 8px",
                  color: n.name === value ? color : "#aaa", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span>{n.name}</span>
                {n.up
                  ? <span style={{ fontSize: "10px", color: "#555" }}>↑{STAT_JP[n.up]} / ↓{STAT_JP[n.dn]}</span>
                  : <span style={{ fontSize: "10px", color: "#555" }}>補正なし</span>}
              </button>
            ))}
            {filtered.length === 0 && <div style={{ color: "#444", fontSize: "11px", padding: "4px 8px" }}>該当なし</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

function MovePicker({ moves, color, onChange, learnableMoves, learnset }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const [query, setQuery]           = useState("");
  const inputRef = useRef(null);

  const moveList = learnableMoves || ALL_MOVES;
  const filtered = query.trim()
    ? moveList.filter(m => m.includes(query.trim()))
    : moveList;

  const select = (move) => {
    onChange(activeSlot, move);
    setActiveSlot(null);
    setQuery("");
  };

  const openSlot = (i) => {
    setActiveSlot(i);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const renderMoveBtn = (m, badge, currentMove) => {
    const mmd = MOVE_DATA[m];
    const mtc = mmd ? (TYPE_COLORS[mmd[0]] || "#555") : null;
    return (
      <button key={badge ? `${m}__${badge}` : m} onClick={() => select(m)}
        style={{
          textAlign: "left", background: m === currentMove ? color + "33" : "transparent",
          border: "none", borderRadius: "3px", padding: "3px 8px",
          color: m === currentMove ? color : "#aaa", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        {badge && <span style={{ fontSize: "8px", color: "#778", background: "#0e1828", borderRadius: "3px", padding: "1px 4px", flexShrink: 0, minWidth: "34px", textAlign: "center" }}>{badge}</span>}
        {mtc
          ? <span style={{ fontSize: "8px", color: "#fff", background: mtc + "cc", borderRadius: "3px", padding: "1px 3px", whiteSpace: "nowrap", flexShrink: 0 }}>{mmd[0]}</span>
          : <span style={{ fontSize: "8px", color: "#333", background: "#1a1a2e", borderRadius: "3px", padding: "1px 3px", flexShrink: 0 }}>?</span>
        }
        <span style={{ flex: 1 }}>{m}</span>
        {mmd && <span style={{ fontSize: "8px", color: "#555", display: "flex", gap: "3px", flexShrink: 0 }}>
          <span style={{ color: mmd[1] !== null ? "#b0a0d8" : "#383848" }}>P:{mmd[1] !== null ? mmd[1] : "---"}</span>
          <span style={{ color: mmd[2] !== null ? "#6898b8" : "#383848" }}>A:{mmd[2] !== null ? mmd[2] : "---"}</span>
          <span style={{ color: "#484858" }}>PP:{mmd[3]}</span>
        </span>}
      </button>
    );
  };

  const renderGroupedList = (currentMove) => {
    const { lv, tm, egg, tutor } = learnset;
    const lvSeen = new Set();
    const lvUniq = lv.filter(([, name]) => {
      if (lvSeen.has(name)) return false;
      lvSeen.add(name);
      return true;
    });
    const sections = [
      { key: "lv",    label: "レベルアップ", items: lvUniq.map(([lvl, name]) => ({ name, badge: `Lv.${lvl}` })) },
      { key: "tm",    label: "TM・HM",       items: tm.map(entry => {
        const name  = entry.replace(/（[TH]M\d+）/, "").trim();
        const badge = (entry.match(/（([TH]M\d+)）/) || [])[1] || "";
        return { name, badge };
      })},
      { key: "egg",   label: "遺伝技",       items: egg.map(name => ({ name, badge: null })) },
      { key: "tutor", label: "教え技",       items: tutor.map(name => ({ name, badge: null })) },
    ].filter(s => s.items.length > 0);

    return sections.flatMap((s, si) => [
      <div key={`hdr-${s.key}`} style={{ fontSize: "9px", color: "#556", padding: "4px 8px 2px", letterSpacing: "1px", background: "#0a1220", marginTop: si > 0 ? "3px" : 0 }}>{s.label}</div>,
      ...s.items.map(({ name, badge }) => renderMoveBtn(name, badge, currentMove)),
    ]);
  };

  return (
    <div className="card" style={{ padding: "10px 12px", marginBottom: "10px", borderColor: color + "22" }}>
      <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", letterSpacing: "1px" }}>技セット</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {moves.map((move, i) => {
          const md = move ? MOVE_DATA[move] : null;
          const tc = md ? (TYPE_COLORS[md[0]] || "#555") : null;
          return (
          <div key={i}>
            <button
              onClick={() => { if (activeSlot === i) { setActiveSlot(null); setQuery(""); } else { openSlot(i); } }}
              style={{
                width: "100%", textAlign: "left", fontFamily: "inherit",
                background: activeSlot === i ? color + "22" : "#16213e",
                border: `1px solid ${activeSlot === i ? color : "#2a2a4a"}`,
                borderRadius: activeSlot === i ? "6px 6px 0 0" : "6px",
                padding: "7px 10px", cursor: "pointer",
                color: move ? "#e8e8e8" : "#444", fontSize: "12px",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <span style={{ color: color, fontSize: "10px", flexShrink: 0 }}>わざ{i + 1}</span>
              {tc && <span style={{ fontSize: "8px", color: "#fff", background: tc + "cc", borderRadius: "3px", padding: "1px 3px", flexShrink: 0 }}>{md[0]}</span>}
              <span style={{ flex: 1 }}>{move || "── 未設定 ──"}</span>
              {md && <span style={{ fontSize: "8px", color: "#555", display: "flex", gap: "3px", flexShrink: 0 }}>
                <span style={{ color: md[1] !== null ? "#b0a0d8" : "#383848" }}>P:{md[1] !== null ? md[1] : "---"}</span>
                <span style={{ color: md[2] !== null ? "#6898b8" : "#383848" }}>A:{md[2] !== null ? md[2] : "---"}</span>
                <span style={{ color: "#484858" }}>PP:{md[3]}</span>
              </span>}
            </button>
            {activeSlot === i && (
              <div style={{ background: "#0d1b2a", border: `1px solid ${color}44`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: "6px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="技名で検索…"
                    style={{ flex: 1, background: "#16213e", border: `1px solid ${color}44`, borderRadius: "4px", padding: "5px 8px", color: "#e8e8e8", fontFamily: "inherit", fontSize: "11px", outline: "none" }}
                  />
                  {move && (
                    <button onClick={() => select("")} style={{ background: "transparent", border: "1px solid #ff444466", borderRadius: "4px", color: "#ff6666", fontSize: "10px", padding: "5px 8px", cursor: "pointer", fontFamily: "inherit" }}>
                      クリア
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {!query.trim() && learnset
                    ? renderGroupedList(move)
                    : filtered.slice(0, 100).map(m => renderMoveBtn(m, null, move))
                  }
                  {query.trim() && filtered.length === 0 && <div style={{ color: "#444", fontSize: "11px", padding: "4px 8px" }}>該当なし</div>}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function AdventureTab({ color }) {
  const [checked,   setChecked]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("ev-adventure") || "{}"); }
    catch { return {}; }
  });
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    localStorage.setItem("ev-adventure", JSON.stringify(checked));
  }, [checked]);

  const toggle      = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleArea  = (area) => setCollapsed(prev => ({ ...prev, [area]: !prev[area] }));

  const totalItems   = FIELD_ITEMS.reduce((s, a) => s + a.items.length, 0);
  const totalChecked = FIELD_ITEMS.reduce((s, a) => s + a.items.filter(i => checked[i.id]).length, 0);

  const TYPE_META = {
    field:  { label: "拾う",   bg: "#1a3a1a", col: "#7fff7f" },
    gift:   { label: "もらう", bg: "#1a2a3a", col: "#5ecde5" },
    gym:    { label: "ジム",   bg: "#3a1a2a", col: "#e880a0" },
    hidden: { label: "隠し",   bg: "#2a2a1a", col: "#f5d020" },
  };

  return (
    <div>
      {/* 全体進捗 */}
      <div className="card" style={{ padding: "10px 14px", marginBottom: "12px", borderColor: color + "33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
          <span style={{ color }}>アイテムチェック</span>
          <span style={{ color: totalChecked >= totalItems ? "#7fff7f" : "#aaa" }}>{totalChecked} / {totalItems}</span>
        </div>
        <div className="bar-bg" style={{ height: "6px" }}>
          <div className="bar-fill" style={{
            height: "100%", borderRadius: "4px",
            width: `${totalItems ? (totalChecked / totalItems) * 100 : 0}%`,
            background: totalChecked >= totalItems ? "#7fff7f" : `linear-gradient(90deg, ${color}88, ${color})`,
          }} />
        </div>
      </div>

      {/* エリアごとリスト */}
      {FIELD_ITEMS.map(({ area, items }) => {
        const areaChecked = items.filter(i => checked[i.id]).length;
        const allDone     = areaChecked === items.length;
        const isOpen      = !collapsed[area];
        return (
          <div key={area} className="card" style={{ padding: 0, marginBottom: "8px", borderColor: allDone ? color + "55" : "#2a2a4a" }}>
            <button
              onClick={() => toggleArea(area)}
              style={{
                width: "100%", background: "transparent", border: "none", cursor: "pointer",
                padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "11px", color: allDone ? color : "#ccc" }}>
                {isOpen ? "▼" : "▶"} {area}
              </span>
              <span style={{ fontSize: "10px", color: allDone ? color : "#555" }}>
                {areaChecked}/{items.length}
              </span>
            </button>

            {isOpen && (
              <div style={{ borderTop: "1px solid #2a2a4a" }}>
                {items.map(item => {
                  const meta  = TYPE_META[item.type] || TYPE_META.gift;
                  const isDone = !!checked[item.id];
                  return (
                    <label key={item.id} style={{
                      display: "flex", alignItems: "flex-start", gap: "8px",
                      padding: "7px 12px", cursor: "pointer",
                      background: isDone ? "#ffffff06" : "transparent",
                      borderBottom: "1px solid #1a1a2e",
                    }}>
                      <input
                        type="checkbox" checked={isDone}
                        onChange={() => toggle(item.id)}
                        style={{ marginTop: "3px", accentColor: color, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", color: isDone ? "#555" : "#ddd", textDecoration: isDone ? "line-through" : "none" }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: meta.bg, color: meta.col, flexShrink: 0 }}>
                            {meta.label}
                          </span>
                        </div>
                        {item.note && (
                          <div style={{ fontSize: "9px", color: isDone ? "#444" : "#666", marginTop: "2px" }}>
                            {item.note}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => { if (window.confirm("チェックをすべてリセットしますか？")) setChecked({}); }}
        style={{
          width: "100%", background: "transparent", border: "1px solid #2a2a4a",
          borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px",
          cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px", marginTop: "4px",
        }}
      >
        チェックをリセット
      </button>

      <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", letterSpacing: "1px", marginTop: "10px" }}>
        FR/LG 準拠 · チェックはブラウザに保存
      </div>
    </div>
  );
}

function TodoList({ color, todos, onAdd, onToggle, onDelete }) {
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  };
  const doneCount = todos.filter(t => t.done).length;
  return (
    <div className="card" style={{ padding: "12px 14px", marginBottom: "12px", borderColor: color + "33" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", color, letterSpacing: "1px" }}>📝 やることリスト</span>
        {todos.length > 0 && (
          <span style={{ fontSize: "10px", color: doneCount >= todos.length ? "#7fff7f" : "#555" }}>
            {doneCount}/{todos.length}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: todos.length > 0 ? "8px" : "0" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.isComposing && submit()}
          placeholder="やることを入力…"
          style={{
            flex: 1, background: "#0e0e1e", border: "1px solid #2a2a4a",
            borderRadius: "6px", color: "#ddd", fontSize: "12px",
            padding: "7px 10px", fontFamily: "inherit", outline: "none",
          }}
        />
        <button onClick={submit} style={{
          background: color + "22", border: `1px solid ${color + "55"}`,
          borderRadius: "6px", color, fontSize: "16px", padding: "4px 12px",
          cursor: "pointer", fontFamily: "inherit", lineHeight: 1,
        }}>＋</button>
      </div>
      {todos.length === 0 && (
        <div style={{ textAlign: "center", fontSize: "10px", color: "#2a2a4a", padding: "8px 0 2px" }}>
          やることを追加しよう
        </div>
      )}
      {todos.map((todo, idx) => (
        <div key={todo.id} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "7px 2px",
          borderTop: idx === 0 ? "1px solid #1a1a2e" : "none",
          borderBottom: "1px solid #1a1a2e",
        }}>
          <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)}
            style={{ accentColor: color, cursor: "pointer", flexShrink: 0 }} />
          <span style={{
            flex: 1, fontSize: "11px",
            color: todo.done ? "#444" : "#ddd",
            textDecoration: todo.done ? "line-through" : "none",
            wordBreak: "break-all",
          }}>{todo.text}</span>
          <button onClick={() => onDelete(todo.id)} style={{
            background: "transparent", border: "none", color: "#555",
            cursor: "pointer", fontSize: "13px", padding: "0 2px",
            fontFamily: "inherit", flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}
          >✕</button>
        </div>
      ))}
    </div>
  );
}

function AdventurePanel({ color, checkedItems, onToggle, onReset }) {
  const [filter,    setFilter]    = useState("all");
  const [openAreas, setOpenAreas] = useState({});
  const [openImgs,  setOpenImgs]  = useState({});

  const TYPE_ICON  = { gift: "🎁", tm: "💿", hm: "🔑", field: "📦", hidden: "🔍" };
  const FILTERS = [
    { key: "all",    label: "すべて" },
    { key: "gift",   label: "🎁 もらえる" },
    { key: "hm",     label: "🔑 HM" },
    { key: "tm",     label: "💿 TM" },
    { key: "field",  label: "📦 落ちている" },
    { key: "hidden", label: "🔍 隠し" },
  ];

  const allItems     = ITEM_DATA.flatMap(a => a.items);
  const total        = allItems.length;
  const checkedCount = allItems.filter(i => checkedItems[i.id]).length;

  const filteredData = ITEM_DATA
    .map(a => ({ ...a, items: filter === "all" ? a.items : a.items.filter(i => i.type === filter) }))
    .filter(a => a.items.length > 0);

  const toggleArea = (name) => setOpenAreas(prev => ({ ...prev, [name]: prev[name] === false }));

  return (
    <div style={{ marginBottom: "10px" }}>
      {/* 進捗バー */}
      <div className="card" style={{ padding: "10px 14px", marginBottom: "10px", borderColor: color + "33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
          <span style={{ color }}>アイテム入手状況</span>
          <span>{checkedCount}/{total}　残り<span style={{ color: (total - checkedCount) === 0 ? "#7fff7f" : "#aaa" }}>{total - checkedCount}</span></span>
        </div>
        <div className="bar-bg" style={{ height: "7px" }}>
          <div className="bar-fill" style={{ height: "100%", width: `${total > 0 ? (checkedCount / total) * 100 : 0}%`, background: checkedCount >= total ? "#7fff7f" : `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: "4px" }} />
        </div>
      </div>

      {/* フィルター */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px", alignItems: "center" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? color + "22" : "transparent",
              border: `1px solid ${filter === f.key ? color + "88" : "#3a3a5a"}`,
              borderRadius: "6px", color: filter === f.key ? color : "#555",
              fontSize: "10px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit",
            }}
          >{f.label}</button>
        ))}
        <button onClick={onReset}
          style={{
            background: "transparent", border: "1px solid #ff444444",
            borderRadius: "6px", color: "#ff6666",
            fontSize: "10px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit", marginLeft: "auto",
          }}
        >リセット</button>
      </div>

      {/* エリア別リスト */}
      {filteredData.map(areaData => {
        const areaChecked = areaData.items.filter(i => checkedItems[i.id]).length;
        const isOpen      = openAreas[areaData.area] !== false;
        const allDone     = areaChecked === areaData.items.length;
        return (
          <div key={areaData.area} style={{ marginBottom: "6px" }}>
            <button onClick={() => toggleArea(areaData.area)} className="panel-toggle"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", color: allDone ? "#7fff7f" : "#aaa" }}
            >
              <span style={{ fontSize: "11px" }}>{isOpen ? "▼" : "▶"} {areaData.area}</span>
              <span style={{ fontSize: "9px", color: allDone ? "#7fff7f" : "#555", flexShrink: 0, marginLeft: "8px" }}>{areaChecked}/{areaData.items.length}</span>
            </button>
            {isOpen && (
              <div className="panel-body" style={{ borderColor: "#2a2a4a", padding: "4px 8px" }}>
                {areaData.items.map((item, idx) => (
                  <div key={item.id} style={{ borderBottom: idx < areaData.items.length - 1 ? "1px solid #1a2a3a" : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 2px", cursor: "pointer" }}
                      onClick={() => onToggle(item.id)}>
                      <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => onToggle(item.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ marginTop: "2px", accentColor: color, cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: "10px", flexShrink: 0, opacity: 0.6 }}>{TYPE_ICON[item.type]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "11px", color: checkedItems[item.id] ? "#444" : "#e8e8e8", textDecoration: checkedItems[item.id] ? "line-through" : "none" }}>
                          {item.name}
                        </div>
                        {item.note && (
                          <div style={{ fontSize: "9px", color: "#555", marginTop: "1px" }}>{item.note}</div>
                        )}
                      </div>
                      {item.img && (
                        <button onClick={e => { e.stopPropagation(); setOpenImgs(p => ({ ...p, [item.id]: !p[item.id] })); }}
                          style={{ background: "transparent", border: `1px solid ${openImgs[item.id] ? color + "88" : "#3a3a5a"}`,
                            borderRadius: "4px", color: openImgs[item.id] ? color : "#555",
                            fontSize: "10px", padding: "1px 5px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, lineHeight: "1.4" }}>
                          🗺️
                        </button>
                      )}
                    </div>
                    {item.img && openImgs[item.id] && (
                      <img src={item.img} alt={item.note}
                        style={{ width: "100%", display: "block", marginBottom: "4px", borderRadius: "4px", border: "1px solid #2a2a4a" }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", marginTop: "10px", letterSpacing: "1px" }}>
        FR/LG · アイテムリスト（内容は随時要確認）
      </div>
    </div>
  );
}

