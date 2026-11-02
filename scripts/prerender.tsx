import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';
import { guides, guidePath, MODIFIED, SITE } from '../src/content/guides';
import { escapeHtml } from '../src/content/guide-seo';
import { siteMetadataMarkup } from '../src/content/site-seo';
import { existingRoutes, newRoutes, publicRoutes, staticFile } from './seo-routes';

const shell = await readFile('dist/index.html', 'utf8');
const unique = new Set(guides.map(g => g.slug));
if (unique.size !== guides.length) throw new Error('Duplicate guide slug');
for (const page of guides) {
  for (const slug of page.related) if (!unique.has(slug)) throw new Error(`Broken related link: ${page.slug} -> ${slug}`);
  if (page.kind === 'question') {
    const words = page.answer.trim().split(/\s+/).length;
    if (words < 40 || words > 60) throw new Error(`${page.slug}: first answer has ${words} words, expected 40-60`);
  }
  if (JSON.stringify(page).includes('—')) throw new Error(`Em dash in ${page.slug}`);
}
const baseShell = shell.replace(/<title>[\s\S]*?<\/title>/g, '').replace(/<meta\s+(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const cacheDir = await mkdtemp(join(tmpdir(), 'kcg-prerender-'));
const renderer = await createServer({ configLoader: 'runner', cacheDir, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { renderPage } = await renderer.ssrLoadModule('/src/entry-prerender.tsx');
  for (const route of [...publicRoutes, '/dashboard']) {
    const content = renderPage(route);
    const html = baseShell.replace('</head>', `${siteMetadataMarkup(route)}\n<noscript><style>.animate-on-scroll{opacity:1!important;transform:none!important}</style></noscript>\n</head>`).replace('<div id="root"></div>', `<div id="root">${content}</div>`).replace('<html lang="en">', '<html lang="en" data-theme="light">');
    if (!html.includes('<h1') || !html.includes('application/ld+json') || !html.includes(content)) throw new Error(`Invalid static HTML: ${route}`);
    const file = `dist${staticFile(route)}`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
    // Exact static rewrites must win over the existing SPA fallback.
    const match = config.rewrites.find((r: { source: string }) => r.source === route || r.source === '/(.*)');
    if (match?.destination !== staticFile(route)) throw new Error(`Missing or shadowed static rewrite for ${route}`);
  }
} finally {
  await renderer.close();
  await rm(cacheDir, { recursive: true, force: true });
}
const xml = (value: string) => escapeHtml(value);
const oldModified = (file: string) => { try { return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || MODIFIED; } catch { return MODIFIED; } };
const entries = [...existingRoutes.map(r => ({ path: r.path, modified: oldModified(r.file) })), ...newRoutes.map(path => ({ path, modified: MODIFIED }))];
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(r => `  <url><loc>${xml(SITE + r.path)}</loc><lastmod>${r.modified}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const bots = ['*', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'Perplexity-User', 'Applebot-Extended'];
await writeFile('dist/robots.txt', bots.map(bot => `User-agent: ${bot}\nAllow: /\n`).join('\n') + `\nSitemap: ${SITE}/sitemap.xml\n`);
await writeFile('dist/llms.txt', `# Keystone Consulting Group\n\n> KCG serves merchants and business owners nationwide with payment processing, websites, AI automation, and Google Business Profile / SEO services.\n\nThe Fluid Pay plan is $30/month with no contract. Request full processing and optional-service terms. Next-day funding is available; confirm account eligibility and timing. Flexxbuy is an option for buy-now-pay-later and customer financing. No approval, savings, ranking, or performance guarantee is made.\n\n## Start here\n\n- [Business guides](${SITE}/guides): Questions, comparisons, and sourced state guides.\n${guides.filter(g => g.kind === 'pillar').map(g => `- [${g.title}](${SITE}${guidePath(g.slug)}): ${g.description}`).join('\n')}\n\n## Practical decisions\n\n${['dual-pricing-laws', 'switch-from-stripe', 'fluid-pay-vs-stripe', 'website-cost', 'ai-voice-agents', 'chatgpt-recommendations'].map(slug => { const g = guides.find(g => g.slug === slug)!; return `- [${g.title}](${SITE}${guidePath(slug)})`; }).join('\n')}\n\n## Contact and policies\n\n- [Book a call](${SITE}/#book-a-call)\n- [Services](${SITE}/services)\n- [Privacy](${SITE}/privacy)\n- [Terms](${SITE}/terms)\n\nLegal guides are general information, not legal advice. Sources and review dates are on each page. This optional reading list is not a guarantee of crawler use or AI citations.\n`);
await writeFile('dist/seo-manifest.json', JSON.stringify(entries, null, 2));
console.log(`Prerendered ${publicRoutes.length} public routes and the noindex dashboard. Sitemap: ${entries.length} canonical routes.`);
