import React, { useState, useEffect, useRef } from 'react';
import { MAX_STAT, vitaminLeft, POKEMON_DATA } from './data-pokemon.js';
import { TM_LIST, MOVE_DATA, TYPE_COLORS } from './data-moves.js';

export function tmItemName(item) {
  if (!item.tmId) return item.name;
  const num = item.tmId.slice(2);
  const prefix = item.tmId.startsWith("HM") ? "ひでんマシン" : "わざマシン";
  return `${prefix}${num} ${TM_LIST[item.tmId] || ""}`;
}

export const AutoTextarea = React.memo(function AutoTextarea({ value, onChange, placeholder }) {
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
      className="input-dark"
      style={{ width: "100%", lineHeight: "1.5", fontSize: "12px", padding: "8px", background: "#0d0d1a", border: "1px solid #2a2a4a", minHeight: "64px" }}
    />
  );
});

export const Panel = React.memo(function Panel({ title, open, onToggle, color, children }) {
  return (
    <div style={{ marginBottom: "8px" }}>
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
});

export const StatRow = React.memo(function StatRow({ stat, val, color, macho, onChange }) {
  const isMaxed = val >= MAX_STAT;
  const vLeft   = vitaminLeft(val);
  const steps    = macho ? [[-1,"－"],[1,"＋2"],[2,"＋4"],[3,"＋6"]]   : [[-1,"－"],[1,"＋1"],[2,"＋2"],[3,"＋3"]];
  const bigSteps = macho ? [[10,"＋20"],[25,"＋50"]]                    : [[10,"＋10"],[25,"＋25"]];
  return (
    <div className="card" style={{ padding: "8px 12px", borderColor: isMaxed ? "#7fff7f44" : "#2a2a4a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", minWidth: "64px", color: isMaxed ? "#7fff7f" : "#888" }}>{stat.jp}</span>
        <span style={{ fontSize: "16px", minWidth: "36px", textAlign: "right", fontWeight: "bold" }}>{val}</span>
        {isMaxed
          ? <span className="badge-max">MAX</span>
          : vLeft > 0 && <span style={{ fontSize: "8px", color: "#aaa" }}>💊×{vLeft}</span>
        }
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {steps.map(([d, label], i) => (
            <button
              key={d}
              className="step-btn"
              onClick={() => onChange(d)}
              style={{
                background: d > 0 ? `${color}33` : "#1e1e3a",
                border: `1px solid ${d > 0 ? color + "55" : "#3a3a5a"}`,
                color: d > 0 ? color : "#777",
                marginLeft: i === 1 ? "8px" : undefined,
              }}
            >{label}</button>
          ))}
          {bigSteps.map(([d, label], i) => (
            <button
              key={d}
              className="step-btn"
              onClick={() => onChange(d)}
              style={{
                background: `${color}22`,
                border: `1px solid ${color}44`,
                color: color,
                marginLeft: i === 0 ? "8px" : undefined,
              }}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="bar-bg" style={{ height: "4px" }}>
        <div className="bar-fill" style={{ height: "100%", width: `${(val / MAX_STAT) * 100}%`, background: isMaxed ? "#7fff7f" : color, borderRadius: "4px" }} />
      </div>
    </div>
  );
});

// ─── feature components ──────────────────────────────────────────────────────

// 共通ポケモン検索コンポーネント（AddMonModal・IVChecker・PokedexPanel で共用）

export const PokemonSearch = React.memo(function PokemonSearch({ value, onSelect, color, placeholder = "ポケモン名・番号で検索…", maxHeight = "200px" }) {
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
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#16213e", border: "1px solid #3a3a5a", borderTop: "none", borderRadius: "0 0 8px 8px", maxHeight, overflowY: "auto", zIndex: 50 }}>
          {results.length === 0
            ? <div style={{ padding: "8px", fontSize: "12px", color: "#444" }}>該当なし</div>
            : results.map(r => (
                <div
                  key={r[0]}
                  className="search-item"
                  onMouseDown={() => { onSelect(r[0] - 1); setQuery(""); setOpen(false); }}
                  style={{ padding: "4px 8px", cursor: "pointer", fontSize: "12px", color: value === r[0] - 1 ? color : "#ccc", background: value === r[0] - 1 ? color + "22" : "transparent" }}
                >
                  {String(r[0]).padStart(3,"0")} {r[1]}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
});

export const MoveRow = React.memo(function MoveRow({ move, prefix = null }) {
  const md = MOVE_DATA[move];
  const tc = md ? (TYPE_COLORS[md[0]] || "#555") : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 2px", borderBottom: "1px solid #14142a" }}>
      {prefix != null && (
        <div style={{ fontSize: "8px", color: "#666", background: "#1a1a2e", borderRadius: "4px", padding: "1px 4px", minWidth: prefix.minWidth, textAlign: "center", flexShrink: 0 }}>
          {prefix.text}
        </div>
      )}
      {tc
        ? <div style={{ fontSize: "8px", color: "#fff", background: tc + "cc", borderRadius: "4px", padding: "1px 4px", whiteSpace: "nowrap", flexShrink: 0 }}>{md[0]}</div>
        : <div style={{ fontSize: "8px", color: "#333", background: "#1a1a2e", borderRadius: "4px", padding: "1px 4px", flexShrink: 0 }}>?</div>
      }
      <div style={{ fontSize: "12px", color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{move}</div>
      {md && (
        <div style={{ fontSize: "8px", color: "#555", whiteSpace: "nowrap", display: "flex", gap: "4px", flexShrink: 0 }}>
          <span style={{ color: md[1] !== null ? "#b0a0d8" : "#383848" }}>P:{md[1] !== null ? md[1] : "---"}</span>
          <span style={{ color: md[2] !== null ? "#6898b8" : "#383848" }}>A:{md[2] !== null ? md[2] : "---"}</span>
          <span style={{ color: "#484858" }}>PP:{md[3]}</span>
        </div>
      )}
    </div>
  );
});

export const VerBadge = React.memo(function VerBadge({ v }) {
  if (!v) return null;
  const isFR = v === "FR";
  return (
    <span style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "4px", flexShrink: 0,
      background: isFR ? "#cc222233" : "#2244cc33",
      color:      isFR ? "#ff8888"   : "#8888ff",
      border: `1px solid ${isFR ? "#cc222255" : "#2244cc55"}` }}>{v}</span>
  );
});
