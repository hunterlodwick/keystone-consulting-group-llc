import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { newRoutes, existingRoutes } from './seo-routes';
import { guideMetadata } from '../src/content/guide-seo';

const base = process.env.SEO_PREVIEW_URL || 'http://127.0.0.1:4180';
const output = 'verification/aeo-seo';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results: object[] = [];
const captures = ['/guides', '/guides/switch-from-stripe', '/guides/fluid-pay-vs-stripe', '/guides/california-dual-pricing'];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, reducedMotion: 'reduce' });
    // Do not contact booking APIs, submit any form, or issue third-party requests.
    await context.route('**/*', route => new URL(route.request().url()).origin === base && route.request().method() === 'GET' && !route.request().url().includes('/api/') ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const path of newRoutes) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1, path);
      assert.equal(await page.title(), guideMetadata(path).title);
      assert.equal(await page.locator('#guide-schema').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} horizontal overflow at ${width}`);
      const cta = page.locator('.guide-top-cta a').first();
      await cta.click();
      await page.waitForFunction(() => {
        const el = document.getElementById('guide-contact');
        return el && el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0;
      });
      assert.equal(await page.locator('#guide-contact form').count(), 1);
      assert.equal(await page.locator('#guide-contact input[required]').count(), 4);
      assert.ok(await page.locator('#guide-contact input').first().isEnabled());
      // Read-only checks only: do not fill or submit.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(100);
      if (path === '/guides/switch-from-stripe') await page.locator('#guide-contact').screenshot({ path: `${output}/contact-${width}.png`, animations: 'disabled' });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      if (captures.includes(path)) {
        const name = path === '/guides' ? 'hub' : path.split('/').at(-1);
        await page.screenshot({ path: `${output}/${name}-${width}.png`, animations: 'disabled' });
      }
      results.push({ path, width, renders: true, noOverflow: true, contactAnchor: true });
    }
    // Verify navigation from the hub uses correct static page metadata, then back to an existing page.
    await page.goto(base + '/guides', { waitUntil: 'networkidle' });
    await page.locator('.guide-card[href="/guides/payment-processing"]').click();
    await page.waitForURL(base + '/guides/payment-processing');
    assert.equal(await page.title(), guideMetadata('/guides/payment-processing').title);
    await page.locator('.guide-breadcrumb a[href="/"]').click();
    await page.waitForURL(base + '/');
    assert.equal(await page.locator('#guide-schema').count(), 0, 'Guide metadata must not leak onto home');
    // Theme toggle is the existing control. Verify dark theme on a guide at desktop size.
    if (width === 1440) {
      await page.goto(base + '/guides/switch-from-stripe', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).first().click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.screenshot({ path: `${output}/switch-from-stripe-dark-1440.png`, animations: 'disabled' });
      for (const { path } of existingRoutes) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        assert.ok((await page.locator('body').innerText()).length > 100, `Existing route empty: ${path}`);
      }
    }
    assert.deepEqual(errors, [], `Browser exceptions at width ${width}`);
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/browser-checks.json`, JSON.stringify({ checkedAt: new Date().toISOString(), checks: results, existingRoutesSmokeTested: existingRoutes.length, screenshots: 11, submissions: 0, thirdPartyRequests: 'blocked', bookingApiRequests: 'blocked' }, null, 2));
console.log(`PASS: ${results.length} responsive route checks, ${existingRoutes.length} existing-route smoke checks, 11 screenshots. No forms submitted.`);
