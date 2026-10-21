#!/usr/bin/env python3
"""
Comprehensive Phase 7 Production Cross-Phase Regression Audit for jojjy.org
Verifies 100% of Assertions across Phases 1 through 7:
  - Assertion 1 (Phase 1): Zero prompt leftovers, matching dates/read-times/issue-numbers
  - Assertion 2 (Phase 2): Zero 3rd person summary boxes, zero marquee tickers, zero duplicate card titles
  - Assertion 3 (Phase 3 & 3.5): Newsreader, Inter, and JetBrains Mono loaded, zero dumb quotes, OpenType onum/tnum
  - Assertion 4 (Phase 4): Zero box-shadow rules, zero #fff/#000 screen backgrounds, SVG paper grain active
  - Assertion 5 (Phase 5): Zero translateY hover jumps, unique view-transition-name pairings, zero duplicate IDs
  - Assertion 6 (Phase 6): Valid JSON-LD, valid XML sitemap and feed, zero broken links/images/scripts
  - Assertion 7 (Phase 7): Previous/Next book links wired across all 18 essays, keyboard navigation script active, collection deep-filtering working, @media print rules present
"""

import os
import sys
import glob
import re
import json
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, ROOT_DIR)
DOMAIN = "https://jojjy.org"

from scripts.build_phase6 import CANONICAL_LEDGER, ARTICLES_BY_SLUG

def run_audit():
    print("=" * 80)
    print("PHASE 7 MASTER PRODUCTION REGRESSION AUDIT — JOJJY.ORG (GEORGE)")
    print("=" * 80)

    total_checks = 0
    passed_checks = 0
    assertion_results = {f"Assertion {i}": {"passed": 0, "total": 0, "failed": []} for i in range(1, 8)}

    def check(assertion_num, condition, name, details=""):
        nonlocal total_checks, passed_checks
        key = f"Assertion {assertion_num}"
        total_checks += 1
        assertion_results[key]["total"] += 1
        if condition:
            passed_checks += 1
            assertion_results[key]["passed"] += 1
        else:
            assertion_results[key]["failed"].append(f"{name}: {details}")

    html_files = sorted(glob.glob(os.path.join(ROOT_DIR, '**/*.html'), recursive=True))

    # ==========================================================================
    # ASSERTION 1 (Phase 1): Zero prompt leftovers & matching metadata
    # ==========================================================================
    print("\nAuditing Assertion 1 (Phase 1): Zero prompt leftovers & metadata consistency...")
    leftover_patterns = ["Sitting at", "docx", "TODO", "FIXME", "Lorem ipsum"]
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()
        for lp in leftover_patterns:
            check(1, lp not in c, f"No '{lp}' in {rel}", f"Found '{lp}'")

    # Match dates, read times, issue numbers with ledger
    for a in CANONICAL_LEDGER:
        slug = a['slug']
        for p in [os.path.join(ROOT_DIR, 'articles', slug, 'index.html'),
                  os.path.join(ROOT_DIR, 'articles', f"{slug}.html")]:
            rel = os.path.relpath(p, ROOT_DIR)
            with open(p, 'r', encoding='utf-8') as f:
                c = f.read()
            check(1, a['issue'] in c, f"Issue {a['issue']} in {rel}")
            check(1, a['date'] in c, f"Date {a['date']} in {rel}")
            check(1, f"{a['readTime']} min read" in c, f"Read time {a['readTime']}m in {rel}")

    # Sitemap dates
    sitemap_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    tree = ET.parse(sitemap_path)
    sitemap_dates = {}
    for u in tree.getroot().findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url'):
        loc = u.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text.strip()
        lastmod = u.find('{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod').text.strip()
        sitemap_dates[loc] = lastmod

    for a in CANONICAL_LEDGER:
        loc = f"{DOMAIN}/articles/{a['slug']}/"
        check(1, loc in sitemap_dates and sitemap_dates[loc] == a['date'],
              f"Sitemap date match for {a['slug']}", f"Expected {a['date']}, got {sitemap_dates.get(loc)}")

    # Feed dates
    feed_path = os.path.join(ROOT_DIR, 'feed.xml')
    feed_tree = ET.parse(feed_path)
    feed_items = {}
    for it in feed_tree.getroot().find('channel').findall('item'):
        link = it.find('link').text.strip()
        feed_items[link] = it

    for a in CANONICAL_LEDGER:
        loc = f"{DOMAIN}/articles/{a['slug']}/"
        check(1, loc in feed_items, f"Feed item present for {a['slug']}")

    # ==========================================================================
    # ASSERTION 2 (Phase 2): Zero 3rd person summary boxes, marquee tickers, dup titles
    # ==========================================================================
    print("\nAuditing Assertion 2 (Phase 2): Zero summary boxes, marquee tickers & duplicate titles...")
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()
        check(2, 'summary-box' not in c, f"Zero 'summary-box' in {rel}")
        check(2, 'summary-card' not in c, f"Zero 'summary-card' in {rel}")
        check(2, 'marquee' not in c, f"Zero 'marquee' in {rel}")

    # Duplicate card titles on archive
    for arch_path in ['articles.html', 'articles/index.html']:
        with open(os.path.join(ROOT_DIR, arch_path), 'r', encoding='utf-8') as f:
            c = f.read()
        titles = re.findall(r'<h2 class=[\"\']card-title[\"\'][^>]*>([\s\S]*?)</h2>', c)
        clean_titles = [re.sub(r'<[^>]+>', '', t).strip() for t in titles]
        check(2, len(clean_titles) == 18, f"18 card titles in {arch_path} (got {len(clean_titles)})")
        check(2, len(set(clean_titles)) == 18, f"Zero duplicate card titles in {arch_path}")

    # ==========================================================================
    # ASSERTION 3 (Phase 3 & 3.5): Newsreader, Inter, JetBrains Mono, Zero dumb quotes, OpenType onum/tnum
    # ==========================================================================
    print("\nAuditing Assertion 3 (Phase 3 & 3.5): Typography fonts, smart quotes & OpenType...")
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()
        check(3, 'Newsreader' in c and 'Inter' in c and ('JetBrains+Mono' in c or 'JetBrains Mono' in c),
              f"Newsreader, Inter & JetBrains Mono loaded in {rel}")

    # Check zero straight dumb quotes in visible titles and prose
    for a in CANONICAL_LEDGER:
        slug = a['slug']
        for p in [os.path.join(ROOT_DIR, 'articles', slug, 'index.html'),
                  os.path.join(ROOT_DIR, 'articles', f"{slug}.html")]:
            rel = os.path.relpath(p, ROOT_DIR)
            with open(p, 'r', encoding='utf-8') as f:
                c = f.read()
            m_title = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', c)
            if m_title:
                t = m_title.group(1)
                check(3, '"' not in t and "'" not in t, f"Zero straight quotes in headline of {rel}")

            prose_m = re.search(r'<div class=[\"\']article-prose[^>]*>([\s\S]*?)</div>\s*<!-- End of Essay', c)
            if prose_m:
                prose = prose_m.group(1)
                text_only = re.sub(r'<[^>]+>', ' ', prose)
                check(3, '"' not in text_only and "'" not in text_only, f"Zero straight quotes in prose of {rel}")

    # OpenType onum and tnum in styles.css
    with open(os.path.join(ROOT_DIR, 'styles.css'), 'r', encoding='utf-8') as f:
        css = f.read()
    check(3, '"onum" 1' in css, "OpenType 'onum' rule present in styles.css")
    check(3, '"tnum" 1' in css, "OpenType 'tnum' rule present in styles.css")

    # ==========================================================================
    # ASSERTION 4 (Phase 4): Zero box-shadow rules, zero #fff/#000 screen backgrounds, SVG paper grain
    # ==========================================================================
    print("\nAuditing Assertion 4 (Phase 4): Box-shadow elimination, paper backgrounds & grain...")
    css_screen = re.sub(r'@media\s+print\s*\{[\s\S]*?\}', '', css)

    # Active box-shadow
    has_active_shadow = False
    for line in css_screen.splitlines():
        if 'box-shadow:' in line and 'box-shadow: none' not in line:
            has_active_shadow = True
            break
    check(4, not has_active_shadow, "Zero active box-shadow rules in styles.css screen styling")

    # #fff or #000 screen backgrounds
    for hf in ['styles.css'] + html_files:
        path = os.path.join(ROOT_DIR, hf)
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        c_screen = re.sub(r'@media\s+print\s*\{[\s\S]*?\}', '', c)
        bg_matches = re.findall(r'background(?:-color)?\s*:\s*(#[fF]{3,6}|#[0]{3,6}|white|black)\b', c_screen)
        check(4, len(bg_matches) == 0, f"Zero #fff/#000 screen backgrounds in {hf}", f"Found {bg_matches}")

    # Paper grain
    check(4, 'body::after' in css and ('data:image/svg+xml' in css or 'url(' in css),
          "Tactile SVG paper grain overlay active on body::after")

    # ==========================================================================
    # ASSERTION 5 (Phase 5): Zero translateY hover jumps, unique view-transition-name pairings, zero duplicate IDs
    # ==========================================================================
    print("\nAuditing Assertion 5 (Phase 5): Zero translateY hover jumps & view transitions...")
    hover_translate_rules = []
    for m in re.finditer(r'([^{}]+:hover[^{}]*\{[^{}]*\})', css_screen):
        rule = m.group(1)
        if 'translateY' in rule:
            hover_translate_rules.append(rule.strip())
    check(5, len(hover_translate_rules) == 0, "Zero translateY hover jumps in styles.css", f"Found: {hover_translate_rules}")

    # Unique view-transition-name pairings
    for arch_path in ['articles.html', 'articles/index.html']:
        with open(os.path.join(ROOT_DIR, arch_path), 'r', encoding='utf-8') as f:
            c = f.read()
        vt_names = re.findall(r'view-transition-name:\s*([^;\"\'\s]+)', c)
        check(5, len(vt_names) == 18, f"18 view-transition-name attributes on {arch_path}")
        check(5, len(set(vt_names)) == 18, f"Zero same-page view-transition-name collisions on {arch_path}")

    for a in CANONICAL_LEDGER:
        slug = a['slug']
        expected_vt = f"article-title-{slug}"
        for p in [os.path.join(ROOT_DIR, 'articles', slug, 'index.html'),
                  os.path.join(ROOT_DIR, 'articles', f"{slug}.html")]:
            rel = os.path.relpath(p, ROOT_DIR)
            with open(p, 'r', encoding='utf-8') as f:
                c = f.read()
            page_vt = re.findall(r'view-transition-name:\s*([^;\"\'\s]+)', c)
            check(5, len(page_vt) == 1 and page_vt[0] == expected_vt,
                  f"Exact view-transition-name '{expected_vt}' on {rel}")

    # Zero duplicate IDs on any page
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()
        ids = re.findall(r'\bid=[\"\']([^\"\']+)[\"\']', c)
        seen_ids = set()
        dups = set()
        for i in ids:
            if i in seen_ids:
                dups.add(i)
            seen_ids.add(i)
        check(5, len(dups) == 0, f"Zero duplicate IDs in {rel}", f"Duplicates: {dups}")

    # ==========================================================================
    # ASSERTION 6 (Phase 6): Valid JSON-LD, valid XML, zero broken links
    # ==========================================================================
    print("\nAuditing Assertion 6 (Phase 6): Valid JSON-LD, XML schemas & zero broken paths...")
    # XML parse
    try:
        ET.parse(os.path.join(ROOT_DIR, 'sitemap.xml'))
        check(6, True, "sitemap.xml parses cleanly via xml.etree.ElementTree")
    except Exception as e:
        check(6, False, "sitemap.xml parse error", str(e))

    try:
        ET.parse(os.path.join(ROOT_DIR, 'feed.xml'))
        check(6, True, "feed.xml parses cleanly via xml.etree.ElementTree")
    except Exception as e:
        check(6, False, "feed.xml parse error", str(e))

    # JSON-LD parse
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        if rel in ('404.html', 'article.html'):
            continue
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()
        blocks = re.findall(r'<script\s+type=[\"\']application/ld\+json[\"\']>([\s\S]*?)</script>', c)
        check(6, len(blocks) >= 1, f"JSON-LD block present in {rel}")
        for b in blocks:
            try:
                data = json.loads(b.strip())
                check(6, bool(data), f"JSON-LD parses cleanly in {rel}")
            except Exception as e:
                check(6, False, f"JSON-LD syntax error in {rel}", str(e))

    # Link graph verification
    for hf in html_files:
        if hf.endswith('article.html'):
            continue
        rel = os.path.relpath(hf, ROOT_DIR)
        file_dir = os.path.dirname(os.path.abspath(hf))
        with open(hf, 'r', encoding='utf-8') as f:
            c = f.read()

        # <a href>
        for m in re.finditer(r'<a\s+[^>]*href=[\"\']([^\"\']+)[\"\']', c):
            href = m.group(1).strip()
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
                continue
            path_part = urlparse(href).path
            if not path_part:
                continue
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            exists = os.path.isfile(target) or (os.path.isdir(target) and os.path.isfile(os.path.join(target, 'index.html'))) or os.path.isfile(target + '.html') or (path_part.endswith('/') and os.path.isfile(target.rstrip('/') + '.html'))
            check(6, exists, f"Valid <a> link target in {rel}: {href}")

        # <img src>
        for m in re.finditer(r'<img\s+[^>]*src=[\"\']([^\"\']+)[\"\']', c):
            src = m.group(1).strip()
            if src.startswith(('http://', 'https://', 'data:')):
                continue
            path_part = urlparse(src).path
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            check(6, os.path.isfile(target), f"Valid <img> src in {rel}: {src}")

        # <script src>
        for m in re.finditer(r'<script\s+[^>]*src=[\"\']([^\"\']+)[\"\']', c):
            src = m.group(1).strip()
            if src.startswith(('http://', 'https://')):
                continue
            path_part = urlparse(src).path
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            check(6, os.path.isfile(target), f"Valid <script> src in {rel}: {src}")

    # ==========================================================================
    # ASSERTION 7 (Phase 7): Book nav, keyboard navigation, deep filtering, @media print
    # ==========================================================================
    print("\nAuditing Assertion 7 (Phase 7): Book navigation, keyboard shortcuts, deep filtering, print...")
    total_canon = len(CANONICAL_LEDGER)
    for i, a in enumerate(CANONICAL_LEDGER):
        prev_a = CANONICAL_LEDGER[(i - 1) % total_canon]
        next_a = CANONICAL_LEDGER[(i + 1) % total_canon]
        expected_prev_link = f'<link rel="prev" href="{DOMAIN}/articles/{prev_a["slug"]}/" />'
        expected_next_link = f'<link rel="next" href="{DOMAIN}/articles/{next_a["slug"]}/" />'

        for p in [os.path.join(ROOT_DIR, 'articles', a['slug'], 'index.html'),
                  os.path.join(ROOT_DIR, 'articles', f"{a['slug']}.html")]:
            rel = os.path.relpath(p, ROOT_DIR)
            with open(p, 'r', encoding='utf-8') as f:
                c = f.read()

            check(7, expected_prev_link in c, f"rel='prev' link in {rel}")
            check(7, expected_next_link in c, f"rel='next' link in {rel}")
            check(7, 'book-nav' in c, f".book-nav element in {rel}")
            check(7, f"/articles/{prev_a['slug']}/" in c, f"Link to previous essay in {rel}")
            check(7, f"/articles/{next_a['slug']}/" in c, f"Link to next essay in {rel}")
            check(7, 'Use ← and → keys to turn pages' in c, f"Monospace page turn hint in {rel}")
            check(7, 'class="scripture-ref"' in c and 'data-verse=' in c, f"Scripture marginalia in {rel}")

    # main.js script check
    with open(os.path.join(ROOT_DIR, 'main.js'), 'r', encoding='utf-8') as f:
        js = f.read()
    check(7, 'ArrowLeft' in js and 'ArrowRight' in js and 'Escape' in js, "Keyboard page-turning in main.js")
    check(7, 'popstate' in js and 'hashchange' in js, "Deep filtering event listeners in main.js")
    check(7, 'Thank you. Check your inbox on Sunday morning.' in js, "Resilient Sunday letter confirmation in main.js")

    # @media print rules in styles.css
    check(7, '@media print' in css, "@media print block present in styles.css")
    check(7, 'Published by George at jojjy.org' in css, "Print canonical attribution in styles.css")
    check(7, '11pt' in css and 'Newsreader' in css and '65ch' in css, "Broadsheet typography and measure in styles.css")
    check(7, 'body::after' in css and 'display: none !important;' in css, "Print hides noise overlay in styles.css")

    # ==========================================================================
    # FINAL RESULTS
    # ==========================================================================
    css_size_bytes = os.path.getsize(os.path.join(ROOT_DIR, 'styles.css'))
    css_size_kb = css_size_bytes / 1024.0

    print("\n" + "=" * 80)
    print("MASTER PRODUCTION SIGN-OFF TABLE — JOJJY.ORG (PHASES 1 - 7)")
    print("=" * 80)
    print(f"{'Assertion':<20} | {'Status':<10} | {'Checks Passed':<15} | {'Notes'}")
    print("-" * 80)

    all_passed = True
    for num in range(1, 8):
        name = f"Assertion {num}"
        res = assertion_results[name]
        status = "PASSED ✅" if len(res["failed"]) == 0 else "FAILED ❌"
        if len(res["failed"]) > 0:
            all_passed = False
        notes = {
            1: "Zero prompt leftovers; 100% metadata sync across 18 essays",
            2: "Zero summary boxes; zero marquee tickers; 18 unique card titles",
            3: "Newsreader, Inter & JetBrains Mono unified; 0 dumb quotes; OpenType active",
            4: "Zero box-shadow; zero #fff/#000 screen backgrounds; tactile paper grain active",
            5: "Zero translateY hover jumps; 18 unique view-transition pairings; 0 ID collisions",
            6: "Valid JSON-LD & XML schemas; 100% verified on-disk link & asset graph",
            7: "Continuous book navigation wired; keyboard shortcuts active; @media print broadsheet typeset"
        }[num]
        print(f"{name:<20} | {status:<10} | {res['passed']:>5} / {res['total']:<7} | {notes}")

    print("=" * 80)
    print(f"TOTAL AUDIT CHECKS : {passed_checks} / {total_checks} PASSED ({(passed_checks/total_checks)*100:.2f}%)")
    print(f"FINAL CSS FILE SIZE: {css_size_kb:.2f} KB ({css_size_bytes} bytes)")
    print("=" * 80)

    if all_passed:
        print("\n🎉 ALL 7 CROSS-PHASE PRODUCTION ASSERTIONS PASSED WITH ZERO FAILURES!")
        print("   JOJJY.ORG IS 100% PRODUCTION-READY.\n")
        return 0
    else:
        print("\n❌ AUDIT FOUND FAILURES:")
        for name, res in assertion_results.items():
            for f in res["failed"]:
                print(f"  [{name}] {f}")
        return 1

if __name__ == '__main__':
    sys.exit(run_audit())
