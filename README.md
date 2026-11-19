
# Carventory - Vehicle Passport

A responsive website for Carventory - Vehicle Passport, featuring multi-language support and dark/light mode toggle. The design follows the Carventory Brand & Design System in Figma.

> **Project status, rules for changes and what's next:** see [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

## Quick Start

To run the development server:

```bash
python -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

## Project Structure

```
pos-vehicles-site/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── style.css           # Styling
├── pricing.json        # Monthly plan prices (JOD / USD / AED)
├── languages/          # Translation files
│   ├── en.json        # English
│   ├── ar.json        # Arabic
│   ├── fr.json        # French
│   ├── hi.json        # Hindi
│   ├── id.json        # Indonesian
│   ├── ja.json        # Japanese
│   ├── ko.json        # Korean
│   ├── th.json        # Thai
│   ├── tr.json        # Turkish
│   ├── vi.json        # Vietnamese
│   └── zh.json        # Chinese
├── assets/            # Logo, icons and self-hosted fonts
├── tests/             # Playwright tests (npm test)
└── CNAME              # Domain configuration
```

## Updating Pricing

The **Pricing** tab is built from two places:

- **Prices:** `pricing.json`. Each business role (`autoparts`, `towing`, `servicecenter`) has `basic`, `pro` and `enterprise`, each with a monthly price in `JOD`, `USD` and `AED`. Vehicle owners (`b2c.owner`) are free.
- **Text and feature lists:** the `pricing_*` keys and the `pricing_features` lists in every file in `languages/`.

`npm test` fails while any price is `null` or a feature list still says `TODO`. After editing, bump `?v=` in `index.html` (see below).

## Publishing Changes

GitHub Pages lets browsers keep a saved copy of each file for up to 10 minutes, so visitors can see a mix of old and new files after a deploy.
To avoid that, **bump the `?v=` date in `index.html`** (on both the `style.css` and `script.js` lines) whenever you change
`style.css`, `script.js` or any file in `languages/`. The script reuses that version for the language files automatically.

## Adding a New Language

### Step 1: Create a New Language File

1. Navigate to the `languages/` folder
2. Create a new JSON file with the language code as filename (e.g., `es.json` for Spanish, `pt.json` for Portuguese)

### Step 2: Copy Key Structure

Copy all keys from an existing language file (e.g., `en.json`). Make sure your new language file contains **exactly the same keys** as the reference file. Example structure:

```json
{
    "title": "Your Translation Here",
    "header_title": "Your Translation",
    "header_tagline": "Your Translation",
    "tab_about": "Your Translation",
    "tab_contact": "Your Translation",
    ...
}
```

### Step 3: Translate Values

Replace each English value with the translation in your target language. Keep the key names unchanged.

```json
{
    "title": "[Spanish Translation]",
    "header_title": "[Spanish Translation]",
    ...
}
```

### Step 4: Update Language Selector

Once your language file is ready with all translations, update the language selector in your application's settings/menu to include the new language option.

### Important Notes

- **Key Consistency**: Every language file must have the exact same keys as `en.json`
- **JSON Format**: Ensure valid JSON formatting (proper quotes, commas, brackets)
- **No Missing Keys**: Do not skip any keys from the reference file
- **Naming Convention**: Use standard ISO 639-1 language codes:
  - `es.json` for Spanish
  - `pt.json` for Portuguese
  - `ru.json` for Russian
  - `de.json` for German
  - etc.

## Running the Tests

The tests use Playwright and need **Node.js 20 or newer**:

```bash
npm install
npx playwright install chromium
npm test
```

## Features

- Multi-language support (11+ languages)
- Dark/Light mode toggle
- Responsive design
- Complete management solution for automotive businesses

## About

This web page represents Vehicle Passport, the platform from our startup company Carventory, designed for managing vehicles, sales, workshop jobs, and inventory from one unified platform. 
