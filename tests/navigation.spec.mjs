import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('/api/data', route => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: {} });
    return route.fulfill({ json: { ok: true } });
  });
});

test('育成タブボタンでタブが切り替わる', async ({ page }) => {
  await page.goto('/#boken');
  await page.waitForLoadState('networkidle');

  await page.locator('.bottom-nav button', { hasText: '育成' }).click();
  await page.waitForSelector('.step-btn');

  expect(page.url()).toContain('#ikusei');
});

test('データタブボタンでタブが切り替わる', async ({ page }) => {
  await page.goto('/#boken');
  await page.waitForLoadState('networkidle');

  await page.locator('.bottom-nav button', { hasText: 'データ' }).click();
  // chosa 固有パネルが visible になるまで待つ（他タブの非表示 .panel-toggle を避ける）
  await page.locator('.panel-toggle', { hasText: '個体値チェッカー' }).waitFor({ state: 'visible' });

  expect(page.url()).toContain('#chosa');
});

test('ブラウザバックで前のタブに戻る', async ({ page }) => {
  await page.goto('/#boken');
  await page.waitForLoadState('networkidle');

  // 冒険 → 育成へ切り替え
  await page.locator('.bottom-nav button', { hasText: '育成' }).click();
  await page.waitForSelector('.step-btn');
  expect(page.url()).toContain('#ikusei');

  // ブラウザバック → 冒険に戻る
  await page.goBack();
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('#boken');
});

test('URLハッシュ直接指定で対応タブが開く（調査タブ）', async ({ page }) => {
  await page.goto('/#chosa');
  await page.locator('.panel-toggle', { hasText: '個体値チェッカー' }).waitFor({ state: 'visible' });

  expect(page.url()).toContain('#chosa');
  await expect(page.locator('.panel-toggle', { hasText: '個体値チェッカー' })).toBeVisible();
});
