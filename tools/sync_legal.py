#!/usr/bin/env python3
"""Publish the Carventory legal drafts as website pages.

The Privacy Policy and Terms are written (English + Arabic Markdown) in the
private app repository. This script copies them into this public website as:

    privacy/index.html          <- PRIVACY_POLICY.md   + PRIVACY_POLICY.ar.md
    terms/index.html            <- TERMS_OF_USE.md     + TERMS_OF_USE.ar.md
    terms/business/index.html   <- TERMS_OF_SERVICE.md + TERMS_OF_SERVICE.ar.md
    legal/manifest.json         <- versions and URLs, for the mobile apps

Never edit those generated files by hand: change the drafts, then run this again.

Usage (from the repo root):
    python3 -I tools/sync_legal.py                    # from GitHub, branch main (uses your `gh` login)
    python3 -I tools/sync_legal.py --ref <branch|sha>
    python3 -I tools/sync_legal.py --from-dir <path to 06_Legal>
Standard library only.
"""
import argparse
import datetime
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_REPO = "Mohammad-KS90/vehiclepos"
SOURCE_PATH = "docs/Carventory_doc/06_Legal"
SITE = "https://www.carventory.co"

DOCS = [
    # key,            source base name,   output page,                 public path
    # (trailing slash: GitHub Pages serves folder/index.html there without a redirect)
    ("privacy",        "PRIVACY_POLICY",   "privacy/index.html",        "/privacy/"),
    ("terms",          "TERMS_OF_USE",     "terms/index.html",          "/terms/"),
    ("terms_business", "TERMS_OF_SERVICE", "terms/business/index.html", "/terms/business/"),
]
LINK_TARGETS = {base: path for _, base, _, path in DOCS}
LANGS = {"en": "", "ar": ".ar"}
PLACEHOLDER = re.compile(r"\[(?:OWNER TO FILL|LAWYER)\b")

UI = {
    "en": {"lang_label": "Language", "related": "Related", "home": "Carventory home",
           "rights": "All rights reserved."},
    "ar": {"lang_label": "اللغة", "related": "ذات صلة", "home": "الصفحة الرئيسية لـ Carventory",
           "rights": "جميع الحقوق محفوظة."},
}


# ---------------------------------------------------------------- sources
def read_sources(args):
    texts = {}
    for _, base, _, _ in DOCS:
        for lang, suffix in LANGS.items():
            name = f"{base}{suffix}.md"
            if args.from_dir:
                texts[(base, lang)] = (Path(args.from_dir) / name).read_text(encoding="utf-8")
            else:
                url = f"repos/{SOURCE_REPO}/contents/{SOURCE_PATH}/{name}?ref={args.ref}"
                out = subprocess.run(["gh", "api", url, "-H", "Accept: application/vnd.github.raw"],
                                     capture_output=True, text=True)
                if out.returncode != 0:
                    sys.exit(f"Could not download {name}: {out.stderr.strip()}")
                texts[(base, lang)] = out.stdout
    return texts


# ---------------------------------------------------------------- markdown
def inline(text, lang):
    """Escape, then apply **bold**, `code` and [links](target)."""
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)

    def link(m):
        label, target = m.group(1), m.group(2).strip()
        base = re.sub(r"(\.ar)?\.md$", "", target.split("#")[0])
        if base in LINK_TARGETS:
            href = LINK_TARGETS[base] + ("?lang=ar" if lang == "ar" else "")
            return f'<a href="{html.escape(href)}">{label}</a>'
        if re.match(r"https?://", target):
            return f'<a href="{html.escape(target)}" rel="noopener">{label}</a>'
        return label  # unknown relative link: keep the text only
    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, out)


def heading_id(text, lang, used):
    m = re.match(r"(\d+(?:\.\d+)*)\.?\s", text)
    slug = ("s" + m.group(1).replace(".", "-")) if m else (
        re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "section")
    slug = f"{lang}-{slug}"
    n, base = 2, slug
    while slug in used:
        slug, n = f"{base}-{n}", n + 1
    used.add(slug)
    return slug


def markdown_to_html(md, lang):
    """Convert the subset of Markdown the legal drafts use. Returns (title, notice, body_html)."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    lines = [ln.rstrip() for ln in md.splitlines()
             if not re.fullmatch(r"\s*</?div[^>]*>\s*", ln)]
    out, used = [], set()
    title, notice = "", ""
    i = 0

    def is_block_start(ln):
        return bool(re.match(r"(#{1,3} |> |\||\s*- )", ln))

    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        m = re.match(r"(#{1,3}) (.*)", ln)
        if m:
            level, text = len(m.group(1)), m.group(2).strip()
            if level == 1 and not title:
                title = text
                out.append(f"<h1>{inline(text, lang)}</h1>")
            else:
                hid = heading_id(text, lang, used)
                out.append(f'<h{level} id="{hid}">{inline(text, lang)}</h{level}>')
            i += 1
            continue
        if ln.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].startswith(">"):
                buf.append(lines[i].lstrip("> ").strip())
                i += 1
            text = " ".join(buf)
            notice = notice or text
            out.append(f'<div class="legal-notice" role="note"><p>{inline(text, lang)}</p></div>')
            continue
        if ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            t = ['<div class="legal-table"><table>', "<thead><tr>"]
            t += [f'<th scope="col">{inline(c, lang)}</th>' for c in head]
            t.append("</tr></thead><tbody>")
            for r in body:
                t.append("<tr>" + "".join(f"<td>{inline(c, lang)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t))
            continue
        if re.match(r"\s*- ", ln):
            # collect items: (indent, text), joining wrapped continuation lines
            items = []
            while i < len(lines) and lines[i].strip():
                cur = lines[i]
                m = re.match(r"(\s*)- (.*)", cur)
                if m:
                    items.append([len(m.group(1)), m.group(2).strip()])
                elif items and cur.startswith(" "):
                    items[-1][1] += " " + cur.strip()
                else:
                    break
                i += 1
            out.append(render_list(items, lang))
            continue
        # paragraph: join wrapped lines until a blank line or another block
        buf = [ln.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not is_block_start(lines[i]):
            buf.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(buf), lang)}</p>")
    return title, notice, "\n".join(out)


def render_list(items, lang):
    html_parts, stack = [], []
    for indent, text in items:
        while stack and indent < stack[-1]:
            html_parts.append("</li></ul>")
            stack.pop()
        if not stack or indent > stack[-1]:
            html_parts.append("<ul>")
            stack.append(indent)
        else:
            html_parts.append("</li>")
        html_parts.append(f"<li>{inline(text, lang)}")
    while stack:
        html_parts.append("</li></ul>")
        stack.pop()
    return "".join(html_parts)


def notice_meta(notice):
    version = re.search(r"(?:Version|الإصدار)\s*([\d.]+)", notice)
    updated = re.search(r"(?:Last updated|آخر تحديث)\s*:\s*(.+)$", notice)
    upd = updated.group(1).strip() if updated else None
    if upd and PLACEHOLDER.search(upd):
        upd = None
    return (version.group(1) if version else None), upd


# ---------------------------------------------------------------- pages
CSP = ("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; object-src 'none'; "
       "base-uri 'self'; form-action 'self'; upgrade-insecure-requests")


def asset_version():
    m = re.search(r'style\.css\?v=([^"]+)"', (ROOT / "index.html").read_text(encoding="utf-8"))
    return m.group(1) if m else "1"


def build_page(key, path, parts, titles, draft, v):
    robots = '\n    <meta name="robots" content="noindex">' if draft else ""
    articles = []
    for lang in LANGS:
        title, body = parts[lang]
        related = [(k, p) for k, _, _, p in DOCS if k != key]
        rel = "".join(
            f'<li><a href="{p}{"?lang=ar" if lang == "ar" else ""}">{html.escape(titles[(k, lang)])}</a></li>'
            for k, p in related)
        articles.append(f'''        <article class="legal-doc" lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}" data-lang-part="{lang}"{' hidden' if lang != 'en' else ''}>
{body}
            <nav class="legal-related" aria-label="{UI[lang]['related']}">
                <h2>{UI[lang]['related']}</h2>
                <ul>{rel}</ul>
            </nav>
        </article>''')
    rights = "".join(
        f'<span lang="{lang}" data-lang-part="{lang}"{" hidden" if lang != "en" else ""}>{UI[lang]["rights"]}</span>'
        for lang in LANGS)
    return f'''<!DOCTYPE html>
<!-- Generated by tools/sync_legal.py from the legal drafts. Do not edit by hand. -->
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="{CSP}">
    <meta name="referrer" content="strict-origin-when-cross-origin">{robots}
    <title>{html.escape(titles[(key, "en")])}</title>
    <link rel="canonical" href="{SITE}{path}">
    <link rel="icon" href="/assets/app-icon.svg" type="image/svg+xml">
    <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
    <meta name="theme-color" content="#0A0A0B">
    <link rel="stylesheet" href="/style.css?v={v}">
    <script src="/legal.js?v={v}" defer></script>
</head>
<body class="legal-page">
    <header class="legal-header">
        <a class="legal-home" href="/" aria-label="{UI['en']['home']}">
            <img src="/assets/logo-mark-light.svg" class="legal-logo" width="48" height="48" alt="Carventory logo">
        </a>
        <nav class="chip-group legal-lang" aria-label="{UI['en']['lang_label']}">
            <a class="chip" href="?lang=en" data-lang="en" hreflang="en" lang="en">English</a>
            <a class="chip" href="?lang=ar" data-lang="ar" hreflang="ar" lang="ar">العربية</a>
        </nav>
    </header>

    <main class="legal-main">
{chr(10).join(articles)}
    </main>

    <footer class="site-footer">
        <p class="copyright">&copy; <span class="copyright-year">2026</span> Mohammad Khaleel Suliman. {rights}</p>
    </footer>
</body>
</html>
'''


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ref", default="main", help="branch or commit in the source repo (default: main)")
    ap.add_argument("--from-dir", help="read the .md files from this local folder instead of GitHub")
    args = ap.parse_args()

    texts = read_sources(args)
    v = asset_version()
    converted, titles, report, manifest_docs = {}, {}, [], {}

    for key, base, _, _ in DOCS:
        for lang in LANGS:
            title, notice, body = markdown_to_html(texts[(base, lang)], lang)
            if not title:
                sys.exit(f"{base} ({lang}): no '# ' title found")
            converted[(key, lang)] = (title, notice, body)
            titles[(key, lang)] = title

    for key, base, out_rel, path in DOCS:
        gaps = {lang: len(PLACEHOLDER.findall(texts[(base, lang)])) for lang in LANGS}
        notices = " ".join(converted[(key, lang)][1] for lang in LANGS)
        draft = any(gaps.values()) or bool(re.search(r"DRAFT|مسودة", notices))
        version, updated = notice_meta(converted[(key, "en")][1])
        parts = {lang: (converted[(key, lang)][0], converted[(key, lang)][2]) for lang in LANGS}
        page = build_page(key, path, parts, titles, draft, v)
        out = ROOT / out_rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding="utf-8")
        manifest_docs[key] = {
            "url": SITE + path,
            "version": version,
            "last_updated": updated,
            "status": "draft" if draft else "final",
            "languages": list(LANGS),
            "titles": {lang: titles[(key, lang)] for lang in LANGS},
        }
        report.append(f"  {path:<16} v{version or '?'}  {'DRAFT' if draft else 'final'}  "
                      f"gaps: en {gaps['en']}, ar {gaps['ar']}  -> {out_rel}")

    statuses = {d["status"] for d in manifest_docs.values()}
    manifest = {
        "generated": datetime.date.today().isoformat(),
        "status": "final" if statuses == {"final"} else "draft",
        "documents": manifest_docs,
    }
    (ROOT / "legal").mkdir(exist_ok=True)
    (ROOT / "legal" / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Published {len(DOCS)} documents x {len(LANGS)} languages (asset version {v}):")
    print("\n".join(report))
    print("  legal/manifest.json")
    if manifest["status"] != "final":
        print("Still draft: keep the pages unlinked from index.html until every gap is filled.")


if __name__ == "__main__":
    main()
