// The site must keep working when EmailJS or reCAPTCHA fail to load
// (ad/tracker blockers, network filters, CDN outage). Before the guard, a
// missing `emailjs` threw inside DOMContentLoaded and stopped every init
// after the contact form: no language, no theme, no pricing.
// Run with: npm test

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff2': 'font/woff2' };

let server, browser, origin;

before(async () => {
  server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, r));
  origin = `http://localhost:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

// Opens the home page with the third-party scripts blocked, as a blocker would.
async function openBlocked({ lang = 'ar', theme = 'dark' } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(([l, t]) => {
    localStorage.setItem('app_lang', l);
    localStorage.setItem('theme', t);
  }, [lang, theme]);
  await context.route(/^https:\/\/(cdn\.jsdelivr\.net|www\.google\.com)\//, r => r.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${origin}/index.html`);
  await page.waitForLoadState('networkidle');
  return { page, errors, close: () => context.close() };
}

test('page still initialises when EmailJS and reCAPTCHA are blocked', async () => {
  const ar = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', 'ar.json'), 'utf8'));
  const { page, errors, close } = await openBlocked();
  try {
    assert.deepEqual(errors, [], `uncaught errors: ${errors.join('; ')}`);
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
    assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
    await page.waitForFunction(t => document.querySelector('[data-i18n="vehicle_car"]').textContent === t, ar.vehicle_car);
    assert.ok(await page.$$eval('.plan-card', c => c.length) > 0, 'pricing cards did not render');
  } finally { await close(); }
});

test('contact form reports a failure instead of hanging when EmailJS is blocked', async () => {
  const { page, errors, close } = await openBlocked({ lang: 'en', theme: 'light' });
  try {
    await page.evaluate(() => switchTab('contact'));
    await page.fill('#name', 'Test');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Hello');
    const messages = [];
    page.on('dialog', d => { messages.push(d.message()); d.dismiss(); });
    await page.click('.contact-form button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('.contact-form button[type="submit"]').disabled);
    assert.equal(messages.length, 1, 'expected one alert');
    assert.match(messages[0], /failed/i);
    const btn = page.locator('.contact-form button[type="submit"]');
    await btn.waitFor();
    assert.equal(await btn.isDisabled(), false, 'submit button stayed disabled');
    assert.deepEqual(errors, [], `uncaught errors: ${errors.join('; ')}`);
  } finally { await close(); }
});

test('contact form still sends when EmailJS and reCAPTCHA load (init runs once)', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // The EmailJS tag has an SRI hash, so a stubbed response would be refused;
  // define the globals up front and block the real downloads instead.
  await context.addInitScript(() => {
    window.__ejs = { init: 0, sent: 0 };
    window.emailjs = { init() { __ejs.init++; }, sendForm() { __ejs.sent++; return Promise.resolve(); } };
    window.grecaptcha = { execute() { return Promise.resolve('token'); } };
  });
  await context.route(/^https:\/\/(cdn\.jsdelivr\.net|www\.google\.com)\//, r => r.abort());
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/index.html`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => switchTab('contact'));
    const messages = [];
    page.on('dialog', d => { messages.push(d.message()); d.dismiss(); });
    for (let i = 0; i < 2; i++) {
      await page.fill('#name', 'Test');
      await page.fill('#email', 'test@example.com');
      await page.fill('#message', 'Hello');
      await page.click('.contact-form button[type="submit"]');
      await page.waitForFunction(n => window.__ejs.sent === n, i + 1);
    }
    await page.waitForFunction(() => !document.querySelector('.contact-form button[type="submit"]').disabled);
    assert.deepEqual(await page.evaluate(() => window.__ejs), { init: 1, sent: 2 });
    assert.equal(await page.inputValue('#g-recaptcha-response'), 'token');
    assert.ok(messages.every(m => /success/i.test(m)), messages.join('; '));
  } finally { await context.close(); }
});
