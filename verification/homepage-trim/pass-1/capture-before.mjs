import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, 'before');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const measurements = {};

async function capture(name, viewport) {
  const context = await browser.newContext({
    viewport,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('kcg-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    theme: document.documentElement.getAttribute('data-theme'),
    h1: document.querySelector('h1')?.textContent?.trim() || null,
    sections: [...document.querySelectorAll('main section')].map((el) => el.id || el.querySelector('h2')?.textContent?.trim() || el.className.slice(0, 80)),
  }));
  measurements[name] = { viewport, ...metrics, errors };
  await page.screenshot({
    path: resolve(outDir, `${name}.png`),
    fullPage: true,
  });
  await context.close();
}

await capture('home-390-dark', { width: 390, height: 844 });
await capture('home-1440-dark', { width: 1440, height: 900 });

await writeFile(resolve(outDir, 'baseline-metrics.json'), JSON.stringify(measurements, null, 2));
console.log(JSON.stringify(measurements, null, 2));
await browser.close();
