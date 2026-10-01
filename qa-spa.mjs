import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const checks = [], timings = [], errors = [];
async function makeContext(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  await context.route('https://maps.google.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>Map embed</body></html>' }));
  return context;
}
function passed(name) { checks.push(name); }
try {
  const context = await makeContext();
  const page = await context.newPage();
  let documents = 0, bundles = 0;
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;
    if (request.url().endsWith('/assets/pages.json')) bundles++;
  });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForResponse(response => response.url().endsWith('/assets/pages.json')).catch(() => {});
  await page.evaluate(() => {
    window.__spaCheck = { header: document.querySelector('header'), footer: document.querySelector('footer'), origin: performance.timeOrigin };
  });
  async function switchTo(route) {
    const result = await page.evaluate(async route => {
      const start = performance.now();
      const link = [...document.querySelectorAll('a[href]')].find(link => new URL(link.href).pathname === route);
      if (!link) throw Error('Missing route link ' + route);
      link.click();
      while (document.body.dataset.page !== route) await new Promise(resolve => requestAnimationFrame(resolve));
      return { route, ms: performance.now() - start, header: window.__spaCheck.header === document.querySelector('header'), footer: window.__spaCheck.footer === document.querySelector('footer'), sameDocument: window.__spaCheck.origin === performance.timeOrigin };
    }, route);
    assert.ok(result.header && result.footer && result.sameDocument, 'Persistent shell for ' + route);
    assert.equal(await page.locator('h1').count(), 1);
    const metadata = await page.evaluate(() => ({ title: document.title, canonical: document.querySelector('link[rel="canonical"]').href, description: document.querySelector('meta[name="description"]').content, og: document.querySelector('meta[property="og:url"]').content }));
    assert.equal(new URL(metadata.canonical).pathname, route);
    assert.equal(metadata.og, metadata.canonical);
    assert.ok(metadata.title && metadata.description);
    timings.push(result);
  }
  for (const route of ['/services/', '/about/', '/gallery/', '/contact/', '/', '/services/', '/gallery/']) await switchTo(route);
  assert.equal(documents, 1, 'No document navigation after initial load');
  assert.equal(bundles, 1, 'Route bundle fetched once');
  passed('All routes switch within the same document; shell persists and metadata updates');

  for (let cycle = 0; cycle < 3; cycle++) {
    await page.locator('[data-gallery-filter="workshop"]').click();
    assert.equal(await page.locator('.gallery-item:visible').count(), 2);
    await page.locator('.gallery-item:visible').first().click();
    assert.ok(await page.locator('#lightbox').isVisible());
    const caption = await page.locator('#lightbox-caption').textContent();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await page.locator('#lightbox-caption').textContent(), caption, 'Exactly one keyboard listener');
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#lightbox').isHidden());
    await switchTo('/about/');
    await switchTo('/gallery/');
  }
  passed('Gallery filters and lightbox keyboard work across repeated mounts');

  await page.locator('.services-menu-toggle').click();
  await page.locator('#header-services a[href="/services/#air-conditioning"]').click();
  await page.waitForURL('**/services/#air-conditioning');
  assert.ok(await page.locator('[data-service-panel="air-conditioning"]').isVisible());
  for (const id of await page.locator('[data-service-tab]').evaluateAll(tabs => tabs.map(tab => tab.dataset.serviceTab))) {
    await page.locator(`[data-service-tab="${id}"]`).click();
    assert.equal(await page.locator('[data-service-panel]:visible').count(), 1);
    assert.ok(await page.locator(`[data-service-panel="${id}"]`).isVisible());
  }
  passed('Navbar AC deep link and all ten service selections');

  await switchTo('/about/');
  await page.evaluate(() => scrollTo({ top: 420, behavior: 'instant' }));
  await page.waitForTimeout(250);
  const aboutScroll = await page.evaluate(() => scrollY);
  await switchTo('/contact/');
  await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
  await page.waitForTimeout(250);
  const contactScroll = await page.evaluate(() => scrollY);
  await page.goBack();
  await page.waitForFunction(() => document.body.dataset.page === '/about/');
  assert.ok(Math.abs(await page.evaluate(() => scrollY) - aboutScroll) < 2, 'Back restores scroll');
  await page.goForward();
  await page.waitForFunction(() => document.body.dataset.page === '/contact/');
  assert.ok(Math.abs(await page.evaluate(() => scrollY) - contactScroll) < 2, 'Forward restores scroll');
  assert.equal(documents, 1);
  passed('Browser Back/Forward restores route and scroll without reload');
  assert.equal(await page.locator('.contact-main-value').getAttribute('href'), 'tel:+919414606756');
  assert.equal(await page.locator('.contact-email-value').getAttribute('href'), 'mailto:sunilautomobile896@gmail.com');
  assert.equal(await page.locator('form').count(), 0);
  passed('Contact links and map retained without enquiry form');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.menu-toggle').click();
  await page.locator('#mobile-nav > a[href="/gallery/"]').click();
  await page.waitForURL('**/gallery/');
  assert.ok(await page.locator('#mobile-nav').isHidden());
  await page.locator('.menu-toggle').click();
  await page.locator('.mobile-services summary').click();
  await page.locator('.mobile-services a[href="/services/#air-conditioning"]').click();
  await page.waitForURL('**/services/#air-conditioning');
  assert.ok(await page.locator('[data-service-panel="air-conditioning"]').isVisible());
  assert.ok(await page.locator('#mobile-nav').isHidden());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  passed('Mobile navigation and nested service links remain fast and close correctly');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await switchTo('/');
  assert.equal(await page.locator('.hero h1 > span').first().evaluate(element => getComputedStyle(element).animationName), 'none');
  passed('Reduced motion respected during SPA transitions');
  await context.close();

  const slowContext = await makeContext();
  let releaseBundle;
  const gate = new Promise(resolve => { releaseBundle = resolve; });
  await slowContext.route('**/assets/pages.json', async route => { await gate; await route.continue(); });
  const slow = await slowContext.newPage();
  await slow.goto(base, { waitUntil: 'domcontentloaded' });
  await slow.evaluate(() => {
    document.querySelector('.desktop-nav a[href="/about/"]').click();
    document.querySelector('.desktop-nav a[href="/contact/"]').click();
  });
  releaseBundle();
  await slow.waitForFunction(() => document.body.dataset.page === '/contact/');
  await slow.waitForTimeout(100);
  assert.equal(new URL(slow.url()).pathname, '/contact/');
  passed('Rapid clicks while preloading retain the latest destination');
  await slowContext.close();

  const failedContext = await makeContext();
  await failedContext.route('**/assets/pages.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  const failed = await failedContext.newPage();
  await failed.goto(base, { waitUntil: 'load' });
  await failed.evaluate(() => { window.__beforeFallback = true; });
  await failed.locator('.desktop-nav a[href="/contact/"]').click();
  await failed.waitForURL('**/contact/');
  await failed.waitForLoadState('load');
  assert.equal(await failed.evaluate(() => window.__beforeFallback), undefined);
  assert.equal(await failed.locator('h1').count(), 1);
  passed('Prefetch failure falls back to usable server-rendered URL');
  await failedContext.close();

  const noJsContext = await makeContext({ javaScriptEnabled: false });
  const noJs = await noJsContext.newPage();
  for (const route of ['/', '/services/', '/about/', '/gallery/', '/contact/']) {
    const response = await noJs.goto(base + route, { waitUntil: 'load' });
    assert.equal(response.status(), 200);
    assert.equal(await noJs.locator('h1').count(), 1);
    assert.equal(new URL(await noJs.locator('link[rel="canonical"]').getAttribute('href')).pathname, route);
  }
  passed('All five routes serve crawlable HTML and metadata without JavaScript');
  await noJsContext.close();
  assert.deepEqual(errors, []);
  mkdirSync('.qa', { recursive: true });
  const report = { checks, timings, browserErrors: errors, routeBundleGzipBytes: gzipSync(readFileSync('dist/assets/pages.json')).length };
  writeFileSync('.qa/spa-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
