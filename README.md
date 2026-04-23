# ポケログ

ポケモン FR/LG（第3世代ルール）向けのブラウザ管理ツール。

## 機能

### 育成タブ

| 機能 | 内容 |
|------|------|
| **EVトラッカー** | パーティ6匹のEVを管理。+1/+4 ボタンで加算、合計510・1ステータス最大252を自動チェック |
| **強制ギプス** | ON時は加算ボタンが×2（+1→+2, +4→+8） |
| **がくしゅうそうち** | ON時は別のポケモンに同量のEVを同時加算（強制ギプスの倍率は乗らない） |
| **実数値プレビュー** | 性格補正（+10%/-10%）を反映した各ステータスの実数値をリアルタイム表示 |
| **ビタミン管理** | 各ステータス行に残り使用可能本数を表示（EV<100のときのみ使用可） |
| **個体値登録** | 育成タブで各ポケモンのIVを直接入力・保存 |
| **技セット** | ポケモンごとに技を4つまで記録 |
| **メモ欄** | ポケモンごとに自由記述、DBに自動保存 |
| **パーティ管理** | 最大8匹のロスターからアクティブパーティ6匹を選んで切替 |

### 調査タブ

| 機能 | 内容 |
|------|------|
| **個体値チェッカー** | カントー151匹対応。レベル・性格・実数値・努力値を入力して個体値範囲を表示 |
| **個体値比較** | パーティ全員のIVを一覧で並べて比較 |
| **EVサーチ** | ポケモン名検索・ステータス絞り込みで「倒した時にもらえるEV」を確認 |
| **EV稼ぎガイド** | FR/LG向けの効率的なEV稼ぎ場所一覧 |
| **ポケモン図鑑** | カントー151匹の種族値・タイプ・特性・進化を表示 |
| **タイプ相性表** | Gen III ルールのタイプ相性を表形式で表示 |
| **場所別出現ポケモン** | FR/LG の草むら・釣り・なみのり別の出現ポケモン一覧 |
| **教え技の場所** | FR/LG の教え技NPC・場所・条件一覧 |
| **わざ逆引き** | わざ名からそのわざを覚えるポケモンを逆引き |
| **EVランキング** | ステータス別の高EV獲得ポケモンランキング |
| **種族値ランキング** | ステータス別の種族値ランキング |
| **特性逆引き** | 特性名からそのポケモンを逆引き |

### 冒険タブ

| 機能 | 内容 |
|------|------|
| **ToDoリスト** | ドラッグ並べ替え・完了チェック可能なカスタムToDoリスト |
| **冒険チェックリスト** | FR/LG のアイテム・HM・TM・ジムバッジを種別フィルタ付きで管理 |
| **捕獲リスト** | 図鑑登録数カウント＋マイルストーン報酬表示（10匹ごとに特典）＋捕獲ゴール管理 |

### 共通

| 機能 | 内容 |
|------|------|
| **自動保存** | データ変更のたびにサーバー（SQLite）へ自動保存（800msデバウンス） |
| **スワイプ操作** | 3タブを左右スワイプで切り替え（ピンチズーム中は無視） |
| **ブラウザバック対応** | タブ切り替えのたびにURLハッシュを更新し、ブラウザバックでタブを戻れる |

## 起動

```bash
docker compose up -d
```

ブラウザで `http://localhost:8080` を開く。

LAN内の別デバイス（スマホ等）からは `http://<ホストのIPアドレス>:8080` でアクセス可能。

## 停止・再起動

```bash
docker compose down      # 停止
docker compose restart   # 再起動
docker compose logs -f   # ログ確認
```

## データ

`./data/ev_data.db`（SQLite）に保存される。コンテナを削除・再作成してもデータは残る。

バックアップ：

```bash
cp data/ev_data.db data/ev_data.backup.db
```

## ポート変更

`docker-compose.yml` の `ports` を変更する：

```yaml
ports:
  - "9000:8080"  # 例：9000番で公開
```

## Cloudflare 本番デプロイ

### 初回セットアップ（ダッシュボード + CLI）

#### 1. D1 データベースを作成

```bash
npx wrangler d1 create ev-tracker
```

出力された `database_id` を `wrangler.toml` の `REPLACE_WITH_YOUR_D1_DATABASE_ID` に記入。

#### 2. D1 にスキーマを適用

```bash
npx wrangler d1 execute ev-tracker --remote --file=schema.sql
```

#### 3. Cloudflare Pages プロジェクトを作成

Cloudflare ダッシュボード → **Pages** → **Connect to Git** → このリポジトリを選択。

| 設定項目 | 値 |
|----------|---|
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |

#### 4. D1 バインディングを設定

Cloudflare ダッシュボード → Pages プロジェクト → **Settings** → **Bindings** → **D1 databases** を追加。

| 変数名 | D1 データベース |
|--------|----------------|
| `DB` | `ev-tracker` |

#### 5. デプロイ

```bash
git push origin main
```

GitHub push で Cloudflare Pages が自動ビルド＆デプロイ。

### ローカル Dev（変更なし）

```bash
python3 server.py  # APIサーバー（ポート8080）
npm run dev        # Vite dev server（ポート5173）→ /api は自動プロキシ
```

または Docker Compose：

```bash
docker compose up -d
```

### データ移行（既存 SQLite → D1）

```bash
python3 -c "
import sqlite3, json
row = sqlite3.connect('data/ev_data.db').execute('SELECT data FROM ev_data WHERE id=1').fetchone()
if row: print(row[0])
" > /tmp/ev_data.json
```

`/tmp/ev_data.json` の内容を Cloudflare ダッシュボードの D1 クエリエディタから投入するか、Wrangler CLI で実行。

## ファイル構成

```
.
├── functions/
│   └── api/
│       └── data.js     # Cloudflare Pages Function（GET/POST /api/data）
├── schema.sql          # D1 スキーマ定義
├── wrangler.toml       # Cloudflare Workers/Pages 設定
├── index.html          # Vite エントリHTML（<div id="root">のみ）
├── src/
│   └── main.jsx        # React マウントエントリポイント
├── js/                 # React コンポーネント・データ定数
│   ├── tracker.jsx         # ルートコンポーネント（状態管理・タブ切替）
│   ├── components-base.jsx # 共通UI（Panel・StatRow・PokemonSearch 等）
│   ├── components-ikusei.jsx # 育成タブ（EV管理・技・アイテム）
│   ├── components-chosa.jsx  # 調査タブ（IVチェッカー・図鑑・タイプ表等）
│   ├── components-boken.jsx  # 冒険タブ（ToDo・捕獲）
│   ├── data-pokemon.js   # 種族値・EV yield・性格定数
│   ├── data-items.js     # アイテムデータ
│   └── data-moves.js     # 技データ・タイプ色
├── style.css           # グローバルスタイル
├── public/             # 静的アセット（アイコン・manifest.json）
├── dist/               # Vite ビルド出力（git管理外）
├── server.py           # バックエンド（Python標準ライブラリのみ）
├── test_server.py      # テストスイート（python3 test_server.py で実行）
├── Dockerfile          # マルチステージ（node:24 build → python:3.11 serve）
├── docker-compose.yml
└── data/
    └── ev_data.db      # データ（SQLite、.gitignore対象）
```
