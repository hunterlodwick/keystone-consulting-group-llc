import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const {chromium} = require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');
const stage=process.argv[2] || 'after', root=`verification/services-overhaul/rebalance/${stage}`;
fs.mkdirSync(root,{recursive:true});

const results=[];
const deep=['web-design'], others=['automations','crm','consulting','prep-to-sell','seo','google-business','bpo','consumer-financing','business-loans','pos-placement'];
for(const id of [...deep,...others]) for(const width of [1440,390]) for(const theme of ['light','dark']) {
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height:900}}); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(t=>localStorage.setItem('kcg-theme',t),theme);
 await page.goto(`http://127.0.0.1:${stage==='before'?4186:4187}/services/${id}`,{waitUntil:'networkidle'});
 await page.locator('main h1').waitFor({state:'visible'});
 await page.evaluate(()=>{window.__captureLoading=[...document.images].map(i=>[i,i.getAttribute('loading')]);document.querySelectorAll('img').forEach(i=>i.loading='eager');});
 if(!deep.includes(id)||stage==='before') {
  for(let y=0;y<await page.locator('body').evaluate(e=>e.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(40);}
 }
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,5000))])));});
 await page.evaluate(()=>window.__captureLoading.forEach(([i,loading])=>loading===null?i.removeAttribute('loading'):i.setAttribute('loading',loading)));
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);
 await page.locator('main').waitFor({state:'visible'});
 const metrics=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,main:document.querySelector('main').innerText,body:document.body.innerText,html:document.querySelector('main').innerHTML,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),sources:[...document.querySelectorAll('[data-stat]')].map(e=>({text:e.innerText,links:[...e.querySelectorAll('a')].map(a=>a.href),background:getComputedStyle(e).backgroundColor})),photoText:[...document.querySelectorAll('.on-photo-text,.on-photo-text-soft')].map(e=>({text:e.textContent,color:getComputedStyle(e).color})),hidden:[...document.querySelectorAll('[data-deep-service] h1,[data-deep-service] h2,[data-deep-service] p')].filter(e=>getComputedStyle(e).opacity==='0'||getComputedStyle(e).visibility==='hidden').length}));
 const name=`${id}-${width}-${theme}`;
 fs.writeFileSync(`${root}/${name}.txt`,metrics.body);fs.writeFileSync(`${root}/${name}.main.txt`,metrics.main);
 if(deep.includes(id))await page.screenshot({path:`${root}/${name}.png`,fullPage:true,timeout:30000});
 console.log('captured',name);
 results.push({id,width,theme,errors,...metrics,words:metrics.main.split(/\s+/).filter(Boolean).length});
 fs.writeFileSync(`${root}/metrics.json`,JSON.stringify(results,null,2));
 await browser.close();
}
fs.writeFileSync(`${root}/metrics.json`,JSON.stringify(results,null,2));
console.log(stage,results.map(({id,width,theme,words,overflow,errors})=>({id,width,theme,words,overflow,errors})));
