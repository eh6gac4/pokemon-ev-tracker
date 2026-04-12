import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:8080';
const OUT_DIR  = 'screenshots';
mkdirSync(OUT_DIR, { recursive: true });

// スマホサイズ（iPhone 14 相当）
const VIEWPORT = { width: 390, height: 844 };

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
});
const page = await context.newPage();

// パネルタイトルでトグルボタンをクリックする helper
const openPanel = async (titleText) => {
  const btn = page.locator('.panel-toggle', { hasText: titleText });
  await btn.click();
  await page.waitForTimeout(300);
};

const shot = async (filename) => {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT_DIR}/${filename}`, fullPage: false });
  console.log(`✓ ${filename}`);
};

// ── 初回ロード ──────────────────────────────────────────────
await page.goto(`${BASE_URL}/#boken`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// ── 冒険タブ ────────────────────────────────────────────────
await shot('tab-boken.png');

// ── 育成タブ ────────────────────────────────────────────────
await page.goto(`${BASE_URL}/#ikusei`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await shot('tab-ikusei.png');

// ── 調査タブ（折りたたみ一覧） ──────────────────────────────
await page.goto(`${BASE_URL}/#chosa`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await shot('tab-chosa.png');

// ── 個体値チェッカーを展開 ──────────────────────────────────
await openPanel('個体値チェッカー');
await shot('chosa-iv-checker.png');

// ── EV稼ぎガイドを展開（個体値チェッカーを閉じる） ──────────
await openPanel('個体値チェッカー'); // 閉じる
await openPanel('EV稼ぎガイド');
await shot('chosa-ev-guide.png');

// ── EV稼ぎガイドを閉じてEVランキングを展開 ─────────────────
await openPanel('EV稼ぎガイド'); // 閉じる
await openPanel('EV獲得ランキング');
await shot('chosa-ev-ranking.png');

await browser.close();
console.log('\nすべてのスクリーンショットを保存しました。');
