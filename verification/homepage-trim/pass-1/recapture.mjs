import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');
const BASE = 'http://127.0.0.1:4173';
const __dirname = dirname(fileURLToPath(import.meta.url));
const afterDir = resolve(__dirname, 'after');

const browser = await chromium.launch({ headless: true });

async function home(viewport, theme, names) {
  const context = await browser.newContext({ viewport, colorScheme: theme === 'light' ? 'light' : 'dark' });
  const page = await context.newPage();
  await page.addInitScript((t) => localStorage.setItem('kcg-theme', t), theme);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = h1?.parentElement?.querySelector('p');
    const cta = [...document.querySelectorAll('main section:first-of-type button')].find((b) => b.textContent?.trim() === 'Book a Call');
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height, inFirstViewport: r.bottom <= window.innerHeight && r.top >= 0 };
    };
    return {
      h1: h1?.textContent?.trim(),
      h1Overflow: h1 ? h1.scrollWidth > h1.clientWidth + 1 : null,
      h1Box: box(h1),
      copyBox: box(p),
      ctaBox: box(cta),
      innerHeight: window.innerHeight,
    };
  });
  await page.screenshot({ path: resolve(afterDir, names.full), fullPage: true });
  if (names.crop) await page.screenshot({ path: resolve(afterDir, names.crop), fullPage: false });
  await context.close();
  return metrics;
}

const m390 = await home({ width: 390, height: 844 }, 'dark', { full: 'home-390-dark.png', crop: 'home-390-dark-first-viewport.png' });
const m1440 = await home({ width: 1440, height: 900 }, 'dark', { full: 'home-1440-dark.png', crop: 'home-1440-dark-first-viewport.png' });
const m390l = await home({ width: 390, height: 844 }, 'light', { full: 'home-390-light.png' });
const m1440l = await home({ width: 1440, height: 900 }, 'light', { full: 'home-1440-light.png' });

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const page = await context.newPage();
await page.addInitScript(() => localStorage.setItem('kcg-theme', 'dark'));
await page.goto(`${BASE}/#pricing`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const pricing = await page.evaluate(() => {
  const header = document.querySelector('header');
  const pricing = document.getElementById('pricing');
  const h2 = pricing?.querySelector('h2');
  const hb = header?.getBoundingClientRect().bottom ?? 0;
  const top = h2?.getBoundingClientRect().top ?? null;
  return { hash: location.hash, headerBottom: hb, headingTop: top, inView: top != null && top >= hb - 1 && top < window.innerHeight, scrollY: window.scrollY };
});
await page.goto(`${BASE}/#about`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const about = await page.evaluate(() => {
  const header = document.querySelector('header');
  const about = document.getElementById('about');
  const h2 = about?.querySelector('h2');
  const hb = header?.getBoundingClientRect().bottom ?? 0;
  const top = h2?.getBoundingClientRect().top ?? null;
  return { hash: location.hash, headerBottom: hb, headingTop: top, inView: top != null && top >= hb - 1 && top < window.innerHeight, scrollY: window.scrollY };
});
await context.close();

const measurementsPath = resolve(__dirname, 'measurements.json');
const measurements = JSON.parse(await readFile(measurementsPath, 'utf8'));
measurements.after['home-390-dark'].h1Box = m390.h1Box;
measurements.after['home-390-dark'].copyBox = m390.copyBox;
measurements.after['home-390-dark'].ctaBox = m390.ctaBox;
measurements.after['home-390-dark'].h1Overflow = m390.h1Overflow;
measurements.after['home-1440-dark'].h1Box = m1440.h1Box;
measurements.after['home-1440-dark'].copyBox = m1440.copyBox;
measurements.after['home-1440-dark'].ctaBox = m1440.ctaBox;
measurements.after['home-390-light'].ctaBox = m390l.ctaBox;
measurements.after['home-1440-light'].ctaBox = m1440l.ctaBox;
measurements.after.anchorClearance = { pricingClearance: pricing, aboutClearance: about };
measurements.after.hashRecheckAt = new Date().toISOString();
await writeFile(measurementsPath, JSON.stringify(measurements, null, 2));
console.log(JSON.stringify({ m390, m1440Cta: m1440.ctaBox, pricing, about }, null, 2));
await browser.close();
