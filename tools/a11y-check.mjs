import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const baseUrl = process.env.SHELF_BRIDGE_URL || 'http://127.0.0.1:4173';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1208/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const results = [];
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error)));

async function audit(name) {
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  results.push({ name, violations: report.violations });
}

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
if ((await page.locator(':focus').textContent())?.trim() !== 'Skip to converter') {
  throw new Error('The first Tab did not reach the skip link.');
}
await page.keyboard.press('Enter');
await page.locator('main:focus').waitFor();
const skipResult = await page.evaluate(() => ({
  active: `${document.activeElement?.tagName}#${document.activeElement?.id}`,
  hash: location.hash,
}));
if (skipResult.active !== 'MAIN#main' || skipResult.hash !== '#main') {
  throw new Error(`Skip link did not focus main: ${JSON.stringify(skipResult)}`);
}
await audit('empty converter');
await page.getByRole('button', { name: /3-game sample/i }).click();
await page.getByRole('heading', { name: 'Review the crossing' }).waitFor();
await mkdir('.factory/evidence', { recursive: true });
await page.screenshot({ path: '.factory/evidence/populated-mobile.png', fullPage: true });
await page.setViewportSize({ width: 1366, height: 900 });
await page.screenshot({ path: '.factory/evidence/populated-desktop.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await audit('populated converter');
await page.locator('#map-own').selectOption('ignore');
if (!(await page.getByRole('button', { name: /Normalized JSON/ }).isDisabled())) throw new Error('Status drops did not block export.');
if ((await page.locator(':focus').getAttribute('id')) !== 'map-own') throw new Error('Mapping change did not preserve keyboard focus.');
await page.locator('#map-own').selectOption('owned');
const download = page.waitForEvent('download');
await page.getByRole('button', { name: /Normalized JSON/ }).click();
const downloaded = await download;
if (!downloaded.suggestedFilename().endsWith('.json')) throw new Error('JSON export did not download.');

for (const path of ['/privacy', '/terms']) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await audit(path.slice(1));
}

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => navigator.serviceWorker.ready);
await context.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.getByRole('heading', { name: /Carry your shelf/ }).waitFor();
if (!(await page.locator('#offline-note').isVisible())) throw new Error('Offline state was not announced.');
await audit('offline converter');
await context.setOffline(false);

await browser.close();
await writeFile('.factory/evidence/axe-results.json', JSON.stringify(results, null, 2));
const violations = results.flatMap((result) => result.violations.map((violation) => `${result.name}: ${violation.id} (${violation.impact})`));
if (pageErrors.length) throw new Error(`Browser page errors: ${pageErrors.join('; ')}`);
if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log(`Axe: 0 violations across ${results.length} states; status guard, JSON download, focus, and offline reload verified.`);
