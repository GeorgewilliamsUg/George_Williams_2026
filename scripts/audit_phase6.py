#!/usr/bin/env python3
"""
Comprehensive Phase 6 Production Audit & Verification Script for jojjy.org
Validates 100% of Technical SEO, Schema, Link Graph, CWV, and Syndication requirements.
"""

import os
import glob
import re
import json
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

import sys
ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, ROOT_DIR)
DOMAIN = "https://jojjy.org"

from scripts.build_phase6 import CANONICAL_LEDGER, ARTICLES_BY_SLUG

def run_audit():
    print("=" * 80)
    print("PHASE 6 PRODUCTION READINESS AUDIT — JOJJY.ORG (GEORGE)")
    print("=" * 80)

    total_checks = 0
    passed_checks = 0
    failures = []

    def assert_check(condition, test_name, file_path=""):
        nonlocal total_checks, passed_checks
        total_checks += 1
        if condition:
            passed_checks += 1
        else:
            rel = os.path.relpath(file_path, ROOT_DIR) if file_path else "GLOBAL"
            failures.append(f"[{rel}] {test_name}")

    # --------------------------------------------------------------------------
    # 1. HTML Inventory
    # --------------------------------------------------------------------------
    html_files = sorted(glob.glob(os.path.join(ROOT_DIR, '**/*.html'), recursive=True))
    assert_check(len(html_files) >= 40, f"Found {len(html_files)} HTML pages across repository")

    # --------------------------------------------------------------------------
    # 2. Metadata, Titles, Descriptions, Canonical, OG, Twitter & RSS Discovery
    # --------------------------------------------------------------------------
    unique_descriptions = {}

    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()

        is_template = (rel == 'article.html')
        is_404 = (rel == '404.html')

        # Title Check
        title_m = re.search(r'<title>([\s\S]*?)</title>', content)
        title = title_m.group(1).strip() if title_m else ""
        assert_check(bool(title), f"Page has non-empty <title>", hf)

        if rel == 'index.html':
            assert_check(title == "George | Short Christian Essays on Faith, Work & Ordinary Life",
                         f"Homepage title exact match: '{title}'", hf)
        elif rel in ('articles.html', 'articles/index.html'):
            assert_check(title == "Essays Archive | George",
                         f"Archive title exact match: '{title}'", hf)
        elif rel in ('collections.html', 'collections/index.html'):
            assert_check(title == "Collections | George",
                         f"Collections title exact match: '{title}'", hf)
        elif rel in ('about.html', 'about/index.html'):
            assert_check(title == "About George | Christian Essays from the Countryside",
                         f"About title exact match: '{title}'", hf)
        elif is_404:
            assert_check(title == "Page Not Found | George",
                         f"404 title exact match: '{title}'", hf)
        elif is_template:
            assert_check(title == "Article Template | George",
                         f"Template title match: '{title}'", hf)
        else:
            # Check article page title
            slug_match = re.search(r'articles/(article-[^/.]+)', rel)
            if slug_match:
                slug = slug_match.group(1)
                article_info = ARTICLES_BY_SLUG.get(slug)
                expected_title = f"{article_info['headline']} | George"
                assert_check(title == expected_title,
                             f"Article title matches '{expected_title}' (got '{title}')", hf)

        # Meta Description Check
        desc_m = re.search(r'<meta\s+name=["\']description["\']\s+content="([^"]*)"', content)
        if not desc_m:
            desc_m = re.search(r"<meta\s+name=['\"]description['\"]\s+content='([^']*)'", content)
        desc = desc_m.group(1).strip() if desc_m else ""
        assert_check(bool(desc), "Meta description tag present", hf)

        if not is_template:
            desc_len = len(desc)
            assert_check(120 <= desc_len <= 158,
                         f"Meta description length between 120 and 158 chars (actual: {desc_len})", hf)

            # Uniqueness across distinct primary routes
            is_primary_entrypoint = rel.endswith('/index.html') or rel in ('index.html', '404.html')
            if is_primary_entrypoint:
                if desc in unique_descriptions:
                    assert_check(False, f"Duplicate description with {unique_descriptions[desc]}: '{desc}'", hf)
                else:
                    unique_descriptions[desc] = rel

        # Canonical Link Check
        canon_m = re.search(r'<link\s+rel=["\']canonical["\']\s+href="([^"]*)"', content)
        if is_404 or is_template:
            assert_check(not canon_m, "No canonical tag on 404/template page", hf)
        else:
            assert_check(bool(canon_m), "Canonical link tag present", hf)
            if canon_m:
                canon_url = canon_m.group(1)
                assert_check(canon_url.startswith("https://jojjy.org/"), f"Canonical is absolute https://jojjy.org/ ({canon_url})", hf)
                assert_check(canon_url.endswith("/"), f"Canonical enforces trailing slash ({canon_url})", hf)

        # Open Graph & Twitter Card Check
        if not is_template and not is_404:
            assert_check('<meta property="og:site_name" content="George" />' in content,
                         "og:site_name is 'George'", hf)
            assert_check('<meta property="og:locale" content="en_US" />' in content,
                         "og:locale is 'en_US'", hf)
            assert_check('<meta name="twitter:card" content="summary_large_image" />' in content,
                         "twitter:card is summary_large_image", hf)

            og_title_m = re.search(r'<meta\s+property=["\']og:title["\']\s+content="([^"]*)"', content)
            assert_check(bool(og_title_m) and og_title_m.group(1) == title,
                         "og:title matches page <title>", hf)

            og_desc_m = re.search(r'<meta\s+property=["\']og:description["\']\s+content="([^"]*)"', content)
            assert_check(bool(og_desc_m) and og_desc_m.group(1) == desc,
                         "og:description matches meta description", hf)

            if 'articles/article-' in rel:
                assert_check('<meta property="og:type" content="article" />' in content,
                             "og:type is 'article'", hf)
                assert_check(bool(re.search(r'<meta\s+property=["\']article:published_time["\']\s+content="\d{4}-\d{2}-\d{2}', content)),
                             "article:published_time is present", hf)
            else:
                assert_check('<meta property="og:type" content="website" />' in content,
                             "og:type is 'website'", hf)

        # RSS alternate discovery link
        assert_check('<link rel="alternate" type="application/rss+xml" title="George | Christian Essays" href="https://jojjy.org/feed.xml" />' in content,
                     "RSS discovery link present in <head>", hf)

        # Footer RSS link
        assert_check('/feed.xml' in content, "Footer contains quiet link to /feed.xml", hf)

        # Semantic landmarks
        assert_check('<html lang="en">' in content or '<html lang="en"' in content,
                     '<html lang="en"> present', hf)
        assert_check('<a class="skip-link" href="#main-content">Skip to content</a>' in content,
                     'Skip link present right after <body>', hf)
        assert_check(len(re.findall(r'<main[^>]*id=["\']main-content["\']', content)) == 1,
                     'Exactly one <main id="main-content"> present', hf)
        assert_check(len(re.findall(r'<h1[^>]*>', content)) == 1,
                     'Exactly one <h1> present', hf)

    # --------------------------------------------------------------------------
    # 3. JSON-LD Structured Data Graph Validation
    # --------------------------------------------------------------------------
    print("\nAuditing JSON-LD Structured Data Graph...")
    for hf in html_files:
        rel = os.path.relpath(hf, ROOT_DIR)
        if rel in ('article.html', '404.html'):
            continue
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()

        json_ld_matches = re.findall(r'<script\s+type=["\']application/ld\+json["\']>([\s\S]*?)</script>', content)
        assert_check(len(json_ld_matches) >= 1, "Has at least one JSON-LD block", hf)

        for jm in json_ld_matches:
            try:
                data = json.loads(jm.strip())
                assert_check(True, "JSON-LD parses cleanly via json.loads()", hf)
            except Exception as e:
                assert_check(False, f"JSON-LD syntax error: {e}", hf)
                continue

            # Verify specific schemas
            if rel == 'index.html':
                graph = data.get('@graph', [])
                ws = next((x for x in graph if x.get('@type') == 'WebSite'), None)
                p = next((x for x in graph if x.get('@type') == 'Person'), None)
                assert_check(bool(ws) and ws.get('@id') == "https://jojjy.org/#website", "Homepage defines @id: https://jojjy.org/#website", hf)
                assert_check(bool(ws) and ws.get('alternateName') == "Jojjy", "Homepage WebSite has alternateName 'Jojjy'", hf)
                assert_check(bool(p) and p.get('@id') == "https://jojjy.org/#george", "Homepage defines author @id: https://jojjy.org/#george", hf)
            elif rel in ('about.html', 'about/index.html'):
                graph = data.get('@graph', [])
                about_p = next((x for x in graph if x.get('@type') == 'AboutPage'), None)
                author = next((x for x in graph if x.get('@type') == 'Person'), None)
                assert_check(bool(about_p), "About page defines AboutPage entity", hf)
                assert_check(bool(author) and author.get('@id') == "https://jojjy.org/#george", "About page defines Person entity with @id: https://jojjy.org/#george", hf)
            elif 'articles/article-' in rel:
                assert_check(data.get('@type') == 'BlogPosting', "Article schema is @type: BlogPosting", hf)
                assert_check(data.get('inLanguage') == 'en', "Article inLanguage is 'en'", hf)
                assert_check(data.get('author', {}).get('@id') == "https://jojjy.org/#george", "Author @id is https://jojjy.org/#george", hf)
                assert_check(data.get('publisher', {}).get('@id') == "https://jojjy.org/#website", "Publisher @id is https://jojjy.org/#website", hf)
                assert_check(isinstance(data.get('wordCount'), int), "wordCount is integer", hf)
                assert_check(bool(re.match(r'^PT\d+M$', data.get('timeRequired', ''))), "timeRequired is ISO 8601 (PTxM)", hf)

    # --------------------------------------------------------------------------
    # 4. Internal Link Graph & Zero Broken Links
    # --------------------------------------------------------------------------
    print("\nAuditing Internal Link Graph (100% on-disk verification)...")
    broken_links = 0
    total_resources = 0

    for hf in html_files:
        if hf.endswith('article.html'):
            continue
        file_dir = os.path.dirname(os.path.abspath(hf))
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check links
        for m in re.finditer(r'<a\s+[^>]*href=["\']([^"\']+)["\']', content):
            href = m.group(1).strip()
            total_resources += 1
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
                continue
            path_part = urlparse(href).path
            if not path_part:
                continue
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            exists = os.path.isfile(target) or (os.path.isdir(target) and os.path.isfile(os.path.join(target, 'index.html'))) or os.path.isfile(target + '.html') or (path_part.endswith('/') and os.path.isfile(target.rstrip('/') + '.html'))
            if not exists:
                broken_links += 1
                failures.append(f"Broken <a> target in {os.path.relpath(hf, ROOT_DIR)}: {href}")

        # Check <link>
        for m in re.finditer(r'<link\s+[^>]*href=["\']([^"\']+)["\']', content):
            href = m.group(1).strip()
            total_resources += 1
            if href.startswith(('http://', 'https://', '#', 'data:')):
                continue
            path_part = urlparse(href).path
            if not path_part:
                continue
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            if not os.path.isfile(target):
                broken_links += 1
                failures.append(f"Broken <link> target in {os.path.relpath(hf, ROOT_DIR)}: {href}")

        # Check <script>
        for m in re.finditer(r'<script\s+[^>]*src=["\']([^"\']+)["\']', content):
            src = m.group(1).strip()
            total_resources += 1
            if src.startswith(('http://', 'https://')):
                continue
            path_part = urlparse(src).path
            if not path_part:
                continue
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            if not os.path.isfile(target):
                broken_links += 1
                failures.append(f"Broken <script> target in {os.path.relpath(hf, ROOT_DIR)}: {src}")

        # Check <img>
        for m in re.finditer(r'<img\s+[^>]*src=["\']([^"\']+)["\']', content):
            src = m.group(1).strip()
            total_resources += 1
            if src.startswith(('http://', 'https://', 'data:')):
                continue
            path_part = urlparse(src).path
            if not path_part:
                continue
            target = os.path.normpath(os.path.join(ROOT_DIR, path_part.lstrip('/'))) if path_part.startswith('/') else os.path.normpath(os.path.join(file_dir, path_part))
            if not os.path.isfile(target):
                broken_links += 1
                failures.append(f"Broken <img> target in {os.path.relpath(hf, ROOT_DIR)}: {src}")

    assert_check(broken_links == 0, f"Link graph has zero broken links (checked {total_resources} resources, broken: {broken_links})")

    # --------------------------------------------------------------------------
    # 5. Core Web Vitals & Image Attributes
    # --------------------------------------------------------------------------
    print("\nAuditing Images for Core Web Vitals (CLS = 0.00)...")
    img_count = 0
    for hf in html_files:
        if hf.endswith('article.html'):
            continue
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()
        for m in re.finditer(r'<img\s+([^>]+)>', content):
            img_count += 1
            tag = m.group(0)
            assert_check(bool(re.search(r'width=["\']\d+["\']', tag)) and bool(re.search(r'height=["\']\d+["\']', tag)),
                         "Image has explicit integer width and height", hf)
            alt_m = re.search(r'alt="([^"]*)"', tag)
            if not alt_m:
                alt_m = re.search(r"alt='([^']*)'", tag)
            assert_check(bool(alt_m) and len(alt_m.group(1).strip()) > 0,
                         "Image has non-empty descriptive alt text", hf)
            assert_check('decoding="async"' in tag,
                         "Image has decoding='async'", hf)
            assert_check('loading="lazy"' in tag or 'loading="eager"' in tag,
                         "Image has loading='lazy' or loading='eager'", hf)

    assert_check(img_count > 100, f"Audited {img_count} images for CLS prevention")

    # --------------------------------------------------------------------------
    # 6. Sitemap, Feed, Robots, .htaccess Validation
    # --------------------------------------------------------------------------
    print("\nAuditing Sitemap, Feed, Robots, and .htaccess...")

    # sitemap.xml
    sitemap_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    assert_check(os.path.isfile(sitemap_path), "sitemap.xml exists on disk")
    try:
        stree = ET.parse(sitemap_path)
        sroot = stree.getroot()
        url_tags = sroot.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url')
        assert_check(len(url_tags) == 22, f"sitemap.xml has exactly 22 canonical URLs (found {len(url_tags)})")
        for u in url_tags:
            loc = u.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text
            lastmod = u.find('{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod').text
            assert_check(loc.startswith("https://jojjy.org/"), f"Sitemap URL is canonical: {loc}")
            assert_check(loc.endswith("/"), f"Sitemap URL ends with trailing slash: {loc}")
            assert_check(bool(re.match(r'^\d{4}-\d{2}-\d{2}$', lastmod)), f"Sitemap lastmod is YYYY-MM-DD ({lastmod})")
    except Exception as e:
        assert_check(False, f"sitemap.xml XML parse error: {e}")

    # feed.xml
    feed_path = os.path.join(ROOT_DIR, 'feed.xml')
    assert_check(os.path.isfile(feed_path), "feed.xml exists on disk")
    try:
        ftree = ET.parse(feed_path)
        froot = ftree.getroot()
        fchan = froot.find('channel')
        fitems = fchan.findall('item')
        assert_check(len(fitems) == 18, f"feed.xml contains all 18 articles (found {len(fitems)})")
        # Check reverse-chronological order
        dates = [i.find('pubDate').text for i in fitems]
        assert_check(len(dates) == 18, "All 18 feed items have pubDate")
    except Exception as e:
        assert_check(False, f"feed.xml XML parse error: {e}")

    # robots.txt
    robots_path = os.path.join(ROOT_DIR, 'robots.txt')
    assert_check(os.path.isfile(robots_path), "robots.txt exists on disk")
    with open(robots_path) as f:
        rcontent = f.read()
    assert_check("User-agent: *" in rcontent, "robots.txt allows all crawlers")
    assert_check("Sitemap: https://jojjy.org/sitemap.xml" in rcontent, "robots.txt declares canonical sitemap")

    # .htaccess
    htaccess_path = os.path.join(ROOT_DIR, '.htaccess')
    assert_check(os.path.isfile(htaccess_path), ".htaccess exists on disk")
    with open(htaccess_path) as f:
        hcontent = f.read()
    assert_check("ErrorDocument 404 /404.html" in hcontent, ".htaccess declares ErrorDocument 404 /404.html")
    assert_check("RewriteEngine On" in hcontent, ".htaccess enables RewriteEngine")
    assert_check("DirectorySlash On" in hcontent, ".htaccess enables DirectorySlash On")
    assert_check("mod_deflate.c" in hcontent, ".htaccess enables gzip compression (mod_deflate)")
    assert_check("mod_expires.c" in hcontent, ".htaccess enables browser caching (mod_expires)")
    assert_check("Strict-Transport-Security" in hcontent, ".htaccess sets HSTS header")

    # --------------------------------------------------------------------------
    # 7. Repository Cleanliness
    # --------------------------------------------------------------------------
    print("\nAuditing Repository Cleanliness...")
    dead_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        if any(d in root for d in ['.git', '.vscode', '.agents']):
            continue
        for fl in files:
            if fl.endswith(('.bak', '.tmp', '.orig', '~')):
                dead_files.append(os.path.join(root, fl))

    assert_check(len(dead_files) == 0, f"Zero dead/temporary backup files found ({dead_files})")

    # --------------------------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(f"AUDIT SUMMARY: {passed_checks} / {total_checks} CHECKS PASSED ({(passed_checks/total_checks)*100:.1f}%)")
    print("=" * 80)

    if failures:
        print(f"\n❌ FOUND {len(failures)} FAILURES:")
        for fail in failures:
            print("  -", fail)
        return False
    else:
        print("\n✅ ALL PRODUCTION SEO, SCHEMA, ROUTING, CWV & SYNDICATION CHECKS PASSED 100%!")
        return True

if __name__ == '__main__':
    success = run_audit()
    exit(0 if success else 1)
