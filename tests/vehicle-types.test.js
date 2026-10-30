// Tests for the "Supported Vehicle Types" footer section.
// Run with: npm test   (first time: npm install && npx playwright install chromium)
//
// Tests marked { todo } describe the planned redesign. They run and report,
// but don't fail the suite until the redesign lands and the flag is removed.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const LANGS = ['ar', 'tr', 'en', 'fr', 'zh', 'ja', 'ko', 'id', 'th', 'vi', 'hi'];
const EXPECTED = [
  { key: 'vehicle_car', alt: 'Car' },
  { key: 'vehicle_truck', alt: 'Truck' },
  { key: 'vehicle_bus', alt: 'Bus' },
  { key: 'vehicle_motorcycle', alt: 'Motorcycle' },
  { key: 'vehicle_all', alt: 'All Types' },
];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };

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

// Third-party scripts (EmailJS, reCAPTCHA) aren't needed here; stub them so
// the tests run offline.
async function openPage({ width = 1280, height = 900, lang, theme } = {}) {
  const context = await browser.newContext({ viewport: { width, height } });
  await context.addInitScript(([l, t]) => {
    if (l) localStorage.setItem('app_lang', l);
    if (t) localStorage.setItem('theme', t);
  }, [lang, theme]);
  await context.route(/^https:\/\/(cdn\.jsdelivr\.net|www\.google\.com)\//, r =>
    r.fulfill({ contentType: 'text/javascript', body: 'window.emailjs={init(){},sendForm(){}};' }));
  const page = await context.newPage();
  const failed = [];
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  return { page, failed, close: () => context.close() };
}

const cardInfo = page => page.$$eval('.vehicle-card', cards => cards.map(c => {
  const img = c.querySelector('img');
  const label = c.querySelector('[data-i18n]');
  const box = img.getBoundingClientRect();
  return {
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    loaded: img.complete && img.naturalWidth > 0,
    width: Math.round(box.width),
    height: Math.round(box.height),
    key: label?.getAttribute('data-i18n'),
    text: label?.textContent.trim(),
  };
}));

/* ---------------- Current behaviour (must pass) ---------------- */

test('section shows the title and the five vehicle cards in order', async () => {
  const { page, close } = await openPage();
  try {
    assert.equal(await page.textContent('.vehicle-support-title'), 'Supported Vehicle Types');
    const cards = await cardInfo(page);
    assert.deepEqual(cards.map(c => c.key), EXPECTED.map(e => e.key));
  } finally { await close(); }
});

test('every vehicle icon loads without errors', async () => {
  const { page, failed, close } = await openPage();
  try {
    const cards = await cardInfo(page);
    for (const c of cards) assert.ok(c.loaded, `icon did not load: ${c.src}`);
    assert.deepEqual(failed, [], 'some requests failed');
  } finally { await close(); }
});

test('every icon has meaningful alt text', async () => {
  const { page, close } = await openPage();
  try {
    const cards = await cardInfo(page);
    cards.forEach((c, i) => assert.equal(c.alt, EXPECTED[i].alt));
  } finally { await close(); }
});

test('all icons render at the same size', async () => {
  for (const width of [1280, 768, 375]) {
    const { page, close } = await openPage({ width });
    try {
      const sizes = new Set((await cardInfo(page)).map(c => `${c.width}x${c.height}`));
      assert.equal(sizes.size, 1, `mixed icon sizes at ${width}px: ${[...sizes]}`);
    } finally { await close(); }
  }
});

test('every vehicle label is translated in every language file', () => {
  const keys = ['footer_supported_vehicles', ...EXPECTED.map(e => e.key)];
  for (const lang of LANGS) {
    const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', `${lang}.json`), 'utf8'));
    for (const key of keys) {
      assert.ok(typeof json[key] === 'string' && json[key].trim(), `${lang}.json is missing ${key}`);
    }
  }
});

test('labels switch language and the section flips to RTL in Arabic', async () => {
  const ar = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', 'ar.json'), 'utf8'));
  const { page, close } = await openPage({ lang: 'ar' });
  try {
    await page.waitForFunction(t => document.querySelector('[data-i18n="vehicle_car"]').textContent === t, ar.vehicle_car);
    assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
    const cards = await cardInfo(page);
    cards.forEach((c, i) => assert.equal(c.text, ar[EXPECTED[i].key]));
  } finally { await close(); }
});

test('section fits a phone screen without horizontal scrolling', async () => {
  for (const width of [375, 320]) {
    const { page, close } = await openPage({ width });
    try {
      const overflow = await page.$eval('.vehicle-footer', el => el.scrollWidth - el.clientWidth);
      assert.ok(overflow <= 0, `vehicle section overflows by ${overflow}px at ${width}px`);
      const outside = await page.$$eval('.vehicle-card', (cards, w) =>
        cards.filter(c => { const r = c.getBoundingClientRect(); return r.left < 0 || r.right > w; }).length, width);
      assert.equal(outside, 0, `${outside} card(s) cut off at ${width}px`);
    } finally { await close(); }
  }
});

/* ---------------- Planned redesign (todo until done) ---------------- */

test('all icons use one format (SVG) so they stay sharp and match', { todo: 'redesign' }, async () => {
  const { page, close } = await openPage();
  try {
    for (const c of await cardInfo(page)) assert.match(c.src, /\.svg$/, `${c.src} is not SVG`);
  } finally { await close(); }
});

test('each icon file is small (under 10 KB)', { todo: 'redesign' }, async () => {
  const { page, close } = await openPage();
  try {
    for (const c of await cardInfo(page)) {
      const kb = fs.statSync(path.join(ROOT, c.src)).size / 1024;
      assert.ok(kb < 10, `${c.src} is ${kb.toFixed(1)} KB`);
    }
  } finally { await close(); }
});

test('icons stay visible in dark mode', { todo: 'redesign' }, async () => {
  // Black line-art on a dark card is invisible. Either the card keeps a
  // light background in dark mode, or the icon is inverted.
  const { page, close } = await openPage({ theme: 'dark' });
  try {
    const results = await page.$$eval('.vehicle-card', cards => cards.map(c => {
      const img = c.querySelector('img');
      const bg = getComputedStyle(c).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      const lum = (bg[0] * 299 + bg[1] * 587 + bg[2] * 114) / 1000;
      const inverted = /invert\((1|100%)\)/.test(getComputedStyle(img).filter);
      return { src: img.getAttribute('src'), ok: lum > 128 || inverted };
    }));
    for (const r of results) assert.ok(r.ok, `${r.src} is dark-on-dark in dark mode`);
  } finally { await close(); }
});

test('"All Types" icon is a picture, not baked-in English text', { todo: 'redesign' }, () => {
  const svg = fs.readFileSync(path.join(ROOT, 'assets', 'vehicle-all.svg'), 'utf8');
  assert.doesNotMatch(svg, /<text[\s>]/, 'vehicle-all.svg contains a <text> element');
});
