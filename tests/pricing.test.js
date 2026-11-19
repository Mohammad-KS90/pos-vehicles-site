// Tests for the Pricing tab.
// Run with: npm test   (first time: npm install && npx playwright install chromium)
//
// The data tests check pricing.json and the language files; they fail while
// any price is null or a feature list still says TODO, so placeholders can't
// ship. The page tests serve sample prices so they test the UI on their own.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const LANGS = ['ar', 'tr', 'en', 'fr', 'zh', 'ja', 'ko', 'id', 'th', 'vi', 'hi'];
const ROLES = ['autoparts', 'towing', 'servicecenter'];
const TIERS = ['basic', 'pro', 'enterprise'];
const CURRENCIES = ['JOD', 'USD', 'AED'];
const STRING_KEYS = [
  'tab_pricing', 'pricing_title', 'pricing_subtitle', 'pricing_segment_label',
  'pricing_b2b', 'pricing_b2c', 'pricing_role_label', 'pricing_currency_label',
  'pricing_role_autoparts', 'pricing_role_towing', 'pricing_role_servicecenter',
  'pricing_role_owner', 'pricing_plan_basic', 'pricing_plan_pro',
  'pricing_plan_enterprise', 'pricing_plan_free', 'pricing_per_month',
  'pricing_popular', 'pricing_cta', 'pricing_subject',
];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

// Distinct sample prices so a currency or role switch visibly changes the cards
const SAMPLE = {
  currencies: CURRENCIES,
  b2b: Object.fromEntries(ROLES.map((role, r) => [role, Object.fromEntries(TIERS.map((tier, t) =>
    [tier, { JOD: 10 + r * 100 + t * 10, USD: 15 + r * 100 + t * 10, AED: 50 + r * 100 + t * 10 }]))])),
  b2c: { owner: { price: 0 } },
};

const readJson = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

let server, browser, baseUrl;

before(async () => {
  server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, r));
  baseUrl = `http://localhost:${server.address().port}/index.html`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

// Third-party scripts (EmailJS, reCAPTCHA) are stubbed so the tests run offline.
async function openPricing({ width = 1280, height = 900, lang = 'en', currency } = {}) {
  const context = await browser.newContext({ viewport: { width, height } });
  await context.addInitScript(([l, c]) => {
    localStorage.setItem('app_lang', l);
    if (c) localStorage.setItem('pricing_currency', c);
  }, [lang, currency]);
  await context.route(/^https:\/\/(cdn\.jsdelivr\.net|www\.google\.com)\//, r =>
    r.fulfill({ contentType: 'text/javascript', body: 'window.emailjs={init(){},sendForm(){}};' }));
  await context.route(/\/pricing\.json(\?|$)/, r =>
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(SAMPLE) }));
  const page = await context.newPage();
  await page.goto(`${baseUrl}#pricing`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('#pricing .plan-card');
  return { page, close: () => context.close() };
}

const amounts = page => page.$$eval('#pricing .plan-amount', els => els.map(e => e.textContent));

/* ---------- data ---------- */

test('pricing.json has a price for every role, plan and currency', () => {
  const pricing = readJson('pricing.json');
  assert.deepEqual(pricing.currencies, CURRENCIES);
  const missing = [];
  for (const role of ROLES) for (const tier of TIERS) for (const cur of CURRENCIES) {
    const v = pricing.b2b?.[role]?.[tier]?.[cur];
    if (typeof v !== 'number' || !(v >= 0)) missing.push(`${role}.${tier}.${cur}`);
  }
  assert.deepEqual(missing, [], `Prices still missing (null) in pricing.json: ${missing.join(', ')}`);
  assert.equal(pricing.b2c?.owner?.price, 0, 'Vehicle owner plan should be free');
});

for (const lang of LANGS) {
  test(`${lang}.json has all pricing text and finished feature lists`, () => {
    const json = readJson(`languages/${lang}.json`);
    for (const key of STRING_KEYS) {
      assert.equal(typeof json[key], 'string', `${lang}.json is missing "${key}"`);
      assert.ok(json[key].trim(), `${lang}.json "${key}" is empty`);
    }
    assert.match(json.pricing_subject, /\{role\}/);
    assert.match(json.pricing_subject, /\{plan\}/);

    const f = json.pricing_features;
    const lists = [...ROLES.flatMap(role => TIERS.map(tier => [`${role}.${tier}`, f?.[role]?.[tier]])),
      ['owner', f?.owner]];
    for (const [where, list] of lists) {
      assert.ok(Array.isArray(list) && list.length > 0, `${lang}.json pricing_features.${where} is missing`);
      assert.ok(list.every(item => typeof item === 'string' && item.trim() && !/TODO/i.test(item)),
        `${lang}.json pricing_features.${where} still has a placeholder`);
    }
  });
}

/* ---------- page ---------- */

test('opening /#pricing shows the Pricing tab', async () => {
  const { page, close } = await openPricing();
  try {
    assert.ok(await page.$eval('#pricing', el => el.classList.contains('active')));
    assert.ok(await page.$eval('.tab-btn[data-tab="pricing"]', el => el.classList.contains('active')));
  } finally { await close(); }
});

test('each business role shows Basic, Pro and Enterprise, with Pro featured', async () => {
  const { page, close } = await openPricing({ currency: 'JOD' });
  try {
    const seen = [];
    for (const role of ROLES) {
      await page.click(`[data-pricing="role"] [data-value="${role}"]`);
      const cards = await page.$$eval('#pricing .plan-card', els => els.map(e => ({
        name: e.querySelector('.plan-name').textContent,
        featured: e.classList.contains('plan-card--featured'),
      })));
      assert.deepEqual(cards.map(c => c.name), ['Basic', 'Pro', 'Enterprise']);
      assert.deepEqual(cards.map(c => c.featured), [false, true, false]);
      seen.push((await amounts(page)).join('|'));
    }
    assert.equal(new Set(seen).size, ROLES.length, 'roles should show different prices');
  } finally { await close(); }
});

test('switching currency changes the prices and is remembered', async () => {
  const { page, close } = await openPricing();
  try {
    assert.match((await amounts(page))[0], /USD/, 'English defaults to USD');
    await page.click('[data-pricing="currency"] [data-value="AED"]');
    assert.match((await amounts(page))[0], /AED/);
    assert.equal(await page.evaluate(() => localStorage.getItem('pricing_currency')), 'AED');
    await page.click('[data-pricing="currency"] [data-value="JOD"]');
    assert.match((await amounts(page))[0], /JOD/);
  } finally { await close(); }
});

test('Arabic shows the pricing right-to-left and in JOD by default', async () => {
  const { page, close } = await openPricing({ lang: 'ar' });
  try {
    await page.waitForFunction(() => document.querySelector('#pricing h2').textContent === 'الأسعار');
    assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
    assert.match((await amounts(page))[0], /JOD/);
  } finally { await close(); }
});

test('vehicle owners see one free plan without the business controls', async () => {
  const { page, close } = await openPricing();
  try {
    await page.click('[data-pricing="segment"] [data-value="b2c"]');
    assert.equal(await page.$$eval('#pricing .plan-card', els => els.length), 1);
    assert.deepEqual(await amounts(page), ['Free']);
    assert.equal(await page.$('#pricing .plan-badge'), null);
    assert.equal(await page.isVisible('[data-pricing="role"]'), false);
    assert.equal(await page.isVisible('[data-pricing="currency"]'), false);
  } finally { await close(); }
});

test('"Get started" opens the contact form with the plan in the subject', async () => {
  const { page, close } = await openPricing();
  try {
    await page.click('[data-pricing="role"] [data-value="servicecenter"]');
    await page.click('#pricing .plan-card--featured .btn');
    assert.ok(await page.$eval('#contact', el => el.classList.contains('active')));
    assert.equal(await page.inputValue('#subject'), 'Pricing: Service center – Pro');
  } finally { await close(); }
});

test('"View Pricing" on the Services tab opens Pricing', async () => {
  const { page, close } = await openPricing();
  try {
    await page.click('.tab-btn[data-tab="services"]');
    await page.click('[data-action="pricing"]');
    assert.ok(await page.$eval('#pricing', el => el.classList.contains('active')));
  } finally { await close(); }
});

test('pricing fits a 375px phone without sideways scrolling', async () => {
  const { page, close } = await openPricing({ width: 375, height: 812 });
  try {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `page is ${overflow}px wider than the screen`);
    const columns = await page.$eval('#pricing .plan-grid', el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(columns, 1);
  } finally { await close(); }
});
