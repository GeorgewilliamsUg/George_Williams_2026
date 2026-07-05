# Build and Deploy Script for George & the Word
# This script regenerates pages, RSS, and sitemap into public/

param(
  [string]$SiteBaseUrl = 'https://jojjy.org'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicDir = Join-Path $repoRoot 'public'
$rssPath = Join-Path $publicDir 'rss.xml'
$articlesDir = Join-Path $publicDir 'articles'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "George & the Word - Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Generating article pages..." -ForegroundColor Yellow
& (Join-Path $repoRoot 'tools\sync-articles.ps1')
Write-Host "OK Article pages generated" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Generating RSS feed..." -ForegroundColor Yellow
& (Join-Path $repoRoot 'tools\generate-rss.ps1') -SiteBaseUrl $SiteBaseUrl
Write-Host "OK RSS feed generated" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Validating build output..." -ForegroundColor Yellow

$allChecksPassed = $true

if (Test-Path $rssPath) {
  Write-Host "  OK rss.xml exists" -ForegroundColor Green
}
else {
  Write-Host "  FAIL rss.xml exists" -ForegroundColor Red
  $allChecksPassed = $false
}

$rssValid = $false
if (Test-Path $rssPath) {
  try {
    [xml]$xml = Get-Content -LiteralPath $rssPath
    $rssValid = $null -ne $xml.rss.channel
  }
  catch {
    $rssValid = $false
  }
}
if ($rssValid) {
  Write-Host "  OK rss.xml is valid XML" -ForegroundColor Green
}
else {
  Write-Host "  FAIL rss.xml is valid XML" -ForegroundColor Red
  $allChecksPassed = $false
}

if (Test-Path $articlesDir) {
  Write-Host "  OK articles directory exists" -ForegroundColor Green
}
else {
  Write-Host "  FAIL articles directory exists" -ForegroundColor Red
  $allChecksPassed = $false
}

$articleCount = 0
if (Test-Path $articlesDir) {
  $articleCount = (Get-ChildItem -Path $articlesDir -Recurse -Filter 'index.html' -File).Count
}
if ($articleCount -gt 0) {
  Write-Host "  OK at least one article page generated" -ForegroundColor Green
}
else {
  Write-Host "  FAIL at least one article page generated" -ForegroundColor Red
  $allChecksPassed = $false
}

if (-not $allChecksPassed) {
  Write-Host ""
  Write-Host "FAIL Build validation failed" -ForegroundColor Red
  exit 1
}

$rssSize = (Get-Item -LiteralPath $rssPath).Length

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build Summary:" -ForegroundColor Cyan
Write-Host "  Articles Generated: $articleCount"
Write-Host ("  RSS Feed Size: {0:N2} KB" -f ($rssSize / 1KB))
Write-Host "  Site Base URL: $SiteBaseUrl"
Write-Host ""
