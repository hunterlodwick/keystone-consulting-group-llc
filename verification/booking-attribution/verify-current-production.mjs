import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
const origin = 'https://www.keystoneconsultingg.com';
const evidence = { deployment: 'dpl_9aNo13uNjZRoXYBwEMENx7LxxSNm', codeCommit: '4bba68db0a13d1323f38e1ead20ef4eb9f0c26b7', pages: [], bookingPosts: 0, consoleErrors: [] };
const homepage = await fetch(origin);
assert.equal(homepage.status, 200);
const html = await homepage.text();
const asset = html.match(/src="([^\"]*\/assets\/index-[^\"]+\.js)"/)?.[1];
assert.ok(asset);
const bundle = await fetch(new URL(asset, origin));
assert.equal(bundle.status, 200);
const source = await bundle.text();
for (const marker of ['kcgPage', 'kcgCta', 'kcgReferrer', 'kcgUtm', 'kcgWidget', 'utm_']) assert.ok(source.includes(marker));
evidence.asset = asset;
evidence.attributionInLiveBundle = true;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date());
const slots = await fetch(`${origin}/api/booking/slots?from=${today}&days=1`);
evidence.slotsStatus = slots.status;
evidence.bookingMode = slots.headers.get('x-booking-mode');
assert.equal(slots.status, 200);
assert.equal(evidence.bookingMode, 'live');
assert.ok(Array.isArray((await slots.json()).days));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.on('console', message => { if (message.type() === 'error') evidence.consoleErrors.push(message.text()); });
  page.on('pageerror', error => evidence.consoleErrors.push(error.message));
  await page.route('**/api/booking/book', route => { evidence.bookingPosts++; return route.abort(); });
  for (const path of ['/', '/services/automations', '/work', '/privacy', '/terms']) {
    const response = await page.goto(origin + path);
    assert.equal(response.status(), 200);
    await page.locator('main, h1').first().waitFor();
    evidence.pages.push({ path, status: response.status() });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/services/automations');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
  await page.getByRole('dialog').locator('[data-booking-widget]').waitFor();
  evidence.mobileBookingOpens = true;
  assert.equal(evidence.bookingPosts, 0);
  assert.deepEqual(evidence.consoleErrors, []);
} finally { await browser.close(); }
writeFileSync(new URL('./latest-production.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
