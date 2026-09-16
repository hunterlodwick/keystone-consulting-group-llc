import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, 'before');
await mkdir(outDir, { recursive: true });

const BASE = 'http://127.0.0.1:4174';
const browser = await chromium.launch({ headless: true });

async function shot({ name, path, viewport, theme, extra }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  if (theme === 'fresh') {
    await page.addInitScript(() => localStorage.removeItem('kcg-theme'));
  } else if (theme) {
    await page.addInitScript((t) => localStorage.setItem('kcg-theme', t), theme);
  }
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  if (extra) await extra(page);
  await page.screenshot({ path: resolve(outDir, `${name}.png`), fullPage: true });
  await context.close();
  console.log('wrote', name);
}

await shot({ name: 'home-1440-dark', path: '/', viewport: { width: 1440, height: 900 }, theme: 'dark' });
await shot({ name: 'home-390-dark', path: '/', viewport: { width: 390, height: 844 }, theme: 'dark' });
await shot({ name: 'home-1440-light', path: '/', viewport: { width: 1440, height: 900 }, theme: 'light' });
await shot({ name: 'home-390-light', path: '/', viewport: { width: 390, height: 844 }, theme: 'light' });
await shot({ name: 'restaurants-1440', path: '/restaurants', viewport: { width: 1440, height: 900 }, theme: 'dark' });
await shot({ name: 'work-1440', path: '/work', viewport: { width: 1440, height: 900 }, theme: 'dark' });

await browser.close();
console.log('before captures done');
