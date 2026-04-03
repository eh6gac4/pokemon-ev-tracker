function EVTracker() {
  const [party,     setParty]    = useState(DEFAULT_PARTY);
  const [allEVs,    setAllEVs]   = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, initEVs()])));
  const [allMoves,  setAllMoves] = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, ["","","",""]])));
  const [selected,  setSelected] = useState(DEFAULT_PARTY[0].name);
  const [loaded,       setLoaded]       = useState(false);
  const [macho,        setMacho]        = useState(false);
  const [activeTab,    setActiveTab]    = useState("ikusei");
  const [adding,       setAdding]       = useState(false);
  const [newName,      setNewName]      = useState("");
  const [newIcon,      setNewIcon]      = useState("🐣");
  const [newColor,     setNewColor]     = useState(COLORS[0]);
  const [newDexId,     setNewDexId]     = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [todoList,     setTodoList]     = useState([]);
  const [renaming,     setRenaming]     = useState(false);
  const [renameValue,  setRenameValue]  = useState("");
  const [iconEditing,  setIconEditing]  = useState(false);
  const [iconValue,    setIconValue]    = useState("");

  // pull-to-refresh
  useEffect(() => {
    const THRESHOLD = 80;
    let startY = 0;
    let pulling = false;

    // indicator element
    const el = document.createElement("div");
    el.id = "ptr-indicator";
    el.innerHTML = `<span id="ptr-icon">↓</span><span id="ptr-label">引いてリロード</span>`;
    document.body.prepend(el);

    const update = (dist) => {
      const ratio  = Math.min(dist / THRESHOLD, 1);
      const ready  = dist >= THRESHOLD;
      el.style.opacity  = String(Math.min(ratio * 1.5, 1));
      el.style.transform = `translateY(${Math.min(dist * 0.4, 40)}px)`;
      document.getElementById("ptr-icon").style.transform  = `rotate(${ready ? 180 : ratio * 160}deg)`;
      document.getElementById("ptr-label").textContent = ready ? "離してリロード" : "引いてリロード";
      el.classList.toggle("ptr-ready", ready);
    };
    const hide = () => {
      el.style.opacity = "0";
      el.style.transform = "translateY(0)";
    };

    const getScrollTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const onTouchStart = (e) => {
      if (getScrollTop() <= 1) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };
    const onTouchMove = (e) => {
      if (!pulling) return;
      const dist = e.touches[0].clientY - startY;
      if (dist > 0) {
        // iOS PWAのネイティブバウンスと競合しないよう伝播を止める
        if (e.cancelable) e.preventDefault();
        update(dist);
      } else {
        pulling = false;
        hide();
      }
    };
    const onTouchEnd = (e) => {
      if (!pulling) return;
      pulling = false;
      const dist = e.changedTouches[0].clientY - startY;
      if (dist >= THRESHOLD) {
        el.style.opacity = "1";
        el.style.transform = "translateY(32px)";
        document.getElementById("ptr-icon").textContent = "↻";
        document.getElementById("ptr-icon").style.animation = "ptr-spin 0.6s linear infinite";
        document.getElementById("ptr-label").textContent = "リロード中…";
        setTimeout(() => location.reload(), 600);
      } else {
        hide();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false }); // iOSでpreventDefault可能にする
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
      el.remove();
    };
  }, []);

  useEffect(() => {
    fetch("/api/data")
      .then(r => r.json())
      .then(saved => {
        if (saved.party)        setParty(saved.party.map(p => {
          if (p.dexId != null) return p;
          const idx = POKEMON_DATA.findIndex(pd => pd[1] === p.name);
          return { ...p, dexId: idx >= 0 ? idx : null };
        }));
        if (saved.allEVs)       setAllEVs(saved.allEVs);
        if (saved.allMoves)     setAllMoves(saved.allMoves);
        if (saved.selected)     setSelected(saved.selected);
        if (saved.checkedItems) setCheckedItems(saved.checkedItems);
        if (saved.todoList)     setTodoList(saved.todoList);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ party, allEVs, allMoves, selected, checkedItems, todoList }),
    }).catch(() => {});
  }, [party, allEVs, allMoves, selected, checkedItems, todoList, loaded]);

  const toggleItem = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const resetItems = () => setCheckedItems({});

  const addTodo    = (text) => setTodoList(prev => [...prev, { id: Date.now().toString(), text, done: false }]);
  const toggleTodo = (id)  => setTodoList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id)  => setTodoList(prev => prev.filter(t => t.id !== id));
  const renameTodo = (id, text) => setTodoList(prev => prev.map(t => t.id === id ? { ...t, text } : t));

  const mon       = party.find(p => p.name === selected) || party[0];
  const evs       = allEVs[selected] || initEVs();
  const total     = Object.values(evs).reduce((a, b) => a + b, 0);
  const remaining = MAX_TOTAL - total;

  const change = (key, delta) => {
    const d = delta > 0 ? delta * (macho ? 2 : 1) : delta;
    setAllEVs(prev => {
      const cur      = (prev[selected] || initEVs())[key];
      const curTotal = Object.values(prev[selected] || initEVs()).reduce((a, b) => a + b, 0);
      let next = Math.max(0, Math.min(MAX_STAT, cur + d));
      if (curTotal - cur + next > MAX_TOTAL) next = cur + (MAX_TOTAL - curTotal);
      return { ...prev, [selected]: { ...(prev[selected] || initEVs()), [key]: Math.max(0, next) } };
    });
  };

  const reset = () => setAllEVs(prev => ({ ...prev, [selected]: initEVs() }));

  const updateMemo   = (text) => setParty(prev => prev.map(p => p.name === selected ? { ...p, memo: text } : p));
  const updateNature = (name) => setParty(prev => prev.map(p => p.name === selected ? { ...p, nature: name } : p));
  const updateIcon   = (icon) => {
    const trimmed = icon.trim();
    if (!trimmed) return;
    setParty(prev => prev.map(p => p.name === selected ? { ...p, icon: trimmed } : p));
    setIconEditing(false);
  };

  const updateMove = (slot, move) => setAllMoves(prev => {
    const cur = prev[selected] || ["","","",""];
    const next = [...cur];
    next[slot] = move;
    return { ...prev, [selected]: next };
  });

  const removeMon = (name) => {
    const next = party.filter(p => p.name !== name);
    setParty(next);
    setAllEVs(prev => { const n = { ...prev }; delete n[name]; return n; });
    setAllMoves(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (selected === name && next.length > 0) setSelected(next[0].name);
  };

  const renameMon = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) { setRenaming(false); return; }
    if (party.find(p => p.name === trimmed)) return;
    setParty(prev => prev.map(p => p.name === oldName ? { ...p, name: trimmed } : p));
    setAllEVs(prev => {
      const n = { ...prev };
      n[trimmed] = n[oldName] || initEVs();
      delete n[oldName];
      return n;
    });
    setAllMoves(prev => {
      const n = { ...prev };
      n[trimmed] = n[oldName] || ["","","",""];
      delete n[oldName];
      return n;
    });
    if (selected === oldName) setSelected(trimmed);
    setRenaming(false);
  };

  const addMon = () => {
    const trimmed = newName.trim();
    if (!trimmed || party.find(p => p.name === trimmed)) return;
    setParty(prev => [...prev, { name: trimmed, icon: newIcon, color: newColor, memo: "", nature: "", dexId: newDexId }]);
    setAllEVs(prev => ({ ...prev, [trimmed]: initEVs() }));
    setAllMoves(prev => ({ ...prev, [trimmed]: ["","","",""] }));
    setSelected(trimmed);
    setAdding(false);
    setNewName("");
    setNewDexId(null);
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "monospace" }}>
      ロード中…
    </div>
  );

  return (
    <div className="app-wrap">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "2px" }}>FireRed · AUTO SAVE</div>
        <div style={{ fontSize: "20px", letterSpacing: "2px", color: mon.color, textShadow: `0 0 20px ${mon.color}66` }}>
          努力値トラッカー
        </div>
      </div>

      <div className="app-layout">
        {/* ===== 育成カラム ===== */}
        <div className={activeTab === "ikusei" ? "" : "col-hidden"}>

          {/* Party grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "7px", marginBottom: "16px" }}>
            {party.map(p => {
              const t        = Object.values(allEVs[p.name] || initEVs()).reduce((a, b) => a + b, 0);
              const isActive = selected === p.name;
              return (
                <button
                  key={p.name}
                  className={`mon-btn${isActive ? " active" : ""}`}
                  onClick={() => setSelected(p.name)}
                  style={{
                    width: "100%", cursor: "pointer", color: "#e8e8e8", textAlign: "center",
                    background: isActive ? `${p.color}22` : "#16213e",
                    border: `2px solid ${isActive ? p.color : "#2a2a4a"}`,
                    borderRadius: "10px", padding: "10px 6px 8px",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "3px" }}>{p.icon}</div>
                  <div style={{ fontSize: "10px", color: isActive ? p.color : "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: "9px", color: t >= MAX_TOTAL ? "#7fff7f" : "#555", marginTop: "2px" }}>{t}/{MAX_TOTAL}</div>
                </button>
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

          {adding && (
            <AddMonModal
              newName={newName} newIcon={newIcon} newColor={newColor} newDexId={newDexId}
              setNewName={setNewName} setNewIcon={setNewIcon} setNewColor={setNewColor} setNewDexId={setNewDexId}
              onAdd={addMon}
              onCancel={() => { setAdding(false); setNewName(""); setNewDexId(null); }}
              borderColor={mon.color}
            />
          )}

          {/* Total bar */}
          <div className="card" style={{ padding: "10px 14px", marginBottom: "10px", borderColor: mon.color + "33" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
              <span style={{ color: mon.color }}>合計努力値</span>
              <span>{total}/{MAX_TOTAL}　残り<span style={{ color: remaining < 50 ? "#ff6b6b" : "#aaa" }}>{remaining}</span></span>
            </div>
            <div className="bar-bg" style={{ height: "7px" }}>
              <div className="bar-fill" style={{ height: "100%", width: `${(total / MAX_TOTAL) * 100}%`, background: total >= MAX_TOTAL ? "#7fff7f" : `linear-gradient(90deg, ${mon.color}88, ${mon.color})`, borderRadius: "4px" }} />
            </div>
          </div>

          {/* 強制ギプス */}
          <button
            onClick={() => setMacho(v => !v)}
            style={{
              width: "100%", cursor: "pointer", fontFamily: "inherit",
              background: macho ? "#3a1a1a" : "#16213e",
              border: `1px solid ${macho ? "#ff6b35aa" : "#2a2a4a"}`,
              borderRadius: "7px", color: macho ? "#ff6b35" : "#555",
              fontSize: "11px", padding: "7px", marginBottom: "10px", letterSpacing: "1px",
            }}
          >
            {macho ? "🥊 強制ギプス装備中（EV×2）" : "🥊 強制ギプス　OFF"}
          </button>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
            {STATS.map(stat => (
              <StatRow key={stat.key} stat={stat} val={evs[stat.key] || 0} color={mon.color} macho={macho} onChange={d => change(stat.key, d)} />
            ))}
          </div>

          {/* 技セット */}
          {(() => {
            const selPData = mon.dexId != null ? POKEMON_DATA[mon.dexId] : null;
            const learnableMoves = selPData ? getLearnableMoves(selPData[0]) : ALL_MOVES;
            const learnset       = selPData ? getLearnset(selPData[0]) : null;
            return <MovePicker moves={allMoves[selected] || ["","","",""]} color={mon.color} onChange={updateMove} learnableMoves={learnableMoves} learnset={learnset} />;
          })()}

          {/* 性格 */}
          <NaturePicker value={mon.nature || ""} color={mon.color} onChange={updateNature} />

          {/* メモ */}
          <div className="card" style={{ padding: "10px 12px", marginBottom: "10px", borderColor: mon.color + "22" }}>
            <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>メモ（持ち物など）</div>
            <AutoTextarea value={mon.memo || ""} onChange={updateMemo} placeholder="例：ようき　こだわりスカーフ　…" />
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button onClick={reset} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
              EV リセット
            </button>
            {party.length > 1 && (
              <button onClick={() => removeMon(selected)} style={{ flex: 1, background: "transparent", border: "1px solid #ff444444", borderRadius: "7px", color: "#ff6666", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
                {selected} を削除
              </button>
            )}
          </div>

          {renaming ? (
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.isComposing) renameMon(selected, renameValue); if (e.key === "Escape") setRenaming(false); }}
                style={{ flex: 1, background: "#16213e", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: "#e8e8e8", fontSize: "13px", padding: "8px 10px", fontFamily: "inherit", outline: "none" }}
              />
              <button onClick={() => renameMon(selected, renameValue)} style={{ background: mon.color + "22", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: mon.color, fontSize: "11px", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}>確定</button>
              <button onClick={() => setRenaming(false)} style={{ background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "8px 10px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>
          ) : (
            <button onClick={() => { setRenameValue(selected); setRenaming(true); }} style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", marginBottom: "10px" }}>
              ✏️ 名前を変更
            </button>
          )}

          {iconEditing ? (
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#555", whiteSpace: "nowrap" }}>アイコン</span>
              <input
                autoFocus
                value={iconValue}
                onChange={e => setIconValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.isComposing) updateIcon(iconValue); if (e.key === "Escape") setIconEditing(false); }}
                placeholder="絵文字を入力"
                style={{ flex: 1, background: "#16213e", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: "#e8e8e8", fontSize: "20px", padding: "6px 10px", fontFamily: "inherit", outline: "none", textAlign: "center" }}
              />
              <button onClick={() => updateIcon(iconValue)} style={{ background: mon.color + "22", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: mon.color, fontSize: "11px", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}>確定</button>
              <button onClick={() => setIconEditing(false)} style={{ background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "8px 10px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>
          ) : (
            <button onClick={() => { setIconValue(mon.icon || ""); setIconEditing(true); }} style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", marginBottom: "10px" }}>
              {mon.icon} アイコンを変更
            </button>
          )}

          <EVSearch macho={macho} color={mon.color} />
          <LocationGuide color={mon.color} />

          <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", letterSpacing: "1px" }}>
            GEN III · MAX 252/STAT · MAX 510/TOTAL · AUTO SAVE
          </div>
        </div>

        {/* ===== データカラム ===== */}
        <div className={activeTab === "chosa" ? "" : "col-hidden"}>
          <TypeChart color={mon.color} />
          <PokedexPanel color={mon.color} />
          <IVChecker color={mon.color} />
          <EVGuide color={mon.color} />
        </div>

        {/* ===== 冒険カラム ===== */}
        <div className={activeTab === "boken" ? "" : "col-hidden"}>
          <TodoList color={mon.color} todos={todoList} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} />
          <AdventurePanel color={mon.color} checkedItems={checkedItems} onToggle={toggleItem} onReset={resetItems} />
        </div>
      </div>

      {/* Bottom nav（モバイルのみ） */}
      <nav className="bottom-nav">
        <button onClick={() => setActiveTab("ikusei")} style={{ color: activeTab === "ikusei" ? mon.color : "#555", borderTopColor: activeTab === "ikusei" ? mon.color : "transparent" }}>
          💪 育成
        </button>
        <button onClick={() => setActiveTab("chosa")} style={{ color: activeTab === "chosa" ? mon.color : "#555", borderTopColor: activeTab === "chosa" ? mon.color : "transparent" }}>
          📊 データ
        </button>
        <button onClick={() => setActiveTab("boken")} style={{ color: activeTab === "boken" ? mon.color : "#555", borderTopColor: activeTab === "boken" ? mon.color : "transparent" }}>
          🗺 冒険
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<EVTracker />);
