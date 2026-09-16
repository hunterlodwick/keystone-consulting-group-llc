const {chromium}=require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');const fs=require('fs');
const root='verification/services-overhaul/remaining-eight', data=JSON.parse(fs.readFileSync(root+'/entries.json'));
(async()=>{
 const browser=await chromium.launch({headless:true}),rows=[];
 for(const [id,d] of Object.entries(data))for(const width of [390,1440])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(t=>localStorage.setItem('kcg-theme',t),theme);
  await page.goto('http://127.0.0.1:4193/services/'+id,{waitUntil:'networkidle'});
  const article=page.locator('article[data-deep-service="'+id+'"]');await article.waitFor();
  const checks=await article.evaluate(a=>({overflow:document.documentElement.scrollWidth>innerWidth,sections:a.querySelectorAll('#what-we-build h3').length,includes:a.querySelectorAll('#build-includes dt').length,stats:a.querySelectorAll('[data-stat]').length,process:a.querySelectorAll('#the-process h3').length,questions:a.querySelectorAll('#questions h3').length,hidden:[...a.querySelectorAll('h1,h2,h3,p,dt,dd,figcaption,li')].filter(e=>{const s=getComputedStyle(e);return s.opacity==='0'||s.visibility==='hidden'||s.display==='none'}).length,forbidden:/\u2014|\[needs number\]|\$8\.71|3D/.test(a.innerText),statLinks:[...a.querySelectorAll('[data-stat] a')].map(e=>({text:e.innerText,url:e.href})),words:a.innerText.split(/\s+/).length}));
  await page.getByRole('button',{name:d.close.button,exact:true}).click();await page.locator('form input[name="firstName"]').waitFor({state:'visible'});
  checks.cta=await page.locator('form input[name="email"]').isVisible();await page.getByRole('button',{name:'Close modal',exact:true}).click();
  if(theme==='light'&&width===390)await page.screenshot({path:root+'/'+id+'-mobile.png',fullPage:true});
  const pass=!checks.overflow&&!checks.hidden&&!checks.forbidden&&checks.cta&&checks.sections===d.sections.length&&checks.includes===d.buildIncludes.items.length&&checks.stats===d.statistics.length&&checks.process===4&&checks.questions===d.questions.length&&checks.statLinks.every((l,i)=>l.url===d.statistics[i].url&&l.text.includes(d.statistics[i].source))&&errors.length===0;
  rows.push({id,width,theme,pass,...checks,errors});await page.close();
 }
 await browser.close();fs.writeFileSync(root+'/browser-checks.json',JSON.stringify(rows,null,2));console.log(rows.map(r=>`${r.id} ${r.width} ${r.theme}: ${r.pass?'PASS':'FAIL'} (${r.words} rendered words)`).join('\n'));if(rows.some(r=>!r.pass))process.exitCode=1;
})();
