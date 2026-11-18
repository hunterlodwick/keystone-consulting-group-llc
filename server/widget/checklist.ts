import { availablePassages, CATALOG_VERSION, passageCitation } from '../../src/lib/widget/strict-grounding/catalog';
import type { ChecklistAnswers, ChecklistResult } from '../../src/lib/widget/types';
const choices: Record<string, readonly string[]> = {
  shop: ['restaurant','retail','trade','professional','other'],
  leak: ['processing','website','missed-calls','ai-ops','not-sure'],
  volume: ['','under-20k','20-100k','over-100k','not-sure'],
  google: ['','yes','weak','no','not-sure'], intake: ['','owner','staff','nobody','mixed'],
};
export function validChecklist(raw: unknown): raw is { answers: ChecklistAnswers } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).join() !== 'answers') return false;
  const a = (raw as { answers: Record<string, unknown> }).answers;
  return !!a && typeof a === 'object' && !Array.isArray(a) && Object.keys(a).every(k => Object.hasOwn(choices,k) && choices[k].includes(a[k] as string)) &&
    choices.shop.includes(a.shop as string) && choices.leak.includes(a.leak as string);
}
export function approvedChecklist(answers: ChecklistAnswers): ChecklistResult | null {
  const routes = answers.leak === 'processing' ? ['/guides/payment-processing','/services/pos-placement'] :
    answers.leak === 'website' ? ['/guides/website-scope','/guides/website-leads'] :
    answers.leak === 'missed-calls' ? ['/guides/ai-voice-agents','/guides/ai-human-handoff'] :
    answers.leak === 'ai-ops' ? ['/guides/first-automation','/guides/measure-ai-pilot'] :
    ['/guides/payment-processing','/guides/website-scope','/guides/first-automation'];
  const evidence = routes.map(route => availablePassages().find(e => e.id.startsWith('public.') && e.route === route));
  if (evidence.some(e => !e)) return null;
  return { title: 'Your starting checklist', summary: 'Review these published steps. This is not a quote, a savings promise, or a booked appointment.',
    items: evidence.map(e => ({ id:e.id,title:e.heading || e.label,detail:e.passage,href:e.href,label:e.label })),
    citations: evidence.map(passageCitation), contentVersion:CATALOG_VERSION };
}
