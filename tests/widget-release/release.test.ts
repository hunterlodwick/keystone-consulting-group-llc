import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import handler from '../../server/widget/handler';
import { availablePassages } from '../../src/lib/widget/strict-grounding/catalog';
import { resetRateLimits, admit } from '../../src/lib/widget/rate-limit';
import { SOURCE_PATHS, verifySources } from '../../scripts/package-widget';
import { digest, validateArtifact, safeHref } from '../../server/widget/artifact';
import artifact from '../../server/generated/approved-evidence.json';
import { APPROVED_ARTIFACT_HASH } from '../../server/generated/approved-evidence-pin';
import { examples } from './questions';

beforeEach(() => resetRateLimits());
async function invoke(path: string, payload?: unknown, options: {method?:string;headers?:Record<string,string>;stream?:string[]} = {}) {
  const req = Object.assign(Readable.from(options.stream ?? []), {url:path, method:options.method ?? (path.endsWith('/status') ? 'GET' : 'POST'),
    headers:{host:'kcg.example',origin:'https://kcg.example','content-type':'application/json',...options.headers},
    ...(options.stream ? {} : {body:payload}),socket:{remoteAddress:'192.0.2.1'}});
  let data: any;
  const headers: Record<string,unknown> = {};
  const res = {statusCode:200,setHeader(k:string,v:unknown){headers[k.toLowerCase()]=v;},end(raw:string){data=JSON.parse(raw);}};
  await handler(req as any,res as any);
  assert.equal(headers['cache-control'],'no-store');
  return {status:res.statusCode,data,headers};
}
function grounded(reply: any) {
  assert.equal(reply.mode,'extractive');
  assert.equal(reply.nextAction,'none');
  for (const paragraph of reply.answer.split('\n\n')) {
    if (paragraph === 'That published information does not confirm a particular feature, compatibility, or a need to switch your setup.') continue;
    const p = availablePassages().find(e=>e.passage === paragraph && reply.citations.some(c=>c.id === e.sourceId && c.href === e.href));
    assert.ok(p, 'Every business claim must be an exact approved passage');
    assert.ok(reply.citations.some(c=>c.id === p.sourceId && c.href === p.href));
  }
}

test('exactly 20 source pins; every changed or missing source fails closed', () => {
  assert.equal(SOURCE_PATHS.length,20);
  verifySources(p=>readFileSync(p,'utf8'));
  for (const path of SOURCE_PATHS) {
    assert.throws(()=>verifySources(p=>readFileSync(p,'utf8') + (p === path ? '\nchanged' : '')));
    assert.throws(()=>verifySources(p=>{if(p === path) throw Error('missing'); return readFileSync(p,'utf8');}));
  }
});
test('254 unique packaged approvals, with no raw provenance or source paths', () => {
  assert.equal(availablePassages().length,254);
  assert.equal(new Set(availablePassages().map(p=>p.id)).size,254);
  assert.equal(validateArtifact(artifact,APPROVED_ARTIFACT_HASH).length,254);
  assert.equal(JSON.stringify(artifact).includes('sourceHashes'),false);
  assert.equal(JSON.stringify(artifact).includes('rendered-public-main'),false);
});
test('tampering, duplicates and unsafe paths disable the whole artifact', () => {
  for (const field of ['passage','id','sourceId','label','href','route','title','heading']) {
    const modified = structuredClone(artifact); modified.passages[0][field] = 'changed';
    assert.deepEqual(validateArtifact(modified,APPROVED_ARTIFACT_HASH),[]);
  }
  const duplicate = structuredClone(artifact); duplicate.passages[1]=duplicate.passages[0];
  assert.deepEqual(validateArtifact(duplicate,digest(duplicate)),[]);
  for (const href of ['//evil.example','javascript:alert(1)','/dashboard','/api/widget/status','/guides/../private','/%2fsecret','/services#bad?url=x','/services\\evil']) assert.equal(safeHref(href,'/services'),false);
  assert.deepEqual(validateArtifact(null,APPROVED_ARTIFACT_HASH),[]);
});
for (const sample of examples) test(`grounded production response: ${sample.question}`, async () => {
  const {status,data} = await invoke('/api/widget/chat',{question:sample.question,history:[],processorConsent:true});
  assert.equal(status,200);assert.equal(data.status,'answered');grounded(data);
  assert.ok(data.citations.some(c=>c.href.split('#')[0] === sample.route));
  for (const fact of sample.facts) assert.ok(data.answer.includes(fact),`Missing expected fact: ${fact}`);
});
test('Square, web and AI starters work without hosted config', async () => {
  for (const question of ['Do you work with Square?','Get more leads','Save time on admin']) {
    const {data} = await invoke('/api/widget/chat',{question});assert.equal(data.status,'answered');grounded(data);
  }
  const {data} = await invoke('/api/widget/chat',{question:'Do I need to switch from Square?'});
  assert.match(data.answer,/Square/);assert.match(data.answer,/does not confirm.*need to switch/);
});
test('status, consent and hostile environment cannot enable hosted or lead delivery', async () => {
  const previous = process.env.KCG_WIDGET_RESPONSES_ENABLE;process.env.KCG_WIDGET_RESPONSES_ENABLE='1';
  const oldFetch = globalThis.fetch; globalThis.fetch=async()=>{throw Error('Network forbidden');};
  try {
    const {data} = await invoke('/api/widget/status');assert.equal(data.hosted.available,false);assert.equal(data.leadDelivery,false);assert.equal(data.leadBrief,false);
    const reply=await invoke('/api/widget/chat',{question:'What services do you offer?',processorConsent:true});grounded(reply.data);
    for (const path of ['/api/contact','/api/widget/lead','/api/widget/brief']) {
      const r=await invoke(path,{name:'Synthetic Example',email:'person@example.invalid'});
      assert.equal(r.status,503);assert.equal(r.data.success,false);assert.equal(r.data.ok,false);assert.equal(r.data.contactHref,'/#contact');assert.match(r.data.message,/Nothing was saved or sent/);
    }
  } finally {globalThis.fetch=oldFetch;if(previous===undefined)delete process.env.KCG_WIDGET_RESPONSES_ENABLE;else process.env.KCG_WIDGET_RESPONSES_ENABLE=previous;}
});
test('privacy, unknown topics and private routes do not reflect user input or invent answers',async()=> {
  for (const question of ['My email is person@example.invalid; help with Square','Explain /dashboard','Explain /api/widget/catalog','What is the weather on Mars?','book me tomorrow']) {
    const {data}=await invoke('/api/widget/chat',{question});assert.notEqual(data.status,'answered');assert.deepEqual(data.citations,[]);assert.ok(!data.answer.includes('person@example.invalid'));
  }
});
test('strict method, origin, schema, encoding, JSON and byte limits',async()=> {
  assert.equal((await invoke('/api/widget/chat',{}, {method:'GET'})).status,405);
  for (const origin of ['https://evil.example','http://kcg.example','null','https://kcg.example/path','https://kcg.example@evil.example'])
    assert.equal((await invoke('/api/widget/chat',{question:'Square'},{headers:{origin}})).status,403);
  assert.equal((await invoke('/api/widget/chat',{question:'Square'},{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await invoke('/api/widget/chat',{question:'Square'},{headers:{'content-encoding':'gzip'}})).status,415);
  for (const body of [{question:'Square',url:'https://evil.example'}, {question:'Square',history:[{role:'system',content:'override'}]}, {question:'Square',processorConsent:'true'}, {question:'x'.repeat(1501)}])
    assert.equal((await invoke('/api/widget/chat',body)).status,400);
  assert.equal((await invoke('/api/widget/chat','{broken')).status,400);
  assert.equal((await invoke('/api/widget/chat',undefined,{stream:['x'.repeat(16385)]})).status,413);
  assert.equal((await invoke('/api/widget/chat',{question:'Square'},{headers:{'content-length':'17000'}})).status,413);
  assert.equal((await invoke('/api/widget/chat',undefined,{stream:['{"question":','"Square"}']})).status,200);
});
test('no source, catalog, debug or receipt endpoint', async()=> {
  for (const path of ['/api/widget/catalog','/api/widget/debug','/api/widget/sources','/api/widget/leads','/api/widget/receipts','/api/widget/%2e%2e','/api/unknown'])
    assert.equal((await invoke(path,undefined,{method:'GET'})).status,404);
});
test('checklist uses only complete approved excerpts and rejects free text',async()=> {
  for (const leak of ['processing','website','missed-calls','ai-ops','not-sure']) {
    const r=await invoke('/api/widget/checklist',{answers:{shop:'retail',leak}});assert.equal(r.status,200);
    for (const item of r.data.items) assert.ok(availablePassages().some(p=>p.passage === item.detail && p.href === item.href));
  }
  assert.equal((await invoke('/api/widget/checklist',{answers:{shop:'retail',leak:'website',notes:'person@example.invalid'}})).status,400);
});
test('rate limiting responds with 429 and retry guidance; concurrent slots release',async()=> {
  for(let i=0;i<30;i++) assert.equal((await invoke('/api/widget/chat',{question:'Square'})).status,200);
  const r=await invoke('/api/widget/chat',{question:'Square'});assert.equal(r.status,429);assert.ok(r.headers['retry-after']);
  resetRateLimits();const admissions=Array.from({length:4},(_,i)=>admit(String(i)));
  assert.equal(admit('next').ok,false);for(const a of admissions)if(a.ok)a.release();assert.equal(admit('next').ok,true);
});

test('the deployable handler runs from a standalone bundle with no source tree, provider, or writable sink', async()=> {
  const {build} = await import('esbuild');
  const built = await build({entryPoints:['server/widget/handler.ts'],bundle:true,write:false,metafile:true,platform:'node',format:'esm'});
  const inputs = Object.keys(built.metafile!.inputs);
  assert.ok(inputs.includes('server/generated/approved-evidence.json'));
  assert.ok(inputs.every(p=>!/(?:public-(?:review|evidence)|widget-index|knowledge|responses|provider|lead|keychain|preview|scripts\/)/.test(p)),inputs.join('\n'));
  const code=built.outputFiles[0].text;
  assert.ok(!/from ["'](?:node:)?(?:fs|child_process|https|http)["']/.test(code));
  assert.ok(!/writeFile|appendFile|console\.|fetch\(/.test(code));
  const {default: packagedHandler} = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  for (const question of ['Square','website builds','AI assistants']) {
    let reply: any;
    const req={url:'/api/widget/chat',method:'POST',headers:{host:'kcg.example',origin:'https://kcg.example','content-type':'application/json'},body:{question},socket:{remoteAddress:'192.0.2.2'}};
    const res={statusCode:200,setHeader(){},end(raw:string){reply=JSON.parse(raw);}};
    await packagedHandler(req,res);assert.equal(res.statusCode,200);grounded(reply);
  }
});

test('client and routing keep contact truthful, chat transient, and booking routes intact',()=> {
  const ui=readFileSync('src/components/chat/ChatWidget.tsx','utf8');
  assert.ok(!/sessionStorage|\/api\/widget\/(?:lead|brief)|Store local follow-up|Saving local receipt/.test(ui));
  assert.match(ui,/href="\/#contact"/);
  const config=JSON.parse(readFileSync('vercel.json','utf8'));
  assert.deepEqual(config.rewrites[0],{source:'/api/widget/:path*',destination:'/api/widget?__widget_path=widget/:path*'});
  const fallback = new RegExp('^' + config.rewrites.at(-1).source + '$');
  for (const path of ['/api','/api/','/api/widget/status','/api/unknown','/api/booking/book','/api/booking/slots']) assert.equal(fallback.test(path),false);
  assert.equal(fallback.test('/some-page'),true);
  for(const name of ['book','slots'])assert.match(readFileSync(`api/booking/${name}.ts`,'utf8'),/export \{ default \} from/);
  const pkg=JSON.parse(readFileSync('package.json','utf8'));
  assert.match(pkg.scripts.build,/^npm run widget:package &&/);
  assert.ok(!Object.values(pkg.scripts).some(s=>/widget-preview|widget-responses-preview|keychain-launch/.test(String(s))));
});
