import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { ContactForm } from '../App';
import { guideBySlug, guidePath, guides, MODIFIED, topics, type Guide } from '../content/guides';
import { sources, type SourceId } from '../content/guide-sources';
import { stateDetails, stateNames } from '../content/guide-states';
import { hubDescription, hubTitle, metadataMarkup } from '../content/guide-seo';

// Restore the previous shell metadata when navigating back to an existing SPA page.
export function GuideHead({ path }: { path: string }) {
  useEffect(() => {
    if (path !== '/guides' && !guideBySlug(path.replace(/^\/guides\//, ''))) return;
    const selectors = 'title, meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], #guide-schema';
    const previous = [...document.head.querySelectorAll(selectors)];
    previous.forEach(node => node.remove());
    const template = document.createElement('template');
    template.innerHTML = metadataMarkup(path);
    const nodes = [...template.content.children];
    nodes.forEach(node => document.head.append(node));
    return () => { nodes.forEach(node => node.remove()); previous.forEach(node => document.head.append(node)); };
  }, [path]);
  return null;
}
function Citations({ ids }: { ids: SourceId[] }) {
  return ids.length ? <div className="guide-citations">Sources: {ids.map(id => <a key={id} href={sources[id].url} rel="noopener noreferrer">{sources[id].label}</a>)}</div> : null;
}
function Cta({ inline = false }: { inline?: boolean }) {
  return <aside className={inline ? 'guide-inline-cta' : 'guide-top-cta'}>
    {inline && <div><strong>Bring your business, not a guess.</strong><p>Talk through your payment setup, website, or next automation.</p></div>}
    <a className="guide-button" href="#guide-contact">Free Profit Leak Analysis <ArrowRight size={17} aria-hidden="true" /></a>
    {!inline && <a className="guide-secondary" href="/#book-a-call">Book a call</a>}
  </aside>;
}
function ClosingContact() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return <section id="guide-contact" className="guide-contact" aria-labelledby="guide-contact-heading">
    <div><span className="guide-eyebrow">A practical next step</span><h2 id="guide-contact-heading">Let’s talk through your next decision.</h2><p>KCG serves merchants and business owners nationwide. Request a Free Profit Leak Analysis or bring a question about your website, automation, or search visibility.</p><a className="guide-secondary" href="/#book-a-call">Prefer a conversation? Book a call <ArrowRight size={16} aria-hidden="true" /></a><p className="guide-small">Please do not send card details or other sensitive information. <a href="/privacy">Privacy policy</a></p></div>
    <div className="guide-form"><fieldset disabled={!ready}><ContactForm /></fieldset><noscript>To use the form, enable JavaScript, or call <a href="tel:801-360-9156">(801) 360-9156</a>.</noscript></div>
  </section>;
}
function Card({ page }: { page: Guide }) {
  return <a className="guide-card" href={guidePath(page.slug)}><span className="guide-eyebrow">{page.kind === 'question' ? 'Question answered' : page.kind === 'state' ? 'State rules' : page.kind === 'comparison' ? 'Compare options' : 'Start here'}</span><h3>{page.title}</h3><p>{page.description}</p><span className="guide-read">Read the guide <ArrowRight size={16} aria-hidden="true" /></span></a>;
}
function StateTable() {
  return <section className="guide-section"><h2>State-by-state research map</h2><p>This is a research map, not a fifty-state legal clearance. The linked states have verified distinctions. Other entries are not separately reviewed and must not be read as permission to surcharge.</p><div className="guide-table-scroll" tabIndex={0} role="region" aria-label="State research table"><table><thead><tr><th scope="col">State or district</th><th scope="col">Verified distinction or review status</th></tr></thead><tbody>{stateNames.map(name => {
    const state = stateDetails.find(s => s.name === name);
    return <tr key={name}><th scope="row" data-label="State or district">{state ? <a href={guidePath(`${state.slug}-dual-pricing`)}>{name}</a> : name}</th><td data-label="Verified distinction or review status">{state ? <>{state.summary}<Citations ids={[state.sources[0]]} /></> : 'Not separately reviewed. Check current state law and acquirer requirements before implementation.'}</td></tr>;
  })}</tbody></table></div></section>;
}
export default function GuidesPage({ path }: { path: string }) {
  const page = guideBySlug(path.replace(/^\/guides\//, ''));
  return <div className="guides-layout">
    <div className="guides-container">
      <nav aria-label="Breadcrumb" className="guide-breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>{page ? <><a href="/guides">Guides</a>{page.kind !== 'pillar' && <><span aria-hidden="true">/</span><a href={guidePath(topics[page.topic].slug)}>{topics[page.topic].title}</a></>}<span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></> : <span aria-current="page">Guides</span>}</nav>
      <header className="guide-hero">
        <div className="guide-eyebrow"><BookOpen size={16} aria-hidden="true" /> KCG field guide · Nationwide</div>
        <h1>{page?.title ?? hubTitle}</h1>
        <p className="guide-answer" data-answer-first={Boolean(page)}>{page?.answer ?? hubDescription}</p>
        <Cta />
        <div className="guide-meta">By Keystone Consulting Group <span aria-hidden="true">·</span> Updated <time dateTime={MODIFIED}>October 28, 2026</time></div>
        {page && <Citations ids={page.sources} />}
      </header>
      {!page ? <>
        <section aria-labelledby="choose-guide"><h2 id="choose-guide" className="guide-section-title">What are you deciding?</h2><div className="guide-grid guide-pillars">{guides.filter(g => g.kind === 'pillar').map(g => <div key={g.slug} className="contents"><Card page={g} /></div>)}</div></section>
        <Cta inline />
        {Object.entries(topics).map(([id, topic]) => <section key={id} id={id} className="guide-topic"><div className="guide-topic-heading"><div><h2>{topic.title}</h2><p>{topic.description}</p></div><a href={topic.service}>Explore the service <ArrowRight size={16} aria-hidden="true" /></a></div><div className="guide-grid">{guides.filter(g => g.topic === id && g.kind !== 'pillar').map(g => <div key={g.slug} className="contents"><Card page={g} /></div>)}</div></section>)}
      </> : <div className="guide-body-grid">
        <article className="guide-article">
          {page.legal && <aside className="guide-note"><strong>Not legal advice.</strong> This is general information from the linked sources, reviewed October 28, 2026. Laws and network rules can change. Have your legal adviser and acquirer review your actual pricing, locations, and checkout before implementation.</aside>}
          {page.kind === 'comparison' && <aside className="guide-note"><strong>As of Oct 2026, check current.</strong> Competitor details come from each provider’s public pricing page linked above. Features, eligibility, agreements, and fees vary. No comparative savings or performance guarantee is made.</aside>}
          {page.table && <div className="guide-table-scroll" tabIndex={0} role="region" aria-label="Provider comparison"><table><thead><tr>{page.table.headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{page.table.rows.map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th key={i} scope="row" data-label={page.table!.headings[i]}>{cell}</th> : <td key={i} data-label={page.table!.headings[i]}>{cell}</td>)}</tr>)}</tbody></table></div>}
          {page.sections.map((section, i) => <div key={section.heading}><section id={`section-${i + 1}`} className="guide-section"><h2>{section.heading}</h2><p>{section.body}</p>{section.bullets && <ul>{section.bullets.map(b => <li key={b}>{b}</li>)}</ul>}<Citations ids={section.sources ?? []} /></section>{i === 1 && <Cta inline />}</div>)}
          {page.stateTable && <StateTable />}
          {page.kind === 'pillar' && <section className="guide-section"><h2>Questions to explore next</h2><ul className="guide-question-list">{guides.filter(g => g.topic === page.topic && g.kind === 'question').map(g => <li key={g.slug}><a href={guidePath(g.slug)}>{g.title} <ArrowRight size={16} aria-hidden="true" /></a></li>)}</ul></section>}
          <section id="faq" className="guide-section"><h2>Frequently asked questions</h2>{page.faq.map(f => <details key={f.question} className="guide-faq" open><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
          <section className="guide-section"><h2>Related reading</h2><ul className="guide-question-list">{page.related.map(slug => { const related = guideBySlug(slug)!; return <li key={slug}><a href={guidePath(slug)}>{related.title} <ArrowRight size={16} aria-hidden="true" /></a></li>; })}</ul></section>
        </article>
        <aside className="guide-sidebar"><div className="guide-sidebar-inner"><span className="guide-eyebrow">In this guide</span><nav aria-label="On this page">{page.sections.map((section, i) => <a key={section.heading} href={`#section-${i + 1}`}>{section.heading}</a>)}<a href="#faq">Frequently asked questions</a></nav><div className="guide-sidebar-service"><CheckCircle size={22} aria-hidden="true" /><h2>Put the answer to work.</h2><p>Talk through the details for your business.</p><a href={topics[page.topic].service}>Explore KCG services <ArrowRight size={15} aria-hidden="true" /></a></div></div></aside>
      </div>}
      <ClosingContact />
    </div>
  </div>;
}
