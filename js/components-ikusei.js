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

// ─── item picker ─────────────────────────────────────────────────────────────

function ItemPicker({ value, color, onChange }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? HOLD_ITEMS.filter(it => it.name.includes(query.trim()) || it.cat.includes(query.trim()))
    : HOLD_ITEMS;

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  const current = HOLD_ITEMS.find(it => it.name === value) || null;

  return (
    <div className="card" style={{ padding: "10px 12px", marginBottom: "10px", borderColor: color + "22" }}>
      <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", letterSpacing: "1px" }}>持ち物</div>
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
            <span style={{ fontSize: "10px", color: "#888" }}>{current.note}</span>
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
              placeholder="アイテム名・カテゴリで検索…"
              style={{ flex: 1, background: "#16213e", border: `1px solid ${color}44`, borderRadius: "4px", padding: "5px 8px", color: "#e8e8e8", fontFamily: "inherit", fontSize: "11px", outline: "none" }}
            />
            {value && (
              <button onClick={() => select("")} style={{ background: "transparent", border: "1px solid #ff444466", borderRadius: "4px", color: "#ff6666", fontSize: "10px", padding: "5px 8px", cursor: "pointer", fontFamily: "inherit" }}>
                クリア
              </button>
            )}
          </div>
          <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {filtered.map(it => (
              <button key={it.name} onClick={() => select(it.name)}
                style={{
                  textAlign: "left", background: it.name === value ? color + "33" : "transparent",
                  border: "none", borderRadius: "3px", padding: "4px 8px",
                  color: it.name === value ? color : "#aaa", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>{it.name}</span>
                <span style={{ fontSize: "10px", color: "#555", textAlign: "right" }}>{it.note}</span>
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
      { key: "tm",    label: "TM・HM",       items: tm.map(id => ({
        name:  TM_LIST[id] || id,
        badge: id,
      }))},
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

function PartySlots({ slots, roster, color, onSlotSelect, onSlotClear, onEmptySlotClick }) {
  const filled = slots.filter(Boolean).length;
  return (
    <div className="card" style={{ padding: "10px 12px", marginBottom: "16px", borderColor: color + "44" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>現在のパーティ</span>
        <span style={{ fontSize: "9px", color: filled === 6 ? color : "#444" }}>{filled}/6</span>
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        {[0,1,2,3,4,5].map(i => {
          const name = slots[i] || null;
          const mon = name ? roster.find(p => p.name === name) : null;
          return (
            <div key={i} style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <button
                onClick={() => mon ? onSlotSelect(mon.name) : onEmptySlotClick(i)}
                style={{
                  width: "100%", background: mon ? `${mon.color}22` : "#0d0d1a",
                  border: `1px solid ${mon ? mon.color + "66" : "#2a2a4a"}`,
                  borderRadius: "8px", padding: "6px 2px 5px", cursor: "pointer",
                  textAlign: "center", minHeight: "52px", display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                {mon ? (
                  <>
                    <div style={{ fontSize: "18px", lineHeight: 1 }}>{mon.icon}</div>
                    <div style={{ fontSize: "7px", color: mon.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", padding: "0 2px", marginTop: "3px" }}>{mon.name}</div>
                  </>
                ) : (
                  <div style={{ fontSize: "16px", color: "#2a2a4a", lineHeight: 1 }}>＋</div>
                )}
              </button>
              {mon && (
                <button
                  onClick={e => { e.stopPropagation(); onSlotClear(i); }}
                  style={{
                    position: "absolute", top: "-5px", right: "-5px",
                    width: "16px", height: "16px", background: "#1a1a2e",
                    border: "1px solid #3a3a5a", borderRadius: "50%",
                    color: "#888", fontSize: "9px", cursor: "pointer",
                    padding: 0, lineHeight: 1, fontFamily: "inherit",
                  }}
                >×</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartyPickerModal({ roster, activeParty, onSelect, onClose, color }) {
  const available = roster.filter(p => !activeParty.includes(p.name));
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", background: "#1a1a2e", borderRadius: "16px 16px 0 0", padding: "16px 16px 24px", maxHeight: "65vh", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "12px", letterSpacing: "2px", textAlign: "center" }}>パーティに入れるポケモンを選択</div>
        {available.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", fontSize: "11px", padding: "20px" }}>育成中のポケモンは全員パーティに入っています</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
            {available.map(p => (
              <button
                key={p.name}
                onClick={() => onSelect(p.name)}
                style={{
                  background: `${p.color}22`, border: `1px solid ${p.color}55`,
                  borderRadius: "10px", padding: "10px 6px", cursor: "pointer", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "3px" }}>{p.icon}</div>
                <div style={{ fontSize: "10px", color: p.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "8px", color: "#555", padding: "11px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px" }}
        >キャンセル</button>
      </div>
    </div>
  );
}

