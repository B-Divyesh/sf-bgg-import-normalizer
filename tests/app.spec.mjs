import { test, expect } from '@playwright/test';

test('routes set titles, canonical metadata, and an intentional not-found page', async ({ page }) => {
  const routes = [
    ['/', 'Shelf Bridge — Convert a BGG collection CSV', 'Convert a BGG collection CSV', '/'],
    ['/demo', 'Demo — Shelf Bridge', 'Review a sample BGG collection', '/demo'],
    ['/privacy', 'Privacy — Shelf Bridge', 'Privacy for Shelf Bridge', '/privacy'],
    ['/terms', 'Terms — Shelf Bridge', 'Terms for Shelf Bridge', '/terms'],
    ['/missing-route', 'Page not found — Shelf Bridge', 'Page not found', '/'],
  ];
  for (const [path, title, heading, canonical] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://bgg-import-normalizer.sociobot.in${canonical}`);
    for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'link[rel="apple-touch-icon"]']) await expect(page.locator(selector)).toHaveCount(1);
  }
  await expect(page.getByRole('link', { name: 'Return to converter' })).toBeVisible();
});

test('route navigation, browser back, focus, and announcement stay aligned', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#live-region')).toContainText('Privacy loaded.');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#live-region')).toContainText('Shelf Bridge');
});

test('mobile first screen exposes the sample action without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(844);
});

test('demo opens with a named BGG status, output, and duplicate review visible without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const preview = page.getByRole('heading', { name: 'Sample status preview' });
  await expect(preview).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Catan', exact: true })).toBeVisible();
  await expect(page.getByText('Output:', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('duplicate found', { exact: false }).first()).toBeVisible();
  const box = await preview.boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(844);
});

test('the query-string demo entry point loads the same isolated sample', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Shelf Bridge');
  await expect(page.getByRole('heading', { name: 'Review a sample BGG collection' })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(4);
});

test('invalid imports give a next step and a valid CSV recovers the converter', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({
    name: 'collection.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a CSV'),
  });
  await expect(page.getByRole('alert')).toContainText('Choose a .csv file');
  await page.locator('#file-input').setInputFiles({
    name: 'broken.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,comment\nGame,"unfinished'),
  });
  await expect(page.getByRole('alert')).toContainText('not closed');
  await page.locator('#file-input').setInputFiles({
    name: 'recovered.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('objectid,name,own\n2,Recovered Game,1\n'),
  });
  await expect(page.getByRole('heading', { name: 'Choose status rules' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Recovered Game/ })).toBeVisible();
});
