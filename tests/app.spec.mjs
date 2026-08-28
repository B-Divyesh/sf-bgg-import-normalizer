import { test, expect } from '@playwright/test';

test('routes set titles, canonical metadata, and an intentional not-found page', async ({ page }) => {
  const routes = [
    ['/', 'Shelf Bridge — Convert a BGG collection CSV', 'Convert a BGG collection CSV', '/'],
    ['/demo', 'Demo — Shelf Bridge', 'Convert a BGG collection CSV', '/demo'],
    ['/privacy', 'Privacy — Shelf Bridge', 'Privacy for Shelf Bridge', '/privacy'],
    ['/terms', 'Terms — Shelf Bridge', 'Terms for Shelf Bridge', '/terms'],
    ['/missing-route', 'Page not found — Shelf Bridge', 'Page not found', '/missing-route'],
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
