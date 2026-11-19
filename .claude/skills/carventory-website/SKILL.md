---
name: carventory-website
description: How to change the Carventory – Vehicle Passport marketing website (www.carventory.co) in this repo - text and translations in 11 languages, pricing plans, legal pages (privacy, terms) synced from the app repo, design tokens from the Carventory Figma system, tabs and sections, contact form, cache-busting version, tests and PR flow. Use for any edit to index.html, style.css, script.js, legal.js, pricing.json, languages/*.json, privacy/, terms/ or assets/, and for questions about how the site works.
---

# Carventory website

The public site for **Carventory – Vehicle Passport**. It's plain HTML, CSS and JS with no build step, and GitHub Pages deploys it from `main`. Read `docs/PROJECT_STATUS.md` first for the current state, prices and open to-dos. This skill covers **how** to change things safely.

## Checklist for every change

1. **Branch from `origin/main`** (`git fetch && git checkout -b <type>/<name> origin/main`). Never commit to `main`. Check whether an earlier PR already merged before adding to its branch: commits pushed after a merge never reach `main`.
2. Make the change following the rules below.
3. **Bump the asset version** if you touched `style.css`, `script.js`, `pricing.json` or any `languages/*.json`:
   `python3 -I .claude/skills/carventory-website/scripts/bump_version.py`
4. **Run the checks:** `python3 -I .claude/skills/carventory-website/scripts/check_site.py` (no dependencies; required). `npm test` (Playwright, Node 20+) is an optional extra, not part of publishing.
5. **Look at it in a browser:** `python3 -m http.server 8765`, then open http://localhost:8765/. Check English, **Arabic (RTL)**, **375px phone width**, and **dark mode**.
6. Commit with a message that says what and why, push, and open a PR against `main`. Update `docs/PROJECT_STATUS.md` when the state, prices, version or to-dos change.

## Where things live

| To change… | Edit |
|---|---|
| Any visible text | `languages/<lang>.json` (**all 11 files**), plus the English fallback text in `index.html` |
| Prices | `pricing.json` only: `b2b.<role>.<tier>.{JOD,USD,AED}` |
| Plan feature lists | `pricing_features` in every language file |
| Colours, spacing, radius, type | `--cv-*` tokens at the top of `style.css` |
| Logo | `assets/logo-mark-light.svg` / `logo-mark-dark.svg` (swapped by `applyTheme` in `script.js`) |
| Tab icon / home-screen icon | `assets/app-icon.svg`, `favicon-32.png`, `apple-touch-icon.png` |
| Contact form sending | EmailJS and reCAPTCHA settings at the top of `script.js` |
| Privacy Policy / Terms | **Not here.** Edit the drafts in the app repo, then run `tools/sync_legal.py` (see "Legal pages") |

Languages: `ar en fr hi id ja ko th tr vi zh`. Arabic is right-to-left and is the main market.
Roles: `autoparts` (main revenue product), `towing`, `servicecenter` (B2B, with `basic|pro|enterprise` tiers) and `owner` (B2C, free).

## Rules

### Text and translations
- An element gets its text from `data-i18n="key"` (and its `aria-label` from `data-i18n-aria="key"`). `loadLanguage()` in `script.js` copies **strings only**, so nested objects like `pricing_features` are read by code.
- **Every language file must have exactly the same keys.** Add new keys to all 11 files in the same position. Don't re-dump JSON with a formatter; insert lines so diffs stay small.
- Brand and person names stay in Latin script in every language: **Carventory**, **Mohammad Khaleel Suliman**. The product name is translated after "Carventory - " (e.g. `Carventory - جواز المركبة`).
- The page title, header (`title`, `header_title`) and the About heading include the company name.
- Use `{role}` and `{plan}` placeholders, as in `pricing_subject`, instead of building sentences in JS.

### Design (Figma "Carventory — Brand & Design System", key `rdtuNnIAxJFm6oftK9Af3g`)
- Flat style: **black + one blue accent**, no gradients, subtle shadows.
- Use only the `--cv-*` tokens. Light values live in `:root` and dark ones in `html[data-theme="dark"]`.
- `--cv-brand` (Electric Blue `#2F6BFF`) is **only** for the logo, icons and graphics. Buttons and links use `--cv-primary` (Action Blue). `--cv-danger` is only for destructive actions.
- Buttons: `.btn` + `.btn-primary` (one per view) / `.btn-outline` / `.btn-tonal` / `.btn-inverse` / `.btn-danger`, all pill-shaped.
- Chips: `.tab-btn` is **only** for the main tabs, because `switchTab()` clears `.active` on every `.tab-btn`. Use `.chip` for any other toggle group.
- Fonts are self-hosted in `assets/fonts/` (Inter, and IBM Plex Sans Arabic for RTL). Don't add Google Fonts links: the CSP in `index.html` only allows `'self'`.
- Numbers (prices, phone, stats) use `font-variant-numeric: tabular-nums`.

### Layout, RTL and phones
- Prefer logical properties (`inset-inline-start`, `margin-inline-*`). The RTL overrides live in the "RTL" block at the end of `style.css`.
- **Never hide things with big negative offsets** (`left: -10000px`). In RTL the page scrolls left, which makes it thousands of pixels wide and shows a blank white area on phones. To hide something visually, use the clip pattern on `.hp-field`.
- Mixed-direction values (phone numbers, codes) get `dir="ltr"`.
- Centred text inside RTL sections needs an explicit `html[dir="rtl"] … { text-align: center }`, because the RTL block right-aligns paragraphs.

### Tabs and navigation
- Tabs are `<button class="tab-btn" data-tab="id">` plus `<section id="id" class="tab-pane">`. `switchTab(id)` handles them, and `/#id` opens a tab on load.
- Buttons that open a tab use `data-action="<tab id>"`. Never match on button text: it changes with the language.
- The header logo is a plain link with `target="_blank"` that opens the home page in a new tab.

### Pricing
- `initPricing()` renders the cards from `pricing.json` and the language file with DOM APIs (`textContent`, never `innerHTML`). It re-renders on the `languagechange` event.
- Prices are set **by hand in each currency**, kept within ~3% of the pegged rates (1 JOD ≈ 1.41 USD ≈ 5.18 AED), and use charm endings (19, 39, 79). The Pro tier is featured.
- Currency defaults to JOD in Arabic and USD otherwise, and is remembered in `localStorage` (`pricing_currency`).
- "Get started" opens Contact and pre-fills the subject.

### Security and privacy
- Keep the CSP in `index.html` strict. If you add a third-party script, add its exact host and use a pinned version with `integrity` (as with EmailJS).
- Wrap `localStorage` in try/catch (`readStored` / `writeStored`).
- Don't put personal data in URLs. Don't commit secrets: the EmailJS public key and reCAPTCHA site key are public by design, but private keys never belong here.

### Cache-busting
GitHub Pages sends `max-age=600`. `index.html` loads `style.css?v=…` and `script.js?v=…`, and the script reuses the same `v` for language files and `pricing.json`. **One value, bumped on every content change.** Otherwise visitors see a mix of old and new files for up to 10 minutes after a deploy.

## Legal pages

| Page | Source draft (EN + `.ar.md`) |
|---|---|
| `privacy/index.html` → `/privacy/` | `PRIVACY_POLICY.md` |
| `terms/index.html` → `/terms/` (car owners) | `TERMS_OF_USE.md` |
| `terms/business/index.html` → `/terms/business/` | `TERMS_OF_SERVICE.md` |

- **The drafts are the source of truth.** They live in the private app repo (`vehiclepos`, `docs/Carventory_doc/06_Legal/`) and the site copy must match them word for word. **Never hand-edit** the generated pages or `legal/manifest.json`.
- **To update:** `python3 -I tools/sync_legal.py` (from GitHub with your `gh` login, `--ref <branch|sha>` optional) or `--from-dir <local 06_Legal folder>`. Then run `check_site.py` and open a PR. The script reuses the current `?v=` from `index.html`.
- **The converter** supports only what the drafts use: `#`/`##`/`###`, paragraphs (wrapped lines are joined), `-` lists with 2-space nesting, `|` tables, `>` notice, `**bold**`, `` `code` ``, and links between the three `.md` files (rewritten to the page URLs, keeping `?lang=ar`). If a draft starts using something else, extend `markdown_to_html()` and check the output.
- **One page per document holds both languages** (`<article data-lang-part="en|ar">`). `legal.js` shows one: `?lang=en|ar` wins, otherwise the site's saved `app_lang` (`ar` → Arabic, anything else → English).
- **While a draft has `[OWNER TO FILL]`, `[LAWYER]` or "DRAFT",** its page gets `noindex`, the manifest says `"status": "draft"`, and **`check_site.py` fails if `index.html` links to it**.
- **Go-live, once the drafts are final:**
  1. sync
  2. add footer links "Privacy Policy · Terms of Use · Terms for Businesses" (new keys in all 11 languages; link with `?lang=ar` only from Arabic, the rest English)
  3. bump `?v=`
  4. open a PR
- **Mobile apps** open `https://www.carventory.co/privacy/?lang=ar|en`, `/terms/` and `/terms/business/` in an in-app browser, and may read `/legal/manifest.json` (`version`, `status`, `last_updated` per document) to ask users to review a new version. Use the same privacy URL in App Store Connect and Google Play.
- Use the trailing slash (`/privacy/`): GitHub Pages redirects `/privacy` to it.

## Testing

- `scripts/check_site.py` checks, with no dependencies:
  - identical keys across languages, with no empty strings
  - every `data-i18n` key exists
  - `pricing.json` is complete, with no `null`, and no `TODO` in feature lists
  - `?v=` is the same on every page
  - there are no huge negative offsets in CSS
  - the legal pages are bilingual, and no draft is linked from the site
- `scripts/bump_version.py` never moves the version backwards: an older value may still be cached by browsers, and a teammate's clock may differ.
- `npm test` runs the Playwright suites (`tests/*.test.js`). It **needs Node 20+**. Each test starts its own static server and stubs EmailJS and reCAPTCHA. `pricing.test.js` serves sample prices for the UI tests and also checks the real data.
- Add a regression test for every bug you fix (see the Arabic "Get started" width test).

## Gotchas

- Screenshots right after a tab switch look faded, because of the `fadeInUp` animation. Wait about 1s.
- The preview browser in the Claude desktop app can't open `target="_blank"` pop-ups. Check the link attributes instead.
- Visit **http://**localhost:8765, not https. The Python server logs garbled 400 lines for https attempts, and they're harmless.
- The Figma MCP is on a Starter plan and hits its call limit quickly. Export assets in as few calls as possible. Exported SVGs include the canvas background: strip the background rect and frame paths before use.
- The default `node` on the main dev Mac is v16. Use Node 20+ for tests.
