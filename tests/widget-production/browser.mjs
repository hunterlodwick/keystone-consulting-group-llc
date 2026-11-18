// No web server, credentials or external traffic. Browser routes fulfill every request in memory.
import {chromium, expect} from '@playwright/test';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
const built=await build({stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import{ChatWidget}from'./src/components/chat/ChatWidget';createRoot(document.getElementById('root')).render(<ChatWidget/>);",resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"test"'}});
const script=built.outputFiles[0].text;
const browser=await chromium.launch({headless:true});
try {
  for(const mode of ['both','hosted','lead','off','ambiguous']) {
    const context=await browser.newContext();const page=await context.newPage();const chat=[],leads=[];
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!=='https://kcg.example')return route.abort();
      if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});
      if(url.pathname==='/api/widget/status')return route.fulfill({json:{hosted:{available:['both','hosted','ambiguous'].includes(mode)},leadDelivery:['both','lead','ambiguous'].includes(mode),mode:'extractive'}});
      if(url.pathname==='/api/widget/chat') {chat.push(route.request().postDataJSON());return route.fulfill({json:{status:'answered',answer:'Approved public passage',mode:'extractive',citations:[],notices:[],followUpQuestion:null}});}
      if(url.pathname==='/api/widget/lead') {leads.push(route.request().postDataJSON());if(mode==='ambiguous')return route.abort();return route.fulfill({json:{status:'accepted'}});}
      return route.abort();
    });
    await page.goto('https://kcg.example');await page.addScriptTag({content:script});
    await page.getByTestId('chat-launcher').click();
    const hosted=page.getByTestId('hosted-consent');
    if(['both','hosted','ambiguous'].includes(mode)) {
      await expect(hosted).not.toBeChecked();
      await page.getByRole('textbox',{name:'Your question'}).fill('Take payments');await page.getByRole('button',{name:'Send',exact:true}).click();
      await expect(page.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
      await expect(page.getByText('Approved public passage',{exact:true})).toBeVisible();assert.equal(chat[0].processorConsent,false);
      await hosted.check();await page.getByRole('textbox',{name:'Your question'}).fill('Square');await page.getByRole('button',{name:'Send',exact:true}).click();
      await expect.poll(()=>chat.length).toBe(2);assert.equal(chat[1].processorConsent,true);
      await hosted.uncheck();
    } else await expect(hosted).toHaveCount(0);
    if(['both','lead','ambiguous'].includes(mode)) {
      await page.getByRole('button',{name:'Contact KCG with reviewed details'}).click();
      await expect(page.getByTestId('lead-consent')).toHaveCount(0);
      await page.getByTestId('lead-name').fill('Synthetic Visitor');await page.getByTestId('lead-email').fill('person@example.invalid');await page.getByTestId('lead-message').fill('Please contact me');
      await page.getByTestId('lead-review-button').click();await expect(page.getByTestId('lead-consent')).not.toBeChecked();await expect(page.getByTestId('lead-submit')).toBeDisabled();
      await page.getByTestId('lead-consent').check();await page.getByTestId('lead-consent').uncheck();await expect(page.getByTestId('lead-submit')).toBeDisabled();
      await page.getByRole('button',{name:'Edit details',exact:true}).click();await page.getByTestId('lead-message').fill('Updated reviewed message');await page.getByTestId('lead-review-button').click();
      await expect(page.getByTestId('lead-consent')).not.toBeChecked();await page.getByTestId('lead-consent').check();
      if(mode!=='lead')await expect(hosted).not.toBeChecked();
      await page.getByTestId('lead-submit').click();await expect(page.getByTestId('lead-status')).toContainText(mode==='ambiguous'?'Acceptance is unconfirmed':'Inbox delivery is not confirmed');
      assert.equal(leads.length,1);assert.deepEqual(Object.keys(leads[0]).sort(),['consent','fields','reviewed','submissionId']);assert.equal(leads[0].fields.message,'Updated reviewed message');
      await expect(page.getByTestId('lead-submit')).toHaveCount(0);assert.equal(leads.length,1);
    } else await expect(page.getByTestId('lead-controls')).toHaveCount(0);
    await context.close();
  }
  console.log('PASS: separate unchecked/revocable consent, reviewed fields, capabilities, ambiguous-send lockout; all traffic intercepted.');
} finally {await browser.close();}
