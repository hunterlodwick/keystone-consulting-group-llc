import {createRequire} from 'node:module';import fs from 'node:fs';
const require=createRequire(import.meta.url);const {chromium}=require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');
const browser=await chromium.launch();const results=[];
for(const id of ['web-design','automations'])for(const width of [1440,390])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:900}});
 if(theme==='dark')await page.addInitScript(()=>localStorage.setItem('kcg-theme','dark'));
 // Deliberately prevent scroll observers from revealing anything.
 await page.addInitScript(()=>{window.IntersectionObserver=class {observe(){}unobserve(){}disconnect(){}};});
 await page.goto(`http://127.0.0.1:4177/services/${id}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const result=await page.evaluate(()=>{
  const article=document.querySelector('[data-deep-service]');const images=[...article.querySelectorAll('img')].map(e=>e.getBoundingClientRect());
  const texts=[...article.querySelectorAll('h1,h2,h3,p,dt,dd,a,button,figcaption,li')];
  const overlap=texts.filter(e=>{const r=e.getBoundingClientRect();return images.some(i=>r.left<i.right&&r.right>i.left&&r.top<i.bottom&&r.bottom>i.top);});
  return {defaultTheme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,hidden:texts.filter(e=>{const s=getComputedStyle(e);return s.opacity==='0'||s.visibility==='hidden';}).length,textOverImage:overlap.map(e=>({text:e.textContent,color:getComputedStyle(e).color})),colors:texts.slice(0,9).map(e=>({tag:e.tagName,color:getComputedStyle(e).color,font:getComputedStyle(e).fontFamily})),stats:[...article.querySelectorAll('[data-stat]')].map(e=>({background:getComputedStyle(e).backgroundColor,source:e.querySelector('figcaption').textContent})),ctaCount:article.querySelectorAll('button').length};
 });
 await page.locator('[data-deep-service] button').click();await page.locator('form input[name="firstName"]').waitFor({state:'visible'});
 result.contactFormOpened=await page.locator('form input[name="email"]').isVisible();
 results.push({id,width,theme,...result});await page.close();
}
fs.writeFileSync('verification/services-overhaul/interactions.json',JSON.stringify(results,null,2));console.log(results);await browser.close();
