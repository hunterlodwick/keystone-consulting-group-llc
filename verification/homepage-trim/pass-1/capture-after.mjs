import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const BASE = 'http://127.0.0.1:4173';
const __dirname = dirname(fileURLToPath(import.meta.url));
const afterDir = resolve(__dirname, 'after');
await mkdir(afterDir, { recursive: true });

const consoleLog = [];
const linkResults = [];
const measurements = {
  capturedAt: new Date().toISOString(),
  previewBase: BASE,
  baseline: {
    'home-390-dark': { scrollHeight: 18198, scrollWidth: 390, clientWidth: 390 },
    'home-1440-dark': { scrollHeight: 11426, scrollWidth: 1440, clientWidth: 1440 },
  },
  after: {},
};

function attachLogging(page, route) {
  page.on('pageerror', (err) => consoleLog.push({ route, type: 'pageerror', text: err.message }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleLog.push({ route, type: 'console.error', text: msg.text() });
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.startsWith(BASE) || url.includes('127.0.0.1:4173')) {
      consoleLog.push({ route, type: 'requestfailed', text: `${req.failure()?.errorText} ${url}` });
    }
  });
}

async function setTheme(page, theme) {
  await page.addInitScript((t) => {
    localStorage.setItem('kcg-theme', t);
  }, theme);
}

async function collectHomeMetrics(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = h1?.parentElement?.querySelector('p');
    const cta = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Book a Call');
    const numeric = document.querySelector('.homepage-numeric');
    const numericCs = numeric ? getComputedStyle(numeric) : null;
    const header = document.querySelector('header');
    const pricing = document.getElementById('pricing');
    const about = document.getElementById('about');
    const services = document.getElementById('services');
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const cards = [...document.querySelectorAll('#services a')].map((a) => ({
      title: a.querySelector('h3')?.textContent?.trim(),
      href: a.getAttribute('href'),
    }));
    const processNums = [...document.querySelectorAll('section')].flatMap((sec) =>
      [...sec.querySelectorAll('h2')].some((h) => h.textContent?.includes('Three Steps'))
        ? [...sec.querySelectorAll('h3')].map((h) => h.textContent?.trim())
        : []
    );
    const nav = [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.trim()).filter(Boolean);
    const bodyText = document.body.innerText;
    const forbidden = [
      'We Find Hidden Profit',
      'Most Popular',
      'Keep 100% of your revenue',
      'Grow With an ATM',
      'Marcus T.',
      "Rudy's",
      'Sarah Jenkins',
      'David Chen',
      'Elena M.',
      'Apex Botanicals',
      'See Your Hidden Savings',
      'Trusted Across Every Industry',
      'Why Keystone',
      'Seamless Integrations',
      'Profit Leak',
      'See if you qualify',
      'Get a Custom Quote',
      'B2B Level 2/3',
    ].filter((s) => bodyText.includes(s));
    const fonts = [...document.fonts].map((f) => `${f.family} ${f.status}`);
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      theme: document.documentElement.getAttribute('data-theme'),
      h1: h1?.textContent?.trim() || null,
      h1Box: box(h1),
      copyBox: box(p),
      ctaBox: box(cta),
      headerHeight: header ? header.getBoundingClientRect().height : null,
      servicesTop: services ? services.getBoundingClientRect().top + window.scrollY : null,
      pricingScrollMargin: pricing ? getComputedStyle(pricing).scrollMarginTop : null,
      aboutScrollMargin: about ? getComputedStyle(about).scrollMarginTop : null,
      numericFontFamily: numericCs?.fontFamily || null,
      cards,
      processNums,
      desktopNavSample: nav,
      h2s: [...document.querySelectorAll('main h2')].map((el) => el.textContent?.trim()),
      sectionCount: document.querySelectorAll('main section').length,
      forbiddenHits: forbidden,
      loadedFonts: fonts,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

const browser = await chromium.launch({ headless: true });

async function shotHome({ name, viewport, theme, reducedMotion, disableObserver, fullPage, crop }) {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme === 'light' ? 'light' : 'dark',
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  attachLogging(page, name);
  await setTheme(page, theme);
  if (disableObserver) {
    await page.addInitScript(() => {
      class StubIO {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
      }
      window.IntersectionObserver = StubIO;
    });
  }
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const metrics = await collectHomeMetrics(page);
  measurements.after[name] = { viewport, theme, reducedMotion: !!reducedMotion, disableObserver: !!disableObserver, ...metrics };
  if (fullPage) {
    await page.screenshot({ path: resolve(afterDir, `${name}.png`), fullPage: true });
  }
  if (crop) {
    await page.screenshot({ path: resolve(afterDir, crop), fullPage: false });
  }
  await context.close();
  return metrics;
}

// After full-page + crops
await shotHome({ name: 'home-390-dark', viewport: { width: 390, height: 844 }, theme: 'dark', fullPage: true, crop: 'home-390-dark-first-viewport.png' });
await shotHome({ name: 'home-1440-dark', viewport: { width: 1440, height: 900 }, theme: 'dark', fullPage: true, crop: 'home-1440-dark-first-viewport.png' });
await shotHome({ name: 'home-390-light', viewport: { width: 390, height: 844 }, theme: 'light', fullPage: true });
await shotHome({ name: 'home-1440-light', viewport: { width: 1440, height: 900 }, theme: 'light', fullPage: true });
await shotHome({ name: 'home-390-reduced-motion', viewport: { width: 390, height: 844 }, theme: 'dark', reducedMotion: true, fullPage: true });
await shotHome({ name: 'home-observer-disabled', viewport: { width: 1440, height: 900 }, theme: 'dark', disableObserver: true, fullPage: true });

// Mobile nav
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'nav-mobile');
  await setTheme(page, 'dark');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.getByLabel('Open menu').click();
  await page.waitForTimeout(300);
  const mobileLinks = await page.evaluate(() =>
    [...document.querySelectorAll('header a, header button')].map((el) => ({
      text: el.textContent?.replace(/\s+/g, ' ').trim(),
      href: el.getAttribute('href'),
      height: el.getBoundingClientRect().height,
    }))
  );
  measurements.after.mobileNav = mobileLinks;
  await page.screenshot({ path: resolve(afterDir, 'nav-mobile.png'), fullPage: false });
  // close on selection
  await page.getByRole('link', { name: 'Websites', exact: true }).click();
  await page.waitForTimeout(400);
  const menuClosed = await page.getByLabel('Open menu').isVisible().catch(() => true);
  const menuOpenGone = !(await page.getByRole('link', { name: 'AI Automations', exact: true }).isVisible().catch(() => false));
  measurements.after.mobileMenuClosesOnNav = { arrived: page.url(), menuClosed, menuOpenGone };
  await context.close();
}

// Modals + keyboard
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'modals');
  await setTheme(page, 'dark');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route('https://api.web3forms.com/submit', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'intercepted' }) })
  );
  const heroCta = page.locator('section').first().getByRole('button', { name: 'Book a Call' });
  await heroCta.click();
  await page.waitForTimeout(300);
  const contactTitle = await page.locator('#modal-title').textContent();
  await page.screenshot({ path: resolve(afterDir, 'contact-modal.png') });
  // client validation: submit empty
  await page.getByRole('button', { name: 'Submit Request' }).click();
  const contactInvalid = await page.evaluate(() => {
    const el = document.querySelector('#firstName');
    return el ? el.validity.valueMissing : null;
  });
  await page.locator('#modal-close-btn').click();
  await page.waitForTimeout(200);
  const contactClosed = await page.locator('#modal-title').count();

  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Get a Free Statement Analysis' }).click();
  await page.waitForTimeout(300);
  const statementTitle = await page.locator('#modal-title').textContent();
  await page.screenshot({ path: resolve(afterDir, 'statement-modal.png') });
  await page.getByRole('button', { name: /Request Free Profit Leak Analysis/ }).click();
  const statementInvalid = await page.evaluate(() => {
    const el = document.querySelector('#businessName');
    return el ? el.validity.valueMissing : null;
  });
  await page.locator('#modal-close-btn').click();

  // keyboard: tab to processing link, activate, then book a call
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  measurements.after.modals = { contactTitle, statementTitle, contactInvalid, statementInvalid, contactClosed, keyboardFocusSample: focused };
  await context.close();
}

// Anchor clearance
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'anchors');
  await setTheme(page, 'dark');
  await page.goto(`${BASE}/#pricing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const pricingClearance = await page.evaluate(() => {
    const header = document.querySelector('header');
    const pricing = document.getElementById('pricing');
    const about = document.getElementById('about');
    const h = header?.getBoundingClientRect().bottom ?? 0;
    return {
      headerBottom: h,
      pricingTop: pricing?.getBoundingClientRect().top ?? null,
      pricingHeadingVisible: (pricing?.querySelector('h2')?.getBoundingClientRect().top ?? 0) >= h - 1,
    };
  });
  await page.goto(`${BASE}/#about`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const aboutClearance = await page.evaluate(() => {
    const header = document.querySelector('header');
    const about = document.getElementById('about');
    const h = header?.getBoundingClientRect().bottom ?? 0;
    return {
      headerBottom: h,
      aboutTop: about?.getBoundingClientRect().top ?? null,
      aboutHeadingVisible: (about?.querySelector('h2')?.getBoundingClientRect().top ?? 0) >= h - 1,
    };
  });
  measurements.after.anchorClearance = { pricingClearance, aboutClearance };
  await context.close();
}

async function visit(path, viewport = { width: 1440, height: 900 }, shotName) {
  const context = await browser.newContext({ viewport, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, path);
  await setTheme(page, 'dark');
  const direct = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const h1 = await page.locator('h1').first().textContent().catch(() => null);
  const navLabels = await page.evaluate(() =>
    [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
  );
  if (shotName) {
    await page.screenshot({ path: resolve(afterDir, shotName), fullPage: false });
  }
  const result = {
    path,
    status: direct?.status(),
    url: page.url(),
    h1: h1?.trim(),
    navLabels,
  };
  linkResults.push(result);
  await context.close();
  return result;
}

const industryRoutes = [
  '/restaurants', '/grocery', '/healthcare', '/ecommerce',
  '/salons', '/auto-repair', '/gas-stations', '/high-risk',
  '/nonprofits', '/b2b', '/real-estate', '/retail',
];

await visit('/', { width: 1440, height: 900 });
await visit('/#pricing');
await visit('/#about');
await visit('/services');
const webDesign = await visit('/services/web-design', { width: 1440, height: 900 }, 'services-web-design.png');
await visit('/services/automations');
await visit('/services/consumer-financing');
const restaurants = await visit('/restaurants', { width: 1440, height: 900 }, 'restaurants.png');
for (const r of industryRoutes.filter((x) => x !== '/restaurants')) {
  await visit(r);
}

// Click-through + back/forward from homepage
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'click-nav');
  await setTheme(page, 'dark');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Websites', exact: true }).click();
  await page.waitForTimeout(400);
  const afterClick = { url: page.url(), h1: (await page.locator('h1').first().textContent())?.trim() };
  await page.goBack();
  await page.waitForTimeout(400);
  const afterBack = { url: page.url(), h1: (await page.locator('h1').first().textContent())?.trim() };
  await page.goForward();
  await page.waitForTimeout(400);
  const afterForward = { url: page.url(), h1: (await page.locator('h1').first().textContent())?.trim() };
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Processing', exact: true }).click();
  await page.waitForTimeout(700);
  const pricingClick = await page.evaluate(() => ({
    url: location.href,
    pricingInView: (document.getElementById('pricing')?.getBoundingClientRect().top ?? 999) < window.innerHeight,
  }));
  await page.getByRole('link', { name: 'AI Automations', exact: true }).click();
  await page.waitForTimeout(400);
  const autoClick = { url: page.url(), h1: (await page.locator('h1').first().textContent())?.trim() };
  measurements.after.clickNav = { afterClick, afterBack, afterForward, pricingClick, autoClick };
  await context.close();
}

// Non-home header screenshot
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'nonhome-header');
  await setTheme(page, 'dark');
  await page.goto(`${BASE}/services/web-design`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(afterDir, 'nonhome-header-web-design.png'), fullPage: false });
  await context.close();
}

// Percent reduction
for (const key of ['home-390-dark', 'home-1440-dark']) {
  const before = measurements.baseline[key].scrollHeight;
  const after = measurements.after[key].scrollHeight;
  measurements.after[key].percentReduction = Number((((before - after) / before) * 100).toFixed(2));
}

await writeFile(resolve(__dirname, 'measurements.json'), JSON.stringify(measurements, null, 2));
await writeFile(resolve(__dirname, 'console.log'), consoleLog.length ? consoleLog.map((e) => JSON.stringify(e)).join('\n') + '\n' : 'No browser errors or failed local asset requests recorded.\n');
await writeFile(resolve(__dirname, 'link-results.json'), JSON.stringify({ linkResults, webDesign, restaurants }, null, 2));
console.log(JSON.stringify({
  sectionCount390: measurements.after['home-390-dark'].sectionCount,
  h2s: measurements.after['home-390-dark'].h2s,
  cards: measurements.after['home-390-dark'].cards,
  h1Visible: measurements.after['home-390-dark'].h1Box,
  copyBottom: measurements.after['home-390-dark'].copyBox,
  ctaBottom: measurements.after['home-390-dark'].ctaBox,
  reduction390: measurements.after['home-390-dark'].percentReduction,
  reduction1440: measurements.after['home-1440-dark'].percentReduction,
  overflow390: measurements.after['home-390-dark'].overflowX,
  overflow1440: measurements.after['home-1440-dark'].overflowX,
  numericFont: measurements.after['home-1440-dark'].numericFontFamily,
  forbidden: measurements.after['home-1440-dark'].forbiddenHits,
  contactTitle: measurements.after.modals?.contactTitle,
  statementTitle: measurements.after.modals?.statementTitle,
  industryOk: linkResults.filter((r) => industryRoutes.includes(r.path)).map((r) => [r.path, r.status, r.h1]),
  consoleErrors: consoleLog.length,
}, null, 2));

await browser.close();
