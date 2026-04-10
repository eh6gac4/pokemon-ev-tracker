import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  DEFAULT_PARTY, STATS, MAX_STAT, MAX_TOTAL, initEVs, initIVs, COLORS, POKEMON_DATA
} from './data-pokemon.js';
import { getLearnableMoves, getLearnset, ALL_MOVES } from './data-moves.js';
import { AutoTextarea, StatRow, Panel } from './components-base.jsx';
import { AddMonModal, NaturePicker, ItemPicker, MovePicker, PartySlots, PartyPickerModal, IVPanel } from './components-ikusei.jsx';

const ChosaTab = React.lazy(() => import('./components-chosa.jsx'));
const BokenTab = React.lazy(() => import('./components-boken.jsx'));

const TABS = ["boken", "ikusei", "chosa"];

const MonCard = React.memo(function MonCard({ mon, evTotal, isActive, inParty, onSelect }) {
  return (
    <button
      className={`mon-btn${isActive ? " active" : ""}`}
      onClick={() => onSelect(mon.name)}
      style={{
        width: "100%", cursor: "pointer", color: "#e8e8e8", textAlign: "center",
        background: isActive ? `${mon.color}22` : "#16213e",
        border: `2px solid ${isActive ? mon.color : "#2a2a4a"}`,
        borderRadius: "10px", padding: "10px 6px 8px",
        position: "relative",
      }}
    >
      {inParty && <div style={{ position: "absolute", top: "4px", right: "5px", fontSize: "7px", color: mon.color, lineHeight: 1 }}>▲</div>}
      <div style={{ fontSize: "20px", marginBottom: "3px" }}>{mon.icon}</div>
      <div style={{ fontSize: "10px", color: isActive ? mon.color : "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mon.name}</div>
      <div style={{ fontSize: "9px", color: evTotal >= MAX_TOTAL ? "#7fff7f" : "#555", marginTop: "2px" }}>{evTotal}/{MAX_TOTAL}</div>
    </button>
  );
});

export default function EVTracker() {
  const [party,     setParty]    = useState(DEFAULT_PARTY);
  const [allEVs,    setAllEVs]   = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, initEVs()])));
  const [allIVs,    setAllIVs]   = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, initIVs()])));
  const [allMoves,  setAllMoves] = useState(() => Object.fromEntries(DEFAULT_PARTY.map(p => [p.name, ["","","",""]])));
  const [selected,  setSelected] = useState(DEFAULT_PARTY[0].name);
  const [loaded,       setLoaded]       = useState(false);
  const [macho,        setMacho]        = useState(false);
  const initialTab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "boken";
  const [activeTab,    setActiveTab]    = useState(initialTab);
  const [visitedTabs,  setVisitedTabs]  = useState(() => new Set([initialTab]));
  const [dexTarget,    setDexTarget]    = useState(null);

  const navigateTab = useCallback((tab) => {
    setActiveTab(tab);
    setVisitedTabs(prev => { const s = new Set(prev); s.add(tab); return s; });
    history.pushState({ tab }, '', '#' + tab);
  }, []);

  const openDex = useCallback((dexId) => {
    setDexTarget(dexId);
    navigateTab("chosa");
  }, [navigateTab]);

  const clearDexTarget = useCallback(() => setDexTarget(null), []);

  useEffect(() => {
    const onPop = (e) => {
      const tab = e.state?.tab || location.hash.slice(1);
      if (TABS.includes(tab)) {
        setActiveTab(tab);
        setVisitedTabs(prev => { const s = new Set(prev); s.add(tab); return s; });
      }
    };
    // 初回ロード時のエントリを replaceState で記録
    history.replaceState({ tab: initialTab }, '', '#' + initialTab);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // デスクトップでは全タブを即座に表示
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setVisitedTabs(new Set(TABS));
    }
  }, []);
  const [adding,       setAdding]       = useState(false);
  const [newName,      setNewName]      = useState("");
  const [newIcon,      setNewIcon]      = useState("🐣");
  const [newColor,     setNewColor]     = useState(COLORS[0]);
  const [newDexId,     setNewDexId]     = useState(null);
  const [checkedItems,         setCheckedItems]         = useState({});
  const [trainerBattleCounts,  setTrainerBattleCounts]  = useState({});
  const [captureCount,         setCaptureCount]         = useState(0);
  const [captureGoals,  setCaptureGoals]  = useState([]);
  const [todoList,      setTodoList]      = useState([]);
  const [renaming,     setRenaming]     = useState(false);
  const [renameValue,  setRenameValue]  = useState("");
  const [iconEditing,  setIconEditing]  = useState(false);
  const [iconValue,    setIconValue]    = useState("");
  const [activeParty,   setActiveParty]   = useState([null,null,null,null,null,null]);
  const [partyPickSlot, setPartyPickSlot] = useState(null);
  const [archivedParty, setArchivedParty] = useState([]);

  // swipe to change tab
  const swipeX = useRef(null);
  const swipeY = useRef(null);
  const onSwipeStart = useCallback((e) => {
    if (e.touches.length > 1) return; // ピンチズーム中は無視
    swipeX.current = e.touches[0].clientX;
    swipeY.current = e.touches[0].clientY;
  }, []);
  const onSwipeEnd = useCallback((e) => {
    if (swipeX.current === null) return;
    // ズーム中は誤爆防止のため無視
    if (window.visualViewport && window.visualViewport.scale > 1) {
      swipeX.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - swipeX.current;
    const dy = e.changedTouches[0].clientY - swipeY.current;
    swipeX.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      const i = TABS.indexOf(activeTab);
      if (dx < 0 && i < TABS.length - 1) navigateTab(TABS[i + 1]);
      if (dx > 0 && i > 0)               navigateTab(TABS[i - 1]);
    }
  }, [activeTab, navigateTab]);

  // pull-to-refresh
  useEffect(() => {
    const THRESHOLD = 80;
    let startY = 0;
    let pulling = false;

    // indicator element
    const SVG_ICON = `<svg id="ptr-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="display:block;flex-shrink:0"><circle cx="12" cy="12" r="9" stroke-dasharray="49.5 7.1"/></svg>`;
    const el = document.createElement("div");
    el.id = "ptr-indicator";
    el.innerHTML = `${SVG_ICON}<span id="ptr-label">引いてリロード</span>`;
    document.body.prepend(el);
    const indicatorH = el.offsetHeight; // safe-area込みの実高さ

    const update = (dist) => {
      const ratio  = Math.min(dist / THRESHOLD, 1);
      const ready  = dist >= THRESHOLD;
      el.style.opacity  = String(Math.min(ratio * 1.5, 1));
      el.style.transform = `translateY(${Math.min(dist * 0.4, indicatorH - 8)}px)`;
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
        el.style.transform = `translateY(${indicatorH - 8}px)`;
        const icon = document.getElementById("ptr-icon");
        icon.style.transition = "none";
        icon.style.transform = "";
        icon.style.animation = "ptr-spin 1.2s linear infinite";
        document.getElementById("ptr-label").textContent = "リロード中…";
        setTimeout(() => location.reload(true), 1400);
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
        if (saved.allIVs)       setAllIVs(saved.allIVs);
        if (saved.allMoves)     setAllMoves(saved.allMoves);
        if (saved.selected)     setSelected(saved.selected);
        if (saved.checkedItems)        setCheckedItems(saved.checkedItems);
        if (saved.trainerBattleCounts) setTrainerBattleCounts(saved.trainerBattleCounts);
        if (saved.captureCount != null) setCaptureCount(saved.captureCount);
        if (saved.captureGoals)  setCaptureGoals(saved.captureGoals);
        if (saved.todoList)      setTodoList(saved.todoList);
        if (saved.activeParty) {
          const ap = saved.activeParty;
          setActiveParty([...ap, null, null, null, null, null, null].slice(0, 6));
        }
        if (saved.archivedParty) setArchivedParty(saved.archivedParty);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party, allEVs, allIVs, allMoves, selected, checkedItems, trainerBattleCounts, captureCount, captureGoals, todoList, activeParty, archivedParty }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [party, allEVs, allIVs, allMoves, selected, checkedItems, trainerBattleCounts, captureCount, captureGoals, todoList, activeParty, archivedParty, loaded]);

  const toggleItem  = useCallback((id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] })), []);
  const resetItems  = useCallback(() => setCheckedItems({}), []);

  const changeTrainerCount = useCallback((key, stat, ev, delta) => {
    setTrainerBattleCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }));
    change(stat, ev * delta);
  }, [change]);
  const resetTrainerCounts = useCallback((keys) => {
    setTrainerBattleCounts(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = 0; });
      return next;
    });
  }, []);
  const addCaptureGoal    = useCallback((name) => setCaptureGoals(prev => [...prev, { id: Date.now().toString(), name, done: false }]), []);
  const toggleCaptureGoal = useCallback((id)   => setCaptureGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g)), []);
  const deleteCaptureGoal = useCallback((id)   => setCaptureGoals(prev => prev.filter(g => g.id !== id)), []);

  const addTodo      = useCallback((text) => setTodoList(prev => [{ id: Date.now().toString(), text, done: false }, ...prev]), []);
  const toggleTodo   = useCallback((id)  => setTodoList(prev => {
    const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
    return [...next.filter(t => !t.done), ...next.filter(t => t.done)];
  }), []);
  const deleteTodo   = useCallback((id)  => setTodoList(prev => prev.filter(t => t.id !== id)), []);
  const renameTodo   = useCallback((id, text) => setTodoList(prev => prev.map(t => t.id === id ? { ...t, text } : t)), []);
  const reorderTodo  = useCallback((fromId, toId) => setTodoList(prev => {
    const from = prev.findIndex(t => t.id === fromId);
    const to   = prev.findIndex(t => t.id === toId);
    if (from === -1 || to === -1 || from === to) return prev;
    const next = [...prev];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }), []);

  const setPartySlot = useCallback((slot, name) => {
    setActiveParty(prev => {
      const next = [...prev];
      // 既に他のスロットにいれば外す
      for (let i = 0; i < 6; i++) if (next[i] === name && i !== slot) next[i] = null;
      next[slot] = name;
      return next;
    });
    setPartyPickSlot(null);
  }, []);
  const clearPartySlot = useCallback((slot) => setActiveParty(prev => { const n = [...prev]; n[slot] = null; return n; }), []);

  const mon       = useMemo(() => party.find(p => p.name === selected) || party[0], [party, selected]);
  const evs       = useMemo(() => allEVs[selected] || initEVs(), [allEVs, selected]);
  const total     = useMemo(() => Object.values(evs).reduce((a, b) => a + b, 0), [evs]);
  const remaining = MAX_TOTAL - total;

  const change = useCallback((key, delta) => {
    const d = delta > 0 ? delta * (macho ? 2 : 1) : delta;
    setAllEVs(prev => {
      const cur      = (prev[selected] || initEVs())[key];
      const curTotal = Object.values(prev[selected] || initEVs()).reduce((a, b) => a + b, 0);
      let next = Math.max(0, Math.min(MAX_STAT, cur + d));
      if (curTotal - cur + next > MAX_TOTAL) next = cur + (MAX_TOTAL - curTotal);
      return { ...prev, [selected]: { ...(prev[selected] || initEVs()), [key]: Math.max(0, next) } };
    });
  }, [selected, macho]);

  // stat ごとの安定した onChange を事前生成（StatRow の React.memo を有効にする）
  const changeCallbacks = useMemo(
    () => Object.fromEntries(STATS.map(s => [s.key, (d) => change(s.key, d)])),
    [change]
  );

  const reset = useCallback(() => setAllEVs(prev => ({ ...prev, [selected]: initEVs() })), [selected]);

  const updateMemo   = useCallback((text) => setParty(prev => prev.map(p => p.name === selected ? { ...p, memo: text } : p)), [selected]);
  const updateNature = useCallback((name) => setParty(prev => prev.map(p => p.name === selected ? { ...p, nature: name } : p)), [selected]);
  const updateItem   = useCallback((name) => setParty(prev => prev.map(p => p.name === selected ? { ...p, item: name } : p)), [selected]);
  const updateIcon   = useCallback((icon) => {
    const trimmed = icon.trim();
    if (!trimmed) return;
    setParty(prev => prev.map(p => p.name === selected ? { ...p, icon: trimmed } : p));
    setIconEditing(false);
  }, [selected]);

  const updateMove = useCallback((slot, move) => setAllMoves(prev => {
    const cur = prev[selected] || ["","","",""];
    const next = [...cur];
    next[slot] = move;
    return { ...prev, [selected]: next };
  }), [selected]);

  const updateIV = useCallback((key, val) => setAllIVs(prev => ({
    ...prev,
    [selected]: { ...(prev[selected] || initIVs()), [key]: val },
  })), [selected]);

  const saveIVs = useCallback((ivs) => setAllIVs(prev => ({ ...prev, [selected]: ivs })), [selected]);

  const removeMon = useCallback((name) => {
    const next = party.filter(p => p.name !== name);
    setParty(next);
    setAllEVs(prev => { const n = { ...prev }; delete n[name]; return n; });
    setAllIVs(prev => { const n = { ...prev }; delete n[name]; return n; });
    setAllMoves(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (selected === name && next.length > 0) setSelected(next[0].name);
    setActiveParty(prev => prev.map(n => n === name ? null : n));
  }, [party, selected]);

  const archiveMon = useCallback((name) => {
    const m = party.find(p => p.name === name);
    if (!m) return;
    const next = party.filter(p => p.name !== name);
    setParty(next);
    setArchivedParty(prev => [...prev, m]);
    if (selected === name && next.length > 0) setSelected(next[0].name);
    setActiveParty(prev => prev.map(n => n === name ? null : n));
  }, [party, selected]);

  const unarchiveMon = useCallback((name) => {
    const m = archivedParty.find(p => p.name === name);
    if (!m || party.find(p => p.name === name)) return;
    setArchivedParty(prev => prev.filter(p => p.name !== name));
    setParty(prev => [...prev, m]);
    setSelected(name);
  }, [archivedParty, party]);

  const renameMon = useCallback((oldName, newName) => {
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
    setAllIVs(prev => {
      const n = { ...prev };
      n[trimmed] = n[oldName] || initIVs();
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
    setActiveParty(prev => prev.map(n => n === oldName ? trimmed : n));
    setRenaming(false);
  }, [party, selected]);

  const addMon = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed || party.find(p => p.name === trimmed)) return;
    setParty(prev => [...prev, { name: trimmed, icon: newIcon, color: newColor, memo: "", nature: "", dexId: newDexId }]);
    setAllEVs(prev => ({ ...prev, [trimmed]: initEVs() }));
    setAllIVs(prev => ({ ...prev, [trimmed]: initIVs() }));
    setAllMoves(prev => ({ ...prev, [trimmed]: ["","","",""] }));
    setSelected(trimmed);
    setAdding(false);
    setNewName("");
    setNewDexId(null);
  }, [newName, newIcon, newColor, newDexId, party]);

  const learnableMoves = useMemo(() => {
    const pd = mon.dexId != null ? POKEMON_DATA[mon.dexId] : null;
    return pd ? getLearnableMoves(pd[0]) : ALL_MOVES;
  }, [mon.dexId]);
  const learnset = useMemo(() => {
    const pd = mon.dexId != null ? POKEMON_DATA[mon.dexId] : null;
    return pd ? getLearnset(pd[0]) : null;
  }, [mon.dexId]);

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "monospace" }}>
      ロード中…
    </div>
  );

  return (
    <div className="app-wrap" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "2px" }}>FireRed · AUTO SAVE</div>
        <div style={{ fontSize: "20px", letterSpacing: "2px", color: mon.color, textShadow: `0 0 20px ${mon.color}66` }}>
          ポケログ
        </div>
      </div>

      <div className="app-layout">
        {/* ===== 育成カラム ===== */}
        <div className={activeTab === "ikusei" ? "" : "col-hidden"}>

          {/* 現在のパーティ */}
          <PartySlots
            slots={activeParty}
            roster={party}
            color={mon.color}
            onSlotSelect={name => setSelected(name)}
            onSlotClear={clearPartySlot}
            onEmptySlotClick={slot => setPartyPickSlot(slot)}
          />
          {partyPickSlot !== null && (
            <PartyPickerModal
              roster={party}
              activeParty={activeParty}
              archivedParty={archivedParty}
              color={mon.color}
              onSelect={name => setPartySlot(partyPickSlot, name)}
              onUnarchive={unarchiveMon}
              onClose={() => setPartyPickSlot(null)}
            />
          )}

          {/* 育成リスト */}
          <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1px", marginBottom: "6px" }}>育成リスト</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "7px", marginBottom: "16px" }}>
            {party.map(p => (
              <MonCard
                key={p.name}
                mon={p}
                evTotal={Object.values(allEVs[p.name] || initEVs()).reduce((a, b) => a + b, 0)}
                isActive={selected === p.name}
                inParty={activeParty.includes(p.name)}
                onSelect={setSelected}
              />
            ))}
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
              <StatRow key={stat.key} stat={stat} val={evs[stat.key] || 0} color={mon.color} macho={macho} onChange={changeCallbacks[stat.key]} />
            ))}
          </div>

          {/* 技セット */}
          <MovePicker moves={allMoves[selected] || ["","","",""]} color={mon.color} onChange={updateMove} learnableMoves={learnableMoves} learnset={learnset} />

          {/* 性格 */}
          <NaturePicker value={mon.nature || ""} color={mon.color} onChange={updateNature} />

          {/* 個体値 */}
          <IVPanel ivs={allIVs[selected] || initIVs()} color={mon.color} onChange={updateIV} />

          {/* 持ち物 */}
          <ItemPicker value={mon.item || ""} color={mon.color} onChange={updateItem} />

          {/* メモ */}
          <div className="card" style={{ padding: "10px 12px", marginBottom: "10px", borderColor: mon.color + "22" }}>
            <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>メモ</div>
            <AutoTextarea value={mon.memo || ""} onChange={updateMemo} placeholder="自由メモ…" />
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button onClick={reset} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
              EV リセット
            </button>
            {party.length > 1 && (<>
              <button onClick={() => archiveMon(selected)} style={{ flex: 1, background: "transparent", border: "1px solid #f5d02044", borderRadius: "7px", color: "#f5d020", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
                アーカイブ
              </button>
              <button onClick={() => removeMon(selected)} style={{ flex: 1, background: "transparent", border: "1px solid #ff444444", borderRadius: "7px", color: "#ff6666", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "2px" }}>
                削除
              </button>
            </>)}
          </div>

          {renaming ? (
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.isComposing) renameMon(selected, renameValue); if (e.key === "Escape") setRenaming(false); }}
                style={{ flex: 1, minWidth: 0, background: "#16213e", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: "#e8e8e8", fontSize: "13px", padding: "8px 10px", fontFamily: "inherit", outline: "none" }}
              />
              <button onClick={() => renameMon(selected, renameValue)} style={{ flexShrink: 0, background: mon.color + "22", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: mon.color, fontSize: "11px", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}>確定</button>
              <button onClick={() => setRenaming(false)} style={{ flexShrink: 0, background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "8px 10px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>
          ) : (
            <button onClick={() => { setRenameValue(selected); setRenaming(true); }} style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", marginBottom: "10px" }}>
              ✏️ 名前を変更
            </button>
          )}

          {iconEditing ? (
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px", alignItems: "center" }}>
              <input
                autoFocus
                value={iconValue}
                onChange={e => setIconValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.isComposing) updateIcon(iconValue); if (e.key === "Escape") setIconEditing(false); }}
                placeholder="絵文字を入力"
                style={{ flex: 1, minWidth: 0, background: "#16213e", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: "#e8e8e8", fontSize: "20px", padding: "6px 10px", fontFamily: "inherit", outline: "none", textAlign: "center" }}
              />
              <button onClick={() => updateIcon(iconValue)} style={{ flexShrink: 0, background: mon.color + "22", border: `1px solid ${mon.color}88`, borderRadius: "7px", color: mon.color, fontSize: "11px", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}>確定</button>
              <button onClick={() => setIconEditing(false)} style={{ flexShrink: 0, background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "8px 10px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>
          ) : (
            <button onClick={() => { setIconValue(mon.icon || ""); setIconEditing(true); }} style={{ width: "100%", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "7px", color: "#555", fontSize: "11px", padding: "9px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", marginBottom: "10px" }}>
              {mon.icon} アイコンを変更
            </button>
          )}

          <div style={{ textAlign: "center", fontSize: "8px", color: "#2a2a4a", letterSpacing: "1px" }}>
            GEN III · MAX 252/STAT · MAX 510/TOTAL · AUTO SAVE
          </div>
        </div>

        {/* ===== データカラム ===== */}
        <div className={activeTab === "chosa" ? "" : "col-hidden"}>
          {visitedTabs.has("chosa") && (
            <React.Suspense fallback={<div style={{ textAlign: "center", padding: "24px", color: "#555" }}>読み込み中…</div>}>
              <ChosaTab
                color={mon.color}
                party={party}
                allIVs={allIVs}
                dexTarget={dexTarget}
                onDexTargetConsumed={clearDexTarget}
                macho={macho}
                ivs={allIVs[selected] || initIVs()}
                onSave={saveIVs}
                trainerBattleCounts={trainerBattleCounts}
                onTrainerBattle={changeTrainerCount}
                onResetTrainerCounts={resetTrainerCounts}
              />
            </React.Suspense>
          )}
        </div>

        {/* ===== 冒険カラム ===== */}
        <div className={activeTab === "boken" ? "" : "col-hidden"}>
          {visitedTabs.has("boken") && (
            <React.Suspense fallback={<div style={{ textAlign: "center", padding: "24px", color: "#555" }}>読み込み中…</div>}>
              <BokenTab
                color={mon.color}
                todos={todoList}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onRename={renameTodo}
                onReorder={reorderTodo}
                captureCount={captureCount}
                captureGoals={captureGoals}
                onCountChange={setCaptureCount}
                onAddGoal={addCaptureGoal}
                onToggleGoal={toggleCaptureGoal}
                onDeleteGoal={deleteCaptureGoal}
                onOpenDex={openDex}
                checkedItems={checkedItems}
                onToggleItem={toggleItem}
                onReset={resetItems}
              />
            </React.Suspense>
          )}
        </div>
      </div>

      {/* Bottom nav（モバイルのみ） */}
      <nav className="bottom-nav">
        <button onClick={() => navigateTab("boken")} style={{ color: activeTab === "boken" ? mon.color : "#555", borderTopColor: activeTab === "boken" ? mon.color : "transparent" }}>
          🗺 冒険
        </button>
        <button onClick={() => navigateTab("ikusei")} style={{ color: activeTab === "ikusei" ? mon.color : "#555", borderTopColor: activeTab === "ikusei" ? mon.color : "transparent" }}>
          💪 育成
        </button>
        <button onClick={() => navigateTab("chosa")} style={{ color: activeTab === "chosa" ? mon.color : "#555", borderTopColor: activeTab === "chosa" ? mon.color : "transparent" }}>
          📊 データ
        </button>
        <button onClick={() => { location.reload(true); }} title="全ファイルをキャッシュなしで再取得" style={{ flex: "0 0 auto", padding: "16px 14px", color: "#2a2a4a", fontSize: "16px", borderTopColor: "transparent" }}>
          ↺
        </button>
      </nav>
    </div>
  );
}
