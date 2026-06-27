$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

# Safe, non-destructive SEO refresh entrypoint.
# Metadata is maintained in source HTML files; this script rebuilds sitemap timestamps.
& (Join-Path $PSScriptRoot 'build-sitemap.ps1')

Write-Output 'SEO refresh complete (sitemap rebuilt).'
