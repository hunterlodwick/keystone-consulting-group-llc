import { guideBySlug, guidePath, guides, MODIFIED, SITE, topics } from './guides';

export const hubTitle = 'Business answers for your next decision';
export const hubDescription = 'Practical, sourced guides to payment processing, websites, AI automation and local SEO for business owners nationwide.';
export function guideMetadata(path: string) {
  const page = guideBySlug(path.replace(/^\/guides\//, ''));
  const title = `${page?.title ?? hubTitle} | KCG`;
  const description = page?.description ?? hubDescription;
  const canonical = SITE + path;
  const organization = { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Keystone Consulting Group', url: SITE, areaServed: { '@type': 'Country', name: 'United States' } };
  const website = { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Keystone Consulting Group', url: SITE, publisher: { '@id': organization['@id'] } };
  const crumbs = [{ name: 'Home', item: SITE + '/' }, { name: 'Guides', item: SITE + '/guides' }];
  if (page) {
    if (page.kind !== 'pillar') crumbs.push({ name: topics[page.topic].title, item: SITE + guidePath(topics[page.topic].slug) });
    crumbs.push({ name: page.title, item: canonical });
  }
  const graph: Record<string, unknown>[] = [organization, website, {
    '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })),
  }];
  if (page) {
    graph.push({ '@type': 'Article', '@id': canonical + '#article', headline: page.title, description, dateModified: MODIFIED, author: { '@id': organization['@id'] }, publisher: { '@id': organization['@id'] }, mainEntityOfPage: canonical, inLanguage: 'en-US' });
    if (page.kind === 'pillar') graph.push({ '@type': 'Service', name: topics[page.topic].title, serviceType: topics[page.topic].title, provider: { '@id': organization['@id'] }, areaServed: { '@type': 'Country', name: 'United States' }, url: SITE + topics[page.topic].service });
    graph.push({ '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: page.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) });
  } else graph.push({ '@type': 'CollectionPage', name: hubTitle, url: canonical, dateModified: MODIFIED, hasPart: guides.filter(g => g.kind === 'pillar').map(g => ({ '@type': 'WebPage', name: g.title, url: SITE + guidePath(g.slug) })) });
  return { title, description, canonical, type: page ? 'article' : 'website', jsonLd: { '@context': 'https://schema.org', '@graph': graph } };
}
export function escapeHtml(text: string) { return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!)); }
export function serializeJson(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
export function metadataMarkup(path: string) {
  const m = guideMetadata(path);
  return `<title>${escapeHtml(m.title)}</title>
<meta name="description" content="${escapeHtml(m.description)}" />
<link rel="canonical" href="${m.canonical}" />
<meta property="og:type" content="${m.type}" />
<meta property="og:title" content="${escapeHtml(m.title)}" />
<meta property="og:description" content="${escapeHtml(m.description)}" />
<meta property="og:url" content="${m.canonical}" />
<meta property="og:site_name" content="Keystone Consulting Group" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(m.title)}" />
<meta name="twitter:description" content="${escapeHtml(m.description)}" />
<script type="application/ld+json" id="guide-schema">${serializeJson(m.jsonLd)}</script>`;
}
