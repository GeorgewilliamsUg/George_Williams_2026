#!/usr/bin/env python3
"""
Phase 6: Technical SEO, Entity Schema, URL Canonicalization, Syndication, and CWV Hardening
Autonomous build and audit script for jojjy.org (George - Christian Essays)
"""

import os
import re
import json
import xml.sax.saxutils as saxutils
from datetime import datetime, timezone

ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
DOMAIN = "https://jojjy.org"

# 18 Canonical Articles Ledger
CANONICAL_LEDGER = [
    {
        'slug': 'article-busy-isnt-faithful',
        'headline': "Busy Isn't Faithful",
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-08-03',
        'displayDate': 'August 3, 2025',
        'image': 'images/business.jpg',
        'words': 248,
        'readTime': 1,
        'issue': '№ 01',
        'desc': 'Martha was serving, but Jesus named the anxiety beneath her motion. Discover why frantic Christian busyness is not devotion and how to embrace true rest.'
    },
    {
        'slug': 'article-nobody-is-self-made',
        'headline': 'Nobody Is Self-Made',
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-07-20',
        'displayDate': 'July 20, 2025',
        'image': 'images/writing-desk.png',
        'words': 193,
        'readTime': 1,
        'issue': '№ 02',
        'desc': 'Hands can bleed with honest effort and still stand on borrowed ground. An honest Christian reflection on Deuteronomy, humility, and the quiet gift of grace.'
    },
    {
        'slug': 'article-churches-dont-drift-toward-truth',
        'headline': "Churches Don't Drift Toward Truth",
        'topic': 'Quiet Holiness',
        'category': 'Holiness',
        'date': '2025-07-13',
        'displayDate': 'July 13, 2025',
        'image': 'images/truth.jpg',
        'words': 332,
        'readTime': 2,
        'issue': '№ 03',
        'desc': 'Theological drift is quiet, gradual, and always away from Christ. Explore how congregations lose their anchor and why guarding biblical truth demands resolve.'
    },
    {
        'slug': 'article-faithfulness-can-feel-lonely',
        'headline': 'Faithfulness Can Feel Lonely',
        'topic': 'Suffering & Joy',
        'category': 'Suffering & Joy',
        'date': '2025-07-06',
        'displayDate': 'July 6, 2025',
        'image': 'images/prayer_01.jpg',
        'words': 375,
        'readTime': 2,
        'issue': '№ 04',
        'desc': 'There is a quiet ache in staying true when culture walks away. Discover biblical encouragement for the isolation that often accompanies Christian integrity.'
    },
    {
        'slug': 'article-god-doesnt-need-your-resume',
        'headline': "God Doesn't Need Your Resume",
        'topic': 'Reading Scripture',
        'category': 'Scripture',
        'date': '2025-06-29',
        'displayDate': 'June 29, 2025',
        'image': 'images/open-bible.png',
        'words': 954,
        'readTime': 5,
        'issue': '№ 05',
        'desc': 'Moses had a stutter, Gideon was hiding, and Peter denied Christ. A reflection on how God qualifies the called instead of demanding impressive credentials.'
    },
    {
        'slug': 'article-terrified-of-silence',
        'headline': 'Terrified of Silence',
        'topic': 'Quiet Holiness',
        'category': 'Holiness',
        'date': '2025-06-15',
        'displayDate': 'June 15, 2025',
        'image': 'images/hero-countryside.png',
        'words': 337,
        'readTime': 2,
        'issue': '№ 06',
        'desc': 'We fill our days with noise because stillness forces us to confront who we are. An honest reflection on recovering quiet solitude and intimacy with God.'
    },
    {
        'slug': 'article-the-bible-was-never-about-you',
        'headline': 'The Bible Was Never About You',
        'topic': 'Reading Scripture',
        'category': 'Scripture',
        'date': '2025-06-08',
        'displayDate': 'June 8, 2025',
        'image': 'images/open-bible.png',
        'words': 738,
        'readTime': 4,
        'issue': '№ 07',
        'desc': 'We often read Scripture like a self-help manual rather than the story of redemption. Discover how shifting the focus back to Jesus transforms how you read.'
    },
    {
        'slug': 'article-the-jesus-you-missed-in-the-old-testament',
        'headline': 'The Jesus You Missed in the Old Testament',
        'topic': 'Reading Scripture',
        'category': 'Scripture',
        'date': '2025-06-01',
        'displayDate': 'June 1, 2025',
        'image': 'images/truth.jpg',
        'words': 869,
        'readTime': 4,
        'issue': '№ 08',
        'desc': 'The Old Testament is rich with shadows, types, and promises fulfilled in Christ. Trace the redemptive threads from Genesis through the prophets in this essay.'
    },
    {
        'slug': 'article-the-respectable-sin-nobody-talks-about',
        'headline': 'The Respectable Sin Nobody Talks About',
        'topic': 'Quiet Holiness',
        'category': 'Holiness',
        'date': '2025-05-25',
        'displayDate': 'May 25, 2025',
        'image': 'images/anxious.jpg',
        'words': 1373,
        'readTime': 7,
        'issue': '№ 09',
        'desc': 'We condemn outward vices while treating chronic worry as harmless. Explore why anxiety is a theological statement and how Romans 8 offers profound peace.'
    },
    {
        'slug': 'article-the-verse-that-is-slowly-killing-you',
        'headline': 'The Verse That Is Slowly Killing You',
        'topic': 'Reading Scripture',
        'category': 'Scripture',
        'date': '2025-05-18',
        'displayDate': 'May 18, 2025',
        'image': 'images/open-bible.png',
        'words': 836,
        'readTime': 4,
        'issue': '№ 10',
        'desc': 'Jeremiah 29:11 is printed on coffee mugs, yet rarely read in context. Unpack what God actually promised exiles in Babylon and why real hope is far deeper.'
    },
    {
        'slug': 'article-you-were-not-made-for-sadness',
        'headline': 'You Were Not Made for Sadness',
        'topic': 'Suffering & Joy',
        'category': 'Suffering & Joy',
        'date': '2025-05-11',
        'displayDate': 'May 11, 2025',
        'image': 'images/happiness.jpg',
        'words': 1014,
        'readTime': 5,
        'issue': '№ 11',
        'desc': 'Grief and brokenness are intruders in God\'s good creation. A compassionate Christian reflection on enduring sorrow with the sure hope of resurrection joy.'
    },
    {
        'slug': 'article-waiting-is-not-wasting',
        'headline': 'Waiting Is Not Wasting',
        'topic': 'Suffering & Joy',
        'category': 'Suffering & Joy',
        'date': '2025-05-04',
        'displayDate': 'May 4, 2025',
        'image': 'images/prayer.jpg',
        'words': 276,
        'readTime': 1,
        'issue': '№ 12',
        'desc': 'From Abraham to David, God used prolonged waiting seasons to forge character. Discover why waiting is never wasted time when God is the one doing the work.'
    },
    {
        'slug': 'article-what-poverty-taught-me-about-riches',
        'headline': 'What Poverty Taught Me About Riches',
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-04-27',
        'displayDate': 'April 27, 2025',
        'image': 'images/3.jpg',
        'words': 385,
        'readTime': 2,
        'issue': '№ 13',
        'desc': 'Material abundance often masks spiritual impoverishment. A heartfelt reflection on Christian stewardship, gratitude, and true treasure in the kingdom.'
    },
    {
        'slug': 'article-whatever-you-do-as-unto-the-lord',
        'headline': 'Whatever You Do, As Unto the Lord',
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-04-20',
        'displayDate': 'April 20, 2025',
        'image': 'images/1.jpg',
        'words': 264,
        'readTime': 1,
        'issue': '№ 14',
        'desc': 'Colossians 3 transforms mundane tasks into acts of worship. Explore how everyday labor, quiet chores, and unseen faithfulness become holy offerings to God.'
    },
    {
        'slug': 'article-why-friendship-feels-so-rare',
        'headline': 'Why Friendship Feels So Rare',
        'topic': 'Suffering & Joy',
        'category': 'Suffering & Joy',
        'date': '2025-04-13',
        'displayDate': 'April 13, 2025',
        'image': 'images/marriage.jpg',
        'words': 1157,
        'readTime': 6,
        'issue': '№ 15',
        'desc': 'Modern busyness has reduced deep covenant bonds to superficial digital interactions. Discover why biblical fellowship requires vulnerability and time.'
    },
    {
        'slug': 'article-work-existed-before-sin',
        'headline': 'Work Existed Before Sin',
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-04-06',
        'displayDate': 'April 6, 2025',
        'image': 'images/2.jpg',
        'words': 945,
        'readTime': 5,
        'issue': '№ 16',
        'desc': 'Work was instituted in the Garden of Eden before the Fall, not as a curse. Rediscover God\'s original design for meaningful daily labor, vocation, and rest.'
    },
    {
        'slug': 'article-you-are-not-your-job-title',
        'headline': 'You Are Not Your Job Title',
        'topic': 'Work & Vocation',
        'category': 'Work',
        'date': '2025-03-30',
        'displayDate': 'March 30, 2025',
        'image': 'images/business.jpg',
        'words': 285,
        'readTime': 1,
        'issue': '№ 17',
        'desc': 'When career titles collapse, what remains of your worth? A quiet meditation on untangling professional identity from who you truly are in the eyes of God.'
    },
    {
        'slug': 'article-your-mind-is-under-attack-and-you-dont-even-see-it',
        'headline': 'Your Mind Is Under Attack',
        'topic': 'Quiet Holiness',
        'category': 'Holiness',
        'date': '2025-03-23',
        'displayDate': 'March 23, 2025',
        'image': 'images/newspapers.jpg',
        'words': 399,
        'readTime': 2,
        'issue': '№ 18',
        'desc': 'The modern siege on faith is waged through constant digital distraction. Learn how the attention economy fragments the soul and how to guard your mind today.'
    }
]

ARTICLES_BY_SLUG = {a['slug']: a for a in CANONICAL_LEDGER}

# Image dimensions lookup
IMAGE_DIMS = {
    'logo.png': (120, 32),
    'george.png': (1211, 1299),
    'business.jpg': (1476, 978),
    'writing-desk.png': (1024, 1024),
    'truth.jpg': (1162, 782),
    'prayer_01.jpg': (640, 640),
    'open-bible.png': (1024, 1024),
    'hero-countryside.png': (1008, 756),
    'hero-countryside.jpg': (1008, 756),
    'anxious.jpg': (1074, 806),
    'happiness.jpg': (1470, 980),
    'prayer.jpg': (640, 578),
    '3.jpg': (1200, 800),
    '1.jpg': (1200, 800),
    'marriage.jpg': (1200, 800),
    '2.jpg': (1200, 800),
    'newspapers.jpg': (1200, 745),
}

def clean_internal_urls(html_content, current_canonical_url):
    """
    Standardize all internal hyperlinks to clean canonical URLs.
    """
    c = html_content

    # Normalize relative asset paths to root-relative
    c = re.sub(r'href=[\"\'](?:\.\.\/)*styles\.css[\"\']', 'href="/styles.css"', c)
    c = re.sub(r'src=[\"\'](?:\.\.\/)*main\.js[\"\']', 'src="/main.js"', c)
    c = re.sub(r'src=[\"\'](?:\.\.\/)*motion\.js[\"\']', 'src="/motion.js"', c)
    c = re.sub(r'href=[\"\'](?:\.\.\/)*images\/favicon\/([^\"\']+)[\"\']', r'href="/images/favicon/\1"', c)
    c = re.sub(r'src=[\"\'](?:\.\.\/)*images\/([^\"\']+)[\"\']', r'src="/images/\1"', c)

    # Clean brand logo link: always points to /
    c = re.sub(r'<a\s+href=[\"\']/home/?[\"\']\s+class=[\"\']brand-logo[\"\']', '<a href="/" class="brand-logo"', c)
    c = re.sub(r'<a\s+href=[\"\']index\.html[\"\']\s+class=[\"\']brand-logo[\"\']', '<a href="/" class="brand-logo"', c)

    # Clean home links
    c = re.sub(r'href=[\"\']/home/?[\"\']', 'href="/"', c)
    c = re.sub(r'href=[\"\'](?:\.\.\/)+index\.html[\"\']', 'href="/"', c)

    # Clean articles links
    c = re.sub(r'href=[\"\'](?:\.\.\/)*articles\.html[\"\']', 'href="/articles/"', c)

    # Clean about links
    c = re.sub(r'href=[\"\'](?:\.\.\/)*about\.html[\"\']', 'href="/about/"', c)

    # Clean collections links
    c = re.sub(r'href=[\"\']/home/#collections[\"\']', 'href="/collections/"', c)
    c = re.sub(r'href=[\"\']#collections[\"\']', 'href="/collections/"', c)
    c = re.sub(r'href=[\"\']/articles/#collections[\"\']', 'href="/collections/"', c)
    c = re.sub(r'href=[\"\']collections\.html[\"\']', 'href="/collections/"', c)

    # Clean newsletter anchor links
    c = re.sub(r'href=[\"\']/home/#newsletter[\"\']', 'href="/#newsletter"', c)
    if current_canonical_url == f"{DOMAIN}/":
        c = re.sub(r'href=[\"\']/#newsletter[\"\']', 'href="#newsletter"', c)
    else:
        c = re.sub(r'href=[\"\']#newsletter[\"\']', 'href="/#newsletter"', c)

    # Clean article links
    for a in CANONICAL_LEDGER:
        slug = a['slug']
        c = re.sub(r'href=[\"\'](?:\.\.\/)*(?:articles\/)?' + slug + r'\.html[\"\']', f'href="/articles/{slug}/"', c)
        c = re.sub(r'href=[\"\'](?:\.\.\/)*(?:articles\/)?' + slug + r'[\"\']', f'href="/articles/{slug}/"', c)

    # Clean breadcrumb and json items pointing to /home/
    c = re.sub(r'\"item\":\s*\"https:\/\/jojjy\.org\/home\/\"', '"item": "https://jojjy.org/"', c)
    c = re.sub(r'\"url\":\s*\"https:\/\/jojjy\.org\/home\/\"', '"url": "https://jojjy.org/"', c)

    return c

def standardize_skip_link(html_content):
    """
    Ensure every page has an accessible skip-link right after <body>.
    """
    c = html_content
    # Remove existing inline styled skip links
    c = re.sub(r'<!-- Skip Link[^>]*-->\s*<a[^>]*href=[\"\']#main-content[\"\'][^>]*>[\s\S]*?<\/a>', '', c)
    c = re.sub(r'<a[^>]*href=[\"\']#main-content[\"\'][^>]*>[\s\S]*?<\/a>', '', c)

    skip_tag = '\n    <!-- Skip Link for Keyboard Accessibility -->\n    <a class="skip-link" href="#main-content">Skip to content</a>\n'
    c = re.sub(r'(<body[^>]*>)', r'\1' + skip_tag, c, count=1)
    return c

def add_rss_to_footer(html_content):
    """
    Add a quiet RSS link in the global footer.
    """
    c = html_content
    if '/feed.xml' in c:
        return c

    # Pattern 1: <div class="flex gap-5"> ... </div> (article pages)
    def repl_flex(m):
        block = m.group(1)
        if '/feed.xml' not in block:
            block = block.rstrip() + '\n            <a href="/feed.xml" class="hover:text-[var(--ink-primary)]">RSS</a>\n          '
        return f'<div class="flex gap-5">{block}</div>'

    c = re.sub(r'<div class=\"flex gap-5\">([\s\S]*?)<\/div>', repl_flex, c, count=1)

    # Pattern 2: <div style="display: flex; gap: var(--space-4);"> (about, index)
    def repl_style_flex(m):
        block = m.group(1)
        if '/feed.xml' not in block:
            block = block.rstrip() + '\n            <a href="/feed.xml" style="color: var(--color-ink-muted); text-decoration: none;">RSS</a>\n          '
        return f'<div style="display: flex; gap: var(--space-4);">{block}</div>'

    c = re.sub(r'<div style=\"display: flex; gap: var\(--space-4\);\">([\s\S]*?)<\/div>', repl_style_flex, c, count=1)

    # Pattern 3: <div class="footer-bottom-row"> ... </div>
    # (If explore section exists)
    if 'footer-nav-title' in c and '/feed.xml' not in c:
        c = re.sub(r'(<a\s+href=[\"\']/about/\" class=\"footer-link\">About George<\/a>)',
                   r'\1\n            <a href="/feed.xml" class="footer-link">RSS Feed</a>', c, count=1)

    return c

def standardize_images(html_content, is_home=False, is_about=False):
    """
    Ensure every <img> tag has explicit integer width and height matching intrinsic aspect ratio,
    non-empty descriptive alt text, decoding="async", and lazy/eager loading attributes.
    """
    header_end = html_content.find('</header>')

    def repl_img(match):
        img_str = match.group(0)
        match_start = match.start()

        # Extract attributes
        src_m = re.search(r'src=[\"\']([^\"\']+)[\"\']', img_str)
        if not src_m:
            return img_str
        src = src_m.group(1)
        filename = os.path.basename(src)

        alt_m = re.search(r'alt="([^"]*)"', img_str)
        if not alt_m:
            alt_m = re.search(r"alt='([^']*)'", img_str)
        alt = alt_m.group(1).strip() if alt_m else ''

        cls_m = re.search(r'class=[\"\']([^\"\']+)[\"\']', img_str)
        cls = cls_m.group(1) if cls_m else ''

        id_m = re.search(r'id=[\"\']([^\"\']+)[\"\']', img_str)
        img_id = id_m.group(1) if id_m else ''

        # Determine dimensions
        w, h = None, None
        if filename in IMAGE_DIMS:
            w, h = IMAGE_DIMS[filename]
        elif filename == 'Me.png':
            if 'about-portrait-img' in cls:
                w, h = 360, 420
            else:
                w, h = 48, 48

        if 'author-avatar-img' in cls or 'author-bio-avatar' in cls:
            w, h = 48, 48
            if not alt or alt in ('George', 'George avatar'):
                alt = 'George'

        # Correct specific truncated or legacy alt texts
        if alt == 'Busy Isn':
            alt = "Busy Isn't Faithful"
        elif alt == 'God Doesn':
            alt = "God Doesn't Need Your Resume"
        elif filename == 'writing-desk.png' and 'hero-visual-img' in cls:
            alt = "George's writing desk with open notebook and morning light"
        elif filename == 'hero-countryside.jpg' and 'writing-desk-img' in cls:
            alt = "Rolling countryside hills and morning sky near George's study"

        # Descriptive alt text fallbacks
        if not alt:
            if 'logo.png' in filename:
                alt = 'George — Christian Essays by George'
            elif 'george.png' in filename or 'Me.png' in filename:
                alt = 'George'
            else:
                alt = 'Editorial essay artwork'

        # Loading and fetchpriority
        is_above_fold = False
        is_in_header = (header_end != -1 and match_start < header_end)
        if is_in_header and 'brand-logo-img' in cls:
            is_above_fold = True
        elif is_home and ('hero-george-img' in cls or img_id == 'hero-george-img'):
            is_above_fold = True
        elif is_about and ('about-portrait-img' in cls or 'hero-visual-img' in cls):
            is_above_fold = True

        attrs = []
        if img_id:
            attrs.append(f'id="{img_id}"')
        attrs.append(f'src="{src}"')
        attrs.append(f'alt="{alt}"')
        if cls:
            attrs.append(f'class="{cls}"')
        if w and h:
            attrs.append(f'width="{w}"')
            attrs.append(f'height="{h}"')

        attrs.append('decoding="async"')
        if is_above_fold:
            attrs.append('loading="eager"')
            if ('hero-george-img' in cls or img_id == 'hero-george-img' or 'about-portrait-img' in cls or 'hero-visual-img' in cls):
                attrs.append('fetchpriority="high"')
        else:
            attrs.append('loading="lazy"')

        return f'<img {" ".join(attrs)} />'

    return re.sub(r'<img\s+[^>]+>', repl_img, html_content)

def build_head_meta(title, description, canonical_url, og_type, og_image, pub_time=None, mod_time=None, section=None, robots=None):
    """
    Standardize the complete <head> SEO metadata.
    """
    lines = [
        f'    <title>{title}</title>',
        f'    <meta name="description" content="{description}" />',
        '    <meta name="author" content="George" />',
        f'    <link rel="canonical" href="{canonical_url}" />',
        '    <link rel="alternate" type="application/rss+xml" title="George | Christian Essays" href="https://jojjy.org/feed.xml" />'
    ]
    if robots:
        lines.append(f'    <meta name="robots" content="{robots}" />')

    lines.extend([
        '    <!-- Open Graph / Facebook -->',
        f'    <meta property="og:type" content="{og_type}" />',
        '    <meta property="og:site_name" content="George" />',
        f'    <meta property="og:url" content="{canonical_url}" />',
        f'    <meta property="og:title" content="{title}" />',
        f'    <meta property="og:description" content="{description}" />',
        f'    <meta property="og:image" content="{og_image}" />',
        f'    <meta property="og:image:alt" content="{title}" />',
        '    <meta property="og:locale" content="en_US" />'
    ])
    if og_type == 'article':
        lines.append('    <meta property="article:author" content="https://jojjy.org/about/" />')
        if pub_time:
            lines.append(f'    <meta property="article:published_time" content="{pub_time}" />')
        if mod_time:
            lines.append(f'    <meta property="article:modified_time" content="{mod_time}" />')
        if section:
            lines.append(f'    <meta property="article:section" content="{section}" />')

    lines.extend([
        '    <!-- Twitter Card -->',
        '    <meta name="twitter:card" content="summary_large_image" />',
        f'    <meta name="twitter:url" content="{canonical_url}" />',
        f'    <meta name="twitter:title" content="{title}" />',
        f'    <meta name="twitter:description" content="{description}" />',
        f'    <meta name="twitter:image" content="{og_image}" />'
    ])

    return '\n'.join(lines)

def replace_head_seo_and_schema(content, new_head_meta, json_ld_obj):
    """
    Replace title, description, canonical, OG, Twitter, and JSON-LD structured data in <head>.
    """
    c = content

    # 1. Remove existing title
    c = re.sub(r'<title>[\s\S]*?<\/title>', '', c)

    # 2. Remove existing meta description, author, canonical, robots, og:*, twitter:*, article:*, rss link
    c = re.sub(r'<meta\s+name=[\"\']description[\"\'][^>]*>', '', c)
    c = re.sub(r'<meta\s+name=[\"\']author[\"\'][^>]*>', '', c)
    c = re.sub(r'<meta\s+name=[\"\']robots[\"\'][^>]*>', '', c)
    c = re.sub(r'<link\s+rel=[\"\']canonical[\"\'][^>]*>', '', c)
    c = re.sub(r'<link\s+rel=[\"\']alternate[\"\'][^>]*type=[\"\']application\/rss\+xml[\"\'][^>]*>', '', c)
    c = re.sub(r'<meta\s+property=[\"\']og:[^\"\']+[\"\'][^>]*>', '', c)
    c = re.sub(r'<meta\s+property=[\"\']article:[^\"\']+[\"\'][^>]*>', '', c)
    c = re.sub(r'<meta\s+name=[\"\']twitter:[^\"\']+[\"\'][^>]*>', '', c)
    c = re.sub(r'<!--\s*(?:Open Graph|Twitter Card|Structured Data|Facebook)[\s\S]*?-->', '', c)

    # 3. Remove existing <script type="application/ld+json"> blocks
    c = re.sub(r'<script\s+type=[\"\']application\/ld\+json[\"\']>[\s\S]*?<\/script>', '', c)

    # 4. Clean up any excess whitespace in <head>
    c = re.sub(r'\n\s*\n\s*\n+', '\n\n', c)

    # Format JSON-LD
    json_ld_str = json.dumps(json_ld_obj, indent=2, ensure_ascii=False)
    json_ld_block = f'    <!-- Structured Data (JSON-LD) -->\n    <script type="application/ld+json">\n{json_ld_str}\n    </script>'

    injected = f'\n{new_head_meta}\n\n{json_ld_block}\n  '

    # Insert before </head>
    c = c.replace('</head>', f'{injected}</head>')
    return c

def generate_feed_xml():
    """
    Generate authentic RSS 2.0 feed containing all 18 essays sorted reverse-chronologically.
    """
    now_rfc822 = datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT')

    items_xml = []
    # Sort reverse-chronologically by publication date
    sorted_articles = sorted(CANONICAL_LEDGER, key=lambda a: a['date'], reverse=True)

    for a in sorted_articles:
        dt = datetime.strptime(a['date'], '%Y-%m-%d')
        rfc822 = dt.strftime('%a, %d %b %Y 08:00:00 GMT')
        slug = a['slug']
        url = f"{DOMAIN}/articles/{slug}/"
        title = saxutils.escape(a['headline'])
        category = saxutils.escape(a['topic'])
        desc = saxutils.escape(a['desc'])
        items_xml.append(f"""    <item>
      <title>{title}</title>
      <link>{url}</link>
      <guid isPermaLink="true">{url}</guid>
      <pubDate>{rfc822}</pubDate>
      <category>{category}</category>
      <description>{desc}</description>
    </item>""")

    feed_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>George | Christian Essays</title>
    <link>{DOMAIN}/</link>
    <description>Short, honest Christian essays on faith, work, and ordinary life.</description>
    <language>en-us</language>
    <lastBuildDate>{now_rfc822}</lastBuildDate>
    <atom:link href="{DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
{chr(10).join(items_xml)}
  </channel>
</rss>
"""
    with open(os.path.join(ROOT_DIR, 'feed.xml'), 'w', encoding='utf-8') as f:
        f.write(feed_content)
    print("Generated /feed.xml with 18 essays in reverse-chronological order.")

def generate_sitemap_xml():
    """
    Generate strictly canonical sitemap.xml with 22 URLs.
    """
    latest_date = CANONICAL_LEDGER[0]['date'] # 2025-08-03
    core_urls = [
        {'loc': f"{DOMAIN}/", 'lastmod': latest_date, 'changefreq': 'weekly', 'priority': '1.0'},
        {'loc': f"{DOMAIN}/articles/", 'lastmod': latest_date, 'changefreq': 'weekly', 'priority': '0.9'},
        {'loc': f"{DOMAIN}/collections/", 'lastmod': latest_date, 'changefreq': 'monthly', 'priority': '0.8'},
        {'loc': f"{DOMAIN}/about/", 'lastmod': latest_date, 'changefreq': 'monthly', 'priority': '0.8'},
    ]

    url_entries = []
    for u in core_urls:
        url_entries.append(f"""  <url>
    <loc>{u['loc']}</loc>
    <lastmod>{u['lastmod']}</lastmod>
    <changefreq>{u['changefreq']}</changefreq>
    <priority>{u['priority']}</priority>
  </url>""")

    for a in CANONICAL_LEDGER:
        url = f"{DOMAIN}/articles/{a['slug']}/"
        url_entries.append(f"""  <url>
    <loc>{url}</loc>
    <lastmod>{a['date']}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

    sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(url_entries)}
</urlset>
"""
    with open(os.path.join(ROOT_DIR, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    print(f"Generated /sitemap.xml with {len(core_urls) + len(CANONICAL_LEDGER)} canonical URLs.")

def generate_robots_txt():
    """
    Ensure clean, production-grade robots.txt.
    """
    content = f"""# ==============================================================================
# ROBOTS.TXT FOR HTTPS://JOJJY.ORG
# ==============================================================================

User-agent: *
Allow: /
Allow: /articles/
Allow: /collections/
Allow: /about/
Allow: /images/
Allow: /styles.css
Allow: /main.js
Allow: /motion.js
Allow: /feed.xml

# Disallow Internal Utilities, Source Drafts & Config Files
Disallow: /article.html
Disallow: /src/
Disallow: /scripts/
Disallow: /.agents/
Disallow: /*.json$
Disallow: /*.ps1$
Disallow: /*.md$
Disallow: /*.docx$
Disallow: /.*

# XML Sitemap Location
Sitemap: {DOMAIN}/sitemap.xml
"""
    with open(os.path.join(ROOT_DIR, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write(content)
    print("Generated /robots.txt.")

def generate_htaccess():
    """
    Generate optimized Apache .htaccess with clean URL resolution, HTTPS enforcement,
    far-future caching, gzip compression, and security headers.
    """
    content = r"""# ==============================================================================
# PRODUCTION SERVER CONFIGURATION (.htaccess) — JOJJY.ORG
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Custom Error Documents (Editorial Branded 404 Experience)
# ------------------------------------------------------------------------------
ErrorDocument 404 /404.html
ErrorDocument 403 /404.html

# ------------------------------------------------------------------------------
# 2. Prevent Directory Browsing & Enforce Trailing Slash
# ------------------------------------------------------------------------------
Options -Indexes
<IfModule mod_dir.c>
  DirectorySlash On
  DirectoryIndex index.html
</IfModule>

# ------------------------------------------------------------------------------
# 3. Enforce HTTPS, Canonical Domain & Clean Trailing Slash URLs (301 Redirects)
# ------------------------------------------------------------------------------
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Enforce canonical non-www over HTTPS in a single step
  RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

  # Redirect remaining HTTP non-www to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://jojjy.org%{REQUEST_URI} [R=301,L]

  # 301 Redirect legacy /index.html and /home/ to root /
  RewriteCond %{THE_REQUEST} \s/index\.html[?\s] [NC]
  RewriteRule ^index\.html$ / [R=301,L]

  RewriteCond %{THE_REQUEST} \s/home(/index\.html)?/?[\s?] [NC]
  RewriteRule ^home(/index\.html)?/?$ / [R=301,L]

  # 301 Redirect legacy /about.html to clean /about/
  RewriteCond %{THE_REQUEST} \s/about\.html[?\s] [NC]
  RewriteRule ^about\.html$ /about/ [R=301,L]

  # 301 Redirect legacy /articles.html to clean /articles/
  RewriteCond %{THE_REQUEST} \s/articles\.html[?\s] [NC]
  RewriteRule ^articles\.html$ /articles/ [R=301,L]

  # 301 Redirect legacy /collections.html to clean /collections/
  RewriteCond %{THE_REQUEST} \s/collections\.html[?\s] [NC]
  RewriteRule ^collections\.html$ /collections/ [R=301,L]

  # 301 Redirect legacy /articles/article-*.html to clean directory /articles/article-*/
  RewriteCond %{THE_REQUEST} \s/articles/(article-[^/.]+)\.html[?\s] [NC]
  RewriteRule ^articles/(article-[^/.]+)\.html$ /articles/$1/ [R=301,L]

  # Redirect direct requests for unpopulated template to essay archive
  RewriteRule ^article\.html$ /articles/ [R=301,L]
</IfModule>

# ------------------------------------------------------------------------------
# 4. Sensitive Files, Drafts & Directory Protection
# ------------------------------------------------------------------------------
# Block direct web access to private documents, shell scripts, logs, and markdown
<FilesMatch "\.(docx|doc|odt|ps1|md|log|bak|tmp)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block deployment configuration and manifest JSON files (manifest.json remains public)
<FilesMatch "(deploy-config.*|deploy-manifest|deploy-state|\.skills)\.json$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block hidden files and directories (.git, .env, .htaccess, etc.)
<FilesMatch "^\.">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block direct access to internal directories (source notes & maintenance scripts)
RedirectMatch 404 ^/(src|scripts)(/.*)?$

# ------------------------------------------------------------------------------
# 5. Security Headers
# ------------------------------------------------------------------------------
<IfModule mod_headers.c>
  # HTTP Strict Transport Security (HSTS)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  
  # Prevent Clickjacking
  Header always set X-Frame-Options "SAMEORIGIN"
  
  # Prevent MIME sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Permissions Policy
  Header always set Permissions-Policy "geolocation=(self), microphone=(), camera=()"
</IfModule>

# ------------------------------------------------------------------------------
# 6. Enable GZIP / Deflate Compression (Speed & Core Web Vitals)
# ------------------------------------------------------------------------------
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
  AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript application/x-javascript
  AddOutputFilterByType DEFLATE application/json application/ld+json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# ------------------------------------------------------------------------------
# 7. Leverage Browser Caching
# ------------------------------------------------------------------------------
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"

  # HTML documents (short cache for immediate editorial updates)
  ExpiresByType text/html "access plus 1 hour"

  # Data feeds & feeds
  ExpiresByType application/json "access plus 1 hour"
  ExpiresByType application/ld+json "access plus 1 hour"
  ExpiresByType text/xml "access plus 1 hour"
  ExpiresByType application/xml "access plus 1 hour"
  ExpiresByType application/rss+xml "access plus 1 hour"

  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"

  # Media files (Images & Fonts)
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
</IfModule>
"""
    with open(os.path.join(ROOT_DIR, '.htaccess'), 'w', encoding='utf-8') as f:
        f.write(content)
    print("Generated /.htaccess.")

def create_collections_page():
    """
    Create /collections/index.html and collections.html.
    """
    os.makedirs(os.path.join(ROOT_DIR, 'collections'), exist_ok=True)

    title = "Collections | George"
    description = "Curated collections of short Christian essays on Work & Vocation, Quiet Holiness, Scripture, and Suffering & Joy. Find truth for your current season."
    canonical = f"{DOMAIN}/collections/"
    og_image = f"{DOMAIN}/images/business.jpg"

    head_meta = build_head_meta(title, description, canonical, "website", og_image)

    json_ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": f"{DOMAIN}/collections/#collections",
        "url": f"{DOMAIN}/collections/",
        "name": "Collections | George",
        "description": description,
        "isPartOf": {
            "@type": "WebSite",
            "@id": f"{DOMAIN}/#website",
            "name": "George",
            "alternateName": "Jojjy",
            "url": f"{DOMAIN}/",
            "publisher": {
                "@id": f"{DOMAIN}/#george"
            }
        },
        "author": {
            "@type": "Person",
            "@id": f"{DOMAIN}/#george",
            "name": "George",
            "url": f"{DOMAIN}/about/"
        },
        "publisher": {
            "@type": "Organization",
            "@id": f"{DOMAIN}/#website",
            "name": "George",
            "url": f"{DOMAIN}/"
        }
    }

    # Build collection cards
    html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/x-icon" href="/images/favicon/favicon.ico" />
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon/favicon-96x96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-icon-180x180.png" />
    <link rel="manifest" href="/images/favicon/manifest.json" />
{head_meta}

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
{json.dumps(json_ld, indent=2, ensure_ascii=False)}
    </script>
  </head>

  <body>
    <!-- Reading Progress Bar -->
    <div style="position: fixed; inset-inline: 0; top: 0; z-index: 70; height: 2px;">
      <div id="reading-progress"></div>
    </div>

    <!-- Skip Link for Keyboard Accessibility -->
    <a class="skip-link" href="#main-content">Skip to content</a>

    <!-- Masthead & Site Header -->
    <header class="site-header">
      <div class="site-container">
        <div class="header-inner">
          <a href="/" class="brand-logo" aria-label="George home">
            <img src="/images/logo.png" alt="George — Christian Essays by George" class="brand-logo-img" width="120" height="32" decoding="async" loading="lazy" />
          </a>

          <nav id="site-nav" aria-label="Primary navigation" class="site-nav">
            <a href="/" class="nav-link">Home</a>
            <a href="/articles/" class="nav-link">Essays</a>
            <a href="/collections/" class="nav-link is-active">Collections</a>
            <a href="/about/" class="nav-link">About</a>
            <a href="/#newsletter" class="nav-link">Sunday Letter</a>
          </nav>

          <button id="mobile-nav-trigger" class="mobile-nav-trigger" onclick="toggleMobileNav()" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
            <iconify-icon icon="solar:hamburger-menu-linear" width="18" stroke-width="1.5"></iconify-icon>
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>

    <main id="main-content">
      <!-- Collections Hero Header -->
      <section class="archive-hero-header">
        <div class="site-container">
          <p style="font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-ink-muted); margin: 0 0 var(--space-2) 0;">
            Curated Themes
          </p>
          <h1 class="archive-hero-title">Collections</h1>
          <p class="archive-hero-subtitle">Read for the season you are in. Curated reflections gathered around the quiet rhythms of faith, labor, and perseverance.</p>
        </div>
      </section>

      <!-- The 4 Thematic Collections Sections -->
      <section class="site-container" style="padding-top: var(--space-8); padding-bottom: var(--space-16);">
        <div class="bento-grid" style="margin-bottom: var(--space-12);">
          <!-- Work & Vocation -->
          <div class="bento-item" style="padding: var(--space-8);">
            <div class="card-thumb-wrap" style="margin: calc(var(--space-8) * -1) calc(var(--space-8) * -1) var(--space-6) calc(var(--space-8) * -1);">
              <img src="/images/business.jpg" alt="Work & Vocation Collection" class="card-thumb-img" width="1476" height="978" decoding="async" loading="lazy" />
            </div>
            <span class="topic-tag">Work</span>
            <h2 style="font-size: var(--text-2xl); line-height: var(--leading-2xl); margin: var(--space-2) 0 var(--space-3) 0;">Work & Vocation</h2>
            <p style="color: var(--color-ink-secondary); font-size: var(--text-sm); line-height: var(--leading-sm); margin: 0 0 var(--space-6) 0;">Ordinary faithfulness at your desk, commute, and daily grind. Untangling self-worth from performance.</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
              <a href="/articles/article-busy-isnt-faithful/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Busy Isn't Faithful →</a>
              <a href="/articles/article-nobody-is-self-made/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Nobody Is Self-Made →</a>
              <a href="/articles/article-what-poverty-taught-me-about-riches/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">What Poverty Taught Me About Riches →</a>
              <a href="/articles/article-whatever-you-do-as-unto-the-lord/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Whatever You Do, As Unto the Lord →</a>
              <a href="/articles/article-work-existed-before-sin/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Work Existed Before Sin →</a>
              <a href="/articles/article-you-are-not-your-job-title/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">You Are Not Your Job Title →</a>
            </div>
            <div style="margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-muted);">
              6 curated essays
            </div>
          </div>

          <!-- Quiet Holiness -->
          <div class="bento-item" style="padding: var(--space-8);">
            <div class="card-thumb-wrap" style="margin: calc(var(--space-8) * -1) calc(var(--space-8) * -1) var(--space-6) calc(var(--space-8) * -1);">
              <img src="/images/anxious.jpg" alt="Quiet Holiness Collection" class="card-thumb-img" width="1074" height="806" decoding="async" loading="lazy" />
            </div>
            <span class="topic-tag">Holiness</span>
            <h2 style="font-size: var(--text-2xl); line-height: var(--leading-2xl); margin: var(--space-2) 0 var(--space-3) 0;">Quiet Holiness</h2>
            <p style="color: var(--color-ink-secondary); font-size: var(--text-sm); line-height: var(--leading-sm); margin: 0 0 var(--space-6) 0;">Guarding the mind against digital noise, confronting hurry, and unlearning respectable anxieties.</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
              <a href="/articles/article-churches-dont-drift-toward-truth/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Churches Don't Drift Toward Truth →</a>
              <a href="/articles/article-terrified-of-silence/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Terrified of Silence →</a>
              <a href="/articles/article-the-respectable-sin-nobody-talks-about/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">The Respectable Sin Nobody Talks About →</a>
              <a href="/articles/article-your-mind-is-under-attack-and-you-dont-even-see-it/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Your Mind Is Under Attack →</a>
            </div>
            <div style="margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-muted);">
              4 curated essays
            </div>
          </div>

          <!-- Reading Scripture -->
          <div class="bento-item" style="padding: var(--space-8);">
            <div class="card-thumb-wrap" style="margin: calc(var(--space-8) * -1) calc(var(--space-8) * -1) var(--space-6) calc(var(--space-8) * -1);">
              <img src="/images/open-bible.png" alt="Reading Scripture Collection" class="card-thumb-img" width="1024" height="1024" decoding="async" loading="lazy" />
            </div>
            <span class="topic-tag">Scripture</span>
            <h2 style="font-size: var(--text-2xl); line-height: var(--leading-2xl); margin: var(--space-2) 0 var(--space-3) 0;">Reading Scripture</h2>
            <p style="color: var(--color-ink-secondary); font-size: var(--text-sm); line-height: var(--leading-sm); margin: 0 0 var(--space-6) 0;">Approaching ancient words with patient, open posture. Seeing Christ across all redemptive history.</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
              <a href="/articles/article-god-doesnt-need-your-resume/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">God Doesn't Need Your Resume →</a>
              <a href="/articles/article-the-bible-was-never-about-you/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">The Bible Was Never About You →</a>
              <a href="/articles/article-the-jesus-you-missed-in-the-old-testament/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">The Jesus You Missed in the Old Testament →</a>
              <a href="/articles/article-the-verse-that-is-slowly-killing-you/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">The Verse That Is Slowly Killing You →</a>
            </div>
            <div style="margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-muted);">
              4 curated essays
            </div>
          </div>

          <!-- Suffering & Joy -->
          <div class="bento-item" style="padding: var(--space-8);">
            <div class="card-thumb-wrap" style="margin: calc(var(--space-8) * -1) calc(var(--space-8) * -1) var(--space-6) calc(var(--space-8) * -1);">
              <img src="/images/prayer.jpg" alt="Suffering & Joy Collection" class="card-thumb-img" width="640" height="578" decoding="async" loading="lazy" />
            </div>
            <span class="topic-tag">Suffering & Joy</span>
            <h2 style="font-size: var(--text-2xl); line-height: var(--leading-2xl); margin: var(--space-2) 0 var(--space-3) 0;">Suffering & Joy</h2>
            <p style="color: var(--color-ink-secondary); font-size: var(--text-sm); line-height: var(--leading-sm); margin: 0 0 var(--space-6) 0;">Waiting in the dark without pretending the dark isn't real. Enduring grief with resurrection hope.</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
              <a href="/articles/article-faithfulness-can-feel-lonely/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Faithfulness Can Feel Lonely →</a>
              <a href="/articles/article-waiting-is-not-wasting/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Waiting Is Not Wasting →</a>
              <a href="/articles/article-why-friendship-feels-so-rare/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">Why Friendship Feels So Rare →</a>
              <a href="/articles/article-you-were-not-made-for-sadness/" style="color: inherit; text-decoration: none; font-size: var(--text-sm); font-weight: 500;">You Were Not Made for Sadness →</a>
            </div>
            <div style="margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-muted);">
              4 curated essays
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: var(--space-12);">
          <a href="/articles/" class="btn-outline" style="display: inline-flex; align-items: center; gap: var(--space-2);">
            <span>Explore all 18 essays chronologically</span>
            <iconify-icon icon="solar:arrow-right-linear" width="16" stroke-width="1.5"></iconify-icon>
          </a>
        </div>
      </section>

      <!-- Sunday Letter Section -->
      <section id="newsletter" class="newsletter-section">
        <div class="site-container">
          <div class="newsletter-card">
            <p class="newsletter-kicker">THE SUNDAY LETTER</p>
            <h2 class="newsletter-title">Thoughts worth a minute.<br />Truth worth a lifetime.</h2>
            <p class="newsletter-desc">One short Christian reflection every Sunday morning. No noise, no marketing, no spam. Unsubscribe at any time.</p>
            <form class="newsletter-form" aria-label="Sunday letter signup">
              <label for="collections-email" class="sr-only">Email address</label>
              <div class="newsletter-form-row">
                <input id="collections-email" type="email" required autocomplete="email" placeholder="your@email.com" class="newsletter-input" />
                <button type="submit" class="newsletter-btn">
                  <span>Subscribe</span>
                  <iconify-icon icon="solar:arrow-right-linear" width="14" stroke-width="1.5"></iconify-icon>
                </button>
              </div>
              <p class="form-message" role="status" aria-live="polite">Calm inbox. Join readers in the quiet rhythm.</p>
            </form>
          </div>
        </div>
      </section>
    </main>

    <!-- Site Footer -->
    <footer class="site-footer">
      <div class="site-container">
        <div class="footer-grid">
          <div>
            <a href="/" class="brand-logo" style="margin-bottom: var(--space-3);" aria-label="George home">
              <img src="/images/logo.png" alt="George — Christian Essays by George" class="brand-logo-img" width="120" height="32" decoding="async" loading="lazy" />
            </a>
            <p style="font-size: var(--text-sm); color: var(--color-ink-secondary); margin: 0; line-height: var(--leading-sm); max-width: 320px;">
              Thoughts worth a minute.<br />
              Truth worth a lifetime.
            </p>
          </div>

          <div>
            <p class="footer-nav-title">Explore</p>
            <a href="/articles/" class="footer-link">All articles</a>
            <a href="/collections/" class="footer-link">Collections</a>
            <a href="/about/" class="footer-link">About George</a>
            <a href="/feed.xml" class="footer-link">RSS Feed</a>
          </div>

          <div>
            <p class="footer-nav-title">Elsewhere</p>
            <a href="/#newsletter" class="footer-link">Sunday letter</a>
            <a href="mailto:hello@georgewrites.com" class="footer-link">Write a note</a>
            <a href="/about/" class="footer-link">Meet George</a>
          </div>
        </div>

        <div class="footer-bottom-row">
          <p style="margin: 0;">© 2026 George. Essays by George, written slowly in the countryside.</p>
          <div style="display: flex; gap: var(--space-4);">
            <a href="/" style="color: var(--color-ink-muted); text-decoration: none;">Home</a>
            <a href="/articles/" style="color: var(--color-ink-muted); text-decoration: none;">Archive</a>
            <a href="/collections/" style="color: var(--color-ink-muted); text-decoration: none;">Collections</a>
            <a href="/about/" style="color: var(--color-ink-muted); text-decoration: none;">About</a>
            <a href="/feed.xml" style="color: var(--color-ink-muted); text-decoration: none;">RSS</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Scripts -->
    <script src="/main.js"></script>
    <script src="/motion.js" defer></script>
  </body>
</html>
"""
    with open(os.path.join(ROOT_DIR, 'collections', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    with open(os.path.join(ROOT_DIR, 'collections.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print("Created /collections/index.html and collections.html.")

def update_homepage():
    """
    Standardize root index.html.
    """
    path = os.path.join(ROOT_DIR, 'index.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    canonical = f"{DOMAIN}/"
    title = "George | Short Christian Essays on Faith, Work & Ordinary Life"
    desc = "Short, honest Christian essays on faith, daily work, quiet holiness, and ordinary life. Contemplative, literary reflections written slowly in the countryside."
    og_image = f"{DOMAIN}/images/hero-countryside.png"

    head_meta = build_head_meta(title, desc, canonical, "website", og_image)

    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": f"{DOMAIN}/#website",
                "url": f"{DOMAIN}/",
                "name": "George",
                "alternateName": "Jojjy",
                "description": desc,
                "inLanguage": "en-US",
                "publisher": {
                    "@id": f"{DOMAIN}/#george"
                }
            },
            {
                "@type": "Person",
                "@id": f"{DOMAIN}/#george",
                "name": "George",
                "url": f"{DOMAIN}/about/",
                "description": "Writer of contemplative, short Christian essays on faith, work, and the ordinary life.",
                "jobTitle": "Author & Essayist"
            }
        ]
    }

    c = replace_head_seo_and_schema(content, head_meta, json_ld)
    c = clean_internal_urls(c, canonical)
    c = standardize_skip_link(c)
    c = add_rss_to_footer(c)
    c = standardize_images(c, is_home=True)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Updated root index.html.")

def update_about_pages():
    """
    Standardize about/index.html and about.html.
    """
    path = os.path.join(ROOT_DIR, 'about', 'index.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    canonical = f"{DOMAIN}/about/"
    title = "About George | Christian Essays from the Countryside"
    desc = "George writes short, contemplative Christian essays from the countryside. Learn about the quiet editorial mission, biblical convictions, and thoughts on life."
    og_image = f"{DOMAIN}/images/Me.png"

    head_meta = build_head_meta(title, desc, canonical, "website", og_image)

    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "AboutPage",
                "@id": f"{DOMAIN}/about/#webpage",
                "url": f"{DOMAIN}/about/",
                "name": title,
                "description": desc,
                "isPartOf": {
                    "@type": "WebSite",
                    "@id": f"{DOMAIN}/#website",
                    "name": "George",
                    "alternateName": "Jojjy",
                    "url": f"{DOMAIN}/"
                },
                "mainEntity": {
                    "@id": f"{DOMAIN}/#george"
                }
            },
            {
                "@type": "Person",
                "@id": f"{DOMAIN}/#george",
                "name": "George",
                "url": f"{DOMAIN}/about/",
                "image": f"{DOMAIN}/images/Me.png",
                "jobTitle": "Author & Essayist",
                "description": "Writer of contemplative, short Christian essays on faith, work, and the ordinary life.",
                "sameAs": [
                    f"{DOMAIN}/about/"
                ]
            }
        ]
    }

    c = replace_head_seo_and_schema(content, head_meta, json_ld)
    c = clean_internal_urls(c, canonical)
    c = standardize_skip_link(c)
    c = add_rss_to_footer(c)
    c = standardize_images(c, is_about=True)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    with open(os.path.join(ROOT_DIR, 'about.html'), 'w', encoding='utf-8') as f:
        f.write(c)
    print("Updated /about/index.html and about.html.")

def update_articles_archive():
    """
    Standardize articles/index.html and articles.html.
    """
    path = os.path.join(ROOT_DIR, 'articles', 'index.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    canonical = f"{DOMAIN}/articles/"
    title = "Essays Archive | George"
    desc = "Browse the complete archive of short Christian essays on faith, vocation, scripture, and sorrow. Read slowly and discover truth worth a lifetime."
    og_image = f"{DOMAIN}/images/hero-countryside.png"

    head_meta = build_head_meta(title, desc, canonical, "website", og_image)

    item_list = []
    for idx, a in enumerate(CANONICAL_LEDGER, 1):
        item_list.append({
            "@type": "ListItem",
            "position": idx,
            "url": f"{DOMAIN}/articles/{a['slug']}/",
            "name": a['headline']
        })

    json_ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": f"{DOMAIN}/articles/#collection",
        "url": f"{DOMAIN}/articles/",
        "name": title,
        "description": desc,
        "isPartOf": {
            "@type": "WebSite",
            "@id": f"{DOMAIN}/#website",
            "name": "George",
            "alternateName": "Jojjy",
            "url": f"{DOMAIN}/",
            "publisher": {
                "@id": f"{DOMAIN}/#george"
            }
        },
        "author": {
            "@type": "Person",
            "@id": f"{DOMAIN}/#george",
            "name": "George",
            "url": f"{DOMAIN}/about/"
        },
        "publisher": {
            "@type": "Organization",
            "@id": f"{DOMAIN}/#website",
            "name": "George",
            "url": f"{DOMAIN}/"
        },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(CANONICAL_LEDGER),
            "itemListElement": item_list
        }
    }

    c = replace_head_seo_and_schema(content, head_meta, json_ld)
    c = clean_internal_urls(c, canonical)
    c = standardize_skip_link(c)
    c = add_rss_to_footer(c)
    c = standardize_images(c)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    with open(os.path.join(ROOT_DIR, 'articles.html'), 'w', encoding='utf-8') as f:
        f.write(c)
    print("Updated /articles/index.html and articles.html.")

def update_article_pages():
    """
    Standardize all 18 article pages in /articles/[slug]/index.html and /articles/[slug].html.
    """
    for a in CANONICAL_LEDGER:
        slug = a['slug']
        path = os.path.join(ROOT_DIR, 'articles', slug, 'index.html')
        legacy_path = os.path.join(ROOT_DIR, 'articles', f"{slug}.html")

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        canonical = f"{DOMAIN}/articles/{slug}/"
        title = f"{a['headline']} | George"
        desc = a['desc']
        og_image = f"{DOMAIN}/{a['image']}"

        head_meta = build_head_meta(
            title, desc, canonical, "article", og_image,
            pub_time=f"{a['date']}T08:00:00+00:00",
            mod_time=f"{a['date']}T08:00:00+00:00",
            section=a['category']
        )

        json_ld = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": f"{canonical}#article",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonical
            },
            "headline": a['headline'],
            "description": desc,
            "datePublished": a['date'],
            "dateModified": a['date'],
            "wordCount": a['words'],
            "timeRequired": f"PT{a['readTime']}M",
            "articleSection": a['category'],
            "inLanguage": "en",
            "image": {
                "@type": "ImageObject",
                "url": og_image
            },
            "author": {
                "@type": "Person",
                "@id": f"{DOMAIN}/#george",
                "name": "George",
                "url": f"{DOMAIN}/about/"
            },
            "publisher": {
                "@type": "Organization",
                "@id": f"{DOMAIN}/#website",
                "name": "George",
                "url": f"{DOMAIN}/"
            }
        }

        c = replace_head_seo_and_schema(content, head_meta, json_ld)
        c = clean_internal_urls(c, canonical)
        c = standardize_skip_link(c)
        c = add_rss_to_footer(c)
        c = standardize_images(c)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        with open(legacy_path, 'w', encoding='utf-8') as f:
            f.write(c)

    print(f"Standardized all {len(CANONICAL_LEDGER)} article pages and legacy counterparts.")

def update_404_page():
    """
    Standardize 404.html.
    """
    path = os.path.join(ROOT_DIR, '404.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    title = "Page Not Found | George"
    desc = "The page you are looking for has been moved or does not exist. Return home or explore the archive of short Christian essays on faith, work, and ordinary life."

    # Update title
    c = re.sub(r'<title>[\s\S]*?<\/title>', f'<title>{title}</title>', content)
    # Update description
    c = re.sub(r'<meta\s+name=[\"\']description[\"\'][^>]*>', f'<meta name="description" content="{desc}" />', c)
    # Ensure robots
    if 'name="robots"' not in c:
        c = c.replace('<head>', '<head>\n    <meta name="robots" content="noindex, follow" />')
    # RSS link in head
    if '/feed.xml' not in c:
        c = c.replace('</head>', '    <link rel="alternate" type="application/rss+xml" title="George | Christian Essays" href="https://jojjy.org/feed.xml" />\n  </head>')

    c = clean_internal_urls(c, f"{DOMAIN}/404.html")
    c = standardize_skip_link(c)
    c = add_rss_to_footer(c)
    c = standardize_images(c)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Updated 404.html.")

def update_template_page():
    """
    Standardize article.html template.
    """
    path = os.path.join(ROOT_DIR, 'article.html')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        c = content
        c = re.sub(r'<title>[\s\S]*?<\/title>', '<title>Article Template | George</title>', c)
        c = re.sub(r'<meta\s+name=[\"\']description[\"\'][^>]*>', '<meta name="description" content="Contemplative editorial essay template for George — Christian Essays publication." />', c)
        c = clean_internal_urls(c, f"{DOMAIN}/article.html")
        c = standardize_skip_link(c)
        c = add_rss_to_footer(c)
        c = standardize_images(c)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print("Updated article.html template.")

def cleanup_dead_files():
    """
    Delete legacy home/ directory and temporary backup files.
    """
    import shutil
    home_dir = os.path.join(ROOT_DIR, 'home')
    if os.path.exists(home_dir):
        shutil.rmtree(home_dir)
        print("Deleted legacy /home/ directory (cleanly redirected in .htaccess to root /).")

    pycache_dir = os.path.join(ROOT_DIR, 'scripts', '__pycache__')
    if os.path.exists(pycache_dir):
        shutil.rmtree(pycache_dir)
        print("Deleted scripts/__pycache__ directory.")

    # Scan for .bak and .tmp files
    removed_count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        if '.git' in dirs: dirs.remove('.git')
        for f in files:
            if f.endswith(('.bak', '.tmp', '.orig')):
                os.remove(os.path.join(root, f))
                removed_count += 1
    if removed_count > 0:
        print(f"Removed {removed_count} temporary backup files.")

def main():
    print("=== Executing Phase 6 Production Build ===")
    create_collections_page()
    update_homepage()
    update_about_pages()
    update_articles_archive()
    update_article_pages()
    update_404_page()
    update_template_page()
    generate_feed_xml()
    generate_sitemap_xml()
    generate_robots_txt()
    generate_htaccess()
    cleanup_dead_files()
    print("=== Phase 6 Production Build Complete ===")

if __name__ == '__main__':
    main()
