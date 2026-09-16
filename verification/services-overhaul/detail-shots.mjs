import{createRequire}from'node:module';const require=createRequire(import.meta.url);const{chromium}=require('/Users/hunterlodwick/Downloads/ar-games-bridge/node_modules/playwright');const b=await chromium.launch();
for(const id of ['web-design','automations'])for(const theme of ['light','dark'])for(const width of [1440,390]){
 const p=await b.newPage({viewport:{width,height:900}});await p.addInitScript(t=>localStorage.setItem('kcg-theme',t),theme);await p.goto(`http://127.0.0.1:4177/services/${id}`,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:`verification/services-overhaul/after/${id}-${width}-${theme}-hero.png`});await p.locator('#the-value').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-112));await p.waitForTimeout(200);await p.screenshot({path:`verification/services-overhaul/after/${id}-${width}-${theme}-value.png`});await p.close();
}await b.close();
