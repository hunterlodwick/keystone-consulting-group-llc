import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');
const root='verification/services-overhaul/rebalance';
const browser=await chromium.launch(); const results=[];
for(const width of [1440,390])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 if(theme==='dark')await page.addInitScript(()=>localStorage.setItem('kcg-theme','dark'));
 await page.addInitScript(()=>{window.IntersectionObserver=class {observe(){}unobserve(){}disconnect(){}};});
 await page.goto('http://127.0.0.1:4187/services/web-design',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const result=await page.locator('article').evaluate(article=>{
  const texts=[...article.querySelectorAll('h1,h2,h3,h4,p,dt,dd,a,button,figcaption,li')];
  const photos=[...article.querySelectorAll('img')].map(e=>e.getBoundingClientRect());
  return {theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,hidden:texts.filter(e=>{const s=getComputedStyle(e);return s.opacity==='0'||s.visibility==='hidden'||s.display==='none'}).length,textOverPhotos:texts.filter(e=>{const r=e.getBoundingClientRect();return photos.some(i=>r.left<i.right&&r.right>i.left&&r.top<i.bottom&&r.bottom>i.top)}).length,capabilities:[...article.querySelectorAll('#what-we-build h3')].map(e=>e.textContent),includes:article.querySelectorAll('#build-includes dt').length,process:article.querySelectorAll('#the-process h3').length,faqs:article.querySelectorAll('#questions h3').length,emDashes:article.innerText.includes('\u2014'),needsNumber:article.innerText.match(/\[needs number\]/g)||[],colors:texts.slice(0,6).map(e=>({text:e.textContent,color:getComputedStyle(e).color}))};
 });
 result.ctas=[];
 for(const label of ['See what your site could be','Find out how slow your site is','Talk through your site']){
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.locator('form input[name="firstName"]').waitFor({state:'visible'});
  result.ctas.push({label,opensForm:await page.locator('form input[name="email"]').isVisible(),title:await page.locator('#modal-title').innerText()});
  await page.getByRole('button',{name:'Close modal',exact:true}).click();
 }
 for(const [name,selector] of [['hero','article header'],['capabilities','#what-we-build'],['includes','#build-includes']]){
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.screenshot({path:`${root}/after/detail-${name}-${width}-${theme}.png`});
 }
 results.push({width,...result});await page.close();
}
fs.writeFileSync(`${root}/interactions.json`,JSON.stringify(results,null,2)); console.log(results);await browser.close();
