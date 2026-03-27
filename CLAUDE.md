# CLAUDE.md

## プロジェクト概要

ポケモン努力値（EV）トラッカー。単一HTMLファイル（React/CDN）＋ Pythonバックエンド（標準ライブラリのみ）の構成。Docker Composeで常時起動。

## 技術構成

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 18（CDN + Babel standalone） |
| バックエンド | Python 3.11 標準ライブラリ（`http.server`, `sqlite3`） |
| DB | SQLite（`./data/ev_data.db`） |
| 実行環境 | Docker Compose |

## 重要な設計上の制約

- **Node.jsなし・pipなし** → フロントはビルド不要のCDN構成、バックエンドは外部パッケージ不使用
- `src/` と `package.json`, `vite.config.js` は**未使用**（Node.js環境が整えばVite化可能な状態で残してある）
- `ev_data.db`（ルート直下）はローカルテスト時の残骸。本番データは `data/ev_data.db`

## API

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/data` | 全データ取得（JSON） |
| POST | `/api/data` | 全データ保存（JSON） |

保存形式：
```json
{
  "party":    [ { "name": "...", "icon": "...", "color": "..." } ],
  "allEVs":   { "ポケモン名": { "hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 } },
  "selected": "ポケモン名"
}
```

## ポケモンのEVルール（第3世代）

- 1ステータスの最大値: 252
- 全ステータスの合計最大値: 510
- これらの制約はフロントエンド（`change()`関数）で強制している

## よくある作業

**コンテナ再ビルド（コード変更後）：**
```bash
docker compose up -d --build
```

**フロントエンドのみ変更した場合はビルド不要**（`index.html`はコンテナ起動時にCOPYされるため再ビルドが必要）。

**ポート変更：** `docker-compose.yml` の `ports` を変更してコンテナ再起動。
