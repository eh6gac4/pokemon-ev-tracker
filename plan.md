# 計画：PWA 最適化（高〜低 優先度すべて対応）

## 目的

ポケログを PWA としてフル機能・オフライン対応・iOS/Android 双方で良質なインストール体験になるよう改善する。

## 対応項目

### 高優先度（PWA 基本要件）

1. **`public/manifest.json` 強化**
   - `lang: "ja"` 追加
   - `scope: "/"` 追加
   - `id: "/"` 追加
   - `display_override: ["standalone"]` 追加
   - `categories: ["games", "utilities"]` 追加
   - icons に `purpose: "maskable"` 版を追加（既存 192/512 + maskable 用 512）

2. **maskable アイコン生成**
   - `public/icon-maskable-512.png` を生成（safe zone を考慮した padding 付き）
   - 既存の 512 アイコンに padding を加えた maskable 版を作る

3. **`public/sw.js` 改善**
   - `install` イベントで `/`, `/manifest.json`, `/icon-192.png`, `/icon-512.png`, `/offline.html` をプリキャッシュ
   - `fetch` ハンドラの race condition 修正（`event.waitUntil` で `cache.put` を待つ）
   - HTML リクエストのフォールバックを `/offline.html` に
   - キャッシュ名を `pokelog-v2` に bump

4. **`public/offline.html` 新規作成**
   - シンプルなオフライン案内ページ（ポケログのテーマカラーで）

### 中優先度（UX）

5. **iOS スプラッシュスクリーン**
   - `apple-touch-startup-image` を `index.html` に追加
   - ダーク背景（#1a1a2e）の起動画像 `public/splash.png` を1枚用意（汎用サイズ）

6. **`index.html` メタタグ補強**
   - `<meta name="description" content="...">` 追加
   - `<meta name="mobile-web-app-capable" content="yes">` 追加（apple- と並列）
   - `<meta name="application-name" content="ポケログ">` 追加

7. **SW の `fetch` ハンドラ修正**
   - レスポンスを clone してから put、`waitUntil` で待つ
   - put のエラーは握りつぶす（opaque response 等）

### 低優先度（磨き込み）

8. **SW 更新通知 UI**
   - `js/tracker.jsx` に SW の `updatefound` を監視するロジック追加
   - 新バージョン検出時にトーストで「新しいバージョンがあります - 更新する」ボタン表示
   - クリックで `skipWaiting` → `controllerchange` → `location.reload()`
   - 既存のトースト UI（`Toast` コンポーネント）があれば再利用、なければシンプルな固定バナーで実装

9. **manifest に screenshots 追加**
   - `public/screenshot-narrow.png`（モバイル想定 540x720 程度）
   - `public/screenshot-wide.png`（PC 想定 1280x720 程度）
   - 既存 `screenshots/` ディレクトリから流用可能か確認、または最低限のダミーを生成

10. **Google Fonts (DotGothic16) のセルフホスト**
    - フォントファイルを `public/fonts/` にダウンロード
    - `style.css` で `@font-face` 定義
    - `index.html` の Google Fonts 関連 link を削除
    - SW のキャッシュ対象に含まれるようになる（同一オリジン）
    - これによりオフラインでも見た目が崩れない

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `public/manifest.json` | 拡張 |
| `public/sw.js` | precache + offline fallback + race fix + v2 bump |
| `public/offline.html` | 新規作成 |
| `public/icon-maskable-512.png` | 新規生成 |
| `public/splash.png` | 新規生成 |
| `public/screenshot-narrow.png` | 新規生成（既存 screenshots/ から） |
| `public/screenshot-wide.png` | 新規生成（既存 screenshots/ から） |
| `public/fonts/DotGothic16-Regular.woff2` | 新規（セルフホスト） |
| `index.html` | description / mobile-web-app-capable / splash / fonts link 削除 |
| `style.css` | @font-face 追加 |
| `js/tracker.jsx` | SW 更新検知ロジック追加 |
| `src/main.jsx` | SW 登録ロジックを移動／拡張（または index.html の inline script を更新） |

## 受け入れ条件

- Chrome DevTools の Application > Manifest で警告ゼロ
- Lighthouse PWA カテゴリで主要項目をクリア
- オフライン時にも `/offline.html` が表示される
- 新バージョンのデプロイ時にユーザーに更新通知が出る
- iOS Safari で Add to Home Screen → 起動時にスプラッシュが出る
