import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import {
  AI_AGENTS,
  AI_HUB,
  AI_HUB_PATH,
  CONNECTOR_MODE_LABEL,
  agentByPath,
  type AgentPage,
} from '../content/ai-agents';
import { ContactForm } from '../App';

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const heading = 'font-serif text-3xl md:text-4xl text-white leading-tight';
const prose = 'text-offwhite/80 leading-relaxed';

function AgentMark({ agent, size = 'md' }: { agent: Pick<AgentPage, 'name' | 'markSrc' | 'markAlt'>; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-11 w-11' : 'h-14 w-14';
  const img = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-sm border border-teal/35 bg-teal/10 p-2`}
    >
      <img src={agent.markSrc} alt="" className={`${img} object-contain`} width={36} height={36} />
    </span>
  );
}

function Sources({ sources }: { sources: AgentPage['sources'] }) {
  return (
    <p className="text-sm text-offwhite/60 leading-relaxed">
      Official sources:{' '}
      {sources.map((source, i) => (
        <React.Fragment key={source.url}>
          {i > 0 && '; '}
          <a className="text-teal underline underline-offset-4 break-words" href={source.url} target="_blank" rel="noopener noreferrer">
            {source.label}
          </a>
        </React.Fragment>
      ))}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-offwhite/75 text-sm leading-relaxed">
          <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function HubPage({ onOpenModal }: { onOpenModal: (title: string, content: React.ReactNode) => void }) {
  useScrollAnimation();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <article className="pt-28 md:pt-32 pb-20">
      <header className="max-w-6xl mx-auto px-6 md:px-12">
        <a href="/services" className="inline-flex items-center min-h-11 text-teal underline underline-offset-4 mb-6">All services</a>
        <p className="text-teal text-sm font-medium uppercase tracking-wider mb-4">Virtual assistants</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">{AI_HUB.title}</h1>
        <p className={`${prose} text-lg max-w-3xl mb-8`}>{AI_HUB.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => onOpenModal('Map a virtual assistant job', <ContactForm />)}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Map a virtual assistant job <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <a
            href="/services/automations"
            className="inline-flex items-center justify-center min-h-11 px-6 py-3 border border-white/20 text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Existing AI automations
          </a>
        </div>
        <p className="text-sm text-offwhite/55 max-w-3xl">
          Pick the assistant by the ongoing job: always-on follow-through, proactive briefs, a role signed into your tools, or customer messaging and content on business channels. Each page names different connectors and limits. We do not pretend all four can send email or write your CRM the same way. Existing custom AI automations stay at the service page above.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14" aria-labelledby="agent-archetypes">
        <h2 id="agent-archetypes" className={`${heading} mb-3`}>Jobs these assistants take</h2>
        <p className={`${prose} max-w-3xl mb-8`}>
          Sales follow-up, customer service, scheduling, and ops. Not a Slack-only floor product, and not a one-time prompt.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {[
            'Sales follow-up: find the approved quote, draft in your voice, send only after approval on supported accounts.',
            'Customer service: draft routine replies from approved material and escalate what needs a person.',
            'Scheduling: read real availability and prepare confirmations that still wait for a human.',
            'Ops: surface exceptions, name the next owner, and log the action or prepare a paste-ready copy.',
          ].map((item) => (
            <li key={item} className="border border-white/10 rounded-sm p-5 text-offwhite/75 text-sm leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12" aria-labelledby="agent-choices">
        <h2 id="agent-choices" className={`${heading} mb-8`}>Choose the assistant by the job</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {AI_AGENTS.map((agent) => (
            <a
              key={agent.id}
              href={agent.path}
              className="group flex gap-4 border border-white/10 bg-charcoal-dark/50 p-6 rounded-sm min-h-[44px] hover:border-teal/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal transition-colors"
            >
              <AgentMark agent={agent} size="sm" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 className="text-white text-xl font-medium">{agent.name}</h3>
                  <span className="text-offwhite/45 text-xs uppercase tracking-wider">{agent.maker}</span>
                </div>
                <p className="text-teal text-sm mb-3">{agent.eyebrow}</p>
                <p className="text-offwhite/70 text-sm font-light leading-relaxed mb-4">{agent.jobLine}</p>
                {agent.markException && (
                  <p className="text-offwhite/45 text-xs leading-relaxed mb-4">{agent.markException}</p>
                )}
                <span className="inline-flex items-center gap-2 text-teal text-sm font-medium min-h-11">
                  Open the {agent.name} page
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-16 border-t border-white/10 pt-12">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-teal mt-1 shrink-0" aria-hidden="true" />
          <h2 className={heading}>Named reviewer before actions</h2>
        </div>
        <p className={`${prose} max-w-3xl mb-6`}>
          Every KCG install names the human who approves outbound sends, publishes, and spend. The tools differ. The review rule does not. We configure access. You keep the final tap.
        </p>
        <button
          onClick={() => onOpenModal('Book a Call', <ContactForm />)}
          className="inline-flex items-center gap-2 min-h-11 px-6 py-3 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          Book a Call <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </section>
    </article>
  );
}

function AgentDetailPage({
  agent,
  onOpenModal,
}: {
  agent: AgentPage;
  onOpenModal: (title: string, content: React.ReactNode) => void;
}) {
  useScrollAnimation();
  useEffect(() => { window.scrollTo(0, 0); }, [agent.id]);

  return (
    <article className="pt-28 md:pt-32 pb-20">
      <header className="max-w-6xl mx-auto px-6 md:px-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-offwhite/55 mb-6">
          <a href="/services" className="min-h-11 inline-flex items-center text-teal underline underline-offset-4">Services</a>
          <span aria-hidden="true">/</span>
          <a href={AI_HUB_PATH} className="min-h-11 inline-flex items-center text-teal underline underline-offset-4">Virtual assistants</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="min-h-11 inline-flex items-center text-offwhite/80">{agent.name}</span>
        </nav>
        <div className="flex items-center gap-4 mb-6">
          <AgentMark agent={agent} />
          <div>
            <p className="text-teal text-sm font-medium uppercase tracking-wider">{agent.maker}</p>
            <p className="text-offwhite/55 text-sm">{agent.eyebrow}</p>
          </div>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-4">{agent.title}</h1>
        <p className="text-teal text-base md:text-lg mb-4 max-w-3xl">{agent.jobLine}</p>
        <p className={`${prose} text-lg max-w-3xl mb-4`}>{agent.description}</p>
        {agent.markException && (
          <p className="text-sm text-offwhite/50 max-w-3xl mb-8 leading-relaxed">{agent.markException}</p>
        )}
        {!agent.markException && <div className="mb-8" />}
        <button
          onClick={() => onOpenModal(agent.cta, <ContactForm />)}
          className="inline-flex items-center gap-2 min-h-11 px-6 py-3 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          {agent.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14" aria-labelledby={`${agent.id}-requests`}>
        <h2 id={`${agent.id}-requests`} className={`${heading} mb-3`}>Owner requests this job can take</h2>
        <p className={`${prose} max-w-3xl mb-6`}>
          Plain requests an owner would actually say. The assistant prepares. A named human decides.
        </p>
        <BulletList items={agent.ownerRequests} />
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14 grid md:grid-cols-2 gap-8">
        <div className="border border-white/10 rounded-sm p-6 md:p-8 bg-charcoal-dark/40">
          <h2 className="text-white text-xl font-medium mb-5">What KCG configures</h2>
          <BulletList items={agent.configures} />
        </div>
        <div className="border border-white/10 rounded-sm p-6 md:p-8 bg-charcoal-dark/40">
          <h2 className="text-white text-xl font-medium mb-5">What you take away</h2>
          <BulletList items={agent.takeaways} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className={`${heading} mb-5`}>Onboarding</h2>
          <BulletList items={agent.onboarding} />
        </div>
        <div>
          <h2 className={`${heading} mb-5`}>Deliverables</h2>
          <BulletList items={agent.deliverables} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-16" aria-labelledby={`${agent.id}-connectors`}>
        <h2 id={`${agent.id}-connectors`} className={`${heading} mb-3`}>Connectors by time saved and input / output</h2>
        <p className={`${prose} max-w-3xl mb-8`}>{agent.connectorCaveat}</p>
        <div className="space-y-5">
          {agent.connectors.map((connector) => (
            <article key={connector.name} className="border border-white/10 rounded-sm p-6 md:p-8 bg-charcoal-dark/30">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-4">
                <h3 className="text-white text-lg font-medium">{connector.name}</h3>
                <span className="text-teal text-xs uppercase tracking-wider">{CONNECTOR_MODE_LABEL[connector.mode]}</span>
              </div>
              <dl className="grid gap-4 md:grid-cols-3">
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Time / rework saved</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{connector.timeRework}</dd>
                </div>
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Input</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{connector.input}</dd>
                </div>
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Output</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{connector.output}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-16" aria-labelledby={`${agent.id}-scenarios`}>
        <h2 id={`${agent.id}-scenarios`} className={`${heading} mb-3`}>Worked examples across industries</h2>
        <p className={`${prose} max-w-3xl mb-8`}>
          Each example stays inside capabilities documented by the vendor. The assistant drafts. A named human decides.
        </p>
        <div className="space-y-6">
          {agent.scenarios.map((scenario) => (
            <article key={scenario.title} className="border border-white/10 rounded-sm p-6 md:p-8 bg-charcoal-dark/30">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                <h3 className="text-white text-xl font-medium">{scenario.title}</h3>
                <span className="text-offwhite/45 text-xs uppercase tracking-wider">{scenario.industry}</span>
              </div>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Problem</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{scenario.problem}</dd>
                </div>
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Input</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{scenario.input}</dd>
                </div>
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Draft</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{scenario.draft}</dd>
                </div>
                <div>
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Human decision</dt>
                  <dd className="text-offwhite/75 text-sm leading-relaxed">{scenario.humanDecision}</dd>
                </div>
                <div className="md:col-span-2 border-t border-white/10 pt-4">
                  <dt className="text-teal text-xs uppercase tracking-wider mb-1">Business benefit</dt>
                  <dd className="text-offwhite/80 text-sm leading-relaxed">{scenario.businessBenefit}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className={`${heading} mb-4`}>Good fit</h2>
          <BulletList items={agent.fit} />
        </div>
        <div>
          <h2 className={`${heading} mb-4`}>Poor fit</h2>
          <BulletList items={agent.poorFit} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14 grid md:grid-cols-[0.9fr_1.1fr] gap-10">
        <div>
          <h2 className={`${heading} mb-4`}>Why it helps</h2>
          <p className={prose}>{agent.why}</p>
        </div>
        <div>
          <h2 className={`${heading} mb-4`}>Pilot measurement</h2>
          <BulletList items={agent.pilotMeasurement} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14">
        <h2 className={`${heading} mb-4`}>Limits</h2>
        <ul className="space-y-4 max-w-4xl">
          {agent.limits.map((item) => (
            <li key={item} className="border-t border-white/10 pt-4 text-offwhite/75 text-sm leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-14 border border-teal/25 bg-teal/[0.06] rounded-sm p-6 md:p-8">
        <div className="flex items-start gap-3 mb-3">
          <Shield className="w-5 h-5 text-teal mt-1 shrink-0" aria-hidden="true" />
          <h2 className="text-white text-2xl font-serif">Named reviewer before actions</h2>
        </div>
        <p className={`${prose} max-w-3xl`}>{agent.reviewer}</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-12 space-y-6">
        <Sources sources={agent.sources} />
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => onOpenModal(agent.cta, <ContactForm />)}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            {agent.cta}
          </button>
          <a
            href={AI_HUB_PATH}
            className="inline-flex items-center justify-center min-h-11 px-6 py-3 border border-white/20 text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Back to virtual assistants
          </a>
        </div>
      </section>
    </article>
  );
}

export default function AiAgentsPage({
  path,
  onOpenModal,
}: {
  path: string;
  onOpenModal: (title: string, content: React.ReactNode) => void;
}) {
  if (path === AI_HUB_PATH) return <HubPage onOpenModal={onOpenModal} />;
  const agent = agentByPath(path);
  if (!agent) {
    return <div className="min-h-screen flex items-center justify-center text-white pt-32">Agent page not found.</div>;
  }
  return <AgentDetailPage agent={agent} onOpenModal={onOpenModal} />;
}
