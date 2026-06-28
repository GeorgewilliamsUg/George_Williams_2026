$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$siteUrl = 'https://jojjy.org'

$pages = @(
  'index.html',
  'about.html',
  'article.html',
  'archive.html'
)

$articleFiles = Get-ChildItem -Path (Join-Path $root 'articles') -Recurse -Filter 'index.html' -File |
  Sort-Object FullName |
  ForEach-Object {
    $slugDir = Split-Path -Leaf (Split-Path -Parent $_.FullName)
    [PSCustomObject]@{
      Rel = ('articles/' + $slugDir + '/')
      Full = $_.FullName
    }
  }

$xml = New-Object System.Text.StringBuilder
[void]$xml.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$xml.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($rel in $pages) {
  $full = Join-Path $root $rel
  if (-not (Test-Path $full)) { continue }

  $lastmod = (Get-Item $full).LastWriteTimeUtc.ToString('yyyy-MM-dd')
  $loc = "$siteUrl/$rel"

  $changefreq = 'monthly'
  $priority = '0.8'
  if ($rel -eq 'index.html') {
    $changefreq = 'weekly'
    $priority = '1.0'
  } elseif ($rel -eq 'article.html') {
    $changefreq = 'weekly'
    $priority = '0.9'
  } elseif ($rel -eq 'archive.html') {
    $changefreq = 'weekly'
    $priority = '0.8'
  } elseif ($rel -eq 'about.html') {
    $changefreq = 'monthly'
    $priority = '0.7'
  }

  [void]$xml.AppendLine('  <url>')
  [void]$xml.AppendLine("    <loc>$loc</loc>")
  [void]$xml.AppendLine("    <lastmod>$lastmod</lastmod>")
  [void]$xml.AppendLine("    <changefreq>$changefreq</changefreq>")
  [void]$xml.AppendLine("    <priority>$priority</priority>")
  [void]$xml.AppendLine('  </url>')
}

foreach ($a in $articleFiles) {
  $lastmod = (Get-Item $a.Full).LastWriteTimeUtc.ToString('yyyy-MM-dd')
  $loc = "$siteUrl/$($a.Rel)"

  [void]$xml.AppendLine('  <url>')
  [void]$xml.AppendLine("    <loc>$loc</loc>")
  [void]$xml.AppendLine("    <lastmod>$lastmod</lastmod>")
  [void]$xml.AppendLine('    <changefreq>monthly</changefreq>')
  [void]$xml.AppendLine('    <priority>0.8</priority>')
  [void]$xml.AppendLine('  </url>')
}

[void]$xml.AppendLine('</urlset>')
Set-Content -Path (Join-Path $root 'sitemap.xml') -Value $xml.ToString() -Encoding UTF8
Write-Output 'Sitemap rebuilt from file timestamps.'
