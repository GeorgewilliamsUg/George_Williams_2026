# RSS 2.0 Feed Setup for George & the Word

This document describes the RSS feed system for your static blog.

## Overview

The RSS system consists of:
- **Article source files** in `_articles-src/` containing metadata and content
- **RSS generation scripts** that parse articles and generate `rss.xml`
- **HTML page links** pointing users to the RSS feed
- **Automatic feed discovery** via `<link>` tags in page headers

## How It Works

### 1. Article Source Format

Articles are stored in `_articles-src/` as plain text files (`.txt`). Each article can start with optional YAML front-matter:

```
---
title: Your Article Title
description: Optional custom description
date: 2026-07-04
slug: optional-custom-slug
---

Your Article Title

Short excerpt or description goes here.

Rest of the article content...
```

**Note**: If no front-matter is provided, the script uses:
- First line = Title
- Second line = Description/Summary
- File modification time = Publication date
- Title (slugified) = Article slug

### 2. RSS Generation

Two generation scripts are provided (choose one based on your environment):

#### PowerShell Version (Recommended for Windows)
```powershell
.\tools\generate-rss.ps1 -SiteBaseUrl "https://jojjy.org"
```

**Advantages:**
- Works on Windows without additional dependencies
- Integrated with existing PowerShell build pipeline
- Can be run before/after article generation

**Parameters:**
- `-SiteBaseUrl`: Base URL for the site (default: `https://jojjy.org`)

#### Python Version
```bash
python3 tools/generate-rss.py
```

**Advantages:**
- Cross-platform compatibility (Windows, macOS, Linux)
- Compatible with CI/CD pipelines (GitHub Actions, etc.)
- No external dependencies (uses only Python stdlib)

**Environment Variables:**
- `SITE_BASE_URL`: Base URL for the site (default: `https://jojjy.org`)

### 3. Build Integration

The RSS feed should be generated **after** article HTML pages are created. A typical build pipeline:

1. **Generate articles** - Run `sync-articles.ps1` to create HTML files
2. **Generate RSS** - Run `generate-rss.ps1` to create `rss.xml`
3. **Deploy** - Upload all files to Hostinger

Example batch/PowerShell script:
```powershell
# Generate articles first
.\tools\sync-articles.ps1

# Then generate RSS
.\tools\generate-rss.ps1 -SiteBaseUrl "https://jojjy.org"

# Deploy to Hostinger
# (Your deployment commands here)
```

### 4. RSS Feed Features

The generated `rss.xml` includes:

- **RSS 2.0 Standard** - Valid RSS 2.0 format with proper XML escaping
- **UTF-8 Encoding** - Complete Unicode support
- **RFC 822 Dates** - Proper date formatting (e.g., "Thu, 02 Jul 2026 15:39:33 +0000")
- **Stable GUIDs** - Article URLs used as permanent identifiers
- **Article Metadata** - Title, link, description, publication date
- **Channel Info** - Feed title, description, language, last build date
- **Feed Autodiscovery** - Atom link for RSS reader auto-discovery
- **Atom Namespace** - Support for Atom protocol discovery

### 5. Website Integration

All main pages include RSS feed discovery:

**In HTML `<head>` sections:**
```html
<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml">
```

**In footer "Subscribe" section:**
```html
<li><a href="/rss.xml">RSS Feed</a></li>
```

Pages updated:
- `index.html`
- `about.html`
- `notes.html`
- `contact.html`
- Article detail pages (automatically via `sync-articles.ps1`)

### 6. RSS Feed Location

- **File path**: `rss.xml` (site root)
- **Web URL**: `https://jojjy.org/rss.xml`
- **Headlines**: Users can subscribe at this URL in any RSS reader

## Testing the RSS Feed

### Local Testing

1. **Generate the feed:**
   ```powershell
   .\tools\generate-rss.ps1
   ```

2. **Verify the file:**
   ```powershell
   Get-Content .\rss.xml | head -20
   ```

3. **Validate the XML:**
   - Online: https://www.feedvalidator.org/
   - Use your text editor's XML validator
   - Copy content and paste into Feed Validator

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No articles found" | Empty `_articles-src/` directory | Ensure article files exist with `.txt` extension |
| XML parsing errors | Special characters not escaped | Script automatically escapes `&`, `<`, `>`, quotes |
| Wrong dates | File modification times | Add `date: YYYY-MM-DD` to front-matter for specific dates |
| Wrong article order | Dates not sorted correctly | Verify RFC 822 date format in generated XML |

## Customization

### Changing Site URL

**PowerShell:**
```powershell
.\tools\generate-rss.ps1 -SiteBaseUrl "https://yoursite.com"
```

**Python:**
```bash
export SITE_BASE_URL="https://yoursite.com"
python3 tools/generate-rss.py
```

### Changing Channel Metadata

Edit the script files to modify:
- `channelTitle` - Feed name
- `channelDescription` - Feed description
- `channelLanguage` - Language code

Both scripts have these as configurable constants near the top.

### Article Count

The RSS feed includes **all articles** from `_articles-src/`. If you want to limit to recent articles only, edit:

PowerShell: Add `| Select-Object -First 20` after the sort operation
Python: Modify the `articles = articles[:20]` line

## Deployment to Hostinger

1. **Generate RSS locally:**
   ```powershell
   .\tools\generate-rss.ps1 -SiteBaseUrl "https://jojjy.org"
   ```

2. **Upload to Hostinger:**
   - FTP/SFTP: Upload `rss.xml` to site root
   - File Manager: Upload `rss.xml` to public_html root
   - CLI: `scp rss.xml user@hostinger.com:/public_html/`

3. **Verify online:**
   - Visit `https://jojjy.org/rss.xml`
   - Should see XML content (not an error page)

## Deterministic Output

Both scripts ensure:
- **Consistent output** - Same input always produces identical output
- **Sorted articles** - Articles sorted by date (newest first)
- **Stable GUIDs** - URLs remain constant
- **Encoding** - Always UTF-8

This means you can run the generator multiple times without changing the feed unexpectedly.

## Troubleshooting

### Feed isn't updating
1. Check that new articles are in `_articles-src/`
2. Regenerate RSS: `.\tools\generate-rss.ps1`
3. Upload new `rss.xml` to Hostinger
4. Clear RSS reader cache (some readers cache for 24 hours)

### Feed isn't discoverable
1. Verify `<link rel="alternate" type="application/rss+xml">` exists in HTML `<head>`
2. Ensure `.htaccess` or server config allows access to `rss.xml`
3. Test with: https://www.feedvalidator.org/

### Articles missing from feed
1. Check article file names end in `.txt`
2. Verify articles are in `_articles-src/` directory
3. Regenerate RSS and check output count
4. Look for error messages in script output

### Strange characters in feed
1. Ensure source files are encoded as UTF-8
2. Verify no special characters are breaking XML parsing
3. Check that descriptions don't contain raw HTML tags

## Script Details

### PowerShell Script (`tools/generate-rss.ps1`)
- **Size**: ~3.7 KB
- **Dependencies**: None (Windows PowerShell 5+)
- **Features**: Fast, integrates with existing build scripts
- **Runtime**: <1 second for typical site

### Python Script (`tools/generate-rss.py`)
- **Size**: ~8.8 KB
- **Dependencies**: None (Python 3.6+ standard library only)
- **Features**: Cross-platform, CI/CD friendly
- **Runtime**: <1 second for typical site

## Best Practices

1. **Regenerate before deployments** - Always run RSS generator before uploading to production
2. **Use front-matter for control** - Add explicit `date` and `description` to articles for consistent ordering
3. **Monitor feed updates** - Set test subscriptions to verify feeds are working
4. **Keep URLs stable** - Use `slug` in front-matter if you need permanent article URLs
5. **Test locally first** - Validate RSS feed before deploying to Hostinger

## Resources

- [RSS 2.0 Specification](http://www.rssboard.org/rss-specification)
- [Feed Validator](https://www.feedvalidator.org/)
- [RFC 822 Date Format](https://tools.ietf.org/html/rfc822)
- [Atom Feed Namespace](https://tools.ietf.org/html/rfc4287)

---

**Last Updated**: July 4, 2026  
**System**: Static Blog RSS Feed Generator v1.0
