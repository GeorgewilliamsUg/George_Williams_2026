# Quick Start Guide

## 📁 New Project Structure

```
project-root/
├── public/           ← Deploy entire folder contents to Hostinger
├── src/              ← Development source files (local only)
├── private/          ← Configuration, logs (local only, protected)
├── tools/            ← Build scripts (local only)
├── docs/             ← Documentation
└── build.ps1         ← Main build script
```

## 🚀 Quick Deployment

### Before You Push:

1. **Create actual `.env` in `private/config/.env`** (not committed to git)
   ```
   NEWSLETTER_ADMIN_EMAIL=your-email@example.com
   NEWSLETTER_SMTP_HOST=smtp.hostinger.com
   NEWSLETTER_SMTP_PORT=465
   NEWSLETTER_SMTP_USERNAME=your-email@jojjy.org
   NEWSLETTER_SMTP_PASSWORD=your-app-password
   NEWSLETTER_SMTP_ENCRYPTION=ssl
   ```

2. **Everything in `public/` is ready to deploy**
   - No additional changes needed
   - All paths are correctly configured
   - `.htaccess` is included

3. **Upload to Hostinger**
   - Upload everything from `public/` folder to `public_html/`
   - Set environment variables in Hostinger control panel
   - Create `private/logs/` directory on server
   - Apply `.htaccess` protection to private directories

## 📝 File Organization Reference

### What Goes Where

| Type | Location | Deployed? |
|------|----------|-----------|
| HTML Pages | `public/pages/` | ✅ Yes |
| CSS | `public/css/` | ✅ Yes |
| JavaScript | `public/js/` | ✅ Yes |
| Images | `public/assets/images/` | ✅ Yes |
| Articles | `public/articles/` | ✅ Yes |
| PHP Endpoints | `public/` | ✅ Yes |
| Article Sources | `src/_articles-src/` | ❌ No |
| Configuration | `private/config/` | ❌ No |
| Logs | `private/logs/` | ❌ No |
| Build Scripts | `tools/` | ❌ No |
| Documentation | `docs/` | ❌ No |

## 🔗 Important Paths

### In subscribe.php
```php
// Logs (correctly updated to use new path)
error_log() // goes to private/logs/php-errors.log
get_rate_limit_file() // accesses private/logs/rate_limit.json
```

### In HTML Files
```html
<!-- Relative paths work from public/ -->
<link href="css/index.css">
<script src="js/index.js"></script>
<img src="assets/images/photo.jpg">
<a href="pages/about.html">
<a href="articles/article-name/">
```

## 🔐 Security Checklist

- [ ] `.env` file with credentials is in `private/config/` (not public/)
- [ ] `.gitignore` includes `private/.env` and `private/logs/*`
- [ ] `.htaccess` protects `private/logs/` from web access
- [ ] Environment variables set on Hostinger (not in code)
- [ ] `.env.example` has placeholder values only (no real credentials)

## 📚 Documentation Files

All docs moved to `docs/` folder:

- **PROJECT-STRUCTURE.md** - Detailed structure guide
- **DEPLOYMENT.md** - Step-by-step Hostinger deployment
- **NEWSLETTER-SETUP.md** - Newsletter feature setup
- **NEWSLETTER-TESTING.md** - How to test locally and on production
- **README.md** - Original project readme
- **RSS-*.md** - RSS feed documentation
- **security.md** - Security guidelines

## 🔧 Git Configuration

**.gitignore now correctly protects:**
- ✓ `private/.env` (actual credentials)
- ✓ `private/logs/` (generated files)
- ✓ `vendor/` (composer packages)
- ✓ OS files (.DS_Store, Thumbs.db)
- ✓ IDE files (.vscode/, .idea/)

## 📋 Before Pushing to Production

```bash
# 1. Verify structure
ls -la public/           # All web files here
ls -la src/              # Source files
ls -la private/          # Config, logs

# 2. Check .gitignore
cat .gitignore           # Includes private/.env

# 3. Verify no credentials in git
git status               # Should show private/.env ignored
git log -p -- private/config/.env  # Should be empty

# 4. Test paths locally
# - All CSS/JS loads correctly
# - Newsletter form submits to public/subscribe.php
# - All links work
```

## 🚢 Deployment Steps (Simple Version)

1. **Create `private/config/.env` with your credentials**
2. **Upload `public/*` contents to Hostinger `public_html/`**
3. **Set environment variables in Hostinger control panel**
4. **Create `private/logs/` directory on server**
5. **Test website and newsletter form**
6. **Done!**

## ❌ Common Mistakes to Avoid

- ❌ Don't upload `private/`, `src/`, `tools/`, `docs/` to Hostinger
- ❌ Don't commit `.env` file with real credentials
- ❌ Don't move files around without updating relative paths
- ❌ Don't forget to set environment variables on Hostinger
- ❌ Don't use direct file paths in HTML (use relative paths)

## ✅ Files Ready to Deploy

Everything in the `public/` folder is production-ready:
- ✅ All HTML pages
- ✅ All CSS and JavaScript
- ✅ All images and assets
- ✅ Newsletter form and endpoint
- ✅ Server configuration (.htaccess)
- ✅ SEO files (robots.txt, sitemap.xml, rss.xml)

Just copy `public/*` to your Hostinger `public_html/` folder and you're done!

## 📞 Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
