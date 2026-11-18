/** Endpoint/adapter tests with explicitly scripted transports. These do NOT replace the real Redis suite. */
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createWidgetHandler} from '../../server/widget/handler';
import {resetRateLimits} from '../../src/lib/widget/rate-limit';
import {productionConfig} from '../../server/widget/production/config';
import {SharedStore, restTransport} from '../../server/widget/production/store';
import {parseLead,submitLead} from '../../server/widget/production/lead';
import {hostedVisitor} from '../../server/widget/production/visitor';
import {deadline} from '../../server/widget/production/deadline';
import {strictAnswerQuestion} from '../../src/lib/widget/strict-grounding/answer';
import {availablePassages} from '../../src/lib/widget/strict-grounding/catalog';
const env={NODE_ENV:'production',VERCEL:'1',VERCEL_ENV:'production',KCG_WIDGET_HOSTED_ENABLE:'1',KCG_WIDGET_LEAD_ENABLE:'1',KCG_WIDGET_REDIS_REST_URL:'https://fixture.upstash.io',KCG_WIDGET_REDIS_REST_TOKEN:'test-only',KCG_WIDGET_HMAC_SECRET:'x'.repeat(40),KCG_WIDGET_OPENAI_API_KEY:'test-only',VITE_WEB3FORMS_ACCESS_KEY:'12345678-1234-1234-1234-123456789012',KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN:'1',KCG_WIDGET_OUTPUT_MICROUSD_PER_TOKEN:'1',KCG_WIDGET_IP_DAILY_MICROUSD:'1000000',KCG_WIDGET_GLOBAL_DAILY_MICROUSD:'10000000'};
const config=productionConfig(env);
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status});
const lead=()=>({submissionId:`${Date.now()}.${randomUUID()}`,consent:true as const,reviewed:true as const,fields:{name:'Synthetic Visitor',email:'person@example.invalid',phone:'',company:'Example',message:'Public service question'}});
const scriptedAdmission=async(c:any[])=>c[0]==='PING'?'PONG':c[2]===1?1:'claimed';
const noFetch:typeof fetch=async()=>{assert.fail('No external call permitted');};
async function invoke(h:ReturnType<typeof createWidgetHandler>,path:string,body?:unknown,extra:any={}) {
  let data:any;const headers:any={};const res={statusCode:200,setHeader(k:string,v:unknown){headers[k]=v;},end(s:string){data=JSON.parse(s);}};
  await h({url:path,method:path.endsWith('/status')?'GET':'POST',body,headers:{host:'test.example',origin:'https://test.example','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1'},socket:{remoteAddress:'127.0.0.1'},...extra} as any,res as any);
  return {data,status:res.statusCode,headers};
}
beforeEach(()=>resetRateLimits());
test('all activation dependencies fail closed and independent capabilities remain distinct',async()=>{
  for(const delta of [{NODE_ENV:'development'},{VERCEL_ENV:'preview'},{VERCEL:'0'},{KCG_WIDGET_REDIS_REST_TOKEN:''},{KCG_WIDGET_HMAC_SECRET:'short'},
    ...['http://fixture.upstash.io','https://evil.example','https://x@fixture.upstash.io','https://fixture.upstash.io/path','https://fixture.upstash.io?x=y'].map(KCG_WIDGET_REDIS_REST_URL=>({KCG_WIDGET_REDIS_REST_URL}))]) {
    const c=productionConfig({...env,...delta});assert.equal(c.hosted,false);assert.equal(c.lead,false);
  }
  for(const key of ['KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN','KCG_WIDGET_OUTPUT_MICROUSD_PER_TOKEN','KCG_WIDGET_IP_DAILY_MICROUSD','KCG_WIDGET_GLOBAL_DAILY_MICROUSD']) for(const value of ['','-1','NaN','1e9','99999999999999999']) assert.equal(productionConfig({...env,[key]:value}).hosted,false);
  assert.equal(productionConfig({}).hosted,false);assert.equal(productionConfig({}).lead,false);
  for(const [hosted,leadEnabled] of [[true,false],[false,true],[true,true]]) {
    const h=createWidgetHandler({env:{...env,KCG_WIDGET_HOSTED_ENABLE:hosted?'1':'0',KCG_WIDGET_LEAD_ENABLE:leadEnabled?'1':'0'},redis:scriptedAdmission,fetch:noFetch});
    const r=await invoke(h,'/api/widget/status');assert.equal(r.data.hosted.available,hosted);assert.equal(r.data.leadDelivery,leadEnabled);
  }
  const h=createWidgetHandler({env,redis:async()=>{throw Error('offline');},fetch:noFetch});
  const r=await invoke(h,'/api/widget/status');assert.equal(r.data.hosted.available,false);assert.equal(r.data.leadDelivery,false);
});
test('consent gates provider, fixed payload uses only approved candidates and bounded redacted history',async()=>{
  let calls=0;
  const h=createWidgetHandler({env,redis:scriptedAdmission,fetch:async(url,init)=>{
    calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(init?.redirect,'error');assert.equal(init?.credentials,'omit');
    const payload=JSON.parse(init!.body as string);assert.equal(payload.store,false);assert.equal(payload.model,'gpt-6-luna');assert.deepEqual(payload.tools,[]);
    const data=JSON.parse(payload.input[1].content);assert.ok(!JSON.stringify(payload).includes('Alice'));assert.ok(!JSON.stringify(payload).includes('person@example.invalid'));assert.ok(!JSON.stringify(payload).includes('private assistant'));
    assert.ok(data.visitor.history.length<=4);assert.ok(Buffer.byteLength(init!.body as string)<=16384);
    const ids=data.evidence.map(e=>e.id);assert.deepEqual(payload.text.format.schema.properties.sourceIds.items.enum,ids);
    return response({status:'completed',usage:{input_tokens:100,output_tokens:25},output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({sourceIds:ids})}]}]});}});
  const question='What services do you offer?';
  for(const processorConsent of [false,undefined]) assert.equal((await invoke(h,'/api/widget/chat',{question,processorConsent})).data.mode,'extractive');
  assert.equal(calls,0);
  const r=await invoke(h,'/api/widget/chat',{question,processorConsent:true,history:[{role:'user',content:'person@example.invalid'},{role:'user',content:'call me Alice; take payments'},{role:'assistant',content:'private assistant'}]});
  assert.equal(r.data.mode,'openai-responses');assert.equal(calls,1);
  for(const p of r.data.answer.split('\n\n')) assert.ok(availablePassages().some(e=>e.passage===p));
  assert.equal((await invoke(h,'/api/widget/chat',{question,processorConsent:false})).data.mode,'extractive');assert.equal(calls,1);
});
test('unknown, PII and invalid request schemas never call a provider or storage admission',async()=>{
  const h=createWidgetHandler({env,redis:async()=>{assert.fail('No storage call');},fetch:noFetch});
  for(const question of ['person@example.invalid','What is the weather on Mars?','Explain /dashboard','book me tomorrow']) {
    assert.notEqual((await invoke(h,'/api/widget/chat',{question,processorConsent:true})).data.status,'answered');
  }
  for(const extra of [{url:'https://evil.example'},{model:'other'},{tools:[]},{name:'Private'}]) assert.equal((await invoke(h,'/api/widget/chat',{question:'Square',...extra})).status,400);
});
test('malformed, empty, incomplete, extra-key, foreign-ID and free prose output falls back',async()=>{
  for(const text of ['Free money guaranteed','{"sourceIds":["foreign.id"]}','{"sourceIds":[]}','{"sourceIds":[],"answer":"hi"}','{"sourceIds":[],"sourceIds":[]}']) {
    const h=createWidgetHandler({env,redis:scriptedAdmission,fetch:async()=>response({status:'completed',usage:{input_tokens:1,output_tokens:1},output:[{type:'message',role:'assistant',content:[{type:'output_text',text}]}]})});
    const r=await invoke(h,'/api/widget/chat',{question:'Square',processorConsent:true});assert.equal(r.data.mode,'extractive');assert.equal(r.data.reason,'hosted_unavailable');assert.ok(!r.data.answer.includes('guaranteed'));
  }
  for(const redis of [async()=>{throw Error('lost claim');},async()=>'limited']) {
    const h=createWidgetHandler({env,redis,fetch:noFetch});assert.equal((await invoke(h,'/api/widget/chat',{question:'Square',processorConsent:true})).data.mode,'extractive');
  }
});
test('lead validation is named-fields only, explicit consent/review, bounded age and headers',async()=>{
  const input=lead();assert.ok(parseLead(input));
  for(const bad of [{...input,consent:false},{...input,reviewed:false},{...input,transcript:'x'},
    {...input,fields:{...input.fields,to:'other@example.invalid'}},{...input,fields:{...input.fields,name:'A\r\nB'}},
    {...input,submissionId:`${Date.now()-86400001}.${randomUUID()}`},{...input,submissionId:`${Date.now()+60000}.${randomUUID()}`}]) assert.equal(parseLead(bad),null);
  const h=createWidgetHandler({env,redis:scriptedAdmission,fetch:noFetch});
  assert.equal((await invoke(h,'/api/widget/lead',{...input,consent:false})).status,400);
  assert.equal((await invoke(h,'/api/widget/lead',input,{headers:{host:'test.example',origin:'https://evil.example'}})).status,403);
  assert.equal((await invoke(h,'/api/widget/lead',input,{headers:{host:'test.example',origin:'https://test.example','content-type':'text/plain'}})).status,415);
});
test('lead send hard-binds destination and exact fields, HMAC receipt has no PII',async()=>{
  const commands:any[]=[];let calls=0;const input=lead();
  const h=createWidgetHandler({env,redis:async c=>{commands.push(c);return scriptedAdmission(c);},fetch:async(url,init)=>{
    calls++;assert.equal(url,'https://api.web3forms.com/submit');assert.equal(init?.redirect,'error');
    const b=JSON.parse(init!.body as string);assert.deepEqual(Object.keys(b).sort(),['access_key','ccemail','subject','name','email','phone','company','message'].sort());
    assert.equal(b.access_key,env.VITE_WEB3FORMS_ACCESS_KEY);assert.equal(b.ccemail,'hunter@keystoneconsultingg.com, seth@keystoneconsultingg.com');return response({success:true});}});
  const r=await invoke(h,'/api/widget/lead',input);assert.equal(r.data.status,'accepted');assert.match(r.data.message,/does not confirm inbox delivery/);assert.equal(calls,1);
  const dump=JSON.stringify(commands);for(const pii of [input.fields.name,input.fields.email,input.fields.message,input.submissionId,'192.0.2.1'])assert.ok(!dump.includes(pii));
  assert.equal(commands[0][0],'EVAL');assert.equal(commands[1][0],'EVAL');assert.match(commands[0].at(-1),/^[a-f0-9]{64}$/);
});
test('replays, conflicts and pending claims never send; ambiguous failures persist unknown',async()=>{
  for(const state of ['accepted','pending','unknown','conflict','limited']) {
    const s=new SharedStore(config,async()=>state);const r=await submitLead(config,s,noFetch,'ip',lead());assert.equal(r.status,state);assert.equal(r.replay,true);
  }
  for(const send of [async()=>{throw Error('lost response');},async()=>response({success:false},500),async()=>response({success:true,extra:'x'.repeat(17000)})]) {
    const commands:any[]=[];const s=new SharedStore(config,async c=>{commands.push(c);return scriptedAdmission(c);});
    const r=await submitLead(config,s,send,'ip',lead());assert.equal(r.status,'unknown');assert.equal(commands.at(-1).at(-1),'unknown');
  }
  const s=new SharedStore(config,async c=>{if(c[2]===1)throw Error('lost finish');return 'claimed';});
  assert.equal((await submitLead(config,s,async()=>response({success:true}),'ip',lead())).status,'unknown');
});
test('REST bounds, redirects and full-operation timeout fail closed without retry',async()=>{
  let calls=0;const redis=restTransport(config,async(url,init)=>{calls++;assert.equal(url,'https://fixture.upstash.io');assert.equal(init?.redirect,'error');return response({result:'PONG'});});
  assert.equal(await redis(['PING']),'PONG');assert.equal(calls,1);
  for(const b of [{error:'failure'},{result:'x'.repeat(17000)},{}]) await assert.rejects(restTransport(config,async()=>response(b))(['PING']));
  let signal:AbortSignal|undefined;
  await assert.rejects(deadline(10,async s=>{signal=s;return new Promise(()=>{});}));assert.equal(signal?.aborted,true);
});
test('corrected industries and partner follow-ups preserve approved text',async()=>{
  const h:any[]=[{role:'user',content:'I run a restaurant and need payments'}];
  for(const question of ['Actually I run a retail store, not a restaurant. Take payments','I run a retail store instead. Take payments']) {
    const r=await strictAnswerQuestion(question,h);assert.match(r.answer,/Retail POS/);assert.ok(!r.answer.includes('Restaurant POS'));
  }
  const r=await strictAnswerQuestion('Do I need to switch systems?',[{role:'user',content:'I use Square'}]);assert.match(r.answer,/Square/);assert.match(r.answer,/does not confirm.*need to switch/);
  const p=hostedVisitor('call me Alice; visit https://private.invalid',Array.from({length:20},()=>({role:'user',content:'x'.repeat(1500)})));
  assert.equal(p.history.length,4);assert.ok(p.history.every(h=>h.content.length<=400));assert.ok(!p.question.includes('Alice'));assert.ok(!p.question.includes('private.invalid'));
});
