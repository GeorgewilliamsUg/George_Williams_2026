# Newsletter Implementation - SMTP & Deployment Guide

## Quick Setup (5 minutes)

### 1. Create `.env` file

Copy `private/config/.env.example` to `private/config/.env` and fill in your values:

```bash
cp private/config/.env.example private/config/.env
```

Then edit `private/config/.env` with your SMTP credentials:

```
NEWSLETTER_ADMIN_EMAIL=your-admin@yoursite.com
NEWSLETTER_SITE_NAME=Your Site Name
NEWSLETTER_SITE_URL=https://yoursite.com
NEWSLETTER_SMTP_HOST=smtp.hostinger.com
NEWSLETTER_SMTP_PORT=587
NEWSLETTER_SMTP_USERNAME=your-email@yoursite.com
NEWSLETTER_SMTP_PASSWORD=your-app-specific-password
NEWSLETTER_SMTP_ENCRYPTION=tls
```

### 2. For Hostinger Users

1. **Generate App Password:**
   - Log into Hostinger control panel
   - Navigate to: Email → Your Email → App Passwords
   - Generate a new password for your application
   - Use this password in `.env` (not your main email password)

2. **SSH Access (Optional but Recommended):**
   If SSH is available, install PHPMailer once:
   ```bash
   cd /path/to/public_html/parent
   composer require phpmailer/phpmailer
   git add vendor/
   git commit -m "Add PHPMailer vendor"
   ```
   
   If no SSH access: The system will fall back to `mail()` function automatically.

### 3. Upload to Hostinger

Deploy these files:
- ✅ Everything in `public/` → upload to `public_html/`
- ✅ `config-loader.php` → upload to parent directory (same level as `public_html/`)
- ✅ `private/.env` → upload to `private/config/.env` (above `public_html/`, not deployed via Git)
- ❌ Do NOT upload `.env` files via Git

The `storage/` directory is created automatically on first subscription.

---

## Security Verification

### Test #1: Check .env Protection

```bash
# Should return 403 Forbidden
curl https://yoursite.com/.env

# Should return 403 Forbidden  
curl https://yoursite.com/private/.env
```

### Test #2: Check /storage Protection

```bash
# Should return 403 Forbidden
curl https://yoursite.com/storage/

# Should return 403 Forbidden
curl https://yoursite.com/storage/subscribers_log.json
```

### Test #3: Newsletter Form

1. Visit your site
2. Submit the newsletter form with a valid email
3. Check both your test email and admin email inbox
4. Verify you receive:
   - ✅ Welcome HTML email (with table layout, max 600px)
   - ✅ Admin plain text notification

### Test #4: Rate Limiting

1. Submit form 3 times from same browser/IP
2. 4th attempt should show: "Too many signup attempts. Please try again later."
3. Wait 1 hour (or manually delete `storage/subscribers_log.json` to reset)
4. Try again - should work

### Test #5: Duplicate Prevention

1. Submit email: test@example.com
2. Wait for welcome email
3. Try same email again within 24 hours
4. Should show: "This email is already subscribed..."
5. Should NOT send another welcome email
6. After 24 hours, same email can subscribe again (and will be logged as duplicate)

### Test #6: Invalid Inputs

Try these - all should be rejected with "Invalid email address":
- Empty field
- `not-an-email`
- `test@`
- 255+ character string
- `test<script>@example.com` (header injection attempt)

### Test #7: No Error Details Leaked

Try these - none should expose internal errors:
- Missing `.env` file (500 error, but no details)
- Invalid SMTP config (email fails silently)
- Bad email address (generic validation message)
- Check browser console - no internal error details

---

## File Structure After Setup

```
your-site/
├── public/                           ← Deploy to public_html/
│   ├── subscribe.php                 ← Newsletter endpoint
│   ├── newsletter-form.html          ← Form snippet
│   ├── index.html
│   ├── articles/
│   ├── css/
│   ├── js/
│   └── .htaccess                     ← Protects .env from web access
│
├── private/
│   ├── config/
│   │   ├── .env                      ← ⚠️ NEVER IN GIT (created locally)
│   │   ├── .env.example              ← Template (can be in Git)
│   │   └── .htaccess                 ← Protects directory
│   ├── logs/
│   │   ├── php-errors.log            ← Auto-created
│   │   └── .htaccess                 ← Protects from web
│   └── .htaccess                     ← Denies all web access
│
├── storage/                          ← ⚠️ NEVER IN GIT
│   ├── subscribers_log.json          ← Rate limit & duplicate data
│   ├── mail_log.txt                  ← Email delivery log
│   └── .htaccess                     ← Denies web access
│
├── config-loader.php                 ← Configuration validation
├── .gitignore                        ← Excludes .env and /storage
└── [other files]
```

---

## Troubleshooting

### Issue: "Service unavailable" error

**Cause:** Configuration loading failed (likely missing `.env` file)

**Solution:**
1. Verify `private/config/.env` exists (not `.env.example`)
2. Check all required keys are present and not empty
3. Check PHP error log: `tail private/logs/php-errors.log`

### Issue: Emails not sending

**Cause:** SMTP credentials wrong, or mail() function not available

**Solution:**
1. Verify `.env` has correct SMTP credentials
2. For Hostinger, use app-specific password (not main password)
3. Try different port: 587 (TLS) or 465 (SSL)
4. Check mail log: `cat storage/mail_log.txt`
5. Check PHP errors: `tail private/logs/php-errors.log`

### Issue: Rate limiting not working

**Cause:** File permissions or missing storage directory

**Solution:**
1. Verify `/storage/` directory exists and is writable
2. Check: `ls -la storage/`
3. Verify `subscribers_log.json` permissions are 0600
4. Clear log: `rm storage/subscribers_log.json` (resets rate limits)

### Issue: Can access `.env` or `/storage/` via URL

**Cause:** `.htaccess` not deployed or Apache `mod_rewrite` disabled

**Solution:**
1. Verify `.htaccess` files are uploaded
2. Check `.htaccess` in: `public/`, `private/`, and `storage/` root
3. Contact host if mod_rewrite is disabled - may need different protection method

### Issue: Header injection or "test" email domain errors

**Cause:** Invalid `NEWSLETTER_SITE_URL` in `.env`

**Solution:**
1. Ensure `NEWSLETTER_SITE_URL` is a full URL: `https://example.com`
2. Not just domain: must start with `https://` or `http://`
3. Reload page after changing `.env`

---

## Configuration Validation Rules

All of these are validated on startup:

| Key | Rule |
|-----|------|
| `NEWSLETTER_ADMIN_EMAIL` | Valid RFC 5322 email format |
| `NEWSLETTER_SITE_URL` | Valid HTTPS or HTTP URL |
| `NEWSLETTER_SMTP_HOST` | Non-empty hostname |
| `NEWSLETTER_SMTP_PORT` | Valid port 1-65535 |
| `NEWSLETTER_SMTP_USERNAME` | Non-empty username |
| `NEWSLETTER_SMTP_PASSWORD` | Non-empty password (fails if blank) |
| `NEWSLETTER_SMTP_ENCRYPTION` | tls or ssl |
| Email input | ≤254 characters, valid format |

---

## Production Safety Checklist

- [ ] `.env` file created with valid SMTP credentials
- [ ] `.env` NOT committed to Git (check `.gitignore`)
- [ ] `.env` NOT accessible via browser (test: curl yoursite.com/.env → 403)
- [ ] `/storage/` NOT accessible via browser (test: curl yoursite.com/storage/ → 403)
- [ ] `.htaccess` files deployed in `public/`, `private/`, and root
- [ ] Newsletter form HTML includes no hardcoded config/secrets
- [ ] Tested: 3 submissions allowed, 4th rejected (rate limit)
- [ ] Tested: Same email rejected within 24 hours (duplicates)
- [ ] Tested: Both welcome and admin emails arrive
- [ ] Tested: Invalid email inputs rejected
- [ ] Tested: No internal error details in browser responses
- [ ] Logs checked: `tail private/logs/php-errors.log`
- [ ] Email delivery log checked: `cat storage/mail_log.txt`
- [ ] File permissions correct: `storage/*` should be 0600

---

## Data Files

### `storage/subscribers_log.json`

Append-only line-based JSON log. One entry per line:

```
{"email":"user@example.com","ip":"192.168.1.1","timestamp":1688473200,"success":true}
{"email":"user2@example.com","ip":"192.168.1.1","timestamp":1688473215,"success":true}
{"email":"duplicate@example.com","ip":"192.168.1.2","timestamp":1688473220,"success":false}
```

- Never rewrites entire file (prevents corruption)
- Append-only for crash safety
- Pruning happens on read
- Protected: `chmod 600`, `.htaccess` denies web access

### `storage/mail_log.txt`

Plain text delivery log:

```
[2024-07-04 14:20:00 UTC] SUCCESS - WELCOME to user@example.com
[2024-07-04 14:20:05 UTC] SUCCESS - ADMIN_NOTIFICATION to admin@example.com
[2024-07-04 14:30:12 UTC] FAILED - WELCOME to badconfig@test.com | Error: SMTP connection timeout
```

Useful for debugging email issues without exposing details to users.

---

## Advanced: PHPMailer Installation (Optional)

If SSH access is available, install PHPMailer for better email reliability:

```bash
# SSH into your Hostinger account
ssh user@hostinger.com

# Navigate to site root
cd /home/user/public_html

# Install PHPMailer via Composer
composer require phpmailer/phpmailer

# Commit vendor directory
git add vendor/
git commit -m "Add PHPMailer for newsletter system"
```

If no SSH access: Don't worry! The system automatically falls back to PHP's `mail()` function.

---

## Support & Documentation

- Configuration validation: See `config-loader.php`
- Newsletter endpoint: See `public/subscribe.php` comments
- Frontend form: See `public/newsletter-form.html`
- All error handling logs to: `private/logs/php-errors.log`
