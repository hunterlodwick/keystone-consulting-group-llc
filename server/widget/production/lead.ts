import type { ProductionConfig } from './config';
import { SharedStore } from './store';
import { deadline } from './deadline';
import { readBoundedResponse } from '../../../src/lib/widget/strict-grounding/http-transport';

export const CONTACT_FIELDS = ['name', 'email', 'phone', 'company', 'message'] as const;
export type ContactFields = Record<typeof CONTACT_FIELDS[number], string>;
export type LeadInput = { submissionId: string; consent: true; reviewed: true; fields: ContactFields };
export function parseLead(raw: unknown, now = Date.now()): LeadInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as any;
  if (Object.keys(o).sort().join(',') !== 'consent,fields,reviewed,submissionId' || o.consent !== true || o.reviewed !== true) return null;
  if (typeof o.submissionId !== 'string' || !/^\d{13}\.[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(o.submissionId)) return null;
  const issued = Number(o.submissionId.slice(0,13));
  // Old IDs can NEVER become a new claim after the receipt expires.
  if (issued > now + 30000 || issued < now - 86400000) return null;
  if (!o.fields || typeof o.fields !== 'object' || Array.isArray(o.fields) || Object.keys(o.fields).sort().join(',') !== [...CONTACT_FIELDS].sort().join(',')) return null;
  const bounds = {name:100,email:254,phone:32,company:120,message:1500};
  const fields = {} as ContactFields;
  for (const key of CONTACT_FIELDS) {
    if (typeof o.fields[key] !== 'string' || o.fields[key].length > bounds[key] || /[\u0000-\u001f\u007f]/.test(o.fields[key])) return null;
    fields[key] = o.fields[key].trim();
  }
  if (!fields.name || !fields.message || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}$/i.test(fields.email) || (fields.phone && !/^[+\d ().-]{7,32}$/.test(fields.phone))) return null;
  return {submissionId:o.submissionId,consent:true,reviewed:true,fields};
}
const messages = {
  accepted: 'Web3Forms accepted your request for KCG. This does not confirm inbox delivery.',
  unknown: 'Acceptance could not be confirmed. Do not resubmit. Use the contact links to check with KCG.',
  pending: 'This request was already claimed. Acceptance is unconfirmed; it will not be sent again.',
  conflict: 'This submission ID belongs to different reviewed fields. Nothing else was sent.',
  limited: 'Follow-up is temporarily limited. Nothing was sent. Use the contact links.',
};
export async function submitLead(config: ProductionConfig, store: SharedStore, run: typeof fetch, ip: string, input: LeadInput) {
  if (!config.lead) throw Error('Lead unavailable');
  const digest = store.hash('payload', JSON.stringify({fields:input.fields,consent:true,reviewed:true,version:1}));
  const state = await store.admit(ip, 'lead', input.submissionId, digest);
  if (state !== 'claimed') return {http:state === 'conflict' ? 409 : state === 'limited' ? 429 : state === 'accepted' ? 200 : 202,
    status:state, replay:true, message:messages[state], accepted:state === 'accepted'};
  // After this durable claim, every failure (including process death) is terminal.
  let outcome: 'accepted' | 'unknown' = 'unknown';
  try {
    outcome = await deadline(10000, async signal => {
      const response = await run('https://api.web3forms.com/submit', {method:'POST',redirect:'error',credentials:'omit',cache:'no-store',
        signal, headers:{'content-type':'application/json',Accept:'application/json'},
        body:JSON.stringify({access_key:config.contactKey,
          ccemail:'hunter@keystoneconsultingg.com, seth@keystoneconsultingg.com',subject:'New Contact Request - Keystone Consulting',...input.fields})});
      if (response.ok) {
        const data = await readBoundedResponse(response) as any;
        if (data?.success === true) return 'accepted' as const;
      } else await response.body?.cancel();
      return 'unknown' as const;
    });
  } catch { /* Neither timeout nor ambiguous failure permits a retry. */ }
  try { await store.finish(input.submissionId, digest, outcome); }
  catch { outcome = 'unknown'; }
  return {http:outcome === 'accepted' ? 200 : 202,status:outcome,replay:false,message:messages[outcome],accepted:outcome === 'accepted'};
}
