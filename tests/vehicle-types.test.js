// Tests for the "Supported Vehicle Types" footer section.
// Run with: npm test   (first time: npm install && npx playwright install chromium)
//

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
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

let server, browser, baseUrl, origin;

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
  baseUrl = `${origin}/index.html`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

// Third-party scripts (EmailJS, reCAPTCHA) aren't needed here; stub them so
// the tests run offline.
async function openPage({ width = 1280, height = 900, lang, theme, url } = {}) {
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
  await page.goto(url ? origin + url : baseUrl);
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

/* ---------------- Section behaviour ---------------- */

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

/* ---------------- Image set rules ---------------- */

// Every local file named in an <img> src/srcset, relative to the site root
const imageFiles = img => [img.src, ...(img.srcset || '').split(',').map(c => c.trim().split(/\s+/)[0])]
  .filter(Boolean).map(u => u.replace(/^\//, ''));

test('all vehicle images are WebP 3D renders with a 1x and 2x size', async () => {
  const { page, close } = await openPage();
  try {
    const imgs = await page.$$eval('.vehicle-card img', is => is.map(i => ({
      src: i.getAttribute('src'), srcset: i.getAttribute('srcset') })));
    for (const img of imgs) {
      const files = imageFiles(img);
      assert.ok(files.length >= 3, `${img.src} has no srcset`);
      for (const f of files) {
        assert.match(f, /^assets\/vehicles\/[a-z]+-\d+\.webp$/, `${f} is not a vehicle WebP`);
        assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} is missing`);
      }
    }
  } finally { await close(); }
});

test('card images stay light (1x under 20 KB) and do not shift the layout', async () => {
  const { page, close } = await openPage();
  try {
    const imgs = await page.$$eval('.vehicle-card img', is => is.map(i => ({
      src: i.getAttribute('src'), w: i.getAttribute('width'), h: i.getAttribute('height'),
      loading: i.getAttribute('loading') })));
    for (const img of imgs) {
      const kb = fs.statSync(path.join(ROOT, img.src)).size / 1024;
      assert.ok(kb < 20, `${img.src} is ${kb.toFixed(1)} KB`);
      assert.ok(img.w && img.h, `${img.src} has no width/height`);
      assert.equal(img.loading, 'lazy', `${img.src} is not lazy-loaded`);
    }
  } finally { await close(); }
});

for (const theme of ['light', 'dark']) {
  test(`renders sit on a white tile so they read in ${theme} mode`, async () => {
    const { page, close } = await openPage({ theme });
    try {
      const bgs = await page.$$eval('.vehicle-card img', is => is.map(i => getComputedStyle(i).backgroundColor));
      for (const bg of bgs) assert.equal(bg, 'rgb(255, 255, 255)');
    } finally { await close(); }
  });
}

/* ---------------- Vehicle type pages (vehicles/<type>/) ---------------- */

const SLUGS = ['car', 'truck', 'bus', 'motorcycle', 'all'];

test('each card links to its own vehicle page', async () => {
  const { page, close } = await openPage();
  try {
    const hrefs = await page.$$eval('.vehicle-card', cs => cs.map(c => c.getAttribute('href')));
    assert.deepEqual(hrefs, SLUGS.map(s => `/vehicles/${s}/`));
  } finally { await close(); }
});

test('tapping a card opens its page with the icon and description', async () => {
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', 'en.json'), 'utf8'));
  const { page, close } = await openPage();
  try {
    await page.click('.vehicle-card[href="/vehicles/truck/"]');
    await page.waitForURL('**/vehicles/truck/');
    assert.equal((await page.textContent('.vehicle-page-title')).trim(), en.vehicle_truck);
    assert.equal((await page.textContent('.vehicle-page-desc')).trim(), en.vehicle_truck_desc);
  } finally { await close(); }
});

for (const lang of ['en', 'ar']) {
  test(`every vehicle page shows its icon and description (${lang})`, async () => {
    const t = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', `${lang}.json`), 'utf8'));
    for (const slug of SLUGS) {
      const { page, failed, close } = await openPage({ lang, url: `/vehicles/${slug}/` });
      try {
        await page.waitForFunction(v => document.querySelector('.vehicle-page-desc').textContent === v, t[`vehicle_${slug}_desc`]);
        assert.equal(await page.getAttribute('html', 'dir'), lang === 'ar' ? 'rtl' : 'ltr');
        assert.ok(await page.$eval('.vehicle-page-icon', i => i.complete && i.naturalWidth > 0), `${slug} icon did not load`);
        assert.deepEqual(failed, [], 'some requests failed');
      } finally { await close(); }
    }
  });
}

test('?lang= in the address picks the language on a vehicle page', async () => {
  const ar = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages', 'ar.json'), 'utf8'));
  const { page, close } = await openPage({ url: '/vehicles/bus/?lang=ar' });
  try {
    await page.waitForFunction(v => document.querySelector('.vehicle-page-title').textContent === v, ar.vehicle_bus);
    assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
  } finally { await close(); }
});

test('vehicle pages fit a phone screen in Arabic without horizontal scrolling', async () => {
  for (const slug of SLUGS) {
    const { page, close } = await openPage({ width: 375, lang: 'ar', url: `/vehicles/${slug}/` });
    try {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 0, `/vehicles/${slug}/ overflows by ${overflow}px at 375px`);
    } finally { await close(); }
  }
});
