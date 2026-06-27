$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$siteUrl = 'https://jojjy.org'

$pages = @(
  'html/index.html',
  'html/about.html',
  'html/article.html',
  'html/archive.html'
)

$articleFiles = Get-ChildItem -Path (Join-Path $root 'html/articles') -Filter '*.html' -File |
  Sort-Object Name |
  ForEach-Object { 'html/articles/' + $_.Name }

$allFiles = @($pages + $articleFiles)

$xml = New-Object System.Text.StringBuilder
[void]$xml.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$xml.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($rel in $allFiles) {
  $full = Join-Path $root $rel
  if (-not (Test-Path $full)) { continue }

  $lastmod = (Get-Item $full).LastWriteTimeUtc.ToString('yyyy-MM-dd')
  $loc = "$siteUrl/$($rel.Replace('\\', '/'))"

  $changefreq = 'monthly'
  $priority = '0.8'

  if ($rel -eq 'html/index.html') {
    $changefreq = 'weekly'
    $priority = '1.0'
  } elseif ($rel -eq 'html/article.html') {
    $changefreq = 'weekly'
    $priority = '0.9'
  } elseif ($rel -eq 'html/archive.html') {
    $changefreq = 'weekly'
    $priority = '0.8'
  } elseif ($rel -eq 'html/about.html') {
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

[void]$xml.AppendLine('</urlset>')
Set-Content -Path (Join-Path $root 'sitemap.xml') -Value $xml.ToString() -Encoding UTF8
Write-Output 'Sitemap rebuilt from file timestamps.'
