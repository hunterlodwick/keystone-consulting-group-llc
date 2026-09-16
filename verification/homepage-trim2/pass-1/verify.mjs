import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const __dirname = dirname(fileURLToPath(import.meta.url));
const afterDir = resolve(__dirname, 'after');
await mkdir(afterDir, { recursive: true });

const BASE = 'http://127.0.0.1:4174';
const browser = await chromium.launch({ headless: true });
const results = {};

function record(id, pass, detail) {
  results[id] = { pass, detail };
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
}

async function shot(page, name) {
  await page.screenshot({ path: resolve(afterDir, `${name}.png`), fullPage: true });
}

// Homepage assertions + screenshots
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => localStorage.removeItem('kcg-theme'));
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
  });

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const themeFresh = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  record('fresh-theme-light', themeFresh === 'light', `data-theme=${themeFresh}`);

  const home = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const h2s = [...document.querySelectorAll('main h2, body h2')]
      .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const productTitles = [...document.querySelectorAll('#services h3')].map((el) => el.textContent.trim());
    const imgs = [...document.querySelectorAll('img')].map((el) => el.getAttribute('src') || '');
    const workLink = [...document.querySelectorAll('header a')].some((a) => (a.getAttribute('href') || '') === '/work' && /work/i.test(a.textContent || ''));
    const innerText = (document.querySelector('main') || document.body).innerText;
    const placementTitles = [...document.querySelectorAll('h3')].map((el) => el.textContent.trim());
    return {
      h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim(),
      h2s,
      productTitles,
      hasPosFloat: !!document.querySelector('.hero-pos-float'),
      hasSeth: imgs.some((s) => s.includes('/team/seth.jpg')),
      hasHunter: imgs.some((s) => s.includes('/team/hunter.jpg')),
      workLink,
      innerText,
      hasATM: /\bATM\b/i.test(innerText),
      hasRateGuarantee: /The Fastest Money You'll Ever Save/.test(innerText),
      hasTestimonialsH2: /They Stopped Overpaying/.test(innerText),
      hasFinancing: /Consumer Financing/.test(innerText) && /Flex Buy/.test(innerText) && /\$100K/.test(innerText),
      hasBluetooth: placementTitles.includes('Free Bluetooth Card Readers'),
      hasPOSCredits: placementTitles.includes('Free POS Systems & Hardware Credits'),
      hasATMCard: placementTitles.includes('Grow With an ATM Machine'),
      sectionH2s: h2s,
    };
  });

  const expectedH2s = [
    'Find the Money. Fix the Leak. Grow.',
    'Stop Paying to Get Paid.',
    'How Much Are You Losing?',
    'Where the Savings Go.',
    'Built for Your Industry',
    'Why Keystone',
    'You Talk to the Owners. Every Time.',
  ];
  const filteredH2s = home.h2s.filter((t) => expectedH2s.includes(t) || /Stopped Overpaying|Fastest Money/.test(t));
  const orderOk = expectedH2s.every((t, i) => filteredH2s[i] === t) && filteredH2s.length === expectedH2s.length;

  record('section-order', orderOk, { filteredH2s, allH2s: home.h2s });
  record('no-atm', !home.hasATM && !home.hasATMCard, { hasATM: home.hasATM, hasATMCard: home.hasATMCard });
  record('team-photos', home.hasSeth && home.hasHunter, { seth: home.hasSeth, hunter: home.hasHunter });
  record('hero-pos-float', home.hasPosFloat, home.hasPosFloat);
  record('productgrid-3', home.productTitles.length === 3 && home.productTitles[0] === 'Credit Card Processing' && home.productTitles[1] === 'Website Builds' && home.productTitles[2] === 'AI Automations', home.productTitles);
  record('header-work-link', home.workLink, home.workLink);
  record('cut-rate-guarantee', !home.hasRateGuarantee, home.hasRateGuarantee);
  record('cut-testimonials', !home.hasTestimonialsH2, home.hasTestimonialsH2);
  record('pricing-financing', home.hasFinancing, home.hasFinancing);
  record('freeplacement-2', home.hasBluetooth && home.hasPOSCredits && !home.hasATMCard, {
    bluetooth: home.hasBluetooth,
    pos: home.hasPOSCredits,
    atm: home.hasATMCard,
  });

  const slider = page.locator('input[type="range"]').first();
  const beforeVal = await slider.inputValue();
  await slider.evaluate((el) => {
    el.value = '80000';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const afterVal = await slider.inputValue();
  record('hero-slider', afterVal === '80000' && beforeVal !== afterVal, { beforeVal, afterVal });

  await shot(page, 'home-1440-light');
  await writeFile(resolve(__dirname, 'homepage-innerText.txt'), home.innerText);

  await page.locator('.theme-toggle').locator('visible=true').first().click();
  await page.waitForTimeout(200);
  const themeAfterToggle = await page.evaluate(() => ({
    attr: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('kcg-theme'),
  }));
  record('toggle-persists-dark', themeAfterToggle.attr === 'dark' && themeAfterToggle.stored === 'dark', themeAfterToggle);
  await shot(page, 'home-1440-dark');

  record('home-console', consoleErrors.length === 0, consoleErrors);

  const persistCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await persistCtx.addInitScript(() => localStorage.setItem('kcg-theme', 'dark'));
  const persistPage = await persistCtx.newPage();
  await persistPage.goto(BASE + '/', { waitUntil: 'networkidle' });
  const persisted = await persistPage.evaluate(() => document.documentElement.getAttribute('data-theme'));
  record('saved-dark-respected', persisted === 'dark', persisted);
  await persistCtx.close();
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('kcg-theme', 'light'));
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await shot(page, 'home-390-light');
  await page.locator('.theme-toggle').locator('visible=true').first().click();
  await page.waitForTimeout(200);
  await shot(page, 'home-390-dark');
  await context.close();
}

for (const route of ['/restaurants', '/high-risk']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
  });
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    const quoteBlock = [...document.querySelectorAll('section p')].some((p) => {
      const t = p.textContent.trim();
      return t.startsWith('"') && t.endsWith('"') && t.length > 40;
    });
    const namedBiz = /Bella's Italian Kitchen|Green Leaf CBD|Maria R\.|Alex P\./.test(text);
    return { quoteBlock, namedBiz, hasTestimonialHeading: /TESTIMONIAL/i.test(text) };
  });
  record(`no-testimonial-${route.slice(1)}`, !info.quoteBlock && !info.namedBiz, info);
  record(`console-${route.slice(1)}`, consoleErrors.length === 0, consoleErrors);
  if (route === '/restaurants') await shot(page, 'restaurants-1440');
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + '/work', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const work = await page.evaluate(() => {
    const names = [...document.querySelectorAll('article h3')].map((el) => el.textContent.trim());
    const workLink = [...document.querySelectorAll('header a')].some((a) => (a.getAttribute('href') || '') === '/work');
    return { names, count: names.length, workLink };
  });
  record('work-8-projects', work.count === 8, work);
  record('work-header-link', work.workLink, work.workLink);
  await shot(page, 'work-1440');
  await context.close();
}

await writeFile(resolve(__dirname, 'assertions.json'), JSON.stringify(results, null, 2));
await browser.close();
console.log('\nassertions written');
