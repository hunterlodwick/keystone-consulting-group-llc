import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:900}});await page.goto('http://127.0.0.1:4175/services/automations');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2000);
console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,text:e.textContent.slice(0,85),width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,css:e.className}))));await browser.close();
