import { createRequire } from 'node:module';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');

const CURRENT = 'http://localhost:4173';
const BASELINE = 'http://127.0.0.1:4174';
const __dirname = dirname(fileURLToPath(import.meta.url));
const afterDir = resolve(__dirname, 'after');
const slopDir = resolve(__dirname, 'slop-route-texts');

await mkdir(afterDir, { recursive: true });
await mkdir(slopDir, { recursive: true });

const consoleLog = [];
const measurements = {
  capturedAt: new Date().toISOString(),
  previewBase: CURRENT,
  baselinePreview: BASELINE,
  baselineCommit: '9667046',
  baseline: {
    'home-390-dark': { scrollHeight: 18198, scrollWidth: 390, clientWidth: 390 },
    'home-1440-dark': { scrollHeight: 11426, scrollWidth: 1440, clientWidth: 1440 },
  },
  after: {},
  keyboard: {},
  hoverShadows: {},
  headerCompare: {},
  fontLoad: {},
};
const linkMatrix = [];

function attachLogging(page, route) {
  page.on('pageerror', (err) => consoleLog.push({ route, type: 'pageerror', text: err.message }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleLog.push({ route, type: 'console.error', text: msg.text() });
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.startsWith(CURRENT) || url.startsWith(BASELINE) || url.includes('localhost:4173') || url.includes('127.0.0.1:4174')) {
      consoleLog.push({ route, type: 'requestfailed', text: `${req.failure()?.errorText} ${url}` });
    }
  });
}

async function setTheme(page, theme) {
  await page.addInitScript((t) => {
    localStorage.setItem('kcg-theme', t);
  }, theme);
}

async function waitFonts(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return {
      status: document.fonts.status,
      ready: document.fonts.status === 'loaded',
      count: [...document.fonts].length,
      families: [...new Set([...document.fonts].map((f) => f.family))],
    };
  });
}

function box(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    bottom: r.bottom,
    left: r.left,
    right: r.right,
    width: r.width,
    height: r.height,
    inFirstViewport: r.bottom <= window.innerHeight && r.top >= 0,
  };
}

async function collectHomeMetrics(page) {
  return page.evaluate((boxSrc) => {
    const box = new Function('el', `const windowInner = window.innerHeight; ${boxSrc}; return box(el);`);
    const h1 = document.querySelector('h1');
    const p = h1?.parentElement?.querySelector('p');
    const cta = [...document.querySelectorAll('main section')[0]?.querySelectorAll('button') || []].find((b) => b.textContent?.trim() === 'Book a Call');
    const numeric = document.querySelector('.homepage-numeric');
    const numericCs = numeric ? getComputedStyle(numeric) : null;
    const header = document.querySelector('header');
    const pricing = document.getElementById('pricing');
    const about = document.getElementById('about');
    const services = document.getElementById('services');
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: r.top, bottom: r.bottom, left: r.left, right: r.right,
        width: r.width, height: r.height,
        inFirstViewport: r.bottom <= window.innerHeight && r.top >= 0,
      };
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
    const nav = [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const bodyText = document.body.innerText;
    const forbidden = [
      'We Find Hidden Profit', 'Most Popular', 'Keep 100% of your revenue', 'Grow With an ATM',
      'Marcus T.', "Rudy's", 'Sarah Jenkins', 'David Chen', 'Elena M.', 'Apex Botanicals',
      'See Your Hidden Savings', 'Trusted Across Every Industry', 'Why Keystone', 'Seamless Integrations',
      'See if you qualify', 'Get a Custom Quote', 'B2B Level 2/3',
    ].filter((s) => bodyText.includes(s));
    const fonts = [...document.fonts].map((f) => `${f.family} ${f.status}`);
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      theme: document.documentElement.getAttribute('data-theme'),
      fontsStatus: document.fonts.status,
      h1: h1?.textContent?.trim() || null,
      h1Box: rect(h1),
      copyBox: rect(p),
      ctaBox: rect(cta),
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
  }, '');
}

async function describeFocus(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return { none: true };
    return {
      tag: el.tagName,
      id: el.id || null,
      role: el.getAttribute('role'),
      ariaLabel: el.getAttribute('aria-label'),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      isBody: el === document.body,
      inDialog: !!el.closest('[role="dialog"]'),
    };
  });
}

async function keyboardCycle(page, focusTarget) {
  await focusTarget.focus();
  const before = await describeFocus(page);
  await page.keyboard.press('Enter');
  await page.waitForSelector('#modal-close-btn');
  await page.waitForTimeout(80);
  const afterOpen = await describeFocus(page);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(40);
  const afterTab = await describeFocus(page);
  await page.locator('#modal-close-btn').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  const afterClose = await describeFocus(page);
  const dialogGone = (await page.locator('[role="dialog"]').count()) === 0;
  return { before, afterOpen, afterTab, afterClose, dialogGone };
}

const browser = await chromium.launch({ headless: true });

async function shotHome({ name, viewport, theme, reducedMotion, disableObserver }) {
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
  await page.goto(`${CURRENT}/`, { waitUntil: 'networkidle' });
  const fontLoad = await waitFonts(page);
  await page.waitForTimeout(200);
  const metrics = await collectHomeMetrics(page);
  measurements.after[name] = { viewport, theme, reducedMotion: !!reducedMotion, disableObserver: !!disableObserver, fontLoad, ...metrics };
  measurements.fontLoad[name] = fontLoad;
  await page.screenshot({ path: resolve(afterDir, `${name}.png`), fullPage: true });
  await page.screenshot({ path: resolve(afterDir, `${name}-first-viewport.png`), fullPage: false });
  await context.close();
  return metrics;
}

await shotHome({ name: 'home-390-dark', viewport: { width: 390, height: 844 }, theme: 'dark' });
await shotHome({ name: 'home-1440-dark', viewport: { width: 1440, height: 900 }, theme: 'dark' });
await shotHome({ name: 'home-390-light', viewport: { width: 390, height: 844 }, theme: 'light' });
await shotHome({ name: 'home-1440-light', viewport: { width: 1440, height: 900 }, theme: 'light' });
await shotHome({ name: 'home-390-reduced-motion', viewport: { width: 390, height: 844 }, theme: 'dark', reducedMotion: true });
await shotHome({ name: 'home-observer-disabled', viewport: { width: 1440, height: 900 }, theme: 'dark', disableObserver: true });

for (const key of ['home-390-dark', 'home-1440-dark']) {
  const before = measurements.baseline[key].scrollHeight;
  const after = measurements.after[key].scrollHeight;
  measurements.after[key].percentReduction = Number((((before - after) / before) * 100).toFixed(2));
}

// Hover glow: new homepage CTAs must not gain 20px teal shadow; header glow may remain.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'hover-glow');
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}/`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  const readShadow = async (locator) => {
    await locator.hover();
    return locator.evaluate((el) => getComputedStyle(el).boxShadow);
  };
  const hero = page.locator('main section').first().getByRole('button', { name: 'Book a Call' });
  const headerCta = page.locator('header .hidden.xl\\:flex').getByRole('button', { name: 'Book a Call' });
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  const pricingCta = page.locator('#pricing').getByRole('button', { name: 'Book a Call' });
  await page.locator('#about').scrollIntoViewIfNeeded();
  const teamCta = page.locator('#about').getByRole('button', { name: 'Book a Call' });
  measurements.hoverShadows = {
    hero: await readShadow(hero),
    pricing: await readShadow(pricingCta),
    team: await readShadow(teamCta),
    headerDesktop: await readShadow(headerCta),
  };
  await context.close();
}

// Keyboard: ContactForm desktop (hero), StatementAnalysisForm, header CTA, mobile menu Book a Call
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'keyboard-desktop');
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}/`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  await page.route('https://api.web3forms.com/submit', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'intercepted' }) })
  );
  const heroCta = page.locator('main section').first().getByRole('button', { name: 'Book a Call' });
  measurements.keyboard.desktopHeroContact = await keyboardCycle(page, heroCta);

  const headerCta = page.locator('header .hidden.xl\\:flex').getByRole('button', { name: 'Book a Call' });
  measurements.keyboard.desktopHeaderContact = await keyboardCycle(page, headerCta);

  await page.locator('#pricing').scrollIntoViewIfNeeded();
  const statementCta = page.getByRole('button', { name: 'Get a Free Statement Analysis' });
  measurements.keyboard.desktopStatement = await keyboardCycle(page, statementCta);

  await page.screenshot({ path: resolve(afterDir, 'contact-modal.png') });
  await headerCta.click();
  await page.waitForSelector('#modal-title');
  await page.screenshot({ path: resolve(afterDir, 'contact-modal.png') });
  await page.locator('#modal-close-btn').click();
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await statementCta.click();
  await page.waitForSelector('#modal-title');
  await page.screenshot({ path: resolve(afterDir, 'statement-modal.png') });
  await page.locator('#modal-close-btn').click();
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, 'keyboard-mobile');
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}/`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  await page.getByLabel('Open menu').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  const menuOpenFocus = await describeFocus(page);
  const menuCta = page.locator('header').getByRole('button', { name: 'Book a Call' });
  measurements.keyboard.mobileMenuContact = await keyboardCycle(page, menuCta);
  measurements.keyboard.mobileMenuContact.menuOpenFocus = menuOpenFocus;

  // Mobile statement path: pricing button still in the page under the closed menu
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  const statementCta = page.getByRole('button', { name: 'Get a Free Statement Analysis' });
  measurements.keyboard.mobileStatement = await keyboardCycle(page, statementCta);

  // Hash-link menu closure
  await page.getByLabel('Open menu').click();
  await page.waitForTimeout(80);
  await page.screenshot({ path: resolve(afterDir, 'nav-mobile.png') });
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await page.waitForTimeout(500);
  const afterAbout = {
    url: page.url(),
    menuClosed: await page.getByLabel('Open menu').isVisible(),
    aboutVisible: await page.evaluate(() => {
      const about = document.getElementById('about');
      const r = about?.getBoundingClientRect();
      return r ? r.top < window.innerHeight && r.bottom > 0 : false;
    }),
  };
  await page.getByLabel('Open menu').click();
  await page.getByRole('link', { name: 'Processing', exact: true }).click();
  await page.waitForTimeout(500);
  const afterProcessing = {
    url: page.url(),
    menuClosed: await page.getByLabel('Open menu').isVisible(),
    pricingVisible: await page.evaluate(() => {
      const el = document.getElementById('pricing');
      const r = el?.getBoundingClientRect();
      return r ? r.top < window.innerHeight && r.bottom > 0 : false;
    }),
  };
  measurements.keyboard.mobileHashMenuClose = { afterAbout, afterProcessing };
  await context.close();
}

async function measureAnchors(viewport) {
  const context = await browser.newContext({ viewport, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, `anchors-${viewport.width}`);
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}/#pricing`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  await page.waitForTimeout(700);
  const pricing = await page.evaluate(() => {
    const header = document.querySelector('header');
    const pricing = document.getElementById('pricing');
    const h = header?.getBoundingClientRect().bottom ?? 0;
    const heading = pricing?.querySelector('h2');
    return {
      headerBottom: h,
      headingTop: heading?.getBoundingClientRect().top ?? null,
      headingClearsHeader: (heading?.getBoundingClientRect().top ?? 0) >= h - 1,
      scrollY: window.scrollY,
    };
  });
  await page.goto(`${CURRENT}/#about`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  await page.waitForTimeout(700);
  const about = await page.evaluate(() => {
    const header = document.querySelector('header');
    const about = document.getElementById('about');
    const h = header?.getBoundingClientRect().bottom ?? 0;
    const heading = about?.querySelector('h2');
    return {
      headerBottom: h,
      headingTop: heading?.getBoundingClientRect().top ?? null,
      headingClearsHeader: (heading?.getBoundingClientRect().top ?? 0) >= h - 1,
      scrollY: window.scrollY,
    };
  });
  await context.close();
  return { viewport, pricing, about };
}

measurements.anchorClearance = {
  w390: await measureAnchors({ width: 390, height: 844 }),
  w1440: await measureAnchors({ width: 1440, height: 900 }),
};

const criterion14 = ['/', '/#pricing', '/#about', '/services', '/services/web-design', '/services/automations', '/services/consumer-financing', '/restaurants'];
const industryRoutes = [
  '/restaurants', '/grocery', '/healthcare', '/ecommerce',
  '/salons', '/auto-repair', '/gas-stations', '/high-risk',
  '/nonprofits', '/b2b', '/real-estate', '/retail',
];

async function snapFocusNav(page) {
  return {
    url: page.url(),
    h1: (await page.locator('h1').first().textContent().catch(() => ''))?.trim() || null,
    nav: await page.evaluate(() =>
      [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
    ),
  };
}

async function clickNavCycle(startPath, clickFn, label) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, `click-${label}`);
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}${startPath}`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  const direct = await snapFocusNav(page);
  await clickFn(page);
  await page.waitForTimeout(600);
  const clicked = await snapFocusNav(page);
  const hashState = await page.evaluate(() => {
    const pricing = document.getElementById('pricing');
    const about = document.getElementById('about');
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    return {
      hash: location.hash,
      pricingHeadingTop: pricing?.querySelector('h2')?.getBoundingClientRect().top ?? null,
      aboutHeadingTop: about?.querySelector('h2')?.getBoundingClientRect().top ?? null,
      headerBottom,
    };
  });
  await page.goBack();
  await page.waitForTimeout(400);
  const back = await snapFocusNav(page);
  await page.goForward();
  await page.waitForTimeout(400);
  const forward = await snapFocusNav(page);
  await context.close();
  return { label, startPath, direct, clicked, hashState, back, forward };
}

const clickResults = {};
clickResults.homeLogo = await clickNavCycle('/services/web-design', async (p) => {
  await p.getByRole('link', { name: /Keystone Consulting Group - Home/ }).click();
}, 'logo-home');
clickResults.pricing = await clickNavCycle('/', async (p) => {
  await p.getByRole('link', { name: 'Processing', exact: true }).click();
}, 'processing-pricing');
clickResults.about = await clickNavCycle('/', async (p) => {
  await p.getByRole('link', { name: 'About', exact: true }).click();
}, 'about');
clickResults.webDesign = await clickNavCycle('/', async (p) => {
  await p.getByRole('link', { name: 'Websites', exact: true }).click();
}, 'websites');
clickResults.automations = await clickNavCycle('/', async (p) => {
  await p.getByRole('link', { name: 'AI Automations', exact: true }).click();
}, 'automations');
clickResults.services = await clickNavCycle('/', async (p) => {
  await p.locator('footer a[href^="/services"]').first().click();
}, 'footer-services');
clickResults.consumerFinancing = await clickNavCycle('/services/web-design', async (p) => {
  await p.getByRole('button', { name: 'Financial Services' }).click();
  await p.getByRole('link', { name: 'Consumer Financing' }).click();
}, 'consumer-financing');
clickResults.restaurants = await clickNavCycle('/services/web-design', async (p) => {
  await p.getByRole('button', { name: 'Industries' }).click();
  await p.getByRole('link', { name: 'Restaurants', exact: true }).click();
}, 'restaurants');

measurements.clickNav = clickResults;

async function visit(base, path, viewport, shotName) {
  const context = await browser.newContext({ viewport, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, `${base}${path}`);
  await setTheme(page, 'dark');
  const direct = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const fontLoad = await waitFonts(page);
  await page.waitForTimeout(200);
  const h1 = await page.locator('h1').first().textContent().catch(() => null);
  const navLabels = await page.evaluate(() =>
    [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
  );
  if (shotName) {
    await page.screenshot({ path: resolve(__dirname, shotName), fullPage: true });
  }
  const result = {
    path,
    status: direct?.status(),
    url: page.url(),
    h1: h1?.trim(),
    navLabels,
    fontLoad,
  };
  await context.close();
  return result;
}

for (const path of criterion14) {
  const r = await visit(CURRENT, path, { width: 1440, height: 900 });
  linkMatrix.push({ kind: 'direct-load', ...r });
}
for (const path of industryRoutes) {
  const r = await visit(CURRENT, path, { width: 1440, height: 900 });
  linkMatrix.push({ kind: 'industry-direct-load', ...r });
}

// Current vs reconstructed baseline full-page + dropdowns
const currentWeb = await visit(CURRENT, '/services/web-design', { width: 1440, height: 900 }, 'after/services-web-design-1440-dark.png');
const currentRest = await visit(CURRENT, '/restaurants', { width: 1440, height: 900 }, 'after/restaurants-1440-dark.png');
let baselineWeb = null;
let baselineRest = null;
let baselineDropdown = null;
let currentDropdown = null;
try {
  baselineWeb = await visit(BASELINE, '/services/web-design', { width: 1440, height: 900 }, 'reconstructed-baseline-services-web-design-1440-dark.png');
  baselineRest = await visit(BASELINE, '/restaurants', { width: 1440, height: 900 }, 'reconstructed-baseline-restaurants-1440-dark.png');
} catch (err) {
  measurements.baselineCaptureError = String(err);
}

async function captureDropdowns(base, prefix) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, `${prefix}-dropdown`);
  await setTheme(page, 'dark');
  await page.goto(`${base}/services/web-design`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  const navLabels = await page.evaluate(() =>
    [...document.querySelectorAll('header nav a, header nav button')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
  );
  await page.getByRole('button', { name: 'Financial Services' }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(__dirname, `${prefix}-web-design-financial-dropdown.png`), fullPage: false });
  const financialOpen = await page.getByRole('link', { name: 'Consumer Financing' }).isVisible();
  await page.getByRole('button', { name: 'Industries' }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(__dirname, `${prefix}-web-design-industries-dropdown.png`), fullPage: false });
  const industriesOpen = await page.getByRole('link', { name: 'Restaurants', exact: true }).isVisible();
  await context.close();

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const mp = await mctx.newPage();
  attachLogging(mp, `${prefix}-mobile-menu`);
  await setTheme(mp, 'dark');
  await mp.goto(`${base}/restaurants`, { waitUntil: 'networkidle' });
  await waitFonts(mp);
  await mp.getByLabel('Open menu').click();
  await mp.waitForTimeout(200);
  await mp.screenshot({ path: resolve(__dirname, `${prefix}-restaurants-mobile-menu.png`), fullPage: false });
  const accordion = await mp.getByRole('button', { name: 'Financial Services' }).isVisible();
  await mctx.close();
  return { navLabels, financialOpen, industriesOpen, mobileAccordion: accordion };
}

currentDropdown = await captureDropdowns(CURRENT, 'after/current');
try {
  baselineDropdown = await captureDropdowns(BASELINE, 'reconstructed-baseline');
} catch (err) {
  measurements.baselineDropdownError = String(err);
}

measurements.headerCompare = {
  currentWebNav: currentWeb.navLabels,
  baselineWebNav: baselineWeb?.navLabels || null,
  navEqual: JSON.stringify(currentWeb.navLabels) === JSON.stringify(baselineWeb?.navLabels || []),
  currentDropdown,
  baselineDropdown,
  currentRestaurantsNav: currentRest.navLabels,
  baselineRestaurantsNav: baselineRest?.navLabels || null,
};

// Slop texts
const slopRoutes = [
  '/', '/services', '/services/web-design', '/services/crm', '/services/automations',
  '/services/consulting', '/services/consumer-financing', '/services/business-loans',
  '/services/pos-placement', '/services/google-business', '/services/seo', '/services/bpo',
  '/services/prep-to-sell', '/restaurants', '/grocery', '/healthcare', '/ecommerce',
  '/salons', '/auto-repair', '/gas-stations', '/high-risk', '/nonprofits', '/b2b',
  '/real-estate', '/retail',
];
const slopIndex = [];
const slopScores = [];
for (const route of slopRoutes) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  attachLogging(page, `slop-${route}`);
  await setTheme(page, 'dark');
  await page.goto(`${CURRENT}${route}`, { waitUntil: 'networkidle' });
  await waitFonts(page);
  const txt = await page.evaluate(() => document.body.innerText);
  const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
  const file = resolve(slopDir, `${slug}.txt`);
  await writeFile(file, txt);
  slopIndex.push({ route, words: txt.split(/\s+/).filter(Boolean).length, path: file });
  const lint = spawnSync('python3', ['/Users/hunterlodwick/.hermes/skills/productivity/slopmonster/tools/deslop.py', '--text', txt], { encoding: 'utf8' });
  const out = `${lint.stdout || ''}${lint.stderr || ''}`;
  const scoreMatch = out.match(/([0-5])\/5/);
  slopScores.push({ route, exit: lint.status, score: scoreMatch ? scoreMatch[0] : 'UNPARSED', output: out.trim().split('\n').slice(-8).join('\n') });
  await context.close();
}

await writeFile(resolve(slopDir, 'index.json'), JSON.stringify(slopIndex, null, 2));
await writeFile(resolve(__dirname, 'slop-lint-results.json'), JSON.stringify(slopScores, null, 2));

for (const key of ['home-390-dark', 'home-1440-dark']) {
  const before = measurements.baseline[key].scrollHeight;
  const after = measurements.after[key].scrollHeight;
  measurements.after[key].percentReduction = Number((((before - after) / before) * 100).toFixed(2));
}

await writeFile(resolve(__dirname, 'measurements.json'), JSON.stringify(measurements, null, 2));
await writeFile(resolve(__dirname, 'link-results.json'), JSON.stringify({ linkMatrix, clickResults, currentWeb, currentRest, baselineWeb, baselineRest }, null, 2));
await writeFile(resolve(__dirname, 'console.log'), consoleLog.length ? consoleLog.map((e) => JSON.stringify(e)).join('\n') + '\n' : 'No browser errors or failed local asset requests recorded.\n');
await writeFile(resolve(__dirname, 'keyboard.json'), JSON.stringify(measurements.keyboard, null, 2));

const summary = {
  sectionCount390: measurements.after['home-390-dark'].sectionCount,
  reduction390: measurements.after['home-390-dark'].percentReduction,
  reduction1440: measurements.after['home-1440-dark'].percentReduction,
  hoverShadows: measurements.hoverShadows,
  keyboard: {
    heroOpenInDialog: measurements.keyboard.desktopHeroContact.afterOpen.inDialog,
    heroCloseNotBody: !measurements.keyboard.desktopHeroContact.afterClose.isBody,
    statementOpenInDialog: measurements.keyboard.desktopStatement.afterOpen.inDialog,
    statementCloseNotBody: !measurements.keyboard.desktopStatement.afterClose.isBody,
    mobileOpenInDialog: measurements.keyboard.mobileMenuContact.afterOpen.inDialog,
    mobileCloseLabel: measurements.keyboard.mobileMenuContact.afterClose.ariaLabel,
    mobileCloseIsBody: measurements.keyboard.mobileMenuContact.afterClose.isBody,
  },
  aboutClickUrl: clickResults.about.clicked.url,
  navEqual: measurements.headerCompare.navEqual,
  slopFail: slopScores.filter((s) => s.exit !== 0).map((s) => s.route),
  consoleErrors: consoleLog.length,
  fonts390: measurements.fontLoad['home-390-dark'],
};
console.log(JSON.stringify(summary, null, 2));
await browser.close();
