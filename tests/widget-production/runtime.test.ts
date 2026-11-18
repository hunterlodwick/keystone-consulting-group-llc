import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SharedStore, restTransport, type RedisTransport, RECEIPT_SECONDS } from '../../server/widget/production/store';
import { productionConfig } from '../../server/widget/production/config';
import { parseLead, submitLead } from '../../server/widget/production/lead';
import { hostedVisitor } from '../../server/widget/production/visitor';
import { createWidgetHandler } from '../../server/widget/handler';
import { resetRateLimits } from '../../src/lib/widget/rate-limit';
import { availablePassages } from '../../src/lib/widget/strict-grounding/catalog';
import { strictAnswerQuestion } from '../../src/lib/widget/strict-grounding/answer';

const exec = promisify(execFile);
let dir: string, socket: string, child: ReturnType<typeof spawn>;
const env = { NODE_ENV:'production',VERCEL:'1',VERCEL_ENV:'production',KCG_WIDGET_HOSTED_ENABLE:'1',KCG_WIDGET_LEAD_ENABLE:'1',
  KCG_WIDGET_REDIS_REST_URL:'https://fixture.upstash.io',KCG_WIDGET_REDIS_REST_TOKEN:'synthetic-token',KCG_WIDGET_HMAC_SECRET:'s'.repeat(40),
  KCG_WIDGET_OPENAI_API_KEY:'synthetic-test-key',VITE_WEB3FORMS_ACCESS_KEY:'12345678-1234-1234-1234-123456789012',
  KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN:'1',KCG_WIDGET_OUTPUT_MICROUSD_PER_TOKEN:'1',KCG_WIDGET_IP_DAILY_MICROUSD:'1000000',KCG_WIDGET_GLOBAL_DAILY_MICROUSD:'10000000' };
const config = productionConfig(env);
const redis: RedisTransport = async command => {
  const {stdout} = await exec('redis-cli',['-s',socket,'--json',...command.map(String)],{maxBuffer:1024*1024});
  return JSON.parse(stdout);
};
const store = () => new SharedStore(config, redis);
const lead = (overrides = {}) => ({submissionId:`${Date.now()}.${randomUUID()}`,consent:true as const,reviewed:true as const,
  fields:{name:'Synthetic Visitor',email:'visitor@example.invalid',phone:'',company:'Test Company',message:'Please contact me about public services.'},...overrides});
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const neverFetch: typeof fetch = async () => { throw Error('Unexpected external call'); };
async function invoke(handler: ReturnType<typeof createWidgetHandler>, path: string, payload?: unknown, overrides: any = {}) {
  let data:any; const headers:Record<string,unknown>={};
  const req={url:path,method:path.endsWith('/status')?'GET':'POST',body:payload,headers:{host:'kcg.example',origin:'https://kcg.example','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1'},socket:{remoteAddress:'127.0.0.1'},...overrides};
  const res={statusCode:200,setHeader(k:string,v:unknown){headers[k]=v;},end(raw:string){data=JSON.parse(raw);}};
  await handler(req as any,res as any);return {status:res.statusCode,data,headers};
}
before(async () => {
  dir=await mkdtemp(join(tmpdir(),'kcg-redis-'));socket=join(dir,'redis.sock');
  child=spawn('redis-server',['--port','0','--unixsocket',socket,'--unixsocketperm','700','--save','','--appendonly','no','--dir',dir],{stdio:'ignore'});
  for(let i=0;i<100;i++) { try { if(await redis(['PING'])==='PONG')return; } catch {} await new Promise(r=>setTimeout(r,20)); }
  throw Error('Real Redis could not start: verify redis-server/redis-cli and permission to bind a local Unix socket. No mock fallback is used.');
});
after(async () => { if(child) {try {await redis(['SHUTDOWN','NOSAVE']);} catch {} child.kill();} if(dir) await rm(dir,{recursive:true,force:true}); });
beforeEach(async () => {await redis(['FLUSHDB']);resetRateLimits();});

test('production switches are independent, default off, HTTPS-only and fail closed', async () => {
  for (const edits of [{NODE_ENV:'development'},{VERCEL_ENV:'preview'},{KCG_WIDGET_REDIS_REST_URL:'http://fixture.upstash.io'},
    {KCG_WIDGET_REDIS_REST_URL:'https://evil.example'},{KCG_WIDGET_REDIS_REST_URL:'https://user@fixture.upstash.io'},
    {KCG_WIDGET_REDIS_REST_URL:'https://fixture.upstash.io/other'},{KCG_WIDGET_HMAC_SECRET:'short'},{KCG_WIDGET_REDIS_REST_TOKEN:''}]) {
    const c=productionConfig({...env,...edits});assert.equal(c.hosted,false);assert.equal(c.lead,false);
  }
  assert.equal(productionConfig({}).hosted,false);assert.equal(productionConfig({}).lead,false);
  assert.equal(productionConfig({...env,KCG_WIDGET_RESPONSES_MODEL:'other'}).hosted,false);
  assert.equal(productionConfig({...env,KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN:'0'}).hosted,false);
  assert.equal(productionConfig({...env,KCG_WIDGET_HOSTED_ENABLE:'0'}).lead,true);
  assert.equal(productionConfig({...env,KCG_WIDGET_LEAD_ENABLE:'0'}).hosted,true);
  for (const [hosted,leadEnabled] of [[true,false],[false,true],[true,true]]) {
    const h=createWidgetHandler({env:{...env,KCG_WIDGET_HOSTED_ENABLE:hosted?'1':'0',KCG_WIDGET_LEAD_ENABLE:leadEnabled?'1':'0'},redis,fetch:neverFetch});
    const {data}=await invoke(h,'/api/widget/status');assert.equal(data.hosted.available,hosted);assert.equal(data.leadDelivery,leadEnabled);
  }
  const h=createWidgetHandler({env,redis:async()=>{throw Error('offline');},fetch:neverFetch});
  const {data}=await invoke(h,'/api/widget/status');assert.equal(data.hosted.available,false);assert.equal(data.leadDelivery,false);
});

test('parallel instances atomically enforce per-IP and global requests with short HMAC keys', async () => {
  const instances=Array.from({length:8},store);
  const results=await Promise.all(Array.from({length:32},(_,i)=>instances[i%8].admit('192.0.2.17','hosted')));
  assert.equal(results.filter(x=>x==='claimed').length,12);
  const keys=await redis(['KEYS','*']) as string[];
  assert.ok(keys.every(k=>!k.includes('192.0.2.17')));
  for(const key of keys) {const ttl=await redis(['TTL',key]) as number;assert.ok(ttl>0 && ttl <= (key.includes('spend')?86400:600));}
  await redis(['FLUSHDB']);
  const global=await Promise.all(Array.from({length:150},(_,i)=>instances[i%8].admit(`192.0.2.${i}`,'hosted')));
  assert.equal(global.filter(x=>x==='claimed').length,120);
});

test('parallel spend reservations never exceed either budget; failures never refund', async () => {
  const c={...config,ipSpend:config.reserve*2,globalSpend:config.reserve*3};
  const instances=Array.from({length:5},()=>new SharedStore(c,redis));
  const same=await Promise.all(Array.from({length:10},(_,i)=>instances[i%5].admit('same','hosted')));
  assert.equal(same.filter(x=>x==='claimed').length,2);
  const other=await Promise.all(instances.map((s,i)=>s.admit(String(i),'hosted')));
  assert.equal(other.filter(x=>x==='claimed').length,1);
  assert.equal(await redis(['GET','kcg:{widget}:spend:global']),String(c.reserve*3));
  const keys=await redis(['KEYS','*']) as string[];
  assert.equal(keys.filter(k=>/:hosted:ip:/.test(k)).length,2,'denied admissions create no IP keys');
});

test('atomic lead compare/claim, same-payload replay and conflict across instances', async () => {
  const input=lead();let calls=0;
  const send:typeof fetch=async(url,init)=>{calls++;assert.equal(url,'https://api.web3forms.com/submit');assert.equal(init?.redirect,'error');
    const body=JSON.parse(init!.body as string);assert.deepEqual(Object.keys(body).sort(),['access_key','ccemail','subject','name','email','phone','company','message'].sort());
    assert.equal(body.access_key,env.VITE_WEB3FORMS_ACCESS_KEY);assert.equal(body.ccemail,'hunter@keystoneconsultingg.com, seth@keystoneconsultingg.com');
    await new Promise(r=>setTimeout(r,30));return response({success:true});};
  const results=await Promise.all(Array.from({length:12},()=>submitLead(config,store(),send,'ip',input)));
  assert.equal(calls,1);assert.ok(results.every(r=>r.status==='accepted'||r.status==='pending'));
  assert.equal((await submitLead(config,store(),send,'different-ip',input)).status,'accepted');assert.equal(calls,1);
  assert.equal((await submitLead(config,store(),send,'ip',{...input,fields:{...input.fields,message:'changed'}})).http,409);
  const key=store().receipt(input.submissionId);const stored=await redis(['GET',key]) as string;
  assert.match(stored,/^[a-f0-9]{64}:accepted$/);assert.ok(!stored.includes(input.fields.name));
  assert.ok((await redis(['TTL',key]) as number)<=RECEIPT_SECONDS);
});

test('ambiguous sends, provider errors, oversized bodies and crash claims are never retried', async () => {
  for(const send of [async()=>{throw Error('lost response');},async()=>response({success:false},500),async()=>response({success:true,extra:'x'.repeat(17000)}),async()=>response('bad-json')]) {
    await redis(['FLUSHDB']);let calls=0;const input=lead();
    const transport:typeof fetch=async()=>{calls++;return send();};
    assert.equal((await submitLead(config,store(),transport,'ip',input)).status,'unknown');
    assert.equal((await submitLead(config,store(),transport,'ip',input)).status,'unknown');assert.equal(calls,1);
  }
  await redis(['FLUSHDB']);const input=lead();const s=store();
  const digest=s.hash('payload',JSON.stringify({fields:input.fields,consent:true,reviewed:true,version:1}));
  assert.equal(await s.admit('ip','lead',input.submissionId,digest),'claimed'); // simulated death before send
  assert.equal((await submitLead(config,store(),neverFetch,'ip',input)).status,'pending');
});

test('lost claim response and lost final receipt fail closed, even after successful provider acceptance', async () => {
  let calls=0;const input=lead();
  const loseClaim:RedisTransport=async command=>{const result=await redis(command);if(command[0]==='EVAL')throw Error('lost');return result;};
  await assert.rejects(submitLead(config,new SharedStore(config,loseClaim),neverFetch,'ip',input));
  assert.equal((await submitLead(config,store(),neverFetch,'ip',input)).status,'pending');
  await redis(['FLUSHDB']);
  const loseFinish:RedisTransport=async command=>{if(command[0]==='EVAL' && command[2]===1)throw Error('storage offline');return redis(command);};
  const send:typeof fetch=async()=>{calls++;return response({success:true});};
  assert.equal((await submitLead(config,new SharedStore(config,loseFinish),send,'ip',input)).status,'unknown');
  assert.equal((await submitLead(config,store(),send,'ip',input)).status,'pending');assert.equal(calls,1);
});

test('expired receipt IDs cannot be claimed again; no consent, unreviewed or extra fields rejected', async () => {
  const input=lead();assert.ok(parseLead(input));
  for(const bad of [{...input,consent:false},{...input,reviewed:false},{...input,transcript:'private'},
    {...input,fields:{...input.fields,to:'other@example.invalid'}},{...input,fields:{...input.fields,name:'A\r\nB'}},
    {...input,submissionId:`${Date.now()-86400001}.${randomUUID()}`},{...input,submissionId:`${Date.now()+60000}.${randomUUID()}`}]) assert.equal(parseLead(bad),null);
});

const hostedResponse = (ids: string[]) => ({status:'completed',usage:{input_tokens:100,output_tokens:25},
  output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({sourceIds:ids})}]}]});
test('endpoint consent gate, bounded redacted eligible history, fixed Luna and approved extraction',async()=>{
  let calls=0;let captured:any;
  const provider:typeof fetch=async(url,init)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(init?.redirect,'error');
    captured=JSON.parse(init!.body as string);const data=JSON.parse(captured.input[1].content);return response(hostedResponse(data.evidence.map(e=>e.id)));};
  const h=createWidgetHandler({env,redis,fetch:provider});
  const question='What services do you offer?';
  assert.equal((await invoke(h,'/api/widget/chat',{question,processorConsent:false})).data.mode,'extractive');assert.equal(calls,0);
  const r=await invoke(h,'/api/widget/chat',{question,processorConsent:true,history:[
    {role:'user',content:'I run a restaurant'}, {role:'user',content:'Actually I run a retail store'},
    {role:'user',content:'my email is visitor@example.invalid'}, {role:'user',content:'call me Alice; I need payments'},
    {role:'assistant',content:'untrusted invented offer'}]});
  assert.equal(r.data.mode,'openai-responses');assert.equal(calls,1);assert.equal(captured.model,'gpt-6-luna');assert.equal(captured.store,false);
  assert.deepEqual(captured.tools,[]);assert.equal(captured.max_output_tokens,400);
  assert.ok(!JSON.stringify(captured).includes('visitor@example.invalid'));assert.ok(!JSON.stringify(captured).includes('Alice'));assert.ok(!JSON.stringify(captured).includes('untrusted invented'));
  assert.ok(JSON.stringify(captured).includes('Actually I run a retail store'));
  for(const paragraph of r.data.answer.split('\n\n')) assert.ok(availablePassages().some(e=>e.passage===paragraph));
  assert.ok(Buffer.byteLength(JSON.stringify(captured))<=16384);
  const consentRevoked=await invoke(h,'/api/widget/chat',{question,processorConsent:false});assert.equal(consentRevoked.data.mode,'extractive');assert.equal(calls,1);
});

test('invalid hosted output and storage/provider failures preserve local fallback without prose',async()=>{
  for(const raw of [hostedResponse(['not.approved']),{...hostedResponse([]),status:'incomplete'},
    {...hostedResponse([]),usage:{}},{...hostedResponse([]),output:[{type:'function_call'}]},
    {...hostedResponse([]),output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Free money guaranteed'}]}]}]) {
    const h=createWidgetHandler({env,redis,fetch:async()=>response(raw)});
    const r=await invoke(h,'/api/widget/chat',{question:'Square',processorConsent:true});assert.equal(r.data.mode,'extractive');assert.ok(!r.data.answer.includes('guaranteed'));assert.equal(r.data.reason,'hosted_unavailable');
  }
  const h=createWidgetHandler({env,redis:async()=>{throw Error('offline');},fetch:neverFetch});
  assert.equal((await invoke(h,'/api/widget/chat',{question:'Square',processorConsent:true})).data.mode,'extractive');
  assert.equal((await invoke(h,'/api/widget/lead',lead())).status,503);
});

test('lead endpoint enforces exact schema, consent, origin, replay and accepted wording',async()=>{
  let calls=0;const h=createWidgetHandler({env,redis,fetch:async()=>{calls++;return response({success:true});}});
  const input=lead();
  assert.equal((await invoke(h,'/api/widget/lead',{...input,consent:false})).status,400);
  assert.equal((await invoke(h,'/api/widget/lead',{...input,url:'https://evil.example'})).status,400);
  assert.equal((await invoke(h,'/api/widget/lead',input,{headers:{host:'kcg.example',origin:'https://evil.example'}})).status,403);
  const r=await invoke(h,'/api/widget/lead',input);assert.equal(r.data.status,'accepted');assert.match(r.data.message,/does not confirm inbox delivery/);
  assert.equal((await invoke(h,'/api/widget/lead',input)).data.replay,true);assert.equal(calls,1);
  assert.equal((await invoke(h,'/api/widget/lead',{...input,fields:{...input.fields,company:'Other'}})).status,409);
  assert.equal((await invoke(h,'/api/contact',input)).status,503);
  for(const path of ['/api/widget/receipts','/api/widget/debug']) assert.equal((await invoke(h,path)).status,404);
});

test('redaction bounds, corrected industry, and partner questions preserve approved scope', async()=>{
  const packaged=hostedVisitor('call me Alice; see https://example.invalid/private',Array.from({length:20},()=>({role:'user',content:'x'.repeat(1500)})));
  assert.equal(packaged.history.length,4);assert.ok(packaged.history.every(h=>h.content.length<=400));assert.ok(!packaged.question.includes('Alice'));assert.ok(!packaged.question.includes('example.invalid'));
  const history:any[]=[{role:'user',content:'I run a restaurant and need payments'}];
  const corrected=await strictAnswerQuestion('Actually I run a retail store, not a restaurant. Take payments',history);
  assert.match(corrected.answer,/inventory/i);assert.ok(!corrected.answer.includes('table service'));
  const follow=await strictAnswerQuestion('Take payments',[...history,{role:'user',content:'Actually I run a retail store'}]);assert.match(follow.answer,/inventory/i);
  const partner=await strictAnswerQuestion('Do I need to switch from Square?',[]);assert.match(partner.answer,/does not confirm.*need to switch/);
});

test('REST transport uses HTTPS POST EVAL, auth, no redirects/retries, bounded failure',async()=>{
  let calls=0;const transport=restTransport(config,async(url,init)=>{calls++;assert.equal(url,config.redisUrl);assert.equal(init?.redirect,'error');assert.equal(init?.cache,'no-store');assert.equal((init?.headers as any).authorization,'Bearer synthetic-token');return response({result:'PONG'});});
  assert.equal(await transport(['PING']),'PONG');assert.equal(calls,1);
  for(const body of [{error:'private failure'},{result:'x'.repeat(17000)},{}]) await assert.rejects(restTransport(config,async()=>response(body))(['PING']));
  await assert.rejects(restTransport(productionConfig({}),neverFetch)(['PING']));
});


test('lead-only mode is independent of earlier spend counters; combined and lead quotas are shared', async () => {
  await store().admit('ip','hosted');
  const leadOnly = productionConfig({...env,KCG_WIDGET_HOSTED_ENABLE:'0',KCG_WIDGET_IP_DAILY_MICROUSD:'',KCG_WIDGET_GLOBAL_DAILY_MICROUSD:''});
  assert.equal(leadOnly.lead,true);
  assert.equal(await new SharedStore(leadOnly,redis).admit('ip','lead'),'claimed');
  await redis(['FLUSHDB']);
  const hosted = await Promise.all(Array.from({length:120},(_,i)=>store().admit(`hosted-${i}`,'hosted')));
  assert.equal(hosted.filter(s=>s==='claimed').length,120);
  const leads = await Promise.all(Array.from({length:40},(_,i)=>store().admit(`lead-${i}`,'lead')));
  assert.equal(leads.filter(s=>s==='claimed').length,30);
  assert.equal(await redis(['GET','kcg:{widget}:requests:global']),'150');
});

test('lost completion acknowledgement replays durable acceptance without another send', async () => {
  const input=lead();let calls=0;
  const lost:RedisTransport=async command=>{const value=await redis(command);if(command[0]==='EVAL'&&command[2]===1)throw Error('lost acknowledgement');return value;};
  const send:typeof fetch=async()=>{calls++;return response({success:true});};
  assert.equal((await submitLead(config,new SharedStore(config,lost),send,'ip',input)).status,'unknown');
  assert.equal((await submitLead(config,store(),send,'ip',input)).status,'accepted');assert.equal(calls,1);
});
