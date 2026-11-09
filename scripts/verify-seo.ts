import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { guides, guidePath, guideReviewed, SITE, topics } from '../src/content/guides';
import { escapeHtml } from '../src/content/guide-seo';
import { siteMetadata } from '../src/content/site-seo';
import { publicRoutes, staticFile } from './seo-routes';

// Always verify build artifacts without requiring a server or browser.
// Set SEO_PREVIEW_URL to a local preview to additionally run HTTP/browser checks.
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const titles = new Set<string>();
const descriptions = new Set<string>();
for (const path of [...publicRoutes, '/dashboard']) {
  const html = await readFile(`dist${staticFile(path)}`, 'utf8');
  const expected = siteMetadata(path);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${path}: one h1`);
  assert.equal((html.match(/<title>/g) ?? []).length, 1, path);
  assert.ok(html.includes(`<title>${escapeHtml(expected.title)}</title>`), path);
  assert.ok(!titles.has(expected.title), `${path}: duplicate title`);
  titles.add(expected.title);
  assert.ok(!descriptions.has(expected.description), `${path}: duplicate description`);
  descriptions.add(expected.description);
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, path);
  assert.ok(html.includes(`<link rel="canonical" href="${expected.canonical}"`), path);
  for (const [attribute, name, value] of [
    ['name', 'description', expected.description],
    ['property', 'og:title', expected.title],
    ['property', 'og:description', expected.description],
    ['property', 'og:url', expected.canonical],
  ]) assert.ok(html.includes(`<meta ${attribute}="${name}" content="${escapeHtml(value)}"`), `${path}: ${name}`);
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(schemas.length, 1, path);
  assert.deepEqual(JSON.parse(schemas[0][1]), expected.jsonLd, path);
  assert.equal(html.includes('<meta name="robots" content="noindex"'), path === '/dashboard', path);
  const rewrite = config.rewrites.find((r: { source: string }) => r.source === path || r.source === '/(.*)');
  assert.equal(rewrite?.destination, staticFile(path), `${path}: exact rewrite before fallback`);
  assert.match(html, /<script[^>]+type="module"[^>]+src="\/assets\//, `${path}: client entry retained`);
  const page = guides.find(g => guidePath(g.slug) === path);
  if (page) {
    assert.ok(html.includes(escapeHtml(page.answer)), `${path}: first answer`);
    assert.ok(html.includes(`Last reviewed <time dateTime="${guideReviewed(page)}">${guideReviewed(page)}</time>`), `${path}: review date`);
    assert.equal(expected.jsonLd['@graph'].find(node => node['@type'] === 'Article')?.dateModified, guideReviewed(page), `${path}: Article dateModified`);
    if (page.kind === 'comparison') assert.ok(page.answer.startsWith('Fluid Pay is partner-only: merchants cannot sign up directly. Merchants get the Fluid Pay plan by applying through Keystone Consulting Group (KCG).'), `${path}: partner application in first answer`);
    if (page.kind === 'state') assert.ok(page.answer.startsWith('Short answer: '));
    if (page.kind === 'comparison') assert.ok(page.faq.some(f => f.answer.includes('the provider they apply with')));
    if (page.kind === 'question') assert.ok(page.answer.split(/\s+/).length >= 40 && page.answer.split(/\s+/).length <= 60);
    assert.ok(!JSON.stringify(page).includes('—'));
  }
  if (path === '/') {
    for (const tag of ['header', 'main', 'footer']) {
      assert.ok(html.match(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`))?.[0].includes('href="/guides"'), `${tag}: guide link`);
    }
    assert.ok(expected.jsonLd['@graph'].some(g => g['@type'] === 'ProfessionalService'));
  }
  if (path === '/guides') {
    const list = expected.jsonLd['@graph'].find(g => g['@type'] === 'ItemList');
    assert.ok(list);
    assert.deepEqual((list.itemListElement as { url: string }[]).map(item => item.url), guides.map(g => SITE + guidePath(g.slug)));
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(locations.sort(), publicRoutes.map(path => SITE + path).sort());
assert.ok(!sitemap.includes('/dashboard'));
const llms = await readFile('dist/llms.txt', 'utf8');
const hub = await readFile(`dist${staticFile('/guides')}`, 'utf8');
for (const slug of ['cash-discount-for-restaurants', 'choose-merchant-services-consultant', 'ai-websites-for-local-businesses', 'zero-fee-processing']) {
  const page = guides.find(g => g.slug === slug)!;
  assert.ok(page, `${slug}: buyer question exists`);
  assert.ok(page.sections.length >= 3 && page.sections.length <= 5, `${slug}: section count`);
  assert.ok(page.sections[0].bullets?.length, `${slug}: opening checklist`);
  assert.ok(llms.includes(SITE + guidePath(slug)), `${slug}: llms link`);
  assert.ok(hub.includes(`href="${guidePath(slug)}"`), `${slug}: hub link`);
  const pillar = await readFile(`dist${staticFile(guidePath(topics[page.topic].slug))}`, 'utf8');
  assert.ok(pillar.includes(`href="${guidePath(slug)}"`), `${slug}: pillar link`);
}
const robots = await readFile('dist/robots.txt', 'utf8');
for (const bot of ['*', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'Perplexity-User', 'Applebot-Extended']) {
  assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /\n`), bot);
}
assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`));
console.log(`PASS: ${publicRoutes.length} public static files plus noindex dashboard; unique metadata, canonical, h1, JSON-LD, rewrites, guide answers, sitemap and robots.`);
if (process.env.SEO_PREVIEW_URL) {
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(process.env.SEO_PREVIEW_URL).hostname), 'Verification must use a local preview');
  await import('./verify-seo-served');
} else {
  console.log('HTTP/client/mobile checks not run. Set SEO_PREVIEW_URL to a local preview server to enable them.');
}
