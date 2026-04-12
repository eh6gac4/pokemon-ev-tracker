import { test, expect } from '@playwright/test';

// API をモックして常にデフォルト状態（全EV=0）で始める
test.beforeEach(async ({ page }) => {
  await page.route('/api/data', route => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: {} });
    return route.fulfill({ json: { ok: true } });
  });
});

const openPanel = async (page, text) => {
  await page.locator('.panel-toggle', { hasText: text }).click();
  await page.waitForTimeout(300);
};

test('冒険タブ 初期表示', async ({ page }) => {
  await page.goto('/#boken');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('boken.png');
});

test('育成タブ 初期表示', async ({ page }) => {
  await page.goto('/#ikusei');
  await page.waitForSelector('.step-btn');
  await expect(page).toHaveScreenshot('ikusei.png');
});

const waitForChosa = async (page) => {
  await page.locator('.panel-toggle', { hasText: 'EV稼ぎガイド' }).waitFor({ state: 'visible' });
};

test('調査タブ 初期表示', async ({ page }) => {
  await page.goto('/#chosa');
  await waitForChosa(page);
  await expect(page).toHaveScreenshot('chosa.png');
});

test('調査タブ 個体値チェッカー展開', async ({ page }) => {
  await page.goto('/#chosa');
  await waitForChosa(page);
  await openPanel(page, '個体値チェッカー');
  await expect(page).toHaveScreenshot('chosa-iv-checker.png');
});

test('調査タブ EV稼ぎガイド展開', async ({ page }) => {
  await page.goto('/#chosa');
  await waitForChosa(page);
  await openPanel(page, 'EV稼ぎガイド');
  await expect(page).toHaveScreenshot('chosa-ev-guide.png');
});
