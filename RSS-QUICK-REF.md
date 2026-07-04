# RSS Feed - Quick Reference

## What Was Implemented

✅ **RSS 2.0 Generator** - Converts articles to valid RSS XML feed
✅ **Two Scripts** - PowerShell (Windows) and Python (cross-platform)
✅ **Feed Discovery** - Automatic link tags in all HTML pages
✅ **Website Links** - Visible RSS link in footer "Subscribe" section
✅ **Full RSS 2.0 Compliance** - Proper XML, UTF-8, RFC 822 dates, GUIDs
✅ **Build Integration** - Scripts ready for deployment pipeline
✅ **Documentation** - Complete setup guide and examples

## Quick Start

### Generate RSS Feed (Windows)
```powershell
.\tools\generate-rss.ps1
```

### Generate RSS Feed (Any Platform w/ Python)
```bash
python3 tools/generate-rss.py
```

### One-Command Build & Deploy
```powershell
.\build.ps1 -SiteBaseUrl "https://jojjy.org"
```

## File Locations

| File | Purpose |
|------|---------|
| `tools/generate-rss.ps1` | PowerShell RSS generator |
| `tools/generate-rss.py` | Python RSS generator |
| `rss.xml` | Generated feed (site root) |
| `RSS-SETUP.md` | Full documentation |
| `build.ps1` | Complete build script |

## RSS Feed URL

**For Users**: `https://jojjy.org/rss.xml`

**Feed Links on Site**:
- Meta tag in all page `<head>` sections (autodiscovery)
- Footer "Subscribe" section links to `/rss.xml`

## Article Format

**With Metadata** (optional):
```
---
title: Article Title
description: Brief summary
date: 2026-07-04
slug: custom-url-slug
---

Article Title

Short excerpt goes here.

Full article content...
```

**Minimal** (auto-detected):
```
Article Title

Short excerpt goes here.

Full article content...
```

## Typical Workflow

1. **Write article** → Save to `_articles-src/Article-Name.txt`
2. **Generate articles** → `.\tools\sync-articles.ps1`
3. **Generate RSS** → `.\tools\generate-rss.ps1`
4. **Verify locally** → Open `rss.xml` and check format
5. **Upload to Hostinger** → FTP/SFTP upload all files
6. **Test online** → Visit `https://jojjy.org/rss.xml`

## Or Use the Build Script

```powershell
# Does everything in one command:
.\build.ps1 -SiteBaseUrl "https://jojjy.org"
```

## Verify Feed Works

1. **Online validator**: https://www.feedvalidator.org/
2. **Enter feed URL**: `https://jojjy.org/rss.xml`
3. **Subscribe test**: Add to your favorite RSS reader

## Key Features

- **XML Escaping** - Handles special characters correctly
- **UTF-8 Support** - Full Unicode support
- **Proper Dates** - RFC 822 format (e.g., "Thu, 02 Jul 2026 15:39:33 +0000")
- **Stable GUIDs** - Article URLs as permanent identifiers
- **No Database** - Pure static file generation
- **No Dependencies** - Run locally before deployment
- **Deterministic** - Identical output from identical input
- **Sorted Newest First** - Recent articles appear first in feed

## Deployment Checklist

- [ ] Articles added to `_articles-src/`
- [ ] `sync-articles.ps1` run to generate HTML
- [ ] `generate-rss.ps1` run to create RSS feed
- [ ] `rss.xml` validated (not corrupted)
- [ ] All files uploaded to Hostinger
- [ ] Feed URL accessible: `https://jojjy.org/rss.xml`
- [ ] RSS autodiscovery working (test in RSS reader)
- [ ] Footer link working: `https://jojjy.org/` → Subscribe → RSS Feed

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No articles found" | Check `_articles-src/` has `.txt` files |
| XML errors | Run Feed Validator to identify issues |
| Articles not showing | Regenerate RSS after adding new articles |
| Dates out of order | Add explicit `date:` to front-matter |
| Feed not updating in reader | Clear reader cache (wait 24h or force refresh) |

## Support

- **Full docs**: See `RSS-SETUP.md`
- **Script docs**: See comments in `.ps1` and `.py` files
- **RSS spec**: http://www.rssboard.org/rss-specification
- **Feed validator**: https://www.feedvalidator.org/

---

**System**: Static Blog RSS Feed Generator v1.0  
**Last Updated**: July 4, 2026
