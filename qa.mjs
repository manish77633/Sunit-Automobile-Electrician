import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
mkdirSync('.qa', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.route('https://maps.google.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body style="background:#e6edf0;font-family:Arial;color:#657985;display:grid;place-items:center;height:100vh;margin:0">Google Maps · external embed</body></html>' }));
const errors = [], checks = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
const base = 'http://127.0.0.1:4173';
const routes = ['/', '/services/', '/about/', '/gallery/', '/contact/'];
for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      h1: document.querySelectorAll('h1').length,
      canonical: document.querySelector('link[rel=canonical]')?.href,
      description: document.querySelector('meta[name=description]')?.content,
      schema: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
      formCount: document.querySelectorAll('form').length,
      removedContent: /\bAC\b|air.conditioning|reviews|lalarpura/i.test(document.body.textContent),
      obsoleteLinks: document.querySelectorAll('a[href*="/location/"],a[href*="#reviews"]').length,
      brokenImages: [...document.images].filter(i => { const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0&&i.complete&&i.naturalWidth===0; }).map(i=>i.src),
    }));
    if (response.status() !== 200 || result.overflow || result.h1 !== 1 || !result.canonical || !result.description || result.formCount || result.removedContent || result.obsoleteLinks || result.brokenImages.length || result.schema.name !== 'Sunil Automobile and Electrician' || result.schema.telephone !== '+919414606756' || result.schema.email !== 'sunilautomobile896@gmail.com' || result.schema.hasOfferCatalog.itemListElement.length !== 9) throw Error(JSON.stringify({ width, route, ...result }));
    checks.push({ width, route, status: 'passed' });
  }
}
async function fullScreenshot(route, filename, width=1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(base+route,{waitUntil:'load'});
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,100));}window.scrollTo({top:0,behavior:'instant'});await Promise.all([...document.images].filter(i=>i.src&&i.getBoundingClientRect().width).map(i=>i.decode().catch(()=>{})));});
  await page.waitForTimeout(1100);
  if(await page.locator('.reveal:not(.is-visible)').count())throw Error('Unrevealed content on '+route);
  await page.screenshot({path:'.qa/'+filename,fullPage:true});
}
await fullScreenshot('/', 'home-redesign.png');
await fullScreenshot('/contact/', 'contact-redesign.png');
await fullScreenshot('/services/', 'services-redesign.png');
await fullScreenshot('/contact/', 'contact-mobile.png',390);
await page.setViewportSize({width:1440,height:1000});
await page.goto(base+'/services/#diagnostics',{waitUntil:'load'});
if(await page.locator('[data-service-panel="diagnostics"]').isHidden())throw Error('Diagnostic deep link failed');
if(await page.locator('.service-list').count())throw Error('Duplicate left service list exists');
const ids=await page.locator('[data-service-tab]').evaluateAll(links=>links.map(l=>l.dataset.serviceTab));
for(const id of ids){await page.locator(`[data-service-tab="${id}"]`).click();if(!await page.locator(`[data-service-panel="${id}"]`).isVisible()||await page.locator('[data-service-panel]:visible').count()!==1)throw Error('Service selection failed: '+id);}
await page.locator('.services-menu-toggle').click();if(await page.locator('#header-services a').count()!==9||!await page.locator('#header-services').isVisible())throw Error('Navbar services failed');await page.keyboard.press('Escape');if(await page.locator('#header-services').isVisible())throw Error('Navbar Escape failed');
await page.goto(base+'/contact/',{waitUntil:'load'});
if(await page.locator('.contact-main-value').getAttribute('href')!=='tel:+919414606756')throw Error('Phone link mismatch');
if(await page.locator('.contact-email-value').getAttribute('href')!=='mailto:sunilautomobile896@gmail.com')throw Error('Email link mismatch');
if(!(await page.locator('.contact-info-card address').textContent()).includes('A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur, Rajasthan, 302021'))throw Error('Supplied address mismatch');
if(!(await page.locator('iframe').getAttribute('src')).includes(encodeURIComponent('A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur, Rajasthan, 302021')))throw Error('Map address mismatch');
await page.goto(base,{waitUntil:'load'});await page.locator('.faq-list summary').first().click();if(await page.locator('.faq-list details').first().getAttribute('open')===null)throw Error('FAQ failed');
await page.goto(base+'/gallery/',{waitUntil:'load'});await page.locator('[data-gallery-filter="workshop"]').click();if(await page.locator('.gallery-item:visible').count()!==2)throw Error('Gallery filter failed');await page.locator('.gallery-item:visible').first().click();if(!await page.locator('#lightbox').isVisible())throw Error('Lightbox failed');await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');if(await page.locator('#lightbox').isVisible())throw Error('Lightbox close failed');
await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'load'});await page.locator('.menu-toggle').click();if(!await page.locator('#mobile-nav').isVisible())throw Error('Mobile menu failed');await page.locator('.mobile-services summary').click();if(await page.locator('.mobile-services a:visible').count()!==9)throw Error('Mobile services failed');await page.keyboard.press('Escape');if(await page.locator('#mobile-nav').isVisible())throw Error('Mobile Escape failed');
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base,{waitUntil:'load'});if(await page.locator('.hero h1>span').first().evaluate(el=>getComputedStyle(el).animationName)!=='none')throw Error('Reduced motion failed');
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await context.newPage();await fallback.goto(base+'/services/',{waitUntil:'load'});if(await fallback.locator('[data-service-panel]:visible').count()!==9)throw Error('No-JS services failed');await context.close();
for(const route of ['/location/','/reviews/']){const response=await page.request.get(base+route);if(response.status()!==404)throw Error('Removed page still served: '+route);}
const sitemap=readFileSync('dist/sitemap.xml','utf8');if(sitemap.includes('/location/')||sitemap.includes('/reviews/'))throw Error('Obsolete sitemap route');
if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors));
writeFileSync('.qa/report.json',JSON.stringify({viewportChecks:checks.length,checks,interactionChecks:['all nine service selections','service deep links','navbar dropdown','navbar Escape','phone link','email link','supplied address','contact map','FAQ','gallery filter','gallery lightbox and keyboard','mobile navigation','mobile services','reduced motion','no-JS services','removed pages','updated sitemap'],browserErrors:errors},null,2));
console.log(JSON.stringify({status:'passed',viewportChecks:checks.length,interactionChecks:17,browserErrors:errors}));
await browser.close();
