import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('/api/data', route => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: {} });
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('/#ikusei');
  await page.waitForSelector('.step-btn');
});

// ステータス名でStatRow(.card)を特定するヘルパー
// StatRowのみ .step-btn を持つので、それを条件に絞る
const statCard = (page, jp) =>
  page.locator('.card').filter({ has: page.locator('.step-btn') }).filter({ hasText: jp }).first();

// .card 内の2番目の<span>がEV値
const getEV = async (card) => {
  const text = await card.locator('span').nth(1).innerText();
  return parseInt(text);
};

// ボタンを n 回クリック
const clickN = async (locator, n) => {
  for (let i = 0; i < n; i++) await locator.click();
};

// step-btn のインデックス（macho=OFF 時）
// 0=「－」, 1=「＋1」, 2=「＋2」, 3=「＋3」, 4=「＋10」, 5=「＋25」
const stepBtn = (card, idx) => card.locator('.step-btn').nth(idx);

// ─────────────────────────────────────────────

test('1ステータスのEVは252を超えない', async ({ page }) => {
  const hp = statCard(page, 'ＨＰ');

  // +25 を11回 → 11×25=275 だが上限252
  await clickN(stepBtn(hp, 5), 11);

  expect(await getEV(hp)).toBe(252);
});

test('全ステータスの合計EVは510を超えない', async ({ page }) => {
  const hp  = statCard(page, 'ＨＰ');
  const atk = statCard(page, 'こうげき');
  const def = statCard(page, 'ぼうぎょ');

  // HP を 252 にする（+25×11 → 252）
  await clickN(stepBtn(hp, 5), 11);
  // ATK を 252 にする（合計504、残り6）
  await clickN(stepBtn(atk, 5), 11);
  // DEF に +10 を試みる → 残り6なので6に収まる
  await stepBtn(def, 4).click();

  expect(await getEV(def)).toBe(6);
});

test('強制ギプスOFF: +1ボタンでEVが1増加', async ({ page }) => {
  const hp = statCard(page, 'ＨＰ');
  await stepBtn(hp, 1).click();

  expect(await getEV(hp)).toBe(1);
});

test('強制ギプスON: +1ボタンでEVが2増加（倍率×2）', async ({ page }) => {
  await page.locator('button', { hasText: '強制ギプス' }).click();

  const hp = statCard(page, 'ＨＰ');
  // macho=ON 時、delta=1 が change() 内で ×2 される
  await stepBtn(hp, 1).click();

  expect(await getEV(hp)).toBe(2);
});

test('強制ギプスON: ボタンラベルが「EV×2」表示になる', async ({ page }) => {
  const machoBtn = page.locator('button', { hasText: '強制ギプス' });

  await machoBtn.click();

  await expect(machoBtn).toContainText('EV×2');
});

test('強制ギプスON: 252を超えない', async ({ page }) => {
  const hp = statCard(page, 'ＨＰ');

  // HP を 226 にする（+25×9=225、+1×1=226）
  await clickN(stepBtn(hp, 5), 9);
  await stepBtn(hp, 1).click();
  expect(await getEV(hp)).toBe(226);

  // ギプスON にする
  await page.locator('button', { hasText: '強制ギプス' }).click();

  // +25ボタン（macho時は実質+50） → 226+50=276 だが 252 に収まる
  await stepBtn(hp, 5).click();

  expect(await getEV(hp)).toBe(252);
});
