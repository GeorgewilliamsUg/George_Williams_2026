# Project Structure

## Overview
This is a self-hosted PHP website for "George & the Word" (jojjy.org) - a platform for biblical articles and reflections. The project follows a clean architecture separating public web files, development source, protected configuration, and build tools.

---

## Directory Tree

```
d:\Dev2026\George Williams 2026\
│
├── 📋 Configuration & Documentation (Root Level)
│   ├── .gitignore                    - Git exclusion rules (credentials, logs, dependencies)
│   ├── .htaccess                     - Apache config (protects .env files at root)
│   ├── config-loader.php             - Configuration validation system
│   ├── build.ps1                     - Build script (generates articles & RSS)
│   ├── server.js                     - Local development server (Node.js)
│   ├── .instructions.md              - Custom agent instructions (local dev only)
│   │
│   ├── 📋 START-HERE.md              - Quick start guide for developers
│   ├── 📋 REORGANIZATION-COMPLETE.md - Project reorganization completion notes
│   ├── 📋 NEWSLETTER-IMPLEMENTATION.md - Newsletter feature technical documentation
│   ├── 📋 QA-AUDIT-REPORT.md         - Quality assurance audit results
│   ├── 📋 QA-CHECKLIST.md            - QA testing checklist
│   ├── 📋 FINAL-QA-SUMMARY.md        - Final QA summary report
│   ├── 📋 TEST-RESULTS.md            - Test execution results
│   └── 📁 .git/                      - Git repository metadata
│
├── 📁 public/                        ⭐ **DEPLOY THIS FOLDER TO public_html/**
│   │                                  (Web-accessible directory)
│   │
│   ├── 📄 index.html                 - Homepage (main entry point)
│   ├── 📄 subscribe.php              - Newsletter subscription endpoint (POST handler)
│   ├── 📄 newsletter-form.html       - Newsletter signup form (embeddable)
│   ├── 📄 .htaccess                  - Public-level Apache config (rewrites, protections)
│   │
│   ├── 📁 pages/                     - Static pages
│   │   ├── 📄 about.html             - About page
│   │   ├── 📄 contact.html           - Contact page
│   │   └── 📄 notes.html             - Notes page
│   │
│   ├── 📁 articles/                  - Blog articles (20+ posts)
│   │   ├── 📁 busy-isn-t-faithful/
│   │   ├── 📁 churches-don-t-drift-toward-truth/
│   │   ├── 📁 faithfulness-can-feel-lonely/
│   │   ├── 📁 god-doesn-t-need-your-resume/
│   │   ├── 📁 nobody-is-self-made/
│   │   ├── 📁 terrified-of-silence/
│   │   ├── 📁 test-article-for-sync/
│   │   ├── 📁 the-bible-was-never-about-you/
│   │   ├── 📁 the-jesus-you-missed-in-the-old-testament/
│   │   ├── 📁 the-respectable-sin-nobody-talks-about/
│   │   ├── 📁 the-verse-that-is-slowly-killing-you/
│   │   ├── 📁 waiting-is-not-wasting/
│   │   ├── 📁 what-poverty-taught-me-about-riches/
│   │   ├── 📁 whatever-you-do-as-unto-the-lord/
│   │   ├── 📁 why-friendship-feels-so-rare/
│   │   ├── 📁 work-existed-before-sin/
│   │   ├── 📁 you-are-not-your-job-title/
│   │   ├── 📁 you-were-not-made-for-sadness/
│   │   ├── 📁 your-mind-is-under-attack-and-you-don-t-even-see-it/
│   │   └── [each article folder contains index.html]
│   │
│   ├── 📁 css/                       - Stylesheets
│   │   ├── 📄 index.css              - Homepage styling
│   │   └── 📄 article.css            - Article page styling
│   │
│   ├── 📁 js/                        - JavaScript files
│   │   ├── 📄 index.js               - Homepage scripts
│   │   └── 📄 article.js             - Article page scripts
│   │
│   ├── 📁 assets/                    - Media files
│   │   └── 📁 images/                - Image files and media
│   │
│   ├── 📄 robots.txt                 - Search engine crawling rules (SEO)
│   ├── 📄 rss.xml                    - RSS feed (auto-generated from articles)
│   ├── 📄 sitemap.xml                - XML sitemap (auto-generated for SEO)
│   ├── 🖼️ favicon.png                - Browser tab icon (PNG)
│   ├── 🖼️ favicon.svg                - Browser tab icon (SVG)
│   ├── 📄 google0b78908c0e155e33.html - Google site verification file
│   └── [other web-accessible files]
│
├── 📁 src/                           ❌ **LOCAL DEVELOPMENT ONLY** (not deployed)
│   └── 📁 _articles-src/             - Article source files (text format)
│       ├── 📄 Busy Isn't Faithful.txt
│       ├── 📄 Churches Don't Drift Toward Truth.txt
│       ├── 📄 Comfort Is a Terrible Savior.txt
│       ├── 📄 Faithfulness Can Feel Lonely.txt
│       ├── 📄 God Doesn't Need Your Resume.txt
│       ├── 📄 Nobody Killed Truth. We Just Stopped Defending It..txt
│       ├── 📄 Terrified of Silence.txt
│       ├── 📄 The Bible Was Never About You.txt
│       ├── 📄 The Jesus You Missed in the Old Testament.txt
│       ├── 📄 The Respectable Sin Nobody Talks About.txt
│       ├── 📄 The Verse That Is Slowly Killing You.txt
│       └── [more article sources...]
│
├── 📁 private/                       ❌ **LOCAL / SERVER ONLY** (not deployed via git)
│   │                                  (Contains sensitive configuration & logs)
│   │
│   ├── 📁 config/                    - Configuration directory
│   │   ├── 📄 .env.example           - Configuration template (for reference only)
│   │   └── 📄 .env                   - Actual .env file (NEVER in git)
│   │
│   ├── 📁 logs/                      - Application logs (created on server)
│   │   ├── 📄 php-errors.log         - PHP error log
│   │   ├── 📄 mail_log.txt           - Email delivery log
│   │   ├── 📄 rate_limit.json        - Rate limiting data
│   │   └── 📄 subscribers_log.json   - Newsletter subscriber log
│   │
│   └── 📄 .htaccess                  - Protection rules (denies all access to /private/)
│
├── 📁 tools/                         ❌ **LOCAL DEVELOPMENT ONLY** (not deployed)
│   │                                  (Build automation scripts)
│   │
│   ├── 📄 sync-articles.ps1          - Generates HTML articles from text sources
│   ├── 📄 generate-rss.ps1           - Generates RSS feed from articles (PowerShell)
│   ├── 📄 generate-rss.py            - Alternative RSS generator (Python)
│   ├── 📄 build-sitemap.ps1          - Generates XML sitemap
│   └── 📄 refresh-seo.ps1            - SEO metadata refresh script
│
├── 📁 docs/                          ⚠️ **OPTIONAL DEPLOYMENT** (documentation)
│   │                                  (Helpful reference guides, can be hosted for transparency)
│   │
│   ├── 📄 README.md                  - Main project documentation
│   ├── 📄 QUICK-START.md             - Quick reference guide for common tasks
│   ├── 📄 PROJECT-STRUCTURE.md       - This file (project architecture documentation)
│   │
│   ├── 📚 Deployment Guides
│   │   ├── 📄 DEPLOYMENT.md          - Step-by-step Hostinger deployment guide
│   │   ├── 📄 DEPLOYMENT-VISUAL.md   - Visual diagrams of deployment process
│   │
│   ├── 📚 Newsletter Feature Docs
│   │   ├── 📄 NEWSLETTER-SETUP.md    - Newsletter configuration guide
│   │   ├── 📄 NEWSLETTER-TESTING.md  - Newsletter testing procedures
│   │   ├── 📄 NEWSLETTER-SECURITY-TESTING.md - Security testing guide
│   │   ├── 📄 NEWSLETTER-PRODUCTION-READY.md - Production deployment checklist
│   │   └── 📄 NEWSLETTER-PRODUCTION-SETUP.md - Production environment setup
│   │
│   ├── 📚 RSS & SEO Docs
│   │   ├── 📄 RSS-SETUP.md           - RSS feed configuration
│   │   ├── 📄 RSS-QUICK-REF.md       - RSS quick reference
│   │   └── 📄 RSS-IMPLEMENTATION.md  - RSS technical implementation
│   │
│   └── 📄 security.md                - Security hardening documentation
│
└── 📁 storage/                       ❌ **SERVER ONLY** (auto-created, not in git)
    │                                  (Runtime data)
    └── [auto-generated at runtime]
        ├── 📄 subscribers_log.json   - Newsletter subscriber records
        └── 📄 mail_log.txt           - Email delivery log
```

---

## File Organization by Purpose

### 🌐 Web-Accessible (Deploy to public_html/)
| File/Folder | Purpose |
|-------------|---------|
| `public/index.html` | Homepage entry point |
| `public/pages/` | Static pages (about, contact, notes) |
| `public/articles/` | Blog articles (20+ posts) |
| `public/css/` | Stylesheets |
| `public/js/` | JavaScript files |
| `public/assets/` | Images and media |
| `public/subscribe.php` | Newsletter subscription handler |
| `public/rss.xml` | RSS feed |
| `public/sitemap.xml` | XML sitemap for SEO |
| `public/robots.txt` | Search engine crawling rules |
| `public/.htaccess` | Apache configuration & rewrites |

### 🔐 Protected Configuration (Server-side, NOT in git)
| File | Purpose | Location on Server |
|------|---------|-------------------|
| `.env` | SMTP credentials, admin email, site config | `~/private/config/.env` |
| `.env.example` | Config template (reference only) | Git repository |
| `config-loader.php` | Configuration validation | Parent of `public_html/` |

### 📝 Documentation (Reference only)
| File | Purpose |
|------|---------|
| `docs/README.md` | Main project documentation |
| `docs/DEPLOYMENT.md` | Hostinger deployment steps |
| `docs/NEWSLETTER-*.md` | Newsletter feature docs |
| `docs/RSS-*.md` | RSS feed documentation |
| `docs/security.md` | Security hardening details |

### 🛠️ Development Tools (Local only, NOT deployed)
| File | Purpose |
|------|---------|
| `build.ps1` | Main build script (generates articles & RSS) |
| `tools/sync-articles.ps1` | Converts article source files to HTML |
| `tools/generate-rss.ps1` | Generates RSS feed |
| `tools/build-sitemap.ps1` | Generates sitemap |
| `server.js` | Local development server |

### 📦 Source Files (Local development only)
| Folder | Purpose |
|--------|---------|
| `src/_articles-src/` | Article source files (.txt) before HTML generation |
| `.git/` | Git version control metadata |

### 📋 Logs & Runtime Data (Server only, NOT in git)
| Location | Purpose |
|----------|---------|
| `private/logs/php-errors.log` | PHP application errors |
| `private/logs/mail_log.txt` | Email delivery log |
| `private/logs/rate_limit.json` | Rate limiting data (file-based) |
| `storage/subscribers_log.json` | Newsletter subscriber records |

---

## Git Configuration (.gitignore)

### Excluded from Version Control
```
# Environment & Credentials
private/.env
private/config/.env
.env

# Logs & Generated Data
private/logs/*.log
private/logs/rate_limit.json
private/logs/mail_log.txt
private/logs/subscribers_log.json
/storage/
storage/

# Dependencies
vendor/
composer.lock
node_modules/
package-lock.json

# Development Files
.instructions.md
security.md
.DS_Store
.vscode/
.idea/
```

### Included in Version Control
```
✅ public/                  (entire web directory)
✅ src/                     (article sources for team collaboration)
✅ tools/                   (build scripts)
✅ docs/                    (documentation)
✅ .htaccess                (server configuration)
✅ config-loader.php        (must be deployed to server parent)
✅ private/config/.env.example  (template, no secrets)
```

---

## Deployment Architecture

### Local Development
```
Local Machine
├── Complete repository (includes all folders)
├── private/.env with real SMTP credentials
├── src/_articles-src/ (article sources)
└── tools/ (build scripts)
```

### Hostinger Production Server
```
/home/user/
├── config-loader.php ← Deployed from repo root
│
└── public_html/       ← Hostinger document root
    ├── index.html
    ├── pages/
    ├── articles/
    ├── css/
    ├── js/
    ├── assets/
    ├── subscribe.php
    ├── robots.txt
    ├── rss.xml
    ├── sitemap.xml
    ├── .htaccess
    └── [all public files]

    ⚠️ DO NOT deploy:
       ├── src/
       ├── private/ (except .env which is created manually)
       ├── tools/
       ├── docs/ (optional)
       ├── .gitignore
       ├── build.ps1
       └── .git/
```

### File Permissions on Server
```
chmod 755 public_html/              (directory readable & executable)
chmod 644 public_html/*.html        (files readable)
chmod 644 public_html/*.php         (PHP files readable)
chmod 644 public_html/.htaccess     (config readable)
chmod 600 private/logs/*.log        (logs readable by owner only)
chmod 700 private/logs/             (directory accessible by owner only)
```

---

## Key Features

### 🌟 Core Features
- ✅ **20+ Biblical Articles** - Faith, work, church life, Christian living
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Newsletter System** - Subscription with rate limiting
- ✅ **RSS Feed** - Auto-generated from articles
- ✅ **SEO Optimized** - Sitemaps, metadata, structured data

### 🔒 Security Hardening
- ✅ **File Protection** - `.htaccess` denies access to .env and /private/
- ✅ **Rate Limiting** - 3 newsletter signups per IP per hour
- ✅ **Duplicate Prevention** - 24-hour duplicate email window
- ✅ **Input Validation** - Email validation, 254-char limit
- ✅ **Header Injection Prevention** - Sanitized email headers
- ✅ **SMTP Support** - Secure email delivery with PHPMailer

### 📊 No External Dependencies
- ✅ No database required (file-based logs)
- ✅ No framework dependencies (vanilla PHP)
- ✅ No NPM packages for production (PowerShell for builds)
- ✅ Pure HTML/CSS/JS frontend

---

## Build & Development Workflow

### Article Publishing Workflow
```
1. Create new article in src/_articles-src/Article Title.txt
2. Run: .\build.ps1
   └─ Calls .\tools\sync-articles.ps1
      └─ Generates public/articles/article-slug/index.html
3. Run: .\tools\generate-rss.ps1
   └─ Updates public/rss.xml
4. Run: .\tools\build-sitemap.ps1
   └─ Updates public/sitemap.xml
5. git add public/ && git commit && git push
6. Deploy public/* to Hostinger
```

### Newsletter Testing Workflow
```
1. Create .env file locally with test SMTP credentials
2. Run: .\tools\generate-rss.ps1
3. Test subscribe.php locally or on staging server
4. Verify rate limiting, duplicate prevention, email delivery
5. Deploy to production with production .env on server
```

---

## Configuration (.env) Required on Server

### SMTP Email Configuration
```
NEWSLETTER_ADMIN_EMAIL=george@jojjy.org
NEWSLETTER_SITE_NAME=George Williams
NEWSLETTER_SITE_URL=https://jojjy.org
NEWSLETTER_SMTP_HOST=smtp.hostinger.com
NEWSLETTER_SMTP_PORT=587
NEWSLETTER_SMTP_USERNAME=george@jojjy.org
NEWSLETTER_SMTP_PASSWORD=[app-specific password]
NEWSLETTER_SMTP_ENCRYPTION=tls
```

**Note:** Create this file manually on the server (via SSH or Hostinger control panel) - never commit to git.

---

## Quick Reference

### For Content Updates
- Add article source to `src/_articles-src/`
- Run `build.ps1`
- Deploy `public/` to Hostinger

### For Security Updates
- Update `public/.htaccess` or `config-loader.php`
- Review `docs/security.md`
- Test locally before deploying

### For Newsletter Issues
- Check `/private/logs/php-errors.log`
- Review `/private/logs/mail_log.txt`
- Verify `.env` SMTP credentials
- Check rate limiting in `/private/logs/rate_limit.json`

### For SEO & Feeds
- RSS updates automatically during build
- Sitemap updates during build
- robots.txt manually edited
- Test with: https://www.feedvalidator.org/

---

## Contact & Support

**Website:** https://jojjy.org  
**Author:** George Williams Ssebyala  
**Location:** Kampala, Uganda

For technical questions, see documentation in `docs/` folder.
