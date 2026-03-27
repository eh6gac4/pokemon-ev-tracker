# ポケモン努力値トラッカー

ポケモン（第3世代ルール）の努力値（EV）をブラウザで管理するツール。

- 1パーティ最大6匹 + 自由に追加・削除
- 各ステータスを +1 / -1 / +4 / -4 で調整
- 合計510・1ステータス最大252のルールを自動チェック
- データはサーバー（SQLite）に保存 → どのデバイスからでも同じデータにアクセス可能

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
├── index.html          # フロントエンド（React / CDN）
├── server.py           # バックエンド（Python標準ライブラリのみ）
├── Dockerfile
├── docker-compose.yml
└── data/
    └── ev_data.db      # データ（SQLite）
```
