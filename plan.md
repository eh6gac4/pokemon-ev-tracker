# 計画：EV稼ぎガイドを育成タブへ移動

## 目的

`📖 EV稼ぎガイド（FR/LG）` パネル（`EVGuide` コンポーネント）を調査タブから育成タブに移動する。
育成中のポケモンに直接関係する情報を育成タブにまとめ、ユーザーの操作導線を改善する。

## 変更ファイル

### 1. `js/components-chosa.jsx`
- `EVGuide` コンポーネント（437〜493行）を削除
- `ChosaTab` の JSX から `<EVGuide ...>` の呼び出しを削除
- `ChosaTab` の props から `trainerBattleCounts`, `onTrainerBattle`, `onResetTrainerCounts` を削除

### 2. `js/components-ikusei.jsx`
- import に `EV_GUIDE` を追加
- `EVGuide` コンポーネントを追記（`IVPanel` の後に配置）

### 3. `js/tracker.jsx`
- import 行に `EVGuide` を追加（`components-ikusei.jsx` から）
- 育成タブのメモカードの直後に `<EVGuide>` を追加
  - props: `color`, `trainerBattleCounts`, `onTrainerBattle`, `onResetTrainerCounts`
- `<ChosaTab>` の props から `trainerBattleCounts`, `onTrainerBattle`, `onResetTrainerCounts` を削除

## 配置位置（育成タブ内）

メモカード → **EV稼ぎガイド（新規）** → EVリセット/アーカイブ/削除ボタン
