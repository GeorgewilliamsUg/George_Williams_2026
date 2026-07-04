# Build and Deploy Script for George & the Word
# This script regenerates articles and RSS feed, then prepares for deployment to Hostinger

param(
  [string]$SiteBaseUrl = 'https://jojjy.org',
  [switch]$SkipDeploy = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "George & the Word - Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Sync/Generate Article Pages
Write-Host "Step 1: Generating article pages..." -ForegroundColor Yellow
try {
  .\tools\sync-articles.ps1
  Write-Host "✓ Article pages generated successfully" -ForegroundColor Green
}
catch {
  Write-Host "✗ Failed to generate articles: $_" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 2: Generate RSS Feed
Write-Host "Step 2: Generating RSS feed..." -ForegroundColor Yellow
try {
  .\tools\generate-rss.ps1 -SiteBaseUrl $SiteBaseUrl
  Write-Host "✓ RSS feed generated successfully" -ForegroundColor Green
}
catch {
  Write-Host "✗ Failed to generate RSS feed: $_" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 3: Validate Build
Write-Host "Step 3: Validating build output..." -ForegroundColor Yellow

$checksToRun = @(
  @{ Name = "rss.xml exists"; Test = { Test-Path './rss.xml' } },
  @{ Name = "rss.xml is valid XML"; Test = { 
      try { 
        [xml]$xml = Get-Content './rss.xml'
        $null = $xml.rss.channel
        $true
      }
      catch { 
        $false 
      }
    }
  },
  @{ Name = "Articles directory exists"; Test = { Test-Path './articles' } },
  @{ Name = "At least one article page generated"; Test = { (Get-ChildItem './articles' -Recurse -Filter 'index.html').Count -gt 0 } }
)

$allChecksPassed = $true
foreach ($check in $checksToRun) {
  $passed = & $check.Test
  if ($passed) {
    Write-Host "  ✓ $($check.Name)" -ForegroundColor Green
  }
  else {
    Write-Host "  ✗ $($check.Name)" -ForegroundColor Red
    $allChecksPassed = $false
  }
}

if (-not $allChecksPassed) {
  Write-Host ""
  Write-Host "✗ Build validation failed" -ForegroundColor Red
  exit 1
}

Write-Host "✓ All validation checks passed" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Build Summary:" -ForegroundColor Cyan
$articleCount = (Get-ChildItem './articles' -Recurse -Filter 'index.html').Count
$rssSize = (Get-Item './rss.xml').Length
Write-Host "  Articles Generated: $articleCount"
Write-Host "  RSS Feed Size: $($rssSize / 1KB)KB"
Write-Host "  Site Base URL: $SiteBaseUrl"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git status"
Write-Host "  2. Commit changes: git add . && git commit -m 'Update articles and RSS feed'"
Write-Host "  3. Deploy to Hostinger (FTP, SFTP, or your CI/CD pipeline)"
Write-Host ""
Write-Host "To verify RSS feed: https://www.feedvalidator.org/"
Write-Host "Then paste URL: $SiteBaseUrl/rss.xml"
Write-Host ""
