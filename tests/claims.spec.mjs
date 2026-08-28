import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('@claim:demo-isolation direct demo is populated, isolated, resettable, and disposable', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Review your games' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: ['demo:shelf-bridge:sample'] });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
});

test('@claim:local-processing demo requests stay on the product origin', async ({ page, baseURL }) => {
  const origins = new Set();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Normalized JSON' }).click();
  expect([...origins]).toEqual([new URL(baseURL).origin]);
});

test('@claim:offline-reload demo works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Review your games' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await context.setOffline(false);
});

test('@claim:downloads each listed format downloads three sample records', async ({ page }) => {
  await page.goto('/demo');
  const checks = [
    ['Normalized CSV', /bgg_id,title/, 4], ['Normalized JSON', /"schema": "shelf-bridge\/v1"/, 3],
    ['Yamtrack profile', /title,year,bgg_id/, 4], ['NeoDB-style profile', /title,category,shelf/, 4],
  ];
  for (const [name, header, rows] of checks) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name }).click();
    const download = await downloadPromise;
    const content = await readFile(await download.path(), 'utf8');
    expect(content).toMatch(header);
    expect(name === 'Normalized JSON' ? JSON.parse(content).games : content.trim().split(/\r?\n/)).toHaveLength(rows);
  }
});

test('@claim:file-size-limit CSV files over 20 MB are rejected', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({ name: 'too-large.csv', mimeType: 'text/csv', buffer: Buffer.alloc(20 * 1024 * 1024 + 1, 'x') });
  await expect(page.getByRole('alert')).toContainText('over 20 MB');
});

test('@claim:status-review sample keeps simultaneous BGG statuses visible', async ({ page }) => {
  await page.goto('/demo');
  const mars = page.locator('tbody tr').filter({ hasText: 'Terraforming Mars' });
  await expect(mars).toContainText('Also: Want To Play');
  await expect(mars.getByRole('combobox')).toHaveValue('wishlist');
});

test('@claim:keyboard-operation sample status rules and downloads work from the keyboard', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#map-own').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#map-own')).toHaveValue('ignore');
  await expect(page.getByRole('button', { name: 'Normalized JSON' })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(page.locator('#map-own')).toHaveValue('owned');
  await page.getByRole('button', { name: 'Normalized JSON' }).focus();
  const downloadPromise = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  await expect(await downloadPromise).toBeTruthy();
});

test('@claim:in-memory-clearing a real working collection clears on command and reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({ name: 'collection.csv', mimeType: 'text/csv', buffer: Buffer.from('objectid,name,own\n1,Keyboard Game,1\n') });
  await expect(page.getByRole('heading', { name: 'Choose status rules' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear this file' }).click();
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();
});
