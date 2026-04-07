import React, { useState, useEffect, useRef } from 'react';
import { ITEM_DATA } from './data-items.js';
import { POKEMON_DATA } from './data-pokemon.js';
import { Panel, tmItemName } from './components-base.jsx';

function renderTextWithLinks(text, done) {
  const URL_RE = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(URL_RE);
  return parts.map((part, i) =>
    URL_RE.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          style={{ color: done ? "#555" : "#7ab4ff", wordBreak: "break-all" }}
          onClick={e => e.stopPropagation()}
        >{part}</a>
      : part
  );
}

export function TodoList({ color, todos, onAdd, onToggle, onDelete, onRename, onReorder }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [todoTab, setTodoTab] = useState("todo");
  const draggingIdRef = React.useRef(null);
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  };
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  const commitEdit = (id) => {
    const t = editText.trim();
    if (t) onRename(id, t);
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);
  const pendingCount = todos.filter(t => !t.done).length;
  const doneCount    = todos.filter(t =>  t.done).length;
  const visibleTodos = todos.filter(t => todoTab === "todo" ? !t.done : t.done);

  // チェック時に自動タブ切り替え（未完了→完了タブへ、完了→未完了タブへ）
  const handleToggle = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.done) setTodoTab("done");
    if (todo &&  todo.done) setTodoTab("todo");
    onToggle(id);
  };

  // pointer events で PC・スマホ両対応のドラッグを実現
  // ドラッグ中の要素に pointer-events:none を設定し、
  // elementFromPoint で下にある要素を取得できるようにする
  const handlePointerDown = (e, id) => {
    e.preventDefault();
    draggingIdRef.current = id;
    setDraggingId(id);
    setDragOverId(null);

    const getOverId = (x, y) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest("[data-todo-id]")?.getAttribute("data-todo-id") || null;
    };

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (x == null) return;
      setDragOverId(getOverId(x, y));
    };

    const onUp = (e) => {
      const x = e.clientX ?? e.changedTouches?.[0]?.clientX;
      const y = e.clientY ?? e.changedTouches?.[0]?.clientY;
      if (x != null) {
        const overId = getOverId(x, y);
        if (draggingIdRef.current && overId && overId !== draggingIdRef.current) {
          onReorder(draggingIdRef.current, overId);
        }
      }
      draggingIdRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="card" style={{ padding: "12px 14px", marginBottom: "12px", borderColor: color + "33" }}>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", color, letterSpacing: "1px" }}>📝 やることリスト</span>
        {todos.length > 0 && doneCount >= todos.length && (
          <span style={{ fontSize: "10px", color: "#7fff7f" }}>✓ 全完了</span>
        )}
      </div>

      {/* タブ */}
      <div style={{ display: "flex", marginBottom: "10px", borderBottom: "1px solid #1a1a2e" }}>
        {[
          { key: "todo", label: "未完了", count: pendingCount },
          { key: "done", label: "完了",   count: doneCount    },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setTodoTab(key)} style={{
            flex: 1, background: "transparent", border: "none",
            borderBottom: todoTab === key ? `2px solid ${color}` : "2px solid transparent",
            color: todoTab === key ? color : "#555",
            fontSize: "11px", padding: "4px 0 6px", cursor: "pointer",
            fontFamily: "inherit", transition: "color 0.15s",
          }}>
            {label}{count > 0 && <span style={{ marginLeft: "4px", fontSize: "10px", opacity: 0.7 }}>({count})</span>}
          </button>
        ))}
      </div>

      {/* 入力欄（未完了タブのみ） */}
      {todoTab === "todo" && (
        <div style={{ display: "flex", gap: "6px", marginBottom: visibleTodos.length > 0 ? "8px" : "0" }}>
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
      )}

      {/* 空メッセージ */}
      {visibleTodos.length === 0 && (
        <div style={{ textAlign: "center", fontSize: "10px", color: "#2a2a4a", padding: "8px 0 2px" }}>
          {todoTab === "todo" ? "やることを追加しよう" : "完了したタスクはありません"}
        </div>
      )}

      {/* リスト */}
      {visibleTodos.map((todo, idx) => (
        <div
          key={todo.id}
          data-todo-id={todo.id}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "7px 2px",
            borderTop: idx === 0 ? "1px solid #1a1a2e" : "none",
            borderBottom: "1px solid #1a1a2e",
            opacity: draggingId === todo.id ? 0.4 : 1,
            background: dragOverId === todo.id ? color + "22" : "transparent",
            transition: "background 0.15s",
            pointerEvents: draggingId === todo.id ? "none" : "auto",
          }}>
          {/* ドラッグハンドル（未完了タブのみ） */}
          {todoTab === "todo" && (
            <span
              onPointerDown={e => handlePointerDown(e, todo.id)}
              style={{
                cursor: "grab", color: "#444", fontSize: "14px", flexShrink: 0,
                userSelect: "none", padding: "0 2px",
                touchAction: "none",
              }}>⠿</span>
          )}
          <input type="checkbox" checked={todo.done} onChange={() => handleToggle(todo.id)}
            style={{ accentColor: color, cursor: "pointer", flexShrink: 0 }} />
          {editingId === todo.id ? (
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.isComposing) commitEdit(todo.id);
                if (e.key === "Escape") cancelEdit();
              }}
              onBlur={() => commitEdit(todo.id)}
              style={{
                flex: 1, background: "#0e0e1e", border: `1px solid ${color}88`,
                borderRadius: "4px", color: "#ddd", fontSize: "11px",
                padding: "3px 6px", fontFamily: "inherit", outline: "none",
              }}
            />
          ) : (
            <span
              onDoubleClick={() => !todo.done && startEdit(todo)}
              title={todo.done ? "" : "ダブルクリックで編集"}
              style={{
                flex: 1, fontSize: "11px",
                color: todo.done ? "#444" : "#ddd",
                textDecoration: todo.done ? "line-through" : "none",
                wordBreak: "break-all",
                cursor: todo.done ? "default" : "text",
              }}
            >{renderTextWithLinks(todo.text, todo.done)}</span>
          )}
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

export function AdventurePanel({ color, checkedItems, onToggle, onReset }) {
  const [filter,    setFilter]    = useState("all");
  const [openAreas, setOpenAreas] = useState({});
  const [openImgs,  setOpenImgs]  = useState({});

  const TYPE_ICON  = { gift: "🎁", tm: "💿", hm: "🔑", field: "📦", hidden: "🔍", gym: "🏆" };
  const FILTERS = [
    { key: "all",    label: "すべて" },
    { key: "gift",   label: "🎁 もらえる" },
    { key: "hm",     label: "🔑 HM" },
    { key: "tm",     label: "💿 TM" },
    { key: "gym",    label: "🏆 ジム" },
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
                          {tmItemName(item)}
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

const CAPTURE_MILESTONES = [
  { count: 10, item: "ひでんマシン05（フラッシュ）", location: "2ばんどうろゲート" },
  { count: 20, item: "かわらずのいし",               location: "10ばんどうろポケセン" },
  { count: 30, item: "ダウジングマシン",             location: "11ばんどうろゲート" },
  { count: 40, item: "おまもりこばん",               location: "16ばんどうろゲート" },
  { count: 50, item: "がくしゅうそうち",             location: "15ばんどうろゲート" },
  { count: 60, item: "ぜんこくずかん",               location: "マサラタウン（殿堂入り後）" },
];

export function CapturePanel({ color, captureCount, captureGoals, onCountChange, onAddGoal, onToggleGoal, onDeleteGoal, onOpenDex }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [focused, setFocused] = useState(false);

  const showList = focused || query.length >= 1;
  const suggestions = POKEMON_DATA.filter(p =>
    (query.length === 0 || p[1].includes(query)) &&
    !captureGoals.some(g => g.name === p[1])
  );

  const add = (name) => { onAddGoal(name); setQuery(""); };

  const doneCount    = captureGoals.filter(g => g.done).length;
  const nextIdx      = CAPTURE_MILESTONES.findIndex(m => captureCount < m.count);
  const nextMilestone = nextIdx >= 0 ? CAPTURE_MILESTONES[nextIdx] : null;

  const btnStyle = (active) => ({
    background: active ? color + "22" : "#16213e",
    border: `1px solid ${active ? color + "66" : "#2a2a4a"}`,
    borderRadius: "6px", color: active ? color : "#555",
    fontSize: "16px", padding: "2px 14px", cursor: "pointer", fontFamily: "inherit", lineHeight: "1.8",
  });

  return (
    <Panel title="🎯 捕獲リスト" open={open} onToggle={() => setOpen(o => !o)} color={color}>

      {/* カウンター */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", color: "#444", marginBottom: "8px", letterSpacing: "1px" }}>捕まえた種類数</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <button onClick={() => onCountChange(Math.max(0, captureCount - 1))} style={btnStyle(false)}>－</button>
          <input
            type="number" min="0" max="386" value={captureCount}
            onChange={e => onCountChange(Math.max(0, Math.min(386, parseInt(e.target.value) || 0)))}
            style={{
              flex: 1, background: "#0d1525", border: `1px solid ${color}44`,
              borderRadius: "6px", color: "#e8e8e8", fontSize: "20px", fontWeight: "bold",
              padding: "4px 8px", textAlign: "center", fontFamily: "inherit", outline: "none",
            }}
          />
          <button onClick={() => onCountChange(Math.min(386, captureCount + 1))} style={btnStyle(true)}>＋</button>
        </div>

        {/* マイルストーン */}
        {CAPTURE_MILESTONES.map(m => {
          const achieved = captureCount >= m.count;
          const isNext   = nextMilestone === m;
          return (
            <div key={m.count} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "5px 6px", marginBottom: "3px",
              background: achieved ? color + "0f" : isNext ? "#0d1525" : "transparent",
              border: `1px solid ${achieved ? color + "44" : isNext ? color + "22" : "#1a1a2e"}`,
              borderRadius: "6px",
            }}>
              <span style={{ fontSize: "11px", minWidth: "24px", textAlign: "center", color: achieved ? "#7fff7f" : isNext ? color : "#333", fontWeight: achieved ? "bold" : "normal" }}>
                {achieved ? "✓" : `${m.count}`}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: achieved ? "#aaa" : isNext ? "#e8e8e8" : "#555", textDecoration: achieved ? "line-through" : "none" }}>{m.item}</div>
                <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>{m.location}</div>
              </div>
            </div>
          );
        })}
        {nextMilestone && (
          <div style={{ textAlign: "center", fontSize: "9px", color: color, marginTop: "6px" }}>
            あと {nextMilestone.count - captureCount} 種類 → {nextMilestone.item}
          </div>
        )}
      </div>

      {/* 目標ポケモンリスト */}
      <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "10px", color: "#444", letterSpacing: "1px" }}>目標ポケモン</span>
          {captureGoals.length > 0 && (
            <span style={{ fontSize: "10px", color: doneCount >= captureGoals.length ? "#7fff7f" : "#555" }}>
              {doneCount}/{captureGoals.length}
            </span>
          )}
        </div>

        {/* 検索入力 */}
        <div style={{ position: "relative", marginBottom: captureGoals.length > 0 ? "8px" : "0" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="ポケモン名で絞り込む / タップで一覧表示…"
            style={{
              width: "100%", background: "#0e0e1e", border: "1px solid #2a2a4a",
              borderRadius: showList && suggestions.length > 0 ? "6px 6px 0 0" : "6px",
              color: "#ddd", fontSize: "12px", padding: "7px 10px",
              fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
          {showList && suggestions.length > 0 && (
            <div style={{
              position: "absolute", zIndex: 10, width: "100%",
              background: "#0d1a2e", border: "1px solid #2a2a4a", borderTop: "none",
              borderRadius: "0 0 6px 6px",
              maxHeight: "180px", overflowY: "auto",
            }}>
              {suggestions.map(p => (
                <div key={p[0]} onMouseDown={() => { add(p[1]); }} style={{
                  padding: "7px 10px", cursor: "pointer", fontSize: "12px", color: "#ccc",
                  borderBottom: "1px solid #1a2a3a",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = color + "22"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {p[1]}
                </div>
              ))}
            </div>
          )}
          {showList && suggestions.length === 0 && (
            <div style={{
              position: "absolute", zIndex: 10, width: "100%",
              background: "#0d1a2e", border: "1px solid #2a2a4a", borderTop: "none",
              borderRadius: "0 0 6px 6px", padding: "8px 10px",
              fontSize: "11px", color: "#444",
            }}>
              追加できるポケモンがありません
            </div>
          )}
        </div>

        {captureGoals.map((goal, idx) => (
          <div key={goal.id} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "7px 2px",
            borderTop: idx === 0 ? "1px solid #1a1a2e" : "none",
            borderBottom: "1px solid #1a1a2e",
          }}>
            <input type="checkbox" checked={goal.done} onChange={() => onToggleGoal(goal.id)}
              style={{ accentColor: color, cursor: "pointer", flexShrink: 0 }} />
            <span
              onClick={() => {
                const idx = POKEMON_DATA.findIndex(p => p[1] === goal.name);
                if (idx >= 0) onOpenDex?.(idx);
              }}
              style={{
                flex: 1, fontSize: "11px",
                color: goal.done ? "#444" : "#ddd",
                textDecoration: goal.done ? "line-through" : "none",
                cursor: "pointer",
              }}
              title="図鑑で確認"
            >{goal.name}</span>
            <button onClick={() => onDeleteGoal(goal.id)} style={{
              background: "transparent", border: "none", color: "#555",
              cursor: "pointer", fontSize: "13px", padding: "0 2px", fontFamily: "inherit",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
              onMouseLeave={e => e.currentTarget.style.color = "#555"}
            >✕</button>
          </div>
        ))}
        {captureGoals.length === 0 && !focused && query.length === 0 && (
          <div style={{ textAlign: "center", fontSize: "10px", color: "#2a2a4a", padding: "8px 0 2px" }}>
            上の欄をタップして追加しよう
          </div>
        )}
      </div>
    </Panel>
  );
}

// ─────────────────────────────────────────
// わざ逆引き
// ─────────────────────────────────────────
