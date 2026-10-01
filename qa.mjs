import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('.qa',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.route('https://maps.google.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<html><body style="background:#e6edf0;font-family:Arial;color:#657985;display:grid;place-items:center;height:100vh;margin:0">Google Maps · external embed</body></html>'}));
const errors=[];const checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base='http://127.0.0.1:4173';
const routes=['/','/services/','/about/','/gallery/','/location/','/contact/'];
for(const width of [360,390,430,768,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
    const response=await page.goto(base+route,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(100);
    const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0&&i.src&&i.complete&&i.naturalWidth===0;}).map(i=>i.src),canonical:document.querySelector('link[rel=canonical]')?.href,description:document.querySelector('meta[name=description]')?.content,structuredData:!!JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).address}));
    if(response.status()!==200||result.overflow||result.h1!==1||result.brokenImages.length||!result.canonical||!result.description||!result.structuredData)throw Error(JSON.stringify({width,route,...result}));
    checks.push({width,route,status:'passed'});
  }
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(1800);await page.screenshot({path:'.qa/home-desktop.png'});
await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,110));}window.scrollTo({top:0,behavior:'instant'});await Promise.all([...document.images].filter(i=>i.src).map(i=>i.decode().catch(()=>{})));});await page.waitForTimeout(1000);if(await page.locator('.reveal:not(.is-visible)').count())throw Error('A homepage section did not reveal during scrolling');await page.screenshot({path:'.qa/home-full.png',fullPage:true});
await page.goto(base+'/services/#diagnostics',{waitUntil:'load'});if(await page.locator('#service-title').textContent()!=='Vehicle Engine Diagnostic')throw Error('Service deep link failed');
await page.locator('[data-service="electrical"]').click();if(await page.locator('#service-title').textContent()!=='Electrical')throw Error('Service selection failed');
if(!(await page.locator('#service-enquiry').getAttribute('href')).includes('electrical'))throw Error('Service enquiry link failed');
await page.screenshot({path:'.qa/services-desktop.png',fullPage:true});
await page.goto(base+'/gallery/',{waitUntil:'load'});await page.locator('[data-gallery-filter="workshop"]').click();if(await page.locator('.gallery-item:visible').count()!==2)throw Error('Gallery filtering failed');
await page.locator('.gallery-item:visible').first().click();if(!await page.locator('#lightbox').isVisible())throw Error('Lightbox failed');await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');if(await page.locator('#lightbox').isVisible())throw Error('Lightbox close failed');
await page.goto(base+'/contact/?service=electrical',{waitUntil:'load'});if(await page.locator('#service').inputValue()!=='electrical')throw Error('Enquiry service prefill failed');
await page.locator('#name').fill('Test Visitor');await page.locator('#phone').fill('9999999999');await page.locator('#vehicle').fill('Maruti Swift');await page.locator('#message').fill('Electrical inspection enquiry');await page.locator('.form-submit').click();if(!await page.locator('#form-result').isVisible())throw Error('Form prepare failed');
const downloadPromise=page.waitForEvent('download');await page.locator('#download-enquiry').click();const download=await downloadPromise;await download.saveAs('.qa/enquiry.txt');
await page.locator('#phone').fill('----------');await page.locator('.form-submit').click();if(await page.locator('#phone').evaluate(e=>e.validity.valid))throw Error('Phone validation failed');
await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(1600);await page.screenshot({path:'.qa/home-mobile.png'});await page.locator('.menu-toggle').click();if(!await page.locator('#mobile-nav').isVisible())throw Error('Mobile menu failed');await page.keyboard.press('Escape');if(await page.locator('#mobile-nav').isVisible())throw Error('Mobile menu Escape failed');
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base,{waitUntil:'load'});const motion=await page.locator('.hero h1>span').first().evaluate(el=>getComputedStyle(el).animationName);if(motion!=='none')throw Error('Reduced motion failed');
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();await fallback.route('https://maps.google.com/**',r=>r.fulfill({status:200,body:'Map'}));await fallback.goto(base+'/services/',{waitUntil:'load'});if(await fallback.locator('.noscript-services article').count()!==10)throw Error('No-JS service fallback failed');await nojs.close();
if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors));
writeFileSync('.qa/report.json',JSON.stringify({viewportChecks:checks.length,checks,interactionChecks:['service deep link','service selection','enquiry link','gallery filter','lightbox keyboard','service prefill','form preparation','enquiry download','phone validation','mobile menu','reduced motion','no-JS fallback'],browserErrors:errors},null,2));
console.log(JSON.stringify({status:'passed',viewportChecks:checks.length,interactionChecks:12,browserErrors:errors}));
await browser.close();
