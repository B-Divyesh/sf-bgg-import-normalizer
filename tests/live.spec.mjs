import { test, expect } from '@playwright/test';

const deployed = /(^|\.)sociobot\.in(?::\d+)?$/i.test(new URL(process.env.SHELF_BRIDGE_URL || 'http://127.0.0.1:4173').host);

test.skip(!deployed, 'This check is for the deployed Shelf Bridge URL.');

test('deployed unknown routes return the styled Shelf Bridge page with HTTP 404', async ({ page, request }) => {
  const response = await request.get('/repair-check-page-that-does-not-exist');
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('text/html');
  await page.goto('/repair-check-page-that-does-not-exist');
  await expect(page).toHaveTitle('Page not found — Shelf Bridge');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to converter' })).toBeVisible();
});
