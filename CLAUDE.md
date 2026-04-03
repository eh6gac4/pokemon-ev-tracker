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
  "party":    [ { "name": "...", "icon": "...", "color": "...", "memo": "..." } ],
  "allEVs":   { "ポケモン名": { "hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 } },
  "selected": "ポケモン名"
}
```

## ポケモンのEVルール（第3世代）

- 1ステータスの最大値: 252
- 全ステータスの合計最大値: 510
- これらの制約はフロントエンド（`change()`関数）で強制している

## フロントエンドの主要データ定数

| 定数 | 内容 |
|------|------|
| `POKEMON_DATA` | カントー151匹の種族値 `[id, 日本語名, hp, atk, def, spa, spd, spe]` |
| `EV_YIELD` | 151匹のEV yield `[hp, atk, def, spa, spd, spe]`（0-indexed、Bulbapedia Gen III） |
| `NATURES` | 25性格の日本語名・上昇・下降ステータス（Bulbapediaで確認済み） |
| `EV_GUIDE` | FR/LG向けEV稼ぎスポット一覧 |

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

## よくある作業

**コード変更後は必ずセットで実行：**
```bash
git add . && git commit -m "..." && git push
docker compose up -d --build
```

**ポート変更：** `docker-compose.yml` の `ports` を変更してコンテナ再起動。
