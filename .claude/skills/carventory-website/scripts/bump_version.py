#!/usr/bin/env python3
"""Bump the cache-busting ?v= version on style.css and script.js in index.html.

New version is today's date (YYYY-MM-DD); if today's date is already used it
becomes YYYY-MM-DD.2, .3, ... Pass an explicit version to override:

    python3 -I .claude/skills/carventory-website/scripts/bump_version.py
    python3 -I .claude/skills/carventory-website/scripts/bump_version.py 2026-12-01
"""
import datetime
import re
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parents[4] / "index.html"
PATTERN = re.compile(r'((?:style\.css|script\.js)\?v=)([^"]+)(")')

html = INDEX.read_text(encoding="utf-8")
current = {m.group(2) for m in PATTERN.finditer(html)}
if not current:
    sys.exit("index.html: no ?v= found on style.css / script.js")
old = sorted(current)[-1]

if len(sys.argv) > 1:
    new = sys.argv[1]
else:
    today = datetime.date.today().isoformat()
    if old == today or old.startswith(today + "."):
        n = int(old.split(".", 1)[1]) + 1 if "." in old else 2
        new = f"{today}.{n}"
    else:
        new = today

html, count = PATTERN.subn(lambda m: m.group(1) + new + m.group(3), html)
INDEX.write_text(html, encoding="utf-8")
print(f"?v= {old} -> {new} ({count} references updated)")
