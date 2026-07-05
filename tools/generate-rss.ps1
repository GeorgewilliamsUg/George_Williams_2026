# RSS 2.0 Feed Generator for Static Blog
# Reads articles from src/_articles-src/, generates public/rss.xml

param([string]$SiteBaseUrl = 'https://jojjy.org')

$root = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'src\_articles-src'
$outFile = Join-Path $root 'public\rss.xml'

Write-Host "Generating RSS feed from $srcDir"

# Slugify function
function Slugify([string]$text) {
  $s = $text.ToLower()
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s -replace '^-+|-+$', ''
  if ($s) { return $s } else { return 'article' }
}

# Get articles
$articles = @()
$seen = @{}

Get-ChildItem $srcDir -Filter '*.txt' | ForEach-Object {
  $file = $_
  try {
    $lines = @([System.IO.File]::ReadAllLines($file.FullName, [System.Text.Encoding]::UTF8))
    $content = $lines
    
    # Parse basic title and description (first two non-empty lines after front-matter)
    $contentStart = 0
    if ($lines.Count -gt 0 -and $lines[0].Trim() -eq '---') {
      for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq '---') { $contentStart = $i + 1; break }
      }
    }
    
    $content = @($lines[$contentStart..($lines.Count - 1)] | % { $_.Trim() } | ? { $_ })
    if (!$content) { return }
    
    $title = $content[0]
    if ($content.Count -gt 1) {
      $desc = $content[1]
    }
    else {
      $desc = 'Read the full reflection.'
    }
    $slug = Slugify $title
    
    if ($seen[$slug]) { return }
    $seen[$slug] = $true
    
    # Get date from file modification time
    $date = $file.LastWriteTime
    $dateRfc822 = $date.ToUniversalTime().ToString('ddd, dd MMM yyyy HH:mm:ss +0000')
    
    $articles += @{
      Title   = $title
      Desc    = $desc
      Slug    = $slug
      Date    = $date
      DateRfc = $dateRfc822
      Url     = "$SiteBaseUrl/articles/$slug/"
    }
  }
  catch {
    Write-Warning "Error in $($file.Name): $_"
  }
}

if (!$articles) { Write-Error "No articles found"; exit 1 }

# Sort by date (newest first)
$articles = $articles | Sort-Object { $_.Date } -Descending

Write-Host "Found $($articles.Count) articles"

# Generate RSS
$now = [datetime]::Now.ToUniversalTime().ToString('ddd, dd MMM yyyy HH:mm:ss +0000')

$xml = '<?xml version="1.0" encoding="UTF-8"?>' + "`r`n"
$xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' + "`r`n"
$xml += '  <channel>' + "`r`n"
$xml += '    <title>George &amp; the Word</title>' + "`r`n"
$xml += "    <link>$SiteBaseUrl</link>`r`n"
$xml += '    <description>Weekly notes on faith, work, church, marriage, and life lived under His word.</description>' + "`r`n"
$xml += '    <language>en-us</language>' + "`r`n"
$xml += "    <lastBuildDate>$now</lastBuildDate>`r`n"
$xml += "    <atom:link href=`"$SiteBaseUrl/rss.xml`" rel=`"self`" type=`"application/rss+xml`" />`r`n"

foreach ($article in $articles) {
  # Simple XML entity escaping
  $titleEsc = $article.Title -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;' -replace "'", '&apos;'
  $descEsc = $article.Desc -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;' -replace "'", '&apos;'
  $xml += "`r`n    <item>`r`n"
  $xml += "      <title>$titleEsc</title>`r`n"
  $xml += "      <link>$($article.Url)</link>`r`n"
  $xml += "      <description>$descEsc</description>`r`n"
  $xml += "      <pubDate>$($article.DateRfc)</pubDate>`r`n"
  $xml += "      <guid isPermaLink=`"true`">$($article.Url)</guid>`r`n"
  $xml += '    </item>' + "`r`n"
}

$xml += "  </channel>`r`n"
$xml += '</rss>'

[System.IO.File]::WriteAllText($outFile, $xml, [System.Text.Encoding]::UTF8)

Write-Host "Generated: $outFile"
