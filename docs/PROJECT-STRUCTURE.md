# Project Structure Guide

## Directory Organization

```
project-root/
├── public/                    # Web-accessible files (deploy to Hostinger web root)
│   ├── index.html
│   ├── pages/                 # Additional HTML pages
│   │   ├── about.html
│   │   ├── contact.html
│   │   └── notes.html
│   ├── articles/              # Blog articles (one per folder)
│   │   ├── busy-isn-t-faithful/
│   │   ├── the-bible-was-never-about-you/
│   │   └── ...
│   ├── css/
│   │   ├── index.css
│   │   └── article.css
│   ├── js/
│   │   ├── index.js
│   │   └── article.js
│   ├── assets/                # Images, fonts, media
│   │   └── images/
│   ├── subscribe.php          # Newsletter signup endpoint
│   ├── newsletter-form.html   # Newsletter form component
│   ├── robots.txt             # Search engine directives
│   ├── sitemap.xml            # XML sitemap
│   ├── rss.xml                # RSS feed
│   ├── favicon.png
│   ├── favicon.svg
│   ├── google0b78908c0e155e33.html  # Google verification
│   └── .htaccess              # Apache configuration
│
├── src/                       # Source files
│   └── _articles-src/         # Article markdown/text source files
│
├── private/                   # Non-web-accessible files
│   ├── logs/                  # Error logs, rate limiting data
│   │   ├── php-errors.log
│   │   ├── rate_limit.json
│   │   └── .htaccess          # Directory protection
│   └── config/
│       └── .env.example       # Configuration template
│
├── tools/                     # Build and maintenance scripts
│   ├── build-sitemap.ps1
│   ├── generate-rss.ps1
│   ├── generate-rss.py
│   ├── refresh-seo.ps1
│   └── sync-articles.ps1
│
├── docs/                      # Documentation
│   ├── README.md
│   ├── NEWSLETTER-SETUP.md
│   ├── NEWSLETTER-TESTING.md
│   ├── RSS-SETUP.md
│   ├── RSS-QUICK-REF.md
│   ├── RSS-IMPLEMENTATION.md
│   └── security.md
│
├── .git/                      # Version control
├── .gitignore                 # Git ignore rules
├── .instructions.md           # Project instructions
├── build.ps1                  # Main build script
└── (root config files)
```

## File Organization Guide

### Public Folder (`public/`)
- **Purpose**: All files deployed to Hostinger web root
- **Access**: Web-accessible via domain
- **What goes here**:
  - All HTML files (index.html, pages/*)
  - All CSS/JS (css/, js/)
  - Images and assets (assets/)
  - Article content (articles/)
  - PHP endpoints (subscribe.php)
  - Server config (.htaccess)
  - SEO files (sitemap.xml, robots.txt, rss.xml)

### Src Folder (`src/`)
- **Purpose**: Source files for content
- **What goes here**:
  - `_articles-src/` - Article markdown or text files used to generate article pages
- **Note**: These files are not deployed to web

### Private Folder (`private/`)
- **Purpose**: Non-web-accessible files (protected from direct web access)
- **What goes here**:
  - `logs/` - Error logs and rate limiting data (protected by .htaccess)
  - `config/` - Configuration files
  - `.env` - Actual environment variables (never committed to git)
- **Security**: Directory is protected by .htaccess to prevent web access

### Tools Folder (`tools/`)
- **Purpose**: Development and build scripts
- **What goes here**:
  - PowerShell build scripts (build-sitemap.ps1, etc.)
  - Python utilities (generate-rss.py)
  - Automation scripts
- **Note**: Run locally, not deployed

### Docs Folder (`docs/`)
- **Purpose**: Documentation and guides
- **What goes here**:
  - Setup guides
  - Testing procedures
  - API documentation
  - Security guidelines
- **Note**: Can be deployed or kept private

## Path References

### In PHP Files
When in `public/subscribe.php`, use:
```php
// To access logs directory (one level up, then into private/logs)
dirname(__DIR__) . '/private/logs/php-errors.log'
```

### In HTML Files
Use relative paths from public/:
```html
<!-- Correct - works from public/ -->
<link rel="stylesheet" href="css/index.css">
<script src="js/index.js"></script>
<img src="assets/images/photo.jpg">

<!-- Links to pages -->
<a href="pages/about.html">About</a>
<a href="articles/article-name/index.html">Article</a>
```

### Root Level Scripts
When accessing resources from build.ps1 or tools/:
```powershell
# Access public folder
Get-ChildItem ".\public\"

# Access docs
Get-ChildItem ".\docs\"
```

## Deployment to Hostinger

### Step 1: Prepare Files
All files in `public/` are ready to deploy. Everything else stays local.

### Step 2: Upload to Hostinger
Using File Manager or FTP:
```
Upload public/* → public_html/
(Keep private/, src/, tools/, docs/ locally)
```

### Step 3: Environment Setup
1. Via Hostinger control panel, set environment variables:
   - NEWSLETTER_ADMIN_EMAIL
   - NEWSLETTER_SITE_NAME
   - NEWSLETTER_SITE_URL
   - NEWSLETTER_SMTP_HOST, etc.

2. Or create `.env` file in `private/config/` on server and load it.

## Development Workflow

### Adding New Content
1. Add article source to `src/_articles-src/`
2. Generate HTML to `public/articles/article-name/index.html`
3. Update RSS and sitemap via tools scripts

### Adding New Pages
1. Create HTML in `public/pages/`
2. Link from main pages
3. Update navigation if needed

### Configuration Changes
1. Update `.env` in `private/config/`
2. **Never commit actual `.env` file** - only `.env.example`
3. Sync to Hostinger when deploying

## Git Configuration (.gitignore)

Files that should NOT be committed:
- `private/.env` - actual credentials
- `private/logs/*` - generated log files
- `public/vendor/` - if using PHPMailer (use composer.json instead)
- OS files (.DS_Store, Thumbs.db)
- IDE files (.vscode/, .idea/)

## Access Control

### Web-Accessible (public/)
✓ All HTML, CSS, JS files
✓ Images and assets
✓ Article pages
✓ PHP endpoints like subscribe.php

### Protected (private/)
✗ .env configuration
✗ Error logs
✗ Rate limit data
✗ Protected by .htaccess (Deny from all)

### Local Only (src/, tools/, docs/)
✗ Article source files
✗ Build scripts
✗ Development documentation

## Best Practices

1. **Never commit credentials** - Use .env.example as template
2. **Keep logs local** - Don't commit generated log files
3. **Organize by type** - CSS in css/, JS in js/, etc.
4. **Use relative paths** - In web files, use relative paths where possible
5. **Document changes** - Update docs/ when structure changes
6. **Test after reorganizing** - Verify all links work after moving files
