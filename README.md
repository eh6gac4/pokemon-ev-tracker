# ポケモン努力値トラッカー

ポケモン FR/LG（第3世代ルール）向けのブラウザ管理ツール。

## 機能

| 機能 | 内容 |
|------|------|
| **EVトラッカー** | パーティ6匹のEVを管理。+1/+4 ボタンで加算、合計510・1ステータス最大252を自動チェック |
| **強制ギプス** | ON時は加算ボタンが×2（+1→+2, +4→+8） |
| **ビタミン管理** | 各ステータス行に残り使用可能本数を表示（EV<100のときのみ使用可） |
| **メモ欄** | ポケモンごとに性格・持ち物・技を自由記述、DBに自動保存 |
| **個体値チェッカー** | カントー151匹対応。レベル・性格・実数値・努力値を入力して個体値範囲を表示 |
| **EVサーチ** | ポケモン名検索・ステータス絞り込みで「倒した時にもらえるEV」を確認 |
| **EV稼ぎガイド** | FR/LG向けの効率的なEV稼ぎ場所一覧 |
| **自動保存** | データ変更のたびにサーバー（SQLite）へ保存 |

## 起動

```bash
docker compose up -d
```

ブラウザで `http://localhost:8080` を開く。

LAN内の別デバイス（スマホ等）からは `http://192.168.1.253:8080` でアクセス可能。

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

## ファイル構成

```
.
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
