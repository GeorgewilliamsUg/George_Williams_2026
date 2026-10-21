#!/usr/bin/env python3
"""
Phase 7: Signature Literary Craft, Sequential Book Architecture,
Scripture Marginalia, Form Resilience, and Broadsheet Print Typesetting.
Autonomous build script for jojjy.org (George — Christian Essays).
"""

import os
import sys
import re
import json

ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, ROOT_DIR)
DOMAIN = "https://jojjy.org"

from scripts.build_phase6 import CANONICAL_LEDGER, ARTICLES_BY_SLUG

# ------------------------------------------------------------------------------
# 1. Comprehensive Scripture Citations & Verse Text Mapping
# ------------------------------------------------------------------------------
SCRIPTURE_VERSES = {
    # Epigraphs & explicit verse citations
    "Luke 10:41–42": "“Martha, Martha, you are anxious and troubled about many things, but one thing is necessary.” — Luke 10:41–42",
    "Luke 10:41": "“Martha, Martha, you are anxious and troubled about many things, but one thing is necessary.” — Luke 10:41",
    "Deuteronomy 8:17": "“Beware lest you say in your heart, ‘My power and the might of my hand have gotten me this wealth.’” — Deuteronomy 8:17",
    "1 Timothy 4:16": "“Keep a close watch on yourself and on the teaching. Persist in this, for by so doing you will save both yourself and your hearers.” — 1 Timothy 4:16",
    "Deuteronomy 31:6": "“Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.” — Deuteronomy 31:6",
    "1 Corinthians 1:27": "“God chose what is foolish in the world to shame the wise; God chose what is weak in the world to shame the strong.” — 1 Corinthians 1:27",
    "Judges 7": "“The Lord said to Gideon, ‘The people with you are too many for me to give the Midianites into their hand, lest Israel boast over me.’” — Judges 7:2",
    "Exodus 3": "“God said to Moses, ‘I AM WHO I AM.’ And he said, ‘Say this to the people of Israel: I AM has sent me to you.’” — Exodus 3:14",
    "Psalm 46:10": "“Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!” — Psalm 46:10",
    "John 5:39": "“You search the Scriptures because you think that in them you have eternal life; and it is they that bear witness about me.” — John 5:39",
    "Romans 11": "“Oh, the depth of the riches and wisdom and knowledge of God! How unsearchable are his judgments and how inscrutable his ways!” — Romans 11:33",
    "Hebrews 12": "“Looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross.” — Hebrews 12:2",
    "Luke 24:27": "“And beginning with Moses and all the Prophets, he interpreted to them in all the Scriptures the things concerning himself.” — Luke 24:27",
    "John 1:29": "“Behold, the Lamb of God, who takes away the sin of the world!” — John 1:29",
    "John 2:19": "“Jesus answered them, ‘Destroy this temple, and in three days I will raise it up.’” — John 2:19",
    "Galatians 3:24": "“The law was our guardian until Christ came, in order that we might be justified by faith.” — Galatians 3:24",
    "Hebrews 10:4": "“For it is impossible for the blood of bulls and goats to take away sins.” — Hebrews 10:4",
    "Psalm 22:1": "“My God, my God, why have you forsaken me? Why are you so far from saving me, from the words of my groaning?” — Psalm 22:1",
    "Isaiah 53": "“He was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace.” — Isaiah 53:5",
    "Philippians 4:6–7": "“Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.” — Philippians 4:6–7",
    "Philippians 4:6": "“Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.” — Philippians 4:6",
    "Philippians 4:4": "“Rejoice in the Lord always; again I will say, rejoice.” — Philippians 4:4",
    "Philippians 4:8": "“Whatever is true, whatever is honorable, whatever is just, whatever is pure... think about these things.” — Philippians 4:8",
    "Philippians 4:11": "“Not that I am speaking of being in need, for I have learned in whatever situation I am to be content.” — Philippians 4:11",
    "Philippians 4": "“Do not be anxious about anything... and the peace of God will guard your hearts in Christ Jesus.” — Philippians 4:6–7",
    "Matthew 6:25": "“Do not be anxious about your life, what you will eat or what you will drink... Is not life more than food?” — Matthew 6:25",
    "Matthew 6:26": "“Look at the birds of the air: they neither sow nor reap nor gather into barns, and yet your heavenly Father feeds them.” — Matthew 6:26",
    "Matthew 6:28": "“Consider the lilies of the field, how they grow: they neither toil nor spin.” — Matthew 6:28",
    "1 Peter 5:7": "“Casting all your anxieties on him, because he cares for you.” — 1 Peter 5:7",
    "Matthew 14": "“Take heart; it is I. Do not be afraid.” — Matthew 14:27",
    "Jeremiah 29:11": "“For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.” — Jeremiah 29:11",
    "Romans 8:28": "“And we know that for those who love God all things work together for good, for those who are called according to his purpose.” — Romans 8:28",
    "Romans 8:26": "“The Spirit helps us in our weakness. For we do not know what to pray for as we ought, but the Spirit himself intercedes for us.” — Romans 8:26",
    "1 Kings 19:18": "“Yet I will leave seven thousand in Israel, all the knees that have not bowed to Baal.” — 1 Kings 19:18",
    "Nehemiah 8:10": "“Do not be grieved, for the joy of the Lord is your strength.” — Nehemiah 8:10",
    "1 Peter 1:8": "“Though you have not seen him, you love him... you believe in him and rejoice with joy that is inexpressible and filled with glory.” — 1 Peter 1:8",
    "Isaiah 40:31": "“They who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.” — Isaiah 40:31",
    "Colossians 3:23": "“Whatever you do, work heartily, as for the Lord and not for men.” — Colossians 3:23",
    "Ecclesiastes 4:9": "“Two are better than one, because they have a good reward for their toil.” — Ecclesiastes 4:9",
    "Ecclesiastes 4:10": "“For if they fall, one will lift up his fellow. But woe to him who is alone when he falls.” — Ecclesiastes 4:10",
    "1 Samuel 18:1": "“The soul of Jonathan was knit to the soul of David, and Jonathan loved him as his own soul.” — 1 Samuel 18:1",
    "1 Samuel 18:3": "“Then Jonathan made a covenant with David, because he loved him as his own soul.” — 1 Samuel 18:3",
    "Proverbs 17:17": "“A friend loves at all times, and a brother is born for adversity.” — Proverbs 17:17",
    "2 Samuel 1:26": "“I am distressed for you, my brother Jonathan; very pleasant have you been to me.” — 2 Samuel 1:26",
    "Genesis 1": "“In the beginning, God created the heavens and the earth.” — Genesis 1:1",
    "Genesis 2:15": "“The Lord God took the man and put him in the garden of Eden to work it and keep it.” — Genesis 2:15",
    "Genesis 2": "“So God blessed the seventh day and made it holy, because on it God rested from all his work.” — Genesis 2:3",
    "Genesis 3:17": "“Cursed is the ground because of you; in pain you shall eat of it all the days of your life.” — Genesis 3:17",
    "1 John 3:1": "“See what kind of love the Father has given to us, that we should be called children of God; and so we are.” — 1 John 3:1",
}

SORTED_SCRIPTURE_KEYS = sorted(SCRIPTURE_VERSES.keys(), key=lambda k: len(k), reverse=True)

# Unified Editorial Google Fonts link loading Newsreader, Inter, and JetBrains Mono
UNIFIED_FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet" />'


# ------------------------------------------------------------------------------
# 2. Update styles.css: Deduplication, Dead Selector Purge, Book Nav, Marginalia, Print
# ------------------------------------------------------------------------------
def update_styles_css():
    css_path = os.path.join(ROOT_DIR, 'styles.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    # A. Consolidate duplicate :root at end into primary :root
    dup_root_pattern = r'/\* =+\s*28\.\s*HERO TEXT MOTION, HOVER RESPONSIVENESS & THEME COLOR ACCENTS\s*=+ \*/\s*:root\s*\{[\s\S]*?--color-forest-deep:\s*#2d4f24;\s*/\* Quiet sage/olive accent \*/\s*\}'
    if re.search(dup_root_pattern, css):
        css = re.sub(dup_root_pattern, '/* ==============================================================================\n   28. HERO TEXT MOTION, HOVER RESPONSIVENESS & THEME COLOR ACCENTS\n   ============================================================================== */', css)

    # Ensure theme variables exist in the main :root
    if '--color-earth-terracotta:' not in css:
        main_root_insert = """  /* Warm Editorial Complementary Theme Accents (Red Dirt Roads & Warm Amber) */
  --color-earth-terracotta: #9a3412; /* Rich warm terracotta (WCAG AA 6.8:1 contrast on white) */
  --color-earth-ochre: #b45309;      /* Warm golden amber */
  --color-earth-hover: #c2410c;      /* Brighter terracotta on hover */
  --color-forest-deep: #2d4f24;      /* Quiet sage/olive accent */

  /* Legacy aliases mapping to semantic paper tokens */"""
        css = css.replace('/* Legacy aliases mapping to semantic paper tokens */', main_root_insert, 1)

    # B. Remove dead selectors: [data-marquee-row], .summary-card, .rec-card
    css = re.sub(r'\s*\[data-marquee-row\]\s*\{\s*transform:\s*none\s*!important;\s*\}', '', css)
    css = re.sub(r'\.summary-card\s*\{[\s\S]*?\}', '', css)
    css = re.sub(r'\.rec-card\s*\{[\s\S]*?\}', '', css)
    css = re.sub(r'\.rec-card:hover\s*\{[\s\S]*?\}', '', css)
    css = re.sub(r'\.rec-card,\s*', '', css)

    # C. Eliminate translateY hover jumps
    css = re.sub(r'(\.author-bio-pill:hover\s*\{[^}]*?)transform:\s*translateY\(-1px\);', r'\1', css)
    css = re.sub(r'(\.hero-highlight-word:hover\s*\{[^}]*?)transform:\s*translateY\(-2px\)\s*scale\(1\.02\);', r'\1transform: scale(1.02);', css)
    css = re.sub(r'(\.hero-highlight-word:hover::after\s*\{[^}]*?)transform:\s*scaleX\(1\.02\)\s*translateY\(1px\);', r'\1transform: scaleX(1.02);', css)
    css = re.sub(r'(\.hero-word-hover:hover\s*\{[^}]*?)transform:\s*translateY\(-3px\);', r'\1', css)
    css = re.sub(r'@keyframes heroBadgePulse\s*\{[\s\S]*?50%\s*\{[\s\S]*?transform:\s*translateY\(-2px\);[\s\S]*?\}[\s\S]*?\}',
                 '@keyframes heroBadgePulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.85;\n  }\n}', css)

    # Clean any comments containing the literal substring 'translateY jump'
    css = re.sub(r'/\*\s*translateY jump purged\s*\*/', '', css)

    # D. Remove any stray active text-shadow rules
    css = re.sub(r'text-shadow:\s*0\s+4px\s+16px\s+rgba\(154,\s*52,\s*18,\s*0\.16\);', '', css)

    # Clean existing Phase 7 block if re-running
    if '/* ==============================================================================\n   PHASE 7:' in css:
        css = re.sub(r'/\* ==============================================================================\s*PHASE 7:[\s\S]*$', '', css)

    # E. Append Clean Phase 7 Styles
    phase7_css = """

/* ==============================================================================
   PHASE 7: SIGNATURE LITERARY CRAFT, BOOK NAVIGATION & SCRIPTURE MARGINALIA
   ============================================================================== */

/* ------------------------------------------------------------------------------
   1. CONTINUOUS BOOK NAVIGATION (SEQUENTIAL ESSAY THREADING)
   ------------------------------------------------------------------------------ */
.book-nav {
  background-color: var(--bg-recessed);
  border-top: 1px solid var(--rule-subtle);
  border-bottom: 1px solid var(--rule-subtle);
  padding: var(--space-10) 0;
}

.book-nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: stretch;
}

.book-nav-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-6);
  background-color: var(--bg-canvas);
  border: 1px solid var(--rule-subtle);
  border-radius: var(--radius-sm, 2px);
  text-decoration: none;
  transition: border-color var(--duration-fast) var(--ease-out-editorial),
              background-color var(--duration-fast) var(--ease-out-editorial);
  box-shadow: none !important;
}

.book-nav-card:hover {
  border-color: var(--rule-strong);
  background-color: var(--bg-elevated);
}

.book-nav-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.book-nav-prev {
  text-align: left;
  border-left: 2px solid var(--accent-primary);
}

.book-nav-next {
  text-align: right;
  border-right: 2px solid var(--accent-primary);
}

.book-nav-direction {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-2);
}

.book-nav-title {
  display: block;
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  line-height: var(--leading-lg, 1.3);
  color: var(--ink-primary);
  font-weight: var(--weight-medium, 500);
  transition: color var(--duration-fast) var(--ease-out-editorial);
}

.book-nav-card:hover .book-nav-title {
  color: var(--accent-primary);
}

.book-nav-hint {
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--ink-muted);
  letter-spacing: 0.04em;
  margin: var(--space-6) 0 0 0;
}

@media (max-width: 640px) {
  .book-nav-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  .book-nav-next {
    text-align: left;
    border-right: 1px solid var(--rule-subtle);
    border-left: 2px solid var(--accent-primary);
  }
}

/* ------------------------------------------------------------------------------
   2. SCRIPTURE MARGINALIA & INLINE VERSE CONTEXT
   ------------------------------------------------------------------------------ */
.scripture-ref {
  position: relative;
  font-style: normal;
  border-bottom: 1px dotted var(--accent-primary);
  cursor: help;
  display: inline;
  color: inherit;
}

.scripture-ref:focus {
  outline: none;
}

.scripture-ref:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.scripture-ref::after {
  content: attr(data-verse);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(calc(-50% + var(--popover-shift, 0px)));
  width: max-content;
  max-width: min(340px, 86vw);
  background-color: var(--bg-recessed);
  color: var(--ink-primary);
  font-family: var(--font-serif);
  font-size: var(--text-sm);
  line-height: 1.55;
  font-weight: 400;
  font-style: normal;
  text-align: left;
  letter-spacing: normal;
  padding: var(--space-3) var(--space-4);
  border-left: 2px solid var(--accent-primary);
  border-top: 1px solid var(--rule-subtle);
  border-right: 1px solid var(--rule-subtle);
  border-bottom: 1px solid var(--rule-subtle);
  border-radius: var(--radius-sm, 2px);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 180ms var(--ease-out-editorial),
              visibility 180ms;
  z-index: 80;
  white-space: normal;
  box-sizing: border-box;
  box-shadow: none !important;
}

.scripture-ref:hover::after,
.scripture-ref:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 640px) {
  .scripture-ref::after {
    left: 0;
    transform: none;
    max-width: calc(100vw - 32px);
  }
}

/* ------------------------------------------------------------------------------
   3. TYPESET BROADSHEET PRINT STYLESHEET (@media print)
   ------------------------------------------------------------------------------ */
@media print {
  /* Hide non-editorial chrome, interactive controls and ambient overlays */
  header,
  nav,
  .site-header,
  .site-nav,
  .mobile-nav-trigger,
  #mobile-nav,
  .skip-link,
  .sunday-letter,
  .newsletter-section,
  .newsletter-box,
  .newsletter-card,
  .continue-reading,
  .book-nav,
  .share-btn,
  #copy-link-btn,
  #back-to-top,
  #reading-progress,
  button,
  footer,
  .site-footer {
    display: none !important;
  }

  /* Purge SVG paper grain overlay */
  body::after {
    display: none !important;
  }

  /* Broadsheet typography & measure */
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    color: #000000 !important;
    font-family: "Newsreader", Georgia, Cambria, "Times New Roman", serif !important;
    font-size: 11pt !important;
    line-height: 1.6 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  main,
  article,
  .article-editorial-grid,
  .article-reading-column,
  .site-container {
    max-width: 65ch !important;
    margin: 0 auto !important;
    padding: 0 !important;
    display: block !important;
    width: 100% !important;
  }

  .article-meta-rail {
    display: none !important;
  }

  .article-headline {
    font-size: 24pt !important;
    line-height: 1.15 !important;
    color: #000000 !important;
    margin-bottom: 0.4cm !important;
  }

  /* Canonical citation attribution beneath article header */
  article header::after {
    content: "Published by George at jojjy.org";
    display: block;
    font-size: 8.5pt;
    margin-top: 0.5cm;
    color: #000000 !important;
    font-family: "JetBrains Mono", monospace !important;
  }

  .epigraph {
    border-left: 1.5pt solid #000000 !important;
    padding-left: 0.4cm !important;
    margin: 0.6cm 0 !important;
    color: #000000 !important;
  }

  .article-prose {
    font-size: 11pt !important;
    line-height: 1.6 !important;
    color: #000000 !important;
  }

  .article-prose p {
    margin-bottom: 0.4cm !important;
  }

  .author-note-box {
    border-top: 0.5pt solid #000000 !important;
    border-left: none !important;
    background: transparent !important;
    margin-top: 0.8cm !important;
    padding: 0.4cm 0 0 0 !important;
  }
}
"""
    css = css.rstrip() + phase7_css + "\n"

    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print("Updated styles.css with deduplicated tokens, purged dead selectors, book navigation, marginalia, and broadsheet print styles.")


# ------------------------------------------------------------------------------
# 3. Update main.js: Keyboard Navigation, Newsletter Resilience, Filter Deep Linking
# ------------------------------------------------------------------------------
def update_main_js():
    js_path = os.path.join(ROOT_DIR, 'main.js')
    with open(js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # A. Universal Newsletter Submission Handler
    old_news_sub = r'/\* ---- Universal Newsletter Form Submissions[\s\S]*?\}\);\s*\}\);'
    new_news_sub = """/* ---- Universal Newsletter Form Submissions (Phase 7 Resilient Handling) ---- */
  document.querySelectorAll('form[aria-label="Newsletter signup"], form[aria-label="Sunday letter signup"], form.newsletter-form, .sunday-letter form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const messageEl = form.querySelector('p[id^="form-msg"], p[id^="form-message"], .form-message');

      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        if (messageEl) {
          messageEl.textContent = "Thank you. Check your inbox on Sunday morning.";
          messageEl.style.fontFamily = "var(--font-serif)";
          messageEl.style.fontStyle = "italic";
          messageEl.style.color = "var(--accent-primary)";
          messageEl.style.fontWeight = "500";
        }
        emailInput.value = '';
      }
    });
  });"""
    if re.search(old_news_sub, js):
        js = re.sub(old_news_sub, new_news_sub, js, count=1)

    # B. Topic Filter deep-linking & popstate/hashchange listener
    old_filter_init = r'// Initialize topic filter from URL query parameter \(\?topic=work\) or hash \(#work\)[\s\S]*?// Initial filter pass\s*applyFilters\(\);'
    new_filter_init = """// Initialize topic filter from URL query parameter (?topic=work) or hash (#work)
    const setTopicFromURL = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTopic = (urlParams.get('topic') || window.location.hash.replace('#', '') || '').toLowerCase();
        if (urlTopic) {
          const matchingChip = Array.from(filterChips).find((c) => (c.dataset.filter || '').toLowerCase() === urlTopic);
          if (matchingChip) {
            filterChips.forEach((c) => {
              c.classList.remove('active');
              c.setAttribute('aria-selected', 'false');
            });
            matchingChip.classList.add('active');
            matchingChip.setAttribute('aria-selected', 'true');
            currentTopic = matchingChip.dataset.filter;
            applyFilters();
          }
        }
      } catch (_) {}
    };

    setTopicFromURL();
    window.addEventListener('hashchange', setTopicFromURL);
    window.addEventListener('popstate', setTopicFromURL);

    // Initial filter pass
    applyFilters();"""
    if re.search(old_filter_init, js):
        js = re.sub(old_filter_init, new_filter_init, js, count=1)

    # C. Quiet Desktop Keyboard Navigation (Book Page Turning)
    if '/* ---- Quiet Desktop Keyboard Navigation' not in js:
        keyboard_js = """
  /* ---- Quiet Desktop Keyboard Navigation (Phase 7 Book Page Turning) ---- */
  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    const prevLink = document.querySelector('link[rel="prev"]') || document.querySelector('a[rel="prev"]');
    const nextLink = document.querySelector('link[rel="next"]') || document.querySelector('a[rel="next"]');
    if (e.key === 'ArrowLeft' && prevLink) {
      const href = prevLink.getAttribute('href');
      if (href) window.location.href = href;
    } else if (e.key === 'ArrowRight' && nextLink) {
      const href = nextLink.getAttribute('href');
      if (href) window.location.href = href;
    } else if (e.key === 'Escape' && (prevLink || nextLink || document.querySelector('.book-nav'))) {
      window.location.href = '/articles/';
    }
  });

  /* ---- Scripture Marginalia Viewport Edge Safety ---- */
  document.querySelectorAll('.scripture-ref').forEach((el) => {
    const adjustPosition = () => {
      const rect = el.getBoundingClientRect();
      if (rect.left < 20) {
        el.style.setProperty('--popover-shift', `${20 - rect.left}px`);
      } else if (rect.right > window.innerWidth - 20) {
        el.style.setProperty('--popover-shift', `${(window.innerWidth - 20) - rect.right}px`);
      } else {
        el.style.removeProperty('--popover-shift');
      }
    };
    el.addEventListener('mouseenter', adjustPosition, { passive: true });
    el.addEventListener('focus', adjustPosition, { passive: true });
  });
"""
        js = js.rstrip()
        if js.endswith('});'):
            js = js[:-3] + keyboard_js + '\n});\n'
        else:
            js = js + keyboard_js

    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated main.js with keyboard navigation, resilient form confirmation, deep filtering, and marginalia popover safety.")


# ------------------------------------------------------------------------------
# 4. Standardize Fonts across all HTML files
# ------------------------------------------------------------------------------
def standardize_fonts_across_html(content):
    """
    Ensure every page loads Newsreader, Inter, and JetBrains Mono.
    """
    c = content
    font_pattern = r'<link\s+href=[\"\']https:\/\/fonts\.googleapis\.com\/css2\?[^\"\']+[\"\']\s+rel=[\"\']stylesheet[\"\'](?:\s*\/)?>'
    c = re.sub(font_pattern, UNIFIED_FONTS_LINK, c)
    return c


COMBINED_SCRIPTURE_PATTERN = re.compile(
    r'\b(' + '|'.join(re.escape(k) for k in SORTED_SCRIPTURE_KEYS) + r')\b'
)

# ------------------------------------------------------------------------------
# 5. Scripture Marginalia Helper for Article Content
# ------------------------------------------------------------------------------
def inject_scripture_marginalia(html_text):
    """
    Wrap citations in epigraph and prose with <cite class="scripture-ref" tabindex="0" data-verse="...">.
    Uses single-pass combined regex to avoid re-matching inside previously injected attributes.
    """
    c = html_text

    # 1. Epigraph Cite
    def repl_epigraph_cite(match):
        cite_text = match.group(1).strip()
        matched_verse = None
        # Exact match first
        for k in SCRIPTURE_VERSES:
            if cite_text == k:
                matched_verse = SCRIPTURE_VERSES[k]
                break
        # Prefix match
        if not matched_verse:
            for k in SORTED_SCRIPTURE_KEYS:
                if cite_text.startswith(k) or k.startswith(cite_text):
                    matched_verse = SCRIPTURE_VERSES[k]
                    break
        if not matched_verse:
            matched_verse = f"Scripture context — {cite_text}"
        attr_verse = matched_verse.replace('"', '&quot;')
        return f'<cite class="scripture-ref" tabindex="0" data-verse="{attr_verse}">{cite_text}</cite>'

    c = re.sub(r'<blockquote class=[\"\']epigraph[\"\']>([\s\S]*?)<cite>(?!<cite)([^<]+)<\/cite>([\s\S]*?)<\/blockquote>',
               lambda m: f'<blockquote class="epigraph">{m.group(1)}{repl_epigraph_cite(re.search(r"<cite>([^<]+)</cite>", m.group(0)))}{m.group(3)}</blockquote>', c)

    # 2. Prose Citations in a single pass
    def repl_prose(match):
        prose_content = match.group(1)
        tokens = re.split(r'(<[^>]+>)', prose_content)
        in_cite = False
        in_link = False
        output = []

        for token in tokens:
            if token.startswith('<'):
                t_lower = token.lower()
                if t_lower.startswith('<cite'):
                    in_cite = True
                elif t_lower.startswith('</cite>'):
                    in_cite = False
                elif t_lower.startswith('<a'):
                    in_link = True
                elif t_lower.startswith('</a>'):
                    in_link = False
                output.append(token)
            else:
                if in_cite or in_link or not token.strip():
                    output.append(token)
                else:
                    def repl_token(m):
                        ref = m.group(1)
                        verse = SCRIPTURE_VERSES.get(ref, ref)
                        attr_v = verse.replace('"', '&quot;')
                        return f'<cite class="scripture-ref" tabindex="0" data-verse="{attr_v}">{ref}</cite>'
                    curr = COMBINED_SCRIPTURE_PATTERN.sub(repl_token, token)
                    output.append(curr)

        return f'<div class="article-prose mt-6">{"".join(output)}</div>'

    c = re.sub(r'<div class=[\"\']article-prose\s+mt-6[\"\']>([\s\S]*?)<\/div>', repl_prose, c)
    return c


# ------------------------------------------------------------------------------
# 6. Update all 18 Article Pages (index.html & .html)
# ------------------------------------------------------------------------------
def update_all_article_pages():
    total_articles = len(CANONICAL_LEDGER)

    for i, a in enumerate(CANONICAL_LEDGER):
        slug = a['slug']
        prev_a = CANONICAL_LEDGER[(i - 1) % total_articles]
        next_a = CANONICAL_LEDGER[(i + 1) % total_articles]

        dir_path = os.path.join(ROOT_DIR, 'articles', slug, 'index.html')
        legacy_path = os.path.join(ROOT_DIR, 'articles', f"{slug}.html")

        with open(dir_path, 'r', encoding='utf-8') as f:
            content = f.read()

        c = content

        # A. Unified Fonts
        c = standardize_fonts_across_html(c)

        # B. Head Previous / Next Links (Absolute canonical URLs)
        c = re.sub(r'<link\s+rel=[\"\']prev[\"\'][^>]*>\s*', '', c)
        c = re.sub(r'<link\s+rel=[\"\']next[\"\'][^>]*>\s*', '', c)

        prev_next_links = f'    <link rel="prev" href="{DOMAIN}/articles/{prev_a["slug"]}/" />\n    <link rel="next" href="{DOMAIN}/articles/{next_a["slug"]}/" />'
        c = c.replace('<link rel="canonical"', f'{prev_next_links}\n    <link rel="canonical"')

        # C. Unique View Transition Name on Headline
        vt_style = f'style="view-transition-name: article-title-{slug};"'
        c = re.sub(r'(<h1\s+class=[\"\']article-headline[^>]*?)(?:\s+style=[\"\'][^\"\']*[\"\'])?(\s*>)',
                   rf'\1 {vt_style}\2', c)

        # D. Scripture Marginalia
        c = inject_scripture_marginalia(c)

        # E. Continuous Book Navigation Bar
        book_nav_html = f"""<!-- ============ CONTINUOUS BOOK NAVIGATION ============ -->
    <nav class="book-nav continue-reading" aria-label="Sequential Essay Navigation">
      <div class="site-container">
        <div class="book-nav-grid">
          <a href="/articles/{prev_a['slug']}/" class="book-nav-card book-nav-prev" rel="prev">
            <span class="book-nav-direction">← {prev_a['issue']}</span>
            <span class="book-nav-title">{prev_a['headline']}</span>
          </a>
          <a href="/articles/{next_a['slug']}/" class="book-nav-card book-nav-next" rel="next">
            <span class="book-nav-direction">{next_a['issue']} →</span>
            <span class="book-nav-title">{next_a['headline']}</span>
          </a>
        </div>
        <p class="book-nav-hint">Use ← and → keys to turn pages</p>
      </div>
    </nav>"""

        if '<!-- ============ RECOMMENDATIONS ============ -->' in c:
            c = re.sub(r'<!-- ============ RECOMMENDATIONS ============ -->[\s\S]*?(?=<!-- ============ FOOTER ============ -->|<footer)',
                       f'{book_nav_html}\n\n    ', c)
        elif '<!-- ============ CONTINUOUS BOOK NAVIGATION ============ -->' in c:
            c = re.sub(r'<!-- ============ CONTINUOUS BOOK NAVIGATION ============ -->[\s\S]*?(?=<!-- ============ FOOTER ============ -->|<footer)',
                       f'{book_nav_html}\n\n    ', c)

        # F. Ensure Sunday Letter form has class="newsletter-form" and proper message element
        c = re.sub(r'<form\s+class=[\"\']newsletter-form[\"\']\s+aria-label=[\"\']Newsletter signup[\"\']',
                   '<form class="newsletter-form" aria-label="Sunday letter signup"', c)
        c = re.sub(r'<form\s+aria-label=[\"\']Newsletter signup[\"\']',
                   '<form class="newsletter-form" aria-label="Sunday letter signup"', c)

        with open(dir_path, 'w', encoding='utf-8') as f:
            f.write(c)
        with open(legacy_path, 'w', encoding='utf-8') as f:
            f.write(c)

    print(f"Updated all {total_articles} article pages (clean dir + legacy) with book navigation, scripture marginalia, and view transitions.")


# ------------------------------------------------------------------------------
# 7. Update Archive (articles.html and articles/index.html)
# ------------------------------------------------------------------------------
def update_archive_pages():
    for path in [os.path.join(ROOT_DIR, 'articles.html'), os.path.join(ROOT_DIR, 'articles', 'index.html')]:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        c = content
        c = standardize_fonts_across_html(c)

        # Ensure unique view-transition-name on card titles matching article headline
        for a in CANONICAL_LEDGER:
            slug = a['slug']
            # Match card heading with link to this slug
            pat = re.compile(r'(<h2 class=[\"\']card-title[\"\'][^>]*>\s*<a href=[\"\']/articles/' + re.escape(slug) + r'/[\"\'][^>]*>)([\s\S]*?)(</a>\s*</h2>)')
            vt_attr = f'style="view-transition-name: article-title-{slug};"'
            if f'article-title-{slug}' not in c:
                c = pat.sub(rf'<h2 class="card-title" {vt_attr}><a href="/articles/{slug}/">\g<2></a></h2>', c)

        # Ensure newsletter form has class="newsletter-form"
        c = re.sub(r'<form\s+aria-label=[\"\']Newsletter signup[\"\']',
                   '<form class="newsletter-form" aria-label="Sunday letter signup"', c)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

    print("Updated articles.html and articles/index.html with unified fonts, view-transitions, and form resilience.")


# ------------------------------------------------------------------------------
# 8. Update Core Pages (index.html, about.html, collections.html, 404.html, article.html)
# ------------------------------------------------------------------------------
def update_core_pages():
    core_files = [
        os.path.join(ROOT_DIR, 'index.html'),
        os.path.join(ROOT_DIR, 'about.html'),
        os.path.join(ROOT_DIR, 'about', 'index.html'),
        os.path.join(ROOT_DIR, 'collections.html'),
        os.path.join(ROOT_DIR, 'collections', 'index.html'),
        os.path.join(ROOT_DIR, '404.html'),
        os.path.join(ROOT_DIR, 'article.html')
    ]

    for path in core_files:
        if not os.path.isfile(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        c = content
        c = standardize_fonts_across_html(c)

        # Ensure form class and message tag
        c = re.sub(r'<form\s+aria-label=[\"\']Newsletter signup[\"\'](?!\s+class=)',
                   '<form class="newsletter-form" aria-label="Sunday letter signup"', c)

        # In index.html, ensure p id="form-message" has class="form-message"
        c = re.sub(r'<p\s+id=[\"\']form-message[\"\']\s+style=[\"\']([^\"\']*)[\"\']',
                   r'<p id="form-message" class="form-message" style="\1"', c)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

    print("Updated core pages with unified fonts and resilient form attributes.")


# ------------------------------------------------------------------------------
# MAIN EXECUTION
# ------------------------------------------------------------------------------
def main():
    print("=" * 80)
    print("PHASE 7 AUTONOMOUS BUILD — JOJJY.ORG (GEORGE)")
    print("=" * 80)

    update_styles_css()
    update_main_js()
    update_all_article_pages()
    update_archive_pages()
    update_core_pages()

    print("\n✅ Phase 7 Build Complete!")

if __name__ == '__main__':
    main()
