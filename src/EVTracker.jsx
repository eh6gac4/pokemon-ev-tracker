import { useState, useEffect } from "react";

const DEFAULT_PARTY = [
  { name: "リザードン", icon: "🔥", color: "#FF6B35" },
  { name: "ガラガラ",   icon: "💀", color: "#A0A0A0" },
  { name: "ギャラドス", icon: "🌊", color: "#4A90D9" },
  { name: "カビゴン",   icon: "😴", color: "#7DBE8A" },
  { name: "サンダー",   icon: "⚡", color: "#F5D020" },
  { name: "ルージュラ", icon: "💋", color: "#E880A0" },
];

const STATS = [
  { key: "hp",  jp: "ＨＰ" },
  { key: "atk", jp: "こうげき" },
  { key: "def", jp: "ぼうぎょ" },
  { key: "spa", jp: "とくこう" },
  { key: "spd", jp: "とくぼう" },
  { key: "spe", jp: "すばやさ" },
];

const COLORS = ["#FF6B35","#4A90D9","#7DBE8A","#F5D020","#E880A0","#A0A0A0","#C97AE0","#FF8FAB","#5ECDE5","#F4A261"];
const ICONS  = ["🔥","💧","🌿","⚡","🧊","🌊","💀","😴","💋","🦅","🐉","👊","🌙","☀️","🌀","🪨","🎭","🤖","🐭","🐣"];

const MAX_STAT = 252;
const MAX_TOTAL = 510;
const STORAGE_KEY = "ev-tracker-data";

const initEVs = () => Object.fromEntries(STATS.map(s => [s.key, 0]));

export default function EVTracker() {
  const [party, setParty] = useState(DEFAULT_PARTY);
  const [allEVs, setAllEVs] = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, initEVs()])));
  const [selected, setSelected] = useState(DEFAULT_PARTY[0].name);
  const [loaded, setLoaded] = useState(false);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🐣");
  const [newColor, setNewColor] = useState(COLORS[0]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.party)    setParty(saved.party);
        if (saved.allEVs)   setAllEVs(saved.allEVs);
        if (saved.selected) setSelected(saved.selected);
      }
    } catch (_) {}
    setLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ party, allEVs, selected }));
    } catch (_) {}
  }, [party, allEVs, selected, loaded]);

  const mon = party.find(p => p.name === selected) || party[0];
  const evs = allEVs[selected] || initEVs();
  const total = Object.values(evs).reduce((a, b) => a + b, 0);
  const remaining = MAX_TOTAL - total;

  const change = (key, delta) => {
    setAllEVs(prev => {
      const cur = (prev[selected] || initEVs())[key];
      const curTotal = Object.values(prev[selected] || initEVs()).reduce((a, b) => a + b, 0);
      let next = Math.max(0, Math.min(MAX_STAT, cur + delta));
      if (curTotal - cur + next > MAX_TOTAL) next = cur + (MAX_TOTAL - curTotal);
      next = Math.max(0, next);
      return { ...prev, [selected]: { ...(prev[selected] || initEVs()), [key]: next } };
    });
  };

  const reset = () => setAllEVs(prev => ({ ...prev, [selected]: initEVs() }));

  const removeMon = (name) => {
    const next = party.filter(p => p.name !== name);
    setParty(next);
    setAllEVs(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (selected === name && next.length > 0) setSelected(next[0].name);
  };

  const addMon = () => {
    const trimmed = newName.trim();
    if (!trimmed || party.find(p => p.name === trimmed)) return;
    const newMon = { name: trimmed, icon: newIcon, color: newColor };
    setParty(prev => [...prev, newMon]);
    setAllEVs(prev => ({ ...prev, [trimmed]: initEVs() }));
    setSelected(trimmed);
    setAdding(false);
    setNewName("");
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "monospace" }}>
      ロード中…
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", fontFamily: "'DotGothic16', 'Courier New', monospace", color: "#e8e8e8", padding: "16px", boxSizing: "border-box" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap'); * { box-sizing: border-box; } .mon-btn { transition: all 0.15s; } .mon-btn:hover { transform: translateY(-2px); filter: brightness(1.15); } .mon-btn.active { box-shadow: 0 0 12px rgba(255,255,255,0.3); } .step-btn:hover { filter: brightness(1.3); transform: scale(1.08); } .step-btn:active { transform: scale(0.95); } .bar-fill { transition: width 0.3s cubic-bezier(.4,0,.2,1); } input { outline: none; } .del-btn { opacity: 0; transition: opacity 0.15s; } .mon-wrap:hover .del-btn { opacity: 1; }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "2px" }}>FireRed · AUTO SAVE</div>
        <div style={{ fontSize: "20px", letterSpacing: "2px", color: mon.color, textShadow: `0 0 20px ${mon.color}66` }}>
          努力値トラッカー
        </div>
      </div>

      {/* Party grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "7px", marginBottom: "16px" }}>
        {party.map(p => {
          const t = Object.values(allEVs[p.name] || initEVs()).reduce((a, b) => a + b, 0);
          const isActive = selected === p.name;
          return (
            <div key={p.name} className="mon-wrap" style={{ position: "relative" }}>
              <button
                className={`mon-btn${isActive ? " active" : ""}`}
                onClick={() => setSelected(p.name)}
                style={{
                  width: "100%",
                  background: isActive ? `${p.color}22` : "#16213e",
                  border: `2px solid ${isActive ? p.color : "#2a2a4a"}`,
                  borderRadius: "10px",
                  padding: "10px 6px 8px",
                  cursor: "pointer",
                  color: "#e8e8e8",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "3px" }}>{p.icon}</div>
                <div style={{ fontSize: "10px", color: isActive ? p.color : "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: "9px", color: t >= MAX_TOTAL ? "#7fff7f" : "#555", marginTop: "2px" }}>{t}/{MAX_TOTAL}</div>
              </button>
              {party.length > 1 && (
                <button
                  className="del-btn"
                  onClick={() => removeMon(p.name)}
                  style={{ position: "absolute", top: "3px", right: "3px", background: "#ff4444", border: "none", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer", color: "#fff", fontSize: "9px", lineHeight: "16px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >✕</button>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setAdding(true)}
          style={{ background: "#16213e", border: "2px dashed #2a2a4a", borderRadius: "10px", padding: "10px 6px", cursor: "pointer", color: "#555", fontSize: "20px", textAlign: "center", lineHeight: 1 }}
        >
          <div>＋</div>
          <div style={{ fontSize: "9px", marginTop: "4px" }}>追加</div>
        </button>
      </div>

      {/* Add modal */}
      {adding && (
        <div style={{ background: "#16213e", border: `1px solid ${mon.color}55`, borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", letterSpacing: "2px" }}>ポケモンを追加</div>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addMon()}
            placeholder="なまえ（例：ゲンガー）"
            style={{ width: "100%", background: "#0d0d1a", border: "1px solid #3a3a5a", borderRadius: "6px", color: "#e8e8e8", fontSize: "13px", padding: "8px 10px", marginBottom: "8px", fontFamily: "inherit" }}
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
            <button onClick={addMon} style={{ flex: 1, background: `${newColor}33`, border: `1px solid ${newColor}88`, borderRadius: "7px", color: newColor, fontSize: "12px", padding: "8px", cursor: "pointer", fontFamily: "inherit" }}>追加する</button>
            <button onClick={() => { setAdding(false); setNewName(""); }} style={{ flex: 1, background: "transparent", border: "1px solid #3a3a5a", borderRadius: "7px", color: "#666", fontSize: "12px", padding: "8px", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
          </div>
        </div>
      )}

      {/* Total bar */}
      <div style={{ background: "#16213e", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", border: `1px solid ${mon.color}33` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
          <span style={{ color: mon.color }}>合計努力値</span>
          <span>{total}/{MAX_TOTAL}　残り<span style={{ color: remaining < 50 ? "#ff6b6b" : "#aaa" }}>{remaining}</span></span>
        </div>
        <div style={{ background: "#0d0d1a", borderRadius: "4px", height: "7px", overflow: "hidden" }}>
          <div className="bar-fill" style={{ height: "100%", width: `${(total / MAX_TOTAL) * 100}%`, background: total >= MAX_TOTAL ? "#7fff7f" : `linear-gradient(90deg, ${mon.color}88, ${mon.color})`, borderRadius: "4px" }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {STATS.map(stat => {
          const val = evs[stat.key] || 0;
          const isMaxed = val >= MAX_STAT;
          return (
            <div key={stat.key} style={{ background: "#16213e", borderRadius: "8px", padding: "9px 12px", border: `1px solid ${isMaxed ? "#7fff7f44" : "#2a2a4a"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <span style={{ fontSize: "11px", minWidth: "62px", color: isMaxed ? "#7fff7f" : "#888" }}>{stat.jp}</span>
                <span style={{ fontSize: "15px", minWidth: "36px", textAlign: "right", fontWeight: "bold" }}>{val}</span>
                {isMaxed && <span style={{ fontSize: "8px", background: "#7fff7f22", color: "#7fff7f", border: "1px solid #7fff7f44", borderRadius: "3px", padding: "1px 4px" }}>MAX</span>}
                <div style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>
                  {[[-1,"－"],[-4,"－4"],[4,"＋4"],[1,"＋"]].map(([d, label]) => (
                    <button key={d} className="step-btn" onClick={() => change(stat.key, d)} style={{ background: d > 0 ? `${mon.color}33` : "#1e1e3a", border: `1px solid ${d > 0 ? mon.color + "55" : "#3a3a5a"}`, borderRadius: "4px", color: d > 0 ? mon.color : "#777", fontSize: "10px", padding: "3px 6px", cursor: "pointer", minWidth: "28px", fontFamily: "inherit", transition: "all 0.1s" }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0d0d1a", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                <div className="bar-fill" style={{ height: "100%", width: `${(val / MAX_STAT) * 100}%`, background: isMaxed ? "#7fff7f" : mon.color, borderRadius: "3px" }} />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={reset} style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
        {selected} をリセット
      </button>

      <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", marginTop: "12px", letterSpacing: "1px" }}>
        GEN III · MAX 252/STAT · MAX 510/TOTAL · AUTO SAVE
      </div>
    </div>
  );
}
