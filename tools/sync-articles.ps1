$ErrorActionPreference = 'Stop'

$root        = (Get-Location).Path
$articlesDir = Join-Path $root '_articles-src'
$outDir      = Join-Path $root 'articles'
$siteUrl     = 'https://jojjy.org'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function Slug([string]$t) {
  $s = $t.ToLowerInvariant()
  $s = [regex]::Replace($s, '[^a-z0-9]+', '-')
  $s = $s.Trim('-')
  if ([string]::IsNullOrWhiteSpace($s)) { $s = 'article' }
  return $s
}

# Keep JS and PowerShell slug behavior aligned for predictable URLs.
function Slugify([string]$title) {
  return (Slug $title)
}

function Esc([string]$t) { return [System.Net.WebUtility]::HtmlEncode($t) }

function Topic([string]$t) {
  $x = $t.ToLowerInvariant()
  if ($x -match 'work|resume')                          { return 'Faith & Work' }
  if ($x -match 'friend')                               { return 'Life' }
  if ($x -match 'bible|jesus|verse|scripture|old test') { return 'Scripture' }
  if ($x -match 'sin|truth|mind|sadness')               { return 'Church Life' }
  return 'Christian Living'
}

# ── PASS 1: collect article metadata ──────────────────────────────────────────
$used  = @{}
$items = [System.Collections.Generic.List[PSCustomObject]]::new()

Get-ChildItem $articlesDir -File -Filter *.txt | Sort-Object Name | ForEach-Object {
  $raw   = Get-Content $_.FullName
  $clean = @($raw | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
  if ($clean.Count -eq 0) { return }

  $title    = $clean[0]
  $subtitle = if ($clean.Count -gt 1) { $clean[1] } else { 'Read the full reflection.' }
  $bodyLines = if ($clean.Count -gt 2) { $clean[2..($clean.Count - 1)] } else { @('Read the full reflection.') }

  $slugBase = Slugify $title
  if ($used.ContainsKey($slugBase)) {
    Write-Output ("Skipping duplicate: " + $title)
    return
  }
  $slug        = $slugBase
  $used[$slug] = $true

  $wordCount = (($raw -join ' ') -split '\s+' | Where-Object { $_ -ne '' }).Count
  $mins      = [Math]::Max(2, [Math]::Ceiling($wordCount / 220.0))
  $dateStr   = $_.LastWriteTime.ToString('MMM d, yyyy')
  $topic     = Topic $title

  # Strip trailing AI meta-notes
  $bodyLines = @($bodyLines | Where-Object {
    $_ -notmatch '(?i)^\s*(Sitting at|At roughly|This (comes to|sits at)|Want it as a docx|I can (tighten|expand|cut|shorten)|word count)'
  })

  $items.Add([PSCustomObject]@{
    Title     = $title
    Subtitle  = $subtitle
    BodyLines = $bodyLines
    Slug      = $slug
    Mins      = $mins
    Date      = $dateStr
    Topic     = $topic
    Href      = ('articles/' + $slug + '/')
  })
}

$items = @($items | Sort-Object Title)

# ── PASS 2: generate each detail page ─────────────────────────────────────────

$biblePattern = '^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Proverb|Ecclesiastes|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+'

foreach ($item in $items) {

  # ── Body HTML ──────────────────────────────────────────────────────────────
  $bodyHtml = ($item.BodyLines | ForEach-Object {
    if ($_ -match '^[-•]\s+') {
      '<p><strong>•</strong> ' + (Esc ($_ -replace '^[-•]\s+', '')) + '</p>'
    } elseif ($_ -match $biblePattern) {
      '<div class="verse"><p>' + (Esc $_) + '</p></div>'
    } elseif ($_ -match '^".*"$') {
      '<div class="pull-quote"><p>' + (Esc $_) + '</p></div>'
    } elseif ((($_ -split '\s+').Count -le 10) -and ($_ -notmatch '[\.!\?]$')) {
      '<h3>' + (Esc $_) + '</h3>'
    } elseif ((($_ -split '\s+').Count -le 15) -and ($_.Length -le 100) -and ($_ -match '\.$')) {
      '<p class="important">' + (Esc $_) + '</p>'
    } else {
      '<p>' + (Esc $_) + '</p>'
    }
  }) -join "`n    "

  # ── Pull quotes for sidebar rotator ───────────────────────────────────────
  $quoteCandidates = [System.Collections.Generic.List[string]]::new()
  $quoteCandidates.Add($item.Subtitle)

  foreach ($line in $item.BodyLines) {
    if ($quoteCandidates.Count -ge 3) { break }
    $words = ($line -split '\s+').Count
    if ($line -match '^".*"$') {
      $quoteCandidates.Add($line.Trim('"'))
    } elseif ($words -ge 8 -and $words -le 30 -and $line -match '[\.!\?]$') {
      $quoteCandidates.Add($line)
    }
  }
  while ($quoteCandidates.Count -lt 3) {
    $quoteCandidates.Add($item.Subtitle)
  }
  $q0 = Esc $quoteCandidates[0]
  $q1 = Esc $quoteCandidates[1]
  $q2 = Esc $quoteCandidates[2]

  # ── Related posts (2 articles with same topic, else first 2 others) ────────
  $others  = @($items | Where-Object { $_.Slug -ne $item.Slug })
  $related = @($others | Where-Object { $_.Topic -eq $item.Topic } | Select-Object -First 2)
  if ($related.Count -lt 2) {
    $related = @($others | Select-Object -First 2)
  }

  $relatedHtml = ($related | ForEach-Object {
    $rLabel = Esc $_.Topic
    $rTitle = Esc $_.Title
    $rHref  = '/' + $_.Href
    "          <a href=`"$rHref`" class=`"related-card`">
            <div class=`"related-card-thumb`"></div>
            <span class=`"related-card-label`">$rLabel</span>
            <span class=`"related-card-title`">$rTitle</span>
          </a>"
  }) -join "`n"

  # ── Recent posts for right sidebar (up to 4 other articles) ────────────────
  $recentItems = @($items | Where-Object { $_.Slug -ne $item.Slug } | Select-Object -Last 4)
  $recentHtml  = ($recentItems | ForEach-Object {
    $rCat   = Esc $_.Topic
    $rTitle = Esc $_.Title
    $rHref  = '/' + $_.Href
    "        <div class=`"recent-post`">
          <span class=`"recent-category`">$rCat</span>
          <a href=`"$rHref`" class=`"recent-title`">$rTitle</a>
        </div>"
  }) -join "`n"

  # ── Key verse: first Bible-pattern line, else default ─────────────────────
  $keyVerseLine = $item.BodyLines | Where-Object { $_ -match $biblePattern } | Select-Object -First 1
  if ($keyVerseLine) {
    $keyVerse = Esc $keyVerseLine
    $keyRef   = ''
    if ($keyVerseLine -match '([A-Za-z0-9 ]+\d+:\d+[\-\d]*)') { $keyRef = Esc $Matches[1] }
  } else {
    $keyVerse = '&#8220;Your word is a lamp to my feet and a light to my path.&#8221;'
    $keyRef   = 'Psalm 119:105 (ESV)'
  }

  # ── Archive counts ─────────────────────────────────────────────────────────
  $archiveCounts = @{}
  foreach ($a in $items) {
    try {
      $dt = [datetime]::ParseExact($a.Date, 'MMM d, yyyy', [System.Globalization.CultureInfo]::InvariantCulture)
      $key = $dt.ToString('MMMM yyyy')
    } catch {
      $key = 'Recent'
    }
    $archiveCounts[$key] = ($archiveCounts[$key] -as [int]) + 1
  }
  $archiveHtml = ($archiveCounts.GetEnumerator() | Sort-Object { [datetime]"01 $($_.Key)" } -Descending | Select-Object -First 6 | ForEach-Object {
    "<li><a href=`"/archive.html`">$($_.Key)</a><span class=`"archive-count`">($($_.Value))</span></li>"
  }) -join "`n          "

  $titleEsc    = Esc $item.Title
  $subtitleEsc = Esc $item.Subtitle
  $topicEsc    = Esc $item.Topic
  $articleUrl  = "$siteUrl/$($item.Href)"

  $detail = @"
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$titleEsc — George</title>
<meta name="description" content="$subtitleEsc">
<link rel="canonical" href="$articleUrl">
<meta property="og:type" content="article">
<meta property="og:title" content="$titleEsc — George">
<meta property="og:description" content="$subtitleEsc">
<meta property="og:url" content="$articleUrl">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="$titleEsc — George">
<meta name="twitter:description" content="$subtitleEsc">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/index.css">
<link rel="stylesheet" href="/css/article.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
</head>
<body>
<div id="progress-bar" aria-hidden="true"></div>

<header class="art-nav">
  <button class="art-nav-menu" aria-label="Menu">&#9776;</button>
  <a href="/index.html" class="art-nav-logo">george</a>
  <div class="art-nav-actions">
    <a href="/article.html" class="art-nav-link">Articles</a>
    <a href="/about.html" class="art-nav-link">About</a>
    <button class="art-theme-btn" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle light / dark" id="toggleThumb"><span id="toggleIcon">&#9728;</span></button>
  </div>
</header>

<!-- ARTICLE META -->
<div class="article-meta-bar">
  <a href="/article.html">$topicEsc</a>
  <span>&middot;</span>
  <span>$($item.Date)</span>
  <span>&middot;</span>
  <span>Posted by <a href="/about.html">George</a></span>
  <span>&middot;</span>
  <span>$($item.Mins) min read</span>
</div>

<!-- ARTICLE TITLE -->
<div class="article-title-block">
  <h1>$titleEsc</h1>
  <p class="subtitle">$subtitleEsc</p>
</div>

<!-- THREE-COLUMN LAYOUT -->
<div class="layout">

  <!-- LEFT SIDEBAR -->
  <aside class="sidebar-left">
    <div class="quote-widget">
      <span class="quote-label">From the Article</span>
      <div class="quote-rotator">
        <p class="quote-text active" data-index="0">&#8220;$q0&#8221;</p>
        <p class="quote-text" data-index="1">&#8220;$q1&#8221;</p>
        <p class="quote-text" data-index="2">&#8220;$q2&#8221;</p>
      </div>
      <div class="quote-dots">
        <div class="q-dot active" data-dot="0"></div>
        <div class="q-dot" data-dot="1"></div>
        <div class="q-dot" data-dot="2"></div>
      </div>
      <p class="quote-attribution">&mdash; George, Go&amp;Train Ministries</p>
    </div>

    <div class="george-stamp">
      <div class="name">George</div>
      <div class="role">Theologian &amp; Writer</div>
      <div class="ministry">Go&amp;Train Ministries &middot; Kampala, Uganda</div>
    </div>

    <nav class="sidebar-nav">
      <a href="/article.html">Scripture &amp; Theology</a>
      <a href="/article.html">Christian Life</a>
      <a href="/article.html">Expository Writing</a>
      <a href="/about.html">About George</a>
    </nav>
  </aside>

  <!-- MAIN ARTICLE -->
  <main class="article-main">
    <div class="hero-placeholder" role="img" aria-label="Article hero image">
      <div class="cross">&#10013;</div>
      <span>$titleEsc</span>
    </div>

    <div class="article-body">
      $bodyHtml
    </div>

    <!-- Share Bar -->
    <div class="share-bar">
      <span class="share-label">Share this:</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=" onclick="this.href+=encodeURIComponent(location.href);return true" class="share-btn" target="_blank" rel="noopener">Facebook</a>
      <a href="https://twitter.com/intent/tweet?url=" onclick="this.href+=encodeURIComponent(location.href)+'&text='+encodeURIComponent(document.title);return true" class="share-btn" target="_blank" rel="noopener">Twitter / X</a>
      <a href="https://wa.me/?text=" onclick="this.href+=encodeURIComponent(document.title+' '+location.href);return true" class="share-btn" target="_blank" rel="noopener">WhatsApp</a>
      <a href="#" class="share-btn" id="copy-btn">Copy Link</a>
    </div>

    <!-- Author Bio -->
    <div class="author-bio">
      <div class="author-avatar">G</div>
      <div class="author-bio-text">
        <div class="author-name">George</div>
        <p>A Reformed theologian and writer based in Kampala, Uganda. Serving with Go&amp;Train Ministries and HopeAbound, writing theology for everyday believers. Husband to Prossy.</p>
      </div>
    </div>

    <!-- Related Posts -->
    <div class="related-section">
      <h3>Related Posts</h3>
      <div class="related-grid">
$relatedHtml
      </div>
    </div>
  </main>

  <!-- RIGHT SIDEBAR -->
  <aside class="sidebar-right">
    <div class="sidebar-section">
      <div class="sidebar-heading">Recent Posts</div>
$recentHtml
    </div>

    <div class="sidebar-section">
      <div class="sidebar-heading">Archive</div>
      <ul class="archive-list">
          $archiveHtml
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-heading">Key Verse</div>
      <div class="scripture-widget">
        <p class="verse-text">$keyVerse</p>
        <span class="verse-ref">$keyRef</span>
      </div>
    </div>
  </aside>

</div>

<!-- FOOTER -->
<footer class="site-footer">
  <p>&copy; 2026 George &middot; <a href="#">Go&amp;Train Ministries</a> &middot; <a href="#">HopeAbound</a> &middot; Kampala, Uganda</p>
</footer>

<script src="/js/index.js" defer></script>
<script src="/js/article.js" defer></script>
</body>
</html>
"@

  $articleFolder = Join-Path $outDir $item.Slug
  New-Item -ItemType Directory -Path $articleFolder -Force | Out-Null
  Set-Content -Path (Join-Path $articleFolder 'index.html') -Value $detail -Encoding UTF8
}

# Remove legacy flat article pages if present.
Get-ChildItem -Path $outDir -File -Filter '*.html' -ErrorAction SilentlyContinue | Remove-Item -Force

# ── PASS 3: rebuild article/archive listing pages (index.css + index.js) ─────

$cards = ($items | ForEach-Object {
@"
        <a class="a-card reveal" href="$($_.Href)">
          <p class="a-tag">$([System.Net.WebUtility]::HtmlEncode($_.Topic))</p>
          <h3 class="a-title">$([System.Net.WebUtility]::HtmlEncode($_.Title))</h3>
          <p class="a-excerpt">$([System.Net.WebUtility]::HtmlEncode($_.Subtitle))</p>
          <div class="a-foot"><span class="a-time">$($_.Mins) min &middot; $($_.Date)</span><div class="a-arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div></div>
        </a>
"@
}) -join "`n"

$uniqueTopics = @($items | Select-Object -ExpandProperty Topic | Where-Object { $_ -ne 'Scripture' } | Sort-Object -Unique)
$filterChips  = '<button class="filter-chip active" data-filter="all">All</button>' + "`n      " + (($uniqueTopics | ForEach-Object {
  $te = [System.Net.WebUtility]::HtmlEncode($_)
  "<button class=`"filter-chip`" data-filter=`"$te`">$te</button>"
}) -join "`n      ")

function BuildPage([string]$title, [string]$pill, [string]$heading, [string]$sub, [string]$label, [string]$canonicalPath) {
@"
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https://jojjy.org data:; frame-ancestors 'none'; base-uri 'self';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$title</title>
<link rel="canonical" href="$siteUrl/$canonicalPath">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/article.css">
<link rel="stylesheet" href="css/index.css">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
</head>
<body>
<nav id="nav"><a href="index.html" class="nav-logo">George <span>&amp; the Word</span></a><div class="nav-right"><ul class="nav-links"><li><a href="index.html">Home</a></li><li><a href="article.html">Articles</a></li><li><a href="about.html">About</a></li><li><a href="archive.html">Archive</a></li></ul><button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle light / dark"><div class="toggle-thumb" id="toggleThumb"><span id="toggleIcon">&#9728;</span></div></button></div><div class="mobile-nav-row"><a href="index.html">Home</a><a href="article.html">Articles</a><a href="about.html">About</a><a href="archive.html">Archive</a></div></nav>
<section class="art-hero archive-hero"><span class="art-tag-pill">$pill</span><h1 class="art-h1">$heading</h1><p class="art-byline">$sub</p></section>
<div class="layout archive-layout"><main><div class="grid-section"><p class="sec-label reveal">$label</p>
<div class="topic-filter-bar">
      $filterChips
    </div>
    <div class="article-grid archive-grid">
$cards
      </div>
      <p class="no-filter-results" id="no-results">No articles in this topic yet &mdash; check back soon.</p>
</div></main><aside class="sidebar"><div class="widget w-newsletter reveal"><div class="w-title">One Email. Every Week.</div><p>Read the newest article every Monday morning.</p><a href="index.html" class="btn-back" style="display:inline-block;">Back Home</a></div><div class="widget w-topics reveal"><div class="w-title">Topics</div><ul class="topics-list"><li><button class="topic-btn active" data-filter="all">All Articles <span class="t-count">&mdash;</span></button></li>$(($uniqueTopics | ForEach-Object { $te = [System.Net.WebUtility]::HtmlEncode($_); "<li><button class=`"topic-btn`" data-filter=`"$te`">$te <span class=`"t-count`">&mdash;</span></button></li>" }) -join '')</ul></div></aside></div>
<footer><div class="footer-grid"><div><div class="f-brand">George <span>&amp; the Word</span></div><p class="f-desc">Weekly articles on the things God has His mind on — faith, work, church, marriage, and the whole of life lived under His word. From Kampala, Uganda.</p></div><div class="f-col"><h5>Topics</h5><ul>$(($uniqueTopics | ForEach-Object { $te = [System.Net.WebUtility]::HtmlEncode($_); "<li><a href=`"article.html`">$te</a></li>" }) -join '')</ul></div><div class="f-col"><h5>More</h5><ul><li><a href="about.html">About George</a></li><li><a href="archive.html">Archive</a></li><li><a href="#">HopeAbound</a></li><li><a href="#">Go&amp;Train</a></li></ul></div><div class="f-col"><h5>Subscribe</h5><ul><li><a href="#">Weekly Email</a></li><li><a href="#">RSS Feed</a></li><li><a href="#">WhatsApp</a></li></ul></div></div><div class="footer-bottom"><p class="f-copy">&copy; 2026 George. All rights reserved.</p><p class="f-verse">"In the beginning was the Word&hellip;" &mdash; John 1:1</p></div></footer>
<script src="js/index.js" defer></script>
</body>
</html>
"@
}

Set-Content -Path (Join-Path $root 'article.html') -Value (BuildPage 'Articles — Every Word Has Weight' 'Articles' 'Latest writings and reflections.' 'All published articles from the Articles folder are listed here.' 'All Articles' 'article.html') -Encoding UTF8
Set-Content -Path (Join-Path $root 'archive.html') -Value (BuildPage 'Archive — Every Word Has Weight' 'Archive' 'Every article, in one place.' 'Browse the full collection published from the Articles folder.' 'Archive Collection' 'archive.html') -Encoding UTF8

& (Join-Path $root 'tools/refresh-seo.ps1')

Write-Output ("Generated " + $items.Count + " article pages, rebuilt article/archive lists, and refreshed SEO files.")
