# DEPLOYMENT VISUAL GUIDE

## What Gets Deployed vs. What Stays Local

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR LOCAL MACHINE                                  │
│                    (Development Environment)                                │
│                                                                             │
│  root/                                                                      │
│  ├── 📦 public/*              ← DEPLOY THIS ENTIRE FOLDER                  │
│  ├── 🚫 src/                  ← Keep local (source files)                  │
│  ├── 🚫 private/              ← Keep local (config, logs)                  │
│  ├── 🚫 tools/                ← Keep local (build scripts)                 │
│  ├── 📚 docs/                 ← Optional to deploy                         │
│  └── 🚫 .gitignore            ← Keep local                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓↓↓
                            Upload public/* to
                                    ↓↓↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HOSTINGER SERVER                                 │
│                      (Production Environment)                              │
│                                                                             │
│  public_html/          (Hostinger web root)                                │
│  ├── 📄 index.html                                                         │
│  ├── 📁 pages/                                                             │
│  │   ├── about.html                                                        │
│  │   ├── contact.html                                                      │
│  │   └── notes.html                                                        │
│  ├── 📁 articles/       (All 20+ blog articles)                           │
│  ├── 📁 css/                                                               │
│  ├── 📁 js/                                                                │
│  ├── 📁 assets/                                                            │
│  ├── 📄 subscribe.php                                                      │
│  ├── 📄 newsletter-form.html                                               │
│  ├── 📄 robots.txt                                                         │
│  ├── 📄 sitemap.xml                                                        │
│  ├── 📄 rss.xml                                                            │
│  ├── 📄 .htaccess                                                          │
│  ├── 🖼️ favicon.png, favicon.svg                                           │
│  └── 📄 google0b78908c0e155e33.html                                        │
│                                                                             │
│  (Other Hostinger directories)                                             │
│  ├── ⚙️ Create: ~/private/logs/    (for app errors & rate limits)         │
│  └── ⚙️ Update: Environment variables in Hostinger control panel          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### Step 1: Prepare Local Files
```
✓ Verify public/ folder contains everything needed
✓ Test all links work locally
✓ Verify CSS/JS loads
✓ Test newsletter form functionality
```

### Step 2: Upload to Hostinger
```
Via File Manager or FTP:
  1. Connect to your Hostinger account
  2. Navigate to public_html/ directory
  3. Upload everything from public/ folder
  
Result:
  public_html/
  ├── index.html
  ├── pages/
  ├── css/
  ├── js/
  ├── assets/
  ├── articles/
  ├── .htaccess
  └── [all other public files]
```

### Step 3: Configure on Hostinger
```
Via Hostinger Control Panel:
  1. Go to Environment/Configuration
  2. Set environment variables:
     - NEWSLETTER_ADMIN_EMAIL
     - NEWSLETTER_SITE_NAME
     - NEWSLETTER_SITE_URL
     - NEWSLETTER_SMTP_HOST
     - NEWSLETTER_SMTP_PORT
     - NEWSLETTER_SMTP_USERNAME
     - NEWSLETTER_SMTP_PASSWORD
     - NEWSLETTER_SMTP_ENCRYPTION
```

### Step 4: Create Protected Directories
```
Via SSH or File Manager:
  1. Create directory: ~/private/logs/
  2. Set permissions: chmod 700 ~/private/logs/
  3. Create/upload .htaccess to protect it
```

### Step 5: Test
```
✓ Visit https://yourdomain.com
✓ Check all pages load
✓ Test newsletter form
✓ Check for errors in logs
```

## File Checklist

### Must Deploy (Everything in public/)
- ✅ index.html
- ✅ pages/about.html
- ✅ pages/contact.html
- ✅ pages/notes.html
- ✅ articles/ (all subdirectories)
- ✅ css/index.css
- ✅ css/article.css
- ✅ js/index.js
- ✅ js/article.js
- ✅ assets/images/
- ✅ subscribe.php
- ✅ newsletter-form.html
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ rss.xml
- ✅ .htaccess
- ✅ favicon files
- ✅ google verification HTML

### Do NOT Deploy (Keep Local)
- ❌ src/ (source files)
- ❌ private/ (unless manually setting up logs)
- ❌ tools/ (build scripts)
- ❌ docs/ (documentation)
- ❌ .git/ (version control)
- ❌ .gitignore
- ❌ build.ps1

### Optional Deploy
- ⚠️ docs/ (documentation - optional for public)
- ⚠️ README.md (can put in docs)

## Quick Verification

After uploading, verify:

```
✓ https://yourdomain.com loads
✓ https://yourdomain.com/pages/about.html loads
✓ https://yourdomain.com/articles/article-name/ loads
✓ CSS styling appears correct
✓ JavaScript console is clear
✓ Newsletter form appears
✓ Form submission works
✓ Emails send correctly
✓ https://yourdomain.com/robots.txt loads
✓ https://yourdomain.com/rss.xml loads
```

## Troubleshooting Upload Issues

| Problem | Solution |
|---------|----------|
| Files not appearing | Verify path is public_html/, not a subfolder |
| 404 errors | Check file names match exactly (case-sensitive) |
| CSS not loading | Verify css/ folder is in public_html/ |
| JS not working | Check js/ folder and script paths |
| .htaccess ignored | Check Apache AllowOverride is enabled |
| Newsletter failing | Verify environment variables are set |

## Storage Used

```
public/                    ~5-10 MB (with images)
src/_articles-src/         ~50 KB
private/                   ~100 KB (grows with logs)
tools/                     ~50 KB
docs/                      ~100 KB
────────────────────────────────────
Total development:         ~6-12 MB
Total deployed:            ~5-10 MB (public only)
```

Most Hostinger plans include 100+ GB storage, so this is minimal.

## Git Workflow (After Reorganization)

```bash
# Push only deployment-ready code
git add public/ docs/ build.ps1 .gitignore
git commit -m "Website content and newsletter feature"
git push

# Keep local only
# (private/, src/, tools/ automatically ignored by .gitignore)
```

---

**Ready to push? See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.**
