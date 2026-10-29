import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { guides, guidePath, SITE } from '../src/content/guides';
import { guideMetadata } from '../src/content/guide-seo';
import { existingRoutes, newRoutes } from './seo-routes';

const base = process.env.SEO_PREVIEW_URL || 'http://127.0.0.1:4180';
const output = 'verification/aeo-seo';
await mkdir(output, { recursive: true });
const allRoutes = [...existingRoutes.map(r => r.path), ...newRoutes];
const known = new Set(allRoutes);
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
assert.deepEqual(new Set(sitemapRoutes), known, 'Sitemap must list every canonical route exactly once');
assert.equal(sitemapRoutes.length, known.size);
assert.equal([...sitemap.matchAll(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)].length, known.size);
const robots = await (await fetch(`${base}/robots.txt`)).text();
for (const bot of ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot']) assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /`));
assert.ok(robots.includes(`${SITE}/sitemap.xml`));
assert.ok((await (await fetch(`${base}/llms.txt`)).text()).includes(`${SITE}/guides`));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ javaScriptEnabled: false });
await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
const tab = await context.newPage();
const checks: object[] = [];
const links = new Set<string>();
try {
  for (const path of newRoutes) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type')?.includes('text/html'));
    const html = await response.text();
    const local = await readFile(`dist${path}.html`, 'utf8');
    assert.equal(html, local, `${path} must serve its static file, not the SPA fallback`);
    const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.equal(ld.length, 1, path);
    const expected = guideMetadata(path);
    assert.deepEqual(ld[0], expected.jsonLd, path);
    await tab.goto(base + path, { waitUntil: 'domcontentloaded' });
    assert.equal(await tab.locator('h1').count(), 1, path);
    assert.equal(await tab.title(), expected.title);
    assert.equal(await tab.locator('meta[name="description"]').getAttribute('content'), expected.description);
    assert.equal(await tab.locator('link[rel="canonical"]').getAttribute('href'), expected.canonical);
    assert.equal(await tab.locator('meta[property="og:url"]').getAttribute('content'), expected.canonical);
    assert.equal(await tab.locator('meta[property="og:title"]').getAttribute('content'), expected.title);
    assert.equal(await tab.locator('meta[property="og:description"]').getAttribute('content'), expected.description);
    assert.equal(await tab.locator('meta[name="twitter:title"]').getAttribute('content'), expected.title);
    assert.equal(await tab.locator('meta[name="twitter:description"]').getAttribute('content'), expected.description);
    assert.equal(await tab.locator('#guide-contact form').count(), 1);
    assert.ok(await tab.locator('#guide-contact input').first().isDisabled(), 'Static form must not submit a native GET without JavaScript');
    const page = guides.find(g => guidePath(g.slug) === path);
    if (page) {
      assert.equal(await tab.locator('[data-answer-first="true"]').textContent(), page.answer);
      const faq = await tab.locator('.guide-faq').evaluateAll(nodes => nodes.map(node => ({ question: node.querySelector('summary')?.textContent, answer: node.querySelector('p')?.textContent })));
      assert.deepEqual(faq, page.faq);
      assert.equal(await tab.locator('.guide-inline-cta').count(), 1);
      for (const section of page.sections) assert.ok((await tab.locator('.guide-article').textContent())?.includes(section.body));
    }
    const hrefs = await tab.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')!));
    for (const href of hrefs) {
      const url = new URL(href, base + path);
      if (![base, SITE].includes(url.origin)) continue;
      links.add(url.pathname + url.hash);
      assert.ok(known.has(url.pathname), `Unknown internal route ${href} from ${path}`);
      if (url.pathname === path && url.hash) assert.equal(await tab.locator(`[id=${JSON.stringify(decodeURIComponent(url.hash.slice(1)))}]`).count(), 1, `Missing fragment ${href}`);
    }
    checks.push({ path, status: response.status, staticMatch: true, jsonLd: true, metadata: true, noJavaScriptContent: true, formPresent: true });
  }
  // Existing pages are SPA routes, so check their rendered fragment targets with JS enabled.
  const live = await browser.newContext();
  await live.route('**/*', route => new URL(route.request().url()).origin === base && route.request().method() === 'GET' && !route.request().url().includes('/api/') ? route.continue() : route.abort());
  const liveTab = await live.newPage();
  const fragments = [...links].filter(link => link.includes('#') && !link.startsWith('/guides'));
  for (const path of new Set(fragments.map(link => link.split('#')[0]))) {
    await liveTab.goto(base + path, { waitUntil: 'networkidle' });
    for (const link of fragments.filter(link => link.split('#')[0] === path)) {
      const id = decodeURIComponent(link.split('#')[1]);
      assert.equal(await liveTab.locator(`[id=${JSON.stringify(id)}]`).count(), 1, `Missing existing fragment ${link}`);
    }
  }
  for (const path of existingRoutes.map(r => r.path)) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
  }
  await live.close();
} finally { await browser.close(); }
// Explicit curl evidence, separate from browser/Fetch checks.
const curlRoutes = ['/guides', '/guides/payment-processing', '/guides/switch-from-stripe', '/guides/california-dual-pricing'];
const curlEvidence = curlRoutes.map(path => {
  const result = execFileSync('curl', ['--fail', '--silent', '--show-error', '-w', '\nHTTP_STATUS=%{http_code}', base + path], { encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.ok(result.endsWith('HTTP_STATUS=200'));
  return `${path}\n${result.match(/<h1[^>]*>[\s\S]*?<\/h1>/)?.[0]}\n${result.match(/<title>[^<]*<\/title>/)?.[0]}\n${result.match(/<meta name="description"[^>]*>/)?.[0]}\n${result.match(/<link rel="canonical"[^>]*>/)?.[0]}\nJSON-LD parses: ${Boolean(JSON.parse(result.match(/<script type="application\/ld\+json" id="guide-schema">([\s\S]*?)<\/script>/)![1]))}\nHTTP_STATUS=200\n`;
});
await writeFile(`${output}/curl-checks.txt`, curlEvidence.join('\n'));
await writeFile(`${output}/static-checks.json`, JSON.stringify({ checkedAt: new Date().toISOString(), base, routes: checks, sitemapRoutes: sitemapRoutes.length, existingRoutes: existingRoutes.length, internalLinks: links.size, internalLinksChecked: [...links].sort(), externalActions: 'No forms submitted, external requests blocked in browser' }, null, 2));
console.log(`PASS: ${checks.length} static routes, ${sitemapRoutes.length} sitemap entries, ${links.size} internal destinations, JSON-LD, metadata, forms, and curl checks.`);
