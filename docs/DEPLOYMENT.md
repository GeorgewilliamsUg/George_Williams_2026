# Deployment Guide - Hostinger

## Pre-Deployment Checklist

- [ ] All files in `public/` folder are ready
- [ ] Tested locally - all links work
- [ ] Updated paths in PHP files if needed
- [ ] Credentials removed from `.env.example`
- [ ] `.gitignore` includes `private/.env`
- [ ] Newsletter feature tested locally
- [ ] RSS and sitemap generated
- [ ] .htaccess is in public/ folder

## Deployment Methods

### Method 1: Hostinger File Manager (Easiest)

1. **Log into Hostinger Control Panel**
   - Go to File Manager

2. **Upload Public Files**
   - Create structure if needed:
     - `public_html/` (your web root)
   - Upload everything from `public/` folder to `public_html/`

3. **Set Environment Variables**
   - Go to Hostinger Control Panel → Environment/Configuration
   - Set each variable:
     ```
     NEWSLETTER_ADMIN_EMAIL=your-email@example.com
     NEWSLETTER_SITE_NAME=George Williams
     NEWSLETTER_SITE_URL=https://jojjy.org
     NEWSLETTER_SMTP_HOST=smtp.hostinger.com
     NEWSLETTER_SMTP_PORT=465
     NEWSLETTER_SMTP_USERNAME=george@jojjy.org
     NEWSLETTER_SMTP_PASSWORD=your-app-password
     NEWSLETTER_SMTP_ENCRYPTION=ssl
     ```

4. **Verify Deployment**
   - Visit https://yourdomain.com
   - Check that all pages load
   - Test newsletter signup form
   - Check error logs if issues

### Method 2: FTP Client (FileZilla, WinSCP)

1. **Connect via FTP**
   - Host: ftp.jojjy.org (or your FTP host)
   - Username: your Hostinger email
   - Password: your FTP password
   - Port: 21

2. **Upload Files**
   - Navigate to `public_html/` directory
   - Drag and drop `public/` contents into it
   - Or use SFTP (port 22) for encrypted connection

3. **Directory Structure on Server**
   ```
   public_html/
   ├── index.html
   ├── pages/
   ├── css/
   ├── js/
   ├── assets/
   ├── articles/
   ├── subscribe.php
   ├── .htaccess
   ├── robots.txt
   ├── sitemap.xml
   ├── rss.xml
   └── [other files]
   ```

### Method 3: Git/SSH (If Available)

1. **Set Up Repository on Server** (if using Hostinger Git)
   - Push to Hostinger repository
   - Pull on server: `cd public_html && git pull origin main`

2. **SSH Deployment** (if SSH access)
   ```bash
   ssh user@jojjy.org
   cd ~/public_html
   # Copy files from development
   ```

## Post-Deployment Setup

### 1. Create .env File on Server

Via SSH or File Manager:

```bash
# Create .env in the web root parent directory
# Path: ~/private/config/.env (or wherever subscribe.php can access)

cat > .env << 'EOF'
NEWSLETTER_ADMIN_EMAIL=your-email@example.com
NEWSLETTER_SITE_NAME=George Williams
NEWSLETTER_SITE_URL=https://jojjy.org
NEWSLETTER_SMTP_HOST=smtp.hostinger.com
NEWSLETTER_SMTP_PORT=465
NEWSLETTER_SMTP_USERNAME=george@jojjy.org
NEWSLETTER_SMTP_PASSWORD=your-app-password
NEWSLETTER_SMTP_ENCRYPTION=ssl
EOF
```

Or via Hostinger environment variables (preferred).

### 2. Create Logs Directory

```bash
# Via SSH
mkdir -p ~/logs
mkdir -p ~/private/logs
chmod 700 ~/private/logs
touch ~/private/logs/php-errors.log
chmod 600 ~/private/logs/php-errors.log
```

Or via File Manager:
1. Create `logs/` directory in parent of public_html
2. Upload `.htaccess` to protect it

### 3. Verify .htaccess

Check that `.htaccess` is in:
- `public_html/` (main directory protection)
- `private/logs/.htaccess` (logs protection)

### 4. Set Correct Permissions

```bash
# Via SSH (if available)
chmod 755 public_html
chmod 755 public_html/articles/*
chmod 644 public_html/*.html
chmod 644 public_html/*.php
chmod 644 public_html/.htaccess
chmod 644 private/logs/.htaccess
chmod 600 private/logs/php-errors.log
chmod 600 private/logs/rate_limit.json
```

## Testing After Deployment

### 1. Verify Static Files
- [ ] Visit https://jojjy.org - homepage loads
- [ ] CSS styles applied correctly
- [ ] Images display
- [ ] JavaScript works (console clear)

### 2. Test Navigation
- [ ] Internal links work
- [ ] Page links (about, contact, etc.) load
- [ ] Article links work
- [ ] No 404 errors

### 3. Test SEO Files
- [ ] https://jojjy.org/robots.txt loads
- [ ] https://jojjy.org/sitemap.xml loads
- [ ] https://jojjy.org/rss.xml loads
- [ ] RSS feed valid (check with validator)

### 4. Test Newsletter Signup
- [ ] Form displays on homepage
- [ ] Submit valid email
- [ ] Check email inbox for welcome message
- [ ] Check admin email for notification
- [ ] Test rate limiting (4+ submissions)

### 5. Check Logs
```bash
# Via SSH
tail -f ~/private/logs/php-errors.log
# Should show clean execution, no errors
```

## Troubleshooting

### Issue: "subscribe.php not found"
- Ensure subscribe.php is in public_html/
- Check file was uploaded completely
- Verify permissions (644 or 755)

### Issue: Emails not sending
1. Check environment variables set
2. Verify SMTP credentials are correct
3. Check logs: `tail ~/private/logs/php-errors.log`
4. Try generating app-specific password on Hostinger
5. Test SMTP separately via Hostinger mail tester

### Issue: ".htaccess not working"
- Verify AllowOverride is enabled (usually default)
- Check .htaccess syntax (no PHP errors)
- Look for conflicting rules
- Test with: `https://jojjy.org/.htaccess` (should get 403)

### Issue: 500 Internal Server Error
1. Check error logs: `tail ~/public_html/error_log`
2. Enable debug mode temporarily to see errors
3. Check PHP version (should be 7.4+)
4. Verify file permissions
5. Check for MySQL/database errors if using any

### Issue: CSS/JS not loading
1. Verify files are in public_html/css/ and public_html/js/
2. Check file permissions (644)
3. Inspect network tab in browser DevTools
4. Clear browser cache (Ctrl+Shift+Del)

### Issue: Rate limiting not working
- Check that ~/private/logs/ directory exists and is writable
- Verify .htaccess protection is in place
- Check rate_limit.json is being created

## Ongoing Maintenance

### Weekly
- [ ] Check error logs for issues
- [ ] Monitor newsletter signups
- [ ] Verify all pages load correctly

### Monthly
- [ ] Regenerate sitemap
- [ ] Update RSS feed
- [ ] Check Google Search Console
- [ ] Review error logs
- [ ] Clean old log entries (or implement log rotation)

### When Updating Content
1. Make changes locally in `public/` folder
2. Test thoroughly
3. Upload updated files via FTP/File Manager
4. Clear browser cache
5. Verify on live site

## Rolling Back

If something breaks:

```bash
# Restore from previous commit (if using Git)
git revert HEAD

# Or manually restore from backup
# Via Hostinger File Manager, delete problematic files
# And re-upload previous version
```

## Security Reminders

✓ Never commit `.env` with real credentials  
✓ Use .env.example as a template  
✓ Keep `.htaccess` protecting private directories  
✓ Regularly check error logs for intrusion attempts  
✓ Keep environment variables secret  
✓ Never hardcode passwords in PHP files  
✓ Update PHP version if Hostinger offers newer version  

## Support Resources

- **Hostinger Docs**: https://support.hostinger.com
- **Apache .htaccess Guide**: https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html
- **PHP Documentation**: https://www.php.net/docs.php
- **Composer Guide**: https://getcomposer.org/doc
