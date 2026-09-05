import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function downloadedText(page, name) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name }).click();
  return readFile(await (await downloadPromise).path(), 'utf8');
}

test('@claim:demo-isolation demo data is resettable and never changes a real working collection', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Review a sample BGG collection' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: ['demo:shelf-bridge:sample'] });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.getByRole('button', { name: 'Use my BGG CSV' }).click();
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();

  await page.locator('#file-input').setInputFiles({
    name: 'collection.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('objectid,name,own\n1,Real Collection Game,1\n'),
  });
  await page.locator('#map-own').selectOption('previously_owned');
  await page.getByRole('navigation').getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.goBack();
  await expect(page.getByRole('row', { name: /Real Collection Game/ })).toBeVisible();
  await expect(page.locator('#map-own')).toHaveValue('previously_owned');
  await page.getByRole('navigation').getByRole('link', { name: 'Demo' }).click();
  await page.getByRole('button', { name: 'Use my BGG CSV' }).click();
  await expect(page.getByRole('heading', { name: 'Choose status rules' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Real Collection Game/ })).toBeVisible();
  await expect(page.locator('#map-own')).toHaveValue('previously_owned');
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
});

test('@claim:local-processing demo requests stay on the product origin', async ({ page, baseURL }) => {
  const origins = new Set();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await downloadedText(page, 'Download normalized JSON');
  expect([...origins]).toEqual([new URL(baseURL).origin]);
});

test('@claim:offline-reload populated demo works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Review a sample BGG collection' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await context.setOffline(false);
});

test('@claim:free-to-use a sample export completes without a payment or sign-in step', async ({ page }) => {
  await page.goto('/demo');
  const output = await downloadedText(page, 'Download normalized CSV');
  expect(output.trim().split(/\r?\n/)).toHaveLength(4);
  await expect(page.getByRole('button', { name: 'Download normalized CSV' })).toBeEnabled();
  await expect(page).toHaveURL(/\/demo$/);
});

test('@claim:downloads each file contains the listed records and destination mappings', async ({ page }) => {
  await page.goto('/demo');
  const normalizedCsv = await downloadedText(page, 'Download normalized CSV');
  const normalizedJson = JSON.parse(await downloadedText(page, 'Download normalized JSON'));
  const yamtrack = await downloadedText(page, 'Download Yamtrack CSV');
  const neodb = await downloadedText(page, 'Download NeoDB-style CSV');

  expect(normalizedCsv).toMatch(/^bgg_id,title,/);
  expect(normalizedCsv.trim().split(/\r?\n/)).toHaveLength(4);
  expect(normalizedJson.schema).toBe('shelf-bridge/v1');
  expect(normalizedJson.games).toHaveLength(3);
  expect(yamtrack).toMatch(/^title,year,bgg_id,status,source_statuses,/);
  expect(yamtrack).toContain('Catan,1995,13,owned,owned,');
  expect(yamtrack).toContain('Terraforming Mars,2016,167791,wishlist,wishlist|want_to_play,');
  expect(neodb).toMatch(/^title,category,shelf,source_statuses,/);
  expect(neodb).toContain('Catan,game,complete,owned,');
  expect(neodb).toContain('Gloomhaven,game,complete,previously_owned,');
});

test('@claim:file-size-limit CSV files over 20 MB are rejected', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({
    name: 'too-large.csv',
    mimeType: 'text/csv',
    buffer: Buffer.alloc(20 * 1024 * 1024 + 1, 'x'),
  });
  await expect(page.getByRole('alert')).toContainText('over 20 MB');
});

test('@claim:status-mapping active sample statuses appear in output and Ignore blocks export', async ({ page }) => {
  await page.goto('/demo');
  const output = JSON.parse(await downloadedText(page, 'Download normalized JSON'));
  const statuses = new Set(output.games.flatMap((game) => game.statuses.split('|')));
  expect(statuses).toEqual(new Set(['owned', 'previously_owned', 'wishlist', 'want_to_play']));
  await page.locator('#map-own').selectOption('ignore');
  await expect(page.getByRole('button', { name: 'Download normalized JSON' })).toBeDisabled();
  await page.locator('#map-own').selectOption('owned');
  await expect(page.getByRole('button', { name: 'Download normalized JSON' })).toBeEnabled();
});

test('@claim:status-review simultaneous BGG statuses remain visible for review', async ({ page }) => {
  await page.goto('/demo');
  const mars = page.locator('tbody tr').filter({ hasText: 'Terraforming Mars' });
  await expect(mars).toContainText('Also: Want To Play');
  await expect(mars.getByRole('combobox')).toHaveValue('wishlist');
});

test('@claim:status-edit-preserves-secondary editing a primary status retains the other BGG statuses', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#status-5').selectOption('owned');
  const output = JSON.parse(await downloadedText(page, 'Download normalized JSON'));
  const mars = output.games.find((game) => game.title === 'Terraforming Mars');
  expect(mars.primary_status).toBe('owned');
  expect(mars.statuses.split('|')).toEqual(['owned', 'wishlist', 'want_to_play']);
});

test('@claim:duplicate-handling first and all policies produce different included outputs', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('tbody tr').filter({ hasText: 'Catan' })).toHaveCount(2);
  await expect(page.locator('tbody tr.excluded').filter({ hasText: 'Catan' })).toHaveCount(1);
  const first = JSON.parse(await downloadedText(page, 'Download normalized JSON'));
  expect(first.games.filter((game) => game.title === 'Catan')).toHaveLength(1);

  await page.locator('input[name="duplicates"][value="all"]').check();
  await expect(page.locator('tbody tr.excluded').filter({ hasText: 'Catan' })).toHaveCount(0);
  await expect(page.locator('tbody tr').filter({ hasText: 'Catan' }).getByText(/Duplicate [12] of 2/)).toHaveCount(2);
  const all = JSON.parse(await downloadedText(page, 'Download normalized JSON'));
  expect(all.games.filter((game) => game.title === 'Catan')).toHaveLength(2);
});

test('@claim:keyboard-operation status rules and downloads work from the keyboard', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#map-own').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#map-own')).toHaveValue('ignore');
  await expect(page.getByRole('button', { name: 'Download normalized JSON' })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(page.locator('#map-own')).toHaveValue('owned');
  await page.getByRole('button', { name: 'Download normalized JSON' }).focus();
  const downloadPromise = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  await expect(await downloadPromise).toBeTruthy();
});

test('@claim:in-memory-clearing a real working collection clears on command and reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({
    name: 'collection.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('objectid,name,own\n1,Keyboard Game,1\n'),
  });
  await expect(page.getByRole('heading', { name: 'Choose status rules' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear this file' }).click();
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Add your BGG export' })).toBeVisible();
});
