import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, 'after', 'light-sections');
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => localStorage.setItem('kcg-theme', 'light'));
const page = await context.newPage();
await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const shots = [
  ['hero', 'h1'],
  ['pricing', '#pricing'],
  ['services', '#services'],
  ['about', '#about'],
  ['pos-float', '.hero-pos-float'],
  ['financing', 'text=Consumer Financing'],
  ['placement', 'text=Free Bluetooth Card Readers'],
];

for (const [name, sel] of shots) {
  const loc = page.locator(sel).first();
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await loc.screenshot({ path: resolve(out, `${name}.png`) });
  console.log('shot', name);
}

const h2s = ['Find the Money. Fix the Leak. Grow.', 'How Much Are You Losing?', 'Built for Your Industry', 'Why Keystone'];
for (const t of h2s) {
  const loc = page.locator('section').filter({ has: page.getByRole('heading', { name: t }) }).first();
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const slug = t.slice(0, 24).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  await loc.screenshot({ path: resolve(out, `${slug}.png`) });
  console.log('shot section', t);
}

await browser.close();
