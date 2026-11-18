import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { strictAnswerQuestion } from '../../src/lib/widget/strict-grounding/answer';
import { availablePassages } from '../../src/lib/widget/strict-grounding/catalog';
import { validChatBody } from '../../src/lib/widget/strict-grounding/request';
import { sanitizeHistory } from '../../src/lib/widget/history';
import { LIMITS } from '../../src/lib/widget/limits';
import { admit } from '../../src/lib/widget/rate-limit';
import { approvedChecklist, validChecklist } from './checklist';

type Request = IncomingMessage & { body?: unknown };
const CONTACT = '/#contact';
function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex');
  res.end(JSON.stringify(data));
}
function fail(res: ServerResponse, status: number, code: string, message: string) {
  send(res,status,{status:'error',code,message,ok:false,success:false,contactHref:CONTACT});
}
function sameOrigin(req: Request) {
  const origin = req.headers.origin;
  if (typeof origin !== 'string' || typeof req.headers.host !== 'string') return false;
  try { const url = new URL(origin); return url.protocol === 'https:' && url.origin === origin && url.host === req.headers.host && req.headers['sec-fetch-site'] !== 'cross-site'; }
  catch { return false; }
}
async function body(req: Request): Promise<unknown> {
  const length = req.headers['content-length'];
  if (length !== undefined && (!/^\d+$/.test(String(length)) || Number(length) > LIMITS.bodyBytes)) throw new RangeError();
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > LIMITS.bodyBytes) throw new RangeError();
    return JSON.parse(raw);
  }
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > LIMITS.bodyBytes) throw new RangeError();
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/** Widget API dispatch. No providers, lead adapters, source readers or logs. */
export default async function handler(req: Request, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'https://internal.invalid');
  // The explicit rewrite supplies dispatch when Vercel exposes the destination URL.
  const path = url.pathname === '/api/widget'
    ? '/api/' + (url.searchParams.get('__widget_path') ?? '')
    : url.pathname;
  const known = ['/api/widget/status','/api/widget/chat','/api/widget/checklist','/api/widget/lead','/api/widget/brief','/api/contact'];
  if (!known.includes(path)) return fail(res,404,'not_found','This endpoint does not exist.');
  const method = path === '/api/widget/status' ? 'GET' : 'POST';
  if (req.method !== method) { res.setHeader('Allow',method); return fail(res,405,'method_not_allowed','Method not allowed.'); }
  if (method === 'GET') return send(res,200,{mode:'extractive',available:availablePassages().length === 254,
    hosted:{enabled:false,available:false},leadBrief:false,leadDelivery:false,contactHref:CONTACT});
  if (!sameOrigin(req)) return fail(res,403,'forbidden_origin','Requests must come from this site.');
  if (['/api/contact','/api/widget/lead','/api/widget/brief'].includes(path))
    return fail(res,503,'delivery_unavailable','Nothing was saved or sent. Use the email or phone links on our contact section to reach KCG.');
  if (typeof req.headers['content-type'] !== 'string' || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']))
    return fail(res,415,'unsupported_media_type','Send JSON.');
  if (req.headers['content-encoding'] && req.headers['content-encoding'] !== 'identity') return fail(res,415,'unsupported_encoding','Send uncompressed JSON.');
  // Vercel overwrites this header. Store only a digest, with bounded process-local lifetime.
  const ip = req.headers['x-vercel-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown';
  const admission = admit(createHash('sha256').update(String(ip).slice(0,128)).digest('hex'));
  if (admission.ok === false) { res.setHeader('Retry-After',admission.retryAfterSec); return fail(res,429,admission.reason,'Please try again later.'); }
  try {
    let raw: unknown;
    try { raw = await body(req); }
    catch (error) { return fail(res,error instanceof RangeError ? 413 : 400,'invalid_request','Send a bounded JSON request.'); }
    if (path === '/api/widget/chat') {
      if (!validChatBody(raw)) return fail(res,400,'invalid_request','Send a question and bounded chat history only.');
      const input = raw as { question: string; history?: unknown };
      return send(res,200,await strictAnswerQuestion(input.question,sanitizeHistory(input.history)));
    }
    if (!validChecklist(raw)) return fail(res,400,'invalid_request','Choose the checklist options.');
    const checklist = approvedChecklist(raw.answers);
    if (!checklist) return fail(res,503,'evidence_unavailable','Approved information is unavailable. Please use our public pages.');
    return send(res,200,checklist);
  } catch { return fail(res,503,'unavailable','The assistant is unavailable. Please use our public pages.'); }
  finally { admission.release(); }
}
