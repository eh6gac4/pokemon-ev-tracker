# CLAUDE.md

## プロジェクト概要

ポケモン努力値（EV）トラッカー。React 18（Vite ビルド）＋ Pythonバックエンド（標準ライブラリのみ）の構成。Docker Composeで常時起動。

## 技術構成

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 18（Vite ビルド、`js/` 以下の JSX ファイル群） |
| バックエンド | Python 3.11 標準ライブラリ（`http.server`, `sqlite3`） |
| DB | SQLite（`./data/ev_data.db`） |
| 実行環境 | Docker Compose（マルチステージビルド: node:24 → python:3.11） |

## 重要な設計上の制約

- **pipなし** → バックエンドは外部パッケージ不使用（Python標準ライブラリのみ）
- フロントエンドは Vite でビルド（`npm run build` → `dist/`）。Dockerfile がビルドを担うので手動実行は不要
- `src/main.jsx` はエントリポイント。コンポーネント本体は `js/` 以下

## API

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/data` | 全データ取得（JSON） |
| POST | `/api/data` | 全データ保存（JSON） |

保存形式：
```json
{
  "party":        [ { "name": "...", "icon": "...", "color": "...", "memo": "...", "nature": "...", "dexId": 1, "item": "..." } ],
  "allEVs":       { "ポケモン名": { "hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 } },
  "allIVs":       { "ポケモン名": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
  "allMoves":     { "ポケモン名": ["わざ1", "わざ2", "わざ3", "わざ4"] },
  "selected":     "ポケモン名",
  "activeParty":  ["ポケモン名1", "ポケモン名2"],
  "checkedItems": { "アイテムid": true },
  "captureCount": 39,
  "captureGoals": [ { "id": "1234567890", "name": "タマタマ", "done": false } ],
  "todoList":     [ { "id": "1234567890", "text": "サファリゾーンへ行く", "done": false } ]
}
```

## ポケモンのEVルール（第3世代）

- 1ステータスの最大値: 252
- 全ステータスの合計最大値: 510
- これらの制約はフロントエンド（`change()`関数）で強制している

## フロントエンドの主要ファイル

| ファイル | 内容 |
|--------|------|
| `js/tracker.jsx` | ルートコンポーネント。状態管理・自動保存・タブ切替・スワイプ |
| `js/components-base.jsx` | 共通UI: `AutoTextarea`, `StatRow`, `Panel`, `PokemonSearch`, `MoveRow`, `VerBadge` |
| `js/components-ikusei.jsx` | 育成タブ: EV管理・個体値・技セット・アイテム・パーティ管理 |
| `js/components-chosa.jsx` | 調査タブ: 個体値チェッカー・個体値比較・EVサーチ・EV稼ぎガイド・図鑑・タイプ相性表・場所別出現・教え技・わざ逆引き・EVランキング・種族値ランキング・特性逆引き |
| `js/components-boken.jsx` | 冒険タブ: ToDoリスト・冒険チェックリスト（アイテム/HM/TM管理）・捕獲リスト（マイルストーン付き） |

## テスト

```bash
python3 test_server.py
```

標準ライブラリの `unittest` のみ使用。DB・HTTP・EVルール・強制ギプス・ビタミン・メモのテストを含む。

## 表記規則

- **ポケモン名・地名・技名・アイテム名はすべて日本語版に統一する**
  - 例：Abra → ケーシィ、Kadabra → ユンゲラー、Seafoam Islands → ふたごじま
  - 英語名の音写（例：シーフォームアイランズ）も使わない
- データ定数（`POKEMON_DATA`, `EV_YIELD` 等）の名前はそのまま維持してよい

## ゲームデータの調べ方

ポケモン名・アイテム名・わざ名などの日本語表記は **PokéAPI** から取得すること。

```
# ポケモン名（日本語）
GET https://pokeapi.co/api/v2/pokemon-species/{id または 英語スラッグ}
→ names[language=ja].name

# アイテム名（日本語）
GET https://pokeapi.co/api/v2/item/{英語スラッグ}
→ names[language=ja].name

# わざ名（日本語）
GET https://pokeapi.co/api/v2/move/{英語スラッグ}
→ names[language=ja].name
```

- 言語コード `ja` → 漢字混じり、`ja-hrkt` → ひらがな/カタカナ。どちらも利用可
- ゲームデータの場所・数値などは Bulbapedia を参照してよいが、名称は必ず PokéAPI で日本語を確認する
- **yakkun.com は使用禁止**（ボットアクセスが遮断されており 403 エラーになる）

## 開発フロー

新機能・修正の実装は必ず以下の順序で行う：

1. **[[PLAN]] で計画作成** → `plan.md` に実装計画を記述
2. **GitHub Issue を自動作成** → `eh6gac4/pokemon-ev-tracker` に issue を作成し、計画内容を記載
3. **ユーザーの承認後に実装着手** → 「実装して」などの指示があるまでコードは書かない
4. **実装完了後に Issue を自動クローズ** → コミットメッセージに `Closes #X` を含めてプッシュ時に自動クローズ

Issue はユーザーに番号を共有してから実装を開始する。

## よくある作業

**コード変更後は必ずセットで実行：**
```bash
git add . && git commit -m "..." && git push
docker compose up -d --build
```

**ポート変更：** `docker-compose.yml` の `ports` を変更してコンテナ再起動。
