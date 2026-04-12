# ポケモン第3世代の努力値管理ツールを自作したら、思いのほか技術的に楽しかった話

## はじめに

子どものころに遊んだポケモン ファイアレッド・リーフグリーン（FRLG）がSwitchで出ると知り、「やるしかない」と思いました。

ただ、せっかく遊ぶなら普通のプレイとは少し違う楽しみ方をしてみたい。そこで考えたのが、**旅の中で無理のない範囲で努力値稼ぎをしながら進む**というスタイルです。ジムバッジを集めつつ、自分のパーティを少しずつ強化していく感じが、育成ゲームとしてのポケモンの楽しさをより引き出せそうだと思いました。

さっそくClaudeに「努力値を管理できる方法はないか」と聞いてみたところ、Reactで実装した簡易ツールを提案してきました。それを見た瞬間に思ったんです。「どうせなら自分で最高の努力値管理ツールを作ろう」と。

こうして、Claude Code をペアプログラマーにした開発がはじまりました。

---

## 努力値（EV）とは

記事の読者に向けて簡単に補足しておくと、**努力値（EV: Effort Value）** とは、ポケモンが戦闘を経ることで蓄積されるステータスへのボーナスポイントです。第3世代（ルビー・サファイアから）のルールでは：

- 1ステータスあたりの上限：**252**
- 全ステータスの合計上限：**510**
- 4EVごとに実数値が1上昇

「どのステータスに何ポイント振るか」という配分（いわゆる努力値配分）が、育成の核心部分です。これを旅の最中に管理しようとすると、手元で随時確認・更新できるツールが欲しくなります。

---

## 作ったもの

**ポケモン第3世代（FRLGカントー151匹）専用**の努力値トラッカーです。React 18とPythonで実装し、Docker Composeで常時起動しています。

機能は3つのタブに分けました。

### 育成タブ

パーティのEV・個体値・性格・技を管理するメインの画面です。

- EVをボタンで増減（上限252・合計510を自動チェック）
- 強制ギプス装備中は獲得EV2倍、がくしゅうそうち装備中は別のポケモンにも同時加算
- 性格補正（+10% / -10%）を反映した実数値プレビュー

### 調査タブ

育成に必要な情報を調べる画面です。

- **個体値チェッカー**：種族値・レベル・性格・実数値を入力すると個体値の候補範囲を表示
- **EV稼ぎガイド**：ステータス別に効率の良い野生ポケモンとトレーナーを一覧化し、対戦回数もカウント
- タイプ相性表・場所別出現・わざ逆引き・特性逆引きなど

### 冒険タブ

旅の進捗管理です。

- ToDoリスト
- アイテム・ひでんマシン・わざマシンのチェックリスト
- 捕獲リスト（マイルストーン達成でお祝いメッセージ）

---

## 技術スタック

```
React 18 (Vite) ──ビルド→ dist/ ──配信→ Python http.server ──保存→ SQLite
```

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18（Vite ビルド） |
| バックエンド | Python 3.11（標準ライブラリのみ） |
| DB | SQLite |
| 実行環境 | Docker Compose（マルチステージビルド） |

技術選定のポイントは「**pip なし縛り**」です。バックエンドに外部パッケージを一切使わないことで、Dockerイメージを軽量に保ちつつ、標準ライブラリの実力を試せる構成にしました。

---

## 技術的工夫

### 1. pipなしPythonサーバー

`http.server.BaseHTTPRequestHandler` を継承したハンドラに、APIエンドポイントと静的ファイル配信を同居させています。FastAPIやFlaskは使っていません。

```python
class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/data":
            self.send_json(200, load_data())
        else:
            self._serve_static(self.path)

    def do_POST(self):
        if self.path == "/api/data":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            save_data(data)
            self.send_json(200, {"ok": True})
```

さらに、静的ファイル配信には **ETag + 304** と **gzip圧縮** も標準ライブラリだけで実装しました。

```python
# ETag を md5 で生成し、一致すれば 304 を返す
etag = f'"{hashlib.md5(raw_body).hexdigest()}"'
if self.headers.get("If-None-Match") == etag:
    self.send_response(304)
    self.send_header("ETag", etag)
    self.end_headers()
    return

# html/js/css/json はオンザフライでgzip圧縮
if "gzip" in self.headers.get("Accept-Encoding", ""):
    body = gzip.compress(raw_body, compresslevel=6)
    self.send_header("Content-Encoding", "gzip")
```

また、Viteがビルド時にハッシュを付与するアセット（`dist/assets/*`）は `Cache-Control: public, max-age=31536000, immutable` で長期キャッシュ、それ以外は `no-cache` と使い分けています。

「Pythonの標準ライブラリ、やれば意外となんでもできるな」と思った部分です。

### 2. SQLiteの1行UPSERT設計

全データを1行のJSONとしてSQLiteに保存します。テーブルは1つ、行も1つです。

```sql
CREATE TABLE IF NOT EXISTS ev_data (
    id    INTEGER PRIMARY KEY CHECK (id = 1),
    data  TEXT NOT NULL
)
```

保存は SQLite の `UPSERT` 構文で1クエリに収めています。

```python
conn.execute("""
    INSERT INTO ev_data (id, data) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data
""", (json.dumps(data, ensure_ascii=False),))
```

`CHECK (id = 1)` で「id=1の行しか存在できない」ことをDBレベルで保証しています。

この設計の利点は**スキーマ変更が不要**なことです。新しいフィールドを追加するときは、フロントエンドのJSONにキーを追加するだけで済みます。カラム追加のマイグレーションは一度も書きませんでした。

### 3. EVルールの強制（252上限 + 510合計）

第3世代のEVルールをフロントエンドの `change()` 関数1か所で強制しています。

```javascript
const change = useCallback((key, delta) => {
  // 強制ギプス装備中は加算量を2倍に
  const d = delta > 0 ? delta * (macho ? 2 : 1) : delta;

  setAllEVs(prev => {
    const cur      = prev[selected][key];
    const curTotal = Object.values(prev[selected]).reduce((a, b) => a + b, 0);

    // 1ステータスの上限 252
    let next = Math.max(0, Math.min(MAX_STAT, cur + d));
    // 合計の上限 510
    if (curTotal - cur + next > MAX_TOTAL) next = cur + (MAX_TOTAL - curTotal);

    let newState = { ...prev, [selected]: { ...prev[selected], [key]: next } };

    // がくしゅうそうち：別のポケモンに倍率なしで同量加算
    if (gakushuu && gakushuuMon && gakushuuMon !== selected && delta > 0) {
      const hCur   = newState[gakushuuMon][key];
      const hTotal = Object.values(newState[gakushuuMon]).reduce((a, b) => a + b, 0);
      let hNext = Math.max(0, Math.min(MAX_STAT, hCur + delta)); // 倍率なし
      if (hTotal - hCur + hNext > MAX_TOTAL) hNext = hCur + (MAX_TOTAL - hTotal);
      newState = { ...newState, [gakushuuMon]: { ...newState[gakushuuMon], [key]: hNext } };
    }

    return newState;
  });
}, [selected, macho, gakushuu, gakushuuMon]);
```

強制ギプス（倍率×2）とがくしゅうそうち（もう1匹に同時加算）を同じ関数内で処理しているのがポイントです。がくしゅうそうちには倍率が乗らない（`delta` をそのまま渡す）という第3世代の仕様もここで再現しています。

### 4. 個体値チェッカーの逆算ロジック

ポケモンの実数値から個体値を逆算するロジックです。第3世代の計算式（4EV=1ステータス、性格±10%の整数丸め）をそのまま実装し、0〜31の全探索で一致する個体値を列挙します。

```javascript
const calcIV = (statKey) => {
  const base  = POKEMON_DATA[mon][PD[statKey]]; // 種族値
  const evVal = Math.floor(Math.min(255, ev[statKey]) / 4); // 4EV=1ステータス
  const a     = parseInt(actual[statKey]); // 入力された実数値

  const candidates = [];
  for (let iv = 0; iv <= 31; iv++) {
    const inner = Math.floor((2 * base + iv + evVal) * lv / 100);
    const stat  = statKey === "hp"
      ? inner + lv + 10                                  // HP計算式
      : nature.up === statKey ? Math.floor((inner + 5) * 11 / 10)  // 上昇補正
      : nature.dn === statKey ? Math.floor((inner + 5) *  9 / 10)  // 下降補正
      : inner + 5;
    if (stat === a) candidates.push(iv);
  }
  return candidates; // 例: [14, 15, 16, 17]
};

// 表示: 「14〜17」のような範囲で出力
const ivDisp = (k) => {
  const r = calcIV(k);
  if (r.length === 1) return `${r[0]}`;
  return `${r[0]}〜${r[r.length - 1]}`;
};
```

ゲーム内のステータス計算式は整数の切り捨てを含むため、複数の個体値が同じ実数値に対応することがあります。候補が「14〜17」のように範囲表示になるのはそのためです。レベルが上がるにつれて候補が絞られていく様子を見るのも、実は育成の楽しさの一つです。

### 5. デバウンス自動保存

操作が止まってから800ms後に自動でサーバーに保存します。実装は `useEffect` + `clearTimeout` だけです。

```javascript
useEffect(() => {
  if (!loaded) return; // 初回ロード前は保存しない
  const timer = setTimeout(() => {
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ party, allEVs, allIVs, allMoves, /* ... */ }),
    }).catch(() => {}); // 失敗は無視（次の操作で再試行される）
  }, 800);
  return () => clearTimeout(timer); // 新しい変更が来たらタイマーリセット
}, [party, allEVs, allIVs, allMoves, /* ... */, loaded]);
```

ボタンを連打しても最後の操作から800ms後に1回だけ保存される。シンプルですが十分実用的です。

### 6. マルチステージDockerビルド

ビルドにはNode.jsが必要ですが、実行にはPythonしか要りません。マルチステージビルドでその分離を実現しています。

```dockerfile
# ステージ1: Viteでフロントエンドをビルド
FROM node:24-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build   # → dist/ に成果物が生成される

# ステージ2: Pythonサーバーだけの本番イメージ
FROM python:3.11-slim
WORKDIR /app
COPY server.py .
COPY --from=builder /app/dist ./dist   # ビルド成果物だけコピー
CMD ["python3", "server.py"]
```

最終イメージにはNode.jsが含まれないのでイメージサイズを抑えられます。手元で `npm run build` を実行する必要もなく、`docker compose up -d --build` の一発でビルドから起動まで完結します。

### 7. モバイルファーストなUX

ゲームしながら手元のスマホで参照することが多いので、モバイルのUXに気を使いました。

**スワイプでタブ切り替え**：3タブを左右スワイプで移動できます。ピンチズーム中の誤爆を防ぐため、`visualViewport.scale > 1` のときは無視しています。

```javascript
const onSwipeEnd = useCallback((e) => {
  if (window.visualViewport && window.visualViewport.scale > 1) return; // ズーム中は無視
  const dx = e.changedTouches[0].clientX - swipeX.current;
  if (Math.abs(dx) > 50) {
    const i = TABS.indexOf(activeTab);
    if (dx < 0 && i < TABS.length - 1) navigateTab(TABS[i + 1]);
    if (dx > 0 && i > 0)               navigateTab(TABS[i - 1]);
  }
}, [activeTab, navigateTab]);
```

**URLハッシュでタブ状態管理**：タブ切り替えのたびに `history.pushState` でURLハッシュを更新しているので、ブラウザバックが自然に動きます。

**React.lazy で遅延ロード**：調査タブと冒険タブはデータ量が多いので、初回訪問時にだけロードします。デスクトップでは全タブを即座にロードし、モバイルは訪問したタブだけをロードします。

---

## はまったこと

**がくしゅうそうちのEV分配ルール**：第3世代の仕様では、がくしゅうそうちを持ったポケモンには強制ギプスの倍率が乗りません（強制ギプスは戦闘に出たポケモン自身にだけ適用）。Bulbapediaで仕様を確認しながら実装しましたが、「倍率ありでもう1匹に加算」と「倍率なしでもう1匹に加算」の違いが分かりにくく、テストを書いて確認しました。

**iOS PWAでのpull-to-refresh競合**：iOSのSafariでPWAとして起動したとき、独自実装のpull-to-refreshがネイティブのバウンススクロールと競合しました。`touchmove` イベントを `passive: false` で登録して `e.preventDefault()` を呼ぶことで解決しましたが、`passive: true` でないとパフォーマンス警告が出るためバランスが難しかったです。

---

## テスト

バックエンドのロジックは Python 標準ライブラリの `unittest` でテストしています（764行）。外部ライブラリを一切使わない方針はテストでも徹底しました。

```
TestDatabase    … DB 初期化・保存・復元・日本語保存
TestHTTPServer  … GET/POST/OPTIONS・ETag/304・gzip圧縮・静的配信
TestEVRules     … 252上限・510合計・配分ロジック
TestMachoBrace  … 倍率計算・上限チェック
TestVitamins    … 第3世代のビタミン使用上限（100EVまで）
TestMemo        … メモフィールドの保存・更新
```

実行は `python3 test_server.py` の1コマンドです。

---

## おわりに

外出先でも参照できるよう、最終的に **Cloudflare Tunnel** を `docker-compose.yml` に組み込んでスマホから使えるようにしました。プレイ中にスマホを取り出してEVを記録し、育成タブで配分を確認しながらゲームを進めています。

「旅の中で努力値を稼ぎながら進む」というプレイスタイル自体、ゲームのテンポが落ちるかと思っていましたが、「次のジムまでにどのステータスを伸ばすか」という計画を立てる楽しみが加わって、むしろゲームへの没入感が増しました。

今回気づいたのは、**「自分専用ツール」は機能を大胆に絞れるぶん、技術の遊び場として最適**だということです。FastAPIを使わないPythonサーバー、1行SQLiteのUPSERT設計、pipなし縛りのDockerイメージ——ふだんのプロダクト開発では選びにくい選択肢を気軽に試せました。

Claude Code をペアプログラマーにした開発体験も良くて、GitHub Issueを作ってから実装に入るワークフローを取り入れたことで、機能の追加が整理されて気持ちよく進みました。

ソースコードはGitHubに公開しています。第3世代でEV稼ぎをしている方がいれば、ぜひ使ってみてください。
